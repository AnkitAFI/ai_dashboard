"""
watchlist_router.py  –  Competitor Watchlist / Listing Audit API
-----------------------------------------------------------------
Endpoints
  GET    /watchlist   → load all pinned competitors for the current user+seller
  POST   /watchlist   → pin a competitor (upsert — safe to call repeatedly)
  DELETE /watchlist   → unpin a competitor

Mirrors the exact patterns used in comparison_router.py:
  - get_current_user dependency for auth
  - SQLAlchemy ORM Session (no raw SQL)
  - Same import paths as the rest of server_py
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.legacy_models import User
from app.db.models.competitor_watchlist_model import CompetitorWatchlist

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class WatchlistAddRequest(BaseModel):
    """Body for POST /watchlist"""
    # Passed by the frontend but overridden by JWT — kept so the client
    # doesn't need to know which fields are ignored
    user_email:  Optional[str] = None
    seller_id:   Optional[str] = None

    source_asin:      str                  # seller's own ASIN
    competitor_asin:  str                  # the rival

    # Competitor snapshot at pin time — all optional so a partial save never 422s
    title:            Optional[str]   = None
    photo:            Optional[str]   = None
    price:            Optional[float] = None
    rating:           Optional[float] = None
    num_ratings:      Optional[int]   = None
    threat_score:     Optional[float] = None
    threat_reason:    Optional[str]   = None
    is_prime:         Optional[bool]  = False
    is_best_seller:   Optional[bool]  = False
    is_amazon_choice: Optional[bool]  = False
    sales_volume:     Optional[str]   = None
    price_diff_pct:   Optional[float] = None
    currency:         Optional[str]   = "USD"


class WatchlistDeleteRequest(BaseModel):
    """Body for DELETE /watchlist"""
    user_email:      Optional[str] = None
    seller_id:       Optional[str] = None
    competitor_asin: str


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPER
# ─────────────────────────────────────────────────────────────────────────────

def _resolve_identity(
    current_user: User,
    seller_id:    Optional[str],
) -> tuple[str, str]:
    """
    Return (email, seller_id) using the JWT user as source of truth for email —
    so a client can never read/write another user's watchlist.
    Raises 400 when seller_id cannot be determined.
    """
    email = current_user.email
    sid   = seller_id or getattr(current_user, "seller_id", None)
    if not sid:
        raise HTTPException(
            status_code=400,
            detail=(
                "seller_id is required. "
                "Pass it in the request body / query param, "
                "or set it on your account."
            ),
        )
    return email, sid


# ─────────────────────────────────────────────────────────────────────────────
# GET /watchlist
# ─────────────────────────────────────────────────────────────────────────────

@router.get("")
def get_watchlist(
    seller_id:    Optional[str] = Query(None),
    user_email:   Optional[str] = Query(None),   # ignored — identity from JWT
    db:           Session       = Depends(get_db),
    current_user: User          = Depends(get_current_user),
) -> dict:
    """
    Return all pinned competitors for the authenticated user + seller,
    sorted by threat_score DESC then pinned_at DESC.
    """
    email, sid = _resolve_identity(current_user, seller_id)

    try:
        rows = (
            db.query(CompetitorWatchlist)
            .filter(
                CompetitorWatchlist.user_email == email,
                CompetitorWatchlist.seller_id  == sid,
            )
            .order_by(
                CompetitorWatchlist.threat_score.desc().nullslast(),
                CompetitorWatchlist.pinned_at.desc(),
            )
            .all()
        )
    except Exception as exc:
        logger.error("get_watchlist DB error %s / %s: %s", email, sid, exc)
        raise HTTPException(status_code=500, detail="Failed to load watchlist")

    watchlist: list[dict[str, Any]] = [
        {
            "id":               row.id,
            "source_asin":      row.source_asin,
            "competitor_asin":  row.competitor_asin,
            "title":            row.title,
            "photo":            row.photo,
            "price":            float(row.price)          if row.price          is not None else None,
            "rating":           float(row.rating)         if row.rating         is not None else None,
            "num_ratings":      row.num_ratings,
            "threat_score":     float(row.threat_score)   if row.threat_score   is not None else None,
            "threat_reason":    row.threat_reason,
            "is_prime":         bool(row.is_prime),
            "is_best_seller":   bool(row.is_best_seller),
            "is_amazon_choice": bool(row.is_amazon_choice),
            "sales_volume":     row.sales_volume,
            "price_diff_pct":   float(row.price_diff_pct) if row.price_diff_pct is not None else None,
            "currency":         row.currency or "USD",
            "pinned_at":        row.pinned_at.isoformat() if row.pinned_at else None,
        }
        for row in rows
    ]

    return {"watchlist": watchlist, "count": len(watchlist)}


# ─────────────────────────────────────────────────────────────────────────────
# POST /watchlist
# ─────────────────────────────────────────────────────────────────────────────

@router.post("", status_code=201)
def add_to_watchlist(
    body:         WatchlistAddRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
) -> dict:
    """
    Pin a competitor.
    Uses ORM-level upsert: if the row already exists it is updated in place
    (refreshes snapshot data); otherwise a new row is inserted.
    Calling POST multiple times is always safe.
    """
    email, sid = _resolve_identity(current_user, body.seller_id)

    try:
        existing = (
            db.query(CompetitorWatchlist)
            .filter(
                CompetitorWatchlist.user_email      == email,
                CompetitorWatchlist.seller_id       == sid,
                CompetitorWatchlist.competitor_asin == body.competitor_asin,
            )
            .first()
        )

        if existing:
            # Refresh snapshot — pinned_at is intentionally NOT reset
            existing.source_asin      = body.source_asin
            existing.title            = body.title
            existing.photo            = body.photo
            existing.price            = body.price
            existing.rating           = body.rating
            existing.num_ratings      = body.num_ratings
            existing.threat_score     = body.threat_score
            existing.threat_reason    = body.threat_reason
            existing.is_prime         = bool(body.is_prime)
            existing.is_best_seller   = bool(body.is_best_seller)
            existing.is_amazon_choice = bool(body.is_amazon_choice)
            existing.sales_volume     = body.sales_volume
            existing.price_diff_pct   = body.price_diff_pct
            existing.currency         = body.currency or "USD"
        else:
            db.add(CompetitorWatchlist(
                user_email       = email,
                seller_id        = sid,
                source_asin      = body.source_asin,
                competitor_asin  = body.competitor_asin,
                title            = body.title,
                photo            = body.photo,
                price            = body.price,
                rating           = body.rating,
                num_ratings      = body.num_ratings,
                threat_score     = body.threat_score,
                threat_reason    = body.threat_reason,
                is_prime         = bool(body.is_prime),
                is_best_seller   = bool(body.is_best_seller),
                is_amazon_choice = bool(body.is_amazon_choice),
                sales_volume     = body.sales_volume,
                price_diff_pct   = body.price_diff_pct,
                currency         = body.currency or "USD",
            ))

        db.commit()

    except Exception as exc:
        db.rollback()
        logger.error(
            "add_to_watchlist DB error %s / %s / %s: %s",
            email, sid, body.competitor_asin, exc,
        )
        raise HTTPException(status_code=500, detail="Failed to save to watchlist")

    return {"ok": True, "competitor_asin": body.competitor_asin}


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /watchlist
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("")
def remove_from_watchlist(
    body:         WatchlistDeleteRequest,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
) -> dict:
    """
    Unpin a competitor.
    Scoped strictly to the authenticated user — you can only delete your own rows.
    Returns {"ok": True, "deleted": 0} (not a 404) if the row was already gone,
    so the frontend's optimistic-delete never needs to handle an error case.
    """
    email, sid = _resolve_identity(current_user, body.seller_id)

    try:
        deleted = (
            db.query(CompetitorWatchlist)
            .filter(
                CompetitorWatchlist.user_email      == email,
                CompetitorWatchlist.seller_id       == sid,
                CompetitorWatchlist.competitor_asin == body.competitor_asin,
            )
            .delete(synchronize_session=False)
        )
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error(
            "remove_from_watchlist DB error %s / %s / %s: %s",
            email, sid, body.competitor_asin, exc,
        )
        raise HTTPException(status_code=500, detail="Failed to remove from watchlist")

    return {"ok": True, "deleted": deleted, "competitor_asin": body.competitor_asin}