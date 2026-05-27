from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, TIMESTAMP, ARRAY, Numeric, DateTime, Date, ForeignKey, UniqueConstraint, Index, SmallInteger
from app.db.session import Base
from sqlalchemy.sql import func
from datetime import datetime
from sqlalchemy.orm import relationship


class AmazonReview(Base):
    __tablename__ = "Amazon_Reviews"   

    review_id = Column(String, primary_key=True, index=True)
    product_id = Column(String, index=True)
    market_place = Column(Text)
    customer_id = Column(String)
    product_parent = Column(String)
    product_title = Column(Text)
    product_category = Column(Text)
    star_rating = Column(Integer)
    helpful_votes = Column(Integer)
    total_votes = Column(Integer)
    vine = Column(Text)
    verified_purchase = Column(Text)
    review_headline = Column(Text)
    review_body = Column(Text)
    review_date = Column(Text)
    Sentiment_pc = Column(Text)
    review_month = Column(Text)
    review_day = Column(Text)
    review_year = Column(Integer)
    rating_1 = Column("1 rating", Integer)
    rating_2 = Column("2 ratings", Integer)
    rating_3 = Column("3 ratings", Integer)
    rating_4 = Column("4 rating", Integer)
    rating_5 = Column("5 rating", Integer)

class Product(Base):
    __tablename__ = "flipkart"  
 
    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String(20), unique=True, nullable=True)
    title = Column(Text, nullable=False)
    brand = Column(Text, nullable=True)
    category = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    currency = Column(String(5), nullable=True)
    rating = Column(Float, nullable=True)
    reviews = Column(Integer, nullable=True)
    availability = Column(Boolean, nullable=True)
    variation = Column(JSON, nullable=True)
    image_url = Column(Text, nullable=True)
    last_updated = Column(TIMESTAMP, nullable=True)


class AmazonProductDetails(Base):
    __tablename__ = "amazon_product_details"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100))
    title = Column(String(500))
    category = Column(String(255))
    subcategory = Column(String(255))
    price = Column(Numeric(10, 2))
    rating = Column(Numeric(3, 2))
    reviews = Column(Integer)
    seller_name = Column(String(255))
    availability = Column(String(50))
    competitor_price = Column(Numeric(10, 2))
    promotion_flag = Column(Boolean)
    estimated_demand = Column(Integer)
    cost_price = Column(Numeric(10, 2))
    profit_margin = Column(Numeric(5, 2))
    event = Column(String(255))
    event_impact = Column(String(50))
    ad_spend = Column(Numeric(10, 2))
    market_share = Column(Numeric(5, 2))
    date = Column(TIMESTAMP, server_default=func.now())  


class IndianProduct(Base):
    __tablename__ = "indian_products"
    
    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String, unique=True, index=True)
    
    # Basic Info
    title = Column(Text)
    brand = Column(String)
    manufacturer = Column(String)
    url = Column(Text)
    image_urls = Column(JSON)  # Array of all images
    description = Column(Text)
    key_features = Column(JSON)  # Array of bullet points
    
    # Pricing (INR)
    price = Column(Float)
    mrp = Column(Float)  # Maximum Retail Price
    discount_percentage = Column(Float)
    
    # 🔥 SALES & REVENUE (Daily estimates)
    sales_estimate_low = Column(Integer)
    sales_estimate_high = Column(Integer)
    revenue_estimate_low = Column(Float)
    revenue_estimate_high = Column(Float)
    
    # Ratings & Reviews
    rating = Column(Float)
    number_of_ratings = Column(Integer)
    
    # Category & Ranking
    category = Column(JSON)  # Full category path
    main_category = Column(String)
    bsr = Column(JSON)  # Best Seller Rank in different categories
    
    # Product Specifications
    model_number = Column(String)
    part_number = Column(String)
    color = Column(String)
    size = Column(String)
    weight = Column(String)
    dimensions = Column(JSON)
    
    # Additional Details
    is_prime = Column(Boolean, default=False)
    is_amazon_fulfilled = Column(Boolean, default=False)
    number_of_sellers = Column(Integer)
    availability = Column(String)
    
    # Promotions & Deals
    has_deal = Column(Boolean, default=False)
    deal_type = Column(String)
    promo_codes = Column(JSON)
    
    # Amazon Fees (for sellers)
    referral_fee = Column(Float)
    fba_fee = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_scraped_at = Column(DateTime)

