"""
Existing Seller Price Optimizer — FastAPI Router
Mirrors the pattern in profitability/ai_router.py exactly.
prefix: /api/seller/optimize

Confirmed tracked_products columns (from actual DB):
    id, seller_id, asin, product_title, product_photo, country, user_email,
    created_at, review_comments, review_ratings, seller_name, seller_logo,
    seller_link, store_link, seller_phone, business_name, business_address,
    seller_rating, seller_ratings_total, review_authors, review_dates,
    review_has_response, product_price (string e.g. "$23.91" / "₹1000"),
    product_original_price (string or NULL), currency ("USD"/"INR"),
    product_star_rating (string), product_star_rating_numeric (float),
    product_num_ratings, product_url, product_num_offers,
    product_minimum_offer_price, is_best_seller, is_amazon_choice,
    is_prime, climate_pledge_friendly, sales_volume, delivery,
    has_variations, unit_price, unit_count

KEY FACTS:
  - tracked_products has NO category_id column.
  - product_price is a formatted string — we parse it in Python.
  - currency column DOES exist ("USD" / "INR").
  - We look up category by matching asin in rapidapi_amazon_products.
"""

import json
import re
from collections import defaultdict
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

from app.db.session import get_db
from app.services.profitability_service import require_tier
from app.services.ollama_service import (
    ollama_is_running, stream_ollama, OLLAMA_MODEL,
)

router = APIRouter(prefix="/seller/optimize", tags=["Seller Price Optimizer"])

SELLER_SYSTEM = (
    "You are a senior Amazon pricing strategist. "
    "You speak concisely and in plain English. "
    "Always give a specific, actionable recommendation. "
    "Never hedge without giving a clear direction. "
    "Use bullet points only when listing 3+ distinct items."
)


# ── SSE helpers (identical pattern to ai_router.py) ────────────────────────────

async def _sse_gen(prompt: str, system: str = SELLER_SYSTEM):
    async for token in stream_ollama(prompt, system):
        yield f"data: {json.dumps(token)}\n\n"
    yield "data: [DONE]\n\n"


def _sse(prompt: str, system: str = SELLER_SYSTEM) -> StreamingResponse:
    return StreamingResponse(
        _sse_gen(prompt, system),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _check_ollama():
    if not await ollama_is_running():
        raise HTTPException(
            status_code=503,
            detail={"error": "ollama_offline", "message": "Run: ollama serve"},
        )


def _check_tier(user_id: Optional[str], required: str, db: Session):
    try:
        require_tier(user_id, required, db)
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail={"error": "upgrade_required", "required_tier": required},
        )


# ── Schemas ────────────────────────────────────────────────────────────────────

class RepriceAdviceRequest(BaseModel):
    asin: str
    seller_id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None


class CompetitorAlertRequest(BaseModel):
    asin: str
    seller_id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None


# ── Price parser ───────────────────────────────────────────────────────────────

def _parse_price(s: str) -> float:
    """Parse '$23.91', '₹1,629', '₹1000' → float. Returns 0.0 on failure."""
    if not s:
        return 0.0
    cleaned = re.sub(r"[^\d.]", "", str(s).strip())
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0


def _parse_json_field(val) -> list:
    """Safely parse a JSON array column (review_comments etc.)."""
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return []
    return []


# ── DB fetchers ────────────────────────────────────────────────────────────────

def _fetch_tracked(asin: str, seller_id: str, db: Session) -> dict:
    """
    Pull seller's product from tracked_products.
    All columns confirmed from actual DB schema.
    """
    row = db.execute(
        text("""
            SELECT
                id, asin, product_title, product_photo,
                country, currency, user_email,
                product_price,
                product_original_price,
                product_star_rating,
                product_star_rating_numeric     AS star_rating,
                product_num_ratings             AS num_ratings,
                product_url,
                sales_volume, delivery,
                is_prime, is_best_seller, is_amazon_choice,
                climate_pledge_friendly,
                review_ratings, review_comments, review_authors,
                seller_name, seller_rating, seller_ratings_total,
                business_name, business_address,
                product_num_offers, product_minimum_offer_price,
                has_variations, unit_price, unit_count,
                created_at
            FROM tracked_products
            WHERE asin = :asin AND seller_id = :seller_id
            LIMIT 1
        """),
        {"asin": asin, "seller_id": seller_id},
    ).mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"ASIN {asin} not found in your tracked products.",
        )

    data = dict(row)
    # Parse price strings into floats
    data["price_num"]      = _parse_price(str(data.get("product_price") or ""))
    data["orig_price_num"] = _parse_price(str(data.get("product_original_price") or ""))
    # currency column exists but guard against NULL on old rows
    if not data.get("currency"):
        data["currency"] = "USD" if data.get("country") == "US" else "INR"

    return data


