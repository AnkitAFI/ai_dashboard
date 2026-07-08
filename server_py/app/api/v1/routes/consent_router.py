from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.schema_v2 import UserConsent
from app.models.legacy_models import User
from app.schemas.consent_schema import ConsentOut, ConsentBulkUpdate
import hashlib

router = APIRouter(tags=["Consents"], prefix="/v1/users/me/consents")

def get_ip_hash(request: Request) -> str:
    ip = request.client.host if request.client else "unknown"
    return hashlib.sha256(ip.encode('utf-8')).hexdigest()

@router.get("", response_model=List[ConsentOut])
def get_my_consents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the current user's explicit consents.
    """
    consents = db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
    
    # Lazy-initialize consents for legacy users who registered before this feature
    if not consents:
        # Use the user's original registration date for compliance auditing
        reg_date = current_user.created_at if current_user.created_at else datetime.utcnow()
        
        default_consents = [
            UserConsent(user_id=current_user.id, consent_type="terms_of_service", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
            UserConsent(user_id=current_user.id, consent_type="privacy_policy", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
            UserConsent(user_id=current_user.id, consent_type="marketing_emails", status=False, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
            UserConsent(user_id=current_user.id, consent_type="data_processing", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
        ]
        db.add_all(default_consents)
        db.commit()
        consents = db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
        
    return consents

@router.patch("", response_model=List[ConsentOut])
def update_my_consents(
    update_data: ConsentBulkUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update (grant or withdraw) optional consents for the current user.
    """
    ip_hash = get_ip_hash(request)
    
    for consent_update in update_data.consents:
        # Prevent users from withdrawing mandatory consents through this endpoint
        if consent_update.consent_type in ["terms_of_service", "privacy_policy", "data_processing"] and not consent_update.status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot withdraw mandatory consent: {consent_update.consent_type}"
            )
            
        existing = db.query(UserConsent).filter(
            UserConsent.user_id == current_user.id,
            UserConsent.consent_type == consent_update.consent_type
        ).first()
        
        now = datetime.utcnow()
        if existing:
            # Only update if the status changed
            if existing.status != consent_update.status:
                existing.status = consent_update.status
                existing.ip_hash = ip_hash
                if consent_update.status:
                    existing.accepted_at = now
                    existing.withdrawn_at = None
                else:
                    existing.withdrawn_at = now
        else:
            # Create new consent record
            new_consent = UserConsent(
                user_id=current_user.id,
                consent_type=consent_update.consent_type,
                status=consent_update.status,
                policy_version="v1.0", # Hardcoded default for newly toggled consents
                ip_hash=ip_hash,
                accepted_at=now if consent_update.status else None,
                withdrawn_at=now if not consent_update.status else None
            )
            db.add(new_consent)
            
    db.commit()
    
    return db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
