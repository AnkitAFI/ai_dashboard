from sqlalchemy import Column, Integer, String, Text, Float, Boolean, JSON, TIMESTAMP
from app.db.base import Base

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
