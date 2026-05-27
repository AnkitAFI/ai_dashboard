# app/api/v1/routes/keyword_tracker_router.py

"""
Keyword Tracker Router
======================
All routes are protected — user_id comes from the session/auth dependency,
same pattern as the rest of the codebase.

Base path (registered in api.py): /keyword-tracker
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_id   # same deps as other routers
from app.schemas.keyword_tracker_schema import (
    AddKeywordRequest,
    AlertSettingsRequest,
    AlertSettingsOut,
    CompetitorRankOut,
    KeywordDashboardOut,
    KeywordHistoryOut,
    KeywordOut,
    SuccessResponse,
    SuggestionsOut,
    TierLimits,
    KeywordExplorerResponse,
)
from app.services import keyword_tracker_service as svc

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/keyword-tracker", tags=["Keyword Tracker"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _handle_permission(e: PermissionError) -> HTTPException:
    msg = str(e)
    if "rate_limited" in msg:
        minutes = msg.split(":")[-1]
        return HTTPException(
            status_code=429,
            detail={
                "error_code": "RATE_LIMITED",
                "message": f"Too many rank checks. Try again in {minutes}.",
            },
        )
    upgrade_target = msg.split(":")[-1] if ":" in msg else "basic"
    return HTTPException(
        status_code=403,
        detail={
            "error_code": "UPGRADE_REQUIRED",
            "message": f"This feature requires a higher plan.",
            "upgrade_to": upgrade_target,
        },
    )


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=KeywordDashboardOut)
def get_dashboard(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns all tracked keywords + summary stats for the logged-in user.
    Works on all tiers.
    """
    try:
        return svc.get_dashboard(user_id, db)
    except Exception as e:
        logger.error(f"get_dashboard error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Keywords CRUD ─────────────────────────────────────────────────────────────

@router.post("/keywords", response_model=KeywordOut, status_code=201)
def add_keyword(
    req: AddKeywordRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Add a new keyword to track.
    Enforces per-tier limits on keyword count and product count.
    """
    try:
        return svc.add_keyword(user_id, req, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except ValueError as e:
        msg = str(e)
        if "already_tracked" in msg:
            raise HTTPException(
                status_code=409,
                detail={"error_code": "DUPLICATE_KEYWORD", "message": "This keyword is already being tracked for this product."},
            )
        raise HTTPException(status_code=400, detail={"error_code": "VALIDATION_ERROR", "message": msg})
    except Exception as e:
        logger.error(f"add_keyword error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


@router.delete("/keywords/{keyword_id}", response_model=SuccessResponse)
def delete_keyword(
    keyword_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Soft-delete a tracked keyword."""
    try:
        svc.delete_keyword(user_id, keyword_id, db)
        return SuccessResponse(message="Keyword removed successfully.")
    except LookupError:
        raise HTTPException(status_code=404, detail={"error_code": "NOT_FOUND", "message": "Keyword not found."})
    except Exception as e:
        logger.error(f"delete_keyword error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Rank refresh ──────────────────────────────────────────────────────────────

@router.post("/keywords/{keyword_id}/refresh", response_model=KeywordOut)
def refresh_rank(
    keyword_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Manually trigger a rank check for one keyword.
    Rate-limited per tier:
      Free    → 1x/day
      Basic   → 2x/day
      Premium → up to hourly
    """
    try:
        return svc.refresh_rank(user_id, keyword_id, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except LookupError:
        raise HTTPException(status_code=404, detail={"error_code": "NOT_FOUND", "message": "Keyword not found."})
    except Exception as e:
        logger.error(f"refresh_rank error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Rank history ──────────────────────────────────────────────────────────────

@router.get("/keywords/{keyword_id}/history", response_model=KeywordHistoryOut)
def get_history(
    keyword_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns rank history.
    Free  → blocked (upgrade required)
    Basic → last 30 days
    Premium → full history
    """
    try:
        return svc.get_keyword_history(user_id, keyword_id, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except LookupError:
        raise HTTPException(status_code=404, detail={"error_code": "NOT_FOUND", "message": "Keyword not found."})
    except Exception as e:
        logger.error(f"get_history error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Competitors ───────────────────────────────────────────────────────────────

@router.post("/keywords/{keyword_id}/competitors", response_model=CompetitorRankOut, status_code=201)
def add_competitor(
    keyword_id: int,
    competitor_asin_or_pid: str = Query(..., min_length=1),
    platform: str = Query(..., pattern="^(amazon|flipkart)$"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Add a competitor product to track for a keyword.
    Basic → 2 competitors/keyword
    Premium → 10 competitors/keyword
    """
    try:
        return svc.add_competitor(user_id, keyword_id, competitor_asin_or_pid, platform, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"add_competitor error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


@router.get("/keywords/{keyword_id}/competitors", response_model=List[CompetitorRankOut])
def get_competitors(
    keyword_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        return svc.get_competitors(user_id, keyword_id, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"get_competitors error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Keyword suggestions ───────────────────────────────────────────────────────

@router.get("/suggestions", response_model=SuggestionsOut)
def get_suggestions(
    asin_or_pid: str = Query(...),
    platform: str = Query(..., pattern="^(amazon|flipkart)$"),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns keyword suggestions for a product.
    Basic+ only. Premium additionally gets opportunity scores.
    """
    try:
        return svc.get_keyword_suggestions(user_id, asin_or_pid, platform, category, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"get_suggestions error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Alert settings ────────────────────────────────────────────────────────────

@router.post("/alerts", response_model=AlertSettingsOut)
def save_alerts(
    req: AlertSettingsRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Save alert settings for a keyword.
    Email alerts → Basic+
    WhatsApp alerts → Premium only
    """
    try:
        return svc.save_alert_settings(user_id, req, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"save_alerts error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


@router.get("/alerts/{keyword_id}", response_model=Optional[AlertSettingsOut])
def get_alerts(
    keyword_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    try:
        return svc.get_alert_settings(user_id, keyword_id, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"get_alerts error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Keyword Explorer ──────────────────────────────────────────────────────────

@router.get("/explorer", response_model=KeywordExplorerResponse)
def explore_keyword(
    keyword: str = Query(..., min_length=1),
    platform: str = Query(..., pattern="^(amazon|flipkart)$"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Explore search volume, CPC, difficulty, search engine results page (SERP),
    and geo-breakdown for a keyword on Amazon or Flipkart.
    Requires Basic or Premium plan.
    """
    try:
        return svc.explore_keyword(user_id, keyword, platform, db)
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"explore_keyword error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


@router.get("/explorer/strategy")
def get_keyword_strategy(
    keyword: str = Query(..., min_length=1),
    platform: str = Query(..., pattern="^(amazon|flipkart)$"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Returns AI-generated SEO title copywriting, bullet points, PPC bidding range,
    and competitor targeting advice from the local Ollama LLM.
    Requires Basic or Premium plan.
    """
    try:
        strategy_html = svc.get_keyword_strategy(user_id, keyword, platform, db)
        return {"strategy": strategy_html}
    except PermissionError as e:
        raise _handle_permission(e)
    except Exception as e:
        logger.error(f"get_keyword_strategy error: {e}")
        raise HTTPException(status_code=500, detail={"error_code": "INTERNAL_ERROR", "message": str(e)})


# ── Tier info (public) ────────────────────────────────────────────────────────

@router.get("/tiers/{tier}", response_model=TierLimits)
def get_tier_limits(tier: str):
    """
    Returns the feature limits for a given tier.
    Public endpoint — no auth needed. Used by frontend pricing pages.
    """
    if tier.lower() not in ("free", "basic", "premium"):
        raise HTTPException(status_code=400, detail={"error_code": "INVALID_TIER", "message": "Tier must be free, basic, or premium."})
    return svc.get_tier_limits(tier)