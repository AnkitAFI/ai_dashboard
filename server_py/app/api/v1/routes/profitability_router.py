# app/api/v1/routes/profitability_router.py

from fastapi import APIRouter, HTTPException, Query, Depends, Cookie
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
from app.api.deps import get_current_user_id, validate_session, r
import json
from pydantic import BaseModel as _BaseModel
from app.api.v1.routes.legacy_router import ProductTrackerRequest
from app.services.niche_research_service import run_niche_research


# Optional auth helper for profitability routes
def get_optional_user_id(
    session_id: str = Cookie(None),
) -> Optional[str]:
    if not session_id:
        return None
    session_data = validate_session(session_id)
    return str(session_data["user_id"]) if session_data and "user_id" in session_data else None

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
    cache_key = f"profitability:categories:{marketplace}"
    try:
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis error: {e}")

    categories = get_categories_from_db(marketplace, db)
    result = {"categories": categories, "marketplace": marketplace}
    
    try:
        r.setex(cache_key, 86400, json.dumps(result))  # 24 hour cache
    except Exception as e:
        print(f"Redis error: {e}")
        
    return result


# ── GET /profitability/tier-info ──────────────────────────────────────────────

@router.get("/tier-info")
def tier_info(
    user_id: Optional[str] = Depends(get_optional_user_id),
    db: Session = Depends(get_db),
):
    tier = get_user_tier(user_id, db)
    return {"tier": tier, "features": TIER_FEATURES[tier]}


# ── POST /profitability/calculate ──────────────────────────────────────────────

@router.post("/calculate")
def calculate(
    inp: ProfitabilityInput, 
    user_id: Optional[str] = Depends(get_optional_user_id),
    db: Session = Depends(get_db)
):
    """
    Core calculator.
    Free  → profit/unit, margin, monthly profit, break-even
    Basic → + waterfall, ROI, ACOS, yearly profit, alerts
    """
    # Prefer authenticated user_id over the one in the request body
    tier   = get_user_tier(user_id or inp.user_id, db)
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
def scenarios(
    inp: ProfitabilityInput, 
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """4-scenario planner + price sensitivity. Premium only."""
    try:
        # Use authenticated user_id
        require_tier(user_id, "premium", db)
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
    user_id:     str           = Depends(get_current_user_id),
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

    cache_key = f"profitability:market-intel:{category}:{marketplace}:{selling_price}"
    try:
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis error: {e}")

    try:
        benchmarks, price_bands, price_position, insight = get_market_intel(
            category, marketplace, selling_price, db
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    result = {
        "category":           category,
        "marketplace":        marketplace,
        "benchmarks":         benchmarks.dict(),
        "price_bands":        [p.dict() for p in price_bands],
        "your_price_position": price_position,
        "your_price":         selling_price,
        "insight":            insight,
    }

    try:
        r.setex(cache_key, 1800, json.dumps(result))  # 30 min cache
    except Exception as e:
        print(f"Redis error: {e}")

    return result


# ── POST /profitability/health ────────────────────────────────────────────────

@router.post("/health")
def business_health(
    inp: ProfitabilityInput, 
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """5-metric health score + recommendations. Premium only."""
    try:
        require_tier(user_id, "premium", db)
    except PermissionError:
        raise _upgrade_error("premium")

    overall, label, metrics, recs = compute_health(inp)
    return {
        "overall_score":     overall,
        "overall_label":     label,
        "metrics":           [m.dict() for m in metrics],
        "recommendations":   [r.dict() for r in recs],
    }


# ── POST /profitability/niche-research ──────────────────────────────────────────

@router.post("/niche-research")
async def niche_research(
    request_body: ProductTrackerRequest,
    db: Session = Depends(get_db)
):
    """
    Highly refined competitor and niche opportunity search pipeline
    integrated specifically into the Profitability Optimizer page.
    """
    res = await run_niche_research(
        db=db,
        product_name=request_body.product_name,
        category=request_body.category,
        source=request_body.source,
        base_cost=request_body.base_cost
    )
    if not res.get("success"):
        raise HTTPException(
            status_code=404,
            detail=res.get("message", "No competitor products found.")
        )
    return res