def _fetch_category_meta(asin: str, db: Session) -> dict:
    """Look up category info for this ASIN from rapidapi_amazon_products."""
    row = db.execute(
        text("""
            SELECT category_id, category_name
            FROM rapidapi_amazon_products
            WHERE asin = :asin
            LIMIT 1
        """),
        {"asin": asin},
    ).mappings().first()
    return dict(row) if row else {}


def _fetch_market(asin: str, db: Session) -> dict:
    """
    Aggregate category benchmarks from rapidapi_amazon_products.
    Matches by category_id of this ASIN (looked up via asin join).
    Falls back to all products if ASIN not found in rapidapi.
    """
    cat = _fetch_category_meta(asin, db)

    if cat.get("category_id"):
        where  = "category_id = :cat"
        params: dict = {"cat": cat["category_id"]}
    else:
        where  = "product_price_numeric > 0"  # full table fallback
        params = {}

    row = db.execute(
        text(f"""
            SELECT
                AVG(product_price_numeric)          AS avg_price,
                MIN(product_price_numeric)          AS min_price,
                MAX(product_price_numeric)          AS max_price,
                PERCENTILE_CONT(0.25) WITHIN GROUP
                    (ORDER BY product_price_numeric) AS p25_price,
                PERCENTILE_CONT(0.75) WITHIN GROUP
                    (ORDER BY product_price_numeric) AS p75_price,
                AVG(product_star_rating_numeric)    AS avg_rating,
                AVG(avg_sales_volume)               AS avg_sales_volume,
                AVG(
                    CASE
                        WHEN product_original_price_numeric > 0
                             AND product_price_numeric > 0
                        THEN (product_original_price_numeric - product_price_numeric)
                             / product_original_price_numeric * 100
                        ELSE NULL
                    END
                )                                   AS avg_discount_pct,
                COUNT(*)                            AS product_count
            FROM rapidapi_amazon_products
            WHERE {where}
              AND product_price_numeric IS NOT NULL
        """),
        params,
    ).mappings().first()

    result = dict(row) if row else {}
    result["category_name"] = cat.get("category_name", "All categories")
    result["category_id"]   = cat.get("category_id")
    return result


def _fetch_competitors(category_id: Optional[str], db: Session) -> list:
    """Pull up to 15 products from the same category ordered by price."""
    if not category_id:
        return []
    rows = db.execute(
        text("""
            SELECT
                product_title, asin, product_price,
                product_price_numeric           AS price_num,
                product_star_rating_numeric     AS rating,
                product_num_ratings             AS num_ratings,
                is_best_seller, is_amazon_choice,
                avg_sales_volume                AS sales_volume
            FROM rapidapi_amazon_products
            WHERE category_id = :cat
              AND product_price_numeric IS NOT NULL
              AND product_price_numeric > 0
            ORDER BY product_price_numeric ASC
            LIMIT 15
        """),
        {"cat": category_id},
    ).mappings().all()
    return [dict(r) for r in rows]


# ── Analysis ───────────────────────────────────────────────────────────────────

