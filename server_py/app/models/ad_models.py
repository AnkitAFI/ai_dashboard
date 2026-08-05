# server_py/app/models/ad_models.py
"""
11 Enterprise PostgreSQL Database Models for Insydz AdPulse (Amazon PPC Optimizer)
- Fully decoupled from legacy_models and schema_v2
- Complies with Amazon Advertising API & DPDP data protection requirements
- Supports report ingestion staging, daily KPI rollup, and immutable recommendation snapshots
"""
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    BigInteger, Numeric, Text, Float, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.db.session import Base
from app.core.cryptography import EncryptedString, HashedString


class AmazonAdOAuthAccount(Base):
    """
    1. amazon_ad_oauth_accounts
    Stores encrypted LWA access and refresh tokens per connected seller or agency user.
    """
    __tablename__ = "amazon_ad_oauth_accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # LWA Token Payload - Encrypted via AES-256-GCM
    access_token = Column(EncryptedString(), nullable=False)
    refresh_token = Column(EncryptedString(), nullable=False)
    token_type = Column(String(50), default="bearer")
    expires_in = Column(Integer, default=3600)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Scope & Env
    env = Column(String(20), default="production")
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    profiles = relationship("AmazonAdProfile", back_populates="oauth_account", cascade="all, delete-orphan")


class AmazonAdAccountSetting(Base):
    """
    2. amazon_ad_account_settings
    Dedicated settings table for target ACOS sliders, bid ceilings/floors, and automation rules.
    """
    __tablename__ = "amazon_ad_account_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    
    # Target ACOS & Bid Thresholds
    target_acos = Column(Float, default=0.25)          # Default 25% Target ACOS
    max_bid_ceiling = Column(Float, default=150.0)     # Max CPC ceiling in account currency
    min_bid_floor = Column(Float, default=2.0)         # Min CPC floor in account currency
    
    # Rule Evaluation Thresholds
    bleeder_click_threshold = Column(Integer, default=15) # Clicks with 0 orders = Bleeder
    winner_order_threshold = Column(Integer, default=3)   # Orders with <= Target ACOS = Winner
    
    # Automation & Notifications
    automation_mode = Column(String(20), default="manual") # manual, semi_auto, full_auto
    email_notifications_enabled = Column(Boolean, default=True)
    ai_explanation_level = Column(String(20), default="detailed") # concise, detailed, technical

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AmazonAdProfile(Base):
    """
    3. amazon_ad_profiles
    Stores Amazon Ads profile IDs for each country marketplace (e.g. IN, US, UK).
    """
    __tablename__ = "amazon_ad_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    oauth_account_id = Column(Integer, ForeignKey("amazon_ad_oauth_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    
    profile_id = Column(String(100), unique=True, nullable=False, index=True) # Amazon Ads Profile ID
    country_code = Column(String(10), default="IN")                           # e.g. IN, US, UK
    currency_code = Column(String(10), default="INR")                         # e.g. INR, USD, GBP
    timezone = Column(String(50), default="Asia/Kolkata")
    account_type = Column(String(20), default="seller")                       # seller or enterprise/agency
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    oauth_account = relationship("AmazonAdOAuthAccount", back_populates="profiles")
    campaigns = relationship("AmazonAdCampaign", back_populates="profile", cascade="all, delete-orphan")


class AmazonAdCampaign(Base):
    """
    4. amazon_ad_campaigns
    Tracks Sponsored Products & Sponsored Brands campaigns and placement multipliers.
    """
    __tablename__ = "amazon_ad_campaigns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(String(100), ForeignKey("amazon_ad_profiles.profile_id", ondelete="CASCADE"), nullable=False, index=True)
    
    campaign_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    campaign_type = Column(String(50), default="sponsoredProducts") # sponsoredProducts, sponsoredBrands
    targeting_type = Column(String(20), default="MANUAL")           # MANUAL, AUTO
    state = Column(String(20), default="ENABLED")                   # ENABLED, PAUSED, ARCHIVED
    
    daily_budget = Column(Float, default=500.0)
    top_of_search_multiplier = Column(Integer, default=0)           # 0% to 900% Top-of-Search placement boost
    product_page_multiplier = Column(Integer, default=0)
    
    dayparting_enabled = Column(Boolean, default=False)
    dayparting_schedule = Column(String(255), default="12AM-6AM")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    profile = relationship("AmazonAdProfile", back_populates="campaigns")
    ad_groups = relationship("AmazonAdGroup", back_populates="campaign", cascade="all, delete-orphan")


class AmazonAdGroup(Base):
    """
    5. amazon_ad_groups
    Separates campaign ad groups and default bid levels.
    """
    __tablename__ = "amazon_ad_groups"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(String(100), ForeignKey("amazon_ad_campaigns.campaign_id", ondelete="CASCADE"), nullable=False, index=True)
    
    ad_group_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    default_bid = Column(Float, default=5.0)
    state = Column(String(20), default="ENABLED")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    campaign = relationship("AmazonAdCampaign", back_populates="ad_groups")
    targets = relationship("AmazonAdTarget", back_populates="ad_group", cascade="all, delete-orphan")


class AmazonAdTarget(Base):
    """
    6. amazon_ad_targets
    Unified table for KEYWORD targets and ASIN_PAT competitor product targeting.
    """
    __tablename__ = "amazon_ad_targets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ad_group_id = Column(String(100), ForeignKey("amazon_ad_groups.ad_group_id", ondelete="CASCADE"), nullable=False, index=True)
    
    target_id = Column(String(100), unique=True, nullable=False, index=True)
    target_type = Column(String(20), default="KEYWORD") # KEYWORD, ASIN_PAT, NEGATIVE_KEYWORD
    match_type = Column(String(20), default="EXACT")    # EXACT, PHRASE, BROAD, ASIN_SAME_AS
    expression = Column(String(255), nullable=False)    # Text of keyword or ASIN value ('B08XYZ123')
    bid = Column(Float, nullable=True)
    state = Column(String(20), default="ENABLED")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    ad_group = relationship("AmazonAdGroup", back_populates="targets")