class RapidapiAmazonProducts(Base):
    __tablename__ = "rapidapi_amazon_products"

    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String)
    category_id = Column(String)
    category_name = Column(String)
    product_title = Column(String)
    product_url = Column(String)
    product_photo = Column(String)
    product_price = Column(String)
    product_price_numeric = Column(Float)
    product_original_price = Column(String)
    product_original_price_numeric = Column(Float)
    product_star_rating = Column(String)
    product_star_rating_numeric = Column(Float)
    product_num_ratings = Column(Integer)
    is_best_seller = Column(Boolean)
    is_amazon_choice = Column(Boolean)
    is_prime = Column(Boolean)
    sales_volume = Column(String)
    avg_price = Column(Float)
    min_price = Column(Float)
    max_price = Column(Float)

    avg_sales_volume = Column(Float)
    min_sales_volume = Column(Float)
    max_sales_volume = Column(Float)
    
    country = Column(String)
    raw_data = Column(JSON)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}    
    
class User(Base):
    __tablename__ = "users"
   
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
   
    # IMPORTANT: password_hash must be at least VARCHAR(255) for bcrypt
    # Bcrypt hashes are 60 characters long but we use 255 for safety
    password_hash = Column(String(255), nullable=False)
   
    business_name = Column(String(255), nullable=True)
    location = Column(String(100), nullable=True)
    business_interests = Column(ARRAY(String), nullable=True, default=[])
   
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ✅ SUBSCRIPTION FIELDS (ADD THESE IF MISSING)
    subscription_tier = Column(String, default='free')  # 'free', 'basic', 'premium', 'enterprise'
    ai_chat_used = Column(Integer, default=0)
    ai_chat_month = Column(String, nullable=True)  # Format: 'YYYY-MM'
    is_active = Column(Boolean, default=True)

    # ✅ NEW: Product analysis tracking
    analysis_used = Column(Integer, default=0)
    analysis_month = Column(String, nullable=True)

    # SOV Analysis tracking  
    sov_used = Column(Integer, default=0)
    sov_month = Column(String)  # YYYY-MM format
   
    # Keyword tracking
    keyword_tracker_used = Column(Integer, default=0)
    keyword_tracker_month = Column(String)   # YYYY-MM format

    # Keyword Intelligence Explorer usage (billing-cycle-based, not calendar-month)
    ki_searches_used = Column(Integer, default=0)
    ki_cycle_start = Column(DateTime, nullable=True)  # set to paid_at when user subscribes

    subscription_expires_at = Column(DateTime, nullable=True)
    payment_orders = relationship("PaymentOrder", back_populates="user")
    scheduled_downgrade_to = Column(String(50), nullable=True)

    # Onboarding fields
    is_verified = Column(Boolean, default=False)
    onboarding_completed = Column(Boolean, default=False)
    onboarding_goal = Column(String(100), nullable=True)
    onboarding_marketplace = Column(String(100), nullable=True)
    onboarding_details = Column(String(500), nullable=True)
    seller_id = Column(String(100), nullable=True)
    seller_sync_status = Column(String(20), default='IDLE') # IDLE, SYNCING, COMPLETED, FAILED
    mobile_number = Column(String, nullable=False)

    watchlist_items = relationship("WhiteSpaceWatchlist", back_populates="user", cascade="all, delete-orphan")   
    # Relationships
    def __repr__(self):
        return f"<User {self.email}>"  



class ProductTrackerAnalysis(Base):
    __tablename__ = "product_tracker_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    # user_email = Column(String(255), index=True)
    user_email = Column(String(255), index=True, nullable=True)

    product_name = Column(String(500), nullable=False, index=True)
    category = Column(String(255), nullable=False, index=True)
    source = Column(String(50), nullable=False, index=True)
    base_cost = Column(Numeric(10, 2), nullable=False)
    
    recommended_price = Column(Numeric(10, 2))
    min_price = Column(Numeric(10, 2))
    max_price = Column(Numeric(10, 2))
    profit_margin = Column(Numeric(5, 2))
    pricing_confidence = Column(String(50))
    
    estimated_monthly_sales_min = Column(Integer)
    estimated_monthly_sales_max = Column(Integer)
    estimated_daily_sales = Column(Numeric(10, 2))
    market_demand = Column(String(50))
    
    total_competitors = Column(Integer)
    avg_competitor_price = Column(Numeric(10, 2))
    avg_competitor_rating = Column(Numeric(3, 2))
    top_competitor_name = Column(String(500))
    top_competitor_price = Column(Numeric(10, 2))
    
    location_insights = Column(JSON)
    ai_strategy = Column(Text)
    warnings = Column(JSON)
    
    similar_products_count = Column(Integer)
    analysis_success = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())      




