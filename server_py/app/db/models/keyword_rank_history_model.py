from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class KeywordRankHistory(Base):
    __tablename__ = "keyword_rank_history"  

    id = Column(Integer, primary_key=True, index=True)
    tracked_product_id = Column(Integer, ForeignKey("tracked_products.id", ondelete="CASCADE"))
    keyword = Column(String, nullable=False)
    rank = Column(Integer, nullable=True)
    user_email = Column(String, index=True)
    checked_at = Column(Date, default=datetime.utcnow)

    product = relationship("TrackedProduct", back_populates="keywords")
