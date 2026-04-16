from sqlalchemy import Column, String, Text, Integer, Numeric
from app.db.base import Base

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