class TrackedProduct(Base):
    __tablename__ = "tracked_products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(String, index=True, nullable=False)
    asin = Column(String, index=True, nullable=False)
    product_title = Column(String, nullable=False)
    product_photo = Column(String)
    country = Column(String, default="IN")
    user_email = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ----------------------
    # Product Data
    # ----------------------
    product_price = Column(String)
    product_original_price = Column(String)
    currency = Column(String)
    product_star_rating = Column(String)
    product_star_rating_numeric = Column(Float)
    product_num_ratings = Column(Integer)
    product_url = Column(String)
    product_num_offers = Column(Integer)
    product_minimum_offer_price = Column(String)

    is_best_seller           = Column(Boolean, default=False)
    is_amazon_choice         = Column(Boolean, default=False)
    is_prime                 = Column(Boolean, default=False)
    climate_pledge_friendly  = Column(Boolean, default=False)

    sales_volume = Column(String)
    delivery = Column(String)
    has_variations           = Column(Boolean, default=False)
    unit_price               = Column(String, nullable=True)
    unit_count               = Column(Integer, nullable=True)

    # ----------------------
    # Seller Profile
    # ----------------------
    seller_name = Column(String)
    seller_logo = Column(String)
    seller_link = Column(String)
    store_link = Column(String)
    seller_phone = Column(String)
    business_name = Column(String)
    business_address = Column(String)
    seller_rating = Column(Float)
    seller_ratings_total = Column(Integer)

    # ----------------------
    # Reviews
    # ----------------------
    review_comments = Column(Text)
    review_ratings = Column(Text)
    review_authors = Column(Text)
    review_dates = Column(Text)
    review_has_response = Column(Text)

    # ----------------------
    # Relationship
    # ----------------------
    keywords = relationship(
        "KeywordRankHistory",
        back_populates="product",
        cascade="all, delete-orphan"
    )


# ----------------------
# Keyword Rank History
# ----------------------
class KeywordRankHistory(Base):
    __tablename__ = "keyword_rank_history"  # matches your SQL table

    id = Column(Integer, primary_key=True, index=True)
    tracked_product_id = Column(Integer, ForeignKey("tracked_products.id", ondelete="CASCADE"))
    keyword = Column(String, nullable=False)
    rank = Column(Integer, nullable=True)
    user_email = Column(String, index=True)
    checked_at = Column(Date, default=datetime.utcnow)

    # Relationship back to product
    product = relationship("TrackedProduct", back_populates="keywords")



class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    plan_id             = Column(String(50),  nullable=False)
    amount              = Column(Integer,     nullable=False)
    base_amount         = Column(Integer,     nullable=False, default=0)
    gst_amount          = Column(Integer,     nullable=False, default=0)
    gst_number          = Column(String(20),  nullable=True)
    currency            = Column(String(10),  default="INR")

    razorpay_order_id   = Column(String(100), unique=True, index=True, nullable=False)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature  = Column(String(256), nullable=True)
    refund_id           = Column(String(100), nullable=True)

    status              = Column(String(20),  default="created", nullable=False)
    invoice_number      = Column(String(50),  nullable=True)

    billing_full_name   = Column(String(200), nullable=True)
    billing_email       = Column(String(200), nullable=True)
    billing_mobile      = Column(String(20),  nullable=True)
    billing_company     = Column(String(200), nullable=True)
    billing_address     = Column(Text,        nullable=True)

    created_at          = Column(DateTime, nullable=False)
    paid_at             = Column(DateTime, nullable=True)
    expires_at          = Column(DateTime, nullable=True)
    refunded_at         = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="payment_orders")

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_product_id = Column(Integer, ForeignKey("tracked_products.id", ondelete="CASCADE"), index=True)
    user_email = Column(String(255), index=True)
    threshold_percent = Column(Float)
    delivery_email = Column(String(255))
    is_active = Column(Boolean, server_default="true", nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=True)

