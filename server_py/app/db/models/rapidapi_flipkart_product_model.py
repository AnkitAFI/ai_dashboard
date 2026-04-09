from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, JSON, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base

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
