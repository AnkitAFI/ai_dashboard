# app/services/profitability_service.py

import math
import logging
from typing import Optional, Tuple, List
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.profitability import (
    ProfitabilityInput, CostBreakdown, ProfitAlert,
    ScenarioResult, SensitivityPoint,
    MarketBenchmarks, PriceBand,
    HealthMetric, ActionRecommendation,
)

logger = logging.getLogger(__name__)


# ── Tier config ────────────────────────────────────────────────────────────────

TIER_ORDER = {"free": 0, "basic": 1, "premium": 2}

TIER_FEATURES = {
    "free": {
        "save_limit": 0,
        "scenarios": False,
        "market_intel": False,
        "health": False,
        "export": False,
        "advanced_inputs": False,
        "ai_chat": False,
        "ai_analysis": False,
    },
    "basic": {
        "save_limit": 5,
        "scenarios": False,
        "market_intel": False,
        "health": False,
        "export": False,
        "advanced_inputs": True,
        "ai_chat": True,
        "ai_analysis": False,
    },
    "premium": {
        "save_limit": 9999,
        "scenarios": True,
        "market_intel": True,
        "health": True,
        "export": True,
        "advanced_inputs": True,
        "ai_chat": True,
        "ai_analysis": True,
    },
}


def get_user_tier(user_id: Optional[str], db: Session) -> str:
    if not user_id:
        return "free"
    row = db.execute(
        text("SELECT subscription_tier FROM users WHERE id = :uid LIMIT 1"),
        {"uid": user_id},
    ).fetchone()
    return str(row[0]).lower() if row and row[0] else "free"


def require_tier(user_id: Optional[str], required: str, db: Session) -> str:
    tier = get_user_tier(user_id, db)
    if TIER_ORDER.get(tier, 0) < TIER_ORDER.get(required, 0):
        raise PermissionError(f"upgrade_required:{required}")
    return tier


# ── Core calculation ───────────────────────────────────────────────────────────

def calculate_unit_economics(inp: ProfitabilityInput) -> dict:
    referral    = inp.selling_price * (inp.referral_fee_pct / 100)
    return_cost = inp.selling_price * (inp.return_rate_pct / 100) * 0.5
    total_cost  = (
        inp.product_cost
        + inp.shipping_to_fba
        + inp.fba_fee
        + referral
        + inp.ad_spend_per_unit
        + inp.storage_fee_per_unit
        + return_cost
    )
    profit         = inp.selling_price - total_cost
    margin_pct     = (profit / inp.selling_price * 100) if inp.selling_price else 0
    roi_pct        = (profit / inp.product_cost * 100) if inp.product_cost else 0
    acos_pct       = (inp.ad_spend_per_unit / inp.selling_price * 100) if inp.selling_price else 0
    monthly_profit = profit * inp.monthly_units
    breakeven      = math.ceil(total_cost / profit) if profit > 0 else 9999

    breakdown = CostBreakdown(
        product_cost    = round(inp.product_cost, 2),
        shipping_to_fba = round(inp.shipping_to_fba, 2),
        fba_fee         = round(inp.fba_fee, 2),
        referral_fee    = round(referral, 2),
        ad_spend        = round(inp.ad_spend_per_unit, 2),
        storage_fee     = round(inp.storage_fee_per_unit, 2),
        return_cost     = round(return_cost, 2),
    )

    alerts = _generate_alerts(margin_pct, acos_pct, inp.return_rate_pct, profit)

    return {
        "selling_price":   round(inp.selling_price, 2),
        "total_cost":      round(total_cost, 2),
        "profit_per_unit": round(profit, 2),
        "net_margin_pct":  round(margin_pct, 2),
        "roi_pct":         round(roi_pct, 2),
        "acos_pct":        round(acos_pct, 2),
        "monthly_profit":  round(monthly_profit, 2),
        "yearly_profit":   round(monthly_profit * 12, 2),
        "breakeven_units": breakeven,
        "cost_breakdown":  breakdown,
        "alerts":          alerts,
    }


