
"""
Festive Trend Feature — FastAPI Router
prefix: /festive

Tier access:
  FREE    → GET /festive/calendar
            GET /festive/overview         (top 3 categories, index 0 only unlocked)
  BASIC   → GET /festive/categories
            GET /festive/trend-analysis   (90-day price + velocity, all categories)
            GET /festive/stock-risk
  PREMIUM → GET  /festive/launch-window
            GET  /festive/margin-sim
            POST /festive/ai/forecast     (SSE — Ollama llama3.2:3b, free, local)

Data sources:
  rapidapi_amazon_products   (amazon)
  rapidapi_flipkart_products (flipkart)
  users                      (subscription_tier gate + expiry check)

Changes vs v1 / v2:
  1. Dynamic festival calendar — MOVING_FESTIVALS hardcoded dict removed.
     Now uses get_festivals_for_year() from festival_calendar.py.
     Dependencies: ephem (LGPL) + hijridate (MIT) — zero licensing restrictions.
     No pyswisseph (AGPL), no paid APIs, no hardcoded dates to maintain.

  2. AI model — Ollama llama3.2:3b ONLY. Free, local, no API keys, no cost.
     No Claude API, no paid model, no fallback to any external service.
     Returns 503 with a clear fix message if Ollama is not running.

  3. Flipkart SV source — estimated_sales (parsed float, real units) is used
     via COALESCE(estimated_sales, avg_sales_volume). SV_SCALE_FLIPKART = 1
     (Flipkart stores real units; no division needed).

  4. Amazon SV scale confirmed from DB dump:
     avg_sales_volume = label_number × 1_000_000
     e.g. "100+ bought" → 100_000_000; "4K+ bought" → 4_000_000_000
     SV_SCALE_AMAZON = 1_000_000.

  5. Flipkart price columns confirmed NUMERIC in DB schema — direct ::FLOAT
     cast, no REGEXP_REPLACE needed anywhere.

  6. Expired subscriptions — _check_tier verifies subscription_expires_at.

  7. All DB helpers wrapped in try/except + db.rollback() to prevent
     InFailedSqlTransaction cascade errors on subsequent queries.

  8. get_current_user_id / get_optional_user_id typed correctly — Optional[str]
     where anonymous is allowed, plain str where a tier gate is enforced.
"""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone
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
# Dynamic festival calendar — ephem (LGPL) + hijridate (MIT), no AGPL/paid libs
from app.services.festival_calendar_service import get_festivals_for_year

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/festive", tags=["Festive Trends"])

# ─────────────────────────────────────────────────────────────────────────────
# Sales-volume scale constants
#
# Amazon (confirmed from DB dump):
#   avg_sales_volume = label_number × 1_000_000
#   "100+ bought"  → stored as 100_000_000
#   "2K+ bought"   → stored as 2_000_000_000
#   "4K+ bought"   → stored as 4_000_000_000
#   Divide by SV_SCALE_AMAZON to recover real monthly units.
#
# Flipkart (confirmed from DB dump):
#   estimated_sales  = parsed float, real units (e.g. 613.60 for "613+ bought")
#   avg_sales_volume = real units fallback  (e.g. 613.00)
#   No division needed — SV_SCALE_FLIPKART = 1.
# ─────────────────────────────────────────────────────────────────────────────

SV_SCALE_AMAZON   = 1_000_000
SV_SCALE_FLIPKART = 1

# ─────────────────────────────────────────────────────────────────────────────
# Flipkart column expressions
# All price/SV columns are NUMERIC in the actual DB — direct ::FLOAT cast.
# estimated_sales preferred for SV (more accurate; already real units).
# ─────────────────────────────────────────────────────────────────────────────

_FK_PRICE = "NULLIF(product_price, 0)::FLOAT"
_FK_MIN   = "NULLIF(min_price, 0)::FLOAT"
_FK_MAX   = "NULLIF(max_price, 0)::FLOAT"
_FK_SV    = "NULLIF(COALESCE(estimated_sales, avg_sales_volume), 0)::FLOAT"
_FK_MINSV = "NULLIF(min_sales_volume, 0)::FLOAT"
_FK_MAXSV = "NULLIF(max_sales_volume, 0)::FLOAT"

SYSTEM_PROMPT = (
    "You are a senior e-commerce strategist specialising in Indian festive retail. "
    "You are concise, data-driven, and always give a specific actionable recommendation. "
    "Use ₹ for Indian Rupee. Never hedge without direction."
)


