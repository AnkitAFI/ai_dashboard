from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger, Numeric, Text, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
from app.core.cryptography import EncryptedString, HashedString
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

class UserAuth(Base):
    __tablename__ = "users_auth"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # HMAC hash of the email for lookups, never storing plaintext email here
    email_hash = Column(HashedString(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(String(50), default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Set on soft-delete; purged after 30 days

    profile = relationship("UserProfile", back_populates="auth", uselist=False, cascade="all, delete-orphan")
    business_info = relationship("UserBusinessInfo", back_populates="auth", uselist=False, cascade="all, delete-orphan")
    subscriptions = relationship("UserSubscription", back_populates="auth", uselist=False, cascade="all, delete-orphan")
    app_state = relationship("UserAppState", back_populates="auth", uselist=False, cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    
    # Highly Sensitive PII - Encrypted via AES-256-GCM
    email = Column(EncryptedString(), nullable=False)
    first_name = Column(EncryptedString())
    last_name = Column(EncryptedString())
    mobile_number = Column(EncryptedString())
    location = Column(EncryptedString())
    
    key_version = Column(SmallInteger, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", back_populates="profile")


class UserBusinessInfo(Base):
    __tablename__ = "user_business_info"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    
    # Sensitive seller ID
    seller_id = Column(EncryptedString())
    seller_id_hash = Column(HashedString(255), index=True)
    
    business_name = Column(String(100))
    business_interests = Column(ARRAY(Text))
    seller_sync_status = Column(String(20))
    onboarding_goal = Column(String(100))
    onboarding_marketplace = Column(String(100))
    onboarding_details = Column(String(500))
    
    key_version = Column(SmallInteger, default=1)

    auth = relationship("UserAuth", back_populates="business_info")


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    
    subscription_tier = Column(String(20), default="free")
    subscription_expires_at = Column(DateTime(timezone=True))
    scheduled_downgrade_to = Column(String(50))
    ki_cycle_start = Column(DateTime(timezone=True))
    
    ai_chat_used = Column(Integer, default=0)
    ai_chat_month = Column(String(7))
    analysis_used = Column(Integer, default=0)
    analysis_month = Column(String(7))
    sov_used = Column(Integer, default=0)
    sov_month = Column(String(7))
    keyword_tracker_used = Column(Integer, default=0)
    keyword_tracker_month = Column(String(7))
    ki_searches_used = Column(Integer, default=0)
    
    # AI Listing Studio Tracking
    ai_listings_generated = Column(Integer, default=0)
    ai_listings_month = Column(String(7))
    ai_credits_balance = Column(Integer, default=0)

    auth = relationship("UserAuth", back_populates="subscriptions")


class UserAppState(Base):
    __tablename__ = "user_app_state"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    
    onboarding_completed = Column(Boolean, default=False)
    explorer_tour_completed = Column(Boolean, default=False)
    seller_tour_completed = Column(Boolean, default=False)
    welcome_card_dismissed = Column(Boolean, default=False)

    auth = relationship("UserAuth", back_populates="app_state")




class UserConsent(Base):
    __tablename__ = "user_consents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(String(50))
    status = Column(Boolean)
    policy_version = Column(String(20))
    accepted_at = Column(DateTime(timezone=True), server_default=func.now())
    withdrawn_at = Column(DateTime(timezone=True))
    ip_hash = Column(HashedString(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    actor_user_id = Column(Integer) # ID of user taking action
    action = Column(String(100))
    resource_type = Column(String(100))
    resource_id = Column(String(100))
    ip_hash = Column(HashedString(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DataSubjectRequest(Base):
    __tablename__ = "data_subject_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    request_type = Column(String(50))
    status = Column(String(50))
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    notes = Column(Text)


class DeletedUser(Base):
    __tablename__ = "deleted_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email_hash = Column(HashedString(255), index=True, nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())
    deletion_reason = Column(String(100))


