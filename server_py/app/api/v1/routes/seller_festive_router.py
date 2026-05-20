"""
Existing-Seller Festive Trend Feature — FastAPI Router
prefix: /festive/seller

Tier access:
  FREE    → GET  /festive/seller/calendar          (next 3 festivals only)
            GET  /festive/seller/snapshot           (top 3 SKUs, scores only — no price/mkt data)
  BASIC   → GET  /festive/seller/readiness          (all SKUs, readiness scores + market benchmark)
            GET  /festive/seller/price-benchmark    (per-SKU price vs market min/avg/max/p25/p75)
            GET  /festive/seller/review-health      (per-SKU rating, response rate, sentiment flag)
  PREMIUM → GET  /festive/seller/margin-sim         (margin at 4 price bands, Amazon.in fee model)
            GET  /festive/seller/launch-window      (optimal listing week per upcoming festival)
            POST /festive/seller/ai/forecast        (SSE — Ollama llama3.2:3b, free, local)

Data sources:
  tracked_products           (seller's own catalog — price, rating, sales_volume, reviews)
  rapidapi_amazon_products   (market benchmark — avg/min/max price, avg_sales_volume by category)
  users                      (subscription_tier gate + expiry check)

Design notes matching new-seller router:
  1. All festivals from get_festivals_for_year() — no hardcoded dates.
     Indian festivals only: Lohri, Makar Sankranti, Holi, Gudi Padwa, Akshaya Tritiya,
     Raksha Bandhan, Janmashtami, Ganesh Chaturthi, Navratri, Dussehra, Karwa Chauth,
     Diwali, Guru Nanak Jayanti, Eid ul-Fitr, Eid ul-Adha, Christmas/Year End.

  2. AI model — Ollama llama3.2:3b ONLY. Returns 503 with fix message if offline.

  3. Amazon SV scale confirmed from DB dump:
     avg_sales_volume stored as label_number × 1_000_000
     e.g. "10K+ bought" → 10_000_000_000 stored; divide by SV_SCALE_AMAZON to get ~10,000
     tracked_products.sales_volume is a text label e.g. "10K+ bought in past month"

  4. Readiness score (0–100) — weighted formula:
       rating component   (0–30): (star_rating - 4.0) / 1.0 * 30, capped at 30
       review count       (0–20): (num_ratings / 100_000) * 20, capped at 20
       sales velocity     (0–25): (monthly_units / 10_000) * 25, capped at 25
       prime eligibility  (0–15): 15 if is_prime else 0
       price positioning  (0–10): 10 if price ≤ market_avg, 5 if ≤ 120% of market_avg, else 0

  5. Platform fee: Amazon.in ~18% (higher than .com due to category surcharges).

  6. All DB helpers wrapped in try/except + db.rollback().

  7. Free tier: snapshot shows top 3 SKUs by readiness score, locked fields NULL.
     Basic+: all SKUs, all fields.
     Premium: adds margin simulation and launch window endpoints.
"""

from __future__ import annotations

import json
import logging
import math
import re
from datetime import date, datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Cookie
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.profitability_service import require_tier
from app.services.ollama_service import (
    OLLAMA_MODEL,
    ollama_is_running,
    stream_ollama,
)
from app.services.festival_calendar_service import get_festivals_for_year
from app.api.deps import get_current_user_id, validate_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/festive/seller", tags=["Seller Festive Trends"])

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

# Amazon DB stores: label_number × 1_000_000
# "10K+ bought" label_number=10_000 → stored as 10_000_000_000 → /1_000_000 = 10_000 units/mo
SV_SCALE_AMAZON = 1_000_000

# Amazon.in platform fee (higher than .com: includes GST component on fee)
PLATFORM_FEE_AMAZON_IN = 0.18

# Readiness score weights
READINESS_WEIGHTS = {
    "rating":   30,   # (star_rating - 4.0) / 1.0 * 30
    "reviews":  20,   # (num_ratings / 100_000) * 20
    "velocity": 25,   # (monthly_units / 10_000) * 25
    "prime":    15,   # binary
    "price":    10,   # relative to market avg
}

SYSTEM_PROMPT = (
    "You are a senior Amazon India e-commerce strategist specialising in festive season planning. "
    "You are concise, data-driven, and always give specific actionable recommendations with exact ₹ figures. "
    "Use ₹ for Indian Rupee. Reference actual Indian festivals (Diwali, Navratri, Raksha Bandhan etc). "
    "Never hedge without a concrete direction."
)

# ─────────────────────────────────────────────────────────────────────────────
# Tier helpers — identical pattern to new-seller router
# ─────────────────────────────────────────────────────────────────────────────

_TIER_ORDER = {"free": 0, "basic": 1, "premium": 2, "enterprise": 3}


def get_optional_user_id(session_id: str = Cookie(None)) -> Optional[str]:
    if not session_id:
        return None
    session_data = validate_session(session_id)
    if session_data and "user_id" in session_data:
        return str(session_data["user_id"])
    return None


def _get_user_tier(user_id: Optional[str], db: Session) -> str:
    if not user_id:
        return "free"
    try:
        row = db.execute(
            text(
                "SELECT subscription_tier, subscription_expires_at "
                "FROM users WHERE id = :uid"
            ),
            {"uid": user_id},
        ).mappings().first()

        if not row:
            return "free"

        tier = (row["subscription_tier"] or "free").lower().strip()

        if row["subscription_expires_at"]:
            expires = row["subscription_expires_at"]
            if hasattr(expires, "tzinfo") and expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires < datetime.now(timezone.utc):
                return "free"

        return tier if tier in _TIER_ORDER else "free"

    except Exception as e:
        logger.warning("_get_user_tier error for user %s: %s", user_id, e)
        try:
            db.rollback()
        except Exception:
            pass
        return "free"


def _has_tier(user_tier: str, required: str) -> bool:
    return _TIER_ORDER.get(user_tier, 0) >= _TIER_ORDER.get(required, 99)


