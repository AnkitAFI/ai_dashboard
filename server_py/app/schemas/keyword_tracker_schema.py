# app/schemas/keyword_tracker_schema.py

from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# ── Tier limits ───────────────────────────────────────────────────────────────

class TierLimits(BaseModel):
    keyword_limit: int          # -1 = unlimited
    product_limit: int          # -1 = unlimited
    history_days: int
    competitor_limit: int
    checks_per_day: int
    alerts_email: bool
    alerts_whatsapp: bool
    keyword_suggestions: bool
    opportunity_score: bool


# ── Add / manage keywords ─────────────────────────────────────────────────────

class AddKeywordRequest(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=200)
    asin_or_pid: str = Field(..., description="Amazon ASIN or Flipkart PID")
    platform: str = Field(..., pattern="^(amazon|flipkart)$")
    category: Optional[str] = None


class KeywordOut(BaseModel):
    id: int
    keyword: str
    asin_or_pid: str
    platform: str
    category: Optional[str]
    current_rank: Optional[int]
    previous_rank: Optional[int]
    rank_change: Optional[int]          # positive = improved, negative = dropped
    last_checked_at: Optional[datetime]
    created_at: datetime
    is_active: bool
    # AI field — only populated after a rank refresh, None otherwise
    ai_rank_insight: Optional[str] = None

    class Config:
        from_attributes = True


# ── Rank history ──────────────────────────────────────────────────────────────

class RankHistoryPoint(BaseModel):
    checked_at: datetime
    rank: Optional[int]
    page: Optional[int]


class KeywordHistoryOut(BaseModel):
    keyword_id: int
    keyword: str
    asin_or_pid: str
    platform: str
    history: List[RankHistoryPoint]
    # AI field — trend analysis over the full history window
    ai_trend_analysis: Optional[str] = None


# ── Competitor tracking ───────────────────────────────────────────────────────

class AddCompetitorRequest(BaseModel):
    keyword_id: int
    competitor_asin_or_pid: str
    platform: str = Field(..., pattern="^(amazon|flipkart)$")


class CompetitorRankOut(BaseModel):
    id: int
    keyword_id: int
    competitor_asin_or_pid: str
    platform: str
    current_rank: Optional[int]
    last_checked_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Keyword suggestions ───────────────────────────────────────────────────────

class KeywordSuggestion(BaseModel):
    keyword: str
    estimated_search_volume: str    # "Low" | "Medium" | "High"
    competition_level: str          # "Low" | "Medium" | "High"
    opportunity_score: Optional[int] = None  # 0-100, premium only


class SuggestionsOut(BaseModel):
    asin_or_pid: str
    platform: str
    category: Optional[str]
    suggestions: List[KeywordSuggestion]


# ── Alert settings ────────────────────────────────────────────────────────────

class AlertSettingsRequest(BaseModel):
    keyword_id: int
    alert_on_drop: bool = True
    drop_threshold: int = Field(default=5, ge=1, le=50)
    email_enabled: bool = True
    whatsapp_enabled: bool = False
    whatsapp_number: Optional[str] = None


class AlertSettingsOut(BaseModel):
    keyword_id: int
    alert_on_drop: bool
    drop_threshold: int
    email_enabled: bool
    whatsapp_enabled: bool
    whatsapp_number: Optional[str]

    class Config:
        from_attributes = True


# ── Dashboard summary ─────────────────────────────────────────────────────────

class KeywordDashboardOut(BaseModel):
    tier: str
    tier_limits: TierLimits
    keywords_used: int
    keywords_remaining: int         # -1 = unlimited
    total_keywords: int
    improving: int
    declining: int
    stable: int
    not_ranked: int
    keywords: List[KeywordOut]
    # AI field — one sharp insight about the seller's overall ranking health
    ai_insight: Optional[str] = None


# ── Generic responses ─────────────────────────────────────────────────────────

class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str


class ExplorerSerpItem(BaseModel):
    position: int
    title: str
    brand: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    sales_volume: Optional[float] = None
    asin_or_pid: str


class ExplorerVariationItem(BaseModel):
    keyword: str
    search_volume: int
    difficulty: int
    intent: str
    cpc: float


class KeywordExplorerResponse(BaseModel):
    keyword: str
    platform: str
    search_volume: int
    difficulty: int
    intent: str
    cpc: float
    estimated_impressions: int
    estimated_clicks: int
    geo_distribution: Dict[str, float]
    variations: List[ExplorerVariationItem]
    serp: List[ExplorerSerpItem]
    cached_at: str
    global_search_volume: Optional[int] = None
    global_breakdown: Optional[Dict[str, int]] = None
    competitive_density: Optional[float] = None
    serp_features: Optional[List[str]] = None
    trend: Optional[List[int]] = None