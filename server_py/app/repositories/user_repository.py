from sqlalchemy.orm import Session
from app.db.models.user_model import User
from app.schemas.user_schema import UserCreate
from app.models.schema_v2 import UserConsent
from datetime import datetime

class UserRepository:
    def get_by_email(self, db: Session, email: str):
        from app.core.cryptography import HashedString
        hashed = HashedString().process_bind_param(email, None)
        return db.query(User).filter(User.email_hash == hashed).first()

    def create(self, db: Session, user_in: UserCreate, hashed_password: str, business_interests: list, ip_hash: str = "unknown"):
        db_user = User(
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            email=user_in.email,
            password_hash=hashed_password,
            business_name=user_in.business_name,
            location=user_in.location,
            business_interests=business_interests,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Log explicit consents for DPDP Compliance
        now = datetime.utcnow()
        consents = [
            UserConsent(
                user_id=db_user.id,
                consent_type="terms_of_service",
                status=True,
                policy_version="v1.0",
                ip_hash=ip_hash,
                accepted_at=now
            ),
            UserConsent(
                user_id=db_user.id,
                consent_type="privacy_policy",
                status=True,
                policy_version="v1.0",
                ip_hash=ip_hash,
                accepted_at=now
            ),
            UserConsent(
                user_id=db_user.id,
                consent_type="data_processing",
                status=True,
                policy_version="v1.0",
                ip_hash=ip_hash,
                accepted_at=now
            )
        ]
        db.add_all(consents)
        db.commit()
        
        return db_user

    def update_onboarding(self, db: Session, user_id: int, onboarding_data: dict):
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.onboarding_goal = onboarding_data.get("onboarding_goal")
            user.onboarding_marketplace = onboarding_data.get("onboarding_marketplace")
            user.onboarding_details = onboarding_data.get("onboarding_details")
            user.seller_id = onboarding_data.get("seller_id")
            user.onboarding_completed = True
            db.commit()
            db.refresh(user)
        return user
