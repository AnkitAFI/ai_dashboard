# app/api/v1/routes/profitability_router.py

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.profitability import (
    ProfitabilityInput,
    SavedProductIn,
)
from app.services.profitability_service import (
    get_user_tier,
    require_tier,
    calculate_unit_economics,
    build_scenarios,
    get_market_intel,
    get_categories_from_db,
    compute_health,
    TIER_FEATURES,
)

router = APIRouter(prefix="/profitability", tags=["Profitability Optimizer"])


def _upgrade_error(required_tier: str):
    return HTTPException(
        status_code=403,
        detail={
            "error": "upgrade_required",
            "required_tier": required_tier,
            "message": f"Upgrade to {required_tier.capitalize()} to access this feature.",
        },
    )


# ── GET /profitability/categories ──────────────────────────────────────────────

@router.get("/categories")
def get_categories(
    marketplace: str = Query("amazon"),
    db: Session = Depends(get_db),
):
    """Pull distinct categories directly from the DB table."""
    categories = get_categories_from_db(marketplace, db)
    return {"categories": categories, "marketplace": marketplace}


# ── GET /profitability/tier-info ──────────────────────────────────────────────

@router.get("/tier-info")
def tier_info(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    tier = get_user_tier(user_id, db)
    return {"tier": tier, "features": TIER_FEATURES[tier]}


# ── POST /profitability/calculate ──────────────────────────────────────────────

@router.post("/calculate")
def calculate(inp: ProfitabilityInput, db: Session = Depends(get_db)):
    """
    Core calculator.
    Free  → profit/unit, margin, monthly profit, break-even
    Basic → + waterfall, ROI, ACOS, yearly profit, alerts
    """
    tier   = get_user_tier(inp.user_id, db)
    result = calculate_unit_economics(inp)

    # Strip advanced fields for Free tier
    if tier == "free":
        result.pop("roi_pct", None)
        result.pop("acos_pct", None)
        result.pop("yearly_profit", None)
        result.pop("cost_breakdown", None)
        result.pop("alerts", None)

    # Serialize nested Pydantic objects
    def _ser(v):
        if hasattr(v, "dict"):
            return v.dict()
        if isinstance(v, list):
            return [i.dict() if hasattr(i, "dict") else i for i in v]
        return v

    return {
        "tier":          tier,
        "tier_features": TIER_FEATURES[tier],
        "marketplace":   inp.marketplace,
        "category":      inp.category,
        **{k: _ser(v) for k, v in result.items()},
    }


# ── POST /profitability/scenarios ─────────────────────────────────────────────

@router.post("/scenarios")
def scenarios(inp: ProfitabilityInput, db: Session = Depends(get_db)):
    """4-scenario planner + price sensitivity. Premium only."""
    try:
        require_tier(inp.user_id, "premium", db)
    except PermissionError:
        raise _upgrade_error("premium")

    scens, sensitivity = build_scenarios(inp)
    return {
        "scenarios":   [s.dict() for s in scens],
        "sensitivity": [s.dict() for s in sensitivity],
    }


# ── GET /profitability/market-intel ───────────────────────────────────────────

@router.get("/market-intel")
def market_intel(
    category:    str           = Query(...),
    marketplace: str           = Query("amazon"),
    selling_price: Optional[float] = Query(None),
    user_id:     Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Live market benchmarks from rapidapi_amazon_products / rapidapi_flipkart_products.
    Premium only. Zero static data — everything from your DB.
    """
    try:
        require_tier(user_id, "premium", db)
    except PermissionError:
        raise _upgrade_error("premium")

    try:
        benchmarks, price_bands, price_position, insight = get_market_intel(
            category, marketplace, selling_price, db
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "category":           category,
        "marketplace":        marketplace,
        "benchmarks":         benchmarks.dict(),
        "price_bands":        [p.dict() for p in price_bands],
        "your_price_position": price_position,
        "your_price":         selling_price,
        "insight":            insight,
    }


# ── POST /profitability/health ────────────────────────────────────────────────

@router.post("/health")
def business_health(inp: ProfitabilityInput, db: Session = Depends(get_db)):
    """5-metric health score + recommendations. Premium only."""
    try:
        require_tier(inp.user_id, "premium", db)
    except PermissionError:
        raise _upgrade_error("premium")

    overall, label, metrics, recs = compute_health(inp)
    return {
        "overall_score":     overall,
        "overall_label":     label,
        "metrics":           [m.dict() for m in metrics],
        "recommendations":   [r.dict() for r in recs],
    }