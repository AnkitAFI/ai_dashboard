from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date

# -----------------------------
# Input schema for user creation
# -----------------------------
class UserCreate(BaseModel):
    first_name: str = Field(..., example="John")
    last_name: str = Field(..., example="Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., min_length=6, example="password123")
    business_name: Optional[str] = Field(None, example="My Business")
    location: str = Field(..., example="mumbai")
    business_interests: List[str] = Field(..., example=["electronics", "books"])

# -----------------------------
# Output schema for user data
# -----------------------------
class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    business_name: Optional[str]
    location: str
    business_interests: List[str]
    created_at: datetime
    updated_at: datetime

class TopAmazonReview(BaseModel):
    product_title: str
    avg_rating: float
    review_count: int

class MonthlyTrendOut(BaseModel):
    month: str
    review_count: int
    avg_rating: float

class TrendingProductOut(BaseModel):
    product_id: str
    product_title: Optional[str]
    category: Optional[str]
    review_count: int
    avg_rating: Optional[float]

class CategoryOut(BaseModel):
    category: str
    count: int

class RatingOut(BaseModel):
    rating: int
    count: int

class SentimentOut(BaseModel):
    sentiment: str
    count: int

class AmazonReview(BaseModel):
    review_id: str
    product_id: Optional[str]
    market_place: Optional[str]
    customer_id: Optional[str]
    product_parent: Optional[str]
    product_title: Optional[str]
    product_category: Optional[str]
    star_rating: Optional[int]
    helpful_votes: Optional[int]
    total_votes: Optional[int]
    vine: Optional[str]
    verified_purchase: Optional[str]
    review_headline: Optional[str]
    review_body: Optional[str]
    review_date: Optional[str]  
    Sentiment_pc: Optional[str]
    review_month: Optional[str]
    review_day: Optional[str]
    review_year: Optional[int]
    rating_1: Optional[int]
    rating_2: Optional[int]
    rating_3: Optional[int]
    rating_4: Optional[int]
    rating_5: Optional[int]

    class Config:
        from_attributes = True

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

class Summary(BaseModel):
    total_products: int
    avg_price: Optional[float]
    avg_rating: Optional[float]
    total_reviews: Optional[int]

class TopProductsResponse(BaseModel):
    top_products: List[Product]

class CategoryAnalytics(BaseModel):
    category: str
    total_products: int
    avg_price: Optional[float]
    avg_rating: Optional[float]
    total_reviews: Optional[int]
    source: str

class CategoryAnalyticsResponse(BaseModel):
    categories: List[CategoryAnalytics]

class AIQuery(BaseModel):
    question: str

# --- Onboarding Schemas ---
class OnboardingSubmit(BaseModel):
    """Payload sent from the frontend when onboarding is completed."""
    user_type: str              # "active_seller" | "researcher"
    marketplace: str            # "amazon_india" | "flipkart" | "both"
    primary_category: str
    display_name: str
    seller_id: Optional[str] = None
    investment_budget: Optional[str] = None

class OnboardingStatusOut(BaseModel):
    """Returned to the frontend to check if onboarding is done."""
    onboarding_completed: bool
    user_type: Optional[str] = None
    marketplace: Optional[str] = None
    primary_category: Optional[str] = None
    display_name: Optional[str] = None
    seller_id: Optional[str] = None
    investment_budget: Optional[str] = None

# -----------------------------
# RapidAPI Amazon Products
# -----------------------------
class RapidapiAmazonProduct(BaseModel):
    id: int
    asin: Optional[str]
    category_id: Optional[str]
    category_name: Optional[str]
    product_title: Optional[str]
    product_url: Optional[str]
    product_photo: Optional[str]
    product_price: Optional[str]
    product_price_numeric: Optional[float]
    product_original_price: Optional[str]
    product_original_price_numeric: Optional[float]
    product_star_rating: Optional[str]
    product_star_rating_numeric: Optional[float]
    product_num_ratings: Optional[int]
    is_best_seller: Optional[bool]
    is_amazon_choice: Optional[bool]
    is_prime: Optional[bool]
    sales_volume: Optional[str]
    country: Optional[str]
    raw_data: Optional[Dict[str, Any]]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# -----------------------------
# RapidAPI Flipkart Products
# -----------------------------
class RapidapiFlipkartProduct(BaseModel):
    id: int
    pid: str
    item_id: Optional[str]
    listing_id: Optional[str]
    category_id: Optional[str]
    category_name: Optional[str]
    brand: Optional[str]
    product_title: Optional[str]
    product_subtitle: Optional[str]
    product_url: Optional[str]
    product_photo: Optional[str]
    product_price: Optional[float]
    product_mrp: Optional[float]
    product_star_rating: Optional[float]
    product_rating_count: Optional[int]
    product_review_count: Optional[int]
    is_sponsored: Optional[bool]
    stock_status: Optional[str]
    highlights: Optional[Dict[str, Any]]
    rating_breakup: Optional[Dict[str, Any]]
    sales_volume: Optional[str]
    estimated_sales: Optional[float]
    country: Optional[str]
    raw_data: Optional[Dict[str, Any]]
    avg_price: Optional[float]
    min_price: Optional[float]
    max_price: Optional[float]
    avg_sales_volume: Optional[float]
    min_sales_volume: Optional[float]
    max_sales_volume: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# -----------------------------
# Rate Limit Schema
# -----------------------------
class RankUpdateRatelimit(BaseModel):
    user_email: str
    update_date: date
    call_count: Optional[int]

    class Config:
        from_attributes = True

# -----------------------------
# Feedback Schema
# -----------------------------
class Feedback(BaseModel):
    id: int
    user_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# -----------------------------
# Competitor Snapshot Schema
# -----------------------------
class CompetitorSnapshot(BaseModel):
    id: int
    seller_id: str
    user_email: str
    asin: str
    snapshot_date: date
    snapshot_data: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

# -----------------------------
# Time Series Forcasting Schema
# -----------------------------
class TimeSeriesForcasting(BaseModel):
    id: int
    date: Optional[str]
    product_id: str
    product_name: Optional[str]
    category: Optional[str]
    brand: Optional[str]
    discounted_price: Optional[float]
    rating: Optional[float]
    rating_count: Optional[int]
    review_count: Optional[int]

    class Config:
        from_attributes = True

# -----------------------------
# Price Alert Schema
# -----------------------------
class PriceAlert(BaseModel):
    id: int
    tracked_product_id: int
    user_email: str
    threshold_percent: float
    delivery_email: str
    is_active: Optional[bool]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True