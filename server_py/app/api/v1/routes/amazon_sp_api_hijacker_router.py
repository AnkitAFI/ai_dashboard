"""
Amazon SP-API Hijacker & Buy Box Protection Router
===================================================
All routes in this file are strictly gated to Premium/Enterprise users.
No data is ever fetched live from Amazon in these routes — all data is
served from the local database, populated by the SQS background worker.

Multi-tenancy is enforced at EVERY query by filtering on both:
  - user_id  (the platform user)
  - selling_partner_id  (the Amazon store)
This prevents any possible data leakage between different sellers.

DPDP / GDPR: No PII is stored or returned. Only ASINs, prices, and
alert metadata. Seller names from Amazon's payload are stored as-is
since they are already public on the Amazon marketplace.
"""

import logging
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.schema_v2 import (
    AmazonSPAPICredential,
    AmazonSPAPISettings,
    AmazonSPAPIHijackerAlert,
    AmazonSPAPIHijackerMonitoredASIN,
    AmazonSPAPIAuditLog,
    UserSubscription,
)
from app.services.rate_limiter import SPAPIRateLimit

router = APIRouter(
    prefix="/amazon-sp-api/hijacker",
    tags=["Hijacker & Buy Box Protection"],
)
logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
PREMIUM_ASIN_LIMIT = 20
VALID_ALERT_TYPES = {"NEW_HIJACKER", "LOST_BUY_BOX", "BOTH"}


# ── Pydantic Request Models ───────────────────────────────────────────────────

class UpdateHijackerSettingsRequest(BaseModel):
    hijacker_email_alerts_enabled: bool
    hijacker_min_price_diff: float = Field(ge=0.0, le=99999.0)
    hijacker_alert_type_filter: str = Field(pattern="^(NEW_HIJACKER|LOST_BUY_BOX|BOTH)$")

class AddMonitoredASINRequest(BaseModel):
    asin: str = Field(min_length=10, max_length=10, pattern="^[A-Z0-9]{10}$")


# ── Shared Dependency: Verify tier + store ownership ─────────────────────────

