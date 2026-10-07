from sqlalchemy.orm import Session
from datetime import datetime
import logging
from app.models.schema_v2 import (
    UserAuth, UserProfile, UserBusinessInfo, UserSubscription,
    UserAppState, DeletedUser, DataSubjectRequest
)
from app.models.legacy_models import PaymentOrder, UserBehaviorLog

logger = logging.getLogger(__name__)

def execute_right_to_be_forgotten(db: Session, user_id: int, reason: str = "user_request") -> bool:
    """
    Executes the 'Right to be Forgotten' workflow in compliance with GDPR/DPDP.
    This performs a cascading deletion of all PII while retaining financial 
    records for statutory compliance.
    """
    try:
        user_auth = db.query(UserAuth).filter(UserAuth.id == user_id).first()
        if not user_auth:
            logger.warning(f"User {user_id} not found for deletion.")
            return False

        email_hash = user_auth.email_hash

        # 1. Audit trail is already created during soft-delete in legacy_router.py
        # Skipping duplicate insertion into deleted_users here.

        # 2. Scrub PII from payment_orders but keep user_id for tax constraints
        db.query(PaymentOrder).filter(PaymentOrder.user_id == user_id).update({
            "billing_full_name": None,
            "billing_email": None,
            "billing_mobile": None,
            "billing_company": None,
            "billing_address": None
        })
        
        # 3. Schedule analytics deletion (user_behavior_logs)
        db.query(UserBehaviorLog).filter(UserBehaviorLog.user_id == user_id).update({
            "user_id": None,
            "user_email": None
        })
        
        # 4. Mark any open Data Subject Requests as completed
        db.query(DataSubjectRequest).filter(
            DataSubjectRequest.user_id == user_id, 
            DataSubjectRequest.status != "COMPLETED"
        ).update({
            "status": "COMPLETED", 
            "completed_at": datetime.utcnow(),
            "notes": "Completed via Right to be Forgotten workflow."
        })

        # 5. Delete all associated PII child records explicitly
        if user_auth.profile: db.delete(user_auth.profile)
        if user_auth.business_info: db.delete(user_auth.business_info)
        if user_auth.subscriptions: db.delete(user_auth.subscriptions)
        if user_auth.app_state: db.delete(user_auth.app_state)

        # 6. Anonymize the root user_auth record instead of deleting it
        # This keeps the foreign key for payment_orders alive, but scrubs the identity.
        user_auth.email_hash = f"deleted_{user_auth.id}_{int(datetime.utcnow().timestamp())}"
        user_auth.google_id = None
        user_auth.password_hash = None
        user_auth.mfa_secret = None
        user_auth.mfa_backup_codes = None
        user_auth.is_active = False

        # Commit the transaction
        db.commit()
        logger.info(f"Right to be forgotten successfully executed for user {user_id}.")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to execute Right to be Forgotten for user {user_id}: {e}")
        raise
