from sqlalchemy.orm import Session
from datetime import datetime
import logging
from app.models.schema_v2 import (
    UserAuth, UserProfile, UserBusinessInfo, UserSubscription,
    UserAppState, PaymentOrder, DeletedUser, UserBehaviorLog, DataSubjectRequest
)

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

        # 1. Insert into deleted_users (Fraud prevention / Audit trail)
        deleted_record = DeletedUser(
            email_hash=email_hash,
            deletion_reason=reason,
            deleted_at=datetime.utcnow()
        )
        db.add(deleted_record)

        # 2. Nullify user_id in payment_orders (Financial records retained for tax)
        db.query(PaymentOrder).filter(PaymentOrder.user_id == user_id).update({"user_id": None})
        
        # 3. Schedule analytics deletion (user_behavior_logs)
        # Note: Depending on retention policy, you might leave them to be cleaned up
        # by a cron job (90-day retention) or delete them immediately. For strict compliance:
        db.query(UserBehaviorLog).filter(UserBehaviorLog.user_id == user_id).update({"user_id": None})
        
        # 4. Mark any open Data Subject Requests as completed
        db.query(DataSubjectRequest).filter(
            DataSubjectRequest.user_id == user_id, 
            DataSubjectRequest.status != "COMPLETED"
        ).update({
            "status": "COMPLETED", 
            "completed_at": datetime.utcnow(),
            "notes": "Completed via Right to be Forgotten workflow."
        })

        # 5. Delete users_auth. 
        # Since relationships to profile, business_info, subscriptions, and app_state 
        # are set to cascade="all, delete-orphan", SQLAlchemy/Postgres will automatically 
        # delete those rows, completely scrubbing the PII.
        db.delete(user_auth)

        # Commit the transaction
        db.commit()
        logger.info(f"Right to be forgotten successfully executed for user {user_id}.")
        return True

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to execute Right to be Forgotten for user {user_id}: {e}")
        raise
