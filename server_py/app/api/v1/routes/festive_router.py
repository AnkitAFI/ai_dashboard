"""
Festive Trend Feature — FastAPI Router
prefix: /festive

Tier access:
  FREE    → GET /festive/calendar
            GET /festive/overview         (top 3 categories, 1 only unlocked)
  BASIC   → GET /festive/trend-analysis   (90-day price + velocity, all categories)
            GET /festive/stock-risk
  PREMIUM → GET  /festive/launch-window
            GET  /festive/margin-sim
            POST /festive/ai/forecast     (SSE — Ollama / Claude)

Data sources:
  rapidapi_amazon_products   (amazon)
  rapidapi_flipkart_products (flipkart)
  users                      (subscription_tier gate)

All columns confirmed from models.py / DB schema shared in context.
"""

from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.profitability_service import require_tier
from app.services.ollama_service import (
    OLLAMA_MODEL,
    ollama_is_running,
    stream_ollama,
)

router = APIRouter(prefix="/festive", tags=["Festive Trends"])

# ─────────────────────────────────────────────────────────────────────────────
# Indian festive calendar — derived from real market spikes but also
# hardened with known dates so the free tier works even on fresh DBs.
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# Dynamic Indian Festive Calendar
# Handles shifting Lunar/Solar dates for 2025-2026 automatically.
# ─────────────────────────────────────────────────────────────────────────────

# Moving festivals mapping: (Month, Day_Start, Day_End)
MOVING_FESTIVALS = {
    "Holi": {
        2025: (3, 13, 15),
        2026: (3, 3, 5),
    },
    "Gudi Padwa / Ugadi": {
        2025: (3, 30, 31),
        2026: (3, 19, 20),
    },
    "Eid ul-Fitr": {
        2025: (3, 30, 31), # Approx
        2026: (3, 20, 21),
    },
    "Akshaya Tritiya": {
        2025: (4, 30, 30),
        2026: (5, 20, 20),
    },
    "Eid ul-Adha": {
        2025: (6, 6, 8),
        2026: (5, 26, 28),
    },
    "Raksha Bandhan": {
        2025: (8, 9, 9),
        2026: (8, 28, 28),
    },
    "Janmashtami": {
        2025: (8, 15, 16),
        2026: (9, 3, 4),
    },
    "Ganesh Chaturthi": {
        2025: (8, 27, 9, 5), # (Month, Day, EndMonth, EndDay) - handle overflow
        2026: (9, 14, 24),
    },
    "Navratri / Durga Puja": {
        2025: (9, 22, 10, 2),
        2026: (10, 11, 21),
    },
    "Dussehra": {
        2025: (10, 2, 3),
        2026: (10, 21, 22),
    },
    "Karwa Chauth": {
        2025: (10, 10, 10),
        2026: (10, 29, 29),
    },
    "Diwali / Big Billion": {
        2025: (10, 20, 21),
        2026: (11, 8, 9),
    },
    "Guru Nanak Jayanti": {
        2025: (11, 5, 5),
        2026: (11, 24, 24),
    },
}

# Fixed festivals mapping: (Month, Day_Start, Day_End)
FIXED_FESTIVALS = [
    {"name": "Lohri / Makar Sankranti", "month": 1, "ds": 13, "de": 15, "intensity": "medium", "emoji": "🔥"},
    {"name": "Republic Day Sale",      "month": 1, "ds": 20, "de": 26, "intensity": "medium", "emoji": "🇮🇳"},
    {"name": "Valentine's Week",       "month": 2, "ds": 7,  "de": 14, "intensity": "medium", "emoji": "💝"},
    {"name": "Independence Day",       "month": 8, "ds": 10, "de": 15, "intensity": "medium", "emoji": "🏏"},
    {"name": "Christmas / Year End",   "month": 12,"ds": 20, "de": 31, "intensity": "high",   "emoji": "🎄"},
]

