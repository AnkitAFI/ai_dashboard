from pydantic import BaseModel
from typing import Optional, List

class CategoryAnalytics(BaseModel):
    category: str
    total_products: int
    avg_price: Optional[float]
    avg_rating: Optional[float]
    total_reviews: Optional[int]
    source: str

class CategoryAnalyticsResponse(BaseModel):
    categories: List[CategoryAnalytics]
