from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.db.base import Base

class ProductTrackerAnalysis(Base):
    __tablename__ = "product_tracker_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
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