class RapidapiFlipkartProduct(Base):
    __tablename__ = "rapidapi_flipkart_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pid = Column(String(100), index=True)
    item_id = Column(String(100), nullable=True)
    listing_id = Column(String(100), nullable=True)
    category_id = Column(String(100), index=True, nullable=True)
    category_name = Column(String(200), nullable=True)
    brand = Column(String(200), index=True, nullable=True)
    product_title = Column(Text, nullable=True)
    product_subtitle = Column(Text, nullable=True)
    product_url = Column(Text, nullable=True)
    product_photo = Column(Text, nullable=True)
    product_price = Column(Numeric(10, 2), nullable=True)
    product_mrp = Column(Numeric(10, 2), nullable=True)
    product_star_rating = Column(Numeric(3, 2), nullable=True)
    product_rating_count = Column(Integer, nullable=True)
    product_review_count = Column(Integer, nullable=True)
    is_sponsored = Column(Boolean, server_default="false", nullable=True)
    stock_status = Column(String(50), nullable=True)
    highlights = Column(JSON, nullable=True)
    rating_breakup = Column(JSON, nullable=True)
    sales_volume = Column(Text, nullable=True)
    estimated_sales = Column(Numeric(15, 2), nullable=True)
    country = Column(String(10), nullable=True)
    raw_data = Column(JSON, nullable=True)
    avg_price = Column(Numeric(10, 2), nullable=True)
    min_price = Column(Numeric(10, 2), nullable=True)
    max_price = Column(Numeric(10, 2), nullable=True)
    avg_sales_volume = Column(Numeric(15, 2), nullable=True)
    min_sales_volume = Column(Numeric(15, 2), nullable=True)
    max_sales_volume = Column(Numeric(15, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), index=True, nullable=True)

    __table_args__ = (
        UniqueConstraint('pid', 'category_id', 'country', name='uq_flipkart_pid_cat_country'),
    )

class RankUpdateRatelimit(Base):
    __tablename__ = "rank_update_ratelimit"

    user_email = Column(String(255), primary_key=True)
    update_date = Column(Date, primary_key=True)
    call_count = Column(Integer, server_default="0", nullable=True)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    rating = Column(SmallInteger)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    __table_args__ = (
        Index('idx_feedback_created_at_desc', created_at.desc()),
    )

class CompetitorSnapshot(Base):
    __tablename__ = "competitor_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(String(255), index=True)
    user_email = Column(String(255), index=True)
    asin = Column(String(20), index=True)
    snapshot_date = Column(Date, index=True)
    snapshot_data = Column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint('asin', 'snapshot_date', 'user_email', name='uq_competitor_snapshot'),
    )

class TimeSeriesForcasting(Base):
    __tablename__ = "Time_Series_Forcasting"

    date = Column(Text, primary_key=True)
    product_id = Column(String, primary_key=True)
    product_name = Column(Text, nullable=True)
    category = Column(Text, nullable=True)
    brand = Column(Text, nullable=True)
    discounted_price = Column(Numeric, nullable=True)
    rating = Column(Numeric, nullable=True)
    rating_count = Column(Integer, nullable=True)
    review_count = Column(Integer, nullable=True)




# ── White Space Finder ────────────────────────────────────────────────────────
 