def _price_gap(tracked: dict, market: dict) -> dict:
    price = tracked["price_num"]
    avg   = float(market.get("avg_price") or 0)
    low   = float(market.get("min_price") or 0)
    high  = float(market.get("max_price") or 0)
    p25   = float(market.get("p25_price") or 0)
    p75   = float(market.get("p75_price") or 0)
    orig  = tracked["orig_price_num"]

    pct_vs_avg = round((price - avg) / avg * 100, 1) if avg else None

    if pct_vs_avg is None:       position = "unknown"
    elif pct_vs_avg > 10:        position = "Above market"
    elif pct_vs_avg < -10:       position = "Below market"
    else:                        position = "At market"

    mrp_disc = (
        round((orig - price) / orig * 100, 1)
        if orig and orig > price else None
    )
    avg_rating  = float(market.get("avg_rating") or 0)
    your_rating = float(tracked.get("star_rating") or 0)

    return {
        "your_price":              price,
        "market_avg":              round(avg, 2),
        "market_min":              round(low, 2),
        "market_max":              round(high, 2),
        "market_p25":              round(p25, 2),
        "market_p75":              round(p75, 2),
        "gap_vs_avg":              round(price - avg, 2) if avg else None,
        "pct_vs_avg":              pct_vs_avg,
        "price_position":          position,
        "your_mrp_discount_pct":   mrp_disc,
        "market_avg_discount_pct": round(float(market.get("avg_discount_pct") or 0), 1),
        "your_rating":             your_rating,
        "market_avg_rating":       round(avg_rating, 2),
        "rating_gap":              round(your_rating - avg_rating, 2) if avg_rating else None,
        "category_name":           market.get("category_name", ""),
    }


def _reprice_score(gap: dict, tracked: dict, market: dict) -> dict:
    price      = gap["your_price"]
    avg        = gap["market_avg"]
    low        = gap["market_min"]
    high       = gap["market_max"]
    p25        = gap["market_p25"]
    pct_vs_avg = gap["pct_vs_avg"] or 0
    rating_gap = gap["rating_gap"] or 0
    your_rating= gap["your_rating"]
    avg_rating = gap["market_avg_rating"]
    score      = 50

    # Signal 1 — price position (±20 pts)
    if pct_vs_avg > 15:   score -= 20; price_signal = "overpriced"
    elif pct_vs_avg > 5:  score -= 8;  price_signal = "slightly high"
    elif pct_vs_avg < -15:score += 15; price_signal = "underpriced"
    elif pct_vs_avg < -5: score += 5;  price_signal = "slightly low"
    else:                              price_signal = "well positioned"

    # Signal 2 — rating (±15 pts)
    if rating_gap >= 0.3:   score += 15; rating_signal = "rating premium justified"
    elif rating_gap <= -0.3:score -= 15; rating_signal = "rating penalty applies"
    else:                               rating_signal = "rating parity"

    # Signal 3 — velocity (±15 pts)
    sv = str(tracked.get("sales_volume") or "")
    if any(x in sv for x in ["10K+", "50K+", "100K+"]):
        score += 15; velocity_signal = "high velocity — room to raise"
    elif any(x in sv for x in ["1K+", "2K+", "3K+", "4K+", "5K+"]):
        score += 5;  velocity_signal = "healthy velocity"
    elif any(x in sv for x in ["100+", "200+", "500+"]):
        score -= 10; velocity_signal = "low velocity — consider lowering"
    elif sv:          velocity_signal = "low velocity"
    else:             velocity_signal = "velocity unknown"

    score = max(0, min(100, score))

    if score >= 65:
        rec_low  = round(price * 1.04, 2)
        rec_high = round(min(price * 1.12, high * 0.95 if high else price * 1.12), 2)
        action   = "raise"
    elif score <= 35:
        floor    = low * 1.05 if low else price * 0.85
        rec_low  = round(max(price * 0.88, floor), 2)
        rec_high = round(price * 0.96, 2)
        action   = "lower"
    else:
        rec_low  = round(price * 0.97, 2)
        rec_high = round(price * 1.03, 2)
        action   = "hold"

    alerts = []
    mrp_disc    = gap.get("your_mrp_discount_pct")
    market_disc = gap.get("market_avg_discount_pct", 0)
    if mrp_disc is not None and mrp_disc < market_disc - 5:
        alerts.append({"type": "warn",   "message": f"Your MRP discount ({mrp_disc:.0f}%) is below market avg ({market_disc:.0f}%). Buyers may perceive less value."})
    if rating_gap <= -0.5:
        alerts.append({"type": "danger", "message": f"Your rating ({your_rating}★) is significantly below category avg ({avg_rating}★). Fix reviews before raising price."})
    if pct_vs_avg > 20:
        alerts.append({"type": "danger", "message": f"You are {pct_vs_avg:.0f}% above market average — high Buy Box loss risk."})
    if p25 and price < p25:
        alerts.append({"type": "warn",   "message": f"Your price is in the bottom 25% of the market (below {round(p25,2)}). You may be undercharging."})

    return {
        "confidence_score":   score,
        "recommended_action": action,
        "rec_price_low":      rec_low,
        "rec_price_high":     rec_high,
        "price_signal":       price_signal,
        "rating_signal":      rating_signal,
        "velocity_signal":    velocity_signal,
        "alerts":             alerts,
    }


