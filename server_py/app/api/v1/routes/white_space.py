# from __future__ import annotations

# import hashlib
# from collections import defaultdict
# from typing import Optional, List, Dict, Any

# from fastapi import APIRouter, HTTPException, Depends
# from sqlalchemy import text
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.services.profitability_service import get_user_tier
# from app.schemas.white_space_finder_schema import (
#     ScanRequest, ScoreBreakdown, Competitor, Opportunity, ScanResult
# )

# router = APIRouter()

# def _get_tier_config(tier: str):
#     return {
#         "free":    {"scans_limit": 3, "results_visible": 3, "competitors": False, "breakdown": False, "trend": False},
#         "basic":   {"scans_limit": 20, "results_visible": 999, "competitors": True, "breakdown": True, "trend": False},
#         "premium": {"scans_limit": 99999, "results_visible": 999, "competitors": True, "breakdown": True, "trend": True},
#     }.get(tier, {
#         "scans_limit": 3,
#         "results_visible": 3,
#         "competitors": False,
#         "breakdown": False,
#         "trend": False
#     })


# def _compute_score(avg_rating, avg_reviews, sales_volume, price_gap_pct, competitor_count):
#     rg = 32 if avg_rating < 3.5 else 24 if avg_rating < 4.0 else 14 if avg_rating < 4.3 else 6 if avg_rating < 4.5 else 0
#     rt = 32 if avg_reviews < 50 else 24 if avg_reviews < 150 else 16 if avg_reviews < 400 else 8 if avg_reviews < 800 else 0
#     ds = 24 if sales_volume > 5000 else 18 if sales_volume > 2000 else 12 if sales_volume > 500 else 6 if sales_volume > 100 else 0
#     pg = 12 if 10 <= price_gap_pct <= 30 else 8 if price_gap_pct < 10 else 4
#     total = min(rg + rt + ds + pg, 100)

#     reasons = []
#     if rg >= 24:
#         reasons.append(f"average rating of {avg_rating:.1f} — buyers are unsatisfied")
#     if rt >= 24:
#         reasons.append(f"most listings have under {avg_reviews} reviews — easy to outrank")
#     if competitor_count <= 20:
#         reasons.append(f"only {competitor_count} active competitors — low crowding")
#     gap = "; ".join(reasons) if reasons else "Moderate opportunity based on demand and pricing"
#     gap = gap[0].upper() + gap[1:] if gap else gap

#     breakdown = ScoreBreakdown(rating_gap=rg, review_thinness=rt, demand_signal=ds, price_gap=pg)
#     return total, breakdown, gap


# def _weakness(row: Dict[str, Any]) -> str:
#     rating = float(row.get("product_star_rating_numeric") or 0)
#     reviews = int(row.get("product_num_ratings") or 0)
#     if rating < 3.5:
#         return f"Poor rating ({rating:.1f}) — lots of negative reviews"
#     if rating < 4.0:
#         return f"Below-average rating ({rating:.1f})"
#     if reviews < 100:
#         return f"Only {reviews} reviews — no social proof yet"
#     if reviews < 300:
#         return f"Thin review base ({reviews} reviews)"
#     return "Established but beatable on price or differentiation"


# def _stable_id(niche: str, category: str) -> str:
#     return hashlib.md5(f"{niche}:{category}".encode()).hexdigest()[:12]


# AMAZON_SQL = """
# SELECT category_name, product_title, product_price_numeric,
#     product_original_price_numeric, product_star_rating_numeric,
#     product_num_ratings, avg_sales_volume, avg_price, min_price, max_price
# FROM rapidapi_amazon_products
# WHERE
#     (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
#     AND (:category IS NULL OR category_name = :category)
#     AND product_price_numeric > 0
#     AND product_star_rating_numeric IS NOT NULL
# ORDER BY avg_sales_volume DESC NULLS LAST
# LIMIT 200
# """

# FLIPKART_SQL = """
# SELECT category_name, product_title, product_price, product_mrp,
#     product_star_rating, product_rating_count, estimated_sales,
#     avg_price, min_price, max_price
# FROM rapidapi_flipkart_products
# WHERE
#     (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
#     AND (:category IS NULL OR category_name = :category)
#     AND product_price > 0
# LIMIT 200
# """


# # ── Categories endpoint ───────────────────────────────────────────────────────

# @router.get("/categories")
# def get_categories(platform: str = "both", db: Session = Depends(get_db)):
#     try:
#         if platform == "amazon":
#             res = db.execute(text("""
#                 SELECT DISTINCT category_name FROM rapidapi_amazon_products
#                 WHERE category_name IS NOT NULL ORDER BY category_name
#             """))
#         elif platform == "flipkart":
#             res = db.execute(text("""
#                 SELECT DISTINCT category_name FROM rapidapi_flipkart_products
#                 WHERE category_name IS NOT NULL ORDER BY category_name
#             """))
#         else:  # both
#             res = db.execute(text("""
#                 SELECT DISTINCT category_name FROM rapidapi_amazon_products
#                 WHERE category_name IS NOT NULL
#                 UNION
#                 SELECT DISTINCT category_name FROM rapidapi_flipkart_products
#                 WHERE category_name IS NOT NULL
#                 ORDER BY category_name
#             """))
#         cats = [row[0] for row in res.fetchall()]
#         return {"categories": cats}
#     except Exception as e:
#         print(f"[categories error] {e}")
#         raise HTTPException(status_code=500, detail=str(e))


# # ── Main scan endpoint ────────────────────────────────────────────────────────

# @router.post("/scan", response_model=ScanResult)
# def scan_white_spaces(req: ScanRequest, db: Session = Depends(get_db)):
#     tier = "free"
#     scans_used = 0
#     if req.user_id:
#         try:
#             tier = get_user_tier(req.user_id, db)
#         except Exception:
#             tier = "free"
#         try:
#             row = db.execute(
#                 text("SELECT COUNT(*) FROM white_space_scans WHERE user_id=:uid AND created_at > NOW() - INTERVAL '30 days'"),
#                 {"uid": req.user_id},
#             ).scalar()
#             scans_used = int(row or 0)
#         except Exception:
#             scans_used = 0

#     cfg = _get_tier_config(tier)
#     if scans_used >= cfg["scans_limit"]:
#         raise HTTPException(status_code=429, detail="Monthly scan limit reached. Upgrade for more scans.")

#     like_q = f"%{req.query.lower()}%"
#     params = {
#         "query":      req.query if req.query else None,
#         "like_query": like_q,
#         "category":   req.category,
#     }

#     amazon_rows: List[Dict] = []
#     flipkart_rows: List[Dict] = []

