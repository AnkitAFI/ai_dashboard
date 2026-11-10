from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger, Numeric, Text, SmallInteger, UniqueConstraint
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
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    auth_provider = Column(String(50), default="email")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # MFA Fields
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(EncryptedString(), nullable=True)
    mfa_backup_codes = Column(ARRAY(Text), nullable=True)

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
    first_name = Column(String(255))
    last_name = Column(String(255))
    mobile_number = Column(EncryptedString())
    mobile_number_hash = Column(String(255), index=True)
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
    razorpay_subscription_id = Column(String(50), unique=True, index=True)
    razorpay_plan_id = Column(String(50))
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

    # SP-API Constraints
    max_sp_api_accounts = Column(Integer, default=1)

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
    deletion_reason = Column(String(50), nullable=True)
class AmazonAdsAutomationRules(Base):
    __tablename__ = "amazon_ads_automation_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(100), ForeignKey("amazon_ads_profiles.profile_id", ondelete="CASCADE"), nullable=False, index=True)
    
    rule_type = Column(String(50), nullable=False) # e.g. "DAYPARTING" or "BID_ADJUSTMENT"
    rule_config = Column(JSONB, nullable=False) # Stores the hours, target acos, etc.
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    profile = relationship("AmazonAdsProfile")

class AmazonSPAPICredential(Base):
    __tablename__ = "amazon_sp_api_credentials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)

    # DPDP / GDPR Compliance - all sensitive data encrypted
    selling_partner_id = Column(EncryptedString(), nullable=True) # Seller ID
    refresh_token = Column(EncryptedString(), nullable=False)
    region = Column(String(10), default="IN") # Strict India focus as requested
    sync_status = Column(String(50), default="PENDING") # PENDING, SYNCING, COMPLETED, FAILED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_sp_api_credentials")

class AmazonSPAPISettings(Base):
    __tablename__ = "amazon_sp_api_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    global_target_margin = Column(Numeric(5, 2), default=5.0) # E.g. 5.0 for 5%
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'selling_partner_id', name='uix_user_sp_settings'),
    )

class AmazonSPAPIProductCosts(Base):
    __tablename__ = "amazon_sp_api_product_costs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    asin = Column(String(50), nullable=False, index=True)
    cogs = Column(Numeric(10, 2), default=0.0) # Not encrypted for performance
    inbound_shipping = Column(Numeric(10, 2), default=0.0)
    target_margin_override = Column(Numeric(5, 2), nullable=True) # Optional override
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'asin', name='uix_sp_partner_asin_cost'),
    )

class AmazonSPAPIAuditLog(Base):
    __tablename__ = "amazon_sp_api_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    action = Column(String(255), nullable=False) # e.g., "UPDATE_COGS", "UPDATE_GLOBAL_MARGIN"
    asin = Column(String(50), nullable=True)
    old_value = Column(String(255), nullable=True)
    new_value = Column(String(255), nullable=True)
    ip_address = Column(String(50), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class AmazonSPAPIRefundReconciliation(Base):
    __tablename__ = "amazon_sp_api_refund_reconciliations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    amazon_order_id = Column(String(255), nullable=False, index=True)
    asin = Column(String(50), nullable=False, index=True)
    
    refunded_amount = Column(Numeric(10, 2), nullable=False)
    refund_date = Column(DateTime(timezone=True), nullable=False)
    
    is_returned_to_fba = Column(Boolean, default=False)
    status = Column(String(50), default="PENDING") # PENDING, CLAIM_FILED, REIMBURSED, IGNORED
    reimbursed_amount = Column(Numeric(10, 2), default=0.0)
    
    last_checked_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'amazon_order_id', 'asin', name='uix_sp_reimbursement_reconcil'),
    )