# ─────────────────────────────────────────────────────────────────────────────
# Festival calendar — dynamic (replaces hardcoded MOVING_FESTIVALS dict)
# get_festivals_for_year() uses ephem + hijridate, both permissively licensed.
# Results are LRU-cached per year inside festival_calendar.py.
# ─────────────────────────────────────────────────────────────────────────────

def _enrich_calendar(year: int) -> list[dict]:
    """
    Build enriched festival list for `year` from the dynamic panchang engine.
    Output keys match the v1 hardcoded format for full frontend compatibility.
    """
    today     = date.today()
    festivals = get_festivals_for_year(year)
    enriched: list[dict] = []

    for f in festivals:
        start     = f["start_date"]   # date object from festival_calendar
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
            "is_upcoming": 0 <= days_away <= 60,
        })

    enriched.sort(key=lambda x: x["start_date"])
    return enriched


def _current_and_upcoming(events: list[dict], limit: int = 6) -> list[dict]:
    today  = date.today()
    future = [e for e in events if date.fromisoformat(e["end_date"]) >= today]
    return future[:limit]


# ─────────────────────────────────────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────────────────────────────────────

from app.api.deps import get_current_user_id, validate_session


def get_optional_user_id(session_id: str = Cookie(None)) -> Optional[str]:
    """Returns None if not authenticated."""
    if not session_id:
        return None
    session_data = validate_session(session_id)
    if session_data and "user_id" in session_data:
        return str(session_data["user_id"])
    return None


_TIER_ORDER = {"free": 0, "basic": 1, "premium": 2, "enterprise": 3}


def _get_user_tier(user_id: Optional[str], db: Session) -> str:
    """
    Return user's subscription_tier from DB.
    Returns 'free' for anonymous / unknown / expired users.
    """
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
            detail={"error": "upgrade_required", "required_tier": required},
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
        logger.warning("Could not verify subscription expiry for user %s: %s", user_id, e)


async def _check_ollama() -> None:
    """Raises 503 with a clear fix message if Ollama is not running."""
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
# SSE helpers — Ollama only, no external AI services
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
            "Cache-Control":       "no-cache",
            "X-Accel-Buffering":   "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# Sales-volume normaliser
# ─────────────────────────────────────────────────────────────────────────────

def _norm_sv(raw: float | None, scale: int) -> float:
    if raw is None or raw <= 0:
        return 0.0
    return float(raw) / scale


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — category overview
# ─────────────────────────────────────────────────────────────────────────────

def _amazon_category_overview(db: Session) -> list[dict]:
    try:
        rows = db.execute(text("""
            SELECT
                category_name,
                COUNT(*)                         AS product_count,
                AVG(product_price_numeric)        AS avg_price,
                AVG(avg_sales_volume)             AS avg_sv_raw,
                AVG(product_star_rating_numeric)  AS avg_rating
            FROM rapidapi_amazon_products
            WHERE product_price_numeric IS NOT NULL
              AND product_price_numeric > 0
              AND avg_sales_volume IS NOT NULL
              AND avg_sales_volume > 0
            GROUP BY category_name
            ORDER BY AVG(avg_sales_volume) DESC NULLS LAST
            LIMIT 20
        """)).mappings().all()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_amazon_category_overview DB error: %s", e)
        return []

    return [
        {
            "category_name":    r["category_name"],
            "product_count":    int(r["product_count"] or 0),
            "avg_price":        round(float(r["avg_price"] or 0), 0),
            "avg_sales_volume": round(_norm_sv(r["avg_sv_raw"], SV_SCALE_AMAZON) * 0.85, 0),
            "avg_rating":       round(float(r["avg_rating"] or 0), 1),
        }
        for r in rows
    ]