#     if req.platform in ("amazon", "both"):
#         try:
#             res = db.execute(text(AMAZON_SQL), params)
#             amazon_rows = [dict(r._mapping) for r in res.fetchall()]
#         except Exception:
#             amazon_rows = []

#     if req.platform in ("flipkart", "both"):
#         try:
#             res = db.execute(text(FLIPKART_SQL), params)
#             flipkart_rows = [dict(r._mapping) for r in res.fetchall()]
#         except Exception:
#             flipkart_rows = []

#     niche_buckets: Dict[str, Dict] = defaultdict(lambda: {"rows_amazon": [], "rows_flipkart": []})

#     for row in amazon_rows:
#         cat = str(row.get("category_name") or "Uncategorized")
#         niche_buckets[cat]["rows_amazon"].append(row)

#     for row in flipkart_rows:
#         cat = str(row.get("category_name") or "Uncategorized")
#         niche_buckets[cat]["rows_flipkart"].append(row)

#     opportunities: List[Opportunity] = []

#     for niche, bucket in niche_buckets.items():
#         all_rows = bucket["rows_amazon"] + bucket["rows_flipkart"]
#         if not all_rows:
#             continue

#         prices      = [float(r.get("product_price_numeric") or r.get("product_price") or 0) for r in all_rows if (r.get("product_price_numeric") or r.get("product_price"))]
#         mrps        = [float(r.get("product_original_price_numeric") or r.get("product_mrp") or 0) for r in all_rows]
#         ratings     = [float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0) for r in all_rows if (r.get("product_star_rating_numeric") or r.get("product_star_rating"))]
#         reviews_raw = [int(r.get("product_num_ratings") or r.get("product_rating_count") or 0) for r in all_rows]
#         sales_raw   = [float(r.get("avg_sales_volume") or r.get("estimated_sales") or 0) for r in all_rows]

#         avg_price  = sum(prices) / len(prices) if prices else 0
#         avg_mrp    = sum(m for m in mrps if m > 0) / max(len([m for m in mrps if m > 0]), 1)
#         avg_rating = sum(ratings) / len(ratings) if ratings else 4.0
#         avg_reviews = int(sum(reviews_raw) / len(reviews_raw)) if reviews_raw else 0
#         avg_sales  = sum(sales_raw) / len(sales_raw) if sales_raw else 0
#         price_gap_pct = ((avg_mrp - avg_price) / avg_mrp * 100) if avg_mrp > avg_price > 0 else 0
#         competitor_count = len(all_rows)

#         score, breakdown, gap_summary = _compute_score(avg_rating, avg_reviews, avg_sales, price_gap_pct, competitor_count)

#         monthly_units_est = max(avg_sales / max(competitor_count, 1), 50)
#         rev_min = avg_price * monthly_units_est * 0.6
#         rev_max = avg_price * monthly_units_est * 1.2
#         top_keyword = f"{niche.lower()} {req.query.lower()}".strip()
#         trend_dir = "up" if score >= 75 else ("down" if score < 50 else "steady")
#         trend_pct = 12 if trend_dir == "up" else (8 if trend_dir == "down" else 0)

#         has_amazon   = len(bucket["rows_amazon"]) > 0
#         has_flipkart = len(bucket["rows_flipkart"]) > 0
#         platform_str = "both" if (has_amazon and has_flipkart) else ("amazon" if has_amazon else "flipkart")

#         top_rows = sorted(
#     all_rows,
#     key=lambda r: float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 5),
#     reverse=True
# )[:5]
#         competitors = [
#             Competitor(
#                 title=str(r.get("product_title") or "")[:80],
#                 rating=float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0),
#                 review_count=int(r.get("product_num_ratings") or r.get("product_rating_count") or 0),
#                 price=float(r.get("product_price_numeric") or r.get("product_price") or 0),
#                 weakness=_weakness(r),
#                 platform="amazon" if r in bucket["rows_amazon"] else "flipkart",
#             )
#             for r in top_rows
#         ]

#         opportunities.append(Opportunity(
#             id=_stable_id(niche, req.query),
#             product_niche=niche,
#             score=score,
#             gap_summary=gap_summary,
#             category=niche,
#             platform=platform_str,
#             search_volume_estimate=int(avg_sales * 3.5),
#             avg_price=round(avg_price, 2),
#             avg_rating=round(avg_rating, 2),
#             avg_reviews=avg_reviews,
#             competitor_count=competitor_count,
#             est_revenue_min=round(rev_min, 0),
#             est_revenue_max=round(rev_max, 0),
#             top_keyword=top_keyword[:60],
#             score_breakdown=breakdown,
#             competitors=competitors,
#             trend_direction=trend_dir,
#             trend_pct=trend_pct,
#         ))

#     opportunities.sort(key=lambda o: o.score, reverse=True)
#     total_found = len(opportunities)
#     visible = opportunities[:cfg["results_visible"]]
#     locked_n = max(total_found - len(visible), 0)

#     for opp in visible:
#         if not cfg["breakdown"]:
#             opp.score_breakdown = ScoreBreakdown(rating_gap=0, review_thinness=0, demand_signal=0, price_gap=0)
#         if not cfg["competitors"]:
#             opp.competitors = []
#         if not cfg["trend"]:
#             opp.trend_direction = "steady"
#             opp.trend_pct = 0

#     if req.user_id:
#         try:
#             db.execute(
#                 text("INSERT INTO white_space_scans (user_id, query, tier) VALUES (:uid, :q, :t)"),
#                 {"uid": req.user_id, "q": req.query, "t": tier},
#             )
#             db.commit()
#         except Exception:
#             pass

#     return ScanResult(
#         query=req.query,
#         category=req.category or "all",
#         platform=req.platform,
#         total_found=total_found,
#         tier=tier,
#         scans_used=scans_used + 1,
#         scans_limit=cfg["scans_limit"],
#         opportunities=visible,
#         locked_count=locked_n,
#     )





from __future__ import annotations

import hashlib
import json
import logging
from collections import defaultdict
from typing import Optional, List, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user_id, get_optional_user
from app.services.profitability_service import get_user_tier
from app.schemas.white_space_finder_schema import (
    ScanRequest, ScoreBreakdown, Competitor, Opportunity, ScanResult, AIInsight, WatchlistItemRequest
)

router = APIRouter()
logger = logging.getLogger(__name__)

from app.api.deps import r
from app.core.config import settings

# ── Ollama config ─────────────────────────────────────────────────────────────

OLLAMA_URL = f"{settings.OLLAMA_BASE_URL}/api/generate"
OLLAMA_MODEL = "llama3.2:3b"
OLLAMA_TIMEOUT = 45.0  # seconds — 3B model is fast, but give headroom

# ── Tier configuration ────────────────────────────────────────────────────────

