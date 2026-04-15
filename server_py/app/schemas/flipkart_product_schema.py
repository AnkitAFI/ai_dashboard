from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class Product(BaseModel):
    id: int
    title: str
    brand: Optional[str]
    category: Optional[str]
    price: Optional[float]
    rating: Optional[float]
    reviews: Optional[int]
    last_updated: Optional[datetime]

    class Config:
       from_attributes = True

class ProductDetail(BaseModel):
    id: int
    asin: str
    title: str
    brand: Optional[str]
    category: Optional[str]
    price: Optional[float]
    currency: Optional[str]
    rating: Optional[float]
    reviews: Optional[int]
    availability: Optional[bool]
    variation: Optional[Dict[str, Any]]
    image_url: Optional[str]
    last_updated: Optional[datetime]

    class Config:
        from_attributes = True

class SummaryOut(BaseModel):
    total_products: int
    avg_price: Optional[float]
    avg_rating: Optional[float]
    total_reviews: Optional[int]
