"""
Seller AI Advisor Router
========================
File:  server_py/app/api/v1/routes/seller_ai_advisor_router.py

Two endpoints:
  GET  /api/seller/ai-advisor/context   — loads the seller's store context
  POST /api/seller/ai-advisor/chat      — SSE streaming chat with Ollama

The AI has access to:
  - All tracked products (prices, ratings, reviews, sales volume)
  - Rank snapshots (keyword positions from rank tracker)
  - Price comparison signals (position vs market)

Register in api.py:
  from app.api.v1.routes.seller_ai_advisor_router import router as seller_ai_advisor_router
  api_router.include_router(seller_ai_advisor_router)
"""

from __future__ import annotations

import html
import json
import logging
import re
from datetime import datetime, timedelta
from typing import AsyncGenerator, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Cookie
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.legacy_models import (
    TrackedProduct,
    User,
    RankTrackedKeyword,
    RankSnapshot,
)
from app.api.deps import get_current_user, validate_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seller/ai-advisor", tags=["Seller AI Advisor"])

# ── Ollama ────────────────────────────────────────────────────────────────────
OLLAMA_URL     = "http://localhost:11434/api/generate"
OLLAMA_MODEL   = "llama3.2:3b"
OLLAMA_TIMEOUT = 90.0

# ── Message limit per session (no Redis — simple in-memory per process) ────────
# For production replace with Redis or DB-backed history
_session_history: dict[str, list[dict]] = {}
MAX_HISTORY_TURNS = 6


# Optional auth helper for AI advisor routes
def get_optional_user(
    session_id: str = Cookie(None),
    db: Session = Depends(get_db),
):
    if not session_id:
        return None
    session_data = validate_session(session_id)
    if not session_data:
        return None
    return db.query(User).filter(User.id == session_data["user_id"]).first()


# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question:    str
    seller_id:   str
    user_email:  Optional[str] = None
    user_id:     Optional[str] = None
    session_id:  Optional[str] = None
    focus_asin:  Optional[str] = None   # seller focused on a specific product
    focus_title: Optional[str] = None
    stream:      Optional[bool] = True


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _get_user_tier_by_obj(user: Optional[User]) -> str:
    if not user:
        return "free"
    return (user.subscription_tier or "free").lower().strip()


def _clean(text: Optional[str]) -> str:
    if not text:
        return ""
    return html.unescape(str(text)).strip()


def _parse_price(price_str: Optional[str]) -> Optional[float]:
    if not price_str:
        return None
    try:
        cleaned = re.sub(r"[^\d.]", "", str(price_str))
        return float(cleaned) if cleaned else None
    except (ValueError, TypeError):
        return None


def _load_history(session_id: str) -> list[dict]:
    return _session_history.get(session_id, [])


def _save_history(session_id: str, history: list[dict]) -> None:
    trimmed = history[-(MAX_HISTORY_TURNS * 2):]
    _session_history[session_id] = trimmed


def _append_turn(session_id: str, user_msg: str, assistant_msg: str) -> None:
    history = _load_history(session_id)
    history.append({"role": "user",      "content": user_msg})
    history.append({"role": "assistant", "content": assistant_msg})
    _save_history(session_id, history)


# ─────────────────────────────────────────────────────────────────────────────
# SELLER CONTEXT LOADER
# Pulls everything we know about the seller from the DB
# ─────────────────────────────────────────────────────────────────────────────

