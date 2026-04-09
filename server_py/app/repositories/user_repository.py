from sqlalchemy.orm import Session
from app.db.models.user_model import User
from app.schemas.user_schema import UserCreate

class UserRepository:
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, user_in: UserCreate, hashed_password: str, business_interests: list):
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
        return db_user

    def update_onboarding(self, db: Session, user_id: int, onboarding_data: dict):
        db.query(User).filter(User.id == user_id).update({
            "onboarding_goal": onboarding_data["onboarding_goal"],
            "onboarding_marketplace": onboarding_data["onboarding_marketplace"],
            "onboarding_details": onboarding_data["onboarding_details"],
            "onboarding_completed": True,
        })
        db.commit()
        return db.query(User).filter(User.id == user_id).first()
