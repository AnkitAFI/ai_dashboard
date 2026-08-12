# from pydantic import BaseModel
# from typing import Optional, List

# class ScanRequest(BaseModel):
#     query: str
#     category: Optional[str] = None
#     platform: str = "both"           # "amazon" | "flipkart" | "both"
#     user_id: Optional[str] = None

# class ScoreBreakdown(BaseModel):
#     rating_gap: int
#     review_thinness: int
#     demand_signal: int
#     price_gap: int

# class Competitor(BaseModel):
#     title: str
#     rating: float
#     review_count: int
#     price: float
#     weakness: str
#     platform: str

# class Opportunity(BaseModel):
#     id: str
#     product_niche: str
#     score: int
#     gap_summary: str
#     category: str
#     platform: str
#     search_volume_estimate: int
#     avg_price: float
#     avg_rating: float
#     avg_reviews: int
#     competitor_count: int
#     est_revenue_min: float
#     est_revenue_max: float
#     top_keyword: str
#     score_breakdown: ScoreBreakdown
#     competitors: List[Competitor]
#     trend_direction: str
#     trend_pct: int

# class ScanResult(BaseModel):
#     query: str
#     category: str
#     platform: str
#     total_found: int
#     tier: str
#     scans_used: int
#     scans_limit: int
#     opportunities: List[Opportunity]
#     locked_count: int






from __future__ import annotations
from typing import Optional, List, Literal
from pydantic import BaseModel



class ScanRequest(BaseModel):
    query: str
    category: Optional[str] = None
    platform: Literal["amazon", "flipkart", "both"] = "both"
    user_id: Optional[str] = None


class ScoreBreakdown(BaseModel):
    rating_gap: int
    review_thinness: int
    demand_signal: int
    price_gap: int


class Competitor(BaseModel):
    asin: Optional[str] = None
    title: str
    rating: float
    review_count: int
    price: float
    weakness: str
    platform: Literal["amazon", "flipkart"]
    is_best_seller: bool = False
    is_amazon_choice: bool = False
    trend_signal: Optional[str] = None


class NicheInsightsRequest(BaseModel):
    product_niche: str
    avg_price: float
    avg_rating: float
    avg_reviews: int
    competitor_count: int
    trend_direction: str
    has_best_seller_gap: bool
    competitors: List[Competitor]
    force_reload: bool = False


class AIInsight(BaseModel):
    type: Literal["entry_price", "listing_gap", "trend_alert", "quick_win"]
    headline: str
    detail: str


class Opportunity(BaseModel):
    id: str
    product_niche: str
    score: int
    gap_summary: str
    category: str
    platform: Literal["amazon", "flipkart", "both"]
    search_volume_estimate: int
    avg_price: float
    avg_rating: float
    avg_reviews: int
    competitor_count: int
    est_revenue_min: float
    est_revenue_max: float
    top_keyword: str
    score_breakdown: ScoreBreakdown
    competitors: List[Competitor] = []
    trend_direction: Literal["up", "down", "steady"] = "steady"
    trend_pct: int = 0
    has_best_seller_gap: bool = False
    has_amazon_choice_gap: bool = False
    entry_price_suggestion: Optional[int] = None
    ai_insights: List[AIInsight] = []
    watchlist_count: int = 0


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
    ai_market_summary: Optional[str] = None

class WatchlistItemRequest(BaseModel):
    """Request body for adding/toggling a watchlist item."""
    niche: str
    score: int
    category: str
    platform: str
    avg_price: float
    avg_rating: float
    competitor_count: int
    est_revenue_max: float
    top_keyword: str
    gap_summary: str
    query: str
 
 
class WatchlistItemResponse(BaseModel):
    """Single watchlist item returned from the GET /watchlist endpoint."""
    niche: str
    score: int
    category: str
    platform: str
    avg_price: float
    avg_rating: float
    competitor_count: int
    est_revenue_max: float
    top_keyword: str
    gap_summary: str
    query: str
    added_at: str   # ISO 8601 string
 
 
class WatchlistResponse(BaseModel):
    watchlist: List[WatchlistItemResponse]
 
 
class WatchlistToggleResponse(BaseModel):
    action: Literal["added", "removed"]
    niche: str