# Additional metadata for intensity/emoji (for moving festivals)
FESTIVAL_META = {
    "Holi":                   {"intensity": "high",   "emoji": "🌈"},
    "Gudi Padwa / Ugadi":     {"intensity": "medium", "emoji": "🚩"},
    "Eid ul-Fitr":            {"intensity": "high",   "emoji": "🌙"},
    "Akshaya Tritiya":        {"intensity": "high",   "emoji": "💰"},
    "Eid ul-Adha":            {"intensity": "medium", "emoji": "🐐"},
    "Raksha Bandhan":         {"intensity": "high",   "emoji": "🧵"},
    "Janmashtami":            {"intensity": "medium", "emoji": "🏺"},
    "Ganesh Chaturthi":       {"intensity": "high",   "emoji": "🐘"},
    "Navratri / Durga Puja":  {"intensity": "high",   "emoji": "🪔"},
    "Dussehra":               {"intensity": "high",   "emoji": "🏹"},
    "Karwa Chauth":           {"intensity": "medium", "emoji": "🌕"},
    "Diwali / Big Billion":   {"intensity": "peak",   "emoji": "✨"},
    "Guru Nanak Jayanti":     {"intensity": "medium", "emoji": "🏮"},
}

INTENSITY_ORDER = {"peak": 4, "high": 3, "medium": 2, "low": 1}

SYSTEM_PROMPT = (
    "You are a senior e-commerce strategist specialising in Indian festive retail. "
    "You are concise, data-driven, and always give a specific actionable recommendation. "
    "Use ₹ for Indian Rupee. Never hedge without direction."
)

# ─────────────────────────────────────────────────────────────────────────────
# Tier guard (mirrors seller/optimize pattern)
# ─────────────────────────────────────────────────────────────────────────────

def _check_tier(user_id: Optional[str], required: str, db: Session) -> None:
    try:
        require_tier(user_id, required, db)
    except PermissionError:
        raise HTTPException(
            status_code=403,
            detail={"error": "upgrade_required", "required_tier": required},
        )


async def _check_ollama() -> None:
    if not await ollama_is_running():
        raise HTTPException(
            status_code=503,
            detail={"error": "ollama_offline", "message": "Run: ollama serve"},
        )


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
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# Calendar helpers
# ─────────────────────────────────────────────────────────────────────────────

def _enrich_calendar(year: int) -> list[dict]:
    today = date.today()
    enriched: list[dict] = []

    # 1. Add fixed festivals
    for f in FIXED_FESTIVALS:
        start = date(year, f["month"], f["ds"])
        end   = date(year, f["month"], f["de"])
        days_away = (start - today).days
        enriched.append({
            "name": f["name"],
            "intensity": f["intensity"],
            "emoji": f["emoji"],
            "year": year,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "days_away": days_away,
            "is_active": start <= today <= end,
            "is_upcoming": 0 <= days_away <= 60
        })

    # 2. Add moving festivals for the specific year
    for name, years in MOVING_FESTIVALS.items():
        if year in years:
            data = years[year]
            if len(data) == 3: # (M, DS, DE)
                m, ds, de = data
                start = date(year, m, ds)
                end   = date(year, m, de)
            else: # (M, DS, EM, DE) - handle month wrap
                m, ds, em, de = data
                start = date(year, m, ds)
                end   = date(year, em, de)
            
            meta = FESTIVAL_META.get(name, {"intensity": "medium", "emoji": "🗓️"})
            days_away = (start - today).days
            enriched.append({
                "name": name,
                **meta,
                "year": year,
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "days_away": days_away,
                "is_active": start <= today <= end,
                "is_upcoming": 0 <= days_away <= 60
            })

    enriched.sort(key=lambda x: x["start_date"])
    return enriched


def _current_and_upcoming(events: list[dict], limit: int = 6) -> list[dict]:
    today = date.today()
    future = [e for e in events if date.fromisoformat(e["end_date"]) >= today]
    return future[:limit]


# ─────────────────────────────────────────────────────────────────────────────
# DB helpers — Amazon
# ─────────────────────────────────────────────────────────────────────────────

def _amazon_category_overview(db: Session) -> list[dict]:
    """
    Top categories by avg_sales_volume from rapidapi_amazon_products.
    Returns: category_name, avg_price, avg_sales_volume, product_count
    """
    rows = db.execute(
        text("""
            SELECT
                category_name,
                COUNT(*)                    AS product_count,
                AVG(product_price_numeric)  AS avg_price,
                AVG(avg_sales_volume)       AS avg_sales_volume,
                AVG(product_star_rating_numeric) AS avg_rating
            FROM rapidapi_amazon_products
            WHERE product_price_numeric IS NOT NULL
              AND product_price_numeric > 0
            GROUP BY category_name
            ORDER BY AVG(avg_sales_volume) DESC NULLS LAST
            LIMIT 20
        """)
    ).mappings().all()
    return [
        {
            **dict(r),
            "avg_sales_volume": round((float(r["avg_sales_volume"] or 0) / float(r["product_count"] or 1000)) * 0.85, 0),
            "avg_price":        round(float(r["avg_price"] or 0), 0),
        }
        for r in rows
    ]


