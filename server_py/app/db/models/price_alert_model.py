from sqlalchemy import Column, String, Integer, Float, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tracked_product_id = Column(Integer, ForeignKey("tracked_products.id", ondelete="CASCADE"), index=True)
    user_email = Column(String(255), index=True)
    threshold_percent = Column(Float)
    delivery_email = Column(String(255))
    is_active = Column(Boolean, server_default="true", nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=True)
