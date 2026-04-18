from __future__ import annotations

import hashlib
from collections import defaultdict
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.profitability_service import get_user_tier
from app.schemas.white_space_finder_schema import (
    ScanRequest, ScoreBreakdown, Competitor, Opportunity, ScanResult
)

router = APIRouter()

def _get_tier_config(tier: str):
    return {
        "free":    {"scans_limit": 3, "results_visible": 3, "competitors": False, "breakdown": False, "trend": False},
        "basic":   {"scans_limit": 20, "results_visible": 999, "competitors": True, "breakdown": True, "trend": False},
        "premium": {"scans_limit": 99999, "results_visible": 999, "competitors": True, "breakdown": True, "trend": True},
    }.get(tier, {
        "scans_limit": 3,
        "results_visible": 3,
        "competitors": False,
        "breakdown": False,
        "trend": False
    })


def _compute_score(avg_rating, avg_reviews, sales_volume, price_gap_pct, competitor_count):
    rg = 32 if avg_rating < 3.5 else 24 if avg_rating < 4.0 else 14 if avg_rating < 4.3 else 6 if avg_rating < 4.5 else 0
    rt = 32 if avg_reviews < 50 else 24 if avg_reviews < 150 else 16 if avg_reviews < 400 else 8 if avg_reviews < 800 else 0
    ds = 24 if sales_volume > 5000 else 18 if sales_volume > 2000 else 12 if sales_volume > 500 else 6 if sales_volume > 100 else 0
    pg = 12 if 10 <= price_gap_pct <= 30 else 8 if price_gap_pct < 10 else 4
    total = min(rg + rt + ds + pg, 100)

    reasons = []
    if rg >= 24:
        reasons.append(f"average rating of {avg_rating:.1f} — buyers are unsatisfied")
    if rt >= 24:
        reasons.append(f"most listings have under {avg_reviews} reviews — easy to outrank")
    if competitor_count <= 20:
        reasons.append(f"only {competitor_count} active competitors — low crowding")
    gap = "; ".join(reasons) if reasons else "Moderate opportunity based on demand and pricing"
    gap = gap[0].upper() + gap[1:] if gap else gap

    breakdown = ScoreBreakdown(rating_gap=rg, review_thinness=rt, demand_signal=ds, price_gap=pg)
    return total, breakdown, gap


def _weakness(row: Dict[str, Any]) -> str:
    rating = float(row.get("product_star_rating_numeric") or 0)
    reviews = int(row.get("product_num_ratings") or 0)
    if rating < 3.5:
        return f"Poor rating ({rating:.1f}) — lots of negative reviews"
    if rating < 4.0:
        return f"Below-average rating ({rating:.1f})"
    if reviews < 100:
        return f"Only {reviews} reviews — no social proof yet"
    if reviews < 300:
        return f"Thin review base ({reviews} reviews)"
    return "Established but beatable on price or differentiation"


def _stable_id(niche: str, category: str) -> str:
    return hashlib.md5(f"{niche}:{category}".encode()).hexdigest()[:12]


AMAZON_SQL = """
SELECT category_name, product_title, product_price_numeric,
    product_original_price_numeric, product_star_rating_numeric,
    product_num_ratings, avg_sales_volume, avg_price, min_price, max_price
FROM rapidapi_amazon_products
WHERE
    (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
    AND (:category IS NULL OR category_name = :category)
    AND product_price_numeric > 0
    AND product_star_rating_numeric IS NOT NULL
ORDER BY avg_sales_volume DESC NULLS LAST
LIMIT 200
"""

FLIPKART_SQL = """
SELECT category_name, product_title, product_price, product_mrp,
    product_star_rating, product_rating_count, estimated_sales,
    avg_price, min_price, max_price
FROM rapidapi_flipkart_products
WHERE
    (:query IS NULL OR LOWER(product_title) LIKE :like_query OR LOWER(category_name) LIKE :like_query)
    AND (:category IS NULL OR category_name = :category)
    AND product_price > 0
LIMIT 200
"""


# ── Categories endpoint ───────────────────────────────────────────────────────