def _flipkart_category_overview(db: Session) -> list[dict]:
    """
    Top categories by avg_sales_volume from rapidapi_flipkart_products.
    """
    rows = db.execute(
        text("""
            SELECT
                category_name,
                COUNT(*)                       AS product_count,
                AVG(product_price::FLOAT)      AS avg_price,
                AVG(avg_sales_volume::FLOAT)   AS avg_sales_volume,
                AVG(product_star_rating::FLOAT) AS avg_rating
            FROM rapidapi_flipkart_products
            WHERE product_price IS NOT NULL
            GROUP BY category_name
            ORDER BY AVG(avg_sales_volume::FLOAT) DESC NULLS LAST
            LIMIT 20
        """)
    ).mappings().all()
    return [
        {
            **dict(r),
            "avg_sales_volume": round((float(r["avg_sales_volume"] or 0) / float(r["product_count"] or 1000)) * 0.8, 0),
            "avg_price":        round(float(r["avg_price"] or 0), 0),
        }
        for r in rows
    ]


def _amazon_price_trend(category_name: str, db: Session, days: int = 90) -> list[dict]:
    """
    Weekly price trend for a category — uses created_at as time axis.
    rapidapi_amazon_products stores historical snapshots via updated_at.
    """
    rows = db.execute(
        text("""
            SELECT
                DATE_TRUNC('week', created_at)   AS week,
                AVG(product_price_numeric)        AS avg_price,
                MIN(min_price)                    AS min_price,
                MAX(max_price)                    AS max_price,
                AVG(avg_sales_volume)             AS avg_sales_volume,
                COUNT(*)                          AS sample_size
            FROM rapidapi_amazon_products
            WHERE category_name = :cat
              AND product_price_numeric IS NOT NULL
              AND created_at >= NOW() - INTERVAL :days
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week ASC
        """),
        {"cat": category_name, "days": f"{days} days"},
    ).mappings().all()
    return [
        {
            "week":             r["week"].date().isoformat() if r["week"] else None,
            "avg_price":        round(float(r["avg_price"] or 0), 2),
            "min_price":        round(float(r["min_price"] or 0), 2),
            "max_price":        round(float(r["max_price"] or 0), 2),
            "avg_sv":           round((float(r["avg_sales_volume"] or 0) / 10000) * 0.75, 0),
            "sample_size":      int(r["sample_size"] or 0),
        }
        for r in rows
    ]


def _flipkart_price_trend(category_name: str, db: Session, days: int = 90) -> list[dict]:
    rows = db.execute(
        text("""
            SELECT
                DATE_TRUNC('week', created_at)         AS week,
                AVG(product_price::FLOAT)               AS avg_price,
                MIN(min_price::FLOAT)                   AS min_price,
                MAX(max_price::FLOAT)                   AS max_price,
                AVG(avg_sales_volume::FLOAT)            AS avg_sales_volume,
                COUNT(*)                                AS sample_size
            FROM rapidapi_flipkart_products
            WHERE category_name = :cat
              AND product_price IS NOT NULL
              AND created_at >= NOW() - INTERVAL :days
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week ASC
        """),
        {"cat": category_name, "days": f"{days} days"},
    ).mappings().all()
    return [
        {
            "week":             r["week"].date().isoformat() if r["week"] else None,
            "avg_price":        round(float(r["avg_price"] or 0), 2),
            "min_price":        round(float(r["min_price"] or 0), 2),
            "max_price":        round(float(r["max_price"] or 0), 2),
            "avg_sv":           round((float(r["avg_sales_volume"] or 0) / 10000) * 0.72, 0),
            "sample_size":      int(r["sample_size"] or 0),
        }
        for r in rows
    ]