def _generate_alerts(margin: float, acos: float, return_rate: float, profit: float) -> List[ProfitAlert]:
    alerts = []
    if profit < 0:
        alerts.append(ProfitAlert(type="danger",
            message="You are losing money on every sale. Increase price or cut costs immediately."))
    elif margin < 10:
        alerts.append(ProfitAlert(type="danger",
            message=f"Margin critically low at {margin:.1f}%. Any Amazon fee increase pushes you negative."))
    elif margin < 20:
        alerts.append(ProfitAlert(type="warn",
            message=f"Margin at {margin:.1f}% is thin. Build buffer before scaling ads."))
    else:
        alerts.append(ProfitAlert(type="success",
            message=f"Healthy {margin:.1f}% margin. Room to increase ad spend and climb BSR."))

    if acos > 30:
        alerts.append(ProfitAlert(type="danger",
            message=f"ACOS at {acos:.1f}% is very high. Pause underperforming keywords immediately."))
    elif acos > 20:
        alerts.append(ProfitAlert(type="warn",
            message=f"ACOS {acos:.1f}% exceeds the 20% benchmark. Review bidding strategy."))

    if return_rate > 15:
        alerts.append(ProfitAlert(type="danger",
            message=f"Return rate of {return_rate:.0f}% is severe. Investigate product quality and listing accuracy."))
    elif return_rate > 8:
        alerts.append(ProfitAlert(type="warn",
            message=f"Return rate of {return_rate:.0f}% is above normal. Check top return reasons."))

    return alerts


# ── Scenarios ──────────────────────────────────────────────────────────────────

def build_scenarios(base: ProfitabilityInput) -> Tuple[List[ScenarioResult], List[SensitivityPoint]]:
    def _run(price_mult: float, ads_mult: float, units_mult: float):
        mod = ProfitabilityInput(
            selling_price        = base.selling_price * price_mult,
            product_cost         = base.product_cost,
            shipping_to_fba      = base.shipping_to_fba,
            fba_fee              = base.fba_fee,
            ad_spend_per_unit    = base.ad_spend_per_unit * ads_mult,
            monthly_units        = int(base.monthly_units * units_mult),
            return_rate_pct      = base.return_rate_pct,
            storage_fee_per_unit = base.storage_fee_per_unit,
            referral_fee_pct     = base.referral_fee_pct,
        )
        return calculate_unit_economics(mod), mod

    configs = [
        ("Conservative",      "#6b7280", 1.0,  0.7,  0.85),
        ("Current",           "#10b981", 1.0,  1.0,  1.0),
        ("Aggressive growth", "#f59e0b", 0.92, 1.5,  1.4),
        ("Premium pricing",   "#3b82f6", 1.15, 0.85, 0.85),
    ]

    scenarios = []
    for label, color, pm, am, um in configs:
        econ, mod = _run(pm, am, um)
        scenarios.append(ScenarioResult(
            label           = label,
            color           = color,
            selling_price   = round(mod.selling_price, 2),
            ad_spend        = round(mod.ad_spend_per_unit, 2),
            units           = mod.monthly_units,
            profit_per_unit = econ["profit_per_unit"],
            net_margin_pct  = econ["net_margin_pct"],
            monthly_profit  = econ["monthly_profit"],
            roi_pct         = econ["roi_pct"],
            acos_pct        = econ["acos_pct"],
        ))

    sensitivity = []
    for i in range(70, 141, 5):
        econ, mod = _run(i / 100, 1.0, 1.0)
        sensitivity.append(SensitivityPoint(
            price      = round(mod.selling_price),
            margin_pct = econ["net_margin_pct"],
            profit     = econ["profit_per_unit"],
        ))

    return scenarios, sensitivity


# ── Market Intel — real DB queries ─────────────────────────────────────────────

def get_categories_from_db(marketplace: str, db: Session) -> List[str]:
    """Pull distinct categories from the real table."""
    try:
        if marketplace == "amazon":
            rows = db.execute(text("""
                SELECT DISTINCT category_name
                FROM rapidapi_amazon_products
                WHERE category_name IS NOT NULL
                  AND category_name != ''
                ORDER BY category_name
            """)).fetchall()
        else:
            rows = db.execute(text("""
                SELECT DISTINCT category_name
                FROM rapidapi_flipkart_products
                WHERE category_name IS NOT NULL
                  AND category_name != ''
                ORDER BY category_name
            """)).fetchall()
        return [r[0] for r in rows if r[0]]
    except Exception as e:
        logger.error(f"get_categories error: {e}")
        return []