def _build_reprice_prompt(tracked: dict, gap: dict, rec: dict) -> str:
    sym      = "$" if tracked.get("currency") == "USD" else "₹"
    title    = (tracked.get("product_title") or "")[:120]
    reviews  = _parse_json_field(tracked.get("review_comments"))
    review_str = "\n".join(f'- "{r}"' for r in reviews[:3]) or "No reviews available."
    return f"""
You are advising an Amazon seller on repricing their product.

Product: {title}
ASIN: {tracked.get("asin")}
Category: {gap.get("category_name", "Unknown")}

Current price: {sym}{gap["your_price"]:,.2f}
Market average: {sym}{gap["market_avg"]:,.2f}  |  Range: {sym}{gap["market_min"]:,.2f} – {sym}{gap["market_max"]:,.2f}
Price position: {gap["price_position"]} ({(gap["pct_vs_avg"] or 0):+.1f}% vs avg)

Your rating: {gap["your_rating"]}★  |  Market avg: {gap["market_avg_rating"]}★
Your MRP discount: {gap.get("your_mrp_discount_pct") or "N/A"}%  |  Market avg discount: {gap.get("market_avg_discount_pct", 0):.0f}%
Sales velocity: {tracked.get("sales_volume") or "unknown"}

Model says: {rec["recommended_action"].upper()} to {sym}{rec["rec_price_low"]:,.2f} – {sym}{rec["rec_price_high"]:,.2f}
Confidence: {rec["confidence_score"]}/100
Signals: {rec["price_signal"]} · {rec["rating_signal"]} · {rec["velocity_signal"]}

Recent customer reviews:
{review_str}

Respond in exactly 3 labelled sections:
1. WHY — situation in 1–2 sentences using the actual numbers.
2. WHAT TO DO — confirm or challenge the recommendation with specific reasoning.
3. WATCH OUT — one risk that could change this advice.

Be specific. Use actual numbers. No generic advice.
""".strip()