def _stock_risk_amazon(category_name: str, db: Session) -> dict:
    """
    Stock-out risk: if max_sales_volume >> avg_sales_volume in festive periods.
    We look at the ratio; above 1.8 = high risk.
    """
    row = db.execute(
        text("""
            SELECT
                AVG(avg_sales_volume)   AS avg_sv,
                MAX(max_sales_volume)   AS max_sv,
                MIN(min_sales_volume)   AS min_sv,
                COUNT(*)                AS n
            FROM rapidapi_amazon_products
            WHERE category_name = :cat
              AND avg_sales_volume IS NOT NULL
        """),
        {"cat": category_name},
    ).mappings().first()
    if not row or not row["avg_sv"]:
        return {"risk_level": "unknown", "ratio": None, "avg_sv": None, "max_sv": None}

    avg_sv = (float(row["avg_sv"] or 0) / 10000) * 0.8
    max_sv = (float(row["max_sv"] or 0) / 10000) * 0.65
    ratio  = round(max_sv / avg_sv, 2) if avg_sv else 0

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
    row = db.execute(
        text("""
            SELECT
                AVG(avg_sales_volume::FLOAT)   AS avg_sv,
                MAX(max_sales_volume::FLOAT)   AS max_sv,
                MIN(min_sales_volume::FLOAT)   AS min_sv,
                COUNT(*)                       AS n
            FROM rapidapi_flipkart_products
            WHERE category_name = :cat
              AND avg_sales_volume IS NOT NULL
        """),
        {"cat": category_name},
    ).mappings().first()
    if not row or not row["avg_sv"]:
        return {"risk_level": "unknown", "ratio": None, "avg_sv": None, "max_sv": None}

    avg_sv = (float(row["avg_sv"] or 0) / 10000) * 0.75
    max_sv = (float(row["max_sv"] or 0) / 10000) * 0.6
    ratio  = round(max_sv / avg_sv, 2) if avg_sv else 0

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


def _velocity_by_category(source: str, db: Session) -> list[dict]:
    """
    Sales velocity (avg_sales_volume) by category — used in Basic trend analysis.
    """
    if source == "flipkart":
        rows = db.execute(text("""
            SELECT
                category_name,
                AVG(avg_sales_volume::FLOAT)  AS velocity,
                AVG(product_price::FLOAT)     AS avg_price,
                COUNT(*)                      AS products
            FROM rapidapi_flipkart_products
            WHERE avg_sales_volume IS NOT NULL
            GROUP BY category_name
            ORDER BY velocity DESC NULLS LAST
            LIMIT 15
        """)).mappings().all()
    else:
        rows = db.execute(text("""
            SELECT
                category_name,
                AVG(avg_sales_volume)         AS velocity,
                AVG(product_price_numeric)    AS avg_price,
                COUNT(*)                      AS products
            FROM rapidapi_amazon_products
            WHERE avg_sales_volume IS NOT NULL
            GROUP BY category_name
            ORDER BY velocity DESC NULLS LAST
            LIMIT 15
        """)).mappings().all()
    return [
        {
            "category_name": r["category_name"],
            "velocity":      round((float(r["velocity"] or 0) / float(r["products"] or 1000)) * 0.7, 0),
            "avg_price":     round(float(r["avg_price"] or 0), 2),
            "products":      int(r["products"] or 0),
        }
        for r in rows
    ]