def _get_tier_config(tier: str) -> Dict[str, Any]:
    return {
        "free": {
            "scans_limit": 3,
            "results_visible": 3,
            "competitors": False,
            "breakdown": False,
            "trend": False,
            "watchlist": False,
            "export": False,
            "ai_insights": False,
            "entry_price": False,
            "demand": False,
            "badges": False,
            "ai_market_summary": False,
        },
        "basic": {
            "scans_limit": 20,
            "results_visible": 999,
            "competitors": True,
            "breakdown": True,
            "trend": False,
            "watchlist": False,
            "export": False,
            "ai_insights": False,
            "entry_price": False,
            "demand": True,
            "badges": True,
            "ai_market_summary": False,
        },
        "premium": {
            "scans_limit": 9_999_999,
            "results_visible": 999,
            "competitors": True,
            "breakdown": True,
            "trend": True,
            "watchlist": True,
            "export": True,
            "ai_insights": True,
            "entry_price": True,
            "demand": True,
            "badges": True,
            "ai_market_summary": True,
        },
        "enterprise": {
            "scans_limit": 9_999_999,
            "results_visible": 999,
            "competitors": True,
            "breakdown": True,
            "trend": True,
            "watchlist": True,
            "export": True,
            "ai_insights": True,
            "entry_price": True,
            "demand": True,
            "badges": True,
            "ai_market_summary": True,
        },
    }.get(tier, {
        "scans_limit": 3, "results_visible": 3,
        "competitors": False, "breakdown": False, "trend": False,
        "watchlist": False, "export": False, "ai_insights": False,
        "entry_price": False, "demand": False, "badges": False,
        "ai_market_summary": False,
    })


# ── Scoring engine ────────────────────────────────────────────────────────────

def _compute_score(
    avg_rating: float,
    avg_reviews: int,
    sales_volume: float,
    price_gap_pct: float,
    competitor_count: int,
    has_best_seller: bool,
    has_amazon_choice: bool,
) -> tuple[int, ScoreBreakdown, str]:
    """
    4 pillars, max 100:
      rating_gap      0–32   (low rating = unhappy buyers = opportunity)
      review_thinness 0–32   (few reviews = easy to outrank)
      demand_signal   0–24   (sales volume = proven market)
      price_gap       0–12   (MRP vs selling price spread = margin room)
    Bonus: -5 if both best seller AND amazon choice exist (crowded top)
    """
    # Rating gap
    rg = (
        32 if avg_rating < 3.5 else
        26 if avg_rating < 3.8 else
        18 if avg_rating < 4.0 else
        10 if avg_rating < 4.2 else
        4  if avg_rating < 4.4 else
        0
    )

    # Review thinness
    rt = (
        32 if avg_reviews < 30 else
        26 if avg_reviews < 80 else
        20 if avg_reviews < 150 else
        14 if avg_reviews < 300 else
        8  if avg_reviews < 600 else
        2
    )

    # Demand signal (sales volume)
    ds = (
        24 if sales_volume > 8000 else
        20 if sales_volume > 4000 else
        16 if sales_volume > 1500 else
        10 if sales_volume > 400 else
        4  if sales_volume > 80  else
        0
    )

    # Price gap (MRP vs selling — room for margin)
    pg = (
        12 if 15 <= price_gap_pct <= 40 else
        9  if 8  <= price_gap_pct < 15  else
        6  if price_gap_pct < 8          else
        4   # >40% gap = suspicious / commoditized
    )

    total = rg + rt + ds + pg

    # Badge crowding penalty — if both BS and AC exist in this niche, it's dominated
    if has_best_seller and has_amazon_choice:
        total = max(total - 6, 0)

    total = min(total, 100)

    # Build gap summary
    reasons: List[str] = []
    if rg >= 18:
        reasons.append(f"average rating of {avg_rating:.1f}★ — buyers are unhappy")
    if rt >= 20:
        reasons.append(f"only {avg_reviews} avg reviews — listings are easy to outrank")
    if not has_best_seller:
        reasons.append("no Best Seller badge claimed in this niche")
    if not has_amazon_choice:
        reasons.append("no Amazon's Choice product yet")
    if competitor_count <= 15:
        reasons.append(f"only {competitor_count} active competitors — low crowding")
    if not reasons:
        reasons.append("moderate opportunity based on demand and pricing signals")

    gap = "; ".join(reasons[:3])
    gap = gap[0].upper() + gap[1:]

    breakdown = ScoreBreakdown(rating_gap=rg, review_thinness=rt, demand_signal=ds, price_gap=pg)
    return total, breakdown, gap


def _compute_trend(rows: List[Dict]) -> tuple[str, int]:
    """
    Use min_sales_volume vs max_sales_volume as a proxy for velocity.
    If max > min by >30%, it's growing.
    """
    volumes_max = [float(r.get("max_sales_volume") or 0) for r in rows]
    volumes_min = [float(r.get("min_sales_volume") or 0) for r in rows]
    avg_max = sum(volumes_max) / len(volumes_max) if volumes_max else 0
    avg_min = sum(volumes_min) / len(volumes_min) if volumes_min else 0
    if avg_min <= 0:
        return "steady", 0
    pct = ((avg_max - avg_min) / avg_min) * 100
    if pct >= 25:
        return "up", min(int(pct), 60)
    if pct <= -15:
        return "down", min(int(abs(pct)), 40)
    return "steady", 0


def _suggest_entry_price(avg_price: float, avg_rating: float) -> Optional[int]:
    """
    Suggest 10–15% below market avg — unlocks 'Lowest New Price' badge.
    Only when avg rating < 4.2 (competitive pressure is low).
    """
    if avg_price <= 0:
        return None
    discount = 0.12 if avg_rating < 4.0 else 0.10
    return int(avg_price * (1 - discount) / 10) * 10  # round to nearest ₹10


# ── Ollama helpers ────────────────────────────────────────────────────────────