def _load_seller_context(
    db:         Session,
    seller_id:  str,
    user_email: Optional[str],
    tier:       str,
    focus_asin: Optional[str] = None,
) -> dict:
    """
    Load full seller context for the AI prompt.
    Returns structured dict with products, prices, reviews, ranks.
    """
    is_basic   = tier in ("basic", "premium")
    is_premium = tier == "premium"

    # ── All tracked products ──────────────────────────────────────────────
    products_q = (
        db.query(TrackedProduct)
        .filter(TrackedProduct.seller_id == seller_id)
        .order_by(TrackedProduct.created_at.desc())
        .limit(20)
        .all()
    )

    products_summary = []
    for p in products_q:
        price_num = _parse_price(p.product_price)

        # Parse reviews from JSON field
        ratings_raw = []
        try:
            if p.review_ratings:
                ratings_raw = json.loads(p.review_ratings) if isinstance(p.review_ratings, str) else p.review_ratings
        except Exception:
            pass

        comments_raw = []
        try:
            if p.review_comments:
                comments_raw = json.loads(p.review_comments) if isinstance(p.review_comments, str) else p.review_comments
        except Exception:
            pass

        # Recent reviews sample (basic+)
        recent_reviews = []
        if is_basic and ratings_raw and comments_raw:
            for rating, comment in zip(ratings_raw[:3], comments_raw[:3]):
                if comment and str(comment).strip():
                    recent_reviews.append({
                        "rating":  rating,
                        "comment": _clean(str(comment))[:150],
                    })

        entry = {
            "asin":         p.asin,
            "title":        _clean(p.product_title)[:80],
            "price":        p.product_price or "—",
            "price_num":    price_num,
            "original_price": p.product_original_price,
            "rating":       p.product_star_rating_numeric,
            "num_ratings":  p.product_num_ratings,
            "sales_volume": p.sales_volume or "—",
            "is_prime":     bool(p.is_prime),
            "is_best_seller": bool(p.is_best_seller),
            "currency":     p.currency or "USD",
            "country":      (p.country or "US").upper(),
            "num_offers":   p.product_num_offers,
            "min_offer":    p.product_minimum_offer_price,
        }

        if is_basic:
            entry["recent_reviews"] = recent_reviews
            entry["seller_rating"]  = p.seller_rating
            entry["business_name"]  = p.business_name

        products_summary.append(entry)

    # ── Rank data (basic+) ────────────────────────────────────────────────
    rank_summary = []
    if is_basic:
        try:
            kw_rows = (
                db.query(RankTrackedKeyword)
                .filter(RankTrackedKeyword.seller_id == seller_id)
                .limit(30)
                .all()
            )
            for kw_row in kw_rows:
                # Get latest snapshot for this keyword
                latest = (
                    db.query(RankSnapshot)
                    .filter(
                        RankSnapshot.seller_id == seller_id,
                        RankSnapshot.asin      == kw_row.asin,
                        RankSnapshot.keyword   == kw_row.keyword,
                    )
                    .order_by(RankSnapshot.checked_at.desc())
                    .first()
                )
                if latest:
                    rank_summary.append({
                        "asin":         kw_row.asin,
                        "keyword":      kw_row.keyword,
                        "rank":         latest.rank_position,
                        "page":         latest.page_number,
                        "is_sponsored": latest.is_sponsored,
                        "checked_at":   latest.checked_at.strftime("%Y-%m-%d") if latest.checked_at else None,
                    })
        except Exception as exc:
            logger.warning("Rank data load failed: %s", exc)

    # ── Portfolio stats ───────────────────────────────────────────────────
    total_products = len(products_summary)
    ratings_list   = [p["rating"] for p in products_summary if p.get("rating")]
    avg_rating     = round(sum(ratings_list) / len(ratings_list), 2) if ratings_list else None
    currency       = products_summary[0]["currency"] if products_summary else "USD"
    country        = products_summary[0]["country"]  if products_summary else "US"

    prices = [p["price_num"] for p in products_summary if p.get("price_num")]
    avg_price = round(sum(prices) / len(prices), 2) if prices else None

    return {
        "seller_id":      seller_id,
        "total_products": total_products,
        "avg_rating":     avg_rating,
        "avg_price":      avg_price,
        "currency":       currency,
        "country":        country,
        "tier":           tier,
        "products":       products_summary,
        "rank_data":      rank_summary,
    }


# ─────────────────────────────────────────────────────────────────────────────
# PROMPT BUILDER
# ─────────────────────────────────────────────────────────────────────────────

_BAD_OPENERS = re.compile(
    r"^(great question[!.]?|certainly[!.]?|of course[!.]?|absolutely[!.]?|"
    r"sure[!.]?|hello[!.]?|hi there[!.]?|as an ai[,.]?|i'?m an? ai[,.]?)\s*",
    re.IGNORECASE,
)