def _launch_window(category_name: str, source: str, db: Session) -> dict:
    """
    PREMIUM: Find the optimal listing window by detecting the price inflection
    point in the 90-day trend — when prices start climbing = best time to list.
    """
    if source == "flipkart":
        rows = db.execute(
            text("""
                SELECT
                    DATE_TRUNC('week', created_at)         AS week,
                    AVG(product_price::FLOAT)               AS avg_price,
                    AVG(avg_sales_volume::FLOAT)            AS avg_sv
                FROM rapidapi_flipkart_products
                WHERE category_name = :cat
                  AND product_price IS NOT NULL
                  AND created_at >= NOW() - INTERVAL '90 days'
                GROUP BY DATE_TRUNC('week', created_at)
                ORDER BY week ASC
            """),
            {"cat": category_name},
        ).mappings().all()
    else:
        rows = db.execute(
            text("""
                SELECT
                    DATE_TRUNC('week', created_at)  AS week,
                    AVG(product_price_numeric)       AS avg_price,
                    AVG(avg_sales_volume)            AS avg_sv
                FROM rapidapi_amazon_products
                WHERE category_name = :cat
                  AND product_price_numeric IS NOT NULL
                  AND created_at >= NOW() - INTERVAL '90 days'
                GROUP BY DATE_TRUNC('week', created_at)
                ORDER BY week ASC
            """),
            {"cat": category_name},
        ).mappings().all()

    if len(rows) < 3:
        return {
            "optimal_week":    None,
            "recommendation":  "Insufficient data for launch window calculation.",
            "price_trend":     [],
            "weeks_available": 0,
        }

    trend = [
        {
            "week":      r["week"].date().isoformat() if r["week"] else None,
            "avg_price": round(float(r["avg_price"] or 0), 2),
            "avg_sv":    round(float(r["avg_sv"] or 0), 0),
        }
        for r in rows
    ]

    # Find week with steepest upward price slope (price rising + sales rising = prime window)
    best_week = None
    best_score = -9999
    for i in range(1, len(trend) - 1):
        price_delta = trend[i]["avg_price"] - trend[i - 1]["avg_price"]
        sv_delta    = trend[i]["avg_sv"]    - trend[i - 1]["avg_sv"]
        score       = price_delta + sv_delta * 0.001  # normalise scale
        if score > best_score:
            best_score = score
            best_week  = trend[i]["week"]

    # Days until best week
    if best_week:
        delta_days = (date.fromisoformat(best_week) - date.today()).days
        if delta_days <= 0:
            rec = "The optimal window appears to have passed — list NOW before the next festive peak."
        elif delta_days <= 7:
            rec = f"List within the next {delta_days} days to ride the price inflection."
        else:
            rec = f"Optimal window starts around {best_week} ({delta_days} days away). Prepare inventory now."
    else:
        rec = "No clear inflection detected. List at any time and monitor weekly."

    return {
        "optimal_week":    best_week,
        "recommendation":  rec,
        "price_trend":     trend,
        "weeks_available": len(trend),
        "best_score":      round(best_score, 4),
    }


def _margin_sim(
    category_name: str,
    source: str,
    base_cost: float,
    db: Session,
) -> dict:
    """
    PREMIUM: Simulate margins at different festive price points.
    Uses avg/min/max from DB + base_cost supplied by user.
    """
    if source == "flipkart":
        row = db.execute(
            text("""
                SELECT
                    AVG(product_price::FLOAT)  AS avg_p,
                    MIN(min_price::FLOAT)       AS min_p,
                    MAX(max_price::FLOAT)       AS max_p,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY product_price::FLOAT) AS p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY product_price::FLOAT) AS p75
                FROM rapidapi_flipkart_products
                WHERE category_name = :cat AND product_price IS NOT NULL
            """),
            {"cat": category_name},
        ).mappings().first()
    else:
        row = db.execute(
            text("""
                SELECT
                    AVG(product_price_numeric)   AS avg_p,
                    MIN(min_price)               AS min_p,
                    MAX(max_price)               AS max_p,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY product_price_numeric) AS p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY product_price_numeric) AS p75
                FROM rapidapi_amazon_products
                WHERE category_name = :cat AND product_price_numeric IS NOT NULL
            """),
            {"cat": category_name},
        ).mappings().first()

    if not row or not row["avg_p"]:
        return {"error": "No price data for this category"}

    avg_p = float(row["avg_p"] or 0)
    min_p = float(row["min_p"] or 0)
    max_p = float(row["max_p"] or 0)
    p25   = float(row["p25"] or 0)
    p75   = float(row["p75"] or 0)

    # Simulate margins at: floor (p25), market (avg), premium (p75), ceiling (max*0.9)
    scenarios = [
        {"label": "Floor",      "price": round(p25, 2)},
        {"label": "Market avg", "price": round(avg_p, 2)},
        {"label": "Premium",    "price": round(p75, 2)},
        {"label": "Ceiling",    "price": round(min(max_p * 0.9, p75 * 1.5), 2)},
    ]
    for sc in scenarios:
        gross_margin  = sc["price"] - base_cost
        margin_pct    = (gross_margin / sc["price"] * 100) if sc["price"] else 0
        # Rough platform fee: Amazon ~15%, Flipkart ~12%
        platform_fee  = sc["price"] * (0.15 if source == "amazon" else 0.12)
        net_margin    = gross_margin - platform_fee
        net_pct       = (net_margin / sc["price"] * 100) if sc["price"] else 0
        sc.update({
            "gross_margin":  round(gross_margin, 2),
            "gross_pct":     round(margin_pct, 1),
            "platform_fee":  round(platform_fee, 2),
            "net_margin":    round(net_margin, 2),
            "net_pct":       round(net_pct, 1),
            "viable":        net_margin > 0,
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
    }


# ─────────────────────────────────────────────────────────────────────────────
# AI prompt builder
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
        f"  Week {t['week']}: avg price ₹{t['avg_price']}, sales volume {t['avg_sv']} units"
        for t in trend[-8:]
    ) or "No trend data available."

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

Price + sales trend (last 8 weeks, units represent a benchmark top-tier product):
{trend_str}

Stock-out risk: {stock_risk.get('risk_level', 'unknown').upper()}
  avg_units_per_benchmark_product={stock_risk.get('avg_sv')}, max_units={stock_risk.get('max_sv')}, ratio={stock_risk.get('ratio')}

Margin scenarios (after ~{15 if source == 'amazon' else 12}% platform fee):
{scenarios_str}

Respond in exactly 4 labelled sections:
1. FORECAST — Will demand in this category rise or fall for the upcoming festival? Use the trend data.
2. PRICING STRATEGY — Which price scenario should the seller choose and why? Quote actual ₹ numbers.
3. STOCK PREP — How much inventory should they hold given the stock-out risk ratio?
4. TIMING — When exactly should they list? Days before the festival, considering lead times.

Be specific. Use actual numbers from above. No generic advice.
""".strip()


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    category_name: str
    source:        str = "amazon"       # "amazon" | "flipkart"
    base_cost:     float
    user_id:       Optional[str] = None
    user_email:    Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/calendar")
def festive_calendar(year: Optional[int] = Query(None)):
    """
    FREE — Indian festive calendar for the given year (default: current year).
    Returns all events + upcoming (next 60 days) highlighted.
    No DB query needed — derived from hardcoded + enriched calendar.
    """
    y      = year or date.today().year
    events = _enrich_calendar(y)
    # also pull next year so calendar never looks empty in Nov/Dec
    if date.today().month >= 10:
        events += _enrich_calendar(y + 1)

    upcoming = _current_and_upcoming(events)
    return {
        "year":     y,
        "events":   events,
        "upcoming": upcoming,
        "today":    date.today().isoformat(),
    }


@router.get("/overview")
def festive_overview(
    source:     str              = Query("amazon"),
    user_id:    Optional[str]   = Query(None),
    user_email: Optional[str]   = Query(None),
    db:         Session          = Depends(get_db),
):
    """
    FREE — Top 3 trending categories by sales velocity.
    Only category_name + velocity shown; no price detail.
    One category locked (index 0 only fully shown).
    """
    if source == "flipkart":
        cats = _flipkart_category_overview(db)
    else:
        cats = _amazon_category_overview(db)

    top3 = cats[:3]
    # mask index 1 and 2 for free users — show name but blur metrics
    for i, cat in enumerate(top3):
        cat["locked"] = i > 0   # index 0 is free, rest need upgrade
        if cat["locked"]:
            cat["avg_price"]        = None
            cat["avg_sales_volume"] = None
            cat["avg_rating"]       = None

    # Find next upcoming festival
    events   = _enrich_calendar(date.today().year)
    upcoming = _current_and_upcoming(events, limit=1)

    return {
        "source":           source,
        "top_categories":   top3,
        "next_festival":    upcoming[0] if upcoming else None,
        "upgrade_message":  "Upgrade to Basic (₹1,999/mo) to unlock all categories and 90-day trend charts.",
    }


@router.get("/trend-analysis")
def trend_analysis(
    category_name: str            = Query(...),
    source:        str            = Query("amazon"),
    user_id:       Optional[str]  = Query(None),
    user_email:    Optional[str]  = Query(None),
    db:            Session         = Depends(get_db),
):
    """
    BASIC — Full 90-day price + velocity trend for a category.
    Includes stock-out risk score and all-category velocity comparison.
    """
    _check_tier(user_id, "basic", db)

    if source == "flipkart":
        trend       = _flipkart_price_trend(category_name, db)
        stock_risk  = _stock_risk_flipkart(category_name, db)
    else:
        trend       = _amazon_price_trend(category_name, db)
        stock_risk  = _stock_risk_amazon(category_name, db)

    velocity_all = _velocity_by_category(source, db)

    # Category rank in velocity
    rank = next(
        (i + 1 for i, v in enumerate(velocity_all) if v["category_name"] == category_name),
        None,
    )

    # Trend delta: compare last 2 weeks
    price_delta_pct = None
    if len(trend) >= 2:
        old = trend[-2]["avg_price"]
        new = trend[-1]["avg_price"]
        if old:
            price_delta_pct = round((new - old) / old * 100, 1)

    # Upcoming festival
    events   = _enrich_calendar(date.today().year)
    upcoming = _current_and_upcoming(events, limit=1)

    return {
        "category_name":    category_name,
        "source":           source,
        "price_trend":      trend,
        "stock_risk":       stock_risk,
        "velocity_all":     velocity_all,
        "velocity_rank":    rank,
        "price_delta_pct":  price_delta_pct,
        "next_festival":    upcoming[0] if upcoming else None,
        "data_points":      len(trend),
    }


@router.get("/stock-risk")
def stock_risk(
    category_name: str            = Query(...),
    source:        str            = Query("amazon"),
    user_id:       Optional[str]  = Query(None),
    user_email:    Optional[str]  = Query(None),
    db:            Session         = Depends(get_db),
):
    """BASIC — Stock-out risk score for a specific category."""
    _check_tier(user_id, "basic", db)
    if source == "flipkart":
        risk = _stock_risk_flipkart(category_name, db)
    else:
        risk = _stock_risk_amazon(category_name, db)

    risk["category_name"] = category_name
    risk["source"]        = source
    return risk


@router.get("/launch-window")
def launch_window(
    category_name: str            = Query(...),
    source:        str            = Query("amazon"),
    user_id:       Optional[str]  = Query(None),
    user_email:    Optional[str]  = Query(None),
    db:            Session         = Depends(get_db),
):
    """PREMIUM — Optimal listing window based on price inflection detection."""
    _check_tier(user_id, "premium", db)
    result = _launch_window(category_name, source, db)
    result["category_name"] = category_name
    result["source"]        = source
    return result


@router.get("/margin-sim")
def margin_simulation(
    category_name: str            = Query(...),
    source:        str            = Query("amazon"),
    base_cost:     float          = Query(..., description="Landing cost in ₹"),
    user_id:       Optional[str]  = Query(None),
    user_email:    Optional[str]  = Query(None),
    db:            Session         = Depends(get_db),
):
    """PREMIUM — Margin simulation at market price bands using base_cost."""
    _check_tier(user_id, "premium", db)
    result = _margin_sim(category_name, source, base_cost, db)
    result["category_name"] = category_name
    result["source"]        = source
    return result


@router.post("/ai/forecast")
async def ai_forecast(req: ForecastRequest, db: Session = Depends(get_db)):
    """
    PREMIUM · SSE — AI surge forecast via Ollama.
    Streams: forecast / pricing strategy / stock prep / timing.
    """
    _check_tier(req.user_id, "premium", db)
    await _check_ollama()

    # Gather data
    if req.source == "flipkart":
        trend      = _flipkart_price_trend(req.category_name, db)
        stock_risk = _stock_risk_flipkart(req.category_name, db)
    else:
        trend      = _amazon_price_trend(req.category_name, db)
        stock_risk = _stock_risk_amazon(req.category_name, db)

    margin_data  = _margin_sim(req.category_name, req.source, req.base_cost, db)
    events       = _enrich_calendar(date.today().year)
    upcoming     = _current_and_upcoming(events, limit=1)
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
    """Ollama status check — mirrors seller optimizer pattern."""
    running = await ollama_is_running()
    return {"ollama_running": running, "model": OLLAMA_MODEL, "status": "ready" if running else "offline"}


@router.get("/categories")
def list_categories(
    source:     str            = Query("amazon"),
    user_id:    Optional[str]  = Query(None),
    user_email: Optional[str]  = Query(None),
    db:         Session         = Depends(get_db),
):
    """
    BASIC — List all unique categories for a given source.
    Used to populate the category dropdown in the frontend.
    """
    _check_tier(user_id, "basic", db)
    if source == "flipkart":
        rows = db.execute(
            text("SELECT DISTINCT category_name FROM rapidapi_flipkart_products WHERE category_name IS NOT NULL ORDER BY category_name")
        ).fetchall()
    else:
        rows = db.execute(
            text("SELECT DISTINCT category_name FROM rapidapi_amazon_products WHERE category_name IS NOT NULL ORDER BY category_name")
        ).fetchall()
    return [{"category": r[0]} for r in rows]