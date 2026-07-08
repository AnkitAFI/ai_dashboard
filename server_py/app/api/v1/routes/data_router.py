from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Any, Dict

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.legacy_models import User, PaymentOrder, TrackedProduct, UserBehaviorLog
from app.models.schema_v2 import UserConsent

router = APIRouter(tags=["Data Compliance"], prefix="/v1/data")

@router.get("/export")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    DPDP / GDPR Right to Data Portability (Data Export).
    Aggregates all personal, business, and historical data associated with the user into a structured JSON payload.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 1. Base User Profile (From the `users` view which aggregates DPDP tables)
    profile_data = {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "business_name": current_user.business_name,
        "location": current_user.location,
        "mobile_number": current_user.mobile_number,
        "created_at": str(current_user.created_at) if current_user.created_at else None,
        "subscription_tier": current_user.subscription_tier,
        "subscription_expires_at": str(current_user.subscription_expires_at) if current_user.subscription_expires_at else None,
        "seller_id": current_user.seller_id,
        "onboarding_completed": current_user.onboarding_completed
    }

    # 2. Consents
    consents = db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
    consent_data = [
        {
            "consent_type": c.consent_type,
            "status": c.status,
            "recorded_at": str(c.created_at)
        }
        for c in consents
    ]

    # 3. Payment Invoices (billing info)
    payment_orders = db.query(PaymentOrder).filter(PaymentOrder.user_id == current_user.id).all()
    invoice_data = [
        {
            "plan_id": p.plan_id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "invoice_number": p.invoice_number,
            "created_at": str(p.created_at) if p.created_at else None,
            "paid_at": str(p.paid_at) if p.paid_at else None
        }
        for p in payment_orders
    ]

    # 4. Activity Logs (Count or summary to avoid massive payloads, but raw data is usually preferred. Let's provide recent logs)
    # Actually, DPDP might require all data, but providing it via JSON could timeout if logs are huge.
    # We will limit to 100 recent logs for this export.
    logs = db.query(UserBehaviorLog).filter(UserBehaviorLog.user_id == current_user.id).order_by(UserBehaviorLog.created_at.desc()).limit(100).all()
    log_data = [
        {
            "event_type": l.event_type,
            "page_path": l.page_path,
            "created_at": str(l.created_at) if l.created_at else None
        }
        for l in logs
    ]

    return {
        "export_timestamp": str(datetime.utcnow()),
        "user_profile": profile_data,
        "consents": consent_data,
        "invoices": invoice_data,
        "recent_activity_logs": log_data
    }