class AmazonSPAPIOrder(Base):
    __tablename__ = "amazon_sp_api_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    amazon_order_id = Column(String(100), nullable=False, index=True)
    purchase_date = Column(DateTime(timezone=True), nullable=False, index=True)
    order_status = Column(String(50), nullable=False)
    asin = Column(String(50), nullable=False, index=True)
    quantity = Column(Integer, default=1)
    item_price = Column(Numeric(10, 2), default=0.0)
    currency = Column(String(10), default="INR")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('amazon_order_id', 'asin', name='uix_sp_order_asin'),
    )

class AmazonSPAPIFinancialEvent(Base):
    __tablename__ = "amazon_sp_api_financial_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    amazon_order_id = Column(String(100), nullable=True, index=True)
    transaction_type = Column(String(100), nullable=False) # e.g., ShipmentEvent, RefundEvent
    fee_type = Column(String(100), nullable=False) # e.g., FBAPerUnitFulfillmentFee
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR")
    posted_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AmazonAdsCredential(Base):
    __tablename__ = "amazon_ads_credentials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)

    # Encrypted Amazon Ads Tokens
    profile_id = Column(EncryptedString(), nullable=True) # Usually retrieved after connecting
    refresh_token = Column(EncryptedString(), nullable=False)
    access_token = Column(EncryptedString(), nullable=True)
    access_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    region = Column(String(10), default="IN")
    sync_status = Column(String(50), default="COMPLETED") # SYNCING, COMPLETED, FAILED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_credentials")


class AmazonAdsProfile(Base):
    __tablename__ = "amazon_ads_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)

    profile_id = Column(String(50), nullable=False, unique=True, index=True) # Not highly sensitive, used for queries
    country_code = Column(String(10), nullable=False)
    currency_code = Column(String(10))
    timezone = Column(String(50))
    account_info = Column(String(255)) # E.g., "Seller" or "Vendor"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_profiles")


class AmazonAdsCampaignPerformance(Base):
    __tablename__ = "amazon_ads_campaign_performance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True)
    campaign_id = Column(String(50), index=True)

    date = Column(DateTime(timezone=True), index=True)
    campaign_name = Column(String(255))
    campaign_status = Column(String(50))
    daily_budget = Column(Numeric(10, 2), default=0.0)

    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Numeric(10, 2), default=0.0)
    sales = Column(Numeric(10, 2), default=0.0)
    orders = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_campaign_metrics")


class AmazonAdsAuditLog(Base):
    __tablename__ = "amazon_ads_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), nullable=False, index=True)
    action = Column(String(100), nullable=False) # e.g., "MANUAL_STATUS_UPDATE", "AUTOMATION_RULE_UPDATED"
    details = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    auth = relationship("UserAuth", backref="amazon_ads_audit_logs")


class AmazonAdsKeywordPerformance(Base):
    __tablename__ = "amazon_ads_keyword_performance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True)
    campaign_id = Column(String(50), index=True)
    keyword_id = Column(String(50), index=True)
    
    date = Column(DateTime(timezone=True), index=True)
    keyword_text = Column(String(255))
    match_type = Column(String(50))
    state = Column(String(50))
    keyword_bid = Column(Numeric(10, 2), default=0.0)

    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Numeric(10, 2), default=0.0)
    sales = Column(Numeric(10, 2), default=0.0)
    orders = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_keyword_metrics")


class AmazonAdsSearchTermPerformance(Base):
    __tablename__ = "amazon_ads_search_term_performance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True)
    campaign_id = Column(String(50), index=True)
    ad_group_id = Column(String(50), index=True)
    keyword_id = Column(String(50), index=True)
    
    date = Column(DateTime(timezone=True), index=True)
    search_term = Column(String(255), index=True)
    keyword_text = Column(String(255))
    match_type = Column(String(50))

    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Numeric(10, 2), default=0.0)
    sales = Column(Numeric(10, 2), default=0.0)
    orders = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_search_term_metrics")