def _ollama_generate(prompt: str, system: str = "") -> Optional[str]:
    """
    Synchronous call to local Ollama llama3.2:3b.
    Returns the model's response text, or None if Ollama is offline/errors.
    """
    try:
        payload: Dict[str, Any] = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,   # low temp = factual, structured output
                "top_p": 0.85,
                "num_predict": 512,
            },
        }
        if system:
            payload["system"] = system

        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(OLLAMA_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()

    except httpx.ConnectError:
        logger.warning("[white_space] Ollama not running — falling back to static AI logic")
        return None
    except Exception as e:
        logger.warning(f"[white_space] Ollama error: {e} — falling back to static AI logic")
        return None


def _parse_json_from_llm(raw: str) -> Optional[Any]:
    """
    LLMs sometimes wrap JSON in markdown fences. Strip and parse safely.
    """
    if not raw:
        return None
    cleaned = raw.strip()
    # Strip ```json ... ``` fences
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find first [ or { and parse from there
        for start_char, end_char in [("[", "]"), ("{", "}")]:
            start = cleaned.find(start_char)
            end = cleaned.rfind(end_char)
            if start != -1 and end != -1 and end > start:
                try:
                    return json.loads(cleaned[start:end + 1])
                except json.JSONDecodeError:
                    continue
    return None


# ── Static fallback AI logic (used when Ollama is offline) ───────────────────

def _static_ai_insights(
    opp_niche: str,
    avg_price: float,
    avg_rating: float,
    avg_reviews: int,
    competitor_count: int,
    trend: str,
    has_best_seller: bool,
) -> List[AIInsight]:
    insights: List[AIInsight] = []

    if avg_rating < 4.0:
        insights.append(AIInsight(
            type="listing_gap",
            headline="Unhappy buyer gap",
            detail=f"Avg rating {avg_rating:.1f}★ — add a 'guaranteed fit' or '30-day return' promise in your listing title to instantly stand out.",
        ))

    if trend == "up":
        insights.append(AIInsight(
            type="trend_alert",
            headline="Trending upward — move fast",
            detail="Sales velocity is growing in this niche. Early mover advantage closes in 4–6 months as competitors notice the gap.",
        ))

    if not has_best_seller:
        insights.append(AIInsight(
            type="quick_win",
            headline="Best Seller badge unclaimed",
            detail=f"No product holds the Best Seller badge in this niche. 50+ reviews and ≥20 daily sales can claim it within 4–6 weeks.",
        ))

    entry = _suggest_entry_price(avg_price, avg_rating)
    if entry:
        insights.append(AIInsight(
            type="entry_price",
            headline=f"Enter at ₹{entry:,} to capture 'Lowest New Price'",
            detail=f"Pricing 10–12% below market avg (₹{int(avg_price):,}) earns the badge and lifts organic click-through.",
        ))

    if avg_reviews < 80:
        insights.append(AIInsight(
            type="quick_win",
            headline="Review barrier is very low",
            detail=f"Only {avg_reviews} avg reviews — reaching the top 3 takes just 40–60 verified reviews, achievable in under 60 days.",
        ))

    return insights[:4]


def _static_market_summary(query: str, opportunities: List[Opportunity]) -> str:
    if not opportunities:
        return f"No strong gaps found for '{query}' — the market may be saturated or data coverage is low."
    top = opportunities[0]
    hot_count = sum(1 for o in opportunities if o.score >= 80)
    avg_rev = sum(o.est_revenue_max for o in opportunities) / len(opportunities)
    lines = [
        f"Scanned {len(opportunities)} niches for '{query}'.",
        f"{hot_count} hot opportunities found (score 80+)." if hot_count else "No dominant hot picks — good gaps exist in the 65–79 range.",
        f"Top pick: '{top.product_niche}' (score {top.score}) — {top.gap_summary[:90]}.",
        f"Average estimated revenue across niches: {_inr(int(avg_rev))}/month.",
    ]
    return " ".join(lines)


# ── Ollama-powered AI insights ────────────────────────────────────────────────

def _build_ai_insights(
    opp_niche: str,
    avg_price: float,
    avg_rating: float,
    avg_reviews: int,
    competitor_count: int,
    trend: str,
    has_best_seller: bool,
) -> List[AIInsight]:
    """
    Ask llama3.2:3b to generate 3–4 strategic insights for this niche.
    Falls back to static logic if Ollama is unavailable.
    """
    entry_price = _suggest_entry_price(avg_price, avg_rating)
    entry_note = f"Suggested entry price: ₹{entry_price:,}" if entry_price else "No clear entry price signal."

    system = (
        "You are a senior Amazon and Flipkart marketplace strategist for India. "
        "You give concise, data-driven insights to new sellers. "
        "Respond ONLY with a valid JSON array — no markdown, no explanation, no preamble. "
        "Each element must have exactly these keys: type, headline, detail. "
        "type must be one of: entry_price, listing_gap, trend_alert, quick_win. "
        "headline must be under 8 words. detail must be 1–2 sentences, specific and actionable."
    )

    prompt = f"""Product niche: {opp_niche}
Market data (India — Amazon.in + Flipkart):
- Average competitor rating: {avg_rating:.1f} / 5
- Average competitor reviews: {avg_reviews}
- Number of competitors: {competitor_count}
- Average selling price: ₹{int(avg_price):,}
- {entry_note}
- Sales trend: {trend}
- Best Seller badge claimed in niche: {"Yes" if has_best_seller else "No"}

Generate exactly 3 strategic insights for a new Indian seller entering this niche.
Return ONLY a JSON array like:
[
  {{"type": "quick_win", "headline": "Short headline here", "detail": "One or two actionable sentences."}},
  ...
]"""

    raw = _ollama_generate(prompt, system=system)
    parsed = _parse_json_from_llm(raw) if raw else None

    # Validate parsed result
    if parsed and isinstance(parsed, list) and len(parsed) >= 1:
        insights: List[AIInsight] = []
        valid_types = {"entry_price", "listing_gap", "trend_alert", "quick_win"}
        for item in parsed[:4]:
            if not isinstance(item, dict):
                continue
            item_type = str(item.get("type", "quick_win"))
            if item_type not in valid_types:
                item_type = "quick_win"
            headline = str(item.get("headline", "")).strip()
            detail = str(item.get("detail", "")).strip()
            if headline and detail:
                insights.append(AIInsight(type=item_type, headline=headline, detail=detail))  # type: ignore[arg-type]
        if insights:
            logger.info(f"[white_space] llama3.2:3b generated {len(insights)} insights for '{opp_niche}'")
            return insights

    # Ollama offline or bad output — use static fallback
    logger.info(f"[white_space] Using static fallback insights for '{opp_niche}'")
    return _static_ai_insights(
        opp_niche, avg_price, avg_rating, avg_reviews,
        competitor_count, trend, has_best_seller,
    )


def _competitor_weakness(row: Dict[str, Any]) -> str:
    rating = float(row.get("product_star_rating_numeric") or row.get("product_star_rating") or 0)
    reviews = int(row.get("product_num_ratings") or row.get("product_rating_count") or 0)
    price = float(row.get("product_price_numeric") or row.get("product_price") or 0)
    is_bs = bool(row.get("is_best_seller"))
    is_ac = bool(row.get("is_amazon_choice"))

    if rating < 3.5:
        return f"Poor rating ({rating:.1f}★) — significant review complaints, easy to out-quality"
    if rating < 3.9:
        return f"Below-average rating ({rating:.1f}★) — room for a better-reviewed alternative"
    if reviews < 50:
        return f"Only {reviews} reviews — no social proof, easy to outrank with 40+ reviews"
    if reviews < 150:
        return f"Thin review base ({reviews} reviews) — outranking requires ~80 reviews"
    if not is_bs and not is_ac:
        return "No Best Seller or Amazon's Choice badge — generic listing, beatable on title/A+"
    if price > 0:
        return f"Priced at ₹{int(price):,} — may be above sweet spot for value-focused buyers"
    return "Established but beatable on listing quality, images, or A+ content"


def _stable_id(niche: str, query: str) -> str:
    return hashlib.md5(f"{niche}:{query}".encode()).hexdigest()[:12]


# ── Ollama-powered market summary ────────────────────────────────────────────

def _build_ai_market_summary(query: str, opportunities: List[Opportunity]) -> str:
    """
    Ask llama3.2:3b to write a concise 2–3 sentence market summary.
    Falls back to static template if Ollama is unavailable.
    """
    if not opportunities:
        return f"No strong gaps found for '{query}' — the market may be saturated or data coverage is low."

    top3 = opportunities[:3]
    hot_count = sum(1 for o in opportunities if o.score >= 80)
    avg_rev = int(sum(o.est_revenue_max for o in opportunities) / len(opportunities))

    niches_summary = "\n".join(
        f"- {o.product_niche}: score {o.score}, avg rating {o.avg_rating:.1f}★, "
        f"{o.competitor_count} competitors, est ₹{int(o.est_revenue_max/1000)}K/mo max revenue"
        for o in top3
    )

    system = (
        "You are a product research analyst for Indian e-commerce sellers. "
        "Write clear, direct market summaries — no fluff, no bullet points. "
        "Respond with 2–3 sentences of plain text only. No JSON, no markdown."
    )

    prompt = f"""A seller searched for '{query}' on Amazon.in and Flipkart.
We found {len(opportunities)} product niches. {hot_count} scored 80+ (hot opportunity).
Average estimated max revenue across niches: ₹{_inr(avg_rev)}/month.

Top niches:
{niches_summary}

Write a 2–3 sentence market summary telling the seller what the data means and what to do next.
Be specific — mention niche names and numbers."""

    raw = _ollama_generate(prompt, system=system)

    if raw and len(raw) > 30:
        # Sanitize: remove any accidental JSON brackets the model might spit out
        cleaned = raw.strip().strip("`").strip()
        if not cleaned.startswith("{") and not cleaned.startswith("["):
            logger.info(f"[white_space] llama3.2:3b generated market summary for '{query}'")
            return cleaned[:500]  # cap length

    logger.info(f"[white_space] Using static fallback market summary for '{query}'")
    return _static_market_summary(query, opportunities)

def _inr(n: int) -> str:
    if n >= 100000:
        return f"{n/100000:.1f}L"
    if n >= 1000:
        return f"{n//1000}K"
    return str(n)


# ── Endpoints ─────────────────────────────────────────────────────────────────

def _count_scans_this_month(user_id: int, db: Session) -> int:
    try:
        row = db.execute(
            text("""
                SELECT COUNT(*) FROM white_space_scans 
                WHERE user_id=:uid AND created_at > NOW() - INTERVAL '30 days'
            """),
            {"uid": user_id}
        ).scalar()
        return int(row or 0)
    except Exception as e:
        logger.error(f"Error counting scans: {e}")
        return 0

@router.get("/usage/{user_id}")
def get_usage(
    user_id: int,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current usage and limits for white space finder"""
    if str(current_user_id) != str(user_id):
        raise HTTPException(403, "Not authorised")
    
    tier = get_user_tier(user_id, db)
    config = _get_tier_config(tier)
    used = _count_scans_this_month(user_id, db)
    
    limit = config["scans_limit"]
    remaining = (limit - used) if limit != 9_999_999 else float("inf")
    
    return {
        "count": used,
        "limit": limit if limit != 9_999_999 else -1,
        "remaining": remaining if remaining != float("inf") else -1,
        "subscription_tier": tier
    }


# ── SQL queries ───────────────────────────────────────────────────────────────

AMAZON_SQL = """
SELECT
    category_name,
    product_title,
    product_price_numeric,
    product_original_price_numeric,
    product_star_rating_numeric,
    product_num_ratings,
    avg_sales_volume,
    min_sales_volume,
    max_sales_volume,
    avg_price,
    min_price,
    max_price,
    is_best_seller,
    is_amazon_choice,
    is_prime,
    asin
FROM rapidapi_amazon_products
WHERE
    (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
    AND (:category IS NULL OR category_name = :category)
    AND product_price_numeric > 0
    AND product_star_rating_numeric IS NOT NULL
ORDER BY avg_sales_volume DESC NULLS LAST
LIMIT 300
"""

FLIPKART_SQL = """
SELECT
    category_name,
    product_title,
    product_price,
    product_mrp,
    product_star_rating,
    product_rating_count,
    product_review_count,
    estimated_sales,
    avg_sales_volume,
    min_sales_volume,
    max_sales_volume,
    avg_price,
    min_price,
    max_price
FROM rapidapi_flipkart_products
WHERE
    (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
    AND (:category IS NULL OR category_name = :category)
    AND product_price > 0
LIMIT 300
"""


# ── Ollama status endpoint ────────────────────────────────────────────────────

@router.get("/ai/status")
def ollama_status():
    """
    Returns Ollama availability and loaded model.
    Frontend uses this to show the live/offline indicator.
    """
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            resp.raise_for_status()
            tags = resp.json()
            models = [m["name"] for m in tags.get("models", [])]
            model_loaded = OLLAMA_MODEL in models or any(OLLAMA_MODEL.split(":")[0] in m for m in models)
            if model_loaded:
                return {"status": "ready", "model": OLLAMA_MODEL, "available_models": models}
            else:
                return {
                    "status": "no_model",
                    "model": OLLAMA_MODEL,
                    "available_models": models,
                    "setup_hint": f"ollama pull {OLLAMA_MODEL}",
                }
    except httpx.ConnectError:
        return {"status": "offline", "model": OLLAMA_MODEL, "setup_hint": "ollama serve"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


# ── Categories endpoint ───────────────────────────────────────────────────────

@router.get("/categories")
def get_categories(platform: str = "both", db: Session = Depends(get_db)):
    try:
        if platform == "amazon":
            res = db.execute(text("""
                SELECT DISTINCT category_name
                FROM rapidapi_amazon_products
                WHERE category_name IS NOT NULL
                ORDER BY category_name
            """))
        elif platform == "flipkart":
            res = db.execute(text("""
                SELECT DISTINCT category_name
                FROM rapidapi_flipkart_products
                WHERE category_name IS NOT NULL
                ORDER BY category_name
            """))
        else:
            res = db.execute(text("""
                SELECT DISTINCT category_name FROM rapidapi_amazon_products WHERE category_name IS NOT NULL
                UNION
                SELECT DISTINCT category_name FROM rapidapi_flipkart_products WHERE category_name IS NOT NULL
                ORDER BY category_name
            """))
        return {"categories": [row[0] for row in res.fetchall()]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import pkg_resources
from symspellpy import SymSpell, Verbosity

_sym_spell = None

def _get_symspell():
    global _sym_spell
    if _sym_spell is None:
        _sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
        try:
            dictionary_path = pkg_resources.resource_filename("symspellpy", "frequency_dictionary_en_82_765.txt")
            _sym_spell.load_dictionary(dictionary_path, term_index=0, count_index=1)
            print("[autocomplete] Loaded SymSpell dictionary.")
        except Exception as e:
            print(f"[autocomplete] Error loading SymSpell dictionary: {e}")
    return _sym_spell


def _clean_title_suggestion(title: str, target_q: str = "") -> str:
    import re
    cleaned = re.sub(r'[^\w\s-]', '', title)
    words = cleaned.split()
    
    if not target_q:
        return " ".join(words[:4]).strip()
        
    target_words = target_q.lower().split()
    target_first = target_words[0] if target_words else ""
    
    start_idx = 0
    for i, w in enumerate(words):
        if target_first in w.lower():
            start_idx = i
            break
            
    extracted = words[start_idx:start_idx+4]
    if not extracted:
        extracted = words[:4]
        
    return " ".join(extracted).strip()


def _correct_query(query: str) -> Optional[str]:
    spell = _get_symspell()
    if not spell:
        return None
    
    try:
        suggestions = spell.lookup_compound(query, max_edit_distance=2, ignore_non_words=True)
        if suggestions:
            corrected = suggestions[0].term
            if corrected.lower() != query.lower():
                return corrected
    except Exception as e:
        print(f"[autocomplete] Error in spelling correction: {e}")
        
    return None


@router.get("/autocomplete")
def autocomplete_suggestions(q: str = "", db: Session = Depends(get_db)):
    if not q or len(q.strip()) < 2:
        return {"suggestions": [], "correction": None}
        
    q_clean = q.strip().lower()
    
    try:
        # Check spelling using global SymSpell dictionary
        corrected_q = _correct_query(q_clean)
        
        correction = None
        target_q = q_clean
        
        if corrected_q and corrected_q != q_clean:
            correction = corrected_q
            target_q = corrected_q
            
        # Query matching suggestions based on the target (original or corrected) query
        like_target = f"%{target_q}%"
        
        # 1. Fetch matching categories (niches)
        res_am_cats = db.execute(text("""
            SELECT DISTINCT category_name 
            FROM rapidapi_amazon_products 
            WHERE category_name IS NOT NULL AND LOWER(category_name) LIKE :like_target
            LIMIT 5
        """), {"like_target": like_target}).fetchall()
        
        res_fk_cats = db.execute(text("""
            SELECT DISTINCT category_name 
            FROM rapidapi_flipkart_products 
            WHERE category_name IS NOT NULL AND LOWER(category_name) LIKE :like_target
            LIMIT 5
        """), {"like_target": like_target}).fetchall()
        
        # 2. Fetch matching product titles for keyword suggestions
        res_am_titles = db.execute(text("""
            SELECT DISTINCT product_title 
            FROM rapidapi_amazon_products 
            WHERE product_title IS NOT NULL AND LOWER(product_title) LIKE :like_target
            LIMIT 5
        """), {"like_target": like_target}).fetchall()
        
        res_fk_titles = db.execute(text("""
            SELECT DISTINCT product_title 
            FROM rapidapi_flipkart_products 
            WHERE product_title IS NOT NULL AND LOWER(product_title) LIKE :like_target
            LIMIT 5
        """), {"like_target": like_target}).fetchall()
        
        suggestions_set = set()
        
        # Add matching categories
        for row in res_am_cats + res_fk_cats:
            if row[0]:
                suggestions_set.add(row[0].strip())
                
        # Add matching cleaned product titles
        for row in res_am_titles + res_fk_titles:
            if row[0]:
                cleaned = _clean_title_suggestion(row[0], target_q)
                if cleaned and cleaned.lower() != q_clean:
                    suggestions_set.add(cleaned)
                    
        suggestions = sorted(list(suggestions_set))
        
        return {
            "suggestions": suggestions[:5],
            "correction": correction
        }
    except Exception as e:
        print(f"[autocomplete] error: {e}")
        return {"suggestions": [], "correction": None}


# ── Main scan endpoint ────────────────────────────────────────────────────────

@router.post("/scan", response_model=ScanResult)
def scan_white_spaces(
    req: ScanRequest,
    db: Session = Depends(get_db),
    user: Optional[Any] = Depends(get_optional_user)
):

    # ── Resolve tier + scan count ──────────────────────────────────────────
    tier = "free"
    scans_used = 0
    
    # Use session user if available
    user_id = str(user.id) if user else None

    if user_id:
        try:
            tier = get_user_tier(user_id, db)
        except Exception:
            tier = "free"
        try:
            row = db.execute(
                text("""
                    SELECT COUNT(*) FROM white_space_scans
                    WHERE user_id = :uid
                    AND created_at > NOW() - INTERVAL '30 days'
                """),
                {"uid": user_id},
            ).scalar()
            scans_used = int(row or 0)
        except Exception:
            scans_used = 0

    cfg = _get_tier_config(tier)
    
    if scans_used >= cfg["scans_limit"]:
        raise HTTPException(status_code=429, detail="Monthly scan limit reached. Upgrade for more scans.")

    # ⚡ Redis Cache Check
    cache_key_raw = f"white_space:scan:{req.query}:{req.category}:{req.platform}:{tier}"
    cache_key = f"white_space:scan:{hashlib.md5(cache_key_raw.encode()).hexdigest()}"
    try:
        cached = r.get(cache_key)
        if cached:
            parsed_cache = json.loads(cached)
            # ── Record scan even on cache hit ──
            if user_id:
                try:
                    db.execute(
                        text("""
                            INSERT INTO white_space_scans (user_id, query, tier, results_count)
                            VALUES (:uid, :q, :t, :rc)
                        """),
                        {"uid": user_id, "q": req.query, "t": tier, "rc": parsed_cache.get("total_found", 0)},
                    )
                    db.commit()
                except Exception:
                    pass
            return parsed_cache
    except Exception as e:
        logger.warning(f"Redis error (get): {e}")

    params = {
        "query": req.query if req.query else None,
        "like_query": f"%{req.query.lower()}%",
        "category": req.category,
    }

    # ── Fetch rows ────────────────────────────────────────────────────────
    amazon_rows: List[Dict] = []
    flipkart_rows: List[Dict] = []

    if req.platform in ("amazon", "both"):
        try:
            res = db.execute(text(AMAZON_SQL), params)
            amazon_rows = [dict(r._mapping) for r in res.fetchall()]
        except Exception as e:
            print(f"[white_space] amazon error: {e}")

    if req.platform in ("flipkart", "both"):
        try:
            res = db.execute(text(FLIPKART_SQL), params)
            flipkart_rows = [dict(r._mapping) for r in res.fetchall()]
        except Exception as e:
            print(f"[white_space] flipkart error: {e}")

    # ── Bucket by category ────────────────────────────────────────────────
    niche_buckets: Dict[str, Dict] = defaultdict(lambda: {"amazon": [], "flipkart": []})
    for row in amazon_rows:
        cat = str(row.get("category_name") or "Uncategorized")
        niche_buckets[cat]["amazon"].append(row)
    for row in flipkart_rows:
        cat = str(row.get("category_name") or "Uncategorized")
        niche_buckets[cat]["flipkart"].append(row)

    # ── Score each niche ──────────────────────────────────────────────────
    opportunities: List[Opportunity] = []

    for niche, bucket in niche_buckets.items():
        all_rows = bucket["amazon"] + bucket["flipkart"]
        if not all_rows:
            continue

        prices = [
            float(r.get("product_price_numeric") or r.get("product_price") or 0)
            for r in all_rows
            if (r.get("product_price_numeric") or r.get("product_price"))
        ]
        mrps = [
            float(r.get("product_original_price_numeric") or r.get("product_mrp") or 0)
            for r in all_rows
        ]
        ratings = [
            float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0)
            for r in all_rows
            if (r.get("product_star_rating_numeric") or r.get("product_star_rating"))
        ]
        reviews_raw = [
            int(r.get("product_num_ratings") or r.get("product_rating_count") or 0)
            for r in all_rows
        ]
        sales_raw = [
            float(r.get("avg_sales_volume") or r.get("estimated_sales") or 0)
            for r in all_rows
        ]

        avg_price = sum(prices) / len(prices) if prices else 0
        avg_mrp = (
            sum(m for m in mrps if m > 0) / max(len([m for m in mrps if m > 0]), 1)
        )
        avg_rating = sum(ratings) / len(ratings) if ratings else 4.0
        avg_reviews = int(sum(reviews_raw) / len(reviews_raw)) if reviews_raw else 0
        avg_sales = sum(sales_raw) / len(sales_raw) if sales_raw else 0
        price_gap_pct = ((avg_mrp - avg_price) / avg_mrp * 100) if avg_mrp > avg_price > 0 else 0
        competitor_count = len(all_rows)

        # Badge analysis
        has_best_seller = any(bool(r.get("is_best_seller")) for r in bucket["amazon"])
        has_amazon_choice = any(bool(r.get("is_amazon_choice")) for r in bucket["amazon"])

        score, breakdown, gap_summary = _compute_score(
            avg_rating, avg_reviews, avg_sales, price_gap_pct,
            competitor_count, has_best_seller, has_amazon_choice,
        )

        # Revenue estimate
        monthly_units_est = max(avg_sales / max(competitor_count, 1), 30)
        rev_min = avg_price * monthly_units_est * 0.5
        rev_max = avg_price * monthly_units_est * 1.3

        # Trend
        trend_dir, trend_pct = _compute_trend(all_rows)

        # Platform
        has_a = len(bucket["amazon"]) > 0
        has_f = len(bucket["flipkart"]) > 0
        platform_str = "both" if (has_a and has_f) else ("amazon" if has_a else "flipkart")

        # Top competitors (worst-rated first = most beatable)
        top_rows = sorted(
            all_rows,
            key=lambda r: float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 5),
        )[:5]
        competitors = [
            Competitor(
                asin=str(r.get("asin") or ""),
                title=str(r.get("product_title") or "")[:80],
                rating=float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0),
                review_count=int(r.get("product_num_ratings") or r.get("product_rating_count") or 0),
                price=float(r.get("product_price_numeric") or r.get("product_price") or 0),
                weakness=_competitor_weakness(r),
                platform="amazon" if r in bucket["amazon"] else "flipkart",
                is_best_seller=bool(r.get("is_best_seller")),
                is_amazon_choice=bool(r.get("is_amazon_choice")),
            )
            for r in top_rows
        ]

        # AI insights are generated AFTER sorting (only for top niches)
        # to avoid calling Ollama for every niche in the loop.
        ai_insights: List[AIInsight] = []

        entry_price = _suggest_entry_price(avg_price, avg_rating)

        top_keyword = f"{niche.lower()} {req.query.lower()}".strip()[:60]
        watchlist_count = 0  # extend: query watchlist table

        opportunities.append(Opportunity(
            id=_stable_id(niche, req.query),
            product_niche=niche,
            score=score,
            gap_summary=gap_summary,
            category=niche,
            platform=platform_str,
            search_volume_estimate=int(avg_sales * 3.5),
            avg_price=round(avg_price, 2),
            avg_rating=round(avg_rating, 2),
            avg_reviews=avg_reviews,
            competitor_count=competitor_count,
            est_revenue_min=round(rev_min, 0),
            est_revenue_max=round(rev_max, 0),
            top_keyword=top_keyword,
            score_breakdown=breakdown,
            competitors=competitors,
            trend_direction=trend_dir,
            trend_pct=trend_pct,
            has_best_seller_gap=not has_best_seller,
            has_amazon_choice_gap=not has_amazon_choice,
            entry_price_suggestion=entry_price,
            ai_insights=ai_insights,
            watchlist_count=watchlist_count,
        ))

    # ── Sort ──────────────────────────────────────────────────────────────
    opportunities.sort(key=lambda o: o.score, reverse=True)
    total_found = len(opportunities)
    visible = opportunities[:cfg["results_visible"]]
    locked_n = max(total_found - len(visible), 0)

    # ── Generate AI insights via Ollama — top 3 visible niches only ───────
    # We call Ollama AFTER sorting so we only process the best opportunities,
    # keeping response time under ~15s even with multiple niches.
    if cfg["ai_insights"]:
        for opp in visible[:3]:
            opp.ai_insights = _build_ai_insights(
                opp.product_niche,
                opp.avg_price,
                opp.avg_rating,
                opp.avg_reviews,
                opp.competitor_count,
                opp.trend_direction,
                not opp.has_best_seller_gap,  # has_best_seller_gap=True means NO badge
            )

    # ── Tier gate: strip fields the tier doesn't expose ───────────────────
    for opp in visible:
        if not cfg["breakdown"]:
            opp.score_breakdown = ScoreBreakdown(rating_gap=0, review_thinness=0, demand_signal=0, price_gap=0)
        if not cfg["competitors"]:
            opp.competitors = []
        if not cfg["trend"]:
            opp.trend_direction = "steady"
            opp.trend_pct = 0
        if not cfg["ai_insights"]:
            opp.ai_insights = []
        if not cfg["entry_price"]:
            opp.entry_price_suggestion = None
        if not cfg["badges"]:
            opp.has_best_seller_gap = False
            opp.has_amazon_choice_gap = False

    # ── AI market summary (Premium) ───────────────────────────────────────
    ai_market_summary: Optional[str] = None
    if cfg["ai_market_summary"] and visible:
        ai_market_summary = _build_ai_market_summary(req.query, visible)

    # ── Record scan ───────────────────────────────────────────────────────
    if user_id:
        try:
            db.execute(
                text("""
                    INSERT INTO white_space_scans (user_id, query, tier, results_count)
                    VALUES (:uid, :q, :t, :rc)
                """),
                {"uid": user_id, "q": req.query, "t": tier, "rc": total_found},
            )
            db.commit()
        except Exception:
            pass

    result = ScanResult(
        query=req.query,
        category=req.category or "all",
        platform=req.platform,
        total_found=total_found,
        tier=tier,
        scans_used=scans_used + 1,
        scans_limit=cfg["scans_limit"],
        opportunities=visible,
        locked_count=locked_n,
        ai_market_summary=ai_market_summary,
    )

    try:
        r.setex(cache_key, 1800, json.dumps(result.dict()))  # 30 min cache
    except Exception as e:
        logger.warning(f"Redis error (set): {e}")

    return result


# ── Watchlist endpoints ───────────────────────────────────────────────────────

@router.post("/watchlist/toggle")
def toggle_watchlist(
    req: WatchlistItemRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Idempotent toggle: if the niche is already in the user's watchlist, remove it.
    Otherwise add it with full metadata. No tier restriction — available to all.
    """
    try:
        existing = db.execute(
            text("SELECT id FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
            {"uid": user_id, "niche": req.niche},
        ).fetchone()

        if existing:
            db.execute(
                text("DELETE FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
                {"uid": user_id, "niche": req.niche},
            )
            db.commit()
            return {"action": "removed", "niche": req.niche}
        else:
            db.execute(
                text("""
                    INSERT INTO white_space_watchlist
                        (user_id, niche, score, category, platform, avg_price, avg_rating,
                         competitor_count, est_revenue_max, top_keyword, gap_summary, query, added_at)
                    VALUES
                        (:uid, :niche, :score, :category, :platform, :avg_price, :avg_rating,
                         :competitor_count, :est_revenue_max, :top_keyword, :gap_summary, :query, NOW())
                    ON CONFLICT (user_id, niche) DO UPDATE SET
                        score = EXCLUDED.score,
                        query = EXCLUDED.query,
                        added_at = NOW()
                """),
                {
                    "uid": user_id,
                    "niche": req.niche,
                    "score": req.score,
                    "category": req.category,
                    "platform": req.platform,
                    "avg_price": req.avg_price,
                    "avg_rating": req.avg_rating,
                    "competitor_count": req.competitor_count,
                    "est_revenue_max": req.est_revenue_max,
                    "top_keyword": req.top_keyword,
                    "gap_summary": req.gap_summary,
                    "query": req.query,
                },
            )
            db.commit()
            return {"action": "added", "niche": req.niche}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    """Fetch all watchlist items for a user, ordered newest first."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    try:
        res = db.execute(
            text("""
                SELECT niche, score, category, platform, avg_price, avg_rating,
                       competitor_count, est_revenue_max, top_keyword, gap_summary,
                       query, added_at
                FROM white_space_watchlist
                WHERE user_id = :uid
                ORDER BY added_at DESC
            """),
            {"uid": user_id},
        )
        return {
            "watchlist": [
                {**dict(r._mapping), "added_at": r._mapping["added_at"].isoformat()}
                for r in res.fetchall()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watchlist/remove")
def remove_from_watchlist(niche: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    """Remove a single niche from a user's watchlist."""
    try:
        db.execute(
            text("DELETE FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
            {"uid": user_id, "niche": niche},
        )
        db.commit()
        return {"action": "removed", "niche": niche}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        existing = db.execute(
            text("SELECT id FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
            {"uid": user_id, "niche": req.niche},
        ).fetchone()

        if existing:
            db.execute(
                text("DELETE FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
                {"uid": user_id, "niche": req.niche},
            )
            db.commit()
            return {"action": "removed", "niche": req.niche}
        else:
            db.execute(
                text("""
                    INSERT INTO white_space_watchlist
                        (user_id, niche, score, category, platform, avg_price, avg_rating,
                         competitor_count, est_revenue_max, top_keyword, gap_summary, query, added_at)
                    VALUES
                        (:uid, :niche, :score, :category, :platform, :avg_price, :avg_rating,
                         :competitor_count, :est_revenue_max, :top_keyword, :gap_summary, :query, NOW())
                    ON CONFLICT (user_id, niche) DO UPDATE SET
                        score = EXCLUDED.score,
                        query = EXCLUDED.query,
                        added_at = NOW()
                """),
                {
                    "uid": user_id,
                    "niche": req.niche,
                    "score": req.score,
                    "category": req.category,
                    "platform": req.platform,
                    "avg_price": req.avg_price,
                    "avg_rating": req.avg_rating,
                    "competitor_count": req.competitor_count,
                    "est_revenue_max": req.est_revenue_max,
                    "top_keyword": req.top_keyword,
                    "gap_summary": req.gap_summary,
                    "query": req.query,
                },
            )
            db.commit()
            return {"action": "added", "niche": req.niche}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    """Fetch all watchlist items for a user, ordered newest first."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    try:
        res = db.execute(
            text("""
                SELECT niche, score, category, platform, avg_price, avg_rating,
                       competitor_count, est_revenue_max, top_keyword, gap_summary,
                       query, added_at
                FROM white_space_watchlist
                WHERE user_id = :uid
                ORDER BY added_at DESC
            """),
            {"uid": user_id},
        )
        return {
            "watchlist": [
                {**dict(r._mapping), "added_at": r._mapping["added_at"].isoformat()}
                for r in res.fetchall()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/watchlist/remove")
def remove_from_watchlist(niche: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    """Remove a single niche from a user's watchlist."""
    try:
        db.execute(
            text("DELETE FROM white_space_watchlist WHERE user_id = :uid AND niche = :niche"),
            {"uid": user_id, "niche": niche},
        )
        db.commit()
        return {"action": "removed", "niche": niche}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))