class WhiteSpaceWatchlist(Base):
    """
    Stores each user's saved niche watchlist items.
    One row per (user_id, niche) pair — enforced by unique constraint.
    Available to all subscription tiers (no Premium gate).
    """
    __tablename__ = "white_space_watchlist"
 
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
 
    # Niche identity
    niche = Column(String(500), nullable=False)
    query = Column(String(500), nullable=False)          # original search query that found this niche
 
    # Snapshot of metrics at time of saving
    score = Column(Integer, nullable=False, default=0)
    category = Column(String(255), nullable=True)
    platform = Column(String(20), nullable=True, default="both")   # "amazon" | "flipkart" | "both"
    avg_price = Column(Numeric(10, 2), nullable=True, default=0)
    avg_rating = Column(Numeric(3, 2), nullable=True, default=0)
    competitor_count = Column(Integer, nullable=True, default=0)
    est_revenue_max = Column(Numeric(15, 2), nullable=True, default=0)
    top_keyword = Column(String(255), nullable=True)
    gap_summary = Column(Text, nullable=True)
 
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
 
    # Relationship back to user
    user = relationship("User", back_populates="watchlist_items")
 
    __table_args__ = (
        UniqueConstraint("user_id", "niche", name="uq_whitespace_watchlist_user_niche"),
        Index("idx_whitespace_watchlist_user_added", "user_id", "added_at"),
    )
 
    def __repr__(self):
        return f"<WhiteSpaceWatchlist user_id={self.user_id} niche='{self.niche}'>"
 
 
class WhiteSpaceScan(Base):
    """
    Audit log of every scan a user runs.
    Used to enforce monthly scan limits per tier.
    """
    __tablename__ = "white_space_scans"
 
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(String(500), nullable=False)
    tier = Column(String(20), nullable=False, default="free")
    results_count = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
 
    __table_args__ = (
        Index("idx_whitespace_scans_user_created", "user_id", "created_at"),
    )
 
    def __repr__(self):
        return f"<WhiteSpaceScan user_id={self.user_id} query='{self.query}'>"
    

class KwTracked(Base):
    """
    One row per (user, keyword, product, platform).
    Replaces the generic tracked_keywords name to avoid conflicts.
    """
    __tablename__ = "kw_tracked"
 
    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    keyword         = Column(String(500), nullable=False)
    asin_or_pid     = Column(String(200), nullable=False)
    platform        = Column(String(20),  nullable=False)   # 'amazon' | 'flipkart'
    category        = Column(String(255), nullable=True)
    current_rank    = Column(Integer,     nullable=True)    # NULL = not in top results
    previous_rank   = Column(Integer,     nullable=True)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
 
    # Relationships
    rank_history = relationship("KwRankHistory",  back_populates="tracked_kw", cascade="all, delete-orphan")
    competitors  = relationship("KwCompetitor",   back_populates="tracked_kw", cascade="all, delete-orphan")
    alert        = relationship("KwAlertSettings",back_populates="tracked_kw", uselist=False, cascade="all, delete-orphan")
 
    __table_args__ = (
        UniqueConstraint("user_id", "keyword", "asin_or_pid", "platform", name="uq_kw_tracked"),
        Index("idx_kw_tracked_user_active", "user_id", "is_active"),
    )
 
    def __repr__(self):
        return f"<KwTracked user={self.user_id} kw='{self.keyword}' pid='{self.asin_or_pid}'>"
 
 
class KwRankHistory(Base):
    """
    Append-only log — one row per rank check.
    Named kw_rank_history to avoid conflict with existing keyword_rank_history.
    """
    __tablename__ = "kw_rank_history"
 
    id         = Column(Integer,  primary_key=True, autoincrement=True)
    kw_id      = Column(Integer,  ForeignKey("kw_tracked.id", ondelete="CASCADE"), nullable=False, index=True)
    rank       = Column(Integer,  nullable=True)    # NULL = not found in results
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
 
    tracked_kw = relationship("KwTracked", back_populates="rank_history")
 
    __table_args__ = (
        Index("idx_kw_rank_history_kw_checked", "kw_id", "checked_at"),
    )
 
 