class AmazonAdsPlacementPerformance(Base):
    __tablename__ = "amazon_ads_placement_performance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True)
    campaign_id = Column(String(50), index=True)
    
    date = Column(DateTime(timezone=True), index=True)
    placement = Column(String(100), index=True) # E.g., 'placementTop', 'placementProductPage', 'placementRestOfSearch'
    
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    spend = Column(Numeric(10, 2), default=0.0)
    sales = Column(Numeric(10, 2), default=0.0)
    orders = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="amazon_ads_placement_metrics")


class UserSavedFilters(Base):
    __tablename__ = "user_saved_filters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True) # Now tied directly to a specific profile
    module = Column(String(100), nullable=False) # e.g. 'amazon_ads_keywords'
    filter_name = Column(String(100), nullable=False)
    filter_config = Column(JSONB, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    auth = relationship("UserAuth", backref="saved_filters")


class AmazonAdsManualLocks(Base):
    __tablename__ = "amazon_ads_manual_locks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(50), index=True, nullable=False)
    entity_type = Column(String(50), nullable=False) # 'CAMPAIGN' or 'KEYWORD'
    entity_id = Column(String(50), index=True, nullable=False)
    locked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure a user can only have one lock per entity
    __table_args__ = (
        UniqueConstraint('profile_id', 'entity_type', 'entity_id', name='uix_profile_entity_lock'),
    )


class AmazonSPAPIReportQueue(Base):
    __tablename__ = "amazon_sp_api_report_queue"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    report_type = Column(String(100), nullable=False) # e.g. GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA
    report_id = Column(String(255), nullable=False, unique=True, index=True)
    status = Column(String(50), default="PROCESSING") # PROCESSING, DONE, FATAL
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AmazonSPAPIInventorySettings(Base):
    __tablename__ = "amazon_sp_api_inventory_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    asin = Column(String(50), nullable=False, index=True)
    
    supplier_lead_time_days = Column(Integer, default=30)
    transit_time_days = Column(Integer, default=5)
    safety_stock_days = Column(Integer, default=14)
    
    # Enum: '7D', '30D', 'MANUAL'
    velocity_calculation_method = Column(String(20), default="30D")
    manual_daily_velocity = Column(Numeric(10, 2), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'asin', name='uix_sp_inv_settings_asin'),
    )


class AmazonSPAPIInventorySummary(Base):
    __tablename__ = "amazon_sp_api_inventory_summary"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    asin = Column(String(50), nullable=False, index=True)
    product_title = Column(String(500), nullable=True)
    
    sellable_quantity = Column(Integer, default=0)
    inbound_quantity = Column(Integer, default=0)
    
    units_sold_7d = Column(Integer, default=0)
    units_sold_30d = Column(Integer, default=0)
    
    # Track days we had 0 inventory to adjust average velocity math
    days_out_of_stock_30d = Column(Integer, default=0)
    
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'asin', name='uix_sp_inv_summary_asin'),
    )


class AmazonSPAPIReviewRules(Base):
    """
    Stores automation settings for Review Solicitations.
    asin='GLOBAL' represents the account-level default rule.
    """
    __tablename__ = "amazon_sp_api_review_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    asin = Column(String(50), nullable=False, index=True)
    
    delay_days_after_shipment = Column(Integer, default=7)
    exclude_refunded = Column(Boolean, default=True) # The Safety Shield
    
    # Only applies to the 'GLOBAL' asin record. Individual ASIN overrides don't use this.
    is_active = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'asin', name='uix_sp_review_rules_asin'),
    )


class AmazonSPAPIOrderReviewLog(Base):
    """
    Tracks eligible orders and their solicitation status to prevent double-sending.
    """
    __tablename__ = "amazon_sp_api_order_review_log"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    amazon_order_id = Column(String(255), nullable=False, index=True)
    asin = Column(String(50), nullable=False)
    
    shipment_date = Column(DateTime(timezone=True), nullable=False)
    is_refunded = Column(Boolean, default=False)
    
    # Statuses: PENDING, SOLICITED, EXCLUDED_REFUND, EXCLUDED_OPT_OUT, FAILED_RETRY
    status = Column(String(50), default="PENDING")
    
    review_requested_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'amazon_order_id', name='uix_sp_review_log_order'),
    )

