# app/schemas/profitability.py

from pydantic import BaseModel, Field
from typing import Optional, List, Any


# ── Input ──────────────────────────────────────────────────────────────────────

class ProfitabilityInput(BaseModel):
    selling_price: float = Field(..., gt=0)
    product_cost: float = Field(..., gt=0)
    shipping_to_fba: float = Field(default=0.0, ge=0)
    fba_fee: float = Field(default=0.0, ge=0)
    ad_spend_per_unit: float = Field(default=0.0, ge=0)
    monthly_units: int = Field(default=100, gt=0)
    return_rate_pct: float = Field(default=0.0, ge=0, le=100)
    storage_fee_per_unit: float = Field(default=0.0, ge=0)
    referral_fee_pct: float = Field(default=9.0, ge=0, le=100)
    category: str = Field(default="Electronics")
    marketplace: str = Field(default="amazon")
    your_brand: Optional[str] = None
    user_id: Optional[str] = None


# ── Cost breakdown ─────────────────────────────────────────────────────────────

class CostBreakdown(BaseModel):
    product_cost: float
    shipping_to_fba: float
    fba_fee: float
    referral_fee: float
    ad_spend: float
    storage_fee: float
    return_cost: float


class ProfitAlert(BaseModel):
    type: str   # "danger" | "warn" | "success"
    message: str


# ── Calc result ────────────────────────────────────────────────────────────────

class ProfitabilityResult(BaseModel):
    tier: str
    marketplace: str
    category: str
    selling_price: float
    total_cost: float
    profit_per_unit: float
    net_margin_pct: float
    monthly_profit: float
    breakeven_units: int
    roi_pct: Optional[float] = None
    acos_pct: Optional[float] = None
    yearly_profit: Optional[float] = None
    cost_breakdown: Optional[CostBreakdown] = None
    alerts: Optional[List[ProfitAlert]] = None


# ── Scenarios ──────────────────────────────────────────────────────────────────

class ScenarioResult(BaseModel):
    label: str
    color: str
    selling_price: float
    ad_spend: float
    units: int
    profit_per_unit: float
    net_margin_pct: float
    monthly_profit: float
    roi_pct: float
    acos_pct: float


class SensitivityPoint(BaseModel):
    price: float
    margin_pct: float
    profit: float


# ── Market intel (from real DB) ────────────────────────────────────────────────

class MarketBenchmarks(BaseModel):
    avg_price: float
    min_price: float
    max_price: float
    avg_rating: Optional[float]
    avg_sales_volume: Optional[float]
    mrp_discount_depth_pct: Optional[float]
    num_products: int
    top_brands: List[str]
    category: str
    marketplace: str


class PriceBand(BaseModel):
    band: str
    band_lo: float
    band_hi: float
    brand_count: int
    product_count: int
    avg_rating: Optional[float]
    opportunity: str   # "High" | "Medium" | "Low" | "Crowded"


class MarketIntelResponse(BaseModel):
    category: str
    marketplace: str
    benchmarks: MarketBenchmarks
    price_bands: List[PriceBand]
    your_price_position: Optional[str]  # "Below market" | "At market" | "Above market"
    your_price: Optional[float]
    insight: str


# ── Business health ────────────────────────────────────────────────────────────

class HealthMetric(BaseModel):
    label: str
    score: float
    status: str   # "good" | "warn" | "bad"
    detail: str


class ActionRecommendation(BaseModel):
    priority: str   # "critical" | "high" | "medium"
    area: str
    action: str
    impact: str


class BusinessHealthResponse(BaseModel):
    overall_score: float
    overall_label: str
    metrics: List[HealthMetric]
    recommendations: List[ActionRecommendation]


# ── Saved products ─────────────────────────────────────────────────────────────

class SavedProductIn(BaseModel):
    name: str
    inputs: ProfitabilityInput
    user_id: str


class SavedProductOut(BaseModel):
    id: str
    name: str
    profit_per_unit: float
    net_margin_pct: float
    monthly_profit: float


# ── AI requests ────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    calc_result: dict
    inputs: dict
    user_id: Optional[str] = None


class ChatRequest(BaseModel):
    question: str
    calc_context: dict
    history: List[dict] = []
    user_id: Optional[str] = None


class ScenarioAIRequest(BaseModel):
    scenarios: List[dict]
    base_inputs: dict
    user_id: Optional[str] = None


class HealthAIRequest(BaseModel):
    health_data: dict
    inputs: dict
    user_id: Optional[str] = None


# ── Tier info ──────────────────────────────────────────────────────────────────

class TierInfo(BaseModel):
    tier: str
    features: dict


# ── Category response ──────────────────────────────────────────────────────────

class CategoryListResponse(BaseModel):
    categories: List[str]
    marketplace: str