def _build_prompt(
    question:   str,
    context:    dict,
    history:    list[dict],
    focus_asin: Optional[str],
    focus_title:Optional[str],
    tier:       str,
) -> str:
    is_premium = tier == "premium"
    currency   = context.get("currency", "USD")
    sym        = "₹" if currency == "INR" else "$"
    country    = context.get("country", "US")
    platform   = "Amazon.in" if country == "IN" else "Amazon.com"

    # ── Products block ────────────────────────────────────────────────────
    if focus_asin:
        products_to_show = [p for p in context["products"] if p["asin"] == focus_asin]
    else:
        products_to_show = context["products"][:8]

    product_lines = []
    for p in products_to_show:
        line = (
            f'• {p["title"]} ({p["asin"]})\n'
            f'  Price: {p["price"]} | Rating: {p.get("rating", "—")}★ '
            f'({p.get("num_ratings", "—")} reviews) | Sales: {p.get("sales_volume", "—")}'
        )
        if p.get("is_best_seller"):
            line += " | BEST SELLER"
        if p.get("is_prime"):
            line += " | PRIME"
        if p.get("num_offers") and p["num_offers"] > 1:
            line += f' | {p["num_offers"]} competing sellers'
        if p.get("recent_reviews"):
            line += "\n  Recent reviews:"
            for r in p["recent_reviews"][:2]:
                line += f'\n    - {r["rating"]}★: "{r["comment"]}"'
        product_lines.append(line)

    products_block = "\n".join(product_lines) if product_lines else "No products found."

    # ── Rank data block ───────────────────────────────────────────────────
    rank_block = ""
    if context.get("rank_data"):
        relevant_ranks = (
            [r for r in context["rank_data"] if r["asin"] == focus_asin]
            if focus_asin
            else context["rank_data"][:10]
        )
        if relevant_ranks:
            rank_lines = []
            for r in relevant_ranks:
                rank_str = f'#{r["rank"]}' if r.get("rank") else "not in top 100"
                rank_lines.append(
                    f'  Keyword "{r["keyword"]}": {rank_str}'
                    + (f' (page {r["page"]})' if r.get("page") else "")
                    + (" [sponsored]" if r.get("is_sponsored") else "")
                )
            rank_block = "\nKeyword rank data:\n" + "\n".join(rank_lines)

    # ── Conversation history ──────────────────────────────────────────────
    history_block = ""
    if history:
        lines = []
        for m in history[-(MAX_HISTORY_TURNS * 2):]:
            prefix = "Seller" if m["role"] == "user" else "Insydz"
            lines.append(f"{prefix}: {m['content']}")
        history_block = "\nConversation so far:\n" + "\n".join(lines)

    # ── Focus context ─────────────────────────────────────────────────────
    focus_block = ""
    if focus_asin and focus_title:
        focus_block = f'\nThe seller is specifically asking about: "{focus_title}" ({focus_asin})\n'

    # ── Portfolio summary ─────────────────────────────────────────────────
    portfolio_block = (
        f"Store overview: {context['total_products']} products on {platform} | "
        f"Avg rating: {context.get('avg_rating', '—')}★ | "
        f"Avg price: {sym}{context.get('avg_price', '—')}"
    )

    # ═══════════════════════════════════════════════════════════════════════
    # THE PROMPT
    # ═══════════════════════════════════════════════════════════════════════
    prompt = f"""You are Insydz, a sharp AI store advisor for Amazon sellers. You have access to this seller's real product data.

Your style:
- Direct, confident, no corporate fluff. Talk like a real expert.
- Use phrases like "look", "honestly", "here's the thing", "the data shows"
- Always use {sym}, never $ or USD (unless seller is US-based)
- Max 200 words. Short paragraphs. Use bullets only when listing multiple items.
- NEVER open with "Great question!", "Certainly!", or repeat the question back.
- Be specific — use actual product names, prices, and ratings from the data.
- If something needs fixing, say it plainly. Don't hedge.

{portfolio_block}

Seller's products:
{products_block}
{rank_block}
{focus_block}
{history_block}

Seller asks: {question}

Insydz:"""

    return prompt


def _post_process(text: str) -> str:
    text = text.strip()
    text = _BAD_OPENERS.sub("", text).strip()
    if text:
        text = text[0].upper() + text[1:]
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# OLLAMA STREAMING
# ─────────────────────────────────────────────────────────────────────────────