class DemoBooking(Base):
    __tablename__ = "demo_bookings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    
    # Store encrypted PII for privacy
    email = Column(EncryptedString(), nullable=False)
    phone = Column(EncryptedString(), nullable=True)
    
    # Store hashes for rate-limiting lookups
    email_hash = Column(HashedString(255), index=True, nullable=False)
    ip_hash = Column(HashedString(255), index=True, nullable=True)
    
    context = Column(Text, nullable=True)
    date = Column(String(50), nullable=False) # Store as YYYY-MM-DD
    time_slot = Column(String(50), nullable=False) # e.g. "11:00 AM"
    consent_given = Column(Boolean, default=True, nullable=False) # GDPR proof of consent
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SellerServiceOrder(Base):
    __tablename__ = "seller_service_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="SET NULL"), nullable=True)
    platforms = Column(JSONB, nullable=False)   # e.g. ["amazon", "flipkart"]
    amount = Column(Integer, nullable=False)    # e.g. 999, 1998, 2997
    currency = Column(String(10), default="INR")

    # DPDP / GDPR Encrypted PII (AES-256-GCM)
    contact_full_name = Column(EncryptedString(), nullable=True)
    contact_mobile = Column(EncryptedString(), nullable=True)
    contact_mobile_hash = Column(HashedString(255), index=True, nullable=True)
    gst_number = Column(EncryptedString(), nullable=True)

    # Compliance & Legal Audit
    ip_hash = Column(HashedString(255), nullable=True)
    user_agent = Column(Text, nullable=True)
    terms_version = Column(String(30), default="v1.0_seller_terms")
    consent_agreed = Column(Boolean, default=True)

    # Payment Tracking
    razorpay_order_id = Column(String(100), unique=True, index=True, nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(256), nullable=True)
    status = Column(String(20), default="created", nullable=False) # 'created' | 'paid'

    key_version = Column(SmallInteger, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)

    auth = relationship("UserAuth", backref="seller_service_orders")


# ── Listing Optimization & Creator Studio Models ──────────────────────────────
class AmazonSPAPIListingItem(Base):
    """Catalog items synced from Amazon for optimization & suppression detection."""
    __tablename__ = "amazon_sp_api_listing_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    sku = Column(String(100), nullable=False, index=True)
    asin = Column(String(50), nullable=False, index=True)
    product_type = Column(String(100), nullable=True)
    
    # Active Copy
    title = Column(String(1000), nullable=True)
    bullets = Column(JSONB, nullable=True)           # ["bullet 1", "bullet 2", ...]
    description = Column(Text, nullable=True)
    backend_search_terms = Column(String(1000), nullable=True)
    main_image_url = Column(String(1000), nullable=True)
    
    # Intelligence Metrics
    health_score = Column(Integer, default=0)        # 0 to 100
    is_suppressed = Column(Boolean, default=False)   # True if Amazon search suppressed
    suppression_reasons = Column(JSONB, nullable=True) # ["MISSING_IMAGE", "TITLE_TOO_LONG"]
    issues_json = Column(JSONB, nullable=True)        # Full SP-API issues payload
    
    # Keyword Budget
    search_term_bytes = Column(Integer, default=0)   # UTF-8 byte count (<= 250)
    has_title_keyword_overlap = Column(Boolean, default=False)
    wasted_overlap_words = Column(JSONB, nullable=True)
    
    last_synced_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('selling_partner_id', 'sku', name='uix_sp_listing_items_sku'),
    )


