from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, TIMESTAMP, ARRAY, Numeric, DateTime
from .database_config import Base
from sqlalchemy.sql import func
from datetime import datetime


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
   
    # Optional: Add is_active if you want to enable/disable accounts
    # is_active = Column(Boolean, default=True)
   
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
