from sqlalchemy import Column, String, Text, Integer, Float, Boolean, JSON, TIMESTAMP, ARRAY, Numeric, DateTime, Date, ForeignKey, UniqueConstraint, Index, SmallInteger
from sqlalchemy.sql import func
from app.db.base import Base

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