def verify_premium_tenant(
    selling_partner_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Double-lock: Verify user is Premium/Enterprise AND owns this selling_partner_id.
    Identical pattern to verify_tenant_access_premium in profitability_router.py.
    """
    sub = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id
    ).first()
    tier = sub.subscription_tier if sub else "free"
    if tier not in ("premium", "enterprise"):
        raise HTTPException(
            status_code=403,
            detail="upgrade_required:premium",
        )
    cred = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id,
    ).first()
    if not cred:
        raise HTTPException(
            status_code=403,
            detail="Store not found or not connected to your account.",
        )
    return {"tier": tier, "selling_partner_id": selling_partner_id}


def _get_or_create_settings(
    user_id: int, selling_partner_id: str, db: Session
) -> AmazonSPAPISettings:
    """Fetch or lazily create the per-store hijacker settings row."""
    settings = db.query(AmazonSPAPISettings).filter(
        AmazonSPAPISettings.user_id == user_id,
        AmazonSPAPISettings.selling_partner_id == selling_partner_id,
    ).first()
    if not settings:
        settings = AmazonSPAPISettings(
            user_id=user_id,
            selling_partner_id=selling_partner_id,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _write_audit_log(
    db: Session,
    user_id: int,
    selling_partner_id: str,
    action: str,
    asin: Optional[str],
    old_value: Optional[str],
    new_value: Optional[str],
    ip_address: Optional[str],
):
    """Write a permanent audit entry so users cannot dispute their own actions."""
    log = AmazonSPAPIAuditLog(
        user_id=user_id,
        selling_partner_id=selling_partner_id,
        action=action,
        asin=asin,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "/{selling_partner_id}/alerts",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def get_hijacker_alerts(
    selling_partner_id: str,
    show_resolved: bool = Query(False, description="Include resolved alerts"),
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetch active hijacker and buy-box-lost alerts for a connected store.
    Data is served exclusively from the local database — zero Amazon API calls.
    Strictly filtered by user_id + selling_partner_id (multi-tenancy guarantee).
    """
    query = db.query(AmazonSPAPIHijackerAlert).filter(
        AmazonSPAPIHijackerAlert.user_id == current_user.id,
        AmazonSPAPIHijackerAlert.selling_partner_id == selling_partner_id,
    )
    if not show_resolved:
        query = query.filter(AmazonSPAPIHijackerAlert.is_resolved == False)

    alerts = query.order_by(AmazonSPAPIHijackerAlert.created_at.desc()).all()

    # KPI summary counts
    total_active = db.query(func.count(AmazonSPAPIHijackerAlert.id)).filter(
        AmazonSPAPIHijackerAlert.user_id == current_user.id,
        AmazonSPAPIHijackerAlert.selling_partner_id == selling_partner_id,
        AmazonSPAPIHijackerAlert.is_resolved == False,
    ).scalar() or 0

    lost_buy_box_count = db.query(func.count(AmazonSPAPIHijackerAlert.id)).filter(
        AmazonSPAPIHijackerAlert.user_id == current_user.id,
        AmazonSPAPIHijackerAlert.selling_partner_id == selling_partner_id,
        AmazonSPAPIHijackerAlert.alert_type == "LOST_BUY_BOX",
        AmazonSPAPIHijackerAlert.is_resolved == False,
    ).scalar() or 0

    monitored_count = db.query(func.count(AmazonSPAPIHijackerMonitoredASIN.id)).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
    ).scalar() or 0

    return {
        "summary": {
            "active_threats": total_active,
            "buy_box_lost": lost_buy_box_count,
            "asins_protected": monitored_count,
        },
        "alerts": [
            {
                "id": a.id,
                "asin": a.asin,
                "alert_type": a.alert_type,
                "hijacker_seller_name": a.hijacker_seller_name,
                "hijacker_price": float(a.hijacker_price) if a.hijacker_price else None,
                "your_price": float(a.your_price) if a.your_price else None,
                "price_difference": float(a.price_difference) if a.price_difference else None,
                "is_resolved": a.is_resolved,
                "detected_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ],
    }


@router.post(
    "/{selling_partner_id}/alerts/{alert_id}/resolve",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def resolve_hijacker_alert(
    selling_partner_id: str,
    alert_id: int,
    request: Request,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark a specific hijacker alert as resolved by the seller.
    Writes a permanent audit log entry so the action cannot be disputed.
    """
    alert = db.query(AmazonSPAPIHijackerAlert).filter(
        AmazonSPAPIHijackerAlert.id == alert_id,
        AmazonSPAPIHijackerAlert.user_id == current_user.id,
        AmazonSPAPIHijackerAlert.selling_partner_id == selling_partner_id,
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    if alert.is_resolved:
        raise HTTPException(status_code=400, detail="Alert is already resolved.")

    alert.is_resolved = True
    alert.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Permanent audit trail — seller cannot claim "I never resolved this"
    _write_audit_log(
        db=db,
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="RESOLVE_HIJACKER_ALERT",
        asin=alert.asin,
        old_value="is_resolved=False",
        new_value="is_resolved=True",
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "success", "message": "Alert marked as resolved."}


@router.get(
    "/{selling_partner_id}/settings",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def get_hijacker_settings(
    selling_partner_id: str,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch the user's hijacker alert preferences for a specific store."""
    settings = _get_or_create_settings(current_user.id, selling_partner_id, db)
    tier = tenant["tier"]
    asin_limit = PREMIUM_ASIN_LIMIT if tier == "premium" else None  # None = unlimited

    monitored_count = db.query(func.count(AmazonSPAPIHijackerMonitoredASIN.id)).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
    ).scalar() or 0

    return {
        "hijacker_email_alerts_enabled": settings.hijacker_email_alerts_enabled,
        "hijacker_min_price_diff": float(settings.hijacker_min_price_diff or 0),
        "hijacker_alert_type_filter": settings.hijacker_alert_type_filter or "BOTH",
        "asin_limit": asin_limit,
        "monitored_asin_count": monitored_count,
    }


@router.put(
    "/{selling_partner_id}/settings",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def update_hijacker_settings(
    selling_partner_id: str,
    payload: UpdateHijackerSettingsRequest,
    request: Request,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update hijacker alert preferences (email toggle, price threshold, alert type).
    Every change is permanently logged for liability protection.
    """
    settings = _get_or_create_settings(current_user.id, selling_partner_id, db)
    ip = request.client.host if request.client else None

    # Email toggle audit
    if settings.hijacker_email_alerts_enabled != payload.hijacker_email_alerts_enabled:
        _write_audit_log(
            db=db, user_id=current_user.id, selling_partner_id=selling_partner_id,
            action="TOGGLE_HIJACKER_EMAILS",
            asin=None,
            old_value=str(settings.hijacker_email_alerts_enabled),
            new_value=str(payload.hijacker_email_alerts_enabled),
            ip_address=ip,
        )

    # Price threshold audit
    old_diff = float(settings.hijacker_min_price_diff or 0)
    new_diff = payload.hijacker_min_price_diff
    if old_diff != new_diff:
        _write_audit_log(
            db=db, user_id=current_user.id, selling_partner_id=selling_partner_id,
            action="UPDATE_HIJACKER_THRESHOLD",
            asin=None,
            old_value=f"₹{old_diff}",
            new_value=f"₹{new_diff}",
            ip_address=ip,
        )

    # Alert type filter audit
    if (settings.hijacker_alert_type_filter or "BOTH") != payload.hijacker_alert_type_filter:
        _write_audit_log(
            db=db, user_id=current_user.id, selling_partner_id=selling_partner_id,
            action="UPDATE_HIJACKER_FILTER",
            asin=None,
            old_value=settings.hijacker_alert_type_filter,
            new_value=payload.hijacker_alert_type_filter,
            ip_address=ip,
        )

    settings.hijacker_email_alerts_enabled = payload.hijacker_email_alerts_enabled
    settings.hijacker_min_price_diff = payload.hijacker_min_price_diff
    settings.hijacker_alert_type_filter = payload.hijacker_alert_type_filter
    db.commit()
    return {"status": "success"}


# ── ASIN Watchlist Management ─────────────────────────────────────────────────

@router.get(
    "/{selling_partner_id}/monitored-asins",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def get_monitored_asins(
    selling_partner_id: str,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch all ASINs the user has selected for hijacker monitoring."""
    tier = tenant["tier"]
    asin_limit = PREMIUM_ASIN_LIMIT if tier == "premium" else None

    asins = db.query(AmazonSPAPIHijackerMonitoredASIN).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
    ).order_by(AmazonSPAPIHijackerMonitoredASIN.created_at.desc()).all()

    return {
        "asin_limit": asin_limit,
        "monitored_count": len(asins),
        "slots_remaining": (asin_limit - len(asins)) if asin_limit is not None else None,
        "asins": [
            {"asin": a.asin, "added_at": a.created_at.isoformat()}
            for a in asins
        ],
    }


@router.post(
    "/{selling_partner_id}/monitored-asins",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def add_monitored_asin(
    selling_partner_id: str,
    payload: AddMonitoredASINRequest,
    request: Request,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add an ASIN to the hijacker watchlist.
    Premium: enforces 20 ASIN limit. Enterprise: unlimited.
    """
    tier = tenant["tier"]

    # Enforce Premium ASIN limit
    if tier == "premium":
        current_count = db.query(func.count(AmazonSPAPIHijackerMonitoredASIN.id)).filter(
            AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
            AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
        ).scalar() or 0

        if current_count >= PREMIUM_ASIN_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"upgrade_required:enterprise. Your plan allows monitoring up to {PREMIUM_ASIN_LIMIT} products. Remove one or upgrade to Enterprise for unlimited.",
            )

    # Check for duplicate
    existing = db.query(AmazonSPAPIHijackerMonitoredASIN).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
        AmazonSPAPIHijackerMonitoredASIN.asin == payload.asin,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="This product is already being monitored.")

    new_record = AmazonSPAPIHijackerMonitoredASIN(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        asin=payload.asin,
    )
    db.add(new_record)
    db.commit()

    _write_audit_log(
        db=db, user_id=current_user.id, selling_partner_id=selling_partner_id,
        action="ADD_HIJACKER_ASIN",
        asin=payload.asin, old_value=None, new_value="monitored=True",
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "success", "asin": payload.asin}


@router.delete(
    "/{selling_partner_id}/monitored-asins/{asin}",
    dependencies=[Depends(SPAPIRateLimit("default", tokens=1))],
)
def remove_monitored_asin(
    selling_partner_id: str,
    asin: str,
    request: Request,
    tenant=Depends(verify_premium_tenant),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove an ASIN from the hijacker watchlist.
    Historical alerts for this ASIN are preserved. Future SQS messages are silently dropped.
    """
    record = db.query(AmazonSPAPIHijackerMonitoredASIN).filter(
        AmazonSPAPIHijackerMonitoredASIN.user_id == current_user.id,
        AmazonSPAPIHijackerMonitoredASIN.selling_partner_id == selling_partner_id,
        AmazonSPAPIHijackerMonitoredASIN.asin == asin,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="ASIN not found in your watchlist.")

    db.delete(record)
    db.commit()

    _write_audit_log(
        db=db, user_id=current_user.id, selling_partner_id=selling_partner_id,
        action="REMOVE_HIJACKER_ASIN",
        asin=asin, old_value="monitored=True", new_value="monitored=False",
        ip_address=request.client.host if request.client else None,
    )
    return {"status": "success", "asin": asin}