class AmazonAdReportRaw(Base):
    """
    7. amazon_ad_reports_raw
    Staging table for report ingestion and schema validation before canonical ETL load.
    """
    __tablename__ = "amazon_ad_reports_raw"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(String(100), nullable=False, index=True)
    report_id = Column(String(100), unique=True, nullable=False, index=True)
    report_type = Column(String(50), nullable=False)  # searchTerms, campaigns, keywords
    report_date = Column(String(20), nullable=False, index=True)
    
    raw_payload = Column(Text, nullable=True)         # JSON string or CSV payload
    validation_status = Column(String(20), default="PENDING") # PENDING, VALIDATED, ERROR
    error_message = Column(Text, nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonAdSearchTerm(Base):
    """
    8. amazon_ad_search_terms
    Canonical 60-day customer search query performance table.
    """
    __tablename__ = "amazon_ad_search_terms"
    __table_args__ = (
        Index("idx_search_term_profile_date", "profile_id", "report_date"),
        Index("idx_search_term_target_date", "target_id", "report_date"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(String(100), nullable=False, index=True)
    campaign_id = Column(String(100), nullable=False, index=True)
    ad_group_id = Column(String(100), nullable=False, index=True)
    target_id = Column(String(100), nullable=True, index=True)
    
    query_text = Column(String(255), nullable=False)
    report_date = Column(String(20), nullable=False)
    
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    sales = Column(Float, default=0.0)
    orders = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonAdMetricsDaily(Base):
    """
    9. amazon_ad_metrics_daily
    Pre-aggregated daily KPI scorecard rollup table for instant (< 15ms) dashboard queries.
    """
    __tablename__ = "amazon_ad_metrics_daily"
    __table_args__ = (
        UniqueConstraint("profile_id", "report_date", name="uq_profile_daily_metrics"),
        Index("idx_daily_metrics_profile_date", "profile_id", "report_date"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(String(100), nullable=False, index=True)
    report_date = Column(String(20), nullable=False, index=True)
    
    total_spend = Column(Float, default=0.0)
    total_sales = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)
    total_impressions = Column(Integer, default=0)
    
    acos = Column(Float, default=0.0) # (total_spend / total_sales) if total_sales > 0 else 0.0
    roas = Column(Float, default=0.0) # (total_sales / total_spend) if total_spend > 0 else 0.0
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AmazonAdRecommendation(Base):
    """
    10. amazon_ad_recommendations
    Immutable recommendation snapshots. Never updated in place.
    Each rule evaluation run generates new versioned recommendation rows.
    """
    __tablename__ = "amazon_ad_recommendations"
    __table_args__ = (
        Index("idx_rec_profile_status", "profile_id", "status"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(100), nullable=False, index=True)
    profile_id = Column(String(100), nullable=False, index=True)
    
    rule_type = Column(String(50), nullable=False) # BLEEDER, WINNER, BID_OPTIMIZE, BUDGET
    target_id = Column(String(100), nullable=True)
    campaign_id = Column(String(100), nullable=True)
    ad_group_id = Column(String(100), nullable=True)
    
    recommended_action = Column(String(50), nullable=False) # ADD_NEGATIVE_EXACT, ADD_KEYWORD_EXACT, ADJUST_BID
    current_value = Column(String(100), nullable=True)
    recommended_value = Column(String(100), nullable=True)
    
    evidence_payload = Column(Text, nullable=True) # JSON string explaining deterministic mathematical proof
    rule_version = Column(String(20), default="v1.0")
    
    status = Column(String(30), default="GENERATED") 
    # GENERATED -> PENDING_REVIEW -> APPROVED -> APPLIED -> REJECTED / EXPIRED / ROLLED_BACK
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    applied_at = Column(DateTime(timezone=True), nullable=True)


class AmazonAdChangeLog(Base):
    """
    11. amazon_ad_change_logs
    WORM-compliant audit trail for every API push, retry, and rollback payload.
    """
    __tablename__ = "amazon_ad_change_logs"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    recommendation_id = Column(Integer, ForeignKey("amazon_ad_recommendations.id", ondelete="SET NULL"), nullable=True)
    profile_id = Column(String(100), nullable=False, index=True)
    actor_user_id = Column(Integer, nullable=False)
    
    action_type = Column(String(50), nullable=False) # APPLY_RECOMMENDATION, ROLLBACK_RECOMMENDATION
    api_endpoint = Column(String(255), nullable=False)
    request_payload = Column(Text, nullable=True)
    response_code = Column(Integer, nullable=True)
    response_payload = Column(Text, nullable=True)
    
    rollback_payload = Column(Text, nullable=True)   # Exactly how to revert this change
    is_rolled_back = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonAdCustomRule(Base):
    """
    12. amazon_ad_custom_rules
    Stores user-defined visual If/Then automation rules.
    """
    __tablename__ = "amazon_ad_custom_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(String(100), ForeignKey("amazon_ad_profiles.profile_id", ondelete="CASCADE"), nullable=False, index=True)
    
    rule_name = Column(String(255), nullable=False)
    
    # "IF" Conditions
    condition_acos_gt = Column(Float, nullable=True)     # e.g. 40.0
    condition_clicks_gt = Column(Integer, nullable=True) # e.g. 15
    
    # "THEN" Action
    action_type = Column(String(50), nullable=False)     # DECREASE_BID
    action_value = Column(Float, nullable=False)         # e.g. 15.0 (%)
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