async def _stream_ollama(prompt: str) -> AsyncGenerator[str, None]:
    body = {
        "model":   OLLAMA_MODEL,
        "prompt":  prompt,
        "stream":  True,
        "options": {
            "num_predict":    400,
            "temperature":    0.72,
            "top_p":          0.88,
            "repeat_penalty": 1.15,
            "stop":           ["\nSeller asks:", "\nInsydz:", "Seller:", "---"],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            async with client.stream("POST", OLLAMA_URL, json=body) as resp:
                if resp.status_code != 200:
                    yield f"data: {json.dumps('AI service unavailable — check Ollama is running.')}\n\n"
                    yield "data: [DONE]\n\n"
                    return
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("response", "")
                        if token:
                            yield f"data: {json.dumps(token)}\n\n"
                        if chunk.get("done"):
                            yield "data: [DONE]\n\n"
                            return
                    except json.JSONDecodeError:
                        continue
    except Exception as exc:
        logger.warning("Ollama stream error: %s", exc)
        error_msg = (
            "⚠️ AI Advisor is offline.\n\n"
            "Make sure Ollama is running: `ollama serve`\n"
            "And the model is downloaded: `ollama pull llama3.2:3b`"
        )
        yield f"data: {json.dumps(error_msg)}\n\n"
        yield "data: [DONE]\n\n"


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/context")
def get_seller_context(
    seller_id:  str           = Query(...),
    current_user: Optional[User] = Depends(get_optional_user),
    db:         Session       = Depends(get_db),
) -> dict:
    """
    Load seller store context for the chat UI sidebar.
    Returns products list, avg rating, currency.
    """
    tier = _get_user_tier_by_obj(current_user)

    context = _load_seller_context(
        db         = db,
        seller_id  = seller_id,
        user_email = current_user.email if current_user else None,
        tier       = tier,
    )

    # Return slim version for sidebar
    return {
        "seller_id":      seller_id,
        "total_products": context["total_products"],
        "avg_rating":     context["avg_rating"],
        "currency":       context["currency"],
        "products": [
            {
                "asin":         p["asin"],
                "title":        p["title"],
                "price":        p["price"],
                "rating":       p.get("rating"),
                "sales_volume": p.get("sales_volume"),
            }
            for p in context["products"]
        ],
    }


@router.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db:   Session = Depends(get_db),
) -> StreamingResponse:
    """
    SSE streaming chat endpoint for the seller AI advisor.

    Pulls full seller context from DB, builds a prompt with product data,
    review signals, rank history, and conversation history.
    Streams response token-by-token from Ollama (llama3.2:3b).

    Free tier → blocked.
    Basic     → products + reviews + basic rank data.
    Premium   → everything including 30-day rank history.
    """
    tier = _get_user_tier_by_obj(current_user)

    # ── Tier gate ──────────────────────────────────────────────────────────
    if tier == "free":
        async def _gate() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps('upgrade_required')}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_gate(), media_type="text/event-stream")

    question = (body.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    session_id = body.session_id or "default"

    # ── Load seller context from DB ────────────────────────────────────────
    context = _load_seller_context(
        db          = db,
        seller_id   = body.seller_id,
        user_email  = current_user.email if current_user else body.user_email,
        tier        = tier,
        focus_asin  = body.focus_asin,
    )

    if context["total_products"] == 0:
        async def _no_products() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps('No products found for your seller account. Make sure you have tracked products in My Products first.')}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_no_products(), media_type="text/event-stream")

    # ── Load conversation history ──────────────────────────────────────────
    history = _load_history(session_id)

    # ── Build prompt ───────────────────────────────────────────────────────
    prompt = _build_prompt(
        question    = question,
        context     = context,
        history     = history,
        focus_asin  = body.focus_asin,
        focus_title = body.focus_title,
        tier        = tier,
    )

    # ── Stream and collect full response for history ───────────────────────
    async def event_stream() -> AsyncGenerator[str, None]:
        full_text = ""
        async for chunk in _stream_ollama(prompt):
            yield chunk
            # Collect text for history (extract from SSE format)
            if chunk.startswith("data: ") and chunk.strip() != "data: [DONE]":
                try:
                    token = json.loads(chunk[6:].strip())
                    if isinstance(token, str):
                        full_text += token
                except Exception:
                    pass

        # Save turn to history after streaming completes
        if full_text:
            clean = _post_process(full_text)
            _append_turn(session_id, question, clean)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":     "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/reset")
def reset_session(
    session_id: str = Query(...),
) -> dict:
    """Clear conversation history for a session."""
    if session_id in _session_history:
        del _session_history[session_id]
    return {"status": "ok", "session_id": session_id}