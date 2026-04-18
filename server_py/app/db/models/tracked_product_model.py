from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

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

    review_comments = Column(Text, nullable=True)  
    review_ratings = Column(Text, nullable=True) 

    keywords = relationship(
        "KeywordRankHistory",
        back_populates="product",
        cascade="all, delete-orphan",
        primaryjoin="TrackedProduct.id == KeywordRankHistory.tracked_product_id"
    )