def _build_alert_prompt(asin: str, title: str, deltas: list, your_price: float, currency: str) -> str:
    sym = "$" if currency == "USD" else "₹"
    delta_str = "\n".join(
        f"- {d['seller_name']}: {sym}{d['old_price']:,.2f} → {sym}{d['new_price']:,.2f} ({d['change_pct']:+.1f}%)"
        for d in deltas[:8]
    )
    undercut_count = sum(1 for d in deltas if d["new_price"] < your_price)
    return f"""
Amazon ASIN {asin} — {title[:80]}
Your current price: {sym}{your_price:,.2f}
Competitors undercutting you: {undercut_count}

Recent competitor price movements:
{delta_str}

In 2–3 sentences: what do these movements signal, and should the seller respond? Be specific.
""".strip()


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/asin-profile")
async def asin_profile(
    asin:       str = Query(...),
    seller_id:  str = Query(...),
    user_id:    Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """FREE — basic market position for any tracked ASIN."""
    tracked = _fetch_tracked(asin, seller_id, db)
    market  = _fetch_market(asin, db)
    gap     = _price_gap(tracked, market)
    rec     = _reprice_score(gap, tracked, market)

    return {
        "asin":                      tracked["asin"],
        "product_title":             tracked["product_title"],
        "product_photo":             tracked.get("product_photo"),
        "product_url":               tracked.get("product_url"),
        "currency":                  tracked.get("currency", "INR"),
        "country":                   tracked.get("country"),
        "is_prime":                  tracked.get("is_prime"),
        "is_best_seller":            tracked.get("is_best_seller"),
        "is_amazon_choice":          tracked.get("is_amazon_choice"),
        "sales_volume":              tracked.get("sales_volume"),
        "delivery":                  tracked.get("delivery"),
        "star_rating":               tracked.get("star_rating"),
        "num_ratings":               tracked.get("num_ratings"),
        "seller_name":               tracked.get("seller_name"),
        "seller_rating":             tracked.get("seller_rating"),
        "your_price":                gap["your_price"],
        "price_position":            gap["price_position"],
        "market_avg":                gap["market_avg"],
        "market_min":                gap["market_min"],
        "market_max":                gap["market_max"],
        "pct_vs_avg":                gap["pct_vs_avg"],
        "category_name":             gap["category_name"],
        "recommended_action_teaser": rec["recommended_action"],
        "confidence_score_teaser":   rec["confidence_score"],
        "market_product_count":      int(market.get("product_count") or 0),
        "last_updated":              str(tracked.get("created_at") or ""),
    }


@router.get("/price-gap")
async def price_gap(
    asin:       str = Query(...),
    seller_id:  str = Query(...),
    user_id:    Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """BASIC — full gap analysis, rating gap, discount depth, price bands, competitors."""
    _check_tier(user_id, "basic", db)
    tracked     = _fetch_tracked(asin, seller_id, db)
    market      = _fetch_market(asin, db)
    gap         = _price_gap(tracked, market)
    cat_meta    = _fetch_category_meta(asin, db)
    competitors = _fetch_competitors(cat_meta.get("category_id"), db)

    bands: list = []
    lo_b = gap["market_min"]
    hi_b = gap["market_max"]
    if lo_b and hi_b and hi_b > lo_b:
        step = (hi_b - lo_b) / 4
        for i in range(4):
            b_lo = lo_b + i * step
            b_hi = b_lo + step
            count = sum(
                1 for c in competitors
                if c.get("price_num") and b_lo <= float(c["price_num"]) < b_hi
            )
            bands.append({
                "band":               f"{b_lo:,.0f}–{b_hi:,.0f}",
                "count":              count,
                "your_price_in_band": b_lo <= gap["your_price"] < b_hi,
            })

    return {
        **gap,
        "currency":             tracked.get("currency", "INR"),
        "product_title":        tracked["product_title"],
        "price_bands":          bands,
        "competitors":          competitors,
        "market_product_count": int(market.get("product_count") or 0),
    }


@router.get("/reprice")
async def reprice(
    asin:       str = Query(...),
    seller_id:  str = Query(...),
    user_id:    Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """BASIC — scoring-based repricing recommendation with confidence score."""
    _check_tier(user_id, "basic", db)
    tracked = _fetch_tracked(asin, seller_id, db)
    market  = _fetch_market(asin, db)
    gap     = _price_gap(tracked, market)
    rec     = _reprice_score(gap, tracked, market)

    return {
        "asin":           asin,
        "product_title":  tracked["product_title"],
        "currency":       tracked.get("currency", "INR"),
        "your_price":     gap["your_price"],
        "price_position": gap["price_position"],
        **rec,
        "gap_summary":    gap,
    }


@router.get("/competitor-alerts")
async def competitor_alerts(
    asin:       str = Query(...),
    seller_id:  str = Query(...),
    user_id:    Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """PREMIUM — detect competitor price movements via snapshot deltas."""
    _check_tier(user_id, "premium", db)
    tracked    = _fetch_tracked(asin, seller_id, db)
    your_price = tracked["price_num"]
    currency   = tracked.get("currency", "INR")

    rows = db.execute(
        text("""
            SELECT
                seller_id, seller_name,
                product_price,
                product_star_rating_numeric AS rating,
                sales_volume, is_prime,
                created_at
            FROM tracked_products
            WHERE asin = :asin
            ORDER BY created_at ASC
        """),
        {"asin": asin},
    ).mappings().all()

    by_seller: dict = defaultdict(list)
    for r in rows:
        by_seller[r["seller_id"]].append(dict(r))

    deltas: list = []
    undercuts: list = []

    for sid, snaps in by_seller.items():
        if sid == seller_id or len(snaps) < 2:
            continue
        old_p = _parse_price(str(snaps[0].get("product_price") or ""))
        new_p = _parse_price(str(snaps[-1].get("product_price") or ""))
        if not old_p or not new_p:
            continue
        change_pct = round((new_p - old_p) / old_p * 100, 1)
        if abs(change_pct) < 1:
            continue
        delta = {
            "seller_id":    sid,
            "seller_name":  snaps[-1].get("seller_name") or sid,
            "old_price":    round(old_p, 2),
            "new_price":    round(new_p, 2),
            "change_pct":   change_pct,
            "rating":       snaps[-1].get("rating"),
            "sales_volume": snaps[-1].get("sales_volume"),
            "is_prime":     snaps[-1].get("is_prime"),
            "direction":    "down" if change_pct < 0 else "up",
            "updated_at":   str(snaps[-1].get("created_at") or ""),
        }
        deltas.append(delta)
        if new_p < your_price:
            undercuts.append(delta)

    deltas.sort(key=lambda x: abs(x["change_pct"]), reverse=True)

    return {
        "asin":              asin,
        "product_title":     tracked["product_title"],
        "currency":          currency,
        "your_price":        your_price,
        "total_competitors": len(by_seller) - 1,
        "price_movers":      len(deltas),
        "undercuts_you":     len(undercuts),
        "deltas":            deltas,
        "undercut_sellers":  undercuts,
        "alert_level":       "critical" if undercuts else "warn" if deltas else "ok",
    }


@router.post("/ai/reprice-advice")
async def reprice_advice_stream(req: RepriceAdviceRequest, db: Session = Depends(get_db)):
    """PREMIUM · SSE — Ollama explains the repricing recommendation."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()
    tracked = _fetch_tracked(req.asin, req.seller_id, db)
    market  = _fetch_market(req.asin, db)
    gap     = _price_gap(tracked, market)
    rec     = _reprice_score(gap, tracked, market)
    prompt  = _build_reprice_prompt(tracked, gap, rec)
    return _sse(prompt)


@router.post("/ai/alert-advice")
async def alert_advice_stream(req: CompetitorAlertRequest, db: Session = Depends(get_db)):
    """PREMIUM · SSE — Ollama advises on competitor price movements."""
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()

    tracked    = _fetch_tracked(req.asin, req.seller_id, db)
    your_price = tracked["price_num"]
    currency   = tracked.get("currency", "INR")

    rows = db.execute(
        text("""
            SELECT seller_id, seller_name, product_price, created_at
            FROM tracked_products
            WHERE asin = :asin
            ORDER BY created_at ASC
        """),
        {"asin": req.asin},
    ).mappings().all()

    by_seller: dict = defaultdict(list)
    for r in rows:
        by_seller[r["seller_id"]].append(dict(r))

    deltas = []
    for sid, snaps in by_seller.items():
        if sid == req.seller_id or len(snaps) < 2:
            continue
        old_p = _parse_price(str(snaps[0].get("product_price") or ""))
        new_p = _parse_price(str(snaps[-1].get("product_price") or ""))
        if not old_p or not new_p or abs((new_p - old_p) / old_p) < 0.01:
            continue
        deltas.append({
            "seller_name": snaps[-1].get("seller_name") or sid,
            "old_price":   round(old_p, 2),
            "new_price":   round(new_p, 2),
            "change_pct":  round((new_p - old_p) / old_p * 100, 1),
        })

    if not deltas:
        raise HTTPException(status_code=400, detail="No competitor price movements detected.")

    prompt = _build_alert_prompt(req.asin, tracked["product_title"], deltas, your_price, currency)
    return _sse(prompt)


@router.get("/ai/status")
async def optimizer_ai_status():
    """Ollama status — same pattern as profitability AI router."""
    running = await ollama_is_running()
    return {"ollama_running": running, "model": OLLAMA_MODEL, "status": "ready" if running else "offline"}