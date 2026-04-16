from sqlalchemy import Column, String, Integer, ARRAY, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
   
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
   
    password_hash = Column(String(255), nullable=False)
   
    business_name = Column(String(255), nullable=True)
    location = Column(String(100), nullable=True)
    business_interests = Column(ARRAY(String), nullable=True, default=[])
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subscription_tier = Column(String, default='free')
    ai_chat_used = Column(Integer, default=0)
    ai_chat_month = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    analysis_used = Column(Integer, default=0)
    analysis_month = Column(String, nullable=True)

    sov_used = Column(Integer, default=0)
    sov_month = Column(String)
   
    keyword_tracker_used = Column(Integer, default=0)
    keyword_tracker_month = Column(String)

    subscription_expires_at = Column(DateTime, nullable=True)
    payment_orders = relationship("PaymentOrder", back_populates="user")
    scheduled_downgrade_to = Column(String(50), nullable=True)

    is_verified = Column(Boolean, default=False)
    
    # Onboarding fields
    onboarding_completed = Column(Boolean, default=False)
    onboarding_goal = Column(String(100), nullable=True)
    onboarding_marketplace = Column(String(100), nullable=True)
    onboarding_details = Column(String(500), nullable=True) # Seller ID or Category
    seller_id = Column(String(100), nullable=True)
    seller_sync_status = Column(String(20), default='IDLE') # IDLE, SYNCING, COMPLETED, FAILED
   
    def __repr__(self):
        return f"<User {self.email}>"