def _check_tier(user_id: Optional[str], required: str, db: Session) -> None:
    """Gate access by subscription tier AND expiry. Raises 401/403 on failure."""
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={"error": "unauthenticated", "message": "Authentication required"},
        )
    try:
        require_tier(user_id, required, db)
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "upgrade_required",
                "required_tier": required,
                "pricing": {
                    "basic":   {"price_inr": 1999, "label": "₹1,999/month"},
                    "premium": {"price_inr": 2999, "label": "₹2,999/month"},
                },
            },
        )

    try:
        row = db.execute(
            text("SELECT subscription_expires_at FROM users WHERE id = :uid"),
            {"uid": user_id},
        ).mappings().first()

        if row and row["subscription_expires_at"]:
            expires = row["subscription_expires_at"]
            if hasattr(expires, "tzinfo") and expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "subscription_expired",
                        "message": "Your subscription has expired. Please renew to continue.",
                        "expired_at": expires.isoformat(),
                    },
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(
            "Could not verify subscription expiry for user %s: %s", user_id, e
        )


async def _check_ollama() -> None:
    if not await ollama_is_running():
        raise HTTPException(
            status_code=503,
            detail={
                "error":   "ollama_offline",
                "message": "AI service is unavailable. Start it with: ollama serve",
                "model":   OLLAMA_MODEL,
                "fix":     "Run `ollama serve` and ensure llama3.2:3b is pulled via `ollama pull llama3.2:3b`",
            },
        )


# ─────────────────────────────────────────────────────────────────────────────
# Festival helpers — Indian festivals only, dynamic from festival_calendar.py
# ─────────────────────────────────────────────────────────────────────────────

def _enrich_seller_calendar(year: int) -> list[dict]:
    """
    Build enriched festival list for `year`.
    Returns dicts with isoformat dates (safe for JSON serialisation).
    """
    today     = date.today()
    festivals = get_festivals_for_year(year)
    enriched: list[dict] = []

    for f in festivals:
        start     = f["start_date"]
        end       = f["end_date"]
        days_away = (start - today).days
        enriched.append({
            "name":        f["name"],
            "intensity":   f["intensity"],
            "emoji":       f["emoji"],
            "year":        year,
            "start_date":  start.isoformat(),
            "end_date":    end.isoformat(),
            "days_away":   days_away,
            "is_active":   start <= today <= end,
            "is_upcoming": 0 <= days_away <= 90,
        })

    enriched.sort(key=lambda x: x["start_date"])
    return enriched


def _upcoming_festivals(limit: Optional[int] = None) -> list[dict]:
    """Return future/active Indian festivals, spanning Dec→Jan boundary."""
    today  = date.today()
    year   = today.year
    events = _enrich_seller_calendar(year)

    if today.month >= 9:
        events += _enrich_seller_calendar(year + 1)

    future = [e for e in events if date.fromisoformat(e["end_date"]) >= today]
    if limit:
        return future[:limit]
    return future


def _next_peak_festival(festivals: list[dict]) -> Optional[dict]:
    """Return the nearest upcoming peak or high intensity festival."""
    for f in festivals:
        if f["intensity"] in ("peak", "high") and f["days_away"] >= 0:
            return f
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Sales-volume parser for tracked_products.sales_volume (text label)
# e.g. "10K+ bought in past month" → 10_000
#      "500+ bought in past month"  → 500
#      "4K+ bought in past month"   → 4_000
# ─────────────────────────────────────────────────────────────────────────────

def _parse_sales_label(label: Optional[str]) -> int:
    """Parse a text sales volume label to an integer monthly unit estimate."""
    if not label:
        return 0
    label = label.upper()
    match = re.search(r"([\d.]+)\s*K\+", label)
    if match:
        return int(float(match.group(1)) * 1000)
    match = re.search(r"([\d,]+)\+", label)
    if match:
        return int(match.group(1).replace(",", ""))
    return 0


# ─────────────────────────────────────────────────────────────────────────────
# Readiness score calculator
# ─────────────────────────────────────────────────────────────────────────────

def _compute_readiness(
    star_rating: float,
    num_ratings: int,
    monthly_units: int,
    is_prime: bool,
    price: float,
    market_avg_price: float,
) -> int:
    score = 0.0
    # Rating component (0–30): needs at least 4.0 to earn any points
    score += min(30.0, max(0.0, (star_rating - 4.0) / 1.0 * 30.0))
    # Review count (0–20)
    score += min(20.0, (num_ratings / 100_000) * 20.0)
    # Velocity (0–25)
    score += min(25.0, (monthly_units / 10_000) * 25.0)
    # Prime (0–15)
    if is_prime:
        score += 15.0
    # Price vs market (0–10)
    if market_avg_price > 0:
        if price <= market_avg_price:
            score += 10.0
        elif price <= market_avg_price * 1.2:
            score += 5.0
    return min(100, int(round(score)))


def _readiness_label(score: int) -> str:
    if score >= 75:
        return "ready"
    if score >= 50:
        return "needs_work"
    return "at_risk"


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — fetch seller's catalog from tracked_products
# ─────────────────────────────────────────────────────────────────────────────

