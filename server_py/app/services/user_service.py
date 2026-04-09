from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.security import get_password_hash
from app.schemas.user_schema import UserCreate
from app.repositories.user_repository import UserRepository

user_repo = UserRepository()

class UserService:
    def hash_password(self, password: str) -> str:
        return get_password_hash(password)

    def format_business_interests(self, interests: list) -> list:
        return [i.strip().lower() for i in interests if i.strip()]

    def register_user(self, db: Session, user: UserCreate):
        existing_user = user_repo.get_by_email(db, user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed = self.hash_password(user.password)
        interests = self.format_business_interests(user.business_interests)
        
        return user_repo.create(db, user, hashed, interests)

    def update_onboarding(self, db: Session, user_id: int, onboarding_data: dict):
        return user_repo.update_onboarding(db, user_id, onboarding_data)
