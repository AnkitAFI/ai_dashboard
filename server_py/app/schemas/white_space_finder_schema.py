from pydantic import BaseModel
from typing import Optional, List

class ScanRequest(BaseModel):
    query: str
    category: Optional[str] = None
    platform: str = "both"           # "amazon" | "flipkart" | "both"
    user_id: Optional[str] = None

class ScoreBreakdown(BaseModel):
    rating_gap: int
    review_thinness: int
    demand_signal: int
    price_gap: int

class Competitor(BaseModel):
    title: str
    rating: float
    review_count: int
    price: float
    weakness: str
    platform: str

class Opportunity(BaseModel):
    id: str
    product_niche: str
    score: int
    gap_summary: str
    category: str
    platform: str
    search_volume_estimate: int
    avg_price: float
    avg_rating: float
    avg_reviews: int
    competitor_count: int
    est_revenue_min: float
    est_revenue_max: float
    top_keyword: str
    score_breakdown: ScoreBreakdown
    competitors: List[Competitor]
    trend_direction: str
    trend_pct: int

class ScanResult(BaseModel):
    query: str
    category: str
    platform: str
    total_found: int
    tier: str
    scans_used: int
    scans_limit: int
    opportunities: List[Opportunity]
    locked_count: int