class AmazonSPAPIListingHistory(Base):
    """Snapshots of listing copy before edits to support 1-click SP-API rollback and non-repudiation."""
    __tablename__ = "amazon_sp_api_listing_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    sku = Column(String(100), nullable=False, index=True)
    asin = Column(String(50), nullable=False, index=True)
    
    snapshot_data = Column(JSONB, nullable=False)    # {title, bullets, description, backend_search_terms}
    changed_by = Column(String(50), default="USER") # USER or ROLLBACK
    reason = Column(String(255), nullable=True)
    
    # Non-Repudiation Audit Details
    client_ip = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonSPAPIListingDraft(Base):
    """In-progress new product listing drafts before publishing live to Amazon."""
    __tablename__ = "amazon_sp_api_listing_drafts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    sku = Column(String(100), nullable=False, index=True)
    product_type = Column(String(100), nullable=False)
    
    draft_data = Column(JSONB, nullable=False)        # Form fields: title, bullets, pricing, images, attributes
    status = Column(String(50), default="DRAFT")     # DRAFT, QUEUED, SUBMITTED, REJECTED
    amazon_submission_id = Column(String(100), nullable=True)
    submission_errors = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AmazonSPAPIProductTypeSchema(Base):
    """Global schema cache protecting against app key suspension on category queries."""
    __tablename__ = "amazon_sp_api_product_type_schemas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    marketplace_id = Column(String(20), default="A21TJRUUN4KGV", index=True)
    product_type = Column(String(100), nullable=False, index=True)
    schema_json = Column(JSONB, nullable=False)       # Official Amazon category schema
    expires_at = Column(DateTime(timezone=True), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('marketplace_id', 'product_type', name='uix_sp_pt_schema'),
    )


class AmazonSPAPIListingSyncQueue(Base):
    """Global FIFO Queue ensuring 100% adherence to createReport rate limits at scale."""
    __tablename__ = "amazon_sp_api_listing_sync_queue"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    
    status = Column(String(50), default="PENDING")   # PENDING, PROCESSING, COMPLETED, FAILED
    report_id = Column(String(100), nullable=True)
    attempt_count = Column(Integer, default=0)
    scheduled_for = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)


class AmazonSPAPIUploadedMedia(Base):
    """Stores product listing images uploaded directly from seller devices."""
    __tablename__ = "amazon_sp_api_uploaded_media"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=True, index=True)
    
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True, index=True)
    file_path = Column(String(500), nullable=False)
    public_url = Column(String(1000), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonSPAPIListingQuotaWallet(Base):
    """
    Dedicated, isolated wallet and quota tracking strictly for creating new listings.
    Zero collision with any existing tables or columns.
    """
    __tablename__ = "amazon_sp_api_listing_quota_wallets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    free_listings_used = Column(Integer, default=0, nullable=False)
    cycle_start_date = Column(DateTime(timezone=True), nullable=True) # Tracks renewal date
    wallet_balance_inr = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AmazonSPAPIListingWalletTransaction(Base):
    """
    Audit ledger for every wallet recharge and ₹50 listing creation deduction.
    """
    __tablename__ = "amazon_sp_api_listing_wallet_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(50), nullable=False) # 'RECHARGE', 'LISTING_CREATION_FEE'
    amount = Column(Numeric(10, 2), nullable=False) # E.g. +250.00 or -50.00
    balance_after = Column(Numeric(10, 2), nullable=False)
    sku = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AmazonSPAPIScheduledListing(Base):
    """
    Dedicated table for scheduled listing launches.
    Allows sellers to prepare products in advance and automatically publish at a future date/time.
    Zero alterations to existing tables. Full DPDP/GDPR CASCADE deletion compliance.
    """
    __tablename__ = "amazon_sp_api_scheduled_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    selling_partner_id = Column(String(255), nullable=False, index=True)
    sku = Column(String(100), nullable=False, index=True)
    product_type = Column(String(100), nullable=False)
    payload = Column(JSONB, nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(50), default="SCHEDULED", index=True)  # SCHEDULED, PUBLISHING, PUBLISHED, FAILED, CANCELLED
    published_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    amazon_submission_id = Column(String(100), nullable=True)
    fee_charged = Column(Numeric(10, 2), default=0.00, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