def get_market_intel(
    category: str,
    marketplace: str,
    selling_price: Optional[float],
    db: Session,
) -> Tuple[MarketBenchmarks, List[PriceBand], Optional[str], str]:
    """
    Pulls real aggregated data from rapidapi_amazon_products or
    rapidapi_flipkart_products. No stub data anywhere.
    """
    try:
        if marketplace == "amazon":
            benchmarks, top_brands = _amazon_benchmarks(category, db)
            price_bands            = _amazon_price_bands(category, db)
        else:
            benchmarks, top_brands = _flipkart_benchmarks(category, db)
            price_bands            = _flipkart_price_bands(category, db)

        # Price position relative to market
        price_position = None
        if selling_price and benchmarks.avg_price:
            if selling_price < benchmarks.avg_price * 0.85:
                price_position = "Below market"
            elif selling_price > benchmarks.avg_price * 1.15:
                price_position = "Above market"
            else:
                price_position = "At market"

        # Build insight string from real numbers
        discount_str = (
            f" Competitors discount {benchmarks.mrp_discount_depth_pct:.0f}% from MRP."
            if benchmarks.mrp_discount_depth_pct else ""
        )
        rating_str = (
            f" Average rating is {benchmarks.avg_rating:.1f}★."
            if benchmarks.avg_rating else ""
        )
        vol_str = (
            f" Top sellers move ~{benchmarks.avg_sales_volume:,.0f} units/month."
            if benchmarks.avg_sales_volume else ""
        )
        insight = (
            f"{category} on {marketplace.capitalize()}: {benchmarks.num_products} products across "
            f"{len(top_brands)} brands. Avg price ₹{benchmarks.avg_price:,.0f} "
            f"(range ₹{benchmarks.min_price:,.0f}–₹{benchmarks.max_price:,.0f})."
            f"{discount_str}{rating_str}{vol_str}"
        )

        return benchmarks, price_bands, price_position, insight

    except Exception as e:
        logger.error(f"get_market_intel error: {e}")
        raise


def _amazon_benchmarks(category: str, db: Session) -> Tuple[MarketBenchmarks, List[str]]:
    row = db.execute(text("""
        SELECT
            ROUND(AVG(product_price_numeric)::NUMERIC, 2)                        AS avg_price,
            ROUND(MIN(product_price_numeric)::NUMERIC, 2)                        AS min_price,
            ROUND(MAX(product_price_numeric)::NUMERIC, 2)                        AS max_price,
            ROUND(AVG(product_star_rating_numeric)::NUMERIC, 2)                  AS avg_rating,
            ROUND(AVG(avg_sales_volume)::NUMERIC, 0)                             AS avg_sales_volume,
            ROUND(AVG(
                CASE
                    WHEN product_original_price_numeric > 0
                    THEN (product_original_price_numeric - product_price_numeric)
                         / product_original_price_numeric * 100
                    ELSE NULL
                END
            )::NUMERIC, 1)                                                        AS mrp_discount_depth_pct,
            COUNT(*)                                                              AS num_products
        FROM rapidapi_amazon_products
        WHERE category_name ILIKE :cat
          AND product_price_numeric > 0
    """), {"cat": f"%{category}%"}).fetchone()

    # Top brands by product count
    brand_rows = db.execute(text("""
        SELECT
            COALESCE(
                raw_data->>'brand',
                SPLIT_PART(product_title, ' ', 1)
            ) AS brand,
            COUNT(*) AS cnt
        FROM rapidapi_amazon_products
        WHERE category_name ILIKE :cat
          AND product_price_numeric > 0
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT 8
    """), {"cat": f"%{category}%"}).fetchall()

    top_brands = [r[0] for r in brand_rows if r[0]]

    benchmarks = MarketBenchmarks(
        avg_price              = float(row[0] or 0),
        min_price              = float(row[1] or 0),
        max_price              = float(row[2] or 0),
        avg_rating             = float(row[3]) if row[3] else None,
        avg_sales_volume       = float(row[4]) if row[4] else None,
        mrp_discount_depth_pct = float(row[5]) if row[5] else None,
        num_products           = int(row[6] or 0),
        top_brands             = top_brands,
        category               = category,
        marketplace            = "amazon",
    )
    return benchmarks, top_brands


