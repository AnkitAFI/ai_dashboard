from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.core.security import get_password_hash
from app.schemas.user_schema import UserCreate
import hashlib
from app.repositories.user_repository import UserRepository
from app.services.inbound_service import SellerInboundService

user_repo = UserRepository()

class UserService:
    def hash_password(self, password: str) -> str:
        return get_password_hash(password)

    def format_business_interests(self, interests: list) -> list:
        return [i.strip().lower() for i in interests if i.strip()]

    def register_user(self, db: Session, user: UserCreate, request=None):
        existing_user = user_repo.get_by_email(db, user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed = self.hash_password(user.password)
        interests = self.format_business_interests(user.business_interests)
        
        ip_hash = "unknown"
        if request and request.client:
            ip = request.client.host
            ip_hash = hashlib.sha256(ip.encode('utf-8')).hexdigest()
        
        return user_repo.create(db, user, hashed, interests, ip_hash=ip_hash)

    def update_onboarding(self, db: Session, user_id: int, onboarding_data: dict, background_tasks=None):
        user = user_repo.update_onboarding(db, user_id, onboarding_data)
        
        seller_id = onboarding_data.get("seller_id")
        
        # Log for debugging
        print(f"[UserService] update_onboarding: user_id={user_id}, goal={user.onboarding_goal}, seller_id={seller_id}")
        
        if seller_id and user:
            # Use the marketplace selected during onboarding
            # Prefer the one in onboarding_data as it's the most recent
            country = onboarding_data.get("onboarding_marketplace") or user.onboarding_marketplace or "US"
            
            # Normalize common IDs to country codes
            if country == "amazon_india": country = "IN"
            
            print(f"[UserService] Triggering ingestion for seller_id={seller_id} in country={country}")
            
            service = SellerInboundService()
            if background_tasks:
                background_tasks.add_task(
                    service.ingest_seller_data,
                    db=db,
                    seller_id=seller_id,
                    user_email=user.email,
                    user_id=user.id,
                    country=country
                )
            else:
                # Async fallback
                service.ingest_seller_data(db=db, seller_id=seller_id, user_email=user.email, user_id=user.id, country=country)
        else:
            print(f"[UserService] Skipping ingestion: seller_id={seller_id}, user={user is not None}")
        
        return user
