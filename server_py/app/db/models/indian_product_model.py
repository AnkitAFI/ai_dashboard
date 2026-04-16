from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from datetime import datetime
from app.db.base import Base

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