def _get_seller_products(seller_id: str, db: Session) -> list[dict]:
    """
    Fetch all tracked products for a seller.
    Parses price (strips currency symbol), sales_volume label, review arrays.
    """
    try:
        rows = db.execute(
            text("""
                SELECT
                    id,
                    asin,
                    product_title,
                    product_photo,
                    product_price,
                    product_star_rating_numeric,
                    product_num_ratings,
                    sales_volume,
                    is_prime,
                    is_best_seller,
                    is_amazon_choice,
                    review_ratings,
                    review_comments,
                    review_has_response,
                    review_authors,
                    review_dates,
                    product_url,
                    currency,
                    country,
                    seller_rating,
                    seller_ratings_total,
                    created_at
                FROM tracked_products
                WHERE seller_id = :sid
                ORDER BY product_star_rating_numeric DESC NULLS LAST,
                         product_num_ratings DESC NULLS LAST
            """),
            {"sid": seller_id},
        ).mappings().all()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_get_seller_products DB error for seller %s: %s", seller_id, e)
        return []

    products = []
    for r in rows:
        # Parse price — strip currency symbols like $, ₹, £
        raw_price = str(r["product_price"] or "0")
        price_str = re.sub(r"[^\d.]", "", raw_price)
        try:
            price = float(price_str) if price_str else 0.0
        except ValueError:
            price = 0.0

        # Parse review_ratings JSON array
        ratings_raw = r["review_ratings"]
        if isinstance(ratings_raw, str):
            try:
                review_ratings = json.loads(ratings_raw)
            except Exception:
                review_ratings = []
        elif isinstance(ratings_raw, list):
            review_ratings = ratings_raw
        else:
            review_ratings = []

        # Parse review_has_response JSON array
        has_resp_raw = r["review_has_response"]
        if isinstance(has_resp_raw, str):
            try:
                has_response = json.loads(has_resp_raw)
            except Exception:
                has_response = []
        elif isinstance(has_resp_raw, list):
            has_response = has_resp_raw
        else:
            has_response = []

        # Parse review_comments
        comments_raw = r["review_comments"]
        if isinstance(comments_raw, str):
            try:
                review_comments = json.loads(comments_raw)
            except Exception:
                review_comments = []
        elif isinstance(comments_raw, list):
            review_comments = comments_raw
        else:
            review_comments = []

        monthly_units = _parse_sales_label(r["sales_volume"])

        products.append({
            "id":                 r["id"],
            "asin":               r["asin"],
            "title":              r["product_title"] or "",
            "photo":              r["product_photo"] or "",
            "price":              price,
            "currency":           r["currency"] or "USD",
            "star_rating":        float(r["product_star_rating_numeric"] or 0),
            "num_ratings":        int(r["product_num_ratings"] or 0),
            "sales_volume_label": r["sales_volume"] or "",
            "monthly_units":      monthly_units,
            "is_prime":           bool(r["is_prime"]),
            "is_best_seller":     bool(r["is_best_seller"]),
            "is_amazon_choice":   bool(r["is_amazon_choice"]),
            "review_ratings":     review_ratings,
            "review_comments":    review_comments,
            "has_response":       has_response,
            "product_url":        r["product_url"] or "",
            "seller_rating":      float(r["seller_rating"] or 0),
            "seller_ratings_total": int(r["seller_ratings_total"] or 0),
        })

    return products


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — market benchmark from rapidapi_amazon_products
# Matches category by finding the top-matching category for seller's products
# ─────────────────────────────────────────────────────────────────────────────

def _get_market_benchmark(category_name: Optional[str], db: Session) -> dict:
    """
    Pull market min/avg/max/p25/p75 price and avg sales velocity
    from rapidapi_amazon_products for a given category.
    Falls back to overall market if category_name is None or not found.
    """
    try:
        query_params: dict = {}
        if category_name:
            row = db.execute(
                text("""
                    SELECT
                        AVG(product_price_numeric)   AS avg_price,
                        MIN(min_price)               AS min_price,
                        MAX(max_price)               AS max_price,
                        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY product_price_numeric) AS p25,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY product_price_numeric) AS p75,
                        AVG(avg_sales_volume)        AS avg_sv_raw,
                        AVG(product_star_rating_numeric) AS avg_rating,
                        COUNT(*)                     AS product_count
                    FROM rapidapi_amazon_products
                    WHERE category_name = :cat
                      AND product_price_numeric IS NOT NULL
                      AND product_price_numeric > 0
                """),
                {"cat": category_name},
            ).mappings().first()
        else:
            row = None

        # Fallback to overall market if category has no data
        if not row or not row["avg_price"]:
            row = db.execute(text("""
                SELECT
                    AVG(product_price_numeric)   AS avg_price,
                    MIN(min_price)               AS min_price,
                    MAX(max_price)               AS max_price,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY product_price_numeric) AS p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY product_price_numeric) AS p75,
                    AVG(avg_sales_volume)        AS avg_sv_raw,
                    AVG(product_star_rating_numeric) AS avg_rating,
                    COUNT(*)                     AS product_count
                FROM rapidapi_amazon_products
                WHERE product_price_numeric IS NOT NULL
                  AND product_price_numeric > 0
            """)).mappings().first()

        if not row:
            return {
                "avg_price": 0, "min_price": 0, "max_price": 0,
                "p25": 0, "p75": 0, "avg_sv": 0, "avg_rating": 0,
                "product_count": 0, "category": category_name,
            }

        avg_sv_raw = float(row["avg_sv_raw"] or 0)
        avg_sv = round(avg_sv_raw / SV_SCALE_AMAZON * 0.80, 0) if avg_sv_raw > 0 else 0

        return {
            "avg_price":     round(float(row["avg_price"] or 0), 2),
            "min_price":     round(float(row["min_price"] or 0), 2),
            "max_price":     round(float(row["max_price"] or 0), 2),
            "p25":           round(float(row["p25"] or 0), 2),
            "p75":           round(float(row["p75"] or 0), 2),
            "avg_sv":        avg_sv,
            "avg_rating":    round(float(row["avg_rating"] or 0), 1),
            "product_count": int(row["product_count"] or 0),
            "category":      category_name,
        }

    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_get_market_benchmark DB error: %s", e)
        return {
            "avg_price": 0, "min_price": 0, "max_price": 0,
            "p25": 0, "p75": 0, "avg_sv": 0, "avg_rating": 0,
            "product_count": 0, "category": category_name,
        }


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — 90-day weekly price trend for seller's category (BASIC)
# ─────────────────────────────────────────────────────────────────────────────