@router.get("/categories")
def get_categories(platform: str = "both", db: Session = Depends(get_db)):
    try:
        if platform == "amazon":
            res = db.execute(text("""
                SELECT DISTINCT category_name FROM rapidapi_amazon_products
                WHERE category_name IS NOT NULL ORDER BY category_name
            """))
        elif platform == "flipkart":
            res = db.execute(text("""
                SELECT DISTINCT category_name FROM rapidapi_flipkart_products
                WHERE category_name IS NOT NULL ORDER BY category_name
            """))
        else:  # both
            res = db.execute(text("""
                SELECT DISTINCT category_name FROM rapidapi_amazon_products
                WHERE category_name IS NOT NULL
                UNION
                SELECT DISTINCT category_name FROM rapidapi_flipkart_products
                WHERE category_name IS NOT NULL
                ORDER BY category_name
            """))
        cats = [row[0] for row in res.fetchall()]
        return {"categories": cats}
    except Exception as e:
        print(f"[categories error] {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── Main scan endpoint ────────────────────────────────────────────────────────

@router.post("/scan", response_model=ScanResult)
def scan_white_spaces(req: ScanRequest, db: Session = Depends(get_db)):
    tier = "free"
    scans_used = 0
    if req.user_id:
        try:
            tier = get_user_tier(req.user_id, db)
        except Exception:
            tier = "free"
        try:
            row = db.execute(
                text("SELECT COUNT(*) FROM white_space_scans WHERE user_id=:uid AND created_at > NOW() - INTERVAL '30 days'"),
                {"uid": req.user_id},
            ).scalar()
            scans_used = int(row or 0)
        except Exception:
            scans_used = 0

    cfg = _get_tier_config(tier)
    if scans_used >= cfg["scans_limit"]:
        raise HTTPException(status_code=429, detail="Monthly scan limit reached. Upgrade for more scans.")

    like_q = f"%{req.query.lower()}%"
    params = {
        "query":      req.query if req.query else None,
        "like_query": like_q,
        "category":   req.category,
    }

    amazon_rows: List[Dict] = []
    flipkart_rows: List[Dict] = []

    if req.platform in ("amazon", "both"):
        try:
            res = db.execute(text(AMAZON_SQL), params)
            amazon_rows = [dict(r._mapping) for r in res.fetchall()]
        except Exception:
            amazon_rows = []

    if req.platform in ("flipkart", "both"):
        try:
            res = db.execute(text(FLIPKART_SQL), params)
            flipkart_rows = [dict(r._mapping) for r in res.fetchall()]
        except Exception:
            flipkart_rows = []

    niche_buckets: Dict[str, Dict] = defaultdict(lambda: {"rows_amazon": [], "rows_flipkart": []})

    for row in amazon_rows:
        cat = str(row.get("category_name") or "Uncategorized")
        niche_buckets[cat]["rows_amazon"].append(row)

    for row in flipkart_rows:
        cat = str(row.get("category_name") or "Uncategorized")
        niche_buckets[cat]["rows_flipkart"].append(row)

    opportunities: List[Opportunity] = []

    for niche, bucket in niche_buckets.items():
        all_rows = bucket["rows_amazon"] + bucket["rows_flipkart"]
        if not all_rows:
            continue

        prices      = [float(r.get("product_price_numeric") or r.get("product_price") or 0) for r in all_rows if (r.get("product_price_numeric") or r.get("product_price"))]
        mrps        = [float(r.get("product_original_price_numeric") or r.get("product_mrp") or 0) for r in all_rows]
        ratings     = [float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0) for r in all_rows if (r.get("product_star_rating_numeric") or r.get("product_star_rating"))]
        reviews_raw = [int(r.get("product_num_ratings") or r.get("product_rating_count") or 0) for r in all_rows]
        sales_raw   = [float(r.get("avg_sales_volume") or r.get("estimated_sales") or 0) for r in all_rows]

        avg_price  = sum(prices) / len(prices) if prices else 0
        avg_mrp    = sum(m for m in mrps if m > 0) / max(len([m for m in mrps if m > 0]), 1)
        avg_rating = sum(ratings) / len(ratings) if ratings else 4.0
        avg_reviews = int(sum(reviews_raw) / len(reviews_raw)) if reviews_raw else 0
        avg_sales  = sum(sales_raw) / len(sales_raw) if sales_raw else 0
        price_gap_pct = ((avg_mrp - avg_price) / avg_mrp * 100) if avg_mrp > avg_price > 0 else 0
        competitor_count = len(all_rows)

        score, breakdown, gap_summary = _compute_score(avg_rating, avg_reviews, avg_sales, price_gap_pct, competitor_count)

        monthly_units_est = max(avg_sales / max(competitor_count, 1), 50)
        rev_min = avg_price * monthly_units_est * 0.6
        rev_max = avg_price * monthly_units_est * 1.2
        top_keyword = f"{niche.lower()} {req.query.lower()}".strip()
        trend_dir = "up" if score >= 75 else ("down" if score < 50 else "steady")
        trend_pct = 12 if trend_dir == "up" else (8 if trend_dir == "down" else 0)

        has_amazon   = len(bucket["rows_amazon"]) > 0
        has_flipkart = len(bucket["rows_flipkart"]) > 0
        platform_str = "both" if (has_amazon and has_flipkart) else ("amazon" if has_amazon else "flipkart")

        top_rows = sorted(
    all_rows,
    key=lambda r: float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 5),
    reverse=True
)[:5]
        competitors = [
            Competitor(
                title=str(r.get("product_title") or "")[:80],
                rating=float(r.get("product_star_rating_numeric") or r.get("product_star_rating") or 0),
                review_count=int(r.get("product_num_ratings") or r.get("product_rating_count") or 0),
                price=float(r.get("product_price_numeric") or r.get("product_price") or 0),
                weakness=_weakness(r),
                platform="amazon" if r in bucket["rows_amazon"] else "flipkart",
            )
            for r in top_rows
        ]

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
            top_keyword=top_keyword[:60],
            score_breakdown=breakdown,
            competitors=competitors,
            trend_direction=trend_dir,
            trend_pct=trend_pct,
        ))

    opportunities.sort(key=lambda o: o.score, reverse=True)
    total_found = len(opportunities)
    visible = opportunities[:cfg["results_visible"]]
    locked_n = max(total_found - len(visible), 0)

    for opp in visible:
        if not cfg["breakdown"]:
            opp.score_breakdown = ScoreBreakdown(rating_gap=0, review_thinness=0, demand_signal=0, price_gap=0)
        if not cfg["competitors"]:
            opp.competitors = []
        if not cfg["trend"]:
            opp.trend_direction = "steady"
            opp.trend_pct = 0

    if req.user_id:
        try:
            db.execute(
                text("INSERT INTO white_space_scans (user_id, query, tier) VALUES (:uid, :q, :t)"),
                {"uid": req.user_id, "q": req.query, "t": tier},
            )
            db.commit()
        except Exception:
            pass

    return ScanResult(
        query=req.query,
        category=req.category or "all",
        platform=req.platform,
        total_found=total_found,
        tier=tier,
        scans_used=scans_used + 1,
        scans_limit=cfg["scans_limit"],
        opportunities=visible,
        locked_count=locked_n,
    )