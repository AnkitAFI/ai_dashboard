from pydantic import BaseModel
from typing import Optional, List

class RapidapiFlipkartProductSchema(BaseModel):
    id: int
    pid: Optional[str]
    category_name: Optional[str]
    product_title: Optional[str]
    product_price: Optional[float]
    product_star_rating: Optional[float]
    product_review_count: Optional[int]

    class Config:
        from_attributes = True

class CategoryAnalytics(BaseModel):
    category: str
    total_products: int
    avg_price: Optional[float]
    avg_rating: Optional[float]
    total_reviews: Optional[int]
    source: str