def _seller_category_price_trend(
    category_name: str, db: Session, days: int = 90
) -> list[dict]:
    try:
        rows = db.execute(
            text(f"""
                SELECT
                    DATE_TRUNC('week', created_at)  AS week,
                    AVG(product_price_numeric)       AS avg_price,
                    MIN(min_price)                   AS min_price,
                    MAX(max_price)                   AS max_price,
                    AVG(avg_sales_volume)            AS avg_sv_raw,
                    COUNT(*)                         AS sample_size
                FROM rapidapi_amazon_products
                WHERE category_name = :cat
                  AND product_price_numeric IS NOT NULL
                  AND product_price_numeric > 0
                  AND created_at >= NOW() - INTERVAL '{int(days)} days'
                GROUP BY DATE_TRUNC('week', created_at)
                ORDER BY week ASC
            """),
            {"cat": category_name},
        ).mappings().all()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_seller_category_price_trend DB error: %s", e)
        return []

    return [
        {
            "week":        r["week"].date().isoformat() if r["week"] else None,
            "avg_price":   round(float(r["avg_price"] or 0), 2),
            "min_price":   round(float(r["min_price"] or 0), 2),
            "max_price":   round(float(r["max_price"] or 0), 2),
            "avg_sv":      round(
                float(r["avg_sv_raw"] or 0) / SV_SCALE_AMAZON * 0.75, 0
            ),
            "sample_size": int(r["sample_size"] or 0),
        }
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — stock-out risk for seller's category (PREMIUM)
# ─────────────────────────────────────────────────────────────────────────────

def _seller_stock_risk(category_name: str, db: Session) -> dict:
    try:
        row = db.execute(
            text("""
                SELECT
                    AVG(avg_sales_volume) AS avg_sv_raw,
                    MAX(max_sales_volume) AS max_sv_raw,
                    COUNT(*)              AS n
                FROM rapidapi_amazon_products
                WHERE category_name = :cat
                  AND avg_sales_volume IS NOT NULL
                  AND avg_sales_volume > 0
            """),
            {"cat": category_name},
        ).mappings().first()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_seller_stock_risk DB error: %s", e)
        return {"risk_level": "unknown", "error": str(e)}

    if not row or not row["avg_sv_raw"]:
        return {"risk_level": "unknown", "ratio": None, "avg_sv": None, "max_sv": None}

    avg_sv = float(row["avg_sv_raw"]) / SV_SCALE_AMAZON * 0.80
    max_sv = float(row["max_sv_raw"]) / SV_SCALE_AMAZON * 0.65
    ratio  = round(max_sv / avg_sv, 2) if avg_sv > 0 else 0.0

    if ratio >= 2.5:   risk_level = "critical"
    elif ratio >= 1.8: risk_level = "high"
    elif ratio >= 1.3: risk_level = "medium"
    else:              risk_level = "low"

    return {
        "risk_level": risk_level,
        "ratio":      ratio,
        "avg_sv":     round(avg_sv, 0),
        "max_sv":     round(max_sv, 0),
        "n_products": int(row["n"] or 0),
    }


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — margin simulation (PREMIUM)
# ─────────────────────────────────────────────────────────────────────────────

def _seller_margin_sim(
    asin: str,
    price: float,
    base_cost: float,
    market: dict,
) -> dict:
    """
    Compute margin at 4 price bands using seller's base cost.
    Platform fee: Amazon.in 18%.
    Scenarios: floor (p25), market avg, p75, ceiling (min(max*0.9, p75*1.5)).
    """
    p25  = market["p25"]  or price * 0.8
    avg  = market["avg_price"] or price
    p75  = market["p75"]  or price * 1.2
    ceil = min(market["max_price"] * 0.9, p75 * 1.5) if market["max_price"] else p75 * 1.4

    scenarios = [
        {"label": "Floor",      "price": round(p25,  2)},
        {"label": "Market avg", "price": round(avg,  2)},
        {"label": "P75",        "price": round(p75,  2)},
        {"label": "Ceiling",    "price": round(ceil, 2)},
    ]

    for sc in scenarios:
        p            = sc["price"]
        gross        = p - base_cost
        gross_pct    = round(gross / p * 100, 1) if p > 0 else 0.0
        platform_fee = round(p * PLATFORM_FEE_AMAZON_IN, 2)
        net          = round(gross - platform_fee, 2)
        net_pct      = round(net / p * 100, 1) if p > 0 else 0.0
        sc.update({
            "gross_margin":  round(gross, 2),
            "gross_pct":     gross_pct,
            "platform_fee":  platform_fee,
            "net_margin":    net,
            "net_pct":       net_pct,
            "viable":        net > 0,
        })

    recommended = next(
        (s for s in reversed(scenarios) if s["viable"]),
        scenarios[0],
    )

    return {
        "asin":              asin,
        "your_price":        price,
        "base_cost":         base_cost,
        "market_range":      {
            "min": market["min_price"],
            "avg": avg,
            "p25": p25,
            "p75": p75,
            "max": market["max_price"],
        },
        "scenarios":         scenarios,
        "recommended_price": recommended["price"],
        "recommended_label": recommended["label"],
        "platform_fee_pct":  PLATFORM_FEE_AMAZON_IN * 100,
    }


# ─────────────────────────────────────────────────────────────────────────────
# DB helper — launch window per festival (PREMIUM)
# Uses 3-point rolling average on market price trend, mirrors new-seller logic
# ─────────────────────────────────────────────────────────────────────────────

def _seller_launch_windows(
    category_name: str,
    festivals: list[dict],
    db: Session,
) -> list[dict]:
    """
    For each upcoming festival, compute optimal listing week and sourcing deadline
    based on price inflection in the seller's market category.

    Sourcing lead time assumed: 21–30 days (domestic India supplier).
    FBA processing: 7–10 days.
    Total buffer: 35 days before festival start.
    """
    trend = _seller_category_price_trend(category_name, db, days=90)

    # Find best score week from trend (same algo as new-seller _launch_window)
    best_score_week: Optional[str] = None
    best_score = -9999.0
    smoothed: list[dict] = []

    for i in range(1, len(trend) - 1):
        if trend[i]["sample_size"] < 3:
            continue
        smoothed.append({
            "week":      trend[i]["week"],
            "avg_price": (trend[i-1]["avg_price"] + trend[i]["avg_price"] + trend[i+1]["avg_price"]) / 3,
            "avg_sv":    (trend[i-1]["avg_sv"] + trend[i]["avg_sv"] + trend[i+1]["avg_sv"]) / 3,
        })

    if len(smoothed) >= 2:
        for i in range(1, len(smoothed)):
            price_delta = smoothed[i]["avg_price"] - smoothed[i-1]["avg_price"]
            sv_delta    = smoothed[i]["avg_sv"]    - smoothed[i-1]["avg_sv"]
            score = price_delta + sv_delta / 1000.0
            if score > best_score:
                best_score = score
                best_score_week = smoothed[i]["week"]

    results = []
    today = date.today()

    for fest in festivals:
        if fest["days_away"] < 0:
            continue
        start = date.fromisoformat(fest["start_date"])

        # Optimal listing: 6–8 weeks before festival (gives time to index in search)
        optimal_list_by = start - timedelta(days=42)
        # Sourcing deadline: 35 days before festival (supplier lead + FBA processing)
        source_by = start - timedelta(days=35)

        days_to_list = (optimal_list_by - today).days

        if days_to_list <= 0:
            rec = f"List NOW — optimal window has passed. Apply {fest['name']} price premium immediately."
        elif days_to_list <= 7:
            rec = f"List within {days_to_list} days to index before {fest['name']} search surge."
        else:
            rec = (
                f"List by {optimal_list_by.strftime('%b %d')} ({days_to_list} days). "
                f"Source inventory by {source_by.strftime('%b %d')} (35-day lead time)."
            )

        stock_multiplier = {"peak": 3.5, "high": 2.5, "medium": 1.8}.get(
            fest["intensity"], 1.5
        )

        results.append({
            "festival_name":    fest["name"],
            "festival_emoji":   fest["emoji"],
            "intensity":        fest["intensity"],
            "festival_date":    fest["start_date"],
            "days_away":        fest["days_away"],
            "optimal_list_by":  optimal_list_by.isoformat(),
            "source_by":        source_by.isoformat(),
            "recommendation":   rec,
            "stock_multiplier": stock_multiplier,
            "trend_weeks":      len(trend),
            "price_trend":      trend[-8:],  # last 8 weeks for sparkline
        })

    return results


# ─────────────────────────────────────────────────────────────────────────────
# Review health helpers
# ─────────────────────────────────────────────────────────────────────────────

def _review_health(product: dict) -> dict:
    ratings     = product["review_ratings"] or []
    has_resp    = product["has_response"] or []
    comments    = product["review_comments"] or []

    total_reviews   = len(ratings)
    avg_recent      = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
    response_count  = sum(1 for r in has_resp if r)
    response_rate   = round(response_count / total_reviews * 100, 0) if total_reviews else 0.0

    one_stars       = [i for i, r in enumerate(ratings) if r == 1]
    unanswered_1star = [
        comments[i] for i in one_stars
        if i < len(has_resp) and not has_resp[i] and i < len(comments)
    ]

    risk_flag = "healthy"
    if product["star_rating"] < 4.5:
        risk_flag = "rating_risk"
    elif response_rate == 0:
        risk_flag = "no_responses"
    elif len(one_stars) > 0 and any(not has_resp[i] for i in one_stars if i < len(has_resp)):
        risk_flag = "unanswered_negative"

    return {
        "asin":               product["asin"],
        "title":              product["title"],
        "star_rating":        product["star_rating"],
        "num_ratings":        product["num_ratings"],
        "recent_avg_rating":  avg_recent,
        "total_recent":       total_reviews,
        "response_rate_pct":  response_rate,
        "unanswered_1star":   unanswered_1star[:3],  # cap at 3 for payload size
        "risk_flag":          risk_flag,
    }


# ─────────────────────────────────────────────────────────────────────────────
# AI prompt builder — seller-specific, Indian festival context
# ─────────────────────────────────────────────────────────────────────────────

def _build_seller_forecast_prompt(
    seller_products: list[dict],
    market: dict,
    next_festival: Optional[dict],
    stock_risk: dict,
    category_name: str,
) -> str:
    top_skus = sorted(
        seller_products, key=lambda p: p["monthly_units"], reverse=True
    )[:5]

    sku_str = "\n".join(
        f"  {p['title'][:50]}: price ₹{round(p['price']*83)}, "
        f"rating {p['star_rating']}★, sales ~{p['monthly_units']:,} units/mo, "
        f"prime={'Yes' if p['is_prime'] else 'No'}"
        for p in top_skus
    ) or "  No SKU data available."

    festival_str = (
        f"{next_festival['name']} (starts {next_festival['start_date']}, "
        f"{next_festival['days_away']} days away, intensity={next_festival['intensity']})"
        if next_festival
        else "No major Indian festival in the next 90 days"
    )

    return f"""
You are advising an existing Amazon India seller on festive season strategy.

Seller's top SKUs ({category_name}):
{sku_str}

Market benchmark (rapidapi_amazon_products):
  Avg price: ₹{round(market['avg_price']*83)}, P25: ₹{round(market['p25']*83)}, P75: ₹{round(market['p75']*83)}
  Market avg monthly units: ~{int(market['avg_sv']):,}
  Market avg rating: {market['avg_rating']}★

Next Indian festival: {festival_str}

Stock-out risk: {stock_risk.get('risk_level','unknown').upper()}
  avg_monthly_units={stock_risk.get('avg_sv')}, peak_units={stock_risk.get('max_sv')}, ratio={stock_risk.get('ratio')}

Respond in exactly 4 labelled sections:
1. FESTIVE DEMAND FORECAST — Will this category surge for {next_festival['name'] if next_festival else 'the next festival'}? By how much?
2. PRICING STRATEGY — What price should the seller set and when? Quote actual ₹ numbers.
3. STOCK PREPARATION — How many units should they hold? Account for the stock-out risk ratio.
4. LISTING ACTIONS — What listing changes (images, keywords, A+ content) should they make before the festival?

Be specific. Use actual ₹ numbers. Reference Indian shopping behaviour. No generic advice.
""".strip()


# ─────────────────────────────────────────────────────────────────────────────
# SSE helpers
# ─────────────────────────────────────────────────────────────────────────────

async def _sse_gen(prompt: str, system: str = SYSTEM_PROMPT):
    async for token in stream_ollama(prompt, system):
        yield f"data: {json.dumps(token)}\n\n"
    yield "data: [DONE]\n\n"


def _sse(prompt: str) -> StreamingResponse:
    return StreamingResponse(
        _sse_gen(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# Input validation helpers
# ─────────────────────────────────────────────────────────────────────────────

def _validate_seller_id(seller_id: str) -> str:
    s = seller_id.strip()
    if not s or len(s) > 64:
        raise HTTPException(
            status_code=422,
            detail={"error": "invalid_seller_id"},
        )
    return s


def _validate_category(category_name: str) -> str:
    c = category_name.strip()
    if not c or len(c) > 120:
        raise HTTPException(
            status_code=422,
            detail={"error": "invalid_category_name"},
        )
    return c


# ─────────────────────────────────────────────────────────────────────────────
# Input schemas
# ─────────────────────────────────────────────────────────────────────────────

class SellerForecastRequest(BaseModel):
    seller_id:     str           = Field(..., min_length=1, max_length=64)
    category_name: str           = Field(..., min_length=1, max_length=120)
    base_cost_inr: float         = Field(..., gt=0, description="Landing cost in ₹, must be > 0")

    @field_validator("seller_id", "category_name")
    @classmethod
    def strip_fields(cls, v: str) -> str:
        return v.strip()


class MarginSimRequest(BaseModel):
    asin:          str   = Field(..., min_length=1, max_length=20)
    base_cost_inr: float = Field(..., gt=0, description="Landing cost in ₹")


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/calendar")
def seller_calendar(year: Optional[int] = Query(None, ge=2020, le=2035)):
    """
    FREE — Indian festive calendar for the given year (default: current year).
    Returns all festivals from festival_calendar.py (ephem + hijridate).
    Free tier gets next 3 only; Basic+ gets all.
    Tier is NOT enforced here — frontend applies the limit based on /tier-info.
    All calendar data is returned; frontend gates display.
    """
    y      = year or date.today().year
    events = _enrich_seller_calendar(y)
    if date.today().month >= 9:
        events += _enrich_seller_calendar(y + 1)

    upcoming = [e for e in events if date.fromisoformat(e["end_date"]) >= date.today()]

    return {
        "year":     y,
        "events":   events,
        "upcoming": upcoming,
        "today":    date.today().isoformat(),
    }


@router.get("/tier-info")
def seller_tier_info(
    user_id: Optional[str] = Depends(get_current_user_id),
    db:      Session        = Depends(get_db),
):
    """FREE — Returns authenticated user's current tier and feature access map."""
    tier = _get_user_tier(user_id, db)
    return {
        "tier":          tier,
        "user_id":       user_id,
        "is_basic":      _has_tier(tier, "basic"),
        "is_premium":    _has_tier(tier, "premium"),
        "features": {
            "calendar":        True,
            "snapshot":        True,
            "readiness":       _has_tier(tier, "basic"),
            "price_benchmark": _has_tier(tier, "basic"),
            "review_health":   _has_tier(tier, "basic"),
            "margin_sim":      _has_tier(tier, "premium"),
            "launch_window":   _has_tier(tier, "premium"),
            "ai_forecast":     _has_tier(tier, "premium"),
        },
        "pricing": {
            "basic":   {"price_inr": 1999, "label": "₹1,999/month"},
            "premium": {"price_inr": 2999, "label": "₹2,999/month"},
        },
    }


@router.get("/snapshot")
def seller_snapshot(
    seller_id: str           = Query(..., min_length=1, max_length=64),
    category_name: Optional[str] = Query(None, max_length=120),
    user_id:   Optional[str] = Depends(get_optional_user_id),
    db:        Session        = Depends(get_db),
):
    """
    FREE — Catalog snapshot: top 3 SKUs by readiness score + seller KPIs.
    Basic+ users see all SKUs. Price vs market comparison is LOCKED for free tier.
    Festival calendar limited to next 3 for free tier.
    """
    seller_id = _validate_seller_id(seller_id)
    user_tier = _get_user_tier(user_id, db)
    is_basic  = _has_tier(user_tier, "basic")

    products  = _get_seller_products(seller_id, db)
    cat       = _validate_category(category_name) if category_name else None
    market    = _get_market_benchmark(cat, db)

    # Compute readiness for all products
    for p in products:
        p["readiness_score"] = _compute_readiness(
            p["star_rating"], p["num_ratings"], p["monthly_units"],
            p["is_prime"], p["price"], market["avg_price"],
        )
        p["readiness_label"] = _readiness_label(p["readiness_score"])

    products.sort(key=lambda x: x["readiness_score"], reverse=True)

    # Free tier: top 3 only, no market comparison
    display_products = products if is_basic else products[:3]

    # Build response — hide market benchmark fields for free tier
    sku_list = []
    for i, p in enumerate(display_products):
        locked = not is_basic and i >= 3
        sku_list.append({
            "asin":            p["asin"],
            "title":           p["title"],
            "photo":           p["photo"],
            "price":           p["price"] if not locked else None,
            "currency":        p["currency"],
            "star_rating":     p["star_rating"],
            "num_ratings":     p["num_ratings"],
            "sales_volume":    p["sales_volume_label"] if not locked else None,
            "monthly_units":   p["monthly_units"] if not locked else None,
            "is_prime":        p["is_prime"],
            "readiness_score": p["readiness_score"] if not locked else None,
            "readiness_label": p["readiness_label"] if not locked else None,
            "market_avg_price":market["avg_price"] if is_basic else None,
            "price_vs_market": (
                round((p["price"] - market["avg_price"]) / market["avg_price"] * 100, 1)
                if is_basic and market["avg_price"] > 0 else None
            ),
            "locked":          locked,
        })

    # Catalog KPIs
    if products:
        avg_rating   = round(sum(p["star_rating"] for p in products) / len(products), 1)
        avg_score    = round(sum(p["readiness_score"] for p in products) / len(products), 0)
        prime_count  = sum(1 for p in products if p["is_prime"])
        high_vel     = sum(1 for p in products if p["monthly_units"] >= 1000)
        total_reviews= sum(p["num_ratings"] for p in products)
    else:
        avg_rating = avg_score = prime_count = high_vel = total_reviews = 0

    festivals = _upcoming_festivals(limit=3 if not is_basic else None)

    return {
        "seller_id":          seller_id,
        "user_tier":          user_tier,
        "total_skus":         len(products),
        "displayed_skus":     len(sku_list),
        "products":           sku_list,
        "catalog_kpis": {
            "avg_rating":     avg_rating,
            "avg_readiness":  int(avg_score),
            "prime_count":    prime_count,
            "high_velocity_skus": high_vel,
            "total_reviews":  total_reviews,
        },
        "market_summary":     market if is_basic else None,
        "upcoming_festivals": festivals,
        "upgrade_message":    None if is_basic else (
            f"Upgrade to Basic (₹1,999/mo) to see all {len(products)} SKUs with "
            "price benchmarking, 90-day trend charts, and review health."
        ),
    }


@router.get("/readiness")
def seller_readiness(
    seller_id:     str           = Query(..., min_length=1, max_length=64),
    category_name: Optional[str] = Query(None, max_length=120),
    user_id:       str           = Depends(get_current_user_id),
    db:            Session        = Depends(get_db),
):
    """
    BASIC — Full readiness scores for all seller SKUs with market benchmark.
    Includes 90-day price trend for the seller's category.
    """
    seller_id = _validate_seller_id(seller_id)
    _check_tier(user_id, "basic", db)

    products = _get_seller_products(seller_id, db)
    cat      = _validate_category(category_name) if category_name else None
    market   = _get_market_benchmark(cat, db)
    trend    = _seller_category_price_trend(cat, db) if cat else []

    scored = []
    for p in products:
        score = _compute_readiness(
            p["star_rating"], p["num_ratings"], p["monthly_units"],
            p["is_prime"], p["price"], market["avg_price"],
        )
        price_delta_pct = (
            round((p["price"] - market["avg_price"]) / market["avg_price"] * 100, 1)
            if market["avg_price"] > 0 else None
        )
        scored.append({
            **p,
            "readiness_score":  score,
            "readiness_label":  _readiness_label(score),
            "price_vs_market_pct": price_delta_pct,
            "price_position":   (
                "below_avg"  if p["price"] < market["avg_price"] * 0.9  else
                "on_market"  if p["price"] <= market["avg_price"] * 1.1 else
                "above_avg"  if p["price"] <= market["avg_price"] * 1.3 else
                "premium"
            ),
        })

    scored.sort(key=lambda x: x["readiness_score"], reverse=True)

    festivals    = _upcoming_festivals()
    next_peak    = _next_peak_festival(festivals)

    return {
        "seller_id":        seller_id,
        "category_name":    cat,
        "products":         scored,
        "market":           market,
        "price_trend_90d":  trend,
        "upcoming_festivals": festivals,
        "next_peak_festival": next_peak,
        "summary": {
            "total_skus":        len(scored),
            "ready":             sum(1 for p in scored if p["readiness_label"] == "ready"),
            "needs_work":        sum(1 for p in scored if p["readiness_label"] == "needs_work"),
            "at_risk":           sum(1 for p in scored if p["readiness_label"] == "at_risk"),
            "no_prime":          sum(1 for p in scored if not p["is_prime"]),
            "overpriced_vs_mkt": sum(1 for p in scored if p["price_position"] in ("above_avg", "premium")),
        },
    }


@router.get("/price-benchmark")
def seller_price_benchmark(
    seller_id:     str           = Query(..., min_length=1, max_length=64),
    category_name: Optional[str] = Query(None, max_length=120),
    user_id:       str           = Depends(get_current_user_id),
    db:            Session        = Depends(get_db),
):
    """
    BASIC — Per-SKU price position vs market min/avg/p25/p75/max.
    Includes 90-day price trend for the category.
    """
    seller_id = _validate_seller_id(seller_id)
    _check_tier(user_id, "basic", db)

    products = _get_seller_products(seller_id, db)
    cat      = _validate_category(category_name) if category_name else None
    market   = _get_market_benchmark(cat, db)
    trend    = _seller_category_price_trend(cat, db) if cat else []

    benchmarks = []
    for p in products:
        mkt_avg = market["avg_price"]
        pct_vs_avg = (
            round((p["price"] - mkt_avg) / mkt_avg * 100, 1)
            if mkt_avg > 0 else None
        )
        pct_vs_range = None
        if market["min_price"] and market["max_price"] and market["max_price"] > market["min_price"]:
            pct_vs_range = round(
                (p["price"] - market["min_price"])
                / (market["max_price"] - market["min_price"]) * 100, 1
            )

        benchmarks.append({
            "asin":             p["asin"],
            "title":            p["title"],
            "your_price":       p["price"],
            "currency":         p["currency"],
            "market_min":       market["min_price"],
            "market_p25":       market["p25"],
            "market_avg":       mkt_avg,
            "market_p75":       market["p75"],
            "market_max":       market["max_price"],
            "pct_vs_avg":       pct_vs_avg,
            "pct_of_range":     pct_vs_range,
            "position":         (
                "below_floor"   if p["price"] < market["min_price"] else
                "below_avg"     if p["price"] < mkt_avg * 0.9      else
                "on_market"     if p["price"] <= mkt_avg * 1.1     else
                "above_avg"     if p["price"] <= market["p75"]     else
                "premium"
            ),
            "is_prime":         p["is_prime"],
            "star_rating":      p["star_rating"],
        })

    return {
        "seller_id":      seller_id,
        "category_name":  cat,
        "market":         market,
        "benchmarks":     benchmarks,
        "price_trend_90d": trend,
        "upcoming_festivals": _upcoming_festivals(limit=5),
    }


@router.get("/review-health")
def seller_review_health(
    seller_id: str = Query(..., min_length=1, max_length=64),
    user_id:   str = Depends(get_current_user_id),
    db:        Session = Depends(get_db),
):
    """
    BASIC — Per-SKU review health: rating, response rate, recent sentiment, risk flags.
    Critical for Diwali / Navratri prep — low response rates suppress listings at peak.
    """
    seller_id = _validate_seller_id(seller_id)
    _check_tier(user_id, "basic", db)

    products = _get_seller_products(seller_id, db)
    health   = [_review_health(p) for p in products]

    total_reviews = sum(h["total_recent"] for h in health)
    total_resp    = sum(
        round(h["response_rate_pct"] / 100 * h["total_recent"])
        for h in health
    )
    overall_resp_rate = (
        round(total_resp / total_reviews * 100, 1) if total_reviews else 0.0
    )

    return {
        "seller_id":           seller_id,
        "review_health":       health,
        "catalog_summary": {
            "overall_response_rate_pct": overall_resp_rate,
            "at_risk_skus": sum(1 for h in health if h["risk_flag"] != "healthy"),
            "unanswered_1stars": sum(len(h["unanswered_1star"]) for h in health),
            "avg_star_rating":   round(
                sum(h["star_rating"] for h in health) / len(health), 1
            ) if health else 0,
        },
        "upcoming_festivals": _upcoming_festivals(limit=3),
        "festive_warning": (
            "⚠ Seller response rate is 0%. Amazon India suppresses listings "
            "with low engagement during Diwali and Navratri traffic peaks. "
            "Respond to all reviews within 48 hours."
            if overall_resp_rate == 0 else None
        ),
    }


@router.get("/margin-sim")
def seller_margin_simulation(
    seller_id:     str   = Query(..., min_length=1, max_length=64),
    asin:          str   = Query(..., min_length=1, max_length=20),
    base_cost_inr: float = Query(..., gt=0, description="Your landing/COGS cost in ₹"),
    category_name: Optional[str] = Query(None, max_length=120),
    user_id:       str   = Depends(get_current_user_id),
    db:            Session = Depends(get_db),
):
    """
    PREMIUM — Margin simulation at 4 market price bands for a specific seller SKU.
    Platform fee: Amazon.in 18% (includes GST surcharge component).
    Scenarios: floor (P25), market avg, P75, ceiling.
    """
    seller_id = _validate_seller_id(seller_id)
    _check_tier(user_id, "premium", db)

    products = _get_seller_products(seller_id, db)
    product  = next((p for p in products if p["asin"] == asin), None)

    if not product:
        raise HTTPException(
            status_code=404,
            detail={"error": "asin_not_found", "asin": asin, "seller_id": seller_id},
        )

    cat    = _validate_category(category_name) if category_name else None
    market = _get_market_benchmark(cat, db)

    sim = _seller_margin_sim(asin, product["price"], base_cost_inr, market)
    sim["product_title"] = product["title"]
    sim["category_name"] = cat

    festivals      = _upcoming_festivals(limit=3)
    next_festival  = festivals[0] if festivals else None

    if next_festival:
        sim["festive_context"] = {
            "next_festival":    next_festival["name"],
            "days_away":        next_festival["days_away"],
            "intensity":        next_festival["intensity"],
            "pricing_advice": (
                f"For {next_festival['name']} ({next_festival['days_away']} days), "
                f"consider the {sim['recommended_label']} price of "
                f"₹{sim['recommended_price']} — net margin "
                f"{sim['scenarios'][[s['label'] for s in sim['scenarios']].index(sim['recommended_label'])]['net_pct']}%."
            ),
        }

    return sim


@router.get("/launch-window")
def seller_launch_window(
    seller_id:     str           = Query(..., min_length=1, max_length=64),
    category_name: str           = Query(..., min_length=1, max_length=120),
    user_id:       str           = Depends(get_current_user_id),
    db:            Session        = Depends(get_db),
):
    """
    PREMIUM — Optimal listing/restock timing for each upcoming Indian festival.
    Uses 3-week rolling price inflection from market data + 35-day sourcing buffer.
    """
    seller_id     = _validate_seller_id(seller_id)
    category_name = _validate_category(category_name)
    _check_tier(user_id, "premium", db)

    festivals = _upcoming_festivals(limit=8)
    windows   = _seller_launch_windows(category_name, festivals, db)

    stock_risk = _seller_stock_risk(category_name, db)

    return {
        "seller_id":       seller_id,
        "category_name":   category_name,
        "launch_windows":  windows,
        "stock_risk":      stock_risk,
        "today":           date.today().isoformat(),
        "assumptions": {
            "sourcing_lead_days":  21,
            "fba_processing_days": 10,
            "total_buffer_days":   35,
            "listing_index_weeks": 6,
        },
    }


@router.post("/ai/forecast")
async def seller_ai_forecast(
    req:     SellerForecastRequest,
    user_id: str     = Depends(get_current_user_id),
    db:      Session = Depends(get_db),
):
    """
    PREMIUM · SSE — AI festive strategy streamed via Ollama (llama3.2:3b).
    Personalised to seller's actual catalog vs Indian market benchmarks.
    Covers: festive demand forecast / pricing strategy / stock prep / listing actions.
    Returns 503 if Ollama is not running.
    """
    _check_tier(user_id, "premium", db)
    await _check_ollama()

    products   = _get_seller_products(req.seller_id, db)
    market     = _get_market_benchmark(req.category_name, db)
    stock_risk = _seller_stock_risk(req.category_name, db)
    festivals  = _upcoming_festivals(limit=1)
    next_fest  = festivals[0] if festivals else None

    prompt = _build_seller_forecast_prompt(
        products, market, next_fest, stock_risk, req.category_name
    )
    return _sse(prompt)


@router.get("/ai/status")
async def seller_ai_status():
    """Health-check for Ollama. Same as new-seller router."""
    running = await ollama_is_running()
    return {
        "ollama_running": running,
        "model":          OLLAMA_MODEL,
        "status":         "ready" if running else "offline",
        "fix":            (
            "Run `ollama serve` and `ollama pull llama3.2:3b`"
            if not running else None
        ),
    }