def _amazon_price_bands(category: str, db: Session) -> List[PriceBand]:
    """
    Split price range into 6 bands and count brands + products in each.
    """
    bounds = db.execute(text("""
        SELECT
            MIN(product_price_numeric),
            MAX(product_price_numeric)
        FROM rapidapi_amazon_products
        WHERE category_name ILIKE :cat
          AND product_price_numeric > 0
    """), {"cat": f"%{category}%"}).fetchone()

    lo, hi = float(bounds[0] or 0), float(bounds[1] or 0)
    if hi <= lo:
        return []

    band_size = (hi - lo) / 6
    bands = []
    for i in range(6):
        b_lo = lo + i * band_size
        b_hi = lo + (i + 1) * band_size

        row = db.execute(text("""
            SELECT
                COUNT(DISTINCT COALESCE(raw_data->>'brand', SPLIT_PART(product_title,' ',1))) AS brand_count,
                COUNT(*)                                                                       AS product_count,
                ROUND(AVG(product_star_rating_numeric)::NUMERIC, 2)                           AS avg_rating
            FROM rapidapi_amazon_products
            WHERE category_name ILIKE :cat
              AND product_price_numeric >= :lo
              AND product_price_numeric <  :hi
        """), {"cat": f"%{category}%", "lo": b_lo, "hi": b_hi}).fetchone()

        brand_count   = int(row[0] or 0)
        product_count = int(row[1] or 0)
        avg_rating    = float(row[2]) if row[2] else None

        # Opportunity: fewer brands = more room
        if brand_count == 0:
            opportunity = "High"
        elif brand_count <= 3:
            opportunity = "High"
        elif brand_count <= 8:
            opportunity = "Medium"
        elif brand_count <= 15:
            opportunity = "Low"
        else:
            opportunity = "Crowded"

        bands.append(PriceBand(
            band          = f"₹{b_lo:,.0f}–₹{b_hi:,.0f}",
            band_lo       = round(b_lo, 2),
            band_hi       = round(b_hi, 2),
            brand_count   = brand_count,
            product_count = product_count,
            avg_rating    = avg_rating,
            opportunity   = opportunity,
        ))
    return bands


def _flipkart_benchmarks(category: str, db: Session) -> Tuple[MarketBenchmarks, List[str]]:
    row = db.execute(text("""
        SELECT
            ROUND(AVG(product_price)::NUMERIC, 2)                               AS avg_price,
            ROUND(MIN(product_price)::NUMERIC, 2)                               AS min_price,
            ROUND(MAX(product_price)::NUMERIC, 2)                               AS max_price,
            ROUND(AVG(product_star_rating)::NUMERIC, 2)                         AS avg_rating,
            ROUND(AVG(avg_sales_volume)::NUMERIC, 0)                            AS avg_sales_volume,
            ROUND(AVG(
                CASE
                    WHEN product_mrp > 0
                    THEN (product_mrp - product_price) / product_mrp * 100
                    ELSE NULL
                END
            )::NUMERIC, 1)                                                       AS mrp_discount_depth_pct,
            COUNT(*)                                                             AS num_products
        FROM rapidapi_flipkart_products
        WHERE category_name ILIKE :cat
          AND product_price > 0
    """), {"cat": f"%{category}%"}).fetchone()

    brand_rows = db.execute(text("""
        SELECT brand, COUNT(*) AS cnt
        FROM rapidapi_flipkart_products
        WHERE category_name ILIKE :cat
          AND product_price > 0
          AND brand IS NOT NULL
          AND brand != ''
        GROUP BY brand
        ORDER BY cnt DESC
        LIMIT 8
    """), {"cat": f"%{category}%"}).fetchall()

    top_brands = [r[0] for r in brand_rows if r[0]]

    benchmarks = MarketBenchmarks(
        avg_price              = float(row[0] or 0),
        min_price              = float(row[1] or 0),
        max_price              = float(row[2] or 0),
        avg_rating             = float(row[3]) if row[3] else None,
        avg_sales_volume       = float(row[4]) if row[4] else None,
        mrp_discount_depth_pct = float(row[5]) if row[5] else None,
        num_products           = int(row[6] or 0),
        top_brands             = top_brands,
        category               = category,
        marketplace            = "flipkart",
    )
    return benchmarks, top_brands


def _flipkart_price_bands(category: str, db: Session) -> List[PriceBand]:
    bounds = db.execute(text("""
        SELECT MIN(product_price), MAX(product_price)
        FROM rapidapi_flipkart_products
        WHERE category_name ILIKE :cat AND product_price > 0
    """), {"cat": f"%{category}%"}).fetchone()

    lo, hi = float(bounds[0] or 0), float(bounds[1] or 0)
    if hi <= lo:
        return []

    band_size = (hi - lo) / 6
    bands = []
    for i in range(6):
        b_lo = lo + i * band_size
        b_hi = lo + (i + 1) * band_size

        row = db.execute(text("""
            SELECT
                COUNT(DISTINCT brand)  AS brand_count,
                COUNT(*)               AS product_count,
                ROUND(AVG(product_star_rating)::NUMERIC, 2) AS avg_rating
            FROM rapidapi_flipkart_products
            WHERE category_name ILIKE :cat
              AND product_price >= :lo
              AND product_price <  :hi
        """), {"cat": f"%{category}%", "lo": b_lo, "hi": b_hi}).fetchone()

        brand_count   = int(row[0] or 0)
        product_count = int(row[1] or 0)
        avg_rating    = float(row[2]) if row[2] else None
        opportunity   = (
            "High" if brand_count <= 3 else
            "Medium" if brand_count <= 8 else
            "Low" if brand_count <= 15 else
            "Crowded"
        )
        bands.append(PriceBand(
            band          = f"₹{b_lo:,.0f}–₹{b_hi:,.0f}",
            band_lo       = round(b_lo, 2),
            band_hi       = round(b_hi, 2),
            brand_count   = brand_count,
            product_count = product_count,
            avg_rating    = avg_rating,
            opportunity   = opportunity,
        ))
    return bands