def _flipkart_category_overview(db: Session) -> list[dict]:
    try:
        rows = db.execute(text(f"""
            SELECT
                category_name,
                COUNT(*)                 AS product_count,
                AVG({_FK_PRICE})         AS avg_price,
                AVG({_FK_SV})            AS avg_sv_raw,
                AVG(product_star_rating) AS avg_rating
            FROM rapidapi_flipkart_products
            WHERE {_FK_PRICE} IS NOT NULL
              AND {_FK_SV} IS NOT NULL
            GROUP BY category_name
            ORDER BY AVG({_FK_SV}) DESC NULLS LAST
            LIMIT 20
        """)).mappings().all()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_flipkart_category_overview DB error: %s", e)
        return []

    return [
        {
            "category_name":    r["category_name"],
            "product_count":    int(r["product_count"] or 0),
            "avg_price":        round(float(r["avg_price"] or 0), 0),
            "avg_sales_volume": round(_norm_sv(r["avg_sv_raw"], SV_SCALE_FLIPKART) * 0.80, 0),
            "avg_rating":       round(float(r["avg_rating"] or 0), 1),
        }
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — 90-day weekly price trend
# ─────────────────────────────────────────────────────────────────────────────

def _amazon_price_trend(category_name: str, db: Session, days: int = 90) -> list[dict]:
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
        logger.error("_amazon_price_trend DB error: %s", e)
        return []

    return [
        {
            "week":        r["week"].date().isoformat() if r["week"] else None,
            "avg_price":   round(float(r["avg_price"] or 0), 2),
            "min_price":   round(float(r["min_price"] or 0), 2),
            "max_price":   round(float(r["max_price"] or 0), 2),
            "avg_sv":      round(_norm_sv(r["avg_sv_raw"], SV_SCALE_AMAZON) * 0.75, 0),
            "sample_size": int(r["sample_size"] or 0),
        }
        for r in rows
    ]


def _flipkart_price_trend(category_name: str, db: Session, days: int = 90) -> list[dict]:
    try:
        rows = db.execute(
            text(f"""
                SELECT
                    DATE_TRUNC('week', created_at)  AS week,
                    AVG({_FK_PRICE})                AS avg_price,
                    MIN({_FK_MIN})                  AS min_price,
                    MAX({_FK_MAX})                  AS max_price,
                    AVG({_FK_SV})                   AS avg_sv_raw,
                    COUNT(*)                        AS sample_size
                FROM rapidapi_flipkart_products
                WHERE category_name = :cat
                  AND {_FK_PRICE} IS NOT NULL
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
        logger.error("_flipkart_price_trend DB error: %s", e)
        return []

    return [
        {
            "week":        r["week"].date().isoformat() if r["week"] else None,
            "avg_price":   round(float(r["avg_price"] or 0), 2),
            "min_price":   round(float(r["min_price"] or 0), 2),
            "max_price":   round(float(r["max_price"] or 0), 2),
            "avg_sv":      round(_norm_sv(r["avg_sv_raw"], SV_SCALE_FLIPKART) * 0.72, 0),
            "sample_size": int(r["sample_size"] or 0),
        }
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — stock risk
# ─────────────────────────────────────────────────────────────────────────────

def _stock_risk_amazon(category_name: str, db: Session) -> dict:
    try:
        row = db.execute(
            text("""
                SELECT
                    AVG(avg_sales_volume)  AS avg_sv_raw,
                    MAX(max_sales_volume)  AS max_sv_raw,
                    COUNT(*)               AS n
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
        logger.error("_stock_risk_amazon DB error: %s", e)
        return {"risk_level": "unknown", "error": str(e)}

    if not row or not row["avg_sv_raw"]:
        return {"risk_level": "unknown", "ratio": None, "avg_sv": None, "max_sv": None}

    avg_sv = _norm_sv(row["avg_sv_raw"], SV_SCALE_AMAZON) * 0.80
    max_sv = _norm_sv(row["max_sv_raw"], SV_SCALE_AMAZON) * 0.65
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


def _stock_risk_flipkart(category_name: str, db: Session) -> dict:
    try:
        row = db.execute(
            text(f"""
                SELECT
                    AVG({_FK_SV})    AS avg_sv_raw,
                    MAX({_FK_MAXSV}) AS max_sv_raw,
                    COUNT(*)         AS n
                FROM rapidapi_flipkart_products
                WHERE category_name = :cat
                  AND {_FK_SV} IS NOT NULL
            """),
            {"cat": category_name},
        ).mappings().first()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_stock_risk_flipkart DB error: %s", e)
        return {"risk_level": "unknown", "error": str(e)}

    if not row or not row["avg_sv_raw"]:
        return {"risk_level": "unknown", "ratio": None, "avg_sv": None, "max_sv": None}

    avg_sv = _norm_sv(row["avg_sv_raw"], SV_SCALE_FLIPKART) * 0.75
    max_sv = _norm_sv(row["max_sv_raw"], SV_SCALE_FLIPKART) * 0.60
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
# DB helpers — velocity by category
# ─────────────────────────────────────────────────────────────────────────────

def _velocity_by_category(source: str, db: Session) -> list[dict]:
    try:
        if source == "flipkart":
            rows = db.execute(text(f"""
                SELECT
                    category_name,
                    AVG({_FK_SV})    AS avg_sv_raw,
                    AVG({_FK_PRICE}) AS avg_price,
                    COUNT(*)         AS products
                FROM rapidapi_flipkart_products
                WHERE {_FK_SV} IS NOT NULL
                GROUP BY category_name
                ORDER BY AVG({_FK_SV}) DESC NULLS LAST
                LIMIT 15
            """)).mappings().all()
            scale = SV_SCALE_FLIPKART
        else:
            rows = db.execute(text("""
                SELECT
                    category_name,
                    AVG(avg_sales_volume)       AS avg_sv_raw,
                    AVG(product_price_numeric)  AS avg_price,
                    COUNT(*)                    AS products
                FROM rapidapi_amazon_products
                WHERE avg_sales_volume IS NOT NULL
                  AND avg_sales_volume > 0
                GROUP BY category_name
                ORDER BY AVG(avg_sales_volume) DESC NULLS LAST
                LIMIT 15
            """)).mappings().all()
            scale = SV_SCALE_AMAZON
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_velocity_by_category DB error: %s", e)
        return []

    return [
        {
            "category_name": r["category_name"],
            "velocity":      round(_norm_sv(r["avg_sv_raw"], scale) * 0.70, 0),
            "avg_price":     round(float(r["avg_price"] or 0), 2),
            "products":      int(r["products"] or 0),
        }
        for r in rows
    ]


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — launch window (PREMIUM)
# ─────────────────────────────────────────────────────────────────────────────

def _launch_window(category_name: str, source: str, db: Session) -> dict:
    """
    Optimal listing window via price inflection detection.
    Uses a 3-point rolling average to smooth outlier weeks.
    Skips weeks with sample_size < 3 to avoid scraper-spike false signals.
    """
    try:
        if source == "flipkart":
            rows = db.execute(
                text(f"""
                    SELECT
                        DATE_TRUNC('week', created_at)  AS week,
                        AVG({_FK_PRICE})                AS avg_price,
                        AVG({_FK_SV})                   AS avg_sv_raw,
                        COUNT(*)                        AS sample_size
                    FROM rapidapi_flipkart_products
                    WHERE category_name = :cat
                      AND {_FK_PRICE} IS NOT NULL
                      AND created_at >= NOW() - INTERVAL '90 days'
                    GROUP BY DATE_TRUNC('week', created_at)
                    ORDER BY week ASC
                """),
                {"cat": category_name},
            ).mappings().all()
            scale = SV_SCALE_FLIPKART
        else:
            rows = db.execute(
                text("""
                    SELECT
                        DATE_TRUNC('week', created_at)  AS week,
                        AVG(product_price_numeric)       AS avg_price,
                        AVG(avg_sales_volume)            AS avg_sv_raw,
                        COUNT(*)                        AS sample_size
                    FROM rapidapi_amazon_products
                    WHERE category_name = :cat
                      AND product_price_numeric IS NOT NULL
                      AND product_price_numeric > 0
                      AND created_at >= NOW() - INTERVAL '90 days'
                    GROUP BY DATE_TRUNC('week', created_at)
                    ORDER BY week ASC
                """),
                {"cat": category_name},
            ).mappings().all()
            scale = SV_SCALE_AMAZON
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_launch_window DB error: %s", e)
        return {
            "optimal_week":    None,
            "recommendation":  "Data unavailable.",
            "price_trend":     [],
            "weeks_available": 0,
        }

    if len(rows) < 3:
        return {
            "optimal_week":    None,
            "recommendation":  "Insufficient historical data. Check back after more weekly snapshots are collected.",
            "price_trend":     [],
            "weeks_available": len(rows),
        }

    raw_trend = [
        {
            "week":        r["week"].date().isoformat() if r["week"] else None,
            "avg_price":   round(float(r["avg_price"] or 0), 2),
            "avg_sv":      round(_norm_sv(r["avg_sv_raw"], scale), 0),
            "sample_size": int(r["sample_size"] or 0),
        }
        for r in rows
    ]

    # 3-week rolling average — skip weeks with < 3 samples (scraper gaps)
    smoothed: list[dict] = []
    for i in range(1, len(raw_trend) - 1):
        if raw_trend[i]["sample_size"] < 3:
            continue
        smoothed.append({
            "week":      raw_trend[i]["week"],
            "avg_price": round(
                (raw_trend[i-1]["avg_price"] + raw_trend[i]["avg_price"] + raw_trend[i+1]["avg_price"]) / 3, 2
            ),
            "avg_sv": round(
                (raw_trend[i-1]["avg_sv"] + raw_trend[i]["avg_sv"] + raw_trend[i+1]["avg_sv"]) / 3, 0
            ),
        })

    if len(smoothed) < 2:
        smoothed = raw_trend   # fall back to raw if smoothing leaves too few points

    best_week  = None
    best_score = -9999.0
    for i in range(1, len(smoothed)):
        price_delta = smoothed[i]["avg_price"] - smoothed[i-1]["avg_price"]
        sv_delta    = smoothed[i]["avg_sv"]    - smoothed[i-1]["avg_sv"]
        score = price_delta + sv_delta / 1000.0
        if score > best_score:
            best_score = score
            best_week  = smoothed[i]["week"]

    if best_week:
        delta_days = (date.fromisoformat(best_week) - date.today()).days
        if delta_days <= 0:
            rec = "The optimal window has passed — list NOW to capture residual festive demand."
        elif delta_days <= 7:
            rec = f"List within the next {delta_days} days to ride the price inflection point."
        else:
            rec = f"Optimal listing window starts around {best_week} ({delta_days} days away). Source inventory now."
    else:
        rec = "No clear price inflection detected. List any time and monitor weekly."

    return {
        "optimal_week":    best_week,
        "recommendation":  rec,
        "price_trend":     raw_trend,
        "weeks_available": len(raw_trend),
        "best_score":      round(best_score, 4),
    }


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — margin simulation (PREMIUM)
# ─────────────────────────────────────────────────────────────────────────────

def _margin_sim(category_name: str, source: str, base_cost: float, db: Session) -> dict:
    try:
        if source == "flipkart":
            row = db.execute(
                text(f"""
                    SELECT
                        AVG({_FK_PRICE})  AS avg_p,
                        MIN({_FK_MIN})    AS min_p,
                        MAX({_FK_MAX})    AS max_p,
                        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY {_FK_PRICE}) AS p25,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY {_FK_PRICE}) AS p75
                    FROM rapidapi_flipkart_products
                    WHERE category_name = :cat
                      AND {_FK_PRICE} IS NOT NULL
                """),
                {"cat": category_name},
            ).mappings().first()
        else:
            row = db.execute(
                text("""
                    SELECT
                        AVG(product_price_numeric)  AS avg_p,
                        MIN(min_price)              AS min_p,
                        MAX(max_price)              AS max_p,
                        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY product_price_numeric) AS p25,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY product_price_numeric) AS p75
                    FROM rapidapi_amazon_products
                    WHERE category_name = :cat
                      AND product_price_numeric IS NOT NULL
                      AND product_price_numeric > 0
                """),
                {"cat": category_name},
            ).mappings().first()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("_margin_sim DB error: %s", e)
        return {"error": "Data unavailable", "detail": str(e)}

    if not row or not row["avg_p"]:
        return {"error": "No price data found for this category"}

    avg_p = float(row["avg_p"] or 0)
    min_p = float(row["min_p"] or 0)
    max_p = float(row["max_p"] or 0)
    p25   = float(row["p25"] or 0)
    p75   = float(row["p75"] or 0)

    # Platform fees: Amazon ~15%, Flipkart ~12%
    platform_fee_pct = 0.15 if source == "amazon" else 0.12

    scenarios = [
        {"label": "Floor",      "price": round(p25, 2)},
        {"label": "Market avg", "price": round(avg_p, 2)},
        {"label": "Premium",    "price": round(p75, 2)},
        {"label": "Ceiling",    "price": round(min(max_p * 0.9, p75 * 1.5), 2)},
    ]
    for sc in scenarios:
        price        = sc["price"]
        gross        = price - base_cost
        gross_pct    = (gross / price * 100) if price > 0 else 0.0
        platform_fee = price * platform_fee_pct
        net          = gross - platform_fee
        net_pct      = (net / price * 100) if price > 0 else 0.0
        sc.update({
            "gross_margin": round(gross, 2),
            "gross_pct":    round(gross_pct, 1),
            "platform_fee": round(platform_fee, 2),
            "net_margin":   round(net, 2),
            "net_pct":      round(net_pct, 1),
            "viable":       net > 0,
        })

    recommended = next(
        (s for s in reversed(scenarios) if s["viable"]),
        scenarios[0],
    )

    return {
        "base_cost":         base_cost,
        "market_range":      {"min": round(min_p, 2), "avg": round(avg_p, 2), "max": round(max_p, 2)},
        "scenarios":         scenarios,
        "recommended_price": recommended["price"],
        "recommended_label": recommended["label"],
        "platform_fee_pct":  platform_fee_pct * 100,
    }


# ─────────────────────────────────────────────────────────────────────────────
# AI forecast prompt builder
# ─────────────────────────────────────────────────────────────────────────────

def _build_forecast_prompt(
    category_name: str,
    source: str,
    base_cost: float,
    trend: list[dict],
    stock_risk: dict,
    next_festival: Optional[dict],
    margin_data: dict,
) -> str:
    trend_str = "\n".join(
        f"  Week {t['week']}: avg price ₹{t['avg_price']}, est. sales ~{int(t['avg_sv'])} units/month"
        for t in trend[-8:]
    ) or "  No trend data available."

    festival_str = (
        f"{next_festival['name']} ({next_festival['start_date']}, "
        f"{next_festival['days_away']} days away, intensity={next_festival['intensity']})"
        if next_festival
        else "No major festival in next 60 days"
    )

    scenarios_str = "\n".join(
        f"  {s['label']}: ₹{s['price']} → net margin {s['net_pct']:.1f}% (viable={s['viable']})"
        for s in margin_data.get("scenarios", [])
    )

    return f"""
You are advising a new Indian e-commerce seller on festive season pricing.

Category: {category_name}
Marketplace: {source.title()}
Seller's base/landing cost: ₹{base_cost:,.0f}
Next festival: {festival_str}

Price + sales trend (last 8 weeks, units = estimated monthly sales):
{trend_str}

Stock-out risk: {stock_risk.get('risk_level', 'unknown').upper()}
  avg_monthly_units={stock_risk.get('avg_sv')}, peak_units={stock_risk.get('max_sv')}, ratio={stock_risk.get('ratio')}

Margin scenarios (after ~{margin_data.get('platform_fee_pct', 15):.0f}% platform fee):
{scenarios_str}

Respond in exactly 4 labelled sections:
1. FORECAST — Will demand rise or fall for the upcoming festival? Use the trend data.
2. PRICING STRATEGY — Which price scenario should the seller choose and why? Quote actual ₹ numbers.
3. STOCK PREP — How many units should they hold given the stock-out risk ratio?
4. TIMING — When exactly should they list? Days before the festival, accounting for sourcing lead time.

Be specific. Use actual numbers from above. No generic advice.
""".strip()


# ─────────────────────────────────────────────────────────────────────────────
# Input schemas
# ─────────────────────────────────────────────────────────────────────────────

SourceType = Literal["amazon", "flipkart"]


class ForecastRequest(BaseModel):
    category_name: str        = Field(..., min_length=1, max_length=120)
    source:        SourceType = "amazon"
    base_cost:     float      = Field(..., gt=0, description="Landing cost in ₹, must be > 0")

    @field_validator("category_name")
    @classmethod
    def strip_category(cls, v: str) -> str:
        return v.strip()

    @field_validator("source")
    @classmethod
    def lower_source(cls, v: str) -> str:
        return v.lower()


# ─────────────────────────────────────────────────────────────────────────────
# Shared param validation
# ─────────────────────────────────────────────────────────────────────────────

def _validate_source(source: str) -> str:
    s = source.lower().strip()
    if s not in ("amazon", "flipkart"):
        raise HTTPException(
            status_code=422,
            detail={"error": "invalid_source", "allowed": ["amazon", "flipkart"]},
        )
    return s


def _validate_category(category_name: str) -> str:
    c = category_name.strip()
    if not c or len(c) > 120:
        raise HTTPException(status_code=422, detail={"error": "invalid_category_name"})
    return c


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/calendar")
def festive_calendar(year: Optional[int] = Query(None, ge=2020, le=2035)):
    """
    FREE — Indian festive calendar for the given year (default: current year).
    Dates computed dynamically via ephem + hijridate — no hardcoded dict to maintain.
    """
    y      = year or date.today().year
    events = _enrich_calendar(y)
    if date.today().month >= 10:
        events += _enrich_calendar(y + 1)

    upcoming = _current_and_upcoming(events)
    return {
        "year":     y,
        "events":   events,
        "upcoming": upcoming,
        "today":    date.today().isoformat(),
    }


@router.get("/tier-info")
def tier_info(
    user_id: Optional[str] = Depends(get_current_user_id),
    db:      Session        = Depends(get_db),
):
    """FREE — Returns the authenticated user's current subscription tier."""
    tier = _get_user_tier(user_id, db)
    return {
        "tier":       tier,
        "user_id":    user_id,
        "is_basic":   _has_tier(tier, "basic"),
        "is_premium": _has_tier(tier, "premium"),
    }


@router.get("/overview")
def festive_overview(
    source:  str           = Query("amazon"),
    user_id: Optional[str] = Depends(get_optional_user_id),
    db:      Session       = Depends(get_db),
):
    """
    FREE — Top 3 trending categories by sales velocity.
    basic+ users see all 3 categories unlocked; free/anonymous see only index 0.
    Tier read from DB directly — never trusts the frontend.
    """
    source    = _validate_source(source)
    user_tier = _get_user_tier(user_id, db)
    unlocked  = _has_tier(user_tier, "basic")

    cats = (
        _flipkart_category_overview(db)
        if source == "flipkart"
        else _amazon_category_overview(db)
    )
    top3 = cats[:3]

    for i, cat in enumerate(top3):
        cat["locked"] = i > 0 and not unlocked
        if cat["locked"]:
            cat["avg_price"]        = None
            cat["avg_sales_volume"] = None
            cat["avg_rating"]       = None

    events   = _enrich_calendar(date.today().year)
    upcoming = _current_and_upcoming(events, limit=1)

    return {
        "source":          source,
        "top_categories":  top3,
        "next_festival":   upcoming[0] if upcoming else None,
        "user_tier":       user_tier,
        "upgrade_message": "Unlock Full Access (₹1,999/mo) to unlock all categories and 90-day trend charts.",
    }


@router.get("/trend-analysis")
def trend_analysis(
    category_name: str     = Query(..., min_length=1, max_length=120),
    source:        str     = Query("amazon"),
    user_id:       str     = Depends(get_current_user_id),
    db:            Session = Depends(get_db),
):
    """BASIC — Full 90-day price + velocity trend for a category."""
    source        = _validate_source(source)
    category_name = _validate_category(category_name)
    _check_tier(user_id, "basic", db)

    if source == "flipkart":
        trend      = _flipkart_price_trend(category_name, db)
        stock_risk = _stock_risk_flipkart(category_name, db)
    else:
        trend      = _amazon_price_trend(category_name, db)
        stock_risk = _stock_risk_amazon(category_name, db)

    velocity_all = _velocity_by_category(source, db)
    rank = next(
        (i + 1 for i, v in enumerate(velocity_all) if v["category_name"] == category_name),
        None,
    )

    price_delta_pct = None
    if len(trend) >= 2:
        old = trend[-2]["avg_price"]
        new = trend[-1]["avg_price"]
        if old and old > 0:
            price_delta_pct = round((new - old) / old * 100, 1)

    events   = _enrich_calendar(date.today().year)
    upcoming = _current_and_upcoming(events, limit=1)

    return {
        "category_name":   category_name,
        "source":          source,
        "price_trend":     trend,
        "stock_risk":      stock_risk,
        "velocity_all":    velocity_all,
        "velocity_rank":   rank,
        "price_delta_pct": price_delta_pct,
        "next_festival":   upcoming[0] if upcoming else None,
        "data_points":     len(trend),
    }


@router.get("/stock-risk")
def stock_risk(
    category_name: str     = Query(..., min_length=1, max_length=120),
    source:        str     = Query("amazon"),
    user_id:       str     = Depends(get_current_user_id),
    db:            Session = Depends(get_db),
):
    """BASIC — Stock-out risk score for a specific category."""
    source        = _validate_source(source)
    category_name = _validate_category(category_name)
    _check_tier(user_id, "basic", db)

    risk = (
        _stock_risk_flipkart(category_name, db)
        if source == "flipkart"
        else _stock_risk_amazon(category_name, db)
    )
    risk["category_name"] = category_name
    risk["source"]        = source
    return risk


@router.get("/launch-window")
def launch_window(
    category_name: str     = Query(..., min_length=1, max_length=120),
    source:        str     = Query("amazon"),
    user_id:       str     = Depends(get_current_user_id),
    db:            Session = Depends(get_db),
):
    """PREMIUM — Optimal listing window based on smoothed price inflection detection."""
    source        = _validate_source(source)
    category_name = _validate_category(category_name)
    _check_tier(user_id, "premium", db)

    result = _launch_window(category_name, source, db)
    result["category_name"] = category_name
    result["source"]        = source
    return result


@router.get("/margin-sim")
def margin_simulation(
    category_name: str     = Query(..., min_length=1, max_length=120),
    source:        str     = Query("amazon"),
    base_cost:     float   = Query(..., gt=0, description="Landing cost in ₹"),
    user_id:       str     = Depends(get_current_user_id),
    db:            Session = Depends(get_db),
):
    """PREMIUM — Margin simulation at market price bands using seller's base cost."""
    source        = _validate_source(source)
    category_name = _validate_category(category_name)
    _check_tier(user_id, "premium", db)

    result = _margin_sim(category_name, source, base_cost, db)
    result["category_name"] = category_name
    result["source"]        = source
    return result


@router.post("/ai/forecast")
async def ai_forecast(
    req:     ForecastRequest,
    user_id: str     = Depends(get_current_user_id),
    db:      Session = Depends(get_db),
):
    """
    PREMIUM · SSE — AI festive surge forecast streamed via Ollama (llama3.2:3b).
    Streams 4 sections: FORECAST / PRICING STRATEGY / STOCK PREP / TIMING.
    Free to run — local model, no API key, no cost per call.
    Returns 503 if Ollama is not running.
    """
    _check_tier(user_id, "premium", db)
    await _check_ollama()

    if req.source == "flipkart":
        trend      = _flipkart_price_trend(req.category_name, db)
        stock_risk = _stock_risk_flipkart(req.category_name, db)
    else:
        trend      = _amazon_price_trend(req.category_name, db)
        stock_risk = _stock_risk_amazon(req.category_name, db)

    margin_data   = _margin_sim(req.category_name, req.source, req.base_cost, db)
    events        = _enrich_calendar(date.today().year)
    upcoming      = _current_and_upcoming(events, limit=1)
    next_festival = upcoming[0] if upcoming else None

    prompt = _build_forecast_prompt(
        req.category_name,
        req.source,
        req.base_cost,
        trend,
        stock_risk,
        next_festival,
        margin_data,
    )
    return _sse(prompt)


@router.get("/ai/status")
async def ai_status():
    """Health-check for Ollama. Run `ollama serve` + `ollama pull llama3.2:3b` to fix offline status."""
    running = await ollama_is_running()
    return {
        "ollama_running": running,
        "model":          OLLAMA_MODEL,
        "status":         "ready" if running else "offline",
        "fix":            "Run `ollama serve` and `ollama pull llama3.2:3b`" if not running else None,
    }


@router.get("/categories")
def list_categories(
    source:  str           = Query("amazon"),
    user_id: Optional[str] = Depends(get_current_user_id),
    db:      Session       = Depends(get_db),
):
    """BASIC — All unique category names for a given source (for dropdown population)."""
    source = _validate_source(source)
    _check_tier(user_id, "basic", db)

    try:
        if source == "flipkart":
            rows = db.execute(text(
                "SELECT DISTINCT category_name FROM rapidapi_flipkart_products "
                "WHERE category_name IS NOT NULL ORDER BY category_name"
            )).fetchall()
        else:
            rows = db.execute(text(
                "SELECT DISTINCT category_name FROM rapidapi_amazon_products "
                "WHERE category_name IS NOT NULL ORDER BY category_name"
            )).fetchall()
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        logger.error("list_categories DB error: %s", e)
        raise HTTPException(
            status_code=500,
            detail={"error": "db_error", "message": "Could not fetch categories"},
        )

    return [{"category": r[0]} for r in rows]