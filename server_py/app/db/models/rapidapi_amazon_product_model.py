from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, TIMESTAMP
from app.db.base import Base

class RapidapiAmazonProducts(Base):
    __tablename__ = "rapidapi_amazon_products"

    id = Column(Integer, primary_key=True, index=True)
    asin = Column(String)
    category_id = Column(String)
    category_name = Column(String)
    product_title = Column(String)
    product_url = Column(String)
    product_photo = Column(String)
    product_price = Column(String)
    product_price_numeric = Column(Float)
    product_original_price = Column(String)
    product_original_price_numeric = Column(Float)
    product_star_rating = Column(String)
    product_star_rating_numeric = Column(Float)
    product_num_ratings = Column(Integer)
    is_best_seller = Column(Boolean)
    is_amazon_choice = Column(Boolean)
    is_prime = Column(Boolean)
    sales_volume = Column(String)
    country = Column(String)
    raw_data = Column(JSON)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