# ── Business health ────────────────────────────────────────────────────────────

def compute_health(
    inp: ProfitabilityInput,
) -> Tuple[float, str, List[HealthMetric], List[ActionRecommendation]]:
    econ   = calculate_unit_economics(inp)
    margin = econ["net_margin_pct"]
    acos   = econ["acos_pct"]
    ret    = inp.return_rate_pct
    units  = inp.monthly_units
    roi    = econ["roi_pct"]

    metrics = [
        HealthMetric(
            label  = "Margin health",
            score  = min(100, max(0, margin * 3.5)),
            status = "good" if margin > 20 else ("warn" if margin > 10 else "bad"),
            detail = f"{margin:.1f}% net margin",
        ),
        HealthMetric(
            label  = "Ad efficiency",
            score  = min(100, max(0, 100 - acos * 2.5)),
            status = "good" if acos < 20 else ("warn" if acos < 30 else "bad"),
            detail = f"{acos:.1f}% ACOS",
        ),
        HealthMetric(
            label  = "Return rate risk",
            score  = max(0, 100 - ret * 4),
            status = "good" if ret < 5 else ("warn" if ret < 10 else "bad"),
            detail = f"{ret:.0f}% return rate",
        ),
        HealthMetric(
            label  = "Volume momentum",
            score  = min(100, units / 20 * 10),
            status = "good" if units > 200 else ("warn" if units > 50 else "bad"),
            detail = f"{units:,} units/month",
        ),
        HealthMetric(
            label  = "ROI",
            score  = min(100, max(0, roi * 1.5)),
            status = "good" if roi > 40 else ("warn" if roi > 20 else "bad"),
            detail = f"{roi:.1f}% return on inventory cost",
        ),
    ]

    overall = round(sum(m.score for m in metrics) / len(metrics), 1)
    label   = (
        "Excellent" if overall > 75 else
        "Good"      if overall > 55 else
        "Fair"      if overall > 35 else
        "Poor"
    )

    recs: List[ActionRecommendation] = []
    if acos > 20:
        saving = round(inp.ad_spend_per_unit * 0.2 * inp.monthly_units, 2)
        recs.append(ActionRecommendation(
            priority = "high",
            area     = "Advertising",
            action   = f"Cut ad spend by ₹{inp.ad_spend_per_unit * 0.2:.0f}/unit via negative keyword pruning",
            impact   = f"Saves ~₹{saving:,.0f}/month, improves ACOS from {acos:.1f}% toward 20%",
        ))
    if margin < 20:
        new_econ = calculate_unit_economics(
            ProfitabilityInput(**{**inp.dict(), "selling_price": inp.selling_price * 1.1})
        )
        recs.append(ActionRecommendation(
            priority = "high",
            area     = "Pricing",
            action   = f"Raise price by 10% to ₹{inp.selling_price * 1.1:,.0f}",
            impact   = f"Margin improves from {margin:.1f}% → {new_econ['net_margin_pct']:.1f}%",
        ))
    if ret > 8:
        saving = round(inp.selling_price * (ret - 5) / 100 * 0.5 * inp.monthly_units, 2)
        recs.append(ActionRecommendation(
            priority = "high",
            area     = "Returns",
            action   = f"Fix listing accuracy to reduce return rate from {ret:.0f}% → 5%",
            impact   = f"Recovers ~₹{saving:,.0f}/month in return costs",
        ))
    if inp.storage_fee_per_unit > 20:
        recs.append(ActionRecommendation(
            priority = "medium",
            area     = "Inventory",
            action   = "Reduce FBA storage days by sending smaller, more frequent shipments",
            impact   = f"Cuts storage fee from ₹{inp.storage_fee_per_unit}/unit downward",
        ))
    recs.append(ActionRecommendation(
        priority = "medium",
        area     = "Positioning",
        action   = "Bundle complementary products to justify higher price point",
        impact   = "Reduces price sensitivity, increases average order value",
    ))

    return overall, label, metrics, recs