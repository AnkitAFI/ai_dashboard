from sqlalchemy import Column, String, Integer, Text
from app.db.base import Base

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