class KwCompetitor(Base):
    """
    Competitor ASINs/PIDs tracked alongside a keyword.
    Basic: 2 per keyword. Premium: 10 per keyword.
    """
    __tablename__ = "kw_competitors"
 
    id                     = Column(Integer, primary_key=True, autoincrement=True)
    kw_id                  = Column(Integer, ForeignKey("kw_tracked.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id                = Column(Integer, nullable=False)
    competitor_asin_or_pid = Column(String(200), nullable=False)
    platform               = Column(String(20), nullable=False)
    current_rank           = Column(Integer, nullable=True)
    last_checked_at        = Column(DateTime(timezone=True), nullable=True)
 
    tracked_kw = relationship("KwTracked", back_populates="competitors")
 
    __table_args__ = (
        UniqueConstraint("kw_id", "user_id", "competitor_asin_or_pid", name="uq_kw_competitor"),
    )
 
 
class KwAlertSettings(Base):
    """
    One settings row per tracked keyword. Upserted on save.
    Email: Basic+. WhatsApp: Premium only.
    """
    __tablename__ = "kw_alert_settings"
 
    id               = Column(Integer, primary_key=True, autoincrement=True)
    kw_id            = Column(Integer, ForeignKey("kw_tracked.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id          = Column(Integer, nullable=False)
    alert_on_drop    = Column(Boolean, default=True,  nullable=False)
    drop_threshold   = Column(Integer, default=5,     nullable=False)   # positions
    email_enabled    = Column(Boolean, default=True,  nullable=False)
    whatsapp_enabled = Column(Boolean, default=False, nullable=False)
    whatsapp_number  = Column(String(20), nullable=True)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
 
    tracked_kw = relationship("KwTracked", back_populates="alert")   



class RankTrackedKeyword(Base):
    """
    One row per (seller_id, asin, keyword).
    Stores which keywords a seller wants to track for a specific product.
    Named rank_tracked_keywords — does NOT conflict with kw_tracked.
    """
    __tablename__ = "rank_tracked_keywords"
    __table_args__ = (
        UniqueConstraint("seller_id", "asin", "keyword", name="uq_rank_tracked_kw"),
    )
 
    id         = Column(Integer, primary_key=True, autoincrement=True)
    seller_id  = Column(String(120), nullable=False, index=True)
    asin       = Column(String(20),  nullable=False, index=True)
    user_email = Column(String(255), nullable=True,  index=True)
    keyword    = Column(String(300), nullable=False)
    country    = Column(String(10),  nullable=True,  default="US")
    added_at   = Column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
    )
 
 
class RankSnapshot(Base):
    """
    One row per rank check of a (seller_id, asin, keyword).
    Append-only history — never updated, only inserted.
    Named rank_snapshots — does NOT conflict with competitor_snapshots.
    """
    __tablename__ = "rank_snapshots"
 
    id            = Column(Integer, primary_key=True, autoincrement=True)
    seller_id     = Column(String(120), nullable=False, index=True)
    asin          = Column(String(20),  nullable=False, index=True)
    user_email    = Column(String(255), nullable=True)
    keyword       = Column(String(300), nullable=False, index=True)
    rank_position = Column(Integer,     nullable=True)   # NULL = not found in top 100
    page_number   = Column(Integer,     nullable=True)
    is_sponsored  = Column(Boolean,     default=False)
    country       = Column(String(10),  nullable=True, default="US")
    checked_at    = Column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
        index=True,
    )
 
 
class RankCompetitorPosition(Base):
    """
    Competitor rank for the same keyword at check time.
    Premium only — populated when a premium seller runs a rank check.
    Named rank_competitor_positions — does NOT conflict with kw_competitors.
    """
    __tablename__ = "rank_competitor_positions"
 
    id               = Column(Integer, primary_key=True, autoincrement=True)
    seller_id        = Column(String(120), nullable=False, index=True)
    asin             = Column(String(20),  nullable=False, index=True)
    keyword          = Column(String(300), nullable=False, index=True)
    competitor_asin  = Column(String(20),  nullable=False)
    competitor_title = Column(Text,        nullable=True)
    rank_position    = Column(Integer,     nullable=True)
    checked_at       = Column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
    )
 
 
class RankAlertLog(Base):
    """
    Fired rank alert events — one row per alert event.
    Premium only — written when a rank drop / top10 entry / lost event is detected.
    Named rank_alert_log — does NOT conflict with kw_alert_settings.
    """
    __tablename__ = "rank_alert_log"
 
    id         = Column(Integer, primary_key=True, autoincrement=True)
    seller_id  = Column(String(120), nullable=False, index=True)
    asin       = Column(String(20),  nullable=False)
    user_email = Column(String(255), nullable=True)
    keyword    = Column(String(300), nullable=False)
    alert_type = Column(String(50),  nullable=False)  # drop | enter_top10 | lost
    alert_msg  = Column(Text,        nullable=True)
    old_rank   = Column(Integer,     nullable=True)
    new_rank   = Column(Integer,     nullable=True)
    fired_at   = Column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
    )     