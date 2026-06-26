from __future__ import annotations
from fastapi import APIRouter
router = APIRouter()
# Legacy endpoints preserved below

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from typing import List, Optional, Dict, Any
import subprocess, json
from pydantic import BaseModel, Field, field_validator
import uvicorn, hashlib
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import re, random
import redis
from urllib.parse import unquote
from decimal import Decimal
import numpy as np
import pandas as pd
from app.services.legacy_services import lstm_forecast
from app.schemas import legacy_schemas as schemas
from app.models import legacy_models as models
from app.core.cryptography import HashedString
from app.services import legacy_services as crud
from datetime import datetime, timedelta
import requests, traceback, logging
# from payment_routes import router as payment_router
from app.db import session as database_config
from app.db.session import get_db, engine
from app.models.legacy_models import AmazonReview, Product, AmazonProductDetails, IndianProduct, User, ProductTrackerAnalysis, TrackedProduct, KeywordRankHistory, PaymentOrder, PriceAlert, RapidapiFlipkartProduct, RankUpdateRatelimit, Feedback, CompetitorSnapshot, TimeSeriesForcasting
from app.core.security import verify_password, get_password_hash
from app.core.config import settings
from app.services.inbound_service import SellerInboundService
models.Base.metadata.create_all(bind=engine)
# app = FastAPI(title="API", version="1.0.0")
import os
# IS_LOCAL = os.getenv("FASTAPI_LOCAL", "false").lower() == "true"
IS_LOCAL = True
# app = FastAPI(     title="Amazon Reviews API",    version="1.0.0",     docs_url="/docs" if IS_LOCAL else None,     redoc_url="/redoc" if IS_LOCAL else None,     openapi_url="/openapi.json" if IS_LOCAL else None )
# app = FastAPI()  # Migrated to main.py

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://insydz.com", "http://localhost:5173"],  # TODO: restrict in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
 
# app.include_router(payment_router, prefix="/api/payments", tags=["payments"]) # Migrated to main.py

def sanitize_data(data):
    """Recursively convert Decimal objects to floats for JSON serialization."""
    if isinstance(data, list):
        return [sanitize_data(v) for v in data]
    if isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    if isinstance(data, Decimal):
        return float(data)
    return data

class AIQuery(BaseModel):
    question: str
    source: str  # "flipkart" or "amazon"
    limit: Optional[int] = None
    filters: Optional[Dict[str, Any]] = {}

class AIChartAnalysis(BaseModel):
    question: str
    source: str
    chartData: List[Dict[str, Any]]  # ✅ Exact data from frontend charts
    filters: Optional[Dict[str, Any]] = {}


OLLAMA_API_URL = settings.OLLAMA_BASE_URL  # Ollama HTTP API
MAX_DATA_CHARS = 1500
MODEL_NAME = "llama3.2:3b"

from pathlib import Path
_base_dir = Path(__file__).resolve().parent
# Environment variables loaded in main.py

# Redis client
redis_host = os.environ.get("REDIS_HOST", "localhost")
redis_port = int(os.environ.get("REDIS_PORT", 6379))
redis_password = os.environ.get("REDIS_PASSWORD", None)

r = redis.Redis(
    host=redis_host, 
    port=redis_port, 
    db=0, 
    password=redis_password,
    decode_responses=True
)

def decimal_to_float(obj):
    if isinstance(obj, (int, float)):
        return obj
    try:
        return float(obj)
    except Exception:
        return str(obj)


# @app.get("/")
# def read_root():
#     return {"message": "API running"}
@router.get("/")
def read_root():
    if IS_LOCAL:
        return {"message": "Amazon Reviews API running", "docs": "/docs"}
    raise HTTPException(status_code=404, detail="Not Found")

@router.get("/health")
def health_check():
    return {"status": "healthy"}
 
# ----------- Reviews -------------
@router.get("/Amazon_Reviews/reviews", response_model=List[schemas.AmazonReview])
def get_reviews(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    return crud.get_reviews(db, limit=limit, offset=offset)
 
@router.get("/Amazon_Reviews/reviews/{review_id}", response_model=schemas.AmazonReview)
def get_review(review_id: str, db: Session = Depends(get_db)):
    return crud.get_review_by_id(db, review_id)
 
@router.get("/Amazon_Reviews/product/{product_id}", response_model=List[schemas.AmazonReview])
def get_product_reviews(product_id: str, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_product_reviews(db, product_id, limit)
 
@router.get("/Amazon_Reviews/search/{query}", response_model=List[schemas.AmazonReview])
def search_reviews(query: str, limit: int = 50, db: Session = Depends(get_db)):
    cache_key = f"amazon_review_search:{query}:{limit}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    results = crud.search_reviews(db, query, limit)
    final_results = [res for res in results] # results are usually objects, but crud.search_reviews returns objects
    # Wait, crud.search_reviews returns models.AmazonReview objects.
    # json.dumps needs dicts.
    r.setex(cache_key, 1200, json.dumps(sanitize_data([res.__dict__ for res in final_results])))
    return final_results

@router.get("/rapidapi_amazon_products/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """
    Return summary statistics for RapidAPI Amazon Products table
    including total products, average rating, and total reviews count.
    """
    cache_key = "amazon_stats"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    query = text("""
        SELECT 
            COUNT(*) AS total_products,
            ROUND(AVG(product_star_rating_numeric)::numeric, 2) AS average_rating,
            SUM(product_num_ratings) AS total_reviews
        FROM "rapidapi_amazon_products"
        WHERE product_star_rating_numeric IS NOT NULL
    """)

    row = db.execute(query).fetchone()

    result = {
        "total_products": int(row.total_products) if row.total_products else 0,
        "average_rating": float(row.average_rating) if row.average_rating else 0.0,
        "total_reviews": int(row.total_reviews) if row.total_reviews else 0
    }
    
    result = sanitize_data(result)
    r.setex(cache_key, 1200, json.dumps(result))
    return result


@router.get("/Amazon_Reviews/sentiment", response_model=List[schemas.SentimentOut])
def get_sentiment(db: Session = Depends(get_db)):
    cache_key = "amazon_reviews_sentiment"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    results = crud.get_sentiment_distribution(db)
    final_results = [schemas.SentimentOut(sentiment=sentiment, count=count) for sentiment, count in results]
    
    r.setex(cache_key, 1200, json.dumps([res.dict() for res in final_results], default=str))
    return final_results
 
@router.get("/Amazon_Reviews/ratings", response_model=List[schemas.RatingOut])
def get_ratings(db: Session = Depends(get_db)):
    cache_key = "amazon_reviews_ratings"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    results = crud.get_ratings_distribution(db)
    final_results = [schemas.RatingOut(rating=rating, count=count) for rating, count in results]
    
    r.setex(cache_key, 1200, json.dumps([res.dict() for res in final_results], default=str))
    return final_results
 
@router.get("/Amazon_Reviews/categories", response_model=List[schemas.CategoryOut])
def get_category_stats(db: Session = Depends(get_db)):
    return crud.get_category_statistics(db)
 
# ----------- Analytics -------------
@router.get("/Amazon_Reviews/trending", response_model=List[schemas.TrendingProductOut])
def get_trending(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_trending_products(db, limit)
 
@router.get("/Amazon_Reviews/trends/monthly", response_model=List[schemas.MonthlyTrendOut])
def monthly_trends(year: int, db: Session = Depends(get_db)):
    return crud.get_monthly_trends(db, year)
 
@router.get("/Amazon_Reviews/helpful")
def get_helpful(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_helpful_reviews(db, limit)
 
@router.get("/Amazon_Reviews/sentiment/{product_id}", response_model=List[schemas.SentimentOut])
def get_sentiment(product_id: str, db: Session = Depends(get_db)):
    return crud.get_product_sentiment_breakdown(db, product_id)
 
# ----------- flipkart -------------
@router.get("/flipkart", response_model=List[schemas.Product])
def read_products(limit: int = 10, offset: int = 0, category: schemas.Optional[str] = None,
                  min_price: schemas.Optional[float] = None, max_price: schemas.Optional[float] = None,
                  db: Session = Depends(get_db)):
    return crud.get_products(db, limit, offset, category, min_price, max_price)

@router.get("/analytics-summary")
def analytics_summary(
    source: str = Query("flipkart", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db)
):
    cache_key = f"analytics_summary:{source}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    result = crud.get_summary(db, source)
    sanitized = sanitize_data(result)
    r.setex(cache_key, 1200, json.dumps(sanitized))
    return sanitized

@router.get("/analytics/category", response_model=schemas.CategoryAnalyticsResponse)
def analytics_by_category(db: Session = Depends(get_db)):
    cache_key = "analytics_category"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    categories = crud.get_category_analytics(db)
    result = sanitize_data({"categories": categories})
    r.setex(cache_key, 1200, json.dumps(result))
    return result


import json
import re
import hashlib
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import requests

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role:    str   # "user" | "assistant"
    content: str

class AIQuery(BaseModel):
    source:         str
    question:       str
    filters:        Optional[Dict[str, Any]] = {}
    limit:          Optional[int]            = 100
    session_id:     Optional[str]            = None
    seller_profile: Optional[Dict]           = {}
    stream:         Optional[bool]           = False


# ──────────────────────────────────────────────────────────────────────
# REDIS MEMORY  (graceful degradation if Redis is down)
# ──────────────────────────────────────────────────────────────────────

MAX_HISTORY_TURNS = 10
HISTORY_TTL       = 7200   # 2 hours
CONTEXT_TTL       = 7200

def _history_key(sid: str) -> str: return f"chat_history:{sid}"
def _context_key(sid: str) -> str: return f"chat_context:{sid}"

def _redis_get(key: str):
    """Redis get with graceful failure."""
    try:
        return r.get(key)
    except Exception as e:
        logger.warning(f"Redis GET failed for {key}: {e}")
        return None

def _redis_setex(key: str, ttl: int, value: str):
    """Redis setex with graceful failure."""
    try:
        r.setex(key, ttl, value)
    except Exception as e:
        logger.warning(f"Redis SETEX failed for {key}: {e}")

def _redis_delete(key: str):
    try:
        r.delete(key)
    except Exception as e:
        logger.warning(f"Redis DELETE failed for {key}: {e}")

def load_history(sid: str) -> List[Message]:
    raw = _redis_get(_history_key(sid))
    if not raw: return []
    try:
        return [Message(**m) for m in json.loads(raw)]
    except Exception:
        return []

def save_history(sid: str, history: List[Message]) -> None:
    trimmed = history[-(MAX_HISTORY_TURNS * 2):]
    _redis_setex(_history_key(sid), HISTORY_TTL, json.dumps([m.dict() for m in trimmed]))

def append_turn(sid: str, user_msg: str, assistant_msg: str) -> None:
    history = load_history(sid)
    history.append(Message(role="user",      content=user_msg))
    history.append(Message(role="assistant", content=assistant_msg))
    save_history(sid, history)

def load_context(sid: str) -> Dict:
    raw = _redis_get(_context_key(sid))
    if not raw: return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}

def save_context(sid: str, ctx: Dict) -> None:
    _redis_setex(_context_key(sid), CONTEXT_TTL, json.dumps(ctx))


# ──────────────────────────────────────────────────────────────────────
# SAFE TYPE HELPERS
# Prevents 500s from None / type mismatches in DB rows
# ──────────────────────────────────────────────────────────────────────

def safe_int(val, default=0) -> int:
    try:
        return int(val) if val is not None else default
    except (TypeError, ValueError):
        return default

def safe_float(val, default=0.0) -> float:
    try:
        return float(val) if val is not None else default
    except (TypeError, ValueError):
        return default

def safe_str(val, default="") -> str:
    return str(val).strip() if val is not None else default

def safe_avg(values: List) -> float:
    cleaned = [safe_float(v) for v in values if v is not None]
    return sum(cleaned) / len(cleaned) if cleaned else 0.0

def serialize_row(row) -> Dict:
    """Safely convert a SQLAlchemy Row to a dict, handling all edge cases."""
    try:
        d = dict(row._mapping)
        # Convert any non-JSON-serializable types
        return {
            k: (
                float(v) if hasattr(v, '__float__') and not isinstance(v, (int, float, bool, str, type(None)))
                else v
            )
            for k, v in d.items()
        }
    except Exception as e:
        logger.warning(f"Row serialization warning: {e}")
        try:
            return {str(k): str(v) for k, v in row._mapping.items()}
        except Exception:
            return {}


# ──────────────────────────────────────────────────────────────────────
# DEEP CONTEXT EXTRACTOR
# ──────────────────────────────────────────────────────────────────────

PRODUCT_EXTRACT_PATTERNS = [
    r"\b(?:sell|selling|launch|start selling|list|want to sell)\s+([a-zA-Z0-9 \-]+?)(?:\s+(?:on|for|at|in|under|below|price|₹|rs)|\.|,|$)",
    r"\b(?:i have|i got|i make|i manufacture|i import|i produce)\s+([a-zA-Z0-9 \-]+?)(?:\s+(?:and|for|to sell|,)|\.|$)",
    r"\bhow (?:will|would|does|is)\s+([a-zA-Z0-9 \-]+?)\s+(?:perform|sell|do|fare)",
    r"\b(?:viability|potential|scope|market) (?:of|for)\s+([a-zA-Z0-9 \-]+)",
    r"\bselling\s+([a-zA-Z0-9 \-]{3,30})\b",
]

PRICE_TARGET_PATTERN = re.compile(
    r"(?:under|below|less than|around|at|for|upto|up to|about)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)",
    re.IGNORECASE
)

CATEGORY_HINTS = {
    r"phone|mobile|smartphone|earbu|headphone|charger|cable|power.?bank|speaker|laptop|tablet|keyboard|mouse|smartwatch|wearable": "electronics",
    r"shirt|kurta|saree|dress|jeans|shoes|sandal|bag|wallet|watch|jewel|ring|necklace|legging|kurti|ethnic|t.?shirt|hoodie": "fashion",
    r"face.?wash|serum|moistur|lipstick|foundation|shampoo|conditioner|hair.?oil|lotion|skincare|haircare|sunscreen|toner": "beauty",
    r"toy|game|puzzle|doll|cycle|scooter|kids|children|baby|lego|board.?game": "toys & games",
    r"kitchen|cookware|utensil|mixer|pressure.?cooker|pan|knife|bottle|container|tiffin|thermos": "kitchen",
    r"book|notebook|pen|pencil|stationery|diary|planner|marker": "stationery",
    r"yoga|dumbbell|protein|supplement|gym|fitness|sport|cricket|football|badminton|cycling": "sports & fitness",
    r"sofa|bed|chair|table|almirah|curtain|pillow|mattress|decor|furniture|lamp|shelf": "home & furniture",
    r"biscuit|chips|snack|juice|tea|coffee|spice|oil|grocery|dry.?fruit|pickle|sauce": "food & grocery",
    r"face.?mask|n95|sanitizer|thermometer|bp.?monitor|glucometer|pulse.?oximeter": "health & personal care",
    r"perfume|deodorant|cologne|body.?spray|fragrance": "beauty",
    r"diaper|formula|baby.?food|rattle|stroller|pram": "baby products",
}

def extract_product_from_question(question: str, history: List[Message]) -> Dict:
    combined = question
    for m in history[-4:]:
        if m.role == "user":
            combined = m.content + " " + combined

    result: Dict[str, Any] = {"product": None, "category": None, "price_target": None}

    for pattern in PRODUCT_EXTRACT_PATTERNS:
        match = re.search(pattern, question, re.IGNORECASE)
        if match:
            raw = match.group(1).strip().lower()
            if len(raw) > 2 and raw not in ("it", "this", "that", "them", "these", "my", "the", "a"):
                result["product"] = raw
                break

    # If no product found from current question, check history context
    if not result["product"]:
        for m in reversed(history[-6:]):
            if m.role == "user":
                for pattern in PRODUCT_EXTRACT_PATTERNS:
                    match = re.search(pattern, m.content, re.IGNORECASE)
                    if match:
                        raw = match.group(1).strip().lower()
                        if len(raw) > 2 and raw not in ("it", "this", "that", "them", "these"):
                            result["product"] = raw
                            break
                if result["product"]:
                    break

    text_lower = (result["product"] or combined).lower()
    for pattern_str, cat in CATEGORY_HINTS.items():
        if re.search(pattern_str, text_lower, re.IGNORECASE):
            result["category"] = cat
            break

    price_match = PRICE_TARGET_PATTERN.search(combined)
    if price_match:
        result["price_target"] = safe_int(price_match.group(1).replace(",", ""))

    return result


# ──────────────────────────────────────────────────────────────────────
# CONVERSATION MODE DETECTOR
# ──────────────────────────────────────────────────────────────────────

VIABILITY_PATTERN = re.compile(
    r"\b(can i sell|will .{1,20} sell|should i sell|is .{1,20} profitable|viability|"
    r"want to sell|thinking of selling|planning to sell|i sell|i have .{1,20} to sell|"
    r"how will .{1,20} perform|scope of|potential of|worth selling|is it good to sell|"
    r"good product to sell|should i start|is there demand)\b",
    re.IGNORECASE
)
DECISION_PATTERN = re.compile(
    r"\b(which is better|what should i choose|vs\.?|compare|between .{1,20} and|"
    r"recommend|suggest|what would you pick|which one|which category|or .{1,20} which)\b",
    re.IGNORECASE
)
EXECUTION_PATTERN = re.compile(
    r"\b(how do i|how to|what should i|steps to|help me|set up|get started|"
    r"start selling|create listing|price my|optimize|improve my|increase sales|"
    r"boost|grow|scale|market my|advertise)\b",
    re.IGNORECASE
)

def detect_conversation_mode(question: str, history: List[Message]) -> str:
    q = question.lower()
    if VIABILITY_PATTERN.search(q): return "viability"
    if DECISION_PATTERN.search(q):  return "decision"
    if EXECUTION_PATTERN.search(q): return "execution"
    if history and any(
        VIABILITY_PATTERN.search(m.content) for m in history[-6:] if m.role == "user"
    ):
        return "deep_dive"
    return "research"


# ──────────────────────────────────────────────────────────────────────
# MARKET ENTRY SCORER
# ──────────────────────────────────────────────────────────────────────

def compute_market_score(data: List[Dict], price_target: Optional[int] = None) -> Optional[Dict]:
    if not data:
        return None

    try:
        total_listings = sum(safe_int(r.get("listings")) for r in data)
        total_reviews  = sum(safe_int(r.get("total_reviews")) for r in data)
        rated_rows     = [r for r in data if r.get("avg_rating")]
        avg_rating     = safe_avg([r.get("avg_rating") for r in rated_rows]) if rated_rows else 0.0
        sales_rows     = [r for r in data if r.get("avg_sales")]
        avg_sales      = safe_avg([r.get("avg_sales") for r in sales_rows]) if sales_rows else 0.0
        priced_rows    = [r for r in data if r.get("avg_price")]
        avg_price      = safe_avg([r.get("avg_price") for r in priced_rows]) if priced_rows else 0.0

        # Competition: fewer listings + fewer reviews = easier entry
        comp_raw          = min(total_listings / 60.0, 1.0)
        competition_score = round((1 - comp_raw) * 100)

        # Demand: more reviews + sales = more validated demand
        demand_raw   = min(total_reviews / 15000.0, 1.0)
        demand_score = round(demand_raw * 100)

        # Margin: price fit + price level
        if price_target and avg_price > 0:
            ratio = price_target / avg_price
            fit   = 1.0 if 0.5 <= ratio <= 1.5 else (0.7 if 0.3 <= ratio <= 2.0 else 0.3)
        else:
            fit = 0.75
        price_score  = min(avg_price / 2500.0, 1.0)
        margin_score = round(((price_score * 0.5) + (fit * 0.5)) * 100)

        overall = round(competition_score * 0.35 + demand_score * 0.40 + margin_score * 0.25)

        return {
            "competition_score": competition_score,
            "demand_score":      demand_score,
            "margin_score":      margin_score,
            "overall_score":     overall,
            "avg_price":         round(avg_price),
            "avg_rating":        round(avg_rating, 2),
            "avg_sales":         round(avg_sales),
            "total_listings":    total_listings,
            "verdict": (
                "Strong opportunity"                if overall >= 70 else
                "Decent opportunity"                if overall >= 50 else
                "Tough market"                      if overall >= 35 else
                "Very competitive — enter carefully"
            )
        }
    except Exception as e:
        logger.warning(f"Market score computation error: {e}")
        return None


# ──────────────────────────────────────────────────────────────────────
# FOLLOW-UP QUESTION GENERATOR
# ──────────────────────────────────────────────────────────────────────

FOLLOWUP_BY_MODE = {
    "viability": [
        "Who are the top brands selling this?",
        "What price range should I target?",
        "What rating do I need to compete?",
    ],
    "decision": [
        "Which category has higher margins?",
        "What does the demand look like long-term?",
        "Which is easier to break into right now?",
    ],
    "execution": [
        "What listing title works best for this?",
        "How do I price against existing sellers?",
        "What's a realistic sales target for month 1?",
    ],
    "deep_dive": [
        "What are the biggest risks here?",
        "Should I focus on budget or premium segment?",
        "How does this perform during festive season?",
    ],
    "research": [
        "What's the most profitable category right now?",
        "Which products have the least competition?",
        "Where's the biggest market gap today?",
    ],
}

def generate_followup_questions(mode: str, intents: List[str], product: Optional[str], data: List[Dict]) -> List[str]:
    base = FOLLOWUP_BY_MODE.get(mode, FOLLOWUP_BY_MODE["research"]).copy()

    if product:
        p = product.title()
        if mode == "viability":
            base[0] = f"Who are the top brands selling {p}?"
            base[1] = f"What's the sweet spot price for {p}?"
        elif mode == "research":
            base[0] = f"What does {p} demand look like?"
            base[1] = f"Is {p} more popular on Flipkart or Amazon?"

    if data:
        top = data[0]
        cat = safe_str(top.get("category_name"))
        if cat and mode in ("research", "viability"):
            base.append(f"Tell me more about {cat}")

    return base[:3]


# ──────────────────────────────────────────────────────────────────────
# INTENT DETECTION
# ──────────────────────────────────────────────────────────────────────

INTENT_PATTERNS = {
    "price_analysis":    r"\b(price|pricing|cost|cheap|expensive|afford|budget|range|₹|rs\.?|rupee|how much)\b",
    "top_products":      r"\b(best|top|popular|trending|most sold|highest rated|recommend|suggest|which product)\b",
    "category_insights": r"\b(categor|segment|niche|market|space|vertical|industry)\b",
    "competitor":        r"\b(competitor|vs\.?|compare|versus|better than|alternative|rival|who else|other sellers)\b",
    "opportunity":       r"\b(opportunit|gap|underserved|potential|untapped|enter|launch|start selling|new to)\b",
    "rating_quality":    r"\b(rating|review|quality|feedback|trust|reputation|star|customer says)\b",
    "sales_volume":      r"\b(sales|volume|demand|selling|sold|units|revenue|turnover|how many|how much sold)\b",
    "brand_analysis":    r"\b(brand|seller|vendor|manufacturer|who sells|which brand|dominant|leader)\b",
    "profit_margin":     r"\b(profit|margin|markup|net|gross|earn|make money|worth it|return|roi)\b",
    "seasonal":          r"\b(season|festival|diwali|holi|summer|winter|monsoon|trend|peak|off.?season)\b",
    "listing_tips":      r"\b(listing|title|description|image|photo|seo|keyword|rank|visibility|content)\b",
    "logistics":         r"\b(shipping|delivery|logistic|warehouse|fulfil|return|dispatch|courier|fba|fbf)\b",
    "general_advice":    r"\b(advice|tip|strategy|how to|should i|what to|guide|help|explain|tell me|suggest)\b",
}

TONE_SIGNALS = {
    "frustrated": r"\b(not working|useless|wrong|bad|terrible|why is|i don'?t understand|makes no sense|wtf|ugh|worst|not helpful|garbage)\b",
    "excited":    r"\b(amazing|great|wow|love|excited|awesome|can'?t wait|perfect|finally|yes!|brilliant)\b",
    "confused":   r"\b(confused|don'?t get|what does|what is|explain|i'?m lost|unclear|huh\??|mean|not sure)\b",
    "urgent":     r"\b(asap|urgent|quickly|right now|immediately|today|tonight|deadline|fast|hurry|need now)\b",
    "beginner":   r"\b(new to|just started|beginner|don'?t know|never sold|first time|how do i even|basics|starting out)\b",
    "expert":     r"\b(roi|cac|ltv|cogs|margin|logistics|fulfilment|api|inventory|wholesale|b2b|acos|roas)\b",
}

def detect_intent(question: str) -> List[str]:
    q = question.lower()
    found = [i for i, p in INTENT_PATTERNS.items() if re.search(p, q)]
    return found or ["general_advice"]

def detect_tone(question: str, history: List[Message]) -> Dict[str, bool]:
    combined = question.lower()
    for m in history[-4:]:
        if m.role == "user":
            combined += " " + m.content.lower()
    return {t: bool(re.search(p, combined)) for t, p in TONE_SIGNALS.items()}


# ──────────────────────────────────────────────────────────────────────
# WHERE CLAUSE BUILDER  (parameterised-style but for text() queries)
# ──────────────────────────────────────────────────────────────────────

def _safe_like_value(val: str) -> str:
    """Escape single quotes and SQL wildcards for LIKE patterns."""
    return val.replace("'", "''").replace("%", r"\%").replace("_", r"\_")

def build_where_clause(filters: Dict[str, Any], source: str, extra_category: str = "") -> str:
    conditions = []

    category = safe_str(filters.get("category", "")) or extra_category
    if category and category.lower() not in ("all categories", "all", ""):
        safe_cat  = _safe_like_value(category)
        cat_field = "category_name" if source in ("flipkart", "amazon") else "category_name"
        conditions.append(f"LOWER({cat_field}) LIKE LOWER('%{safe_cat}%')")

    price_range = filters.get("priceRange", [0, 5_000_000])
    if not isinstance(price_range, (list, tuple)) or len(price_range) < 2:
        price_range = [0, 5_000_000]
    price_field = "product_price" if source == "flipkart" else "product_price_numeric"
    lo, hi = safe_int(price_range[0]), safe_int(price_range[1], 5_000_000)
    if lo > 0:       conditions.append(f"{price_field} >= {lo}")
    if hi < 5_000_000: conditions.append(f"{price_field} <= {hi}")

    rating = safe_float(filters.get("rating", 0))
    if rating > 0:
        rating_field = "product_star_rating" if source == "flipkart" else "product_star_rating_numeric"
        conditions.append(f"{rating_field} >= {rating}")

    if filters.get("showTrendingOnly") and source == "amazon":
        conditions.append("sales_volume IS NOT NULL AND sales_volume != ''")

    return " AND ".join(conditions) if conditions else "1=1"


# ──────────────────────────────────────────────────────────────────────
# PRODUCT-SPECIFIC SQL  (keyword search on product titles)
# ──────────────────────────────────────────────────────────────────────

def build_product_sql(source: str, product: str, limit: int) -> str:
    safe = _safe_like_value(product)
    keywords = safe.split()[:4]  # use up to 4 words for matching

    # Build OR conditions for multi-word search
    title_conditions = " OR ".join([
        f"product_title ILIKE '%{kw}%'" for kw in keywords
    ])

    if source == "flipkart":
        brand_conditions = " OR ".join([f"brand ILIKE '%{kw}%'" for kw in keywords])
        return f"""
            SELECT
                product_title,
                brand,
                category_name,
                ROUND(COALESCE(product_price, 0)::numeric, 0)       AS price,
                COALESCE(product_star_rating, 0)                     AS rating,
                COALESCE(product_rating_count, 0)                    AS review_count,
                ROUND(COALESCE(estimated_sales, 0)::numeric, 0)      AS sales,
                stock_status
            FROM rapidapi_flipkart_products
            WHERE product_title IS NOT NULL
              AND ({title_conditions} OR {brand_conditions})
            ORDER BY COALESCE(product_rating_count, 0) DESC
            LIMIT {min(limit, 20)}
        """
    else:
        return f"""
            SELECT
                product_title,
                category_name,
                ROUND(COALESCE(product_price_numeric, 0)::numeric, 0)   AS price,
                COALESCE(product_star_rating_numeric, 0)                 AS rating,
                COALESCE(product_num_ratings, 0)                         AS review_count,
                ROUND(COALESCE(avg_sales_volume, 0)::numeric, 0)         AS sales,
                sales_volume                                             AS sales_badge,
                is_best_seller,
                is_amazon_choice
            FROM rapidapi_amazon_products
            WHERE product_title IS NOT NULL
              AND ({title_conditions})
            ORDER BY COALESCE(product_num_ratings, 0) DESC
            LIMIT {min(limit, 20)}
        """


# ──────────────────────────────────────────────────────────────────────
# AGGREGATED SQL FAN-OUT  (intent-driven)
# ──────────────────────────────────────────────────────────────────────

def build_smart_sql(source: str, where_clause: str, intents: List[str], limit: int) -> Tuple[str, str]:
    safe_limit = min(int(limit), 120)

    if source == "flipkart":
        platform = "Flipkart"
        if any(i in intents for i in ["brand_analysis", "competitor"]):
            sql = f"""
                SELECT
                    COALESCE(brand, 'Unknown') AS brand,
                    COALESCE(category_name, 'Unknown') AS category_name,
                    COUNT(*)                                                          AS listings,
                    ROUND(AVG(COALESCE(product_price,0))::numeric, 0)                AS avg_price,
                    ROUND(MIN(COALESCE(product_price,0))::numeric, 0)                AS min_price,
                    ROUND(MAX(COALESCE(product_price,0))::numeric, 0)                AS max_price,
                    ROUND(AVG(COALESCE(product_star_rating,0))::numeric, 2)          AS avg_rating,
                    COALESCE(SUM(product_rating_count), 0)                           AS total_reviews,
                    ROUND(AVG(COALESCE(estimated_sales,0))::numeric, 0)              AS avg_sales
                FROM rapidapi_flipkart_products
                WHERE product_title IS NOT NULL AND {where_clause}
                GROUP BY brand, category_name
                ORDER BY total_reviews DESC
                LIMIT {safe_limit}
            """
        elif "price_analysis" in intents:
            sql = f"""
                SELECT
                    COALESCE(category_name, 'Unknown') AS category_name,
                    COALESCE(brand, 'Unknown') AS brand,
                    COUNT(*)                                                          AS listings,
                    ROUND(MIN(COALESCE(product_price,0))::numeric, 0)                AS min_price,
                    ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY COALESCE(product_price,0))::numeric, 0) AS p25_price,
                    ROUND(AVG(COALESCE(product_price,0))::numeric, 0)                AS avg_price,
                    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY COALESCE(product_price,0))::numeric, 0) AS p75_price,
                    ROUND(MAX(COALESCE(product_price,0))::numeric, 0)                AS max_price,
                    ROUND(AVG(COALESCE(product_star_rating,0))::numeric, 2)          AS avg_rating,
                    COALESCE(SUM(product_rating_count), 0)                           AS total_reviews
                FROM rapidapi_flipkart_products
                WHERE product_title IS NOT NULL AND {where_clause}
                GROUP BY category_name, brand
                ORDER BY listings DESC
                LIMIT {safe_limit}
            """
        else:
            sql = f"""
                SELECT
                    COALESCE(category_name, 'Unknown') AS category_name,
                    COALESCE(brand, 'Unknown') AS brand,
                    COUNT(*)                                                          AS listings,
                    ROUND(MIN(COALESCE(product_price,0))::numeric, 0)                AS min_price,
                    ROUND(MAX(COALESCE(product_price,0))::numeric, 0)                AS max_price,
                    ROUND(AVG(COALESCE(product_price,0))::numeric, 0)                AS avg_price,
                    ROUND(AVG(COALESCE(product_star_rating,0))::numeric, 2)          AS avg_rating,
                    COALESCE(SUM(product_rating_count), 0)                           AS total_reviews,
                    ROUND(AVG(COALESCE(estimated_sales,0))::numeric, 0)              AS avg_sales
                FROM rapidapi_flipkart_products
                WHERE product_title IS NOT NULL AND {where_clause}
                GROUP BY category_name, brand
                ORDER BY total_reviews DESC
                LIMIT {safe_limit}
            """
    else:
        platform = "Amazon"
        sql = f"""
            SELECT
                COALESCE(category_name, 'Unknown') AS category_name,
                COUNT(*)                                                              AS listings,
                ROUND(MIN(COALESCE(product_price_numeric,0))::numeric, 0)            AS min_price,
                ROUND(MAX(COALESCE(product_price_numeric,0))::numeric, 0)            AS max_price,
                ROUND(AVG(COALESCE(product_price_numeric,0))::numeric, 0)            AS avg_price,
                ROUND(AVG(COALESCE(product_star_rating_numeric,0))::numeric, 2)      AS avg_rating,
                COALESCE(SUM(product_num_ratings), 0)                                AS total_reviews,
                ROUND(AVG(COALESCE(avg_sales_volume,0))::numeric, 0)                 AS avg_sales,
                COUNT(CASE WHEN is_best_seller = TRUE THEN 1 END)                    AS best_seller_count,
                COUNT(CASE WHEN is_amazon_choice = TRUE THEN 1 END)                  AS amazon_choice_count
            FROM rapidapi_amazon_products
            WHERE product_title IS NOT NULL AND {where_clause}
            GROUP BY category_name
            ORDER BY total_reviews DESC
            LIMIT {safe_limit}
        """

    return sql.strip(), platform


# ──────────────────────────────────────────────────────────────────────
# PROACTIVE INSIGHT INJECTOR
# ──────────────────────────────────────────────────────────────────────

def generate_proactive_insight(data: List[Dict], intents: List[str]) -> str:
    if not data:
        return ""
    insights = []

    try:
        # Hidden gem: good rating, low review count = low competition
        rated = [r for r in data if safe_float(r.get("avg_rating")) >= 4.0 and safe_int(r.get("total_reviews")) > 0]
        if rated:
            gem = min(rated, key=lambda x: safe_int(x.get("total_reviews"), 999_999))
            reviews = safe_int(gem.get("total_reviews"))
            rating  = safe_float(gem.get("avg_rating"))
            cat     = safe_str(gem.get("category_name") or gem.get("brand") or "?")
            if reviews < 1000 and rating >= 4.0:
                insights.append(
                    f"Hidden gem: '{cat}' has {rating}★ but only {reviews:,} reviews — "
                    f"low competition with proven demand."
                )

        # Price gap: wide spread signals premium opportunity
        for row in data[:5]:
            mx  = safe_float(row.get("max_price"))
            avg = safe_float(row.get("avg_price"))
            mn  = safe_float(row.get("min_price"))
            cat = safe_str(row.get("category_name", "?"))
            if mx > 0 and avg > 0 and mx / avg > 3.5 and mn > 0:
                insights.append(
                    f"Price gap in '{cat}': ₹{int(mn):,}–₹{int(mx):,} (avg ₹{int(avg):,}) — "
                    f"room for premium positioning."
                )
                break

        # Quality gap: high sales, low ratings = easy to win
        for row in data[:5]:
            sales  = safe_float(row.get("avg_sales"))
            rating = safe_float(row.get("avg_rating"))
            cat    = safe_str(row.get("category_name", "?"))
            if sales > 200 and 0 < rating < 3.8:
                insights.append(
                    f"Quality gap: '{cat}' doing ~{int(sales):,} avg sales/month with only {rating}★ — "
                    f"a better product could win fast."
                )
                break

    except Exception as e:
        logger.warning(f"Proactive insight error: {e}")

    return insights[0] if insights else ""


# ──────────────────────────────────────────────────────────────────────
# MASTER PROMPT BUILDER
# ──────────────────────────────────────────────────────────────────────

def build_master_prompt(
    question:        str,
    history:         List[Message],
    agg_data:        List[Dict],
    product_data:    List[Dict],
    platform:        str,
    intents:         List[str],
    tone:            Dict[str, bool],
    filters:         Dict,
    seller_profile:  Dict,
    proactive:       str,
    mode:            str,
    extracted:       Dict,
    market_score:    Optional[Dict],
    session_context: Dict,
) -> str:

    # ── Seller identity ──
    name   = safe_str(seller_profile.get("name") or session_context.get("seller_name"))
    cat    = safe_str(seller_profile.get("category") or session_context.get("product_of_interest"))
    exp    = safe_str(seller_profile.get("experience"))
    budget = safe_str(seller_profile.get("budget"))

    identity_lines = []
    if name:   identity_lines.append(f"Name: {name}")
    if cat:    identity_lines.append(f"Interested in: {cat}")
    if exp:    identity_lines.append(f"Experience: {exp}")
    if budget: identity_lines.append(f"Budget: {budget}")
    identity_block = "\n".join(identity_lines)

    # ── Conversation history ──
    history_lines = []
    for m in history[-(MAX_HISTORY_TURNS * 2):]:
        prefix = "Seller" if m.role == "user" else "Insydz"
        history_lines.append(f"{prefix}: {m.content}")
    history_block = "\n".join(history_lines)

    # ── Filter context ──
    filter_parts = []
    fc = safe_str(filters.get("category", ""))
    if fc and fc.lower() not in ("all categories", "all", ""):
        filter_parts.append(f"Category: {fc}")
    pr = filters.get("priceRange", [0, 5_000_000])
    if isinstance(pr, (list, tuple)) and len(pr) >= 2:
        lo, hi = safe_int(pr[0]), safe_int(pr[1], 5_000_000)
        if lo > 0 or hi < 5_000_000:
            filter_parts.append(f"Price: ₹{lo:,}–₹{hi:,}")
    if safe_float(filters.get("rating", 0)) > 0:
        filter_parts.append(f"Min rating: {filters['rating']}★")
    filter_block = ", ".join(filter_parts) or "Full catalog"

    # ── Market score ──
    score_block = ""
    if market_score:
        score_block = f"""
Market Entry Scores:
• Overall opportunity:  {market_score['overall_score']}/100  ({market_score['verdict']})
• Demand score:         {market_score['demand_score']}/100
• Competition score:    {market_score['competition_score']}/100  (higher = less competition)
• Margin potential:     {market_score['margin_score']}/100
• Avg market price:     ₹{market_score['avg_price']:,}
• Avg market rating:    {market_score['avg_rating']}★
• Avg monthly sales:    ~{market_score['avg_sales']:,} units
• Total listings found: {market_score['total_listings']:,}
"""

    # ── Product-specific data ──
    product_block = ""
    if product_data:
        top5 = product_data[:5]
        try:
            product_block = f"\nActual matching products (top {len(top5)}):\n{json.dumps(top5, indent=2, default=str)}"
        except Exception:
            product_block = f"\nFound {len(product_data)} matching products."

    # ── Aggregated market data ──
    agg_block = ""
    if agg_data:
        try:
            agg_block = f"\nMarket data ({len(agg_data)} segments):\n{json.dumps(agg_data[:8], indent=2, default=str)}"
        except Exception:
            agg_block = f"\nFound {len(agg_data)} market segments."

    # ── No data fallback ──
    no_data_instruction = ""
    if not agg_data and not product_data:
        no_data_instruction = (
            "\nNOTE: No matching data found in the database for this query. "
            "Give your best expert answer based on general Indian e-commerce knowledge. "
            "Be transparent that this is general advice, not platform-specific data."
        )

    # ── Tone ──
    tone_map = {
        "frustrated": "They're frustrated — acknowledge briefly (one line), then be extra clear and direct.",
        "confused":   "They're confused — break it down step by step, no jargon.",
        "excited":    "They're excited — match the energy, stay sharp and factual.",
        "urgent":     "They need this fast — lead with the most important point, zero preamble.",
        "beginner":   "They're new — explain from basics, no assumed knowledge.",
        "expert":     "They're experienced — skip basics, give metrics and tactics.",
    }
    tone_instruction = next((v for k, v in tone_map.items() if tone.get(k)), "")

    # ── Mode instructions ──
    mode_instructions = {
        "viability": (
            "The seller wants to know if they can successfully sell a specific product.\n"
            "Use market scores. Be honest — if it's competitive, say so clearly.\n"
            "Cover: demand, competition, realistic price, one key risk.\n"
            "End with a clear YES / YES BUT / NO UNLESS verdict."
        ),
        "decision": (
            "They're choosing between options. Compare directly with numbers.\n"
            "Pick a winner and explain exactly why."
        ),
        "execution": (
            "They've decided what to sell — they want HOW.\n"
            "Give concrete steps executable today. Use exact prices, rating benchmarks, platform tactics."
        ),
        "deep_dive": (
            "Follow-up on previously discussed topic. Go deeper.\n"
            "Use conversation history. Don't repeat what you already said."
        ),
        "research": (
            "They're exploring. Surface the most interesting data points.\n"
            "Help them discover something they didn't know they needed."
        ),
    }
    mode_instruction = mode_instructions.get(mode, mode_instructions["research"])

    # ── Intent focus ──
    intent_focus_map = {
        "price_analysis":    "Focus on price bands and optimal entry price point.",
        "top_products":      "Lead with top performers by reviews and sales.",
        "opportunity":       "Find the gap: low competition + real demand.",
        "competitor":        "Compare directly — who's stronger and why.",
        "rating_quality":    "Analyse quality signals and rating distribution.",
        "brand_analysis":    "Break down brand presence and pricing strategy.",
        "sales_volume":      "Quantify demand with actual numbers.",
        "profit_margin":     "Estimate realistic margins from the data.",
        "seasonal":          "Connect to Indian festival and seasonal demand cycles.",
        "listing_tips":      "Give concrete listing optimisation tactics.",
        "logistics":         "Practical shipping and fulfilment advice.",
        "general_advice":    "Give the single most useful strategic insight.",
    }
    focus_lines = [intent_focus_map[i] for i in intents if i in intent_focus_map]
    focus_block = "\n".join(f"• {l}" for l in focus_lines) or "• Answer directly and helpfully."

    proactive_block = f"\nInteresting data finding — weave in naturally:\n{proactive}" if proactive else ""

    extracted_block = ""
    if extracted.get("product"):
        extracted_block = f"\nProduct in question: {extracted['product']}"
    if extracted.get("price_target"):
        extracted_block += f"\nTarget price: ₹{extracted['price_target']:,}"
    if extracted.get("category"):
        extracted_block += f"\nInferred category: {extracted['category']}"

    prompt = f"""You are Insydz, a sharp and direct e-commerce expert helping Indian sellers on {platform}.

Your style:
- Talk like a real person — confident, direct, zero corporate fluff
- Use "look", "honestly", "here's the thing", "the data says"
- Share opinions confidently — don't hedge everything
- Always use ₹, never $ or USD  
- Max 250 words. Short punchy paragraphs.
- NEVER open with "Great question!", "Certainly!", "Of course!", "Sure!", "Hello!"
- NEVER repeat the question back
- If data is limited, give your best expert take clearly and say it's your take
- If you have NO data at all, give general Indian e-commerce advice and note it's general guidance
- You can ALWAYS answer — never refuse because of missing data

{f"Seller profile:{chr(10)}{identity_block}{chr(10)}" if identity_block else ""}Filters: {filter_block}
{extracted_block}
{f"Conversation so far:{chr(10)}{history_block}{chr(10)}" if history_block else ""}
{score_block}
{product_block}
{agg_block}
{proactive_block}
{no_data_instruction}

Mode: {mode.upper()} — {mode_instruction}

Focus:
{focus_block}
{f"Tone note: {tone_instruction}" if tone_instruction else ""}

Seller: {question}

Insydz:"""

    return prompt


# ──────────────────────────────────────────────────────────────────────
# POST-PROCESSOR
# ──────────────────────────────────────────────────────────────────────

BAD_OPENERS = re.compile(
    r"^(great question[!.]?|certainly[!.]?|of course[!.]?|absolutely[!.]?|"
    r"sure[!.]?|hello[!.]?|hi there[!.]?|as an ai[,.]?|i'?m an? ai[,.]?|"
    r"thank you for [^.]+\.|thanks for [^.]+\.|i understand[,.]?)\s*",
    re.IGNORECASE
)
SELF_REF    = re.compile(r"\b(as insydz|insydz here|this is insydz)\b", re.IGNORECASE)
PROMPT_LEAK = re.compile(
    r"(seller asks:|insydz:|your focus|tone note|market data|conversation mode|seller profile:)",
    re.IGNORECASE
)

def post_process(text: str) -> str:
    if not text:
        return ""
    text = text.strip()
    text = BAD_OPENERS.sub("", text).strip()
    if text:
        text = text[0].upper() + text[1:]
    text = SELF_REF.sub("", text)
    m = PROMPT_LEAK.search(text)
    if m:
        text = text[:m.start()].strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ──────────────────────────────────────────────────────────────────────
# OLLAMA
# ──────────────────────────────────────────────────────────────────────

OLLAMA_PARAMS = {
    "temperature":    0.72,
    "top_p":          0.88,
    "top_k":          45,
    "repeat_penalty": 1.15,
    "num_predict":    500,
    "stop":           ["\n\nSeller", "\n\nInsydz", "Seller asks:", "Mode:", "Focus:"]
}

OLLAMA_OFFLINE_MSG = (
    "⚠️ **AI Advisor is temporarily offline.**\n\n"
    "The local AI engine (Ollama) isn't reachable right now.\n\n"
    "**To fix:**\n"
    "1. Make sure Ollama is running (`ollama serve`)\n"
    "2. Confirm the model is downloaded (`ollama pull llama3.2:3b`)\n"
    "3. Refresh and try again."
)

def call_ollama(prompt: str, stream: bool = False):
    return requests.post(
        f"{OLLAMA_API_URL}/api/generate",
        json={"model": MODEL_NAME, "prompt": prompt, "stream": stream, "options": OLLAMA_PARAMS},
        stream=stream,
        timeout=120
    )

def stream_ollama(prompt: str):
    try:
        resp = call_ollama(prompt, stream=True)
        resp.raise_for_status()
        for line in resp.iter_lines():
            if not line:
                continue
            try:
                chunk = json.loads(line)
                token = chunk.get("response", "")
                yield token
                if chunk.get("done"):
                    break
            except Exception:
                continue
    except requests.exceptions.ConnectionError:
        yield OLLAMA_OFFLINE_MSG
    except requests.exceptions.Timeout:
        yield "⚠️ Response timed out. Try a shorter or more specific question."
    except Exception as e:
        logger.error(f"Ollama streaming error: {e}")
        yield f"⚠️ Something went wrong with the AI engine: {str(e)}"


# ──────────────────────────────────────────────────────────────────────
# EXECUTE SQL SAFELY
# Returns (rows, error_message)
# ──────────────────────────────────────────────────────────────────────

def safe_execute(db: Session, sql: str, label: str = "query") -> Tuple[List[Dict], Optional[str]]:
    try:
        rows = db.execute(text(sql)).all()
        return [serialize_row(r) for r in rows], None
    except Exception as e:
        logger.error(f"DB error ({label}): {e}\nSQL: {sql[:300]}")
        return [], str(e)


# ──────────────────────────────────────────────────────────────────────
# MAIN ENDPOINT  —  /ai/query
# ──────────────────────────────────────────────────────────────────────

@router.post("/ai/query")
def ask_ai(query: AIQuery, db: Session = Depends(get_db)):

    # ── Validate ──
    raw_source = safe_str(query.source).lower()
    if raw_source not in ("amazon", "flipkart"):
        raise HTTPException(400, f"Invalid source '{query.source}'. Use 'amazon' or 'flipkart'.")
    source = raw_source

    question = safe_str(query.question)
    if not question:
        raise HTTPException(422, "Question cannot be empty.")

    filters        = query.filters or {}
    seller_profile = query.seller_profile or {}
    session_id     = safe_str(query.session_id) or hashlib.md5(
        f"{question}{time.time()}".encode()
    ).hexdigest()[:12]

    # ── Load memory ──
    history         = load_history(session_id)
    session_context = load_context(session_id)

    # ── Detect everything ──
    intents   = detect_intent(question)
    tone      = detect_tone(question, history)
    mode      = detect_conversation_mode(question, history)
    extracted = extract_product_from_question(question, history)

    # ── Update session context ──
    if extracted.get("product"):
        session_context["product_of_interest"] = extracted["product"]
    if extracted.get("category"):
        session_context["category_of_interest"] = extracted["category"]
    if extracted.get("price_target"):
        session_context["price_target"] = extracted["price_target"]
    if seller_profile.get("name"):
        session_context["seller_name"] = safe_str(seller_profile["name"])
    save_context(session_id, session_context)

    # ── Cache check (skip product/viability queries) ──
    is_product_query = bool(extracted.get("product")) or mode == "viability"
    cache_key        = f"ai_v4:{source}:{json.dumps(filters, sort_keys=True, default=str)}:{question}"

    if not query.stream and not is_product_query:
        cached = _redis_get(cache_key)
        if cached:
            raw = cached.decode() if isinstance(cached, bytes) else cached
            try:
                result = json.loads(raw)
                result["cached"] = True
                result["session_id"] = session_id
                return result
            except Exception:
                pass  # Cache miss — continue normally

    # ── Build SQL ──
    limit          = min(safe_int(query.limit, 100), 120)
    extra_category = (
        safe_str(extracted.get("category")) or
        safe_str(session_context.get("category_of_interest"))
    )
    where_clause       = build_where_clause(filters, source, extra_category)
    agg_sql, platform  = build_smart_sql(source, where_clause, intents, limit)

    # ── Execute queries ──
    agg_data,     agg_err     = safe_execute(db, agg_sql,  "aggregated")
    product_data, product_err = [], None

    if extracted.get("product"):
        psql = build_product_sql(source, extracted["product"], 20)
        product_data, product_err = safe_execute(db, psql, "product")

    # Log DB errors but don't fail the request
    if agg_err:
        logger.warning(f"Agg query failed (continuing): {agg_err}")
    if product_err:
        logger.warning(f"Product query failed (continuing): {product_err}")

    # ── Market score ──
    score_data   = product_data or agg_data
    market_score = (
        compute_market_score(score_data, extracted.get("price_target"))
        if mode in ("viability", "decision")
        else None
    )

    # ── Proactive insight ──
    proactive = generate_proactive_insight(agg_data or product_data, intents)

    # ── Follow-up suggestions ──
    followups = generate_followup_questions(mode, intents, extracted.get("product"), agg_data)

    # ── Build prompt ──
    prompt = build_master_prompt(
        question=question,
        history=history,
        agg_data=agg_data,
        product_data=product_data,
        platform=platform,
        intents=intents,
        tone=tone,
        filters=filters,
        seller_profile=seller_profile,
        proactive=proactive,
        mode=mode,
        extracted=extracted,
        market_score=market_score,
        session_context=session_context,
    )

    # ═══════════════════════════════════
    # STREAMING MODE
    # ═══════════════════════════════════
    if query.stream:
        def event_stream():
            full = ""
            for token in stream_ollama(prompt):
                full += token
                yield f"data: {json.dumps({'token': token})}\n\n"

            clean = post_process(full)
            if clean:
                append_turn(session_id, question, clean)

            meta = {
                "done":                  True,
                "session_id":            session_id,
                "intents":               intents,
                "mode":                  mode,
                "followup_questions":    followups,
                "market_score":          market_score,
                "had_proactive_insight": bool(proactive),
                "extracted_product":     extracted.get("product"),
                "data_rows":             len(agg_data),
                "product_rows":          len(product_data),
            }
            yield f"data: {json.dumps(meta, default=str)}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    # ═══════════════════════════════════
    # STANDARD MODE
    # ═══════════════════════════════════
    answer = ""
    try:
        resp = call_ollama(prompt, stream=False)
        resp.raise_for_status()
        raw_answer = resp.json().get("response", "").strip()
        answer     = post_process(raw_answer)
    except requests.exceptions.Timeout:
        answer = "Took too long — try a more focused or shorter question."
    except requests.exceptions.ConnectionError:
        answer = OLLAMA_OFFLINE_MSG
    except Exception as e:
        logger.error(f"Ollama call error: {e}")
        answer = f"AI engine error: {str(e)}"

    if not answer:
        answer = "Couldn't generate a response. Try rephrasing your question."

    append_turn(session_id, question, answer)

    result = {
        "answer":                answer,
        "cached":                False,
        "session_id":            session_id,
        "platform":              platform,
        "intents":               intents,
        "mode":                  mode,
        "tone":                  {k: v for k, v in tone.items() if v},
        "followup_questions":    followups,
        "market_score":          market_score,
        "data_rows":             len(agg_data),
        "product_rows":          len(product_data),
        "had_proactive_insight": bool(proactive),
        "extracted_product":     extracted.get("product"),
        "db_warnings": {
            "agg_error":     agg_err,
            "product_error": product_err,
        } if (agg_err or product_err) else None,
    }

    # Cache only stable non-product queries
    if not is_product_query and not agg_err:
        _redis_setex(cache_key, HISTORY_TTL, json.dumps(result, default=str))

    return result


# ──────────────────────────────────────────────────────────────────────
# BONUS ENDPOINTS
# ──────────────────────────────────────────────────────────────────────

class ResetRequest(BaseModel):
    session_id: str

@router.post("/ai/reset")
def reset_session(req: ResetRequest):
    _redis_delete(_history_key(req.session_id))
    _redis_delete(_context_key(req.session_id))
    return {"status": "ok", "message": f"Session {req.session_id} cleared."}

@router.get("/ai/history/{session_id}")
def get_history_endpoint(session_id: str):
    return {
        "session_id": session_id,
        "messages":   [m.dict() for m in load_history(session_id)],
        "context":    load_context(session_id),
    }

@router.get("/ai/context/{session_id}")
def get_context(session_id: str):
    return {"session_id": session_id, "context": load_context(session_id)}

@router.get("/ai/health")
def health_check():
    """Check if Ollama is reachable."""
    try:
        resp = requests.get(f"{OLLAMA_API_URL}/api/tags", timeout=5)
        models = [m["name"] for m in resp.json().get("models", [])]
        return {"status": "ok", "ollama": "online", "models": models}
    except Exception as e:
        return {"status": "degraded", "ollama": "offline", "error": str(e)}


# @app.post("/ai/analyze-chart")
# def analyze_chart_data(request: AIChartAnalysis):
#     """
#     NLP-powered natural language chart analysis with Redis caching
#     """
    
#     chart_data = request.chartData
#     data_count = len(chart_data)
    
#     if data_count == 0:
#         return {"answer": "No data available for the selected filters."}
    
#     source_name = "Flipkart" if request.source == "flipkart" else "Amazon"
    
#     # Create cache key based on source, question, and data hash
#     # Using hash of chart_data to keep cache key manageable
#     data_hash = hashlib.md5(json.dumps(chart_data, sort_keys=True).encode()).hexdigest()
#     cache_key = f"chart:{request.source}:{data_hash}:{request.question}"
    
#     # Check cache first
#     cached_answer = r.get(cache_key)
#     if cached_answer:
#         print(f"✅ Cache hit for chart analysis")
#         return {"answer": cached_answer, "cached": True}
    
#     print(f"❌ Cache miss, generating new analysis")
    
#     # Detect chart type
#     first_item = chart_data[0] if chart_data else {}
#     chart_type = detect_chart_type(first_item, request.question)
    
#     print(f"📊 NLP Mode | Type: {chart_type} | Items: {data_count}")
#     print(f"   Question: {request.question}")
    
#     try:
#         # Generate natural language summary
#         answer = generate_nlp_summary(chart_data, chart_type, request.question, source_name)
#         print(f"✅ NLP summary generated")
        
#         # Cache the answer for 1 hour (3600 seconds)
#         r.setex(cache_key, 3600, answer)
#         print(f"💾 Cached answer with key: {cache_key[:50]}...")
    
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         answer = f"I couldn't analyze this data right now. {str(e)[:60]}"

#     return {"answer": answer, "cached": False}

def make_cache_key(chart_data, question, source):
    payload = {
        "chart_data": chart_data,
        "question": question,
        "source": source
    }
    raw = json.dumps(payload, sort_keys=True)
    return "ai:chart:" + hashlib.sha256(raw.encode()).hexdigest()


@router.post("/ai/analyze-chart")
def analyze_chart_data(request: AIChartAnalysis):

    chart_data = request.chartData or []

    if not chart_data:
        return {"answer": "No data available for the selected filters."}

    # ✅ Normalize source
    source_value = str(request.source).lower().strip()
    if source_value == "flipkart":
        source_name = "Flipkart"
    elif source_value == "amazon":
        source_name = "Amazon"
    else:
        source_name = "Marketplace"

    # ✅ Validate chart data structure
    if not isinstance(chart_data[0], dict):
        return {"answer": "Unsupported chart data format."}

    # 🔑 Cache key
    cache_key = make_cache_key(
        chart_data,
        request.question,
        source_name
    )

    # ⚡ Redis cache (SAFE)
    try:
        cached_answer = r.get(cache_key)
        if cached_answer:
            return {"answer": cached_answer}
    except Exception:
        # Redis must NEVER break prod traffic
        pass

    # ✅ Detect chart type
    chart_type = detect_chart_type(chart_data[0], request.question)

    try:
        answer = generate_nlp_summary(
            chart_data,
            chart_type,
            request.question,
            source_name
        )
    except Exception as e:
        print("❌ NLP Failure:", e)
        answer = generate_natural_fallback(
            chart_data,
            chart_type,
            source_name
        )

    # 💾 Write to Redis (best-effort)
    try:
        r.setex(cache_key, 300, answer)  # 5 min TTL
    except Exception:
        pass

    return {"answer": answer}



# def detect_chart_type(first_item: dict, question: str) -> str:
#     """Detect chart type from data structure"""
#     keys_lower = {k.lower() for k in first_item.keys()}
    
#     # Top products
#     if any(k in keys_lower for k in ['title', 'product_title', 'name']):
#         if any(k in keys_lower for k in ['price', 'avg_price', 'reviews', 'total_ratings']):
#             return "top_products"
    
#     # Daily sales
#     if 'daily_sales' in keys_lower:
#         return "daily_sales"
    
#     # Rating distribution
#     if 'rating' in keys_lower and 'count' in keys_lower:
#         if not any(k in keys_lower for k in ['title', 'product_title', 'asin']):
#             return "rating_distribution"
    
#     # Sentiment
#     if 'sentiment' in keys_lower and 'count' in keys_lower:
#         return "sentiment_distribution"
    
#     # Category distribution
#     if any(k in keys_lower for k in ['category', 'category_name']):
#         if 'count' in keys_lower:
#             if not any(k in keys_lower for k in ['title', 'product_title', 'price']):
#                 return "category_distribution"
    
#     return "generic"

def detect_chart_type(first_item: dict, question: str) -> str:
    keys = {k.lower() for k in first_item.keys()}

    # 🟢 Label-Value (bar / pie charts)
    if "label" in keys and "value" in keys:
        return "category_distribution"

    # 🟢 Top products
    if any(k in keys for k in ["title", "product_title", "name"]):
        return "top_products"

    # 🟢 Daily sales
    if "daily_sales" in keys or "sales" in keys:
        return "daily_sales"

    # 🟢 Rating distribution
    if "rating" in keys and "count" in keys:
        return "rating_distribution"

    # 🟢 Sentiment
    if "sentiment" in keys and "count" in keys:
        return "sentiment_distribution"

    # 🟢 Category distribution
    if any("category" in k for k in keys):
        return "category_distribution"

    return "generic"

def generate_nlp_summary(data: list, chart_type: str, question: str, source: str) -> str:
    """Generate natural language summary using NLP approach"""
    
    # Prepare structured data narrative
    if chart_type == "top_products":
        data_narrative = create_product_narrative(data, source)
        analysis_focus = "product recommendations and market insights"
        
    elif chart_type == "category_distribution":
        data_narrative = create_category_narrative(data, source)
        analysis_focus = "category trends and market distribution"
        
    elif chart_type == "rating_distribution":
        data_narrative = create_rating_narrative(data, source)
        analysis_focus = "quality assessment and customer satisfaction"
        
    elif chart_type == "sentiment_distribution":
        data_narrative = create_sentiment_narrative(data, source)
        analysis_focus = "customer sentiment and feedback patterns"
        
    elif chart_type == "daily_sales":
        data_narrative = create_sales_narrative(data, source)
        analysis_focus = "sales performance and top sellers"
        
    else:
        data_narrative = f"{len(data)} data points from {source}"
        analysis_focus = "general patterns"
    
    # Create conversational NLP prompt
    prompt = f"""You are having a conversation with someone exploring {source} data. They asked: "{question}"

Here's what you're looking at:
{data_narrative}

Your task: Respond naturally as if you're chatting with a friend who asked about this data. 

Guidelines:
- Write 2-3 short sentences (like you're texting)
- Be conversational: "Looking at this...", "What stands out is...", "I'd recommend..."
- Mention specific numbers/products to be helpful
- Sound enthusiastic about interesting findings
- NO bullet points, NO formal structure, just natural speech

Think about {analysis_focus} and respond conversationally:"""

    try:
        result = subprocess.run(
            ["ollama", "run", "llama3.2:3b"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=30
        )

        raw_output = (result.stdout or result.stderr or "").strip()
        
        # Clean AI output
        clean_output = (
            raw_output
            .replace("<|MODEL_RESPONSE|>", "")
            .replace("</s>", "")
            .replace("```", "")
            .replace("Answer:", "")
            .replace("Response:", "")
            .strip()
        )
        
        # Take first paragraph or first 2-3 sentences
        sentences = []
        for line in clean_output.split('\n'):
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('*'):
                # Split by sentence endings
                for sentence in line.replace('! ', '!|').replace('. ', '.|').replace('? ', '?|').split('|'):
                    s = sentence.strip()
                    if s and len(s) > 15:
                        sentences.append(s)
                    if len(sentences) >= 3:
                        break
            if len(sentences) >= 3:
                break
        
        if len(sentences) >= 2:
            # Join 2-3 sentences naturally
            response = ' '.join(sentences[:3])
            # Ensure it doesn't end abruptly
            if not response[-1] in '.!?':
                response += '.'
            return response
        
        # Fallback to natural language generation
        return generate_natural_fallback(data, chart_type, source)
    
    except subprocess.TimeoutExpired:
        print("   ⏱️ AI timeout, generating natural summary")
        return generate_natural_fallback(data, chart_type, source)
    
    except Exception as e:
        print(f"   ❌ AI error: {e}")
        return generate_natural_fallback(data, chart_type, source)


def create_product_narrative(data: list, source: str) -> str:
    """Create natural narrative for products"""
    narratives = [f"Looking at the top {len(data)} {source} products:\n"]
    
    for i, item in enumerate(data[:3], 1):
        name = (item.get('product_title') or item.get('title') or item.get('name', 'Unknown'))[:60]
        price = item.get('price') or item.get('avg_price') or item.get('product_price') or 0
        rating = item.get('rating') or item.get('avg_rating') or item.get('product_num_rating') or 0
        reviews = item.get('reviews') or item.get('product_num_ratings') or item.get('product_rating_count') or 0
        sales = item.get('daily_sales') or item.get('sales_volume') or ''
        
        if isinstance(price, str):
            price = float(price.replace('₹', '').replace(',', '').strip()) if price else 0
        
        narrative = f"#{i}: {name} costs ₹{float(price):,.0f}, rated {rating}★"
        if sales:
            narrative += f" (selling {sales})"
        narratives.append(narrative)
    
    # Add aggregate insights
    avg_price = sum(float(p.get('price', 0) or p.get('avg_price', 0) or 0) for p in data[:3]) / min(3, len(data))
    avg_rating = sum(float(p.get('rating', 0) or p.get('avg_rating', 0) or 0) for p in data[:3]) / min(3, len(data))
    
    narratives.append(f"\nPrice range: ₹{avg_price*0.5:,.0f}-₹{avg_price*1.8:,.0f}, average rating: {avg_rating:.1f}★")
    
    return "\n".join(narratives)


def create_category_narrative(data: list, source: str) -> str:
    """Create natural narrative for categories"""
    cat_field = get_category_field(data[0])
    val_field = get_value_field(data[0])
    
    if not cat_field or not val_field:
        return f"{len(data)} {source} categories"
    
    total = sum(item.get(val_field, 0) for item in data)
    sorted_data = sorted(data, key=lambda x: x.get(val_field, 0), reverse=True)[:5]
    
    narratives = [f"{source} has {total:,} products spread across {len(data)} categories.\n"]
    
    for i, item in enumerate(sorted_data, 1):
        cat = item.get(cat_field, 'Unknown')
        count = item.get(val_field, 0)
        pct = (count / total * 100) if total > 0 else 0
        narratives.append(f"#{i} {cat}: {count:,} products ({pct:.0f}% of total)")
    
    # Add insight about distribution
    top_3_share = sum(item.get(val_field, 0) for item in sorted_data[:3]) / total * 100 if total > 0 else 0
    narratives.append(f"\nThe top 3 categories represent {top_3_share:.0f}% of all products.")
    
    return "\n".join(narratives)


def create_rating_narrative(data: list, source: str) -> str:
    """Create natural narrative for ratings"""
    total = sum(item.get('count', 0) for item in data)
    total_points = sum(float(item.get('rating', 0)) * item.get('count', 0) for item in data)
    avg_rating = total_points / total if total > 0 else 0
    
    high_rated = sum(item.get('count', 0) for item in data if float(item.get('rating', 0)) >= 4.0)
    high_pct = (high_rated / total * 100) if total > 0 else 0
    
    low_rated = sum(item.get('count', 0) for item in data if float(item.get('rating', 0)) < 3.0)
    low_pct = (low_rated / total * 100) if total > 0 else 0
    
    narratives = [
        f"{source} rating analysis across {total:,} products:",
        f"Average rating: {avg_rating:.2f}★",
        f"High quality (4★+): {high_rated:,} products ({high_pct:.0f}%)",
        f"Needs improvement (<3★): {low_rated:,} products ({low_pct:.0f}%)"
    ]
    
    # Most common rating
    most_common = max(data, key=lambda x: x.get('count', 0))
    narratives.append(f"\nMost products are rated {most_common.get('rating')}★ ({most_common.get('count'):,} products)")
    
    return "\n".join(narratives)


def create_sentiment_narrative(data: list, source: str) -> str:
    """Create natural narrative for sentiment"""
    sentiment_map = {str(item.get('sentiment', '')).lower(): item.get('count', 0) for item in data}
    total = sum(sentiment_map.values())
    
    positive = sentiment_map.get('positive', 0)
    negative = sentiment_map.get('negative', 0)
    neutral = sentiment_map.get('neutral', 0)
    
    pos_pct = (positive / total * 100) if total > 0 else 0
    neg_pct = (negative / total * 100) if total > 0 else 0
    
    narratives = [
        f"Customer sentiment analysis for {total:,} {source} products:",
        f"😊 Positive: {positive:,} ({pos_pct:.0f}%)",
        f"😐 Neutral: {neutral:,} ({(neutral/total*100) if total > 0 else 0:.0f}%)",
        f"😞 Negative: {negative:,} ({neg_pct:.0f}%)"
    ]
    
    # Overall sentiment interpretation
    if pos_pct > 70:
        narratives.append(f"\nOverall vibe: Very positive! Customers are happy.")
    elif pos_pct > 50:
        narratives.append(f"\nOverall vibe: Mostly positive with some mixed feedback.")
    else:
        narratives.append(f"\nOverall vibe: Mixed reactions, worth investigating concerns.")
    
    return "\n".join(narratives)


def create_sales_narrative(data: list, source: str) -> str:
    """Create natural narrative for sales"""
    return create_product_narrative(data, source)


def generate_natural_fallback(data: list, chart_type: str, source: str) -> str:
    """Generate natural language fallback"""
    
    if chart_type == "top_products":
        top = data[0]
        name = (top.get('product_title') or top.get('title', 'the top product'))[:50]
        reviews = top.get('reviews') or top.get('product_num_ratings') or top.get('product_rating_count') or 0
        rating = top.get('rating') or top.get('avg_rating') or 0
        price = top.get('price') or top.get('avg_price') or 0
        
        if isinstance(price, str):
            price = float(price.replace('₹', '').replace(',', '').strip()) if price else 0
        
        return f"Looking at the top {len(data)} {source} products, {name} really stands out with a {rating}★ rating at ₹{float(price):,.0f}. The quality across this selection is solid, with most items hitting 4+ stars."
    
    elif chart_type == "category_distribution":
        cat_field = get_category_field(data[0])
        val_field = get_value_field(data[0])
        
        if cat_field and val_field:
            total = sum(item.get(val_field, 0) for item in data)
            top = max(data, key=lambda x: x.get(val_field, 0))
            top_name = top.get(cat_field, 'the leading category')
            top_pct = (top.get(val_field, 0) / total * 100) if total > 0 else 0
            
            return f"Across {total:,} {source} products in {len(data)} categories, {top_name} clearly dominates with {top_pct:.0f}% of the market. It's interesting to see how concentrated the product selection is in just a few key categories."
        else:
            return f"{source} has products spread across {len(data)} different categories. There's good variety here for shoppers."
    
    elif chart_type == "rating_distribution":
        total = sum(item.get('count', 0) for item in data)
        high = sum(item.get('count', 0) for item in data if float(item.get('rating', 0)) >= 4.0)
        pct = (high / total * 100) if total > 0 else 0
        
        total_points = sum(float(item.get('rating', 0)) * item.get('count', 0) for item in data)
        avg = total_points / total if total > 0 else 0
        
        return f"Looking at {total:,} {source} products, the quality is pretty impressive - {pct:.0f}% are rated 4 stars or higher with an average of {avg:.1f}★. That's a good sign that customers are generally satisfied with their purchases."
    
    elif chart_type == "sentiment_distribution":
        sentiment_map = {str(item.get('sentiment', '')).lower(): item.get('count', 0) for item in data}
        total = sum(sentiment_map.values())
        positive = sentiment_map.get('positive', 0)
        pos_pct = (positive / total * 100) if total > 0 else 0
        
        vibe = "really positive" if pos_pct > 70 else "mostly positive" if pos_pct > 50 else "mixed"
        return f"Customer feedback across {total:,} {source} products is {vibe} - {pos_pct:.0f}% positive sentiment. {'People seem happy with their purchases!' if pos_pct > 60 else 'There is room for improvement based on customer feedback.'}"
    
    return f"I analyzed {len(data)} {source} data points. The chart shows some interesting patterns worth exploring further!"


def get_category_field(item: dict) -> str:
    """Find category field name"""
    for key in item.keys():
        if 'category' in key.lower():
            return key
    return None


def get_value_field(item: dict) -> str:
    """Find value/count field name"""
    for key in item.keys():
        if key.lower() in ['count', 'value', 'products']:
            return key
    return None


def decimal_to_float(obj):
    """Convert Decimal to float"""
    from decimal import Decimal
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not JSON serializable")



# @app.get("/top")
# def get_top_items(
#     table: str = Query(..., description="Choose 'flipkart' or 'rapidapi_amazon_products'"),
#     n: int = Query(10, description="Number of top items to fetch"),
#     category: Optional[str] = Query(None, description="Filter by category"),
#     min_price: Optional[float] = Query(None, description="Minimum price"),
#     max_price: Optional[float] = Query(None, description="Maximum price"),
#     min_rating: Optional[float] = Query(None, description="Minimum rating"),
#     date_range: Optional[str] = Query(None, description="Date range filter"),
#     trending_only: Optional[bool] = Query(False, description="Show only trending products"),
#     sort_by: Optional[str] = Query("sales_desc", description="Sort option"),
#     db: Session = Depends(get_db),
# ):
#     table = table.lower()

#     # ----------------------------- #
#     # 🔹 Flipkart
#     # ----------------------------- #
#     if table == "flipkart":
#         # Build WHERE clause
#         where_conditions = ["title IS NOT NULL", "rating IS NOT NULL"]
#         params = {"n": n}
        
#         if category and category != "All Categories":
#             where_conditions.append("LOWER(category) = LOWER(:category)")
#             params["category"] = category
        
#         if min_price is not None:
#             where_conditions.append("price >= :min_price")
#             params["min_price"] = min_price
        
#         if max_price is not None:
#             where_conditions.append("price <= :max_price")
#             params["max_price"] = max_price
        
#         if min_rating is not None:
#             where_conditions.append("rating >= :min_rating")
#             params["min_rating"] = min_rating
        
#         # Build ORDER BY clause
#         order_by = "reviews DESC, rating DESC"
#         if sort_by == "sales_asc":
#             order_by = "reviews ASC"
#         elif sort_by == "profit_desc":
#             order_by = "price DESC"
#         elif sort_by == "profit_asc":
#             order_by = "price ASC"
#         elif sort_by == "rating_desc":
#             order_by = "rating DESC"
#         elif sort_by == "price_desc":
#             order_by = "price DESC"
#         elif sort_by == "price_asc":
#             order_by = "price ASC"
        
#         where_clause = " AND ".join(where_conditions)
        
#         query = text(f"""
#             SELECT 
#                 id,
#                 title,
#                 category,
#                 brand,
#                 price,
#                 rating,
#                 reviews,
#                 last_updated
#             FROM flipkart
#             WHERE {where_clause}
#             ORDER BY {order_by}
#             LIMIT :n
#         """)
        
#         result = db.execute(query, params).mappings().all()
#         data = [dict(r) for r in result]
        
#         return {"table": "flipkart", "count": len(data), "data": data}

#     # ----------------------------- #
#     # 🔹 RapidAPI Amazon Products
#     # ----------------------------- #
#     elif table == "rapidapi_amazon_products":
#         # Build WHERE clause
#         where_conditions = [
#             "product_title IS NOT NULL",
#             "product_title != ''",
#             "product_star_rating_numeric IS NOT NULL",
#             "product_price_numeric IS NOT NULL"
#         ]
#         params = {"n": n}
        
#         if category and category != "All Categories":
#             where_conditions.append("LOWER(category_name) = LOWER(:category)")
#             params["category"] = category
        
#         if min_price is not None:
#             where_conditions.append("product_price_numeric >= :min_price")
#             params["min_price"] = min_price
        
#         if max_price is not None:
#             where_conditions.append("product_price_numeric <= :max_price")
#             params["max_price"] = max_price
        
#         if min_rating is not None:
#             where_conditions.append("product_star_rating_numeric >= :min_rating")
#             params["min_rating"] = min_rating
        
#         # Build ORDER BY clause
#         order_by = "reviews DESC, rating DESC"
#         if sort_by == "sales_asc":
#             order_by = "reviews ASC"
#         elif sort_by == "rating_desc":
#             order_by = "rating DESC"
#         elif sort_by == "price_desc":
#             order_by = "price DESC"
#         elif sort_by == "price_asc":
#             order_by = "price ASC"
        
#         where_clause = " AND ".join(where_conditions)
        
#         query = text(f"""
#             SELECT 
#                 asin,
#                 product_title,
#                 category_name,
#                 product_url,
#                 product_photo,
#                 product_star_rating_numeric AS rating,
#                 product_num_ratings AS reviews,
#                 product_price_numeric AS price,
#                 avg_price,
#                 min_price,
#                 max_price,
#                 sales_volume
#             FROM rapidapi_amazon_products
#             WHERE {where_clause}
#             ORDER BY {order_by}
#             LIMIT :n
#         """)
        
#         result = db.execute(query, params).mappings().all()
#         rows = [dict(r) for r in result]
        
#         # Merge duplicates by ASIN
#         merged = {}
#         for row in rows:
#             key = row["asin"] or row["product_title"].strip()
#             if key in merged:
#                 m = merged[key]
#                 m["rating"] = (m["rating"] + row["rating"]) / 2 if row["rating"] else m["rating"]
#                 m["price"] = (m["price"] + row["price"]) / 2 if row["price"] else m["price"]
#                 m["reviews"] = (m["reviews"] or 0) + (row["reviews"] or 0)
#             else:
#                 merged[key] = row
        
#         top_items = list(merged.values())[:n]
        
#         return {
#             "table": "rapidapi_amazon_products",
#             "count": len(top_items),
#             "data": top_items
#         }

#     else:
#         return {
#             "error": "Invalid table. Use 'flipkart' or 'rapidapi_amazon_products'."
#         }

# @app.get("/top")
# def get_top_items(
#     table: str = Query(..., description="Choose 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'"),
#     n: int = Query(10, description="Number of top items to fetch"),
#     category: Optional[str] = Query(None, description="Filter by category"),
#     min_price: Optional[float] = Query(None, description="Minimum price"),
#     max_price: Optional[float] = Query(None, description="Maximum price"),
#     min_rating: Optional[float] = Query(None, description="Minimum rating"),
#     date_range: Optional[str] = Query(None, description="Date range filter"),
#     trending_only: Optional[bool] = Query(False, description="Show only trending products"),
#     sort_by: Optional[str] = Query("sales_desc", description="Sort option"),
#     db: Session = Depends(get_db),
# ):
#     table = table.lower()

#     # ----------------------------- #
#     # 🔹 RapidAPI Flipkart Products
#     # ----------------------------- #
#     if table == "rapidapi_flipkart_products":
#         # Build WHERE clause
#         where_conditions = [
#             "product_title IS NOT NULL",
#             "product_title != ''",
#             "product_star_rating IS NOT NULL",
#             "product_price IS NOT NULL"
#         ]
#         params = {"n": n}
        
#         if category and category != "All Categories":
#             where_conditions.append("LOWER(category_name) = LOWER(:category)")
#             params["category"] = category
        
#         if min_price is not None:
#             where_conditions.append("product_price >= :min_price")
#             params["min_price"] = min_price
        
#         if max_price is not None:
#             where_conditions.append("product_price <= :max_price")
#             params["max_price"] = max_price
        
#         if min_rating is not None:
#             where_conditions.append("product_star_rating >= :min_rating")
#             params["min_rating"] = min_rating
        
#         # Build ORDER BY clause
#         order_by = "product_review_count DESC, product_star_rating DESC"
#         if sort_by == "sales_asc":
#             order_by = "sales_volume ASC"
#         elif sort_by == "sales_desc":
#             order_by = "sales_volume DESC"
#         elif sort_by == "profit_desc":
#             order_by = "product_price DESC"
#         elif sort_by == "profit_asc":
#             order_by = "product_price ASC"
#         elif sort_by == "rating_desc":
#             order_by = "product_star_rating DESC"
#         elif sort_by == "price_desc":
#             order_by = "product_price DESC"
#         elif sort_by == "price_asc":
#             order_by = "product_price ASC"
        
#         where_clause = " AND ".join(where_conditions)
        
#         query = text(f"""
#             SELECT 
#                 id,
#                 pid,
#                 product_title,
#                 category_name,
#                 brand,
#                 product_url,
#                 product_photo,
#                 product_price,
#                 product_mrp,
#                 product_star_rating AS rating,
#                 product_rating_count,
#                 product_review_count AS reviews,
#                 sales_volume,
#                 estimated_sales,
#                 stock_status,
#                 avg_price,
#                 min_price,
#                 max_price,
#                 updated_at
#             FROM rapidapi_flipkart_products
#             WHERE {where_clause}
#             ORDER BY {order_by}
#             LIMIT :n
#         """)
        
#         result = db.execute(query, params).mappings().all()
#         rows = [dict(r) for r in result]
        
#         # Merge duplicates by PID (similar to ASIN logic)
#         merged = {}
#         for row in rows:
#             key = row["pid"] or row["product_title"].strip()
#             if key in merged:
#                 m = merged[key]
#                 m["rating"] = (m["rating"] + row["rating"]) / 2 if row["rating"] else m["rating"]
#                 m["product_price"] = (m["product_price"] + row["product_price"]) / 2 if row["product_price"] else m["product_price"]
#                 m["reviews"] = (m["reviews"] or 0) + (row["reviews"] or 0)
#             else:
#                 merged[key] = row
        
#         top_items = list(merged.values())[:n]
        
#         return {
#             "table": "rapidapi_flipkart_products",
#             "count": len(top_items),
#             "data": top_items
#         }

#     # ----------------------------- #
#     # 🔹 RapidAPI Amazon Products
#     # ----------------------------- #
#     elif table == "rapidapi_amazon_products":
#         # Build WHERE clause
#         where_conditions = [
#             "product_title IS NOT NULL",
#             "product_title != ''",
#             "product_star_rating_numeric IS NOT NULL",
#             "product_price_numeric IS NOT NULL"
#         ]
#         params = {"n": n}
        
#         if category and category != "All Categories":
#             where_conditions.append("LOWER(category_name) = LOWER(:category)")
#             params["category"] = category
        
#         if min_price is not None:
#             where_conditions.append("product_price_numeric >= :min_price")
#             params["min_price"] = min_price
        
#         if max_price is not None:
#             where_conditions.append("product_price_numeric <= :max_price")
#             params["max_price"] = max_price
        
#         if min_rating is not None:
#             where_conditions.append("product_star_rating_numeric >= :min_rating")
#             params["min_rating"] = min_rating
        
#         # Build ORDER BY clause
#         order_by = "reviews DESC, rating DESC"
#         if sort_by == "sales_asc":
#             order_by = "reviews ASC"
#         elif sort_by == "rating_desc":
#             order_by = "rating DESC"
#         elif sort_by == "price_desc":
#             order_by = "price DESC"
#         elif sort_by == "price_asc":
#             order_by = "price ASC"
        
#         where_clause = " AND ".join(where_conditions)
        
#         query = text(f"""
#             SELECT 
#                 asin,
#                 product_title,
#                 category_name,
#                 product_url,
#                 product_photo,
#                 product_star_rating_numeric AS rating,
#                 product_num_ratings AS reviews,
#                 product_price_numeric AS price,
#                 avg_price,
#                 min_price,
#                 max_price,
#                 sales_volume
#             FROM rapidapi_amazon_products
#             WHERE {where_clause}
#             ORDER BY {order_by}
#             LIMIT :n
#         """)
        
#         result = db.execute(query, params).mappings().all()
#         rows = [dict(r) for r in result]
        
#         # Merge duplicates by ASIN
#         merged = {}
#         for row in rows:
#             key = row["asin"] or row["product_title"].strip()
#             if key in merged:
#                 m = merged[key]
#                 m["rating"] = (m["rating"] + row["rating"]) / 2 if row["rating"] else m["rating"]
#                 m["price"] = (m["price"] + row["price"]) / 2 if row["price"] else m["price"]
#                 m["reviews"] = (m["reviews"] or 0) + (row["reviews"] or 0)
#             else:
#                 merged[key] = row
        
#         top_items = list(merged.values())[:n]
        
#         return {
#             "table": "rapidapi_amazon_products",
#             "count": len(top_items),
#             "data": top_items
#         }

#     else:
#         return {
#             "error": "Invalid table. Use 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'."
#         }

@router.get("/top")
def get_top_items(
    table: str = Query(..., description="Choose 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'"),
    n: int = Query(10, description="Number of top items to fetch"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    date_range: Optional[str] = Query(None, description="Date range filter"),
    trending_only: Optional[bool] = Query(False, description="Show only trending products"),
    sort_by: Optional[str] = Query("sales_desc", description="Sort option"),
    db: Session = Depends(get_db),
):
    table = table.lower()

    # ----------------------------- #
    # 🔹 RapidAPI Flipkart Products
    # ----------------------------- #
    if table == "rapidapi_flipkart_products":
        # Build WHERE clause
        where_conditions = [
            "product_title IS NOT NULL",
            "product_title != ''",
            "product_star_rating IS NOT NULL",
            "product_price IS NOT NULL"
        ]
        params = {"n": n}
        
        if category and category != "All Categories":
            where_conditions.append("LOWER(category_name) = LOWER(:category)")
            params["category"] = category
        
        if min_price is not None:
            where_conditions.append("product_price >= :min_price")
            params["min_price"] = min_price
        
        if max_price is not None:
            where_conditions.append("product_price <= :max_price")
            params["max_price"] = max_price
        
        if min_rating is not None:
            where_conditions.append("product_star_rating >= :min_rating")
            params["min_rating"] = min_rating
        
        # Build ORDER BY clause
        order_by = "product_review_count DESC, product_star_rating DESC"
        if sort_by == "sales_asc":
            order_by = "sales_volume ASC"
        elif sort_by == "sales_desc":
            order_by = "sales_volume DESC"
        elif sort_by == "profit_desc":
            order_by = "product_price DESC"
        elif sort_by == "profit_asc":
            order_by = "product_price ASC"
        elif sort_by == "rating_desc":
            order_by = "product_star_rating DESC"
        elif sort_by == "price_desc":
            order_by = "product_price DESC"
        elif sort_by == "price_asc":
            order_by = "product_price ASC"
        
        where_clause = " AND ".join(where_conditions)
        
        query = text(f"""
            SELECT 
                id,
                pid,
                product_title,
                category_name,
                brand,
                product_url,
                product_photo,
                product_price,
                product_mrp,
                product_star_rating AS rating,
                product_rating_count,
                product_review_count AS reviews,
                sales_volume,
                estimated_sales,
                stock_status,
                avg_price,
                min_price,
                max_price,
                updated_at
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
            ORDER BY {order_by}
            LIMIT :n
        """)
        
        result = db.execute(query, params).mappings().all()
        rows = [dict(r) for r in result]
        
        # Merge duplicates by PID (similar to ASIN logic)
        merged = {}
        for row in rows:
            key = row["pid"] or row["product_title"].strip()
            if key in merged:
                m = merged[key]
                m["rating"] = (m["rating"] + row["rating"]) / 2 if row["rating"] else m["rating"]
                m["product_price"] = (m["product_price"] + row["product_price"]) / 2 if row["product_price"] else m["product_price"]
                m["reviews"] = (m["reviews"] or 0) + (row["reviews"] or 0)
            else:
                merged[key] = row
        
        top_items = list(merged.values())[:n]
        
        return {
            "table": "rapidapi_flipkart_products",
            "count": len(top_items),
            "data": top_items
        }

    # ----------------------------- #
    # 🔹 RapidAPI Amazon Products
    # ----------------------------- #
    elif table == "rapidapi_amazon_products":
        # Build WHERE clause
        where_conditions = [
            "product_title IS NOT NULL",
            "product_title != ''",
            "product_star_rating_numeric IS NOT NULL",
            "product_price_numeric IS NOT NULL"
        ]
        params = {"n": n}
        
        if category and category != "All Categories":
            where_conditions.append("LOWER(category_name) = LOWER(:category)")
            params["category"] = category
        
        if min_price is not None:
            where_conditions.append("product_price_numeric >= :min_price")
            params["min_price"] = min_price
        
        if max_price is not None:
            where_conditions.append("product_price_numeric <= :max_price")
            params["max_price"] = max_price
        
        if min_rating is not None:
            where_conditions.append("product_star_rating_numeric >= :min_rating")
            params["min_rating"] = min_rating
        
        # Build ORDER BY clause
        order_by = "reviews DESC, rating DESC"
        if sort_by == "sales_asc":
            order_by = "reviews ASC"
        elif sort_by == "rating_desc":
            order_by = "rating DESC"
        elif sort_by == "price_desc":
            order_by = "price DESC"
        elif sort_by == "price_asc":
            order_by = "price ASC"
        
        where_clause = " AND ".join(where_conditions)
        
        query = text(f"""
            SELECT 
                asin,
                product_title,
                category_name,
                product_url,
                product_photo,
                product_star_rating_numeric AS rating,
                product_num_ratings AS reviews,
                product_price_numeric AS price,
                avg_price,
                min_price,
                max_price,
                sales_volume
            FROM rapidapi_amazon_products
            WHERE {where_clause}
            ORDER BY {order_by}
            LIMIT :n
        """)
        
        result = db.execute(query, params).mappings().all()
        rows = [dict(r) for r in result]
        
        # Merge duplicates by ASIN
        merged = {}
        for row in rows:
            key = row["asin"] or row["product_title"].strip()
            if key in merged:
                m = merged[key]
                m["rating"] = (m["rating"] + row["rating"]) / 2 if row["rating"] else m["rating"]
                m["price"] = (m["price"] + row["price"]) / 2 if row["price"] else m["price"]
                m["reviews"] = (m["reviews"] or 0) + (row["reviews"] or 0)
            else:
                merged[key] = row
        
        top_items = list(merged.values())[:n]
        
        return {
            "table": "rapidapi_amazon_products",
            "count": len(top_items),
            "data": top_items
        }

    else:
        return {
            "error": "Invalid table. Use 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'."
        }


@router.get("/forecast_all_products")
def forecast_all_products(n_forecast_days: int = Query(30, description="Days to forecast"),
                          db: Session = Depends(get_db)):
    forecast_list = crud.get_forecast_all_products(db, n_forecast_days)
    return forecast_list

# Replace your /notifications endpoint with this fixed version

# @app.get("/notifications")
# def get_notifications(
#     table: str = Query("flipkart", description="Choose 'flipkart' or 'amazon_reviews'"),
#     limit: int = Query(5, description="Number of recent notifications"),
#     db: Session = Depends(get_db),
# ):
#     table = table.lower()

#     try:
#         if table == "flipkart":
#             query = text(f"""
#                 SELECT id, title AS message, category, price
#                 FROM flipkart
#                 ORDER BY id DESC
#                 LIMIT {limit}
#             """)
#             rows = db.execute(query).fetchall()
#             data = [
#                 {
#                     "id": row.id,
#                     "message": f"New product added: {row.message[:50]}... (₹{row.price:.2f})",
#                     "time": "Just now",
#                 }
#                 for row in rows
#             ]
            
#         elif table == "amazon_reviews":
#             # ✅ FIXED: Use correct columns from rapidapi_amazon_products table
#             query = text(f"""
#                 SELECT 
#                     product_title, 
#                     sales_volume, 
#                     product_num_ratings,
#                     product_star_rating_numeric
#                 FROM rapidapi_amazon_products
#                 WHERE product_title IS NOT NULL
#                   AND sales_volume IS NOT NULL
#                 ORDER BY product_num_ratings DESC
#                 LIMIT {limit}
#             """)
#             rows = db.execute(query).fetchall()
            
#             data = [
#                 {
#                     "id": i + 1,
#                     "message": f"Trending: {row.product_title[:60]}... ({row.sales_volume} sales)",
#                     "time": f"{row.product_num_ratings} ratings · {row.product_star_rating_numeric}★",
#                 }
#                 for i, row in enumerate(rows)
#             ]
            
#         else:
#             return {"error": "Invalid table. Use 'flipkart' or 'amazon_reviews'."}

#         return {"table": table, "count": len(data), "data": data}
        
#     except Exception as e:
#         print(f"❌ Notification Error: {str(e)}")
#         return {
#             "table": table, 
#             "count": 0, 
#             "data": [],
#             "error": str(e)
#         }

# @app.get("/notifications")
# def get_notifications(
#     table: str = Query("rapidapi_flipkart_products", description="Choose 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'"),
#     limit: int = Query(5, description="Number of recent notifications"),
#     db: Session = Depends(get_db),
# ):
#     table = table.lower()

#     try:
#         if table == "flipkart":
#             query = text(f"""
#                 SELECT id, product_title AS message, category_name, product_price, sales_volume, product_rating_count
#                 FROM rapidapi_flipkart_products
#                 WHERE product_title IS NOT NULL
#                 ORDER BY product_rating_count DESC
#                 LIMIT {limit}
#             """)
#             rows = db.execute(query).fetchall()
#             data = [
#                 {
#                     "id": row.id,
#                     "message": f"Trending: {row.message[:60]}... ({row.sales_volume or 'N/A'} sales)",
#                     "time": f"{row.product_rating_count or 0} ratings · ₹{row.product_price:.2f}",
#                 }
#                 for row in rows
#             ]
            
#         elif table == "amazon":
#             query = text(f"""
#                 SELECT 
#                     product_title, 
#                     sales_volume, 
#                     product_num_ratings,
#                     product_star_rating_numeric
#                 FROM rapidapi_amazon_products
#                 WHERE product_title IS NOT NULL
#                   AND sales_volume IS NOT NULL
#                 ORDER BY product_num_ratings DESC
#                 LIMIT {limit}
#             """)
#             rows = db.execute(query).fetchall()
            
#             data = [
#                 {
#                     "id": i + 1,
#                     "message": f"Trending: {row.product_title[:60]}... ({row.sales_volume} sales)",
#                     "time": f"{row.product_num_ratings} ratings · {row.product_star_rating_numeric}★",
#                 }
#                 for i, row in enumerate(rows)
#             ]
            
#         else:
#             return {"error": "Invalid table. Use 'rapidapi_flipkart_products' or 'rapidapi_amazon_products'."}

#         return {"table": table, "count": len(data), "data": data}
        
#     except Exception as e:
#         print(f"❌ Notification Error: {str(e)}")
#         return {
#             "table": table, 
#             "count": 0, 
#             "data": [],
#             "error": str(e)
#         }

@router.get("/notifications")
def get_notifications(
    table: str = Query("flipkart", description="Choose 'flipkart', 'amazon', or 'both'"),
    limit: int = Query(10, description="Number of recent alerts"),
    db: Session = Depends(get_db),
):
    """
    Generate real-time competitor alerts based on:
    1. Price drops/increases (compared to avg_price)
    2. Review spikes (high rating counts)
    3. New products (recent created_at)
    4. Sales volume changes
    """
    table = table.lower()
    
    try:
        notifications = []
        
        # Handle "both" - fetch from both tables
        tables_to_query = []
        if table == "both":
            tables_to_query = ["flipkart", "amazon"]
        elif table in ["flipkart", "amazon"]:
            tables_to_query = [table]
        else:
            return {"error": "Invalid table. Use 'flipkart', 'amazon', or 'both'."}
        
        # Query each table
        for current_table in tables_to_query:
            
            if current_table == "flipkart":
                # Price Drop Alerts
                price_drop_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_price,
                        product_mrp,
                        avg_price,
                        product_star_rating,
                        product_rating_count,
                        sales_volume,
                        brand,
                        ROUND(((product_mrp - product_price) / product_mrp * 100), 1) as discount_percent
                    FROM rapidapi_flipkart_products
                    WHERE product_price IS NOT NULL 
                      AND product_mrp IS NOT NULL
                      AND product_price < product_mrp * 0.7
                    ORDER BY discount_percent DESC
                    LIMIT :limit
                """)
                price_drops = db.execute(price_drop_query, {"limit": limit // 4}).fetchall()
                
                for row in price_drops:
                    notifications.append({
                        "id": f"flipkart_price_drop_{row.id}",
                        "type": "price_drop",
                        "severity": "high" if row.discount_percent > 40 else "medium",
                        "platform": "Flipkart",
                        "message": f"🔥 {row.brand or 'Competitor'}: {row.product_title[:50]}... dropped to ₹{row.product_price:.0f}",
                        "time": f"{row.discount_percent}% OFF · Was ₹{row.product_mrp:.0f}",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "old_price": float(row.product_mrp),
                            "new_price": float(row.product_price),
                            "discount_percent": float(row.discount_percent),
                            "rating": float(row.product_star_rating) if row.product_star_rating else None,
                            "sales_volume": row.sales_volume
                        }
                    })
                
                # Review Spike Alerts
                review_spike_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_rating_count,
                        product_star_rating,
                        product_price,
                        sales_volume,
                        brand
                    FROM rapidapi_flipkart_products
                    WHERE product_rating_count > 500
                    ORDER BY product_rating_count DESC
                    LIMIT :limit
                """)
                review_spikes = db.execute(review_spike_query, {"limit": limit // 4}).fetchall()
                
                for row in review_spikes:
                    notifications.append({
                        "id": f"flipkart_review_spike_{row.id}",
                        "type": "review_spike",
                        "severity": "medium",
                        "platform": "Flipkart",
                        "message": f"⭐ {row.brand or 'Competitor'}: {row.product_title[:50]}... gaining reviews fast",
                        "time": f"{row.product_rating_count} ratings · {row.product_star_rating}★ · {row.sales_volume or 'N/A'}",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "rating_count": row.product_rating_count,
                            "rating": float(row.product_star_rating) if row.product_star_rating else None,
                            "price": float(row.product_price) if row.product_price else None,
                            "sales_volume": row.sales_volume
                        }
                    })
                
                # High Sales Volume Alerts
                sales_query = text("""
                    SELECT 
                        id,
                        product_title,
                        estimated_sales,
                        product_price,
                        product_star_rating,
                        sales_volume,
                        brand
                    FROM rapidapi_flipkart_products
                    WHERE estimated_sales IS NOT NULL
                    ORDER BY estimated_sales DESC
                    LIMIT :limit
                """)
                high_sales = db.execute(sales_query, {"limit": limit // 4}).fetchall()
                
                for row in high_sales:
                    notifications.append({
                        "id": f"flipkart_sales_spike_{row.id}",
                        "type": "sales_spike",
                        "severity": "high",
                        "platform": "Flipkart",
                        "message": f"📈 {row.brand or 'Competitor'}: {row.product_title[:50]}... selling fast!",
                        "time": f"{row.sales_volume} · ₹{row.product_price:.0f} · {row.product_star_rating}★",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "estimated_sales": float(row.estimated_sales),
                            "price": float(row.product_price) if row.product_price else None,
                            "rating": float(row.product_star_rating) if row.product_star_rating else None,
                            "sales_volume": row.sales_volume
                        }
                    })
                
                # New Products Alert
                new_products_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_price,
                        product_star_rating,
                        brand,
                        created_at
                    FROM rapidapi_flipkart_products
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                    ORDER BY created_at DESC
                    LIMIT :limit
                """)
                new_products = db.execute(new_products_query, {"limit": limit // 4}).fetchall()
                
                for row in new_products:
                    notifications.append({
                        "id": f"flipkart_new_product_{row.id}",
                        "type": "new_product",
                        "severity": "low",
                        "platform": "Flipkart",
                        "message": f"🆕 {row.brand or 'Competitor'}: New product - {row.product_title[:50]}...",
                        "time": f"Listed recently · ₹{row.product_price:.0f}",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "price": float(row.product_price) if row.product_price else None,
                            "rating": float(row.product_star_rating) if row.product_star_rating else None,
                            "created_at": row.created_at.isoformat() if row.created_at else None
                        }
                    })
                    
            elif current_table == "amazon":
                # Price Drop Alerts
                price_drop_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_price_numeric,
                        product_original_price_numeric,
                        product_star_rating_numeric,
                        product_num_ratings,
                        sales_volume,
                        ROUND(((product_original_price_numeric - product_price_numeric) / 
                               product_original_price_numeric * 100)::numeric, 1) as discount_percent
                    FROM rapidapi_amazon_products
                    WHERE product_price_numeric IS NOT NULL 
                      AND product_original_price_numeric IS NOT NULL
                      AND product_price_numeric < product_original_price_numeric * 0.7
                    ORDER BY discount_percent DESC
                    LIMIT :limit
                """)
                price_drops = db.execute(price_drop_query, {"limit": limit // 4}).fetchall()
                
                for row in price_drops:
                    notifications.append({
                        "id": f"amazon_price_drop_{row.id}",
                        "type": "price_drop",
                        "severity": "high" if row.discount_percent > 40 else "medium",
                        "platform": "Amazon",
                        "message": f"🔥 Competitor: {row.product_title[:50]}... dropped to ₹{row.product_price_numeric:.0f}",
                        "time": f"{row.discount_percent}% OFF · Was ₹{row.product_original_price_numeric:.0f}",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "old_price": float(row.product_original_price_numeric),
                            "new_price": float(row.product_price_numeric),
                            "discount_percent": float(row.discount_percent),
                            "rating": float(row.product_star_rating_numeric) if row.product_star_rating_numeric else None,
                            "sales_volume": row.sales_volume
                        }
                    })
                
                # Review Spike Alerts
                review_spike_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_num_ratings,
                        product_star_rating_numeric,
                        product_price_numeric,
                        sales_volume
                    FROM rapidapi_amazon_products
                    WHERE product_num_ratings > 500
                    ORDER BY product_num_ratings DESC
                    LIMIT :limit
                """)
                review_spikes = db.execute(review_spike_query, {"limit": limit // 4}).fetchall()
                
                for row in review_spikes:
                    notifications.append({
                        "id": f"amazon_review_spike_{row.id}",
                        "type": "review_spike",
                        "severity": "medium",
                        "platform": "Amazon",
                        "message": f"⭐ Competitor: {row.product_title[:50]}... has {row.product_num_ratings} ratings",
                        "time": f"{row.product_star_rating_numeric}★ · {row.sales_volume or 'N/A'}",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "rating_count": row.product_num_ratings,
                            "rating": float(row.product_star_rating_numeric) if row.product_star_rating_numeric else None,
                            "price": float(row.product_price_numeric) if row.product_price_numeric else None,
                            "sales_volume": row.sales_volume
                        }
                    })
                
                # High Sales Volume Alerts
                sales_query = text("""
                    SELECT 
                        id,
                        product_title,
                        sales_volume,
                        product_price_numeric,
                        product_star_rating_numeric,
                        avg_sales_volume
                    FROM rapidapi_amazon_products
                    WHERE sales_volume IS NOT NULL
                      AND sales_volume NOT LIKE '%50+%'
                    ORDER BY avg_sales_volume DESC NULLS LAST
                    LIMIT :limit
                """)
                high_sales = db.execute(sales_query, {"limit": limit // 4}).fetchall()
                
                for row in high_sales:
                    notifications.append({
                        "id": f"amazon_sales_spike_{row.id}",
                        "type": "sales_spike",
                        "severity": "high",
                        "platform": "Amazon",
                        "message": f"📈 Competitor: {row.product_title[:50]}... selling {row.sales_volume}",
                        "time": f"₹{row.product_price_numeric:.0f} · {row.product_star_rating_numeric}★",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "sales_volume": row.sales_volume,
                            "price": float(row.product_price_numeric) if row.product_price_numeric else None,
                            "rating": float(row.product_star_rating_numeric) if row.product_star_rating_numeric else None
                        }
                    })
                
                # New Products Alert
                new_products_query = text("""
                    SELECT 
                        id,
                        product_title,
                        product_price_numeric,
                        product_star_rating_numeric,
                        created_at
                    FROM rapidapi_amazon_products
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                    ORDER BY created_at DESC
                    LIMIT :limit
                """)
                new_products = db.execute(new_products_query, {"limit": limit // 4}).fetchall()
                
                for row in new_products:
                    notifications.append({
                        "id": f"amazon_new_product_{row.id}",
                        "type": "new_product",
                        "severity": "low",
                        "platform": "Amazon",
                        "message": f"🆕 New competitor product: {row.product_title[:50]}...",
                        "time": f"Listed recently · ₹{row.product_price_numeric:.0f}" if row.product_price_numeric is not None else "Listed recently",
                        "details": {
                            "product_id": row.id,
                            "product_title": row.product_title,
                            "price": float(row.product_price_numeric) if row.product_price_numeric else None,
                            "rating": float(row.product_star_rating_numeric) if row.product_star_rating_numeric else None,
                            "created_at": row.created_at.isoformat() if row.created_at else None
                        }
                    })
        
        # Sort by severity (high > medium > low)
        severity_order = {"high": 0, "medium": 1, "low": 2}
        notifications.sort(key=lambda x: severity_order.get(x["severity"], 3))
        
        return {
            "table": table,
            "count": len(notifications),
            "data": notifications[:limit]
        }
        
    except Exception as e:
        print(f"❌ Competitor Alert Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "table": table,
            "count": 0,
            "data": [],
            "error": str(e)
        }



# @app.get("/category/products/{category_name}")
# def get_category_products(
#     category_name: str,
#     source: str,  # must be 'amazon' or 'flipkart'
#     limit: Optional[int] = None,
#     offset: int = 0,
#     db: Session = Depends(get_db)
# ):
#     category_name = category_name.strip().lower()

#     # ✅ Flipkart Query (min_price and max_price are returned as NULL)
#     flipkart_query = """
#         SELECT 
#             title AS product_name,
#             ROUND(AVG(price), 2) AS avg_price,
#             NULL AS min_price,
#             NULL AS max_price,
#             SUM(reviews) AS total_reviews,
#             ROUND(AVG(rating), 2) AS avg_rating,
#             'Flipkart' AS source
#         FROM flipkart
#         WHERE LOWER(category) = LOWER(:category_name)
#           AND title IS NOT NULL
#           AND rating IS NOT NULL
#           AND reviews IS NOT NULL
#         GROUP BY title
#         ORDER BY total_reviews DESC
#         LIMIT :limit OFFSET :offset
#     """

#     # ✅ Amazon Query (uses your real min_price and max_price columns)
#     amazon_query = """
#         SELECT 
#             product_title AS product_name,
#             ROUND(AVG(product_price_numeric), 2) AS avg_price,
#             ROUND(AVG(min_price), 2) AS min_price,
#             ROUND(AVG(max_price), 2) AS max_price,
#             SUM(product_num_ratings) AS total_reviews,
#             ROUND(AVG(product_star_rating_numeric), 2) AS avg_rating,
#             'Amazon' AS source
#         FROM "rapidapi_amazon_products"
#         WHERE LOWER(category_name) = LOWER(:category_name)
#           AND product_title IS NOT NULL
#           AND min_price IS NOT NULL
#           AND max_price IS NOT NULL
#           AND product_star_rating_numeric IS NOT NULL
#           AND product_num_ratings IS NOT NULL
#         GROUP BY product_title
#         ORDER BY total_reviews DESC
#         LIMIT :limit OFFSET :offset
#     """

#     # ✅ Select Query based on Source
#     if source.lower() == "flipkart":
#         query = flipkart_query
#     elif source.lower() == "amazon":
#         query = amazon_query
#     else:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid source. Must be either 'amazon' or 'flipkart'."
#         )

#     # ✅ Execute Query
#     try:
#         rows = db.execute(
#             text(query),
#             {"category_name": category_name, "limit": limit, "offset": offset}
#         ).fetchall()
#     except Exception as e:
#         print(f"❌ SQL Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

#     products = [dict(row._mapping) for row in rows]

#     # ✅ Response
#     return {
#         "category": category_name,
#         "source": source,
#         "total_products": len(products),
#         "products": products
#     }

@router.get("/category/products/{category_name}")
def get_category_products(
    category_name: str,
    source: str,  # must be 'amazon' or 'flipkart'
    limit: Optional[int] = None,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    category_name = category_name.strip().lower()

    # ✅ Flipkart Query (using rapidapi_flipkart_products)
    flipkart_query = """
        SELECT 
            product_title AS product_name,
            ROUND(AVG(product_price), 2) AS avg_price,
            ROUND(AVG(min_price), 2) AS min_price,
            ROUND(AVG(max_price), 2) AS max_price,
            SUM(product_review_count) AS total_reviews,
            ROUND(AVG(product_star_rating), 2) AS avg_rating,
            'Flipkart' AS source
        FROM rapidapi_flipkart_products
        WHERE LOWER(category_name) = LOWER(:category_name)
          AND product_title IS NOT NULL
          AND product_star_rating IS NOT NULL
          AND product_review_count IS NOT NULL
        GROUP BY product_title
        ORDER BY total_reviews DESC
        LIMIT :limit OFFSET :offset
    """

    # ✅ Amazon Query (uses your real min_price and max_price columns)
    amazon_query = """
        SELECT 
            product_title AS product_name,
            ROUND(AVG(product_price_numeric)::numeric, 2) AS avg_price,
            ROUND(AVG(min_price)::numeric, 2) AS min_price,
            ROUND(AVG(max_price)::numeric, 2) AS max_price,
            SUM(product_num_ratings) AS total_reviews,
            ROUND(AVG(product_star_rating_numeric)::numeric, 2) AS avg_rating,
            'Amazon' AS source
        FROM rapidapi_amazon_products
        WHERE LOWER(category_name) = LOWER(:category_name)
          AND product_title IS NOT NULL
          AND min_price IS NOT NULL
          AND max_price IS NOT NULL
          AND product_star_rating_numeric IS NOT NULL
          AND product_num_ratings IS NOT NULL
        GROUP BY product_title
        ORDER BY total_reviews DESC
        LIMIT :limit OFFSET :offset
    """

    # ✅ Select Query based on Source
    if source.lower() == "flipkart":
        query = flipkart_query
    elif source.lower() == "amazon":
        query = amazon_query
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid source. Must be either 'amazon' or 'flipkart'."
        )

    # ✅ Execute Query
    try:
        rows = db.execute(
            text(query),
            {"category_name": category_name, "limit": limit, "offset": offset}
        ).fetchall()
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    products = [dict(row._mapping) for row in rows]

    # ✅ Response
    return {
        "category": category_name,
        "source": source,
        "total_products": len(products),
        "products": products
    }

@router.get("/rating/products/{rating}")
def get_rating_products(
    rating: float,
    source: str,  # must be 'amazon' or 'flipkart'
    limit: Optional[int] = None,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    # ✅ Flipkart Query (using rapidapi_flipkart_products)
    flipkart_query = """
        SELECT 
            product_title AS product_name,
            ROUND(AVG(product_price), 2) AS avg_price,
            ROUND(AVG(min_price), 2) AS min_price,
            ROUND(AVG(max_price), 2) AS max_price,
            SUM(product_review_count) AS total_reviews,
            ROUND(AVG(product_star_rating), 2) AS avg_rating,
            'Flipkart' AS source
        FROM rapidapi_flipkart_products
        WHERE product_star_rating = :rating
          AND product_title IS NOT NULL
        GROUP BY product_title
        ORDER BY total_reviews DESC
        LIMIT :limit OFFSET :offset
    """

    # ✅ Amazon Query
    amazon_query = """
        SELECT 
            product_title AS product_name,
            ROUND(AVG(product_price_numeric)::numeric, 2) AS avg_price,
            ROUND(AVG(min_price)::numeric, 2) AS min_price,
            ROUND(AVG(max_price)::numeric, 2) AS max_price,
            SUM(product_num_ratings) AS total_reviews,
            ROUND(AVG(product_star_rating_numeric)::numeric, 2) AS avg_rating,
            'Amazon' AS source
        FROM rapidapi_amazon_products
        WHERE product_star_rating_numeric = :rating
          AND product_title IS NOT NULL
        GROUP BY product_title
        ORDER BY total_reviews DESC
        LIMIT :limit OFFSET :offset
    """

    # ✅ Select Query based on Source
    if source.lower() == "flipkart":
        query = flipkart_query
    elif source.lower() == "amazon":
        query = amazon_query
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid source. Must be either 'amazon' or 'flipkart'."
        )

    # ✅ Execute Query
    try:
        rows = db.execute(
            text(query),
            {"rating": rating, "limit": limit, "offset": offset}
        ).fetchall()
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    products = [dict(row._mapping) for row in rows]

    # ✅ Response
    return {
        "rating": rating,
        "source": source,
        "total_products": len(products),
        "products": sanitize_data(products)
    }


# @app.get("/product/{product_name:path}")
# def get_product_details(product_name: str, db: Session = Depends(get_db)):

#     clean_name = product_name.strip().strip('"').strip("'").strip()

#     # -----------------------------------------------------------
#     # 🔍 1. Try Flipkart
#     # -----------------------------------------------------------
#     try:
#         flipkart_query = text("""
#             SELECT
#                 title AS product_name,
#                 image_url,
#                 ROUND(AVG(price), 2) AS avg_price,
#                 ROUND(AVG(rating), 2) AS avg_rating,
#                 SUM(reviews) AS total_reviews
#             FROM flipkart
#             WHERE LOWER(title) ILIKE LOWER(:product_name)
#             GROUP BY title, image_url
#             ORDER BY SUM(reviews) DESC
#             LIMIT 1
#         """)

#         result = db.execute(
#             flipkart_query,
#             {"product_name": f"%{clean_name}%"}
#         ).fetchone()

#         if result:
#             return {
#                 "product_name": result.product_name,
#                 "product_id": None,
#                 "image": result.image_url,   # 👈 Added image
#                 "avg_price": float(result.avg_price) if result.avg_price else None,
#                 "min_price": None,
#                 "max_price": None,
#                 "avg_rating": float(result.avg_rating) if result.avg_rating else None,
#                 "total_reviews": int(result.total_reviews) if result.total_reviews else None,
#                 "source": "flipkart"
#             }

#     except Exception as e:
#         print("Flipkart Query Error:", str(e))

#     # -----------------------------------------------------------
#     # 🔍 2. Try Amazon (rapidapi_amazon_products)
#     # -----------------------------------------------------------
#     try:
#         amazon_query = text("""
#             SELECT
#                 product_title AS product_name,
#                 asin AS product_id,
#                 product_photo,
#                 ROUND(AVG(product_star_rating_numeric), 2) AS avg_rating,
#                 SUM(product_num_ratings) AS total_reviews,
#                 ROUND(AVG(avg_price), 2) AS avg_price,
#                 ROUND(AVG(min_price), 2) AS min_price,
#                 ROUND(AVG(max_price), 2) AS max_price
#             FROM rapidapi_amazon_products
#             WHERE product_title ILIKE :product_name
#             GROUP BY product_title, asin, product_photo
#             ORDER BY SUM(product_num_ratings) DESC
#             LIMIT 1
#         """)

#         result = db.execute(
#             amazon_query,
#             {"product_name": f"%{clean_name}%"}
#         ).fetchone()

#         if result:
#             return {
#                 "product_name": result.product_name,
#                 "product_id": result.product_id,
#                 "image": result.product_photo,   # 👈 Added image
#                 "avg_price": float(result.avg_price) if result.avg_price else None,
#                 "min_price": float(result.min_price) if result.min_price else None,
#                 "max_price": float(result.max_price) if result.max_price else None,
#                 "avg_rating": float(result.avg_rating) if result.avg_rating else None,
#                 "total_reviews": int(result.total_reviews) if result.total_reviews else None,
#                 "source": "amazon"
#             }

#     except Exception as e:
#         print("Amazon Query Error:", str(e))

#     raise HTTPException(status_code=404, detail="Product not found")

@router.get("/product/{product_name:path}")
def get_product_details(product_name: str, db: Session = Depends(get_db)):

    clean_name = product_name.strip().strip('"').strip("'").strip()

    # -----------------------------------------------------------
    # 🔍 1. Try Flipkart (rapidapi_flipkart_products)
    # -----------------------------------------------------------
    try:
        flipkart_query = text("""
            SELECT
                product_title AS product_name,
                product_photo,
                ROUND(AVG(product_price), 2) AS avg_price,
                ROUND(AVG(min_price), 2) AS min_price,
                ROUND(AVG(max_price), 2) AS max_price,
                ROUND(AVG(product_star_rating), 2) AS avg_rating,
                SUM(product_review_count) AS total_reviews
            FROM rapidapi_flipkart_products
            WHERE LOWER(product_title) ILIKE LOWER(:product_name)
            GROUP BY product_title, product_photo
            ORDER BY SUM(product_review_count) DESC
            LIMIT 1
        """)

        result = db.execute(
            flipkart_query,
            {"product_name": f"%{clean_name}%"}
        ).fetchone()

        if result:
            return {
                "product_name": result.product_name,
                "product_id": None,
                "image": result.product_photo,
                "avg_price": float(result.avg_price) if result.avg_price else None,
                "min_price": float(result.min_price) if result.min_price else None,
                "max_price": float(result.max_price) if result.max_price else None,
                "avg_rating": float(result.avg_rating) if result.avg_rating else None,
                "total_reviews": int(result.total_reviews) if result.total_reviews else None,
                "source": "flipkart"
            }

    except Exception as e:
        print("Flipkart Query Error:", str(e))

    # -----------------------------------------------------------
    # 🔍 2. Try Amazon (rapidapi_amazon_products)
    # -----------------------------------------------------------
    try:
        amazon_query = text("""
            SELECT
                product_title AS product_name,
                asin AS product_id,
                product_photo,
                ROUND(AVG(product_star_rating_numeric)::numeric, 2) AS avg_rating,
                SUM(product_num_ratings) AS total_reviews,
                ROUND(AVG(avg_price)::numeric, 2) AS avg_price,
                ROUND(AVG(min_price)::numeric, 2) AS min_price,
                ROUND(AVG(max_price)::numeric, 2) AS max_price
            FROM rapidapi_amazon_products
            WHERE product_title ILIKE :product_name
            GROUP BY product_title, asin, product_photo
            ORDER BY SUM(product_num_ratings) DESC
            LIMIT 1
        """)

        result = db.execute(
            amazon_query,
            {"product_name": f"%{clean_name}%"}
        ).fetchone()

        if result:
            return {
                "product_name": result.product_name,
                "product_id": result.product_id,
                "image": result.product_photo,
                "avg_price": float(result.avg_price) if result.avg_price else None,
                "min_price": float(result.min_price) if result.min_price else None,
                "max_price": float(result.max_price) if result.max_price else None,
                "avg_rating": float(result.avg_rating) if result.avg_rating else None,
                "total_reviews": int(result.total_reviews) if result.total_reviews else None,
                "source": "amazon"
            }

    except Exception as e:
        print("Amazon Query Error:", str(e))

    raise HTTPException(status_code=404, detail="Product not found")



@router.get("/categories")
def get_categories(table: str = Query("flipkart"), db: Session = Depends(get_db)):
    """
    Return a list of distinct categories for a given table
    """
    table = table.lower()
    if table == "flipkart":
        return crud.get_flipkart_categories(db)  # Should return list of dicts with 'category' key
    elif table == "amazon":
        return crud.get_amazon_categories(db)
    else:
        return {"error": "Invalid table"}
    


# @app.get("/flipkart/categories")
# def get_flipkart_categories_distribution(
#     category: Optional[str] = Query(None),
#     min_price: Optional[float] = Query(None),
#     max_price: Optional[float] = Query(None),
#     min_rating: Optional[float] = Query(None),
#     db: Session = Depends(get_db)
# ):
#     # Build WHERE conditions
#     where_conditions = ["category IS NOT NULL"]
#     params = {}
    
#     if category and category != "All Categories":
#         where_conditions.append("LOWER(category) = LOWER(:category)")
#         params["category"] = category
    
#     if min_price is not None:
#         where_conditions.append("price >= :min_price")
#         params["min_price"] = min_price
    
#     if max_price is not None:
#         where_conditions.append("price <= :max_price")
#         params["max_price"] = max_price
    
#     if min_rating is not None:
#         where_conditions.append("rating >= :min_rating")
#         params["min_rating"] = min_rating
    
#     where_clause = " AND ".join(where_conditions)
    
#     query = text(f"""
#         SELECT 
#             category,
#             COUNT(*) as count
#         FROM flipkart
#         WHERE {where_clause}
#         GROUP BY category
#         ORDER BY count DESC
#     """)
    
#     rows = db.execute(query, params).fetchall()
#     categories = [{"category": row.category, "count": row.count} for row in rows]
   
#     return categories
 
@router.get("/flipkart/categories")
def get_flipkart_categories_distribution(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # Build WHERE conditions
    where_conditions = ["category_name IS NOT NULL"]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    query = text(f"""
        SELECT 
            category_name,
            COUNT(*) as count
        FROM rapidapi_flipkart_products
        WHERE {where_clause}
        GROUP BY category_name
        ORDER BY count DESC
    """)
    
    rows = db.execute(query, params).fetchall()
    categories = [{"category": row.category_name, "count": row.count} for row in rows]
    
    return categories


 
@router.get("/api/products/{asin}")
def get_product_detail(asin: str, db: Session = Depends(get_db)):
    """
    Get complete details of a single product
    Cost: FREE (reads from database)
    """
   
    product = db.query(models.IndianProduct).filter(
        models.IndianProduct.asin == asin
    ).first()
   
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
   
    return {
        "asin": product.asin,
        "title": product.title,
        "brand": product.brand,
        "manufacturer": product.manufacturer,
        "description": product.description,
        "key_features": product.key_features,
        "images": product.image_urls,
        "url": product.url,
       
        "pricing": {
            "current_price": product.price,
            "mrp": product.mrp,
            "discount": f"{product.discount_percentage}%" if product.discount_percentage else None,
            "currency": "INR"
        },
       
        "sales_data": {
            "daily_sales_low": product.sales_estimate_low,
            "daily_sales_high": product.sales_estimate_high,
            "daily_revenue_low": product.revenue_estimate_low,
            "daily_revenue_high": product.revenue_estimate_high,
            "monthly_sales_estimate": f"{product.sales_estimate_low * 30:,} - {product.sales_estimate_high * 30:,}" if product.sales_estimate_high else None,
            "monthly_revenue_estimate": f"â‚¹{product.revenue_estimate_low * 30:,.0f} - â‚¹{product.revenue_estimate_high * 30:,.0f}" if product.revenue_estimate_high else None
        },
       
        "ratings": {
            "rating": product.rating,
            "total_ratings": product.number_of_ratings
        },
       
        "category": {
            "main": product.main_category,
            "full_path": product.category,
            "bsr": product.bsr
        },
       
        "specifications": {
            "model_number": product.model_number,
            "color": product.color,
            "size": product.size,
            "weight": product.weight,
            "dimensions": product.dimensions
        },
       
        "seller_info": {
            "number_of_sellers": product.number_of_sellers,
            "is_prime": product.is_prime,
            "is_fba": product.is_amazon_fulfilled,
            "availability": product.availability
        },
       
        "deals": {
            "has_active_deal": product.has_deal,
            "deal_type": product.deal_type,
            "promo_codes": product.promo_codes
        },
       
        "amazon_fees": {
            "referral_fee": product.referral_fee,
            "fba_fee": product.fba_fee,
            "total_fees": (product.referral_fee or 0) + (product.fba_fee or 0)
        },
       
        "timestamps": {
            "added_to_db": product.created_at,
            "last_updated": product.updated_at,
            "last_scraped": product.last_scraped_at
        }
    }
 
 
@router.get("/api/products")
def get_all_products(
    limit: int = 50,
    offset: int = 0,
    min_sales: int = None,
    min_rating: float = None,
    brand: str = None,
    category: str = None,
    has_deal: bool = None,
    sort_by: str = "sales_high",
    db: Session = Depends(get_db)
):
    """
    Get all products with filters and sorting
    Cost: FREE
   
    sort_by options: sales_high, sales_low, rating, price, newest
    """
   
    query = db.query(models.IndianProduct)
   
    # Filters
    if min_sales:
        query = query.filter(models.IndianProduct.sales_estimate_low >= min_sales)
   
    if min_rating:
        query = query.filter(models.IndianProduct.rating >= min_rating)
   
    if brand:
        query = query.filter(models.IndianProduct.brand.ilike(f"%{brand}%"))
   
    if category:
        query = query.filter(models.IndianProduct.main_category.ilike(f"%{category}%"))
   
    if has_deal is not None:
        query = query.filter(models.IndianProduct.has_deal == has_deal)
   
    # Sorting
    if sort_by == "sales_high":
        query = query.order_by(models.IndianProduct.sales_estimate_high.desc())
    elif sort_by == "sales_low":
        query = query.order_by(models.IndianProduct.sales_estimate_low.desc())
    elif sort_by == "rating":
        query = query.order_by(models.IndianProduct.rating.desc())
    elif sort_by == "price":
        query = query.order_by(models.IndianProduct.price.desc())
    elif sort_by == "newest":
        query = query.order_by(models.IndianProduct.created_at.desc())
   
    total = query.count()
    products = query.offset(offset).limit(limit).all()
   
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "products": [
            {
                "asin": p.asin,
                "title": p.title,
                "brand": p.brand,
                "price": p.price,
                "rating": p.rating,
                "daily_sales": f"{p.sales_estimate_low} - {p.sales_estimate_high}" if p.sales_estimate_high else None,
                "daily_revenue": f"₹{p.revenue_estimate_low:,.0f} - ₹{p.revenue_estimate_high:,.0f}" if p.revenue_estimate_high else None,
                "category": p.main_category,
                "has_deal": p.has_deal,
                "image": p.image_urls[0] if p.image_urls else None,
                "url": p.url
            }
            for p in products
        ]
    }
 
 
@router.get("/api/top-sellers")
def get_top_selling_products(limit: int = 20, db: Session = Depends(get_db)):
    """
    Get top selling products with complete info
    Cost: FREE
    """
   
    products = db.query(models.IndianProduct).filter(
        models.IndianProduct.sales_estimate_high.isnot(None)
    ).order_by(
        models.IndianProduct.sales_estimate_high.desc()
    ).limit(limit).all()
   
    return {
        "top_sellers": [
            {
                "rank": idx + 1,
                "asin": p.asin,
                "title": p.title,
                "brand": p.brand,
                "category": p.main_category,
                "price": f"₹{p.price:,.2f}" if p.price else None,
                "rating": f"{p.rating} ({p.number_of_ratings:,} ratings)" if p.rating else None,
                "daily_sales": f"{p.sales_estimate_low:,} - {p.sales_estimate_high:,}",
                "monthly_sales_estimate": f"{p.sales_estimate_low * 30:,} - {p.sales_estimate_high * 30:,}",
                "daily_revenue": f"₹{p.revenue_estimate_low:,.0f} - ₹{p.revenue_estimate_high:,.0f}",
                "monthly_revenue_estimate": f"₹{p.revenue_estimate_low * 30:,.0f} - ₹{p.revenue_estimate_high * 30:,.0f}",
                "image": p.image_urls[0] if p.image_urls else None,
                "url": p.url
            }
            for idx, p in enumerate(products)
        ]
    }
 
 
@router.get("/api/stats")
def get_database_stats(db: Session = Depends(get_db)):
    """
    Get comprehensive statistics
    Cost: FREE
    """
   
    total = db.query(models.IndianProduct).count()
    with_sales = db.query(models.IndianProduct).filter(
        models.IndianProduct.sales_estimate_high.isnot(None)
    ).count()
   
    return {
        "total_products": total,
        "products_with_sales_data": with_sales,
        "last_updated": db.query(models.IndianProduct.updated_at).order_by(
            models.IndianProduct.updated_at.desc()
        ).first()[0] if total > 0 else None
    }
 
 


# @app.get("/lstm_forecast/flipkart/{product_name}")
# def forecast_flipkart(product_name: str):
#     query = text('SELECT last_updated, price FROM flipkart WHERE title ILIKE :title ORDER BY last_updated')
#     df = pd.read_sql_query(query, engine, params={"title": f"%{product_name}%"})

#     if df.empty:
#         return {"error": "No data found for this product"}

#     # Convert date column to datetime
#     df["last_updated"] = pd.to_datetime(df["last_updated"], errors="coerce")
#     last_date = df["last_updated"].max()

#     result = lstm_forecast(df["price"], last_date)
#     return result
def parse_sales_volume(value):
    """Parse sales volume strings like '10K+', '5M+' into float."""
    if value is None:
        return np.nan
    value = str(value).lower()
    try:
        if "k" in value:
            return float(value.replace("k", "").replace("+", "").strip()) * 1_000
        elif "m" in value:
            return float(value.replace("m", "").replace("+", "").strip()) * 1_000_000
        else:
            digits = ''.join(c for c in value if c.isdigit())
            return float(digits) if digits else np.nan
    except:
        return np.nan
 
def lstm_forecast(series, last_date, forecast_days=365):
    """Dummy LSTM forecast for demo purposes."""
    forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=forecast_days)
    last_value = series.iloc[-1] if not series.empty else 1000
    forecast_values = []
    for _ in range(forecast_days):
        last_value = max(0, last_value + random.randint(-50, 50))
        forecast_values.append(float(last_value))
    return {
        "forecast_dates": [str(d.date()) for d in forecast_dates],
        "forecast_sales": forecast_values
    }
 
def fetch_df(sql: str, params: dict) -> pd.DataFrame:
    """Execute SQLAlchemy query and return a pandas DataFrame."""
    with engine.connect() as conn:
        result = conn.execute(text(sql), params)
        rows = result.fetchall()
        df = pd.DataFrame(rows, columns=result.keys())
        return df
 
# ----- Amazon Endpoint -----
@router.get("/lstm_forecast/amazon/{product_name:path}")
def forecast_amazon(product_name: str):
    try:
        clean_product_name = unquote(product_name).strip().strip('"')
        print(f"🔍 Amazon search: {clean_product_name}")
 
        # Try by ASIN first
        df = fetch_df(
            """
            SELECT created_at, sales_volume
            FROM rapidapi_amazon_products
            WHERE asin = :product_name
            ORDER BY created_at
            """,
            {"product_name": clean_product_name}
        )
 
        # Try by product title if ASIN fails
        if df.empty:
            df = fetch_df(
                """
                SELECT created_at, sales_volume
                FROM rapidapi_amazon_products
                WHERE product_title ILIKE :product_name
                ORDER BY created_at
                """,
                {"product_name": f"%{clean_product_name}%"}
            )
 
        # If still empty, generate dummy data
        if df.empty:
            today = pd.Timestamp.today()
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=30),
                "sales_volume": [random.randint(500, 5000) for _ in range(30)]
            })
        else:
            df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
            df = df.dropna(subset=["sales_volume"])
            if df.empty:
                today = pd.Timestamp.today()
                df = pd.DataFrame({
                    "created_at": pd.date_range(end=today, periods=30),
                    "sales_volume": [random.randint(500, 5000) for _ in range(30)]
                })
 
        last_date = df["created_at"].max()
        forecast_result = lstm_forecast(df["sales_volume"], last_date)
 
        historical_sales = [
            {"created_at": str(row["created_at"].date()), "sales_volume": float(row["sales_volume"])}
            for row in df.tail(10).to_dict(orient="records")
        ]
 
        return {
            "product_name": clean_product_name,
            "last_date": str(last_date.date()),
            "historical_sales": historical_sales,
            "forecast": forecast_result
        }
 
    except Exception as e:
        print("❌ AMAZON ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
 
# ----- Flipkart Endpoint -----
@router.get("/lstm_forecast/flipkart/{product_name:path}")
def forecast_flipkart(product_name: str):
    try:
        clean_product_name = unquote(product_name).strip().strip('"')
        print(f"🔍 Flipkart search: {clean_product_name}")
 
        # Try by PID
        df = fetch_df(
            """
            SELECT created_at, sales_volume, estimated_sales
            FROM rapidapi_flipkart_products
            WHERE pid = :product_name
            ORDER BY created_at
            """,
            {"product_name": clean_product_name}
        )
 
        # Try by product title
        if df.empty:
            df = fetch_df(
                """
                SELECT created_at, sales_volume, estimated_sales
                FROM rapidapi_flipkart_products
                WHERE product_title ILIKE :product_name
                ORDER BY created_at
                """,
                {"product_name": f"%{clean_product_name}%"}
            )
 
        # If still empty, generate dummy data
        if df.empty:
            today = pd.Timestamp.today()
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=30),
                "sales_volume": [random.randint(500, 5000) for _ in range(30)]
            })
        else:
            df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
            # fallback to estimated_sales if needed
            if df["sales_volume"].isna().all() and "estimated_sales" in df.columns:
                df["sales_volume"] = df["estimated_sales"].apply(parse_sales_volume)
            df = df.dropna(subset=["sales_volume"])
            if df.empty:
                today = pd.Timestamp.today()
                df = pd.DataFrame({
                    "created_at": pd.date_range(end=today, periods=30),
                    "sales_volume": [random.randint(500, 5000) for _ in range(30)]
                })
 
        last_date = df["created_at"].max()
        forecast_result = lstm_forecast(df["sales_volume"], last_date)
 
        historical_sales = [
            {"created_at": str(row["created_at"].date()), "sales_volume": float(row["sales_volume"])}
            for row in df.tail(10).to_dict(orient="records")
        ]
 
        return {
            "product_name": clean_product_name,
            "last_date": str(last_date.date()),
            "historical_sales": historical_sales,
            "forecast": forecast_result
        }
 
    except Exception as e:
        print("❌ FLIPKART ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/rapidapi/top-sales")
def get_amazon_top_sales(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Amazon Top Sales with Caching."""
    params_dict = {"lim": limit, "cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"amazon_top_sales:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    where_conditions = [
        "sales_volume IS NOT NULL",
        "product_star_rating_numeric IS NOT NULL",
        "product_price_numeric IS NOT NULL",
        "product_num_ratings IS NOT NULL",
        "product_num_ratings > 0"
    ]
    params = {"limit": limit}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price_numeric >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price_numeric <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating_numeric >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
        WITH sales_data AS (
            SELECT 
                product_title, category_name, product_url, product_photo,
                product_price_numeric, product_star_rating_numeric, product_num_ratings,
                sales_volume, country,
                CASE 
                    WHEN sales_volume LIKE '%M+%' THEN (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000000) / 30
                    WHEN sales_volume LIKE '%K+%' THEN (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000) / 30
                    ELSE CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) / 30
                END as daily_sales
            FROM rapidapi_amazon_products
            WHERE {where_clause}
        )
        SELECT 
            product_title,
            STRING_AGG(DISTINCT category_name, ', ') as categories,
            MAX(product_url) as product_url,
            MAX(product_photo) as product_photo,
            ROUND(CAST(AVG(product_price_numeric) AS NUMERIC), 2) as avg_price,
            ROUND(CAST(AVG(product_star_rating_numeric) AS NUMERIC), 2) as avg_rating,
            SUM(product_num_ratings) as total_ratings,
            MAX(sales_volume) as sales_volume,
            MAX(country) as country,
            ROUND(CAST(SUM(daily_sales) AS NUMERIC), 0) as total_daily_sales,
            COUNT(*) as variant_count
        FROM sales_data
        WHERE daily_sales IS NOT NULL
        GROUP BY product_title
        ORDER BY total_daily_sales DESC NULLS LAST
        LIMIT :limit
        """)
        
        rows = db.execute(query, params).fetchall()
        products = []
        for row in rows:
            product = dict(row._mapping)
            product['daily_sales'] = float(product.pop('total_daily_sales')) if product.get('total_daily_sales') else 0
            product['category_name'] = product.pop('categories')
            product['price'] = float(product['avg_price']) if product.get('avg_price') else 0
            product['product_star_rating'] = float(product['avg_rating']) if product.get('avg_rating') else 0
            products.append(product)
        
        final_result = sanitize_data({"data": products, "count": len(products)})
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rapidapi/flipkart/top-sales")
def get_flipkart_top_sales_products(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Flipkart Top Sales with Caching."""
    params_dict = {"lim": limit, "cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"flipkart_top_sales:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    where_conditions = [
        "sales_volume IS NOT NULL",
        "product_star_rating IS NOT NULL",
        "product_price IS NOT NULL",
        "product_review_count IS NOT NULL",
        "product_review_count > 0"
    ]
    params = {"limit": limit}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
        WITH sales_data AS (
            SELECT 
                product_title, category_name, product_url, product_photo,
                product_price, product_mrp, product_star_rating, product_review_count,
                sales_volume, estimated_sales, brand,
                CASE 
                    WHEN sales_volume LIKE '%M+%' THEN (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000000) / 30
                    WHEN sales_volume LIKE '%K+%' THEN (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000) / 30
                    ELSE CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) / 30
                END as daily_sales
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
        )
        SELECT 
            product_title,
            STRING_AGG(DISTINCT category_name, ', ') as categories,
            MAX(product_url) as product_url,
            MAX(product_photo) as product_photo,
            MAX(brand) as brand,
            ROUND(CAST(AVG(product_price) AS NUMERIC), 2) as avg_price,
            ROUND(CAST(AVG(product_mrp) AS NUMERIC), 2) as avg_mrp,
            ROUND(CAST(AVG(product_star_rating) AS NUMERIC), 2) as avg_rating,
            SUM(product_review_count) as total_reviews,
            MAX(sales_volume) as sales_volume,
            MAX(estimated_sales) as estimated_sales,
            ROUND(CAST(SUM(daily_sales) AS NUMERIC), 0) as total_daily_sales,
            COUNT(*) as variant_count
        FROM sales_data
        WHERE daily_sales IS NOT NULL
        GROUP BY product_title
        ORDER BY total_daily_sales DESC NULLS LAST
        LIMIT :limit
        """)
        
        rows = db.execute(query, params).fetchall()
        products = []
        for row in rows:
            product = dict(row._mapping)
            product['daily_sales'] = float(product.pop('total_daily_sales')) if product.get('total_daily_sales') else 0
            product['category_name'] = product.pop('categories')
            product['price'] = float(product['avg_price']) if product.get('avg_price') else 0
            product['product_star_rating'] = float(product['avg_rating']) if product.get('avg_rating') else 0
            products.append(product)
        
        final_result = sanitize_data({"data": products, "count": len(products)})
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top")
def get_top_products(table: str, n: int = 10, db: Session = Depends(get_db)):
    try:
        query = text(f"""
            SELECT product_id, product_title, product_price_numeric, 
                   product_star_rating_numeric, product_num_ratings, category_name
            FROM {table}
            WHERE product_title IS NOT NULL 
              AND product_price_numeric IS NOT NULL 
              AND product_star_rating_numeric IS NOT NULL
            ORDER BY product_star_rating_numeric DESC
            LIMIT :n
        """)
        result = db.execute(query, {"n": n}).mappings().all()
        return {"data": [dict(row) for row in result]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 🔹 2. Category Distribution
# -----------------------------
@router.get("/rapidapi_amazon_products/categories")
def get_amazon_categories(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"amazon_categories:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions
    where_conditions = [
        "category_name IS NOT NULL",
        "product_star_rating_numeric IS NOT NULL",
        "product_title IS NOT NULL"
    ]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price_numeric >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price_numeric <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating_numeric >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT category_name, COUNT(*) as count
            FROM rapidapi_amazon_products
            WHERE {where_clause}
            GROUP BY category_name
            ORDER BY count DESC
        """)
        result = db.execute(query, params).mappings().all()
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rapidapi_amazon_products/ratings")
def get_amazon_ratings(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"amazon_ratings:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions
    where_conditions = [
        "product_star_rating_numeric IS NOT NULL",
        "product_star_rating_numeric > 0",
        "product_title IS NOT NULL",
        "product_num_ratings IS NOT NULL"
    ]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price_numeric >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price_numeric <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating_numeric >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT 
                CAST(product_star_rating_numeric AS FLOAT) AS rating,
                COUNT(*) AS count,
                SUM(product_num_ratings) AS total_user_ratings
            FROM rapidapi_amazon_products
            WHERE {where_clause}
            GROUP BY product_star_rating_numeric
            ORDER BY product_star_rating_numeric DESC
        """)
        result = db.execute(query, params).mappings().all()
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 🔹 4. Sentiment Simulation (Based on Rating)
# -----------------------------
@router.get("/rapidapi_amazon_products/sentiment")
def get_amazon_sentiment(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"amazon_sentiment_v2:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions
    where_conditions = ["product_star_rating_numeric IS NOT NULL"]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price_numeric >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price_numeric <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating_numeric >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT
                CASE
                    WHEN product_star_rating_numeric >= 4 THEN 'positive'
                    WHEN product_star_rating_numeric = 3 THEN 'neutral'
                    ELSE 'negative'
                END as sentiment,
                COUNT(*) as count
            FROM rapidapi_amazon_products
            WHERE {where_clause}
            GROUP BY sentiment
        """)
        result = db.execute(query, params).mappings().all()
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rapidapi/flipkart/top-sales")
def get_flipkart_top_sales_products(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"lim": limit, "cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"flipkart_top_sales:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions for the CTE
    where_conditions = [
        "sales_volume IS NOT NULL",
        "product_star_rating IS NOT NULL",
        "product_price IS NOT NULL",
        "product_review_count IS NOT NULL",
        "product_review_count > 0"
    ]
    params = {"limit": limit}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
        WITH sales_data AS (
            SELECT 
                product_title,
                category_name,
                product_url,
                product_photo,
                product_price,
                product_mrp,
                product_star_rating,
                product_review_count,
                sales_volume,
                estimated_sales,
                brand,
                CASE 
                    WHEN sales_volume LIKE '%M+%' THEN 
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000000) / 30
                    WHEN sales_volume LIKE '%K+%' THEN 
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000) / 30
                    ELSE 
                        CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) / 30
                END as daily_sales
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
        )
        SELECT 
            product_title,
            STRING_AGG(DISTINCT category_name, ', ') as categories,
            MAX(product_url) as product_url,
            MAX(product_photo) as product_photo,
            MAX(brand) as brand,
            ROUND(CAST(AVG(product_price) AS NUMERIC), 2) as avg_price,
            ROUND(CAST(AVG(product_mrp) AS NUMERIC), 2) as avg_mrp,
            ROUND(CAST(AVG(product_star_rating) AS NUMERIC), 2) as avg_rating,
            SUM(product_review_count) as total_reviews,
            MAX(sales_volume) as sales_volume,
            MAX(estimated_sales) as estimated_sales,
            ROUND(CAST(SUM(daily_sales) AS NUMERIC), 0) as total_daily_sales,
            COUNT(*) as variant_count
        FROM sales_data
        WHERE daily_sales IS NOT NULL
        GROUP BY product_title
        ORDER BY total_daily_sales DESC NULLS LAST
        LIMIT :limit
        """)
        
        rows = db.execute(query, params).fetchall()
        
        products = []
        for row in rows:
            product = dict(row._mapping)
            product['daily_sales'] = product.pop('total_daily_sales')
            product['category_name'] = product.pop('categories')
            product['product_price_display'] = f"₹{product['avg_price']:.2f}" if product['avg_price'] else None
            product['product_star_rating'] = product['avg_rating']
            
            if product['variant_count'] > 1:
                product['is_merged'] = True
                product['merged_info'] = f"{product['variant_count']} variants combined"
            else:
                product['is_merged'] = False
            
            products.append(product)
        
        final_result = {"data": products, "count": len(products)}
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Flipkart top sales products: {str(e)}")

@router.get("/rapidapi_flipkart_products/categories")
def get_flipkart_categories(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"flipkart_categories:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions
    where_conditions = [
        "category_name IS NOT NULL",
        "product_star_rating IS NOT NULL",
        "product_title IS NOT NULL"
    ]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT category_name, COUNT(*) as count
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
            GROUP BY category_name
            ORDER BY count DESC
        """)
        result = db.execute(query, params).mappings().all()
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rapidapi_flipkart_products/ratings")
def get_flipkart_ratings(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"flipkart_ratings:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    # Build WHERE conditions
    where_conditions = [
        "product_star_rating IS NOT NULL",
        "product_star_rating > 0",
        "product_title IS NOT NULL",
        "product_review_count IS NOT NULL"
    ]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT 
                CAST(product_star_rating AS FLOAT) AS rating,
                COUNT(*) AS count,
                SUM(product_review_count) AS total_user_reviews
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
            GROUP BY product_star_rating
            ORDER BY product_star_rating DESC
        """)
        result = db.execute(query, params).mappings().all()
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @app.get("/rapidapi_flipkart_products/sentiment")
# def get_flipkart_sentiment(
#     category: Optional[str] = Query(None),
#     min_price: Optional[float] = Query(None),
#     max_price: Optional[float] = Query(None),
#     min_rating: Optional[float] = Query(None),
#     db: Session = Depends(get_db)
# ):
#     # Build WHERE conditions
#     where_conditions = ["product_star_rating IS NOT NULL"]
#     params = {}
    
#     if category and category != "All Categories":
#         where_conditions.append("LOWER(category_name) = LOWER(:category)")
#         params["category"] = category
    
#     if min_price is not None:
#         where_conditions.append("product_price >= :min_price")
#         params["min_price"] = min_price
    
#     if max_price is not None:
#         where_conditions.append("product_price <= :max_price")
#         params["max_price"] = max_price
    
#     if min_rating is not None:
#         where_conditions.append("product_star_rating >= :min_rating")
#         params["min_rating"] = min_rating
    
#     where_clause = " AND ".join(where_conditions)
    
#     try:
#         query = text(f"""
#             SELECT
#                 CASE
#                     WHEN product_star_rating >= 4 THEN 'positive'
#                     WHEN product_star_rating = 3 THEN 'neutral'
#                     ELSE 'negative'
#                 END as sentiment,
#                 COUNT(*) as count
#             FROM rapidapi_flipkart_products
#             WHERE {where_clause}
#             GROUP BY sentiment
#         """)
#         result = db.execute(query, params).mappings().all()
#         return [dict(row) for row in result]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/rapidapi_flipkart_products/sentiment")
def get_flipkart_sentiment(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    ✅ ADJUSTED: Realistic sentiment ranges based on actual data
    Positive: 4.0+, Neutral: 3.5-3.99, Negative: <3.5
    """
    # ── Cache ──
    params_dict = {"cat": category, "min_p": min_price, "max_p": max_price, "min_r": min_rating}
    cache_key = f"flipkart_sentiment:{json.dumps(params_dict, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    where_conditions = ["product_star_rating IS NOT NULL"]
    params = {}
    
    if category and category != "All Categories":
        where_conditions.append("LOWER(category_name) = LOWER(:category)")
        params["category"] = category
    
    if min_price is not None:
        where_conditions.append("product_price >= :min_price")
        params["min_price"] = min_price
    
    if max_price is not None:
        where_conditions.append("product_price <= :max_price")
        params["max_price"] = max_price
    
    if min_rating is not None:
        where_conditions.append("product_star_rating >= :min_rating")
        params["min_rating"] = min_rating
    
    where_clause = " AND ".join(where_conditions)
    
    try:
        query = text(f"""
            SELECT
                CASE
                    WHEN product_star_rating >= 4.0 THEN 'positive'
                    WHEN product_star_rating >= 3.5 THEN 'neutral'
                    ELSE 'negative'
                END as sentiment,
                COUNT(*) as count
            FROM rapidapi_flipkart_products
            WHERE {where_clause}
            GROUP BY sentiment
            ORDER BY sentiment DESC
        """)
        
        result = db.execute(query, params).mappings().all()
        
        # Debug logging
        print(f"📊 Flipkart Sentiment (Adjusted Ranges):")
        total = sum(row['count'] for row in result)
        for row in result:
            pct = (row['count'] / total * 100) if total > 0 else 0
            print(f"   {row['sentiment']}: {row['count']} ({pct:.1f}%)")
        
        final_result = [dict(row) for row in result]
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rapidapi_flipkart_products/top")
def get_flipkart_top_products(n: int = 10, db: Session = Depends(get_db)):
    cache_key = f"flipkart_top_products:{n}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    try:
        query = text(f"""
            SELECT pid, product_title, product_price, 
                   product_star_rating, product_review_count, category_name, brand
            FROM rapidapi_flipkart_products
            WHERE product_title IS NOT NULL 
              AND product_price IS NOT NULL 
              AND product_star_rating IS NOT NULL
            ORDER BY product_star_rating DESC, product_review_count DESC
            LIMIT :n
        """)
        result = db.execute(query, {"n": n}).mappings().all()
        final_result = {"data": [dict(row) for row in result]}
        final_result = sanitize_data(final_result)
        r.setex(cache_key, 1200, json.dumps(final_result))
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   
# ============================================
# FIXED LOGIN ENDPOINT - Replace in Fastapi_main.py
# ============================================
 
# from passlib.context import CryptContext
# from pydantic import BaseModel, EmailStr
# from fastapi import HTTPException, Depends
# from sqlalchemy.orm import Session
 
# # Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)
 
# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)
 
# # ============================================
# # Pydantic Models
# # ============================================
 
# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str
 
# class PasswordReset(BaseModel):
#     email: EmailStr
#     new_password: str
 
# class LoginResponse(BaseModel):
#     success: bool
#     message: str
#     user: dict = None
 
# # ============================================
# # FIXED LOGIN ENDPOINT (without is_active check)
# # ============================================
 
# @app.post("/users/login", response_model=LoginResponse)
# def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
#     """
#     Authenticate user and return user data if successful
#     """
#     try:
#         # Find user by email
#         user = db.query(models.User).filter(
#             models.User.email == login_data.email
#         ).first()
       
#         # Check if user exists
#         if not user:
#             raise HTTPException(
#                 status_code=404,
#                 detail="No account found with this email. Please sign up first."
#             )
       
#         # Verify password
#         if not verify_password(login_data.password, user.password_hash):
#             raise HTTPException(
#                 status_code=401,
#                 detail="Incorrect password. Please try again or reset your password."
#             )
       
#         # Successful login
#         return {
#             "success": True,
#             "message": "Login successful",
#             "user": {
#                 "id": user.id,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "email": user.email,
#                 "business_name": user.business_name,
#                 "location": user.location,
#                 "business_interests": user.business_interests,
#                 "created_at": str(user.created_at)
#             }
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"âŒ Login error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Login failed: {str(e)}"
#         )
 
# # ============================================
# # FIXED SIGNUP ENDPOINT
# # ============================================
 
# @app.post("/users/signup")
# def signup_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     """
#     Create a new user account
#     """
#     try:
#         # Check if email already exists
#         existing_user = db.query(models.User).filter(
#             models.User.email == user_data.email
#         ).first()
       
#         if existing_user:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Email already registered. Please login instead."
#             )
       
#         # Hash the password
#         hashed_password = get_password_hash(user_data.password)
       
#         # Create new user (without is_active field)
#         new_user = models.User(
#             first_name=user_data.first_name,
#             last_name=user_data.last_name,
#             email=user_data.email,
#             password_hash=hashed_password,
#             business_name=user_data.business_name,
#             location=user_data.location,
#             business_interests=user_data.business_interests
#         )
       
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
       
#         return {
#             "id": new_user.id,
#             "first_name": new_user.first_name,
#             "last_name": new_user.last_name,
#             "email": new_user.email,
#             "business_name": new_user.business_name,
#             "location": new_user.location,
#             "business_interests": new_user.business_interests,
#             "created_at": new_user.created_at,
#             "message": "Account created successfully"
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         db.rollback()
#         print(f"âŒ Signup error: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
 
# # ============================================
# # PASSWORD RESET ENDPOINT
# # ============================================
 
# @app.post("/users/reset-password")
# def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
#     """
#     Reset user password
#     """
#     try:
#         # Find user by email
#         user = db.query(models.User).filter(
#             models.User.email == reset_data.email
#         ).first()
       
#         if not user:
#             raise HTTPException(
#                 status_code=404,
#                 detail="No account found with this email"
#             )
       
#         # Update password
#         user.password_hash = get_password_hash(reset_data.new_password)
       
#         db.commit()
#         return {
#             "success": True,
#             "message": "Password updated successfully"
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         db.rollback()
#         print(f"âŒ Password reset error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error updating password: {str(e)}"
#         )
 
# # ============================================
# # CHECK EMAIL ENDPOINT
# # ============================================
 
# @app.get("/users/check-email/{email}")
# def check_email_exists(email: str, db: Session = Depends(get_db)):
#     """
#     Check if an email is already registered
#     """
#     user = db.query(models.User).filter(
#         models.User.email == email
#     ).first()
   
#     return {
#         "exists": user is not None,
#         "email": email,
#         "message": "Email is registered" if user else "Email is available"
#     }
 
# # ============================================
# # GET USER PROFILE ENDPOINT
# # ============================================
 
# @app.get("/users/profile/{email}")
# def get_user_profile(email: str, db: Session = Depends(get_db)):
#     """
#     Get user profile by email
#     """
#     user = db.query(models.User).filter(
#         models.User.email == email
#     ).first()
   
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
   
#     return {
#         "id": user.id,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#         "email": user.email,
#         "business_name": user.business_name,
#         "location": user.location,
#         "business_interests": user.business_interests,
#         "created_at": str(user.created_at)
#     }
 
# from passlib.context import CryptContext
# from pydantic import BaseModel, EmailStr
# from fastapi import HTTPException, Depends, Response, Cookie
# from sqlalchemy.orm import Session
# from datetime import datetime, timedelta
# import secrets
# import hashlib
# import redis
# import json

# # Password hashing
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)

# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)

# # ============================================
# # Redis Session Management
# # ============================================

# # Reuse existing Redis client from your app configuration
# # Assumes you already have: redis_client = redis.Redis(...) defined earlier
# # If your Redis client has a different name, replace 'redis_client' with that name

# def create_session_token() -> str:
#     """Generate a secure session token"""
#     return secrets.token_urlsafe(32)

# def create_session(user_id: int, remember_me: bool = False) -> str:
#     """Create a new session in Redis and return the session token"""
#     session_token = create_session_token()
#     expires_in_seconds = 30 * 24 * 60 * 60 if remember_me else 24 * 60 * 60  # 30 days or 1 day
    
#     session_data = {
#         "user_id": user_id,
#         "created_at": datetime.now().isoformat(),
#         "expires_at": (datetime.now() + timedelta(seconds=expires_in_seconds)).isoformat()
#     }
    
#     # Store session in Redis with expiration
#     r.setex(
#         f"session:{session_token}",
#         expires_in_seconds,
#         json.dumps(session_data)
#     )
    
#     # Also maintain a user->sessions mapping for logout all devices
#     r.sadd(f"user_sessions:{user_id}", session_token)
#     r.expire(f"user_sessions:{user_id}", expires_in_seconds)
    
#     return session_token

# def validate_session(session_token: str) -> dict:
#     """Validate session token and return session data from Redis"""
#     if not session_token:
#         return None
    
#     # Retrieve session from Redis
#     session_json = r.get(f"session:{session_token}")
    
#     if not session_json:
#         return None
    
#     try:
#         session = json.loads(session_json)
        
#         # Check if session expired (Redis TTL should handle this, but double-check)
#         expires_at = datetime.fromisoformat(session["expires_at"])
#         if datetime.now() > expires_at:
#             delete_session(session_token)
#             return None
        
#         return session
#     except (json.JSONDecodeError, KeyError, ValueError):
#         return None

# def delete_session(session_token: str):
#     """Delete a session from Redis"""
#     # Get user_id before deleting to clean up user_sessions set
#     session_json = r.get(f"session:{session_token}")
#     if session_json:
#         try:
#             session = json.loads(session_json)
#             user_id = session.get("user_id")
#             if user_id:
#                 r.srem(f"user_sessions:{user_id}", session_token)
#         except (json.JSONDecodeError, KeyError):
#             pass
    
#     # Delete the session
#     r.delete(f"session:{session_token}")

# def delete_all_user_sessions(user_id: int):
#     """Delete all sessions for a specific user (logout from all devices)"""
#     # Get all session tokens for this user
#     session_tokens = r.smembers(f"user_sessions:{user_id}")
    
#     # Delete each session
#     for token in session_tokens:
#         r.delete(f"session:{token}")
    
#     # Delete the user sessions set
#     r.delete(f"user_sessions:{user_id}")

# def get_current_user(session_id: str = Cookie(None), db: Session = Depends(get_db)):
#     """Dependency to get current authenticated user"""
#     if not session_id:
#         raise HTTPException(status_code=401, detail="Not authenticated")
    
#     session = validate_session(session_id)
#     if not session:
#         raise HTTPException(status_code=401, detail="Invalid or expired session")
    
#     user = db.query(models.User).filter(models.User.id == session["user_id"]).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="User not found")
    
#     return user

# # ============================================
# # Pydantic Models
# # ============================================

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str
#     remember_me: bool = False

# class PasswordReset(BaseModel):
#     email: EmailStr
#     new_password: str

# class LoginResponse(BaseModel):
#     success: bool
#     message: str
#     user: dict = None

# # ============================================
# # SECURE LOGIN ENDPOINT (WITH REDIS SESSION)
# # ============================================

# @app.post("/users/login", response_model=LoginResponse)
# def login_user(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
#     """
#     Authenticate user and set secure session cookie (stored in Redis)
#     """
#     try:
#         print(f"🔍 Login attempt for: {login_data.email}")
        
#         # Find user by email
#         user = db.query(models.User).filter(
#             models.User.email == login_data.email
#         ).first()
       
#         # Check if user exists
#         if not user:
#             print(f"❌ User not found: {login_data.email}")
#             raise HTTPException(
#                 status_code=404,
#                 detail="No account found with this email. Please sign up first."
#             )
       
#         # Verify password
#         if not verify_password(login_data.password, user.password_hash):
#             print(f"❌ Invalid password for: {login_data.email}")
#             raise HTTPException(
#                 status_code=401,
#                 detail="Incorrect password. Please try again or reset your password."
#             )
        
#         # Check if AI usage should be reset (new month)
#         current_month = datetime.now().strftime("%Y-%m")
#         if user.ai_chat_month != current_month:
#             print(f"🔄 Resetting AI usage for new month: {current_month}")
#             user.ai_chat_used = 0
#             user.ai_chat_month = current_month
#             db.commit()
#             db.refresh(user)
        
#         # ✅ CREATE SESSION IN REDIS
#         session_token = create_session(user.id, login_data.remember_me)
        
#         # ✅ SET HTTP-ONLY COOKIE
#         max_age = 30 * 24 * 60 * 60 if login_data.remember_me else 24 * 60 * 60
#         response.set_cookie(
#             key="session_id",
#             value=session_token,
#             httponly=True,  # Prevents XSS attacks
#             secure=True,    # HTTPS only in production (set to True in production)
#             samesite="lax", # CSRF protection
#             max_age=max_age
#         )
        
#         print(f"📊 Database values for {user.email}:")
#         print(f"   - ID: {user.id}")
#         print(f"   - Subscription Tier: {user.subscription_tier}")
#         print(f"   - AI Chat Used: {user.ai_chat_used}")
       
#         # ✅ RETURN USER DATA
#         response_data = {
#             "success": True,
#             "message": "Login successful",
#             "user": {
#                 "id": user.id,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "email": user.email,
#                 "business_name": user.business_name,
#                 "location": user.location,
#                 "business_interests": user.business_interests,
#                 "subscription_tier": user.subscription_tier or 'free',
#                 "ai_chat_used": user.ai_chat_used or 0,
#                 "ai_chat_month": user.ai_chat_month or current_month,
#                 "created_at": str(user.created_at)
#             }
#         }
        
#         print(f"✅ Login successful for {user.email}")
#         print(f"✅ Session created in Redis: {session_token[:10]}...")
        
#         return response_data
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Login error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Login failed: {str(e)}"
#         )

# # ============================================
# # SECURE SIGNUP ENDPOINT (WITH REDIS SESSION)
# # ============================================

# @app.post("/users/signup")
# def signup_user(user_data: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
#     """
#     Create a new user account and set session cookie (stored in Redis)
#     """
#     try:
#         # Check if email already exists
#         existing_user = db.query(models.User).filter(
#             models.User.email == user_data.email
#         ).first()
       
#         if existing_user:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Email already registered. Please login instead."
#             )
       
#         # Hash the password
#         hashed_password = get_password_hash(user_data.password)
        
#         # Get current month for AI usage tracking
#         current_month = datetime.now().strftime("%Y-%m")
       
#         # ✅ CREATE NEW USER WITH SUBSCRIPTION FIELDS
#         new_user = models.User(
#             first_name=user_data.first_name,
#             last_name=user_data.last_name,
#             email=user_data.email,
#             password_hash=hashed_password,
#             business_name=user_data.business_name,
#             location=user_data.location,
#             business_interests=user_data.business_interests,
#             subscription_tier='free',
#             ai_chat_used=0,
#             ai_chat_month=current_month
#         )
       
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
        
#         # ✅ CREATE SESSION IN REDIS FOR NEW USER
#         session_token = create_session(new_user.id, remember_me=False)
        
#         # ✅ SET HTTP-ONLY COOKIE
#         response.set_cookie(
#             key="session_id",
#             value=session_token,
#             httponly=True,
#             secure=True,  # Set to True in production
#             samesite="lax",
#             max_age=24 * 60 * 60  # 24 hours
#         )
       
#         print(f"✅ New user created: {new_user.email}")
#         print(f"✅ Session created in Redis: {session_token[:10]}...")
        
#         # ✅ RETURN USER DATA WITH SUBSCRIPTION
#         return {
#             "id": new_user.id,
#             "first_name": new_user.first_name,
#             "last_name": new_user.last_name,
#             "email": new_user.email,
#             "business_name": new_user.business_name,
#             "location": new_user.location,
#             "business_interests": new_user.business_interests,
#             "subscription_tier": new_user.subscription_tier,
#             "ai_chat_used": new_user.ai_chat_used,
#             "ai_chat_month": new_user.ai_chat_month,
#             "created_at": new_user.created_at,
#             "message": "Account created successfully"
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         db.rollback()
#         print(f"❌ Signup error: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

# # ============================================
# # GET CURRENT USER (SESSION VERIFICATION)
# # ============================================

# @app.get("/api/auth/me")
# def get_me(current_user: models.User = Depends(get_current_user)):
#     """
#     Get current authenticated user from Redis session
#     """
#     current_month = datetime.now().strftime("%Y-%m")
    
#     return {
#         "id": current_user.id,
#         "first_name": current_user.first_name,
#         "last_name": current_user.last_name,
#         "email": current_user.email,
#         "business_name": current_user.business_name,
#         "location": current_user.location,
#         "business_interests": current_user.business_interests,
#         "subscription_tier": current_user.subscription_tier or 'free',
#         "ai_chat_used": current_user.ai_chat_used or 0,
#         "ai_chat_month": current_user.ai_chat_month or current_month,
#         "created_at": str(current_user.created_at)
#     }

# # ============================================
# # LOGOUT ENDPOINT
# # ============================================

# @app.post("/api/auth/logout")
# def logout(response: Response, session_id: str = Cookie(None)):
#     """
#     Logout user and clear Redis session
#     """
#     if session_id:
#         delete_session(session_id)
#         print(f"✅ Session deleted from Redis: {session_id[:10]}...")
    
#     # Clear the cookie
#     response.delete_cookie(key="session_id")
    
#     return {"success": True, "message": "Logged out successfully"}

# # ============================================
# # LOGOUT ALL DEVICES ENDPOINT
# # ============================================

# @app.post("/api/auth/logout-all")
# def logout_all_devices(
#     response: Response, 
#     current_user: models.User = Depends(get_current_user),
#     session_id: str = Cookie(None)
# ):
#     """
#     Logout user from all devices (delete all sessions)
#     """
#     delete_all_user_sessions(current_user.id)
    
#     # Clear the cookie
#     response.delete_cookie(key="session_id")
    
#     print(f"✅ All sessions deleted for user: {current_user.email}")
    
#     return {"success": True, "message": "Logged out from all devices successfully"}

# # ============================================
# # PASSWORD RESET ENDPOINT
# # ============================================

# @app.post("/users/reset-password")
# def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
#     """
#     Reset user password and invalidate all sessions
#     """
#     try:
#         user = db.query(models.User).filter(
#             models.User.email == reset_data.email
#         ).first()
       
#         if not user:
#             raise HTTPException(
#                 status_code=404,
#                 detail="No account found with this email"
#             )
       
#         # Update password
#         user.password_hash = get_password_hash(reset_data.new_password)
#         db.commit()
        
#         # Invalidate all sessions for security
#         delete_all_user_sessions(user.id)
        
#         return {
#             "success": True,
#             "message": "Password updated successfully. Please login again."
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         db.rollback()
#         print(f"❌ Password reset error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error updating password: {str(e)}"
#         )

# # ============================================
# # CHECK EMAIL ENDPOINT
# # ============================================

# @app.get("/users/check-email/{email}")
# def check_email_exists(email: str, db: Session = Depends(get_db)):
#     """
#     Check if an email is already registered
#     """
#     user = db.query(models.User).filter(
#         models.User.email == email
#     ).first()
   
#     return {
#         "exists": user is not None,
#         "email": email,
#         "message": "Email is registered" if user else "Email is available"
#     }

# # ============================================
# # GET USER PROFILE ENDPOINT (PROTECTED)
# # ============================================

# @app.get("/users/profile/{email}")
# def get_user_profile(
#     email: str, 
#     current_user: models.User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """
#     Get user profile by email (requires authentication)
#     """
#     # Only allow users to view their own profile or admins
#     if current_user.email != email:
#         raise HTTPException(
#             status_code=403, 
#             detail="Not authorized to view this profile"
#         )
    
#     user = db.query(models.User).filter(
#         models.User.email == email
#     ).first()
   
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     current_month = datetime.now().strftime("%Y-%m")
   
#     return {
#         "id": user.id,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#         "email": user.email,
#         "business_name": user.business_name,
#         "location": user.location,
#         "business_interests": user.business_interests,
#         "subscription_tier": user.subscription_tier or 'free',
#         "ai_chat_used": user.ai_chat_used or 0,
#         "ai_chat_month": user.ai_chat_month or current_month,
#         "created_at": str(user.created_at)
#     }

from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from fastapi import HTTPException, Depends, Response, Cookie, Request, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import random
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import json
import os
from dotenv import load_dotenv

# Load environment variables
from pathlib import Path
_base_dir = Path(__file__).resolve().parents[5]
load_dotenv(dotenv_path=_base_dir / ".env", override=True)

# ============================================
# Environment Variables
# ============================================
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Insydz")

# Cookie Security: Disable on localhost (non-HTTPS)
SESSION_COOKIE_SECURE = False if IS_LOCAL else (os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true")
SESSION_EXPIRE_DAYS_REMEMBER = int(os.getenv("SESSION_EXPIRE_DAYS_REMEMBER", 30))
SESSION_EXPIRE_DAYS_NO_REMEMBER = int(os.getenv("SESSION_EXPIRE_DAYS_NO_REMEMBER", 1))

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 10))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", 5))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", 60))

# in your backend
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

# ============================================
# YOUR EXISTING REDIS CLIENT 'r' IS ALREADY HERE
# ============================================
# Example:
# r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Password hashing - Now handled centrally in app.core.security
# verify_password and get_password_hash are imported at the top of this file


# ============================================
# Brevo Email Configuration
# ============================================

if not BREVO_API_KEY:
    print("⚠️ WARNING: BREVO_API_KEY not set in environment variables")

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = BREVO_API_KEY

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP via Brevo email"""
    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject="Password Reset OTP - Insydz",
            html_content=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 30px; 
                        text-align: center; 
                        border-radius: 10px 10px 0 0; 
                    }}
                    .content {{ 
                        background: #f9f9f9; 
                        padding: 30px; 
                        border-radius: 0 0 10px 10px; 
                    }}
                    .otp-box {{ 
                        background: white; 
                        border: 2px dashed #667eea; 
                        padding: 20px; 
                        text-align: center; 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 8px; 
                        margin: 20px 0; 
                        border-radius: 8px; 
                        color: #667eea;
                    }}
                    .warning {{ 
                        background: #fff3cd; 
                        border-left: 4px solid #ffc107; 
                        padding: 15px; 
                        margin: 20px 0; 
                    }}
                    .footer {{ 
                        text-align: center; 
                        margin-top: 20px; 
                        color: #666; 
                        font-size: 12px; 
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your Insydz account.</p>
                        <p>Your One-Time Password (OTP) is:</p>
                        
                        <div class="otp-box">
                            {otp}
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul style="margin: 10px 0;">
                                <li>This OTP is valid for {OTP_EXPIRY_MINUTES} minutes only</li>
                                <li>Never share this OTP with anyone</li>
                                <li>Insydz will never ask for your OTP via phone or email</li>
                            </ul>
                        </div>
                        
                        <p>If you didn't request this password reset, please ignore this email or contact our support team.</p>
                        
                        <p>Best regards,<br>The Insydz Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Insydz. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ OTP email sent to {email}")
        print(otp)
        return True
        
    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        print(f"⚠️ [DEV FALLBACK] Your OTP is: {otp}")
        # Allow signup to proceed if IP is unauthorized
        return True
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        print(f"⚠️ [DEV FALLBACK] Your OTP is: {otp}")
        return True

def send_signup_otp_email(email: str, otp: str) -> bool:
    """Send Signup OTP via Brevo email"""
    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject="Verify your email - Insydz",
            html_content=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 30px; 
                        text-align: center; 
                        border-radius: 10px 10px 0 0; 
                    }}
                    .content {{ 
                        background: #f9f9f9; 
                        padding: 30px; 
                        border-radius: 0 0 10px 10px; 
                    }}
                    .otp-box {{ 
                        background: white; 
                        border: 2px dashed #667eea; 
                        padding: 20px; 
                        text-align: center; 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 8px; 
                        margin: 20px 0; 
                        border-radius: 8px; 
                        color: #667eea;
                    }}
                    .warning {{ 
                        background: #fff3cd; 
                        border-left: 4px solid #ffc107; 
                        padding: 15px; 
                        margin: 20px 0; 
                    }}
                    .footer {{ 
                        text-align: center; 
                        margin-top: 20px; 
                        color: #666; 
                        font-size: 12px; 
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Welcome to Insydz! Please use the following One-Time Password (OTP) to verify your email address:</p>
                        
                        <div class="otp-box">
                            {otp}
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul style="margin: 10px 0;">
                                <li>This OTP is valid for {OTP_EXPIRY_MINUTES} minutes only</li>
                                <li>Never share this OTP with anyone</li>
                                <li>Insydz will never ask for your OTP via phone or email</li>
                            </ul>
                        </div>
                        
                        <p>If you didn't create an account, please ignore this email.</p>
                        
                        <p>Best regards,<br>The Insydz Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Insydz. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        )
        
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Signup OTP email sent to {email}")
        print(otp)
        return True
        
    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        print(f"⚠️ [DEV FALLBACK] Your OTP is: {otp}")
        # Allow signup to proceed if IP is unauthorized
        return True
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
        print(f"⚠️ [DEV FALLBACK] Your OTP is: {otp}")
        return True

# ============================================
# Welcome Email
# ============================================

def send_welcome_email(email: str, first_name: str) -> bool:
    """Send a beautiful welcome email after successful signup verification via Brevo"""
    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Insydz</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f4f7fb;
      color: #333333;
      -webkit-font-smoothing: antialiased;
      padding: 40px 20px;
    }}
    .email-wrapper {{
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }}
    .card {{
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
    }}
    .logo-container {{
      margin-bottom: 24px;
    }}
    .logo-container img {{
      height: auto;
      max-width: 200px;
    }}
    .separator {{
      width: 40px;
      height: 3px;
      background-color: #3b82f6;
      margin: 0 auto 24px auto;
      border-radius: 2px;
    }}
    .title {{
      color: #1e3a8a;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 16px;
    }}
    .subtitle {{
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }}
    .features-list {{
      text-align: left;
      margin-bottom: 32px;
    }}
    .feature-item {{
      padding: 16px 0;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }}
    .feature-item:last-child {{
      border-bottom: none;
    }}
    .check-icon {{
      color: #2563eb;
      font-weight: bold;
      font-size: 16px;
      margin-top: 2px;
    }}
    .feature-text {{
      font-size: 15px;
      color: #374151;
      line-height: 1.5;
    }}
    .feature-title {{
      font-weight: 700;
      color: #1e3a8a;
    }}
    .cta-container {{
      margin-bottom: 24px;
    }}
    .cta-btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
    }}
    .helper-text {{
      color: #9ca3af;
      font-size: 13px;
    }}
    .footer {{
      text-align: center;
      margin-top: 24px;
      color: #9ca3af;
      font-size: 13px;
      line-height: 1.6;
    }}
    .footer a {{
      color: #3b82f6;
      text-decoration: none;
    }}
    .footer a:hover {{
      text-decoration: underline;
    }}

    @media only screen and (max-width: 600px) {{
      body {{
        padding: 20px 10px;
      }}
      .card {{
        padding: 30px 20px !important;
      }}
      .title {{
        font-size: 22px !important;
      }}
      .subtitle {{
        font-size: 14px !important;
      }}
      .feature-text {{
        font-size: 14px !important;
      }}
      .cta-btn {{
        width: 100%;
        box-sizing: border-box;
      }}
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="card">
      <div class="logo-container">
        <img src="https://insydz.com/logo.png" alt="Insydz Logo" />
      </div>
      <div class="separator"></div>
      
      <h1 class="title">Welcome to Insydz</h1>
      <p class="subtitle">
        Your account is now active. Insydz helps you make confident, data backed decisions for your Amazon business. Here is what you can start with today.
      </p>

      <div class="features-list">
        <div class="feature-item">
          <div class="check-icon">&#10003;</div>
          <div class="feature-text"><span class="feature-title">Listing Audit:</span> identify gaps in your listings instantly</div>
        </div>
        <div class="feature-item">
          <div class="check-icon">&#10003;</div>
          <div class="feature-text"><span class="feature-title">Competitor Analysis:</span> understand exactly how rivals are positioned</div>
        </div>
        <div class="feature-item">
          <div class="check-icon">&#10003;</div>
          <div class="feature-text"><span class="feature-title">AI Price Optimizer:</span> set the right price to protect your margin</div>
        </div>
        <div class="feature-item">
          <div class="check-icon">&#10003;</div>
          <div class="feature-text"><span class="feature-title">WhatsApp Alerts:</span> receive important updates directly on WhatsApp</div>
        </div>
      </div>

      <div class="cta-container">
        <a href="https://insydz.com/dashboard" class="cta-btn">Go to Dashboard</a>
      </div>

      <p class="helper-text">
        Have a question? Simply reply to this email and our team will assist you.
      </p>
    </div>

    <div class="footer">
      &copy; 2026 Insydz &middot; Amazon seller analytics made for India<br>
      <a href="https://insydz.com">insydz.com</a> &middot; <a href="{{{{unsubscribe}}}}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>"""

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(

            to=[{"email": email}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject=f"🎉 Welcome to Insydz, {first_name}! Your account is ready.",
            html_content=html_content
        )

        api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Welcome email sent to {email}")
        return True

    except ApiException as e:
        print(f"❌ Brevo API error sending welcome email: {e}")
        return False


# ============================================
# Unverified Reminder Email
# ============================================

def send_unverified_reminder_email(email: str, verify_link: str) -> bool:
    """Send a reminder email to users who signed up but didn't verify their email."""
    try:
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You are almost there</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f4f7fb;
      color: #333333;
      -webkit-font-smoothing: antialiased;
      padding: 40px 20px;
    }}
    .email-wrapper {{
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }}
    .card {{
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
    }}
    .logo-container {{
      margin-bottom: 24px;
    }}
    .logo-container img {{
      height: auto;
      max-width: 200px;
    }}
    .separator {{
      width: 40px;
      height: 3px;
      background-color: #3b82f6;
      margin: 0 auto 24px auto;
      border-radius: 2px;
    }}
    .title {{
      color: #1e3a8a;
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 16px;
    }}
    .subtitle {{
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }}
    .list-header {{
      font-size: 12px;
      font-weight: 700;
      color: #1e3a8a;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-align: left;
      margin-bottom: 16px;
    }}
    .steps-list {{
      text-align: left;
      margin-bottom: 32px;
    }}
    .step-item {{
      margin-bottom: 20px;
    }}
    .step-item:last-child {{
      margin-bottom: 0;
    }}
    .step-circle {{
      display: inline-block;
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
      line-height: 28px;
      margin-right: 12px;
      vertical-align: middle;
    }}
    .step-text {{
      display: inline-block;
      font-size: 15px;
      color: #374151;
      vertical-align: middle;
    }}
    .cta-container {{
      margin-bottom: 24px;
    }}
    .cta-btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
    }}
    .helper-text {{
      color: #9ca3af;
      font-size: 13px;
      line-height: 1.5;
    }}
    .footer {{
      text-align: center;
      margin-top: 24px;
      color: #9ca3af;
      font-size: 13px;
      line-height: 1.6;
    }}
    .footer a {{
      color: #3b82f6;
      text-decoration: none;
    }}
    .footer a:hover {{
      text-decoration: underline;
    }}

    @media only screen and (max-width: 600px) {{
      body {{
        padding: 20px 10px;
      }}
      .card {{
        padding: 30px 20px !important;
      }}
      .title {{
        font-size: 22px !important;
      }}
      .subtitle {{
        font-size: 14px !important;
      }}
      .step-text {{
        font-size: 14px !important;
      }}
      .cta-btn {{
        width: 100%;
        box-sizing: border-box;
      }}
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="card">
      <div class="logo-container">
        <img src="https://insydz.com/logo.png" alt="Insydz Logo" />
      </div>
      <div class="separator"></div>
      
      <h1 class="title">You are almost there</h1>
      <p class="subtitle">
        We noticed that your Insydz sign up was not completed. Your details are saved, so you can pick up right where you left off. It takes less than a minute to finish.
      </p>

      <div class="list-header">WHAT IS LEFT TO DO</div>
      <div class="steps-list">
        <div class="step-item">
          <div class="step-circle">1</div>
          <div class="step-text">Verify your email address</div>
        </div>
        <div class="step-item">
          <div class="step-circle">2</div>
          <div class="step-text">Connect your store to begin tracking</div>
        </div>
        <div class="step-item">
          <div class="step-circle">3</div>
          <div class="step-text">Open your dashboard and explore your insights</div>
        </div>
      </div>

      <div class="cta-container">
        <a href="{verify_link}" class="cta-btn">Complete Sign Up</a>
      </div>

      <p class="helper-text">
        This link will remain active for 7 days. If you did not start a sign up, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      &copy; 2026 Insydz &middot; Amazon seller analytics made for India<br>
      <a href="https://insydz.com">insydz.com</a> &middot; <a href="{{{{unsubscribe}}}}">Unsubscribe</a>
    </div>
  </div>
</body>
</html>"""

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject="Complete your Insydz sign up",
            html_content=html_content
        )

        api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Unverified reminder email sent to {email}")
        return True

    except Exception as e:
        print(f"❌ Error sending unverified reminder email: {str(e)}")
        return False

    except Exception as e:
        print(f"❌ Error sending welcome email: {str(e)}")
        return False

# ============================================
# Redis Helper Functions with Prefixes
# ============================================
# Using prefixes to avoid conflicts with existing Redis data

OTP_PREFIX = "otp:"
SESSION_PREFIX = "session:"

def store_otp(email: str, otp_data: dict):
    """Store OTP in Redis with expiry"""
    try:
        key = f"{OTP_PREFIX}{email}"
        r.setex(
            key,
            OTP_EXPIRY_MINUTES * 60,  # Convert minutes to seconds
            json.dumps(otp_data)
        )
    except Exception as e:
        print(f"❌ Redis store OTP error: {e}")
        raise HTTPException(status_code=500, detail="Failed to store OTP")

def get_otp(email: str) -> dict:
    """Retrieve OTP from Redis"""
    try:
        key = f"{OTP_PREFIX}{email}"
        data = r.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        print(f"❌ Redis get OTP error: {e}")
        return None

def delete_otp(email: str):
    """Delete OTP from Redis"""
    try:
        key = f"{OTP_PREFIX}{email}"
        r.delete(key)
    except Exception as e:
        print(f"❌ Redis delete OTP error: {e}")

def update_otp(email: str, otp_data: dict):
    """Update OTP data in Redis (keep same TTL)"""
    try:
        key = f"{OTP_PREFIX}{email}"
        ttl = r.ttl(key)
        if ttl > 0:
            r.setex(key, ttl, json.dumps(otp_data))
        else:
            # If no TTL, set default expiry
            r.setex(key, OTP_EXPIRY_MINUTES * 60, json.dumps(otp_data))
    except Exception as e:
        print(f"❌ Redis update OTP error: {e}")


ABANDONED_SIGNUP_PREFIX = "abandoned_signup:"

def store_abandoned_signup(email: str, data: dict):
    try:
        key = f"{ABANDONED_SIGNUP_PREFIX}{email}"
        r.setex(key, 7 * 24 * 60 * 60, json.dumps(data))
    except Exception as e:
        print(f"❌ Redis store abandoned signup error: {e}")

def get_abandoned_signup(email: str) -> dict:
    try:
        key = f"{ABANDONED_SIGNUP_PREFIX}{email}"
        data = r.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        print(f"❌ Redis get abandoned signup error: {e}")
        return None

def delete_abandoned_signup(email: str):
    try:
        key = f"{ABANDONED_SIGNUP_PREFIX}{email}"
        r.delete(key)
    except Exception as e:
        print(f"❌ Redis delete abandoned signup error: {e}")


# ============================================
# Session Management with Redis
# ============================================

def create_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def parse_user_agent(ua_string: str) -> str:
    if not ua_string:
        return "Unknown Device"
    
    os_name = "Unknown OS"
    if "Windows" in ua_string:
        os_name = "Windows"
    elif "Macintosh" in ua_string or "Mac OS X" in ua_string:
        os_name = "macOS"
    elif "Android" in ua_string:
        os_name = "Android"
    elif "iPhone" in ua_string or "iPad" in ua_string:
        os_name = "iOS"
    elif "Linux" in ua_string:
        os_name = "Linux"
        
    browser_name = "Unknown Browser"
    if "Chrome" in ua_string and "Safari" in ua_string:
        if "Edg" in ua_string:
            browser_name = "Edge"
        elif "OPR" in ua_string or "Opera" in ua_string:
            browser_name = "Opera"
        else:
            browser_name = "Chrome"
    elif "Firefox" in ua_string:
        browser_name = "Firefox"
    elif "Safari" in ua_string and "Chrome" not in ua_string:
        browser_name = "Safari"
    elif "Trident" in ua_string or "MSIE" in ua_string:
        browser_name = "IE"
        
    return f"{browser_name} on {os_name}"

def get_location_from_ip(ip: str) -> str:
    if not ip or ip in ("127.0.0.1", "localhost", "testclient", "::1"):
        return "Localhost"
    try:
        import requests
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=2.0)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                city = data.get("city", "")
                country = data.get("country", "")
                if city and country:
                    return f"{city}, {country}"
                elif country:
                    return country
        return "Unknown Location"
    except Exception as e:
        print(f"⚠️ GeoIP lookup failed: {e}")
        return "Unknown Location"

def create_session(user_id: int, remember_me: bool = False, ip_address: str = None, user_agent: str = None) -> str:
    """Create a new session and store in Redis with device and location metadata"""
    session_token = create_session_token()
    expires_days = SESSION_EXPIRE_DAYS_REMEMBER if remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER
    
    device = parse_user_agent(user_agent)
    location = get_location_from_ip(ip_address)
    
    session_data = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "remember_me": remember_me,
        "ip_address": ip_address or "Unknown IP",
        "device": device,
        "location": location,
        "session_token": session_token
    }
    
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        r.setex(
            key,
            expires_days * 24 * 60 * 60,  # Convert days to seconds
            json.dumps(session_data)
        )
        
        # Track session token under the user's set of active sessions
        user_sessions_key = f"user:sessions:{user_id}"
        r.sadd(user_sessions_key, session_token)
        r.expire(user_sessions_key, expires_days * 24 * 60 * 60)
        
        return session_token
    except Exception as e:
        print(f"❌ Redis create session error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

def validate_session(session_token: str) -> dict:
    """Validate session token and return session data"""
    if not session_token:
        return None
    
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        data = r.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        print(f"❌ Redis validate session error: {e}")
        return None

def delete_session(session_token: str):
    """Delete a session from Redis and remove it from the user's session set"""
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        data = r.get(key)
        if data:
            session_data = json.loads(data)
            user_id = session_data.get("user_id")
            if user_id:
                r.srem(f"user:sessions:{user_id}", session_token)
        r.delete(key)
    except Exception as e:
        print(f"❌ Redis delete session error: {e}")

def delete_all_user_sessions(user_id: int):
    """Delete all sessions for a specific user in O(1) without scanning"""
    try:
        user_sessions_key = f"user:sessions:{user_id}"
        session_tokens = r.smembers(user_sessions_key)
        if session_tokens:
            for token_bytes in session_tokens:
                token = token_bytes.decode('utf-8') if isinstance(token_bytes, bytes) else token_bytes
                r.delete(f"{SESSION_PREFIX}{token}")
        r.delete(user_sessions_key)
    except Exception as e:
        print(f"❌ Redis delete user sessions error: {e}")

def get_current_user(session_id: str = Cookie(None), db: Session = Depends(get_db)):
    """Dependency to get current authenticated user"""
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = validate_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user = db.query(models.User).filter(models.User.id == session["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def check_and_downgrade(user, db):
    now = datetime.now(timezone.utc)

    expires = user.subscription_expires_at

    # convert DB value to UTC-aware if it's naive
    if expires is not None and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if expires is None or expires <= now:

        if user.subscription_tier != "free":
            user.subscription_tier = "free"
            db.commit()
            db.refresh(user)

    return user

# ============================================
# Pydantic Models
# ============================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: dict = None

# ============================================
# FORGOT PASSWORD - STEP 1: REQUEST OTP
# ============================================

@router.post("/api/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 1: Verify email exists and send OTP
    """
    try:
        # Check if user exists
        user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(request.email, None)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this email address"
            )
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP in Redis with metadata
        otp_data = {
            "otp": otp,
            "created_at": datetime.now().isoformat(),
            "attempts": 0,
            "verified": False
        }
        store_otp(request.email, otp_data)
        
        # Send OTP via email
        email_sent = send_otp_email(request.email, otp)

        
        if not email_sent:
            delete_otp(request.email)
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email. Please try again."
            )
        
        print(f"✅ OTP generated for {request.email}: {otp}")
        
        return {
            "success": True,
            "message": "OTP sent successfully to your email",
            "email": request.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

# ============================================
# FORGOT PASSWORD - STEP 2: VERIFY OTP
# ============================================

@router.post("/api/auth/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    """
    Step 2: Verify the OTP entered by user
    """
    try:
        # Get OTP data from Redis
        otp_data = get_otp(request.email)
        
        if not otp_data:
            raise HTTPException(
                status_code=400,
                detail="No OTP request found or OTP has expired. Please request a new OTP."
            )
        
        # Check attempts (max 5 attempts)
        if otp_data.get("attempts", 0) >= OTP_MAX_ATTEMPTS:
            delete_otp(request.email)
            raise HTTPException(
                status_code=429,
                detail="Too many failed attempts. Please request a new OTP."
            )
        
        # Verify OTP
        if otp_data["otp"] != request.otp:
            otp_data["attempts"] = otp_data.get("attempts", 0) + 1
            update_otp(request.email, otp_data)
            remaining = OTP_MAX_ATTEMPTS - otp_data["attempts"]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid OTP. {remaining} attempts remaining."
            )
        
        # Mark OTP as verified
        otp_data["verified"] = True
        update_otp(request.email, otp_data)
        
        print(f"✅ OTP verified for {request.email}")
        
        return {
            "success": True,
            "message": "OTP verified successfully",
            "email": request.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error verifying OTP: {str(e)}"
        )

# ============================================
# FORGOT PASSWORD - STEP 3: RESET PASSWORD
# ============================================

@router.post("/api/auth/reset-password-with-otp")
def reset_password_with_otp(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 3: Reset password after OTP verification
    """
    try:
        # Get OTP data from Redis
        otp_data = get_otp(request.email)
        
        if not otp_data:
            raise HTTPException(
                status_code=400,
                detail="OTP has expired. Please request a new one."
            )
        
        # Check if OTP was verified
        if not otp_data.get("verified", False):
            raise HTTPException(
                status_code=400,
                detail="OTP not verified. Please verify your OTP first."
            )
        
        # Double check OTP matches (security)
        if otp_data["otp"] != request.otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP"
            )
        
        # Validate password
        if len(request.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 6 characters long"
            )
        
        # Find user
        user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(request.email, None)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        
        # Update password
        user.password_hash = get_password_hash(request.new_password)
        db.commit()
        
        # Clear OTP from Redis
        delete_otp(request.email)
        delete_abandoned_signup(request.email)
        
        # Invalidate all existing sessions for this user (force re-login)
        delete_all_user_sessions(user.id)
        
        print(f"✅ Password reset successful for {request.email}")
        
        return {
            "success": True,
            "message": "Password reset successful. Please login with your new password."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Password reset error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error resetting password: {str(e)}"
        )

# ============================================
# RESEND OTP
# ============================================

@router.post("/api/auth/resend-otp")
def resend_otp(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Resend OTP to user's email
    """
    try:
        # Check if user exists
        user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(request.email, None)
        ).first()
        
        # Check if previous OTP exists
        existing_otp = get_otp(request.email)

        if not user and not (existing_otp and existing_otp.get("purpose") == "signup"):
            raise HTTPException(
                status_code=404,
                detail="No account found with this email address"
            )
        
        if existing_otp:
            created_at = datetime.fromisoformat(existing_otp["created_at"])
            time_diff = (datetime.now() - created_at).total_seconds()
            
            if time_diff < OTP_RESEND_COOLDOWN_SECONDS:
                wait_time = int(OTP_RESEND_COOLDOWN_SECONDS - time_diff)
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {wait_time} seconds before requesting a new OTP"
                )
        
        # Generate new OTP
        otp = generate_otp()
        
        # Store new OTP in Redis
        otp_data = {
            "otp": otp,
            "created_at": datetime.now().isoformat(),
            "attempts": 0,
            "verified": False,
            "purpose": existing_otp.get("purpose", "signup") if existing_otp else "signup"
        }
        if existing_otp and "user_data" in existing_otp:
            otp_data["user_data"] = existing_otp["user_data"]
            
        store_otp(request.email, otp_data)
        
        # Send OTP via email
        if otp_data["purpose"] == "signup":
            email_sent = send_signup_otp_email(request.email, otp)
        else:
            email_sent = send_otp_email(request.email, otp)
        
        if not email_sent:
            delete_otp(request.email)
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email. Please try again."
            )
        
        print(f"✅ OTP resent to {request.email}: {otp}")
        
        return {
            "success": True,
            "message": "New OTP sent successfully to your email"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error resending OTP: {str(e)}"
        )

# ============================================
# LOGIN ENDPOINT
# ============================================

@router.post("/users/login", response_model=LoginResponse)
def login_user(login_data: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and set secure session cookie"""
    try:
        print(f"🔍 Login attempt for: {login_data.email}")
        
        user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(login_data.email, None)
        ).first()
       
        if not user:
            print(f"❌ User not found: {login_data.email}")
            raise HTTPException(
                status_code=404,
                detail="No account found with this email. Please sign up first."
            )
       
        if not verify_password(login_data.password, user.password_hash):
            print(f"❌ Invalid password for: {login_data.email}")
            raise HTTPException(
                status_code=401,
                detail="Incorrect password. Please try again or reset your password."
            )

        # ADD IT HERE ↓
        if not user.is_verified:
            raise HTTPException(
                status_code=403,
                detail="Please verify your email before logging in."
            )
        
        current_month = datetime.now().strftime("%Y-%m")
        if user.ai_chat_month != current_month:
            print(f"🔄 Resetting AI usage for new month: {current_month}")
            user.ai_chat_used = 0
            user.ai_chat_month = current_month
            db.commit()
            db.refresh(user)
        
        # Extract IP and User-Agent metadata
        ip_address = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
        if ip_address:
            ip_address = ip_address.split(",")[0].strip()
        else:
            ip_address = request.client.host if request.client else "Unknown IP"
            
        user_agent = request.headers.get("user-agent")

        # Clear all old sessions before creating a new one
        # This prevents duplicate device entries in Settings
        delete_all_user_sessions(user.id)

        # Create session in Redis
        session_token = create_session(
            user_id=user.id,
            remember_me=login_data.remember_me,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        max_age = SESSION_EXPIRE_DAYS_REMEMBER * 24 * 60 * 60 if login_data.remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60
        response.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=max_age,
            # domain=".insydz.com"
        )
        
        response_data = {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "business_name": user.business_name,
                "location": user.location,
                "business_interests": user.business_interests,
                "subscription_tier": user.subscription_tier or 'free',
                "ai_chat_used": user.ai_chat_used or 0,
                "ai_chat_month": user.ai_chat_month or current_month,
                "created_at": str(user.created_at)
            }
        }
        
        print(f"✅ Login successful for {user.email}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )

# ============================================
# SIGNUP ENDPOINT
# ============================================

@router.post("/users/signup")
def signup_user(
    user_data: schemas.UserCreate, 
    response: Response, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        existing_user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(user_data.email, None)
        ).first()
        
        if existing_user:
            if not existing_user.is_verified:
                # Queue OTP resend in background task for legacy unverified DB users
                otp = generate_otp()
                store_otp(user_data.email, {
                    "otp": otp,
                    "created_at": datetime.now().isoformat(),
                    "attempts": 0,
                    "verified": False,
                    "purpose": "signup"
                })
                background_tasks.add_task(send_signup_otp_email, user_data.email, otp)
                print(f"✅ Verification email queued for resend: {user_data.email}")
                return {
                    "success": True,
                    "message": "Verification email resent.",
                    "requires_verification": True,
                    "email": user_data.email
                }
            raise HTTPException(
                status_code=400, 
                detail="Email already registered. Please login instead."
            )
        
        hashed_password = get_password_hash(user_data.password)
        current_month = datetime.now().strftime("%Y-%m")
        
        otp = generate_otp()
        print(f"OTP for {user_data.email}: {otp}")
        
        # Store OTP and user data in Redis synchronously (<1ms)
        user_data_dict = {
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "password_hash": hashed_password,
            "business_name": user_data.business_name,
            "location": user_data.location,
            "business_interests": user_data.business_interests,
            "mobile_number": user_data.mobile_number,
            "subscription_tier": 'free',
            "ai_chat_used": 0,
            "ai_chat_month": current_month,
            "is_verified": False
        }
        
        store_abandoned_signup(user_data.email, {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "user_data": user_data_dict,
            "reminders_sent": []
        })
        
        store_otp(user_data.email, {
            "otp": otp,
            "created_at": datetime.now().isoformat(),
            "attempts": 0,
            "verified": False,
            "purpose": "signup",
            "user_data": user_data_dict
        })
        
        # Queue email sending in the background
        background_tasks.add_task(send_signup_otp_email, user_data.email, otp)
        
        print(f"✅ New user created and verification email queued in background: {user_data.email}")
        
        return {
            "success": True,
            "message": "Account created. Please verify your email.",
            "requires_verification": True,
            "email": user_data.email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Signup error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating user: {str(e)}"
        )

@router.post("/users/verify-email")
def verify_email(request: VerifyOTPRequest, response: Response, raw_request: Request, db: Session = Depends(get_db)):
    try:
        # Get OTP data from Redis
        otp_data = get_otp(request.email)
        
        if not otp_data or otp_data.get("purpose") != "signup":
            raise HTTPException(
                status_code=400, 
                detail="No pending verification found for this email. Please sign up again."
            )
        
        # Check max attempts
        if otp_data.get("attempts", 0) >= OTP_MAX_ATTEMPTS:
            delete_otp(request.email)
            # Also delete the unverified user so they can sign up fresh
            unverified_user = db.query(models.User).filter(
                models.User.email_hash == HashedString().process_bind_param(request.email, None),
                models.User.is_verified == False
            ).first()
            if unverified_user:
                db.delete(unverified_user)
                db.commit()
            raise HTTPException(
                status_code=429, 
                detail="Too many failed attempts. Please sign up again."
            )
        
        # Check OTP match
        if otp_data["otp"] != request.otp:
            otp_data["attempts"] += 1
            update_otp(request.email, otp_data)
            remaining = OTP_MAX_ATTEMPTS - otp_data["attempts"]
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid OTP. {remaining} attempts remaining."
            )
        
        # Find user
        user = db.query(models.User).filter(
            models.User.email_hash == HashedString().process_bind_param(request.email, None)
        ).first()
        
        if user:
            if user.is_verified:
                raise HTTPException(
                    status_code=400, 
                    detail="Email already verified. Please login."
                )
            
            # Legacy path: mark existing unverified user as verified
            user.is_verified = True
            db.commit()
            db.refresh(user)
        else:
            # New path: create user from Redis stored data
            stored_user_data = otp_data.get("user_data")
            if not stored_user_data:
                raise HTTPException(
                    status_code=400,
                    detail="User data expired or invalid. Please sign up again."
                )
            
            user = models.User(
                first_name=stored_user_data["first_name"],
                last_name=stored_user_data["last_name"],
                email=stored_user_data["email"],
                password_hash=stored_user_data["password_hash"],
                business_name=stored_user_data.get("business_name"),
                location=stored_user_data.get("location"),
                business_interests=stored_user_data.get("business_interests"),
                mobile_number=stored_user_data.get("mobile_number"),
                subscription_tier=stored_user_data.get("subscription_tier", "free"),
                ai_chat_used=stored_user_data.get("ai_chat_used", 0),
                ai_chat_month=stored_user_data.get("ai_chat_month"),
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Clear OTP from Redis
        delete_otp(request.email)
        delete_abandoned_signup(request.email)

        # Send welcome email (non-blocking — failure doesn't break verification)
        try:
            send_welcome_email(email=user.email, first_name=user.first_name)
        except Exception as _e:
            print(f"⚠️ Welcome email failed (non-critical): {_e}")

        # Extract IP and User-Agent metadata
        ip_address = raw_request.headers.get("x-forwarded-for") or raw_request.headers.get("x-real-ip")
        if ip_address:
            ip_address = ip_address.split(",")[0].strip()
        else:
            ip_address = raw_request.client.host if raw_request.client else "Unknown IP"
            
        user_agent = raw_request.headers.get("user-agent")

        # Clear all old sessions before creating a new one
        delete_all_user_sessions(user.id)

        # Create session
        session_token = create_session(
            user_id=user.id,
            remember_me=False,
            ip_address=ip_address,
            user_agent=user_agent
        )
        response.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60,
            # domain=".insydz.com"
        )
        
        current_month = datetime.now().strftime("%Y-%m")
        
        print(f"✅ Email verified successfully for {request.email}")
        
        # Return full user object (same as login response)
        return {
            "success": True,
            "message": "Email verified successfully.",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "business_name": user.business_name,
                "location": user.location,
                "business_interests": user.business_interests,
                "subscription_tier": user.subscription_tier or 'free',
                "ai_chat_used": user.ai_chat_used or 0,
                "ai_chat_month": user.ai_chat_month or current_month,
                "created_at": str(user.created_at)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Email verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error verifying email: {str(e)}"
        )

# ============================================
# GET CURRENT USER
# ============================================

@router.get("/api/auth/me")
def get_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user = check_and_downgrade(current_user, db)

    current_month = datetime.now().strftime("%Y-%m")

    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "business_name": current_user.business_name,
        "location": current_user.location,
        "business_interests": current_user.business_interests,
        "mobile_number": current_user.mobile_number,

        "subscription_tier": current_user.subscription_tier,
        "subscription_expires_at": current_user.subscription_expires_at,

        "ai_chat_used": current_user.ai_chat_used or 0,
        "ai_chat_month": current_user.ai_chat_month or current_month,
        "created_at": str(current_user.created_at),
        "onboarding_completed": current_user.onboarding_completed,
        "onboarding_goal": current_user.onboarding_goal,
        "onboarding_marketplace": current_user.onboarding_marketplace,
        "onboarding_details": current_user.onboarding_details,
        "seller_id": current_user.seller_id,
        "explorer_tour_completed": getattr(current_user, "explorer_tour_completed", False),
        "seller_tour_completed": getattr(current_user, "seller_tour_completed", False),
        "welcome_card_dismissed": getattr(current_user, "welcome_card_dismissed", False)
    }

@router.post("/api/auth/tour-completion")
def update_tour_completion(
    request: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update onboarding tour completion and welcome card dismissal status
    """
    try:
        explorer_tour_completed = request.get("explorer_tour_completed")
        seller_tour_completed = request.get("seller_tour_completed")
        welcome_card_dismissed = request.get("welcome_card_dismissed")
        
        if explorer_tour_completed is not None:
            current_user.explorer_tour_completed = bool(explorer_tour_completed)
        if seller_tour_completed is not None:
            current_user.seller_tour_completed = bool(seller_tour_completed)
        if welcome_card_dismissed is not None:
            current_user.welcome_card_dismissed = bool(welcome_card_dismissed)
            
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Tour completion status updated successfully",
            "explorer_tour_completed": current_user.explorer_tour_completed,
            "seller_tour_completed": current_user.seller_tour_completed,
            "welcome_card_dismissed": current_user.welcome_card_dismissed
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Update tour completion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating tour completion status: {str(e)}"
        )

# ============================================
# LOGOUT ENDPOINT
# ============================================

@router.post("/api/auth/logout")
def logout(response: Response, session_id: str = Cookie(None)):
    """Logout user and clear session"""
    if session_id:
        delete_session(session_id)
        print(f"✅ Session deleted from Redis")
    
        response.delete_cookie(
        key="session_id",
        httponly=True,
        secure=SESSION_COOKIE_SECURE,
        samesite="lax",
        # domain=".insydz.com"
    )

    
    return {"success": True, "message": "Logged out successfully"}

# ============================================
# CHECK EMAIL ENDPOINT
# ============================================

@router.get("/users/check-email/{email}")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Check if an email is already registered"""
    user = db.query(models.User).filter(
        models.User.email_hash == HashedString().process_bind_param(email, None)
    ).first()
   
    return {
        "exists": user is not None,
        "email": email,
        "message": "Email is registered" if user else "Email is available"
    }

# ============================================
# GET USER PROFILE ENDPOINT (PROTECTED)
# ============================================

@router.get("/users/profile/{email}")
def get_user_profile(
    email: str, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile by email (requires authentication)"""
    if current_user.email != email:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to view this profile"
        )
    
    user = db.query(models.User).filter(
        models.User.email_hash == HashedString().process_bind_param(email, None)
    ).first()
   
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_month = datetime.now().strftime("%Y-%m")
   
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "business_name": user.business_name,
        "location": user.location,
        "business_interests": user.business_interests,
        "mobile_number": user.mobile_number,
        "subscription_tier": user.subscription_tier or 'free',
        "ai_chat_used": user.ai_chat_used or 0,
        "ai_chat_month": user.ai_chat_month or current_month,
        "created_at": str(user.created_at)
    }

@router.get("/api/admin/stats")
def get_admin_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # return 404 so no one knows this page exists
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=404, detail="Not found")

    total_users = db.query(models.User).count()
    verified_users = db.query(models.User).filter(models.User.is_verified == True).count()
    unverified_users = db.query(models.User).filter(models.User.is_verified == False).count()

    # users by tier
    free_users = db.query(models.User).filter(models.User.subscription_tier == 'free').count()
    basic_users = db.query(models.User).filter(models.User.subscription_tier == 'basic').count()
    premium_users = db.query(models.User).filter(models.User.subscription_tier == 'premium').count()

    # recent signups (last 7 days)
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_signups = db.query(models.User).filter(
        models.User.created_at >= seven_days_ago
    ).count()

    # all users with details
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    user_list = [
    {
        "id": u.id,
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,

        "subscription_tier": u.subscription_tier or "free",
        "is_verified": u.is_verified,
        "is_active": u.is_active,

        "ai_chat_used": u.ai_chat_used or 0,
        "ai_chat_month": u.ai_chat_month,

        "analysis_used": u.analysis_used or 0,
        "analysis_month": u.analysis_month,

        "sov_used": u.sov_used or 0,
        "sov_month": u.sov_month,

        "keyword_tracker_used": u.keyword_tracker_used or 0,
        "keyword_tracker_month": u.keyword_tracker_month,

        "ki_searches_used": u.ki_searches_used or 0,
        "ki_cycle_start": str(u.ki_cycle_start) if u.ki_cycle_start else None,

        "business_name": u.business_name,
        "location": u.location,
        "business_interests": u.business_interests,

        "subscription_expires_at": str(u.subscription_expires_at) if u.subscription_expires_at else None,
        "scheduled_downgrade_to": u.scheduled_downgrade_to,

        "onboarding_completed": u.onboarding_completed,
        "onboarding_goal": u.onboarding_goal,
        "onboarding_marketplace": u.onboarding_marketplace,
        "onboarding_details": u.onboarding_details,

        "seller_id": u.seller_id,
        "seller_sync_status": u.seller_sync_status,

        "mobile_number": u.mobile_number,

        "created_at": str(u.created_at),
        "updated_at": str(u.updated_at) if u.updated_at else None,
    }
    for u in users
]

    # Fetch all promo codes
    promo_records = db.query(models.PromoCode).all()
    promo_codes_list = []
    for p in promo_records:
        redemptions_query = db.query(models.PromoCodeRedemption, models.User).join(
            models.User, models.PromoCodeRedemption.user_id == models.User.id
        ).filter(models.PromoCodeRedemption.promo_code_id == p.id).order_by(models.PromoCodeRedemption.redeemed_at.desc()).all()
        
        redemptions_data = []
        for redemption, user in redemptions_query:
            redemptions_data.append({
                "user_id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "redeemed_at": str(redemption.redeemed_at)
            })

        promo_codes_list.append({
            "id": p.id,
            "code": p.code,
            "discount_percentage": float(p.discount_percentage),
            "max_uses_per_user": p.max_uses_per_user,
            "marketing_channel": p.marketing_channel,
            "is_active": p.is_active,
            "valid_from": str(p.valid_from) if p.valid_from else None,
            "expires_at": str(p.expires_at) if p.expires_at else None,
            "created_at": str(p.created_at),
            "total_redemptions": len(redemptions_data),
            "redemptions": redemptions_data
        })

    return {
        "stats": {
            "total_users": total_users,
            "verified_users": verified_users,
            "unverified_users": unverified_users,
            "recent_signups_7days": recent_signups,
            "by_tier": {
                "free": free_users,
                "basic": basic_users,
                "premium": premium_users,
            }
        },
        "users": user_list,
        "promo_codes": promo_codes_list
    }

import asyncio
import contextlib
import hashlib
import json
import logging
import math
import re
import subprocess
import time
import uuid
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import structlog
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from sqlalchemy import text
from sqlalchemy.orm import Session
# from your project:
# from database import get_db
# import models, crud
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-10]  ERROR HIERARCHY
# ─────────────────────────────────────────────────────────────────────────────
 
class AppError(Exception):
    """Base for all application errors. Carries an HTTP status and a machine-
    readable error_code so clients can react programmatically."""
    http_status: int = 500
    error_code:  str = "INTERNAL_ERROR"
 
    def __init__(self, message: str, detail: Any = None):
        super().__init__(message)
        self.message = message
        self.detail  = detail
 
 
class ValidationError(AppError):
    http_status = 400
    error_code  = "VALIDATION_ERROR"
 
 
class DatabaseError(AppError):
    http_status = 503
    error_code  = "DATABASE_ERROR"
 
 
class AIError(AppError):
    http_status = 502
    error_code  = "AI_ERROR"
 
 
class TimeoutError(AppError):
    http_status = 504
    error_code  = "TIMEOUT_ERROR"
 
 
class QuotaError(AppError):
    http_status = 403
    error_code  = "QUOTA_EXCEEDED"
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-10]  FASTAPI APP + EXCEPTION HANDLERS
# ─────────────────────────────────────────────────────────────────────────────
 
 
 
# @router.exception_handler(AppError)
# async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
#     return JSONResponse(
#         status_code=exc.http_status,
#         content={
#             "success":    False,
#             "error_code": exc.error_code,
#             "message":    exc.message,
#             "detail":     exc.detail,
#             "request_id": getattr(request.state, "request_id", None),
#         },
#     )
#  
#  
# # @router.exception_handler(HTTPException)
# # async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
# #     return JSONResponse(
# #         status_code=exc.status_code,
# #         content={
# #             "success":    False,
# #             "error_code": "HTTP_ERROR",
# #             "message":    exc.detail,
# #             "request_id": getattr(request.state, "request_id", None),
# #         },
# #     )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-2]  STRUCTLOG  +  REQUEST-ID MIDDLEWARE
# ─────────────────────────────────────────────────────────────────────────────
 
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)
log = structlog.get_logger()
 
# Stdlib logger for third-party libs that use it
logging.basicConfig(level=logging.INFO)
_stdlib_log = logging.getLogger(__name__)
 
 
# @router.middleware("http")
# async def attach_request_id(request: Request, call_next):
#     request_id = str(uuid.uuid4())
#     request.state.request_id = request_id
#     structlog.contextvars.clear_contextvars()
#     structlog.contextvars.bind_contextvars(
#         request_id=request_id,
#         path=request.url.path,
#         method=request.method,
#     )
#     t0 = time.perf_counter()
#     response = await call_next(request)
#     latency_ms = round((time.perf_counter() - t0) * 1000, 1)
#     log.info("request_complete", status=response.status_code, latency_ms=latency_ms)
#     response.headers["X-Request-ID"] = request_id
#     return response
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-2]  STEP TIMER  — measures each pipeline stage
# ─────────────────────────────────────────────────────────────────────────────
 
@dataclass
class StepTimer:
    """Accumulates per-step latency for inclusion in the API response."""
    _steps: Dict[str, float] = field(default_factory=dict)
    _start: float            = field(default_factory=time.perf_counter)
 
    @contextlib.contextmanager
    def step(self, name: str):
        t0 = time.perf_counter()
        try:
            yield
        finally:
            self._steps[name] = round((time.perf_counter() - t0) * 1000, 1)
 
    def total_ms(self) -> float:
        return round((time.perf_counter() - self._start) * 1000, 1)
 
    def to_dict(self) -> Dict[str, float]:
        return dict(self._steps)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-1]  REDIS CACHE LAYER
# Uses your existing sync Redis client: r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
# Import it from wherever it lives in your project, e.g.:
#   from database import r
# or just paste the line below if this file is standalone:
#   import redis; r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
# ─────────────────────────────────────────────────────────────────────────────
 
# ↓↓ REPLACE THIS IMPORT with however you import `r` in your project ↓↓
 
CACHE_TTL_ANALYSIS_S  = 3_600   # 1 hour  — full analysis result
CACHE_TTL_CATEGORY_S  = 7_200   # 2 hours — category-level cap stats
CACHE_TTL_LOCATION_S  = 86_400  # 24 hours — location insights (slow to change)
 
 
def _cache_key(*parts: Any) -> str:
    """Stable, collision-resistant cache key from arbitrary parts."""
    raw = "|".join(str(p).lower().strip() for p in parts)
    return "pt:" + hashlib.sha256(raw.encode()).hexdigest()[:32]
 
 
# All three cache helpers are now synchronous but wrapped in asyncio.to_thread
# so they don't block the event loop when called with `await`.
 
async def cache_get(key: str) -> Optional[Any]:
    try:
        raw = await asyncio.to_thread(r.get, key)
        return json.loads(raw) if raw else None
    except Exception as exc:
        log.warning("cache_get_failed", key=key, reason=str(exc))
        return None
 
 
async def cache_set(key: str, value: Any, ttl: int) -> None:
    try:
        payload = json.dumps(value, default=str)
        await asyncio.to_thread(r.setex, key, ttl, payload)
    except Exception as exc:
        log.warning("cache_set_failed", key=key, reason=str(exc))
 
 
async def cache_delete(key: str) -> None:
    try:
        await asyncio.to_thread(r.delete, key)
    except Exception as exc:
        log.warning("cache_delete_failed", key=key, reason=str(exc))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────
 
OLLAMA_MODEL = "llama3.2:3b"
 
# [IMP-5]  Semaphore: at most 3 Ollama calls run concurrently
_OLLAMA_SEMAPHORE = asyncio.Semaphore(3)
 
# [IMP-6]  DB query timeout in milliseconds (SET LOCAL statement_timeout)
DB_QUERY_TIMEOUT_MS = 4_000
 
_ALLOWED_SOURCES: Dict[str, str] = {
    "amazon":   "rapidapi_amazon_products",
    "flipkart": "rapidapi_flipkart_products",
}
_PRICE_COL: Dict[str, str] = {
    "amazon":   "product_price_numeric",
    "flipkart": "product_price",
}
 
STOPWORDS = {
    "for", "with", "and", "the", "a", "an", "in", "of", "to", "by",
    "new", "best", "buy", "latest", "original", "free", "offer", "sale",
    "india", "brand", "combo", "set", "pack", "ml", "kg", "gm", "gms",
    "ltr", "litre", "liter", "piece", "pieces", "pcs", "units", "count",
    "or", "is", "at", "on", "up", "its", "this", "that", "your",
}
 
REVIEW_RATE        = 0.02
AVG_PRODUCT_AGE_MO = 18.0
NEW_SELLER_SHARE   = 0.03
MIN_MATCHED        = 5
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-3]  CONFIDENCE SCORE
# ─────────────────────────────────────────────────────────────────────────────
 
class FallbackTier(str, Enum):
    TIER_1   = "tier_1_exact"
    TIER_2   = "tier_2_keyword"
    TIER_3   = "tier_3_broad"
    TIER_4   = "tier_4_category"
    NO_DATA  = "no_data"
 
 
@dataclass
class ConfidenceScore:
    """
    0.0–1.0 float score, label, and breakdown.
    Higher = more trustworthy estimates.
    """
    score:              float        # 0.0–1.0
    label:              str          # High / Medium / Low
    tier_used:          FallbackTier
    sample_size:        int
    has_sales_data:     bool
    has_review_data:    bool
    price_spread_pct:   float        # CV of prices — high spread = noisy market
    rating_variance:    float        # std-dev of star ratings (0 if none)
    price_completeness: float        # 0–1 fraction of products with a valid price
    pct_with_ratings:   float        # % of matched products that have a star rating
    caveats:            List[str]    # human-readable confidence caveats

    def to_dict(self) -> Dict:
        return {
            "score":              round(self.score, 3),
            "label":              self.label,
            "color":              "green" if self.score >= 0.70 else ("yellow" if self.score >= 0.45 else "red"),
            "product_count":      self.sample_size,
            "pct_with_ratings":   round(self.pct_with_ratings, 1),
            "tier_used":          self.tier_used.value,
            "sample_size":        self.sample_size,
            "has_sales_data":     self.has_sales_data,
            "has_review_data":    self.has_review_data,
            "price_spread_pct":   round(self.price_spread_pct, 1),
            "rating_variance":    round(self.rating_variance, 3),
            "price_completeness": round(self.price_completeness, 3),
            "caveats":            self.caveats,
        } 

def compute_confidence_score(
    products: List[Dict],
    pricing: Dict,
    tier: FallbackTier,
) -> ConfidenceScore:
    """
    [IMP-3] Single authoritative confidence function.

    Weights:
      40 pts  — sample size (log-scaled, capped at 30+ products)
      20 pts  — data completeness (reviews present)
      20 pts  — sales data present
      10 pts  — tier quality (Tier 1 = full points, Tier 4 = 0)
      10 pts  — price spread (low CV = consistent market)
    """
    n = len(products)

    prices   = [float(p.get("price", 0) or 0) for p in products if float(p.get("price", 0) or 0) > 0]
    has_rev  = any(int(p.get("reviews", 0) or 0) > 0 for p in products)
    has_sale = any(
        p.get("sales_volume") or float(p.get("estimated_sales") or 0) > 0
        for p in products
    )

    # ── New fields ──────────────────────────────────────────────────────────

    # rating_variance: std-dev of star ratings across matched products
    ratings = [float(p.get("rating", 0) or 0) for p in products if float(p.get("rating", 0) or 0) > 0]
    rating_variance = float(np.std(ratings)) if len(ratings) >= 2 else 0.0

    # price_completeness: what fraction of matched products have a usable price
    price_completeness = len(prices) / n if n > 0 else 0.0

    # caveats: machine-generated, human-readable confidence explanations
    caveats: List[str] = []
    if tier != FallbackTier.TIER_1:
        caveats.append(f"Match quality: {tier.value.replace('_', ' ')}")
    if n < 10:
        caveats.append(f"Small sample: only {n} product(s) matched")
    if price_completeness < 0.6:
        caveats.append(
            f"Price data sparse: only {price_completeness:.0%} of matched products have a price"
        )
    if not has_rev:
        caveats.append("No review data available for matched products")

    # ── Existing score logic (unchanged) ────────────────────────────────────

    mkt_avg = pricing.get("market_avg_price", 0)
    if mkt_avg > 0 and len(prices) >= 3:
        spread_pct = float(np.std(prices) / mkt_avg * 100)
    else:
        spread_pct = 100.0

    if spread_pct > 80:
        caveats.append("High price variance — market pricing is inconsistent")

    size_score   = min(1.0, math.log1p(n) / math.log1p(30))
    review_score = 1.0 if has_rev  else 0.0
    sales_score  = 1.0 if has_sale else 0.0
    tier_score   = {
        FallbackTier.TIER_1:  1.0,
        FallbackTier.TIER_2:  0.75,
        FallbackTier.TIER_3:  0.50,
        FallbackTier.TIER_4:  0.20,
        FallbackTier.NO_DATA: 0.0,
    }[tier]
    spread_score = max(0.0, 1.0 - spread_pct / 100.0)

    raw = (
        size_score   * 0.40
        + review_score * 0.20
        + sales_score  * 0.20
        + tier_score   * 0.10
        + spread_score * 0.10
    )
    score = round(min(1.0, max(0.0, raw)), 3)
    label = "High" if score >= 0.70 else ("Medium" if score >= 0.45 else "Low")

    return ConfidenceScore(
        score=score,
        label=label,
        color="green" if score >= 0.70 else ("yellow" if score >= 0.45 else "red"),
        product_count=n,
        tier_used=tier,
        sample_size=n,
        has_sales_data=has_sale,
        has_review_data=has_rev,
        price_spread_pct=spread_pct,
        rating_variance=rating_variance,
        price_completeness=price_completeness,
        pct_with_ratings=round(len(ratings) / n * 100, 1) if n > 0 else 0.0,
        caveats=caveats,
    ) 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-8]  API RESPONSE ENVELOPE
# ─────────────────────────────────────────────────────────────────────────────
 
class SourceType(str, Enum):
    EXACT_MATCH      = "exact_match"
    KEYWORD_MATCH    = "keyword_match"
    BROAD_MATCH      = "broad_match"
    CATEGORY_FALLBACK= "category_fallback"
    NO_DATA          = "no_data"
 
 
def _tier_to_source_type(tier: FallbackTier) -> SourceType:
    return {
        FallbackTier.TIER_1:  SourceType.EXACT_MATCH,
        FallbackTier.TIER_2:  SourceType.KEYWORD_MATCH,
        FallbackTier.TIER_3:  SourceType.BROAD_MATCH,
        FallbackTier.TIER_4:  SourceType.CATEGORY_FALLBACK,
        FallbackTier.NO_DATA: SourceType.NO_DATA,
    }[tier]
 
 
class ApiResponse(BaseModel):
    """
    [IMP-8] Uniform envelope for every endpoint. The actual payload goes
    in `data`; metadata lives at the top level for easy client parsing.
    """
    success:          bool
    request_id:       str
    latency_ms:       float
    source_type:      str                    # SourceType value
    confidence_score: Optional[Dict] = None  # ConfidenceScore.to_dict()
    warnings:         List[str] = Field(default_factory=list)
    data:             Optional[Any] = None
    step_timings:     Optional[Dict[str, float]] = None  # dev/debug only
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC REQUEST / INNER RESPONSE MODELS  (unchanged from v1)
# ─────────────────────────────────────────────────────────────────────────────
 
class ProductTrackerRequest(BaseModel):
    product_name: str
    category:     str
    source:       str
    base_cost:    float
    user_email:   Optional[str] = None
 
    @validator("product_name", "category")
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v.strip()
 
    @validator("base_cost")
    def positive_cost(cls, v: float) -> float:
        if v < 0:
            raise ValueError("base_cost must be >= 0")
        return v
 
 
class PricingInsights(BaseModel):
    recommended_price: float
    min_price:         float
    max_price:         float
    profit_margin:     float
    confidence:        str
    market_avg_price:  float = 0
    market_min_price:  float = 0
    market_max_price:  float = 0
 
 
class SalesInsights(BaseModel):
    estimated_monthly_sales: str
    estimated_daily_sales:   float
    market_demand:           str
 
 
class CompetitorInsights(BaseModel):
    total_competitors:     int
    avg_competitor_price:  float
    avg_competitor_rating: float
    top_competitor:        Optional[Dict[str, Any]]
 
 
class LocationInsight(BaseModel):
    country:      str
    market_share: str
    demand_level: str
 
 
class GapItem(BaseModel):
    gap_type:    str
    severity:    str
    icon:        str
    title:       str
    description: str
    action:      str
    count:       int = 0
 
 
class FinalVerdict(BaseModel):
    opportunity_score: int
    verdict_label:     str
    verdict_color:     str
    beat_actions:      List[str]
    improvements:      List[str]
    risks:             List[str]
    high_gaps_count:   int
    medium_gaps_count: int
 
 
class ProductTrackerData(BaseModel):
    """Inner payload nested inside ApiResponse.data for the analyze endpoint."""
    product_name:      str
    category:          str
    source:            str
    pricing:           PricingInsights
    sales:             SalesInsights
    competition:       CompetitorInsights
    location_insights: List[LocationInsight] = Field(default_factory=list)
    ai_strategy:       str
    market_gaps:       List[GapItem]         = Field(default_factory=list)
    final_verdict:     Optional[FinalVerdict] = None
    fallback_reason:   Optional[str] = None  # [IMP-7]
 
 
class AnalysisTrackRequest(BaseModel):
    increment: int = 1
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-2 / IMP-10]  HELPERS
# ─────────────────────────────────────────────────────────────────────────────
 
def _infinity_to_sentinel(value: Any, sentinel: int = -1) -> Any:
    return sentinel if value == float("inf") else value
 
 
def _validate_source(source: str) -> str:
    key = source.lower()
    if key not in _ALLOWED_SOURCES:
        raise ValidationError(
            f"Unknown source '{source}'.",
            detail={"allowed": list(_ALLOWED_SOURCES)},
        )
    return key
 
 
# ─────────────────────────────────────────────────────────────────────────────
# TEXT UTILITIES  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def _normalize(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9 ]", " ", t)
    return re.sub(r"\s+", " ", t).strip()
 
 
def _core_segment(product_name: str) -> str:
    core = product_name.split(",")[0].strip()
    core = re.sub(
        r'\b\d[\d\-]*\s*(kg|g|gm|gms|ml|l|ltr|litre|liter|'
        r'count|pack|pcs|pieces|units|inch|cm|mm|w|v|mah|gb|tb|mb)\b',
        '', core, flags=re.IGNORECASE,
    )
    core = re.sub(r'\([^)]{0,40}\)', '', core)
    return re.sub(r'\s+', ' ', core).strip()
 
 
def extract_keywords(product_name: str) -> List[str]:
    core   = _core_segment(product_name)
    tokens = _normalize(core).split()
    kws = [
        t for t in tokens
        if t not in STOPWORDS
        and len(t) > 1
        and not t.isdigit()
        and not re.match(r'^\d+[a-z]*$', t)
    ]
    kws.sort(key=len, reverse=True)
    return list(dict.fromkeys(kws))
 
 
def _keyword_overlap(title: str, core_kws: List[str]) -> float:
    if not core_kws:
        return 0.0
    t = _normalize(title)
    return sum(1 for kw in core_kws if kw in t) / len(core_kws)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# TF-IDF EMBEDDER  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
class _TFIDFEmbedder:
    def __init__(self, corpus: List[str]):
        self.vocab: Dict[str, int] = {}
        self.idf = np.array([])
        self._fit(corpus)
 
    def _tok(self, t: str) -> List[str]:
        return [x for x in _normalize(t).split() if len(x) > 1]
 
    def _fit(self, corpus: List[str]) -> None:
        N         = len(corpus)
        tokenized = [self._tok(d) for d in corpus]
        vocab     = sorted({tok for toks in tokenized for tok in toks})
        self.vocab = {t: i for i, t in enumerate(vocab)}
        V  = len(vocab)
        df = np.zeros(V, dtype=np.float32)
        for toks in tokenized:
            for tok in set(toks):
                if tok in self.vocab:
                    df[self.vocab[tok]] += 1
        self.idf = np.log((N + 1) / (df + 1)) + 1.0
 
    def transform(self, text: str) -> np.ndarray:
        if not self.vocab:
            return np.array([])
        V    = len(self.vocab)
        toks = self._tok(text)
        tf   = np.zeros(V, dtype=np.float32)
        cnt  = Counter(toks)
        tot  = max(len(toks), 1)
        for tok, c in cnt.items():
            if tok in self.vocab:
                tf[self.vocab[tok]] = c / tot
        vec  = tf * self.idf
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec
 
 
def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    if a.size == 0 or b.size == 0:
        return 0.0
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    return float(np.dot(a, b) / (na * nb)) if na > 0 and nb > 0 else 0.0
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-6]  DB HELPERS WITH TIMEOUT
# ─────────────────────────────────────────────────────────────────────────────
 
@contextlib.contextmanager
def _db_timeout(db: Session, timeout_ms: int = DB_QUERY_TIMEOUT_MS):
    """
    [IMP-6] Sets PostgreSQL statement_timeout for the duration of the block.
    Raises TimeoutError (our AppError subclass) on cancellation.
    """
    try:
        db.execute(text(f"SET LOCAL statement_timeout = {timeout_ms}"))
        yield
    except Exception as exc:
        msg = str(exc).lower()
        if "canceling" in msg or "timeout" in msg or "statement_timeout" in msg:
            raise TimeoutError(
                f"DB query exceeded {timeout_ms}ms limit.",
                detail={"timeout_ms": timeout_ms},
            ) from exc
        raise
 
 
def _build_sql(source: str, kw_sql: str, cat_sql: str, price_sql: str) -> str:
    key   = source.lower()
    table = _ALLOWED_SOURCES[key]
    if key == "amazon":
        return f"""
            SELECT product_title, category_name,
                   product_price_numeric       AS price,
                   product_star_rating_numeric AS rating,
                   product_num_ratings         AS reviews,
                   sales_volume, country,
                   is_best_seller, is_amazon_choice, is_prime,
                   avg_price, min_price, max_price,
                   NULL::text  AS brand,
                   NULL::text  AS stock_status,
                   NULL::float AS estimated_sales
            FROM {table}
            WHERE {kw_sql} {cat_sql} {price_sql}
              AND product_price_numeric > 0
              AND product_star_rating_numeric > 0
            ORDER BY product_num_ratings DESC
            LIMIT :limit
        """
    return f"""
        SELECT product_title, category_name,
               product_price        AS price,
               product_star_rating  AS rating,
               product_review_count AS reviews,
               sales_volume, country,
               FALSE AS is_best_seller, FALSE AS is_amazon_choice, FALSE AS is_prime,
               avg_price, min_price, max_price,
               brand, stock_status, estimated_sales
        FROM {table}
        WHERE {kw_sql} {cat_sql} {price_sql}
          AND product_price > 0
          AND product_star_rating > 0
        ORDER BY product_review_count DESC
        LIMIT :limit
    """
 
 
def _db_fetch(
    db: Session,
    keywords: List[str],
    source: str,
    limit: int,
    price_lo: Optional[float] = None,
    price_hi: Optional[float] = None,
    category: Optional[str] = None,
) -> List[Dict]:
    if not keywords:
        return []
    params: Dict[str, Any] = {"limit": limit}
    kw_parts = []
    for i, kw in enumerate(keywords[:10]):
        pk = f"kw{i}"
        params[pk] = f"%{kw}%"
        kw_parts.append(f"LOWER(product_title) LIKE :{pk}")
    kw_sql = "(" + " OR ".join(kw_parts) + ")"
 
    cat_sql = ""
    if category:
        params["cat"] = f"%{_normalize(category)}%"
        cat_sql = "AND LOWER(category_name) LIKE :cat"
 
    price_sql = ""
    if price_lo is not None and price_hi is not None:
        price_col = _PRICE_COL[source]
        params["plo"] = price_lo
        params["phi"] = price_hi
        price_sql = f"AND {price_col} BETWEEN :plo AND :phi"
 
    sql = _build_sql(source, kw_sql, cat_sql, price_sql)
    try:
        with _db_timeout(db):
            rows = db.execute(text(sql), params).fetchall()
        return [dict(r._mapping) for r in rows]
    except (TimeoutError, AppError):
        raise
    except Exception:
        log.exception("db_fetch_error", source=source, keywords=keywords)
        raise DatabaseError("Failed to fetch products from database.")
 
 
def _db_fetch_category_only(
    db: Session, category: str, source: str, limit: int = 300,
) -> List[Dict]:
    table = _ALLOWED_SOURCES[source]
    params = {"cat": f"%{_normalize(category)}%", "limit": limit}
    if source == "amazon":
        sql = f"""
            SELECT product_title, category_name,
                   product_price_numeric       AS price,
                   product_star_rating_numeric AS rating,
                   product_num_ratings         AS reviews,
                   sales_volume, country,
                   is_best_seller, is_amazon_choice, is_prime,
                   avg_price, min_price, max_price,
                   NULL::text  AS brand,
                   NULL::text  AS stock_status,
                   NULL::float AS estimated_sales
            FROM {table}
            WHERE LOWER(category_name) LIKE :cat
              AND product_price_numeric > 0 AND product_star_rating_numeric > 0
            ORDER BY product_num_ratings DESC LIMIT :limit
        """
    else:
        sql = f"""
            SELECT product_title, category_name,
                   product_price        AS price,
                   product_star_rating  AS rating,
                   product_review_count AS reviews,
                   sales_volume, country,
                   FALSE AS is_best_seller, FALSE AS is_amazon_choice, FALSE AS is_prime,
                   avg_price, min_price, max_price,
                   brand, stock_status, estimated_sales
            FROM {table}
            WHERE LOWER(category_name) LIKE :cat
              AND product_price > 0 AND product_star_rating > 0
            ORDER BY product_review_count DESC LIMIT :limit
        """
    try:
        with _db_timeout(db):
            rows = db.execute(text(sql), params).fetchall()
        return [dict(r._mapping) for r in rows]
    except (TimeoutError, AppError):
        raise
    except Exception:
        log.exception("db_category_fetch_error", category=category, source=source)
        raise DatabaseError("Failed to fetch category products from database.")
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PRICE BAND + OUTLIER REMOVAL  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def _price_band(base_cost: float, candidates: Optional[List[Dict]] = None) -> Tuple[float, float]:
    if candidates:
        db_avg = float(candidates[0].get("avg_price") or 0)
        if db_avg > 0:
            return db_avg * 0.25, db_avg * 4.0
        prices = [float(p.get("price", 0) or 0) for p in candidates if p.get("price", 0) > 0]
        if prices:
            med = float(np.median(prices))
            return med * 0.20, med * 5.0
    if base_cost > 0:
        return base_cost * 0.20, base_cost * 5.0
    return 1.0, 999_999.0
 
 
def _remove_price_outliers(products: List[Dict]) -> List[Dict]:
    prices = [float(p.get("price", 0) or 0) for p in products]
    valid  = [v for v in prices if v > 0]
    if len(valid) < 4:
        return products
    arr     = np.array(valid)
    q1, q3 = float(np.percentile(arr, 25)), float(np.percentile(arr, 75))
    iqr     = q3 - q1
    lo      = max(1.0, q1 - 1.5 * iqr)
    hi      = q3 + 1.5 * iqr
    cleaned = [p for p in products if lo <= float(p.get("price", 0) or 0) <= hi]
    return cleaned if len(cleaned) >= max(3, int(len(products) * 0.40)) else products
 
 
# ─────────────────────────────────────────────────────────────────────────────
# MULTI-FACTOR SCORE + SEMANTIC RERANK  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def _multi_factor_score(p: Dict, sim: float, core_kws: List[str]) -> float:
    title        = str(p.get("product_title", ""))
    reviews      = float(p.get("reviews", 0) or 0)
    rating       = float(p.get("rating", 0) or 0)
    overlap      = _keyword_overlap(title, core_kws)
    kw_bonus     = overlap * 0.25
    review_bonus = min(0.10, math.log1p(reviews) / 100)
    rating_bonus = max(0.0, (rating - 3.0) / 30.0)
    spam_penalty = 0.05 if len(title) > 130 else 0.0
    return round(min(1.0, max(0.0, sim + kw_bonus + review_bonus + rating_bonus - spam_penalty)), 4)
 
 
def _semantic_rerank(
    candidates: List[Dict],
    product_name: str,
    core_kws: List[str],
    threshold: float,
    label: str = "",
) -> List[Dict]:
    if not candidates:
        return []
    titles   = [str(p.get("product_title", "")) for p in candidates]
    corpus   = [product_name] + titles
    embedder = _TFIDFEmbedder(corpus)
    q_vec    = embedder.transform(product_name)
    scored: List[Tuple[Dict, float]] = []
    for p, title in zip(candidates, titles):
        sim = _cosine(q_vec, embedder.transform(title))
        if sim >= threshold:
            scored.append((p, _multi_factor_score(p, sim, core_kws)))
    scored.sort(key=lambda x: x[1], reverse=True)
    result = [p for p, _ in scored]
    log.debug("rerank", label=label, threshold=threshold, before=len(candidates), after=len(result))
    return result
 
 
def _adaptive_threshold(product_name: str, tier: str) -> float:
    words = len(_core_segment(product_name).split())
    if tier == "strict":
        return 0.50 if words > 6 else (0.42 if words > 3 else 0.32)
    elif tier == "moderate":
        return 0.35 if words > 6 else (0.26 if words > 3 else 0.18)
    return 0.18 if words > 6 else 0.10
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-7]  FALLBACK GOVERNANCE
# ─────────────────────────────────────────────────────────────────────────────
 
@dataclass
class FallbackPolicy:
    """
    [IMP-7] Encodes when Tier 4 (category-only) fallback is allowed and
    generates a human-readable reason to surface in the response.
    """
    allow_tier4:       bool = True
    min_category_rows: int  = 10   # category must have at least N products
    warn_on_tier3:     bool = True
    warn_on_tier4:     bool = True
 
    def should_allow_tier4(self, category_row_count: int) -> Tuple[bool, Optional[str]]:
        if not self.allow_tier4:
            return False, "Category fallback is disabled by policy."
        if category_row_count < self.min_category_rows:
            return False, (
                f"Category fallback skipped: only {category_row_count} products "
                f"in category (minimum {self.min_category_rows} required)."
            )
        return True, None
 
    def fallback_warning(self, tier: FallbackTier) -> Optional[str]:
        if tier == FallbackTier.TIER_3 and self.warn_on_tier3:
            return (
                "BROAD MATCH: Product not found exactly. Results are based on the "
                "single most relevant keyword. Estimates are approximate."
            )
        if tier == FallbackTier.TIER_4 and self.warn_on_tier4:
            return (
                "CATEGORY FALLBACK: Product not found in the database. "
                "Analysis is based on the category market as a whole. "
                "Treat all estimates as directional only."
            )
        return None
 
 
DEFAULT_FALLBACK_POLICY = FallbackPolicy()
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-7]  MASTER: get_similar_products  — returns tier alongside results
# ─────────────────────────────────────────────────────────────────────────────
 
def get_similar_products(
    db: Session,
    product_name: str,
    category: str,
    source: str,
    base_cost: float,
    max_results: int = 200,
    policy: FallbackPolicy = DEFAULT_FALLBACK_POLICY,
) -> Tuple[List[Dict], FallbackTier]:
    """
    Returns (products, tier_used).
    Tier is always surfaced so callers can attach it to confidence scoring
    and the API response.
    """
    log.info("pipeline_start", product=product_name, category=category, source=source)
 
    core_kws = extract_keywords(product_name)
 
    if not core_kws:
        log.info("pipeline_no_keywords")
        raw = _db_fetch_category_only(db, category, source, limit=300)
        allow, reason = policy.should_allow_tier4(len(raw))
        if not allow:
            log.warning("tier4_blocked", reason=reason)
            return [], FallbackTier.NO_DATA
        result = _semantic_rerank(raw, product_name, [], 0.0, "T4-no-kw")
        if len(result) >= MIN_MATCHED:
            return _finalize(result, max_results), FallbackTier.TIER_4
        return [], FallbackTier.NO_DATA
 
    # Tier 1
    raw_t1 = _db_fetch(db, core_kws, source, limit=500, category=category)
    lo, hi = _price_band(base_cost, raw_t1)
    raw_t1 = [p for p in raw_t1 if lo <= float(p.get("price", 0) or 0) <= hi]
    result = _semantic_rerank(raw_t1, product_name, core_kws,
                              _adaptive_threshold(product_name, "strict"), "T1")
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_1
 
    # Tier 2
    raw_t2 = _db_fetch(db, core_kws, source, limit=600, price_lo=lo, price_hi=hi)
    result = _semantic_rerank(raw_t2, product_name, core_kws,
                              _adaptive_threshold(product_name, "moderate"), "T2")
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_2
 
    # Tier 3
    best_kw  = [core_kws[0]]
    lo3, hi3 = (base_cost * 0.10, base_cost * 10.0) if base_cost > 0 else (1.0, 1_000_000.0)
    raw_t3   = _db_fetch(db, best_kw, source, limit=400, price_lo=lo3, price_hi=hi3)
    result   = _semantic_rerank(raw_t3, product_name, core_kws,
                                _adaptive_threshold(product_name, "loose"), "T3")
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_3
 
    # Tier 4
    raw_t4 = _db_fetch_category_only(db, category, source, limit=300)
    allow, reason = policy.should_allow_tier4(len(raw_t4))
    if not allow:
        log.warning("tier4_blocked", reason=reason)
        return [], FallbackTier.NO_DATA
    result = _semantic_rerank(raw_t4, product_name, core_kws, 0.0, "T4-cat")
    if len(result) >= MIN_MATCHED:
        return _finalize(result, max_results), FallbackTier.TIER_4
 
    return [], FallbackTier.NO_DATA
 
 
def _finalize(products: List[Dict], max_results: int) -> List[Dict]:
    cleaned = _remove_price_outliers(products)
    if len(cleaned) < MIN_MATCHED:
        cleaned = products
    result = cleaned[:max_results]
    log.info("pipeline_final", count=len(result))
    return result
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PRICING ENGINE  (unchanged logic; uses AppError hierarchy)
# ─────────────────────────────────────────────────────────────────────────────
 
def analyze_pricing(products: List[Dict], base_cost: float) -> Dict:
    raw_prices: List[float] = []
    weighted_prices: List[float] = []
    db_avg_prices: List[float] = []
 
    for p in products:
        price   = float(p.get("price", 0) or 0)
        reviews = max(1, int(p.get("reviews", 1) or 1))
        if price > 0:
            raw_prices.append(price)
            weight = max(1, int(1 + math.log1p(reviews) * 2))
            weighted_prices.extend([price] * weight)
        db_avg = float(p.get("avg_price") or 0)
        if db_avg > 0:
            db_avg_prices.append(db_avg)
 
    if len(raw_prices) < 3:
        return _empty_pricing()
 
    arr     = np.array(raw_prices)
    q1, q3 = float(np.percentile(arr, 25)), float(np.percentile(arr, 75))
    iqr     = q3 - q1
    lo      = max(1.0, q1 - 1.5 * iqr)
    hi      = q3 + 1.5 * iqr
    clean   = arr[(arr >= lo) & (arr <= hi)]
    if len(clean) < 3:
        clean = arr
 
    w_clean = [p for p in weighted_prices if lo <= p <= hi] or list(clean)
    w_med   = float(np.sort(np.array(w_clean))[len(w_clean) // 2])
 
    computed_avg = float(np.mean(clean))
    if db_avg_prices:
        db_avg  = float(np.median(db_avg_prices))
        mkt_avg = (computed_avg * 0.6 + db_avg * 0.4) if db_avg > 0 else computed_avg
    else:
        mkt_avg = computed_avg
 
    if mkt_avg <= 0:
        return _empty_pricing()
 
    mkt_min = float(np.percentile(clean, 10))
    mkt_max = float(np.percentile(clean, 90))
    rec     = round(min(w_med, mkt_avg * 1.05))
    profit  = rec - base_cost if base_cost > 0 else rec
    margin  = (profit / rec * 100) if rec > 0 else 0.0
    n       = len(clean)
    cv      = float(np.std(clean) / mkt_avg)
 
    if   n >= 30 and cv < 0.40 and margin >= 20: confidence = "High"
    elif n >= 15 and cv < 0.60 and margin >= 10: confidence = "Medium"
    elif margin < 0:                              confidence = "Critical"
    else:                                         confidence = "Low"
 
    return {
        "recommended_price": rec,
        "min_price":         round(mkt_min),
        "max_price":         round(mkt_max),
        "profit_margin":     round(margin, 1),
        "confidence":        confidence,
        "market_avg_price":  round(mkt_avg),
        "market_min_price":  round(mkt_min),
        "market_max_price":  round(mkt_max),
        "_sample_size":      n,
    }
 
 
def _empty_pricing() -> Dict:
    return {
        "recommended_price": 0, "min_price": 0, "max_price": 0,
        "profit_margin": 0.0, "confidence": "Low",
        "market_avg_price": 0, "market_min_price": 0, "market_max_price": 0,
        "_sample_size": 0,
    }
 
def normalize_output(data: dict) -> dict:
    return data
 
def validate_cost_against_market(base_cost: float, products: List[Dict]) -> Optional[str]:
    prices = [float(p.get("price", 0) or 0) for p in products if p.get("price", 0) > 0]
    if not prices:
        return None
    arr     = np.array(prices)
    mkt_max = float(np.max(arr))
    p95     = float(np.percentile(arr, 95))
    mkt_avg = float(np.mean(arr))
    if base_cost > mkt_max:
        return f"Your cost (Rs.{base_cost:,.0f}) exceeds the highest market price (Rs.{mkt_max:,.0f}). Profit is impossible."
    if base_cost > p95:
        return f"Cost (Rs.{base_cost:,.0f}) is above the 95th-percentile market price (Rs.{p95:,.0f}). Margins will be critically thin."
    if base_cost > mkt_avg:
        return f"Cost (Rs.{base_cost:,.0f}) exceeds market average (Rs.{mkt_avg:,.0f}). Very limited profitability."
    return None
 
 
# ─────────────────────────────────────────────────────────────────────────────
# SALES ESTIMATION  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def parse_sales_volume(sales_text: str) -> float:
    if not sales_text:
        return 0.0
    s = str(sales_text).lower().replace(",", "").strip()
    s = re.sub(r'bought.*$', '', s).strip()
    for pattern, mult in [
        (r"([\d.]+)\s*m\b", 1_000_000),
        (r"([\d.]+)\s*k\b", 1_000),
        (r"([\d.]+)",        1),
    ]:
        m = re.search(pattern, s)
        if m:
            try:
                return float(m.group(1)) * mult
            except ValueError:
                pass
    return 0.0
 
 
def _parse_monthly_sales_string(monthly_str: str, daily_fallback: float) -> float:
    try:
        cleaned = monthly_str.replace(",", "").strip()
        if " - " in cleaned:
            parts = cleaned.split(" - ")
            return (float(parts[0]) + float(parts[1])) / 2.0
        return float(cleaned)
    except (ValueError, IndexError):
        return max(0.0, daily_fallback) * 30
 
 
def _category_cap_from_db(db: Session, category: str, source: str) -> int:
    table      = _ALLOWED_SOURCES.get(source, "rapidapi_amazon_products")
    review_col = "product_num_ratings" if source == "amazon" else "product_review_count"
    try:
        sql = f"""
            SELECT PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY {review_col})
            FROM {table}
            WHERE LOWER(category_name) LIKE :cat AND {review_col} > 0
        """
        with _db_timeout(db, timeout_ms=3_000):
            p75 = db.execute(text(sql), {"cat": f"%{_normalize(category)}%"}).scalar()
        if p75 and float(p75) > 0:
            market_monthly = (float(p75) / REVIEW_RATE) / AVG_PRODUCT_AGE_MO
            return max(30, min(2000, int(market_monthly * NEW_SELLER_SHARE)))
    except (TimeoutError, AppError):
        log.warning("category_cap_timeout", category=category)
    except Exception:
        log.exception("category_cap_error", category=category)
    return 200
 
 
def analyze_sales_potential(
    products: List[Dict],
    source: str,
    base_cost: float,
    recommended_price: float,
    category: str,
    db: Optional[Session] = None,
) -> Dict:
    if not products:
        return {"estimated_monthly_sales": "0 - 0", "estimated_daily_sales": 0.0, "market_demand": "Unknown"}
 
    sales_data: List[float] = []
    review_counts: List[float] = []
    prices: List[float] = []
 
    for p in products:
        es = float(p.get("estimated_sales") or 0)
        if es > 0:
            sales_data.append(es)
        else:
            sv = parse_sales_volume(str(p.get("sales_volume", "") or ""))
            if sv > 0:
                sales_data.append(sv)
        rev = float(p.get("reviews") or 0)
        if rev > 0:
            review_counts.append(rev)
        pr = float(p.get("price", 0) or 0)
        if pr > 0:
            prices.append(pr)
 
    n         = len(products)
    avg_price = max(float(np.mean(prices)) if prices else 1.0, 1.0)
    total_rev = float(np.sum(review_counts)) if review_counts else 0.0
    med_rev   = float(np.median(review_counts)) if review_counts else 0.0
    cap       = _category_cap_from_db(db, category, source) if db else 200
 
    if sales_data:
        new_seller_est = float(np.median(sales_data)) * NEW_SELLER_SHARE
    elif total_rev > 0:
        implied_buyers = total_rev / REVIEW_RATE
        share          = min(0.08, NEW_SELLER_SHARE * (50 / max(50, n)))
        new_seller_est = (implied_buyers / AVG_PRODUCT_AGE_MO) * share
    else:
        new_seller_est = max(5.0, n * 0.3)
 
    if avg_price > 0 and recommended_price > 0:
        delta = (recommended_price - avg_price) / avg_price * 100
        pf = 1.40 if delta <= -20 else (
             1.20 if delta <= -10 else (
             1.05 if delta <=   0 else (
             0.90 if delta <=  15 else (
             0.75 if delta <=  30 else 0.55))))
    else:
        pf = 1.0
 
    est  = max(1.0, min(new_seller_est * pf, cap))
    low  = max(1, int(est * 0.80))
    high = max(low + 1, int(est * 1.20))
    daily = round(est / 30.0, 1)
    marker = float(np.median(sales_data)) if sales_data else med_rev
    demand = "High" if marker > 5000 else ("Medium" if marker > 500 else "Low")
 
    return {
        "estimated_monthly_sales": f"{low:,} - {high:,}",
        "estimated_daily_sales":   daily,
        "market_demand":           demand,
    }
 
 
# ─────────────────────────────────────────────────────────────────────────────
# COMPETITION ANALYSIS  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def analyze_competition(
    products: List[Dict],
    category: Optional[str] = None,
    product_keywords: Optional[List[str]] = None,
) -> Dict:
    if not products:
        return {"total_competitors": 0, "avg_competitor_price": 0.0,
                "avg_competitor_rating": 0.0, "top_competitor": None}
    pool = products
    if category:
        cat_pool = [p for p in products if category.lower() in str(p.get("category_name", "")).lower()]
        pool = cat_pool if len(cat_pool) >= 5 else products
 
    prices  = [float(p.get("price", 0) or 0) for p in pool if p.get("price", 0) > 0]
    ratings = [float(p.get("rating", 0) or 0) for p in pool if p.get("rating", 0) > 0]
    if prices:
        arr = np.array(prices)
        q1, q3 = np.percentile(arr, 15), np.percentile(arr, 85)
        prices = [p for p in prices if q1 * 0.4 <= p <= q3 * 2.5]
 
    avg_price  = round(float(np.mean(prices)), 2)  if prices  else 0.0
    avg_rating = round(float(np.mean(ratings)), 2) if ratings else 0.0
 
    kw_pool = pool
    if product_keywords:
        kw_matched = [p for p in pool if any(kw in _normalize(str(p.get("product_title", ""))) for kw in product_keywords)]
        if kw_matched:
            kw_pool = kw_matched
 
    top_competitor = None
    max_score      = 0
    for p in kw_pool:
        reviews = float(p.get("reviews", 0) or 0)
        rating  = float(p.get("rating", 0) or 0)
        score   = reviews * rating
        if score > max_score:
            max_score = score
            brand_str = f" ({p.get('brand', '')})" if p.get("brand") else ""
            top_competitor = {
                "name":    str(p.get("product_title", ""))[:70] + brand_str,
                "price":   float(p.get("price", 0) or 0),
                "rating":  rating,
                "reviews": int(reviews),
            }
    return {
        "total_competitors":     len(pool),
        "avg_competitor_price":  avg_price,
        "avg_competitor_rating": avg_rating,
        "top_competitor":        top_competitor,
    }
 
 
# ─────────────────────────────────────────────────────────────────────────────
# MARKET GAP DETECTION  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def detect_market_gaps(
    products: List[Dict],
    pricing: Dict,
    base_cost: float,
    product_keywords: List[str],
    source: str = "amazon",
) -> List[Dict]:
    if not products:
        return []
    gaps      = []
    rec_price = pricing["recommended_price"]
    mkt_avg   = pricing["market_avg_price"]
    mkt_min   = pricing["market_min_price"]
    relevant  = [p for p in products if any(kw in _normalize(str(p.get("product_title", ""))) for kw in product_keywords)]
    if not relevant:
        relevant = products
    total = max(len(relevant), 1)
 
    low_r = [p for p in relevant if 0 < float(p.get("rating", 0) or 0) < 3.5]
    mid_r = [p for p in relevant if 3.5 <= float(p.get("rating", 0) or 0) < 4.0]
    if len(low_r) >= max(2, total * 0.15):
        pct = round(len(low_r) / total * 100)
        gaps.append({"gap_type":"rating_gap","severity":"High","icon":"STAR","title":"Low-Rated Competitors","description":f"{pct}% of competitors ({len(low_r)} products) have ratings below 3.5 stars.","action":"Launch with quality focus, better packaging, accurate description, fast dispatch.","count":len(low_r)})
    elif len(mid_r) >= max(3, total * 0.25):
        pct = round(len(mid_r) / total * 100)
        gaps.append({"gap_type":"rating_gap","severity":"Medium","icon":"STAR","title":"Mediocre Ratings Market","description":f"{pct}% of competitors ({len(mid_r)} products) sit between 3.5 and 4.0 stars.","action":"Invest in product quality and post-purchase support to hit 4.3 stars or higher.","count":len(mid_r)})
 
    overpriced = [p for p in relevant if float(p.get("price", 0) or 0) > rec_price * 1.20]
    if len(overpriced) >= max(2, total * 0.10):
        pct    = round(len(overpriced) / total * 100)
        avg_op = float(np.mean([float(p.get("price", 0)) for p in overpriced]))
        gaps.append({"gap_type":"price_gap","severity":"High","icon":"MONEY","title":"Overpriced Competitors","description":f"{pct}% of competitors are priced Rs.{round(avg_op - rec_price)}+ above optimal.","action":f"Price at Rs.{rec_price:,} and highlight same quality, better price.","count":len(overpriced)})
 
    vulnerable = [p for p in relevant if float(p.get("price", 0) or 0) >= mkt_avg * 0.9 and int(p.get("reviews", 0) or 0) < 50]
    if len(vulnerable) >= max(2, total * 0.15):
        gaps.append({"gap_type":"review_gap","severity":"High","icon":"REVIEW","title":"Weak Review Count","description":f"{len(vulnerable)} competitors charge market-rate prices but have fewer than 50 reviews.","action":"Use a launch campaign to generate 30 to 50 reviews in 45 days.","count":len(vulnerable)})
 
    floor = mkt_min * 1.10
    if base_cost > 0 and base_cost < floor and (floor - base_cost) > 50:
        margin_at_floor = round((floor - base_cost) / floor * 100, 1)
        gaps.append({"gap_type":"price_floor_gap","severity":"Medium","icon":"DOWN","title":"Price Floor Opportunity","description":f"Lowest viable competitor price Rs.{round(floor):,}. Your cost gives {margin_at_floor}% margin.","action":f"Penetration price Rs.{round(floor * 0.95):,} for 3 months, then raise to Rs.{rec_price:,}.","count":0})
 
    src = source.lower()
    if src == "amazon":
        non_prime   = [p for p in relevant if not p.get("is_prime") and not p.get("is_amazon_choice")]
        bestsellers = [p for p in relevant if p.get("is_best_seller") or p.get("is_amazon_choice")]
        if non_prime and len(non_prime) >= total * 0.40:
            gaps.append({"gap_type":"prime_gap","severity":"Medium","icon":"TRUCK","title":"Prime or Fulfilled Gap","description":f"{round(len(non_prime)/total*100)}% of listings are not Prime-eligible.","action":"Enroll in FBA from day 1 for instant Prime badge advantage.","count":len(non_prime)})
        if len(bestsellers) == 0:
            gaps.append({"gap_type":"bestseller_gap","severity":"High","icon":"TROPHY","title":"No Dominant Bestseller","description":"No current bestseller or Amazon Choice in this segment.","action":"Aggressive launch: 15% below market plus high ad spend weeks 1 to 4.","count":0})
        elif len(bestsellers) <= 2:
            gaps.append({"gap_type":"bestseller_gap","severity":"Medium","icon":"TROPHY","title":"Thin Bestseller Coverage","description":f"Only {len(bestsellers)} product(s) hold bestseller or Choice badges.","action":"Study badge holder listing, outspend on ads in month 2.","count":len(bestsellers)})
    else:
        oos_kws = {"out of stock","oos","unavailable","currently unavailable"}
        oos = [p for p in relevant if any(k in str(p.get("stock_status","")).lower() for k in oos_kws)]
        if len(oos) >= max(2, total * 0.10):
            gaps.append({"gap_type":"stock_gap","severity":"High","icon":"BOX","title":"Competitor Stock Gaps","description":f"{round(len(oos)/total*100)}% of competitors ({len(oos)} listings) are out of stock.","action":"Stock aggressively now to capture demand while competitors are OOS.","count":len(oos)})
        high_review = [p for p in relevant if int(p.get("reviews", 0) or 0) > 1000]
        if len(high_review) == 0:
            gaps.append({"gap_type":"authority_gap","severity":"High","icon":"TROPHY","title":"No Review Authority","description":"No competitor has more than 1000 reviews. Category leader position is up for grabs.","action":"Invest heavily in reviews in months 1 to 3.","count":0})
 
    gaps.sort(key=lambda g: {"High": 0, "Medium": 1, "Low": 2}.get(g["severity"], 3))
    return gaps
 
 
# ─────────────────────────────────────────────────────────────────────────────
# FINAL VERDICT  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def generate_final_verdict(
    pricing: Dict, sales: Dict, competition: Dict,
    gaps: List[Dict], base_cost: float,
    product_name: str, category: str,
    location_insights: Optional[List] = None,
) -> Dict:
    margin      = pricing["profit_margin"]
    rec_price   = pricing["recommended_price"]
    mkt_avg     = pricing["market_avg_price"]
    competitors = competition["total_competitors"]
    avg_rating  = competition["avg_competitor_rating"]
    demand      = sales["market_demand"]
    confidence  = pricing["confidence"]
    high_gaps   = [g for g in gaps if g["severity"] == "High"]
    medium_gaps = [g for g in gaps if g["severity"] == "Medium"]
 
    margin_score = min(40, max(0, (margin / 50) * 40))
    demand_score = {"High": 20, "Medium": 12, "Low": 4, "Unknown": 0}.get(demand, 0)
    gap_score    = min(20, len(high_gaps) * 7 + len(medium_gaps) * 3)
    comp_score   = 20 if competitors < 20 else (15 if competitors < 50 else (8 if competitors < 100 else 3))
    opportunity_score = max(0, min(100, round(margin_score + demand_score + gap_score + comp_score)))
 
    if   opportunity_score >= 75: verdict_label, verdict_color = "Strong Opportunity",     "green"
    elif opportunity_score >= 55: verdict_label, verdict_color = "Viable with Strategy",   "blue"
    elif opportunity_score >= 35: verdict_label, verdict_color = "Risky Proceed Carefully","orange"
    else:                         verdict_label, verdict_color = "Not Recommended",         "red"
 
    beat_actions = []
    if margin >= 30 and mkt_avg > 0:
        underprice = round(mkt_avg * 0.92)
        beat_actions.append(f"Price at Rs.{underprice:,} (8% below market avg Rs.{mkt_avg:,}) to capture search rank in the first 60 days, then raise to Rs.{rec_price:,} after 30 reviews.")
    elif margin >= 15:
        beat_actions.append(f"Match market price at Rs.{rec_price:,} and win on listing quality such as better images, video, and bullet points instead of a price war.")
    else:
        beat_actions.append(f"Your margin ({margin:.1f}%) is too thin for price competition. Focus on a niche variant or bundle to justify a higher price.")
 
    rating_gap = next((g for g in gaps if g["gap_type"] == "rating_gap"), None)
    if rating_gap:
        beat_actions.append(f"Exploit rating gap: {rating_gap['description']} Action: {rating_gap['action']}")
    elif avg_rating > 0:
        beat_actions.append(f"Market avg rating is {avg_rating:.1f} stars. Aim for {min(5.0, avg_rating + 0.4):.1f} stars or higher with a setup guide and follow-up insert card.")
 
    review_gap = next((g for g in gaps if g["gap_type"] == "review_gap"), None)
    beat_actions.append(review_gap["action"] if review_gap else "Run a 30-day Review Sprint: sell at break-even to 20 to 30 buyers via deal sites, then follow up for reviews.")
 
    improvements = []
    if margin < 20:
        improvements.append(f"Renegotiate cost: at Rs.{base_cost:,.0f} margin is only {margin:.1f}%. Need cost at or below Rs.{round(rec_price * 0.65):,} for a sustainable 35% margin.")
    if competitors > 80:
        improvements.append(f"Differentiate: {competitors} sellers exist. Add 1 unique feature such as a color variant, bundle, extended warranty, or regional language pack.")
    if not high_gaps and not medium_gaps:
        improvements.append("Market is fairly healthy with no obvious gaps. Focus on superior listing quality and faster shipping.")
    if not improvements:
        improvements.append("No critical pre-launch blockers identified.")
 
    risks = []
    if margin < 10:     risks.append("Critical margin, unsustainable after platform fees")
    if competitors > 150: risks.append("Hyper-competitive, requires significant daily ad spend to rank")
    if confidence == "Critical": risks.append("Confidence critical, treat all projections as estimates")
    if demand == "Low": risks.append("Low market demand, total addressable market may be small")
    if margin < 25 and competitors > 80: risks.append("Thin margin plus high competition equals low tolerance for pricing errors")
 
    return {
        "opportunity_score": opportunity_score,
        "verdict_label":     verdict_label,
        "verdict_color":     verdict_color,
        "beat_actions":      beat_actions,
        "improvements":      improvements,
        "risks":             risks,
        "high_gaps_count":   len(high_gaps),
        "medium_gaps_count": len(medium_gaps),
    }
 
 
# ─────────────────────────────────────────────────────────────────────────────
# LOCATION INSIGHTS  (cached)
# ─────────────────────────────────────────────────────────────────────────────
 
def get_rule_based_locations(category: str, avg_price: float) -> List[LocationInsight]:
    cat = category.lower()
    if any(t in cat for t in ["electronic","mobile","laptop","computer","gadget","tech"]):
        locs = ([("Bangalore, Karnataka",20,"Very High"),("Hyderabad, Telangana",18,"High"),("Pune, Maharashtra",16,"High"),("Gurgaon, Haryana",15,"High"),("Chennai, Tamil Nadu",14,"High"),("Noida, Uttar Pradesh",17,"Medium")] if avg_price > 5000
                else [("Delhi, Delhi",20,"Very High"),("Mumbai, Maharashtra",18,"High"),("Kolkata, West Bengal",16,"High"),("Jaipur, Rajasthan",15,"Medium"),("Lucknow, Uttar Pradesh",16,"Medium"),("Ahmedabad, Gujarat",15,"Medium")])
    elif any(t in cat for t in ["baby","infant","diaper","kids","child","toy"]):
        locs = [("Delhi, Delhi",20,"Very High"),("Mumbai, Maharashtra",19,"High"),("Bangalore, Karnataka",17,"High"),("Hyderabad, Telangana",15,"High"),("Pune, Maharashtra",15,"Medium"),("Chennai, Tamil Nadu",14,"Medium")]
    elif any(t in cat for t in ["fashion","cloth","apparel","wear","dress","shirt"]):
        locs = ([("Mumbai, Maharashtra",22,"Very High"),("Delhi, Delhi",20,"Very High"),("Bangalore, Karnataka",17,"High"),("Kolkata, West Bengal",14,"High"),("Hyderabad, Telangana",14,"Medium"),("Pune, Maharashtra",13,"Medium")] if avg_price > 2000
                else [("Tiruppur, Tamil Nadu",20,"Very High"),("Ludhiana, Punjab",18,"High"),("Surat, Gujarat",17,"High"),("Kanpur, Uttar Pradesh",15,"Medium"),("Erode, Tamil Nadu",15,"Medium"),("Ahmedabad, Gujarat",15,"Medium")])
    elif any(t in cat for t in ["health","medicine","pharma","supplement","vitamin"]):
        locs = [("Mumbai, Maharashtra",21,"Very High"),("Delhi, Delhi",19,"High"),("Bangalore, Karnataka",17,"High"),("Chennai, Tamil Nadu",15,"High"),("Hyderabad, Telangana",14,"Medium"),("Kolkata, West Bengal",14,"Medium")]
    elif any(t in cat for t in ["home","kitchen","furniture","decor","appliance"]):
        locs = [("Mumbai, Maharashtra",19,"Very High"),("Delhi, Delhi",18,"High"),("Bangalore, Karnataka",16,"High"),("Pune, Maharashtra",15,"High"),("Hyderabad, Telangana",16,"Medium"),("Chennai, Tamil Nadu",16,"Medium")]
    elif any(t in cat for t in ["beauty","cosmetic","skincare","makeup"]):
        locs = [("Mumbai, Maharashtra",21,"Very High"),("Delhi, Delhi",19,"High"),("Bangalore, Karnataka",17,"High"),("Kolkata, West Bengal",15,"High"),("Hyderabad, Telangana",14,"Medium"),("Chennai, Tamil Nadu",14,"Medium")]
    else:
        locs = ([("Mumbai, Maharashtra",20,"Very High"),("Delhi, Delhi",19,"High"),("Bangalore, Karnataka",18,"High"),("Pune, Maharashtra",15,"High"),("Hyderabad, Telangana",14,"Medium"),("Chennai, Tamil Nadu",14,"Medium")] if avg_price > 3000
                else [("Delhi, Delhi",19,"Very High"),("Mumbai, Maharashtra",18,"High"),("Bangalore, Karnataka",17,"High"),("Kolkata, West Bengal",15,"High"),("Hyderabad, Telangana",16,"Medium"),("Pune, Maharashtra",15,"Medium")])
    total_share = sum(s for _, s, _ in locs) or 1
    return [LocationInsight(country=city, market_share=f"{(s/total_share*100):.1f}%", demand_level=d) for city, s, d in locs]
 
 
def _run_ollama(prompt: str) -> str:
    """Synchronous Ollama call. Always invoked via asyncio.to_thread."""
    result = subprocess.run(
        ["ollama", "run", OLLAMA_MODEL],
        input=prompt, capture_output=True,
        text=True, encoding="utf-8", errors="ignore", timeout=60,
    )
    return (result.stdout or result.stderr or "").strip()
 
 
async def generate_location_insights(
    products: List[Dict],
    category: str,
) -> List[LocationInsight]:
    """[IMP-1] Checks Redis before calling Ollama. Stores result for 24 h."""
    prices    = [float(p.get("price", 0)) for p in products if p.get("price")]
    avg_price = float(np.mean(prices)) if prices else 0.0
 
    cache_key = _cache_key("location", category, round(avg_price, -2))
    cached    = await cache_get(cache_key)
    if cached:
        log.debug("location_cache_hit", category=category)
        return [LocationInsight(**d) for d in cached]
 
    prompt = (
        f"You are an Indian e-commerce analyst. Category: {category}. "
        f"Average price: Rs.{avg_price:.0f}. Total products: {len(products)}.\n\n"
        "List exactly 6 Indian cities with highest demand for this product.\n"
        'Output ONLY a JSON array, nothing else:\n'
        '[{"city":"Mumbai, Maharashtra","share":22,"demand":"Very High"},{"city":"Delhi, Delhi","share":18,"demand":"High"}]\n\n'
        "Rules: shares sum to 100, demand is one of: Very High/High/Medium/Low, order by share descending."
    )
    for attempt in range(2):
        try:
            async with _OLLAMA_SEMAPHORE:   # [IMP-5]
                output = await asyncio.to_thread(_run_ollama, prompt)
            match = re.search(r"\[[\s\S]*?\]", output)
            if not match:
                continue
            data = json.loads(match.group())
            if not isinstance(data, list) or len(data) < 3:
                continue
            total_share = sum(float(d.get("share", 0)) for d in data) or 1
            result = [LocationInsight(country=d.get("city","India"), market_share=f"{(float(d.get('share',0))/total_share*100):.1f}%", demand_level=d.get("demand","Medium")) for d in data[:6]]
            await cache_set(cache_key, [r.dict() for r in result], CACHE_TTL_LOCATION_S)
            return result
        except (json.JSONDecodeError, TypeError, KeyError) as exc:
            log.warning("location_ollama_parse_fail", attempt=attempt + 1, reason=str(exc))
        except Exception:
            log.exception("location_ollama_error", attempt=attempt + 1)
 
    return get_rule_based_locations(category, avg_price)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-4]  AI OUTPUT VALIDATOR
# ─────────────────────────────────────────────────────────────────────────────
 
class OllamaValidator:
    """
    [IMP-4] Sanity-checks and adjusts the raw Ollama strategy string before
    it reaches the API response.
 
    Checks:
      1. Price range sanity — strategy must not recommend prices outside
         [mkt_min * 0.5, mkt_max * 2.0].
      2. Category consistency — strategy must mention the category or a
         related synonym (prevents hallucinated product pivots).
      3. Competitor count plausibility — if the strategy says "no competition"
         but we have > 20 competitors, override the claim.
      4. Minimum length — reject single-sentence strategy strings and fall back.
    """
 
    def __init__(self, pricing: Dict, category: str, competition: Dict):
        self.mkt_min     = pricing.get("market_min_price", 0)
        self.mkt_max     = pricing.get("market_max_price", float("inf"))
        self.mkt_avg     = pricing.get("market_avg_price", 0)
        self.category    = category.lower()
        self.competitors = competition.get("total_competitors", 0)
 
    def validate(self, strategy: str) -> Tuple[bool, str]:
        """Returns (is_valid, possibly_adjusted_strategy)."""
        if not strategy or len(strategy) < 80:
            return False, strategy
 
        # 1. Price sanity: extract any Rs. figures and check they're plausible
        price_mentions = re.findall(r'rs\.?\s*([\d,]+)', strategy.lower())
        if price_mentions and self.mkt_min > 0 and self.mkt_max > 0:
            for raw in price_mentions:
                try:
                    p = float(raw.replace(",", ""))
                    lo = self.mkt_min * 0.4
                    hi = self.mkt_max * 3.0
                    if p > 0 and not (lo <= p <= hi):
                        log.warning("ai_price_out_of_range", price=p, mkt_min=self.mkt_min, mkt_max=self.mkt_max)
                        return False, strategy
                except ValueError:
                    pass
 
        # 2. Competitor plausibility: flag "no competition" when market is crowded
        if self.competitors > 20:
            no_comp_phrases = ["no competition", "no competitors", "no rival", "uncrowded market"]
            if any(ph in strategy.lower() for ph in no_comp_phrases):
                strategy = strategy + (
                    f" Note: there are currently {self.competitors} active competitors in this segment."
                )
 
        # 3. Minimum sentence count
        sentences = [s.strip() for s in re.split(r'[.!?]', strategy) if len(s.strip()) > 20]
        if len(sentences) < 3:
            return False, strategy
 
        return True, strategy
 
 
# ─────────────────────────────────────────────────────────────────────────────
# AI STRATEGY GENERATION  (validated, cached, semaphored)
# ─────────────────────────────────────────────────────────────────────────────
 
def generate_enhanced_fallback_strategy(
    pricing: Dict, sales: Dict, competition: Dict, base_cost: float,
    cost_advantage: str, comp_level: str, profit_per_unit: float,
    monthly_revenue: float, category: str, avg_monthly_sales: float,
    recommended: float, market_avg: float,
    location_insights: Optional[List[LocationInsight]] = None,
) -> str:
    margin        = pricing["profit_margin"]
    demand        = sales["market_demand"]
    competitors   = competition["total_competitors"]
    actual_profit = profit_per_unit * 0.70
    actual_monthly = monthly_revenue * 0.70
    cities = [loc.country.split(",")[0] for loc in (location_insights or [])[:3] if loc.country != "AI Analysis Required"]
    city_str = ", ".join(cities) if len(cities) >= 2 else (cities[0] if cities else "major metros")
 
    if margin < 10:
        return (f"NOT VIABLE: Your cost (Rs.{base_cost:,.0f}) leaves only {margin:.1f}% margin at Rs.{recommended:,.0f}. After platform fees you face net losses. With {competitors} competitors at Rs.{market_avg:,.0f}, this is uncompetitive. Reduce cost to under Rs.{market_avg * 0.5:.0f} or pivot entirely.")
    if margin < 20:
        be = int(30000 / actual_profit) if actual_profit > 0 else 999
        return (f"RISKY: {margin:.1f}% margin (Rs.{profit_per_unit:,.0f}/unit) at Rs.{recommended:,.0f} vs market Rs.{market_avg:,.0f}. {comp_level} competition ({competitors} sellers). After fees, actual profit = Rs.{actual_profit:.0f}/unit. Need {be} monthly sales for Rs.30k income. Focus on {city_str}. Expected {int(avg_monthly_sales)} units/month = Rs.{actual_monthly:,.0f} profit. Test 50 units first, high risk due to thin margins.")
    if margin < 30:
        return (f"CHALLENGING: {margin:.1f}% margin (Rs.{profit_per_unit:,.0f}/unit). Price Rs.{recommended:,.0f} vs market Rs.{market_avg:,.0f}. {comp_level} competition ({competitors} sellers). Target {city_str}. Focus on 4.5 star plus rating strategy. Expected {int(avg_monthly_sales)} units/month = Rs.{actual_monthly:,.0f} after fees. Test 50 units in month 1, scale month 3 onwards.")
    if margin < 40:
        return (f"SOLID: {margin:.0f}% margin (Rs.{profit_per_unit:,.0f}/unit) in {demand.lower()}-demand market. Price Rs.{recommended:,.0f} (market Rs.{market_avg:,.0f}). {comp_level} competition ({competitors} sellers). Focus on {city_str}. Expected {int(avg_monthly_sales)} units/month = Rs.{actual_monthly:,.0f} after fees. Scale 50 to 75 units in month 1.")
    return (f"EXCELLENT: {margin:.0f}% margin (Rs.{profit_per_unit:,.0f}/unit)! Price Rs.{recommended:,.0f} vs market Rs.{market_avg:,.0f}. {competitors} competitors, your cost moat enables market share capture. Target {city_str}. Expected {int(avg_monthly_sales)} growing to {int(avg_monthly_sales * 2)} units/month by month 3 = Rs.{actual_monthly * 2:,.0f}/month. Launch 100 to 150 units, sponsored ads Rs.500/day.")
 
 
async def generate_ai_strategy(
    pricing: Dict, sales: Dict, competition: Dict,
    base_cost: float, product_name: str, category: str,
    location_insights: Optional[List], gaps: List[Dict],
) -> str:
    """[IMP-1] Cached. [IMP-4] Validated. [IMP-5] Semaphored."""
    margin      = pricing["profit_margin"]
    rec_price   = pricing["recommended_price"]
    mkt_avg     = pricing.get("market_avg_price", 0)
    profit_unit = rec_price - base_cost
    monthly_str = sales["estimated_monthly_sales"]
    competitors = competition["total_competitors"]
    after_fees  = profit_unit * 0.72
    avg_m       = max(0.0, _parse_monthly_sales_string(monthly_str, sales.get("estimated_daily_sales", 0.0)))
    monthly_prof = after_fees * avg_m
 
    # [IMP-1] Cache key: margin bucket + competitor bucket + category
    margin_bucket = int(margin // 10) * 10
    comp_bucket   = "low" if competitors < 30 else ("mid" if competitors < 100 else "high")
    cache_key     = _cache_key("strategy", category, margin_bucket, comp_bucket)
    cached        = await cache_get(cache_key)
    if cached:
        log.debug("strategy_cache_hit", category=category)
        return cached
 
    cities   = [loc.country.split(",")[0] for loc in (location_insights or [])[:3]]
    city_str = ", ".join(cities) if cities else "major metros"
    gap_summary = ("Key market gaps:\n" + "\n".join(f"- {g['title']}: {g['description']}" for g in gaps[:3])) if gaps else ""
 
    prompt = (
        f"You are an Indian e-commerce strategist. Write a 5-6 sentence actionable strategy. No bullet points. Flowing sentences only.\n\n"
        f"Product: {product_name} | Category: {category}\n"
        f"Cost: Rs.{base_cost:,.0f} | Recommended price: Rs.{rec_price:,.0f} | Market avg: Rs.{mkt_avg:,.0f}\n"
        f"Margin: {margin:.1f}% | After fees: Rs.{after_fees:.0f}/unit\n"
        f"Competitors: {competitors} | Monthly est: {int(avg_m)} units | Monthly profit: Rs.{monthly_prof:,.0f}\n"
        f"Top cities: {city_str}\n{gap_summary}\n\n"
        "Start with: NOT VIABLE (margin<10%), RISKY (10-19%), MODERATE (20-29%), SOLID (30-39%), EXCELLENT (40%+).\n"
        "Cover viability, pricing tactic, geography, and market gap exploitation.\nWrite the strategy now:"
    )
 
    validator = OllamaValidator(pricing, category, competition)
 
    try:
        async with _OLLAMA_SEMAPHORE:   # [IMP-5]
            raw = await asyncio.to_thread(_run_ollama, prompt)
        clean = raw.replace("</s>", "").replace("```", "").replace("**", "").strip()
        sentences = []
        for line in clean.split("\n"):
            line = line.strip()
            if line and len(line) > 50 and not line.startswith(("#","*","-",".","TASK","PRODUCT","DATA")):
                for s in line.replace(". ", ".|").split("|"):
                    s = s.strip()
                    if s and len(s) > 40 and not s.lower().startswith(("here","write","you are")):
                        sentences.append(s)
                        if len(sentences) >= 6:
                            break
            if len(sentences) >= 6:
                break
 
        if len(sentences) >= 4:
            strategy = " ".join(sentences[:6])
            if margin < 18 and "fee" not in strategy.lower():
                strategy += f" After platform fees, actual profit approximately Rs.{after_fees:.0f}/unit."
 
            # [IMP-4] Validate before returning
            valid, strategy = validator.validate(strategy)
            if valid:
                await cache_set(cache_key, strategy, CACHE_TTL_ANALYSIS_S)
                return strategy
 
    except Exception:
        log.exception("ollama_strategy_error")
 
    cost_adv = "MODERATE" if margin >= 20 else "WEAK"
    comp_lvl = "HIGH" if competitors > 50 else "MODERATE"
    fallback  = generate_enhanced_fallback_strategy(
        pricing, sales, competition, base_cost, cost_adv, comp_lvl,
        profit_unit, after_fees * avg_m, category, avg_m,
        rec_price, mkt_avg, location_insights,
    )
    await cache_set(cache_key, fallback, CACHE_TTL_ANALYSIS_S)
    return fallback
 
 
# ─────────────────────────────────────────────────────────────────────────────
# WARNINGS  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
 
def generate_warnings(pricing: Dict, competition: Dict, base_cost: float) -> List[str]:
    warnings   = []
    market_avg = pricing.get("market_avg_price", 0)
    market_min = pricing.get("market_min_price", 0)
    margin     = pricing["profit_margin"]
    rec_price  = pricing["recommended_price"]
 
    if market_avg > 0 and base_cost > market_avg:
        loss_pct = ((base_cost - market_avg) / market_avg) * 100
        warnings.append(f"CRITICAL: Your cost (Rs.{base_cost:,.0f}) is {loss_pct:.0f}% HIGHER than market average (Rs.{market_avg:,.0f}). Cannot compete profitably.")
        warnings.append(f"Solution: Reduce cost to under Rs.{market_avg * 0.6:,.0f} for 40% margin.")
        return warnings
    if market_avg > 0 and base_cost > market_avg * 0.8:
        warnings.append(f"HIGH RISK: Cost (Rs.{base_cost:,.0f}) very close to market avg (Rs.{market_avg:,.0f}). Only {margin:.1f}% margin.")
        warnings.append(f"Recommendation: Negotiate down to Rs.{market_avg * 0.5:,.0f}.")
    if market_min > 0 and base_cost > market_min:
        warnings.append(f"WARNING: Cost (Rs.{base_cost:,.0f}) exceeds cheapest competitor (Rs.{market_min:,.0f}).")
        warnings.append("Strategy: Focus on premium positioning or unique features.")
    if margin < 10:
        warnings.append(f"DANGER: Only {margin:.1f}% margin. Unsustainable after fees.")
        warnings.append("Action: Need 30 to 40% margin minimum.")
    elif margin < 20:
        warnings.append(f"LOW MARGIN: {margin:.1f}% risky. After fees, profit minimal.")
        warnings.append("Tip: Aim for 35 to 50% margin for a sustainable business.")
    if competition["total_competitors"] > 100:
        warnings.append(f"EXTREMELY COMPETITIVE: {competition['total_competitors']} competitors.")
        warnings.append("Strategy: Niche variations or unique bundles.")
    elif competition["total_competitors"] > 50:
        warnings.append(f"High competition: {competition['total_competitors']} sellers.")
        warnings.append("Tip: Quality photos and early reviews to stand out.")
    if market_avg > 0 and rec_price > market_avg * 1.3:
        warnings.append(f"PRICING RISK: Recommended (Rs.{rec_price:,.0f}) is high vs market.")
        warnings.append(f"Option: Start at Rs.{market_avg:,.0f} then increase.")
    if pricing["confidence"] == "Critical":
        warnings.append("CRITICAL: NOT viable with current cost.")
    elif pricing["confidence"] == "Low":
        warnings.append("Limited data. Test with small inventory first.")
    if not warnings and margin > 35:
        warnings.append(f"EXCELLENT: {margin:.0f}% margin.")
        warnings.append(f"Strategy: Price Rs.{rec_price:,.0f}, quality listing, scale fast.")
    elif not warnings:
        warnings.append(f"VIABLE: {margin:.1f}% margin acceptable.")
        warnings.append("Focus: Quality photos, competitive shipping.")
    return warnings
 
 
# ─────────────────────────────────────────────────────────────────────────────
# QUOTA HELPERS  (unchanged logic)
# ─────────────────────────────────────────────────────────────────────────────
 
def get_analysis_limit(tier: str) -> float:
    return {"free": 5, "basic": 20, "premium": float("inf"), "enterprise": float("inf")}.get(tier.lower(), 5)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-9]  HEALTH CHECK ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/health")
async def health_check():
    """
    [IMP-9] Stateless health probe suitable for load-balancer checks.
    Reports Redis connectivity without blocking.
    """
    redis_ok = False
    try:
        await asyncio.wait_for(asyncio.to_thread(r.ping), timeout=1.0)
        redis_ok = True
    except Exception:
        pass
    return {
        "status":     "ok",
        "version":    "2.0.0",
        "redis":      "connected" if redis_ok else "unavailable",
        "timestamp":  datetime.utcnow().isoformat() + "Z",
    }
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [IMP-5]  CELERY TASK STUB  (optional heavy-work offload)
# ─────────────────────────────────────────────────────────────────────────────
 
try:
    from celery import Celery  # type: ignore
    _celery_app = Celery("product_tracker", broker="redis://localhost:6379/1")
 
    @_celery_app.task(name="tasks.run_analysis", bind=True, max_retries=2, default_retry_delay=5)
    def run_analysis_task(self, request_payload: Dict) -> Dict:
        """
        [IMP-5] Heavy analytics can be offloaded here when the request volume
        exceeds what synchronous FastAPI handlers can sustain.
        Wire up by replacing `await analyze_product_opportunity(request, db)`
        with `run_analysis_task.delay(request.dict())` and polling a status
        endpoint. The result is stored in Redis under a task-id key.
        """
        # Placeholder — implementation mirrors analyze_product_opportunity
        # but runs in a Celery worker process, freeing the API server.
        raise NotImplementedError("Implement full analysis logic here for async offload.")
 
except ImportError:
    _celery_app = None  # type: ignore
 
 
# ─────────────────────────────────────────────────────────────────────────────
# MAIN ANALYZE ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────
 
@router.post("/product-tracker/analyze")
async def analyze_product_opportunity(
    request_body: ProductTrackerRequest,
    background_tasks: BackgroundTasks,
    raw_request: Request,
    db: Session = Depends(get_db),
) -> ApiResponse:
    """
    [IMP-2]  StepTimer tracks per-stage latency, included in response.
    [IMP-3]  ConfidenceScore derived from tier + data quality.
    [IMP-7]  FallbackPolicy governs and annotates tier usage.
    [IMP-8]  Returns ApiResponse envelope.
    [IMP-1]  Full result cached keyed on (product, category, source, cost-bucket).
    """
    timer      = StepTimer()
    request_id = getattr(raw_request.state, "request_id", str(uuid.uuid4()))
 
    # [IMP-10] Validate source via our typed exception
    try:
        source_key = _validate_source(request_body.source)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=exc.message)
 
    # [IMP-1] Check full-result cache first
    cost_bucket = int(request_body.base_cost // 500) * 500
    analysis_cache_key = _cache_key(
        "analysis", request_body.product_name,
        request_body.category, source_key, cost_bucket,
    )
    with timer.step("cache_check"):
        cached_result = await cache_get(analysis_cache_key)
    if cached_result:
        log.info("analysis_cache_hit", product=request_body.product_name)
        return ApiResponse(
            success=True, request_id=request_id,
            latency_ms=timer.total_ms(), source_type=cached_result.get("source_type","unknown"),
            confidence_score=cached_result.get("confidence_score"),
            warnings=cached_result.get("warnings", []),
            data=cached_result.get("data"),
            step_timings={"cached": True},
        )
 
    # ── Quota check ──────────────────────────────────────────────────────────
    user = None
    if request_body.user_email:
        user = db.query(models.User).filter(models.User.email_hash == HashedString().process_bind_param(request_body.user_email, None)).first()
        if user:
            current_month = datetime.now().strftime("%Y-%m")
            if user.analysis_month != current_month:
                user.analysis_used = 0; user.analysis_month = current_month
                db.commit(); db.refresh(user)
            tier  = user.subscription_tier or "free"
            limit = get_analysis_limit(tier)
            if limit != float("inf") and (user.analysis_used or 0) >= int(limit):
                raise QuotaError(f"Analysis limit reached. {user.analysis_used}/{int(limit)} used this month.")
 
    # ── Product search ───────────────────────────────────────────────────────
    with timer.step("product_search"):
        similar_products, tier_used = get_similar_products(
            db, request_body.product_name, request_body.category,
            source_key, request_body.base_cost,
        )
 
    if not similar_products:
        raise HTTPException(
            status_code=404,
            detail=(f"No products found for '{request_body.product_name}' in '{request_body.category}' "
                    f"on {request_body.source}. Try a simpler product name or different category."),
        )
 
    log.info("products_matched", count=len(similar_products), tier=tier_used.value)
 
    keywords = extract_keywords(request_body.product_name)
 
    # ── Analytics ────────────────────────────────────────────────────────────
    with timer.step("pricing"):
        pricing_insights = analyze_pricing(similar_products, request_body.base_cost)
 
    with timer.step("sales"):
        sales_insights = analyze_sales_potential(
            products=similar_products, source=source_key,
            base_cost=request_body.base_cost,
            recommended_price=pricing_insights["recommended_price"],
            category=request_body.category, db=db,
        )
 
    with timer.step("competition"):
        competition_insights = analyze_competition(similar_products, request_body.category, keywords)
 
    with timer.step("gaps"):
        market_gaps = detect_market_gaps(
            similar_products, pricing_insights, request_body.base_cost, keywords, source=source_key,
        )
 
    # ── AI inference (semaphored, cached) ─────────────────────────────────
    with timer.step("location_ai"):
        location_insights = await generate_location_insights(similar_products, request_body.category)
 
    with timer.step("strategy_ai"):
        ai_strategy = await generate_ai_strategy(
            pricing_insights, sales_insights, competition_insights,
            request_body.base_cost, request_body.product_name, request_body.category,
            location_insights, market_gaps,
        )
 
    with timer.step("verdict"):
        final_verdict_data = generate_final_verdict(
            pricing_insights, sales_insights, competition_insights,
            market_gaps, request_body.base_cost, request_body.product_name,
            request_body.category, location_insights,
        )
 
    # ── Confidence + warnings ─────────────────────────────────────────────
    confidence = compute_confidence_score(similar_products, pricing_insights, tier_used)
    cost_error = validate_cost_against_market(request_body.base_cost, similar_products)
    warnings   = generate_warnings(pricing_insights, competition_insights, request_body.base_cost)
    if cost_error:
        warnings.insert(0, cost_error)
 
    # [IMP-7] Attach fallback warning if applicable
    fallback_reason = None
    fw = DEFAULT_FALLBACK_POLICY.fallback_warning(tier_used)
    if fw:
        fallback_reason = fw
 
    if confidence.label == "Low":
        warnings.insert(0, f"LOW CONFIDENCE ({confidence.score:.2f}): Only {confidence.sample_size} products matched. Treat estimates as directional only.")
 
    # ── Assemble payload ──────────────────────────────────────────────────
    pricing_clean = {k: v for k, v in pricing_insights.items() if not k.startswith("_")}
    source_type   = _tier_to_source_type(tier_used)
    final_verdict_data = normalize_output(final_verdict_data)
 
    data = ProductTrackerData(
        product_name      = request_body.product_name,
        category          = request_body.category,
        source            = request_body.source.capitalize(),
        pricing           = PricingInsights(**pricing_clean),
        sales             = SalesInsights(**sales_insights),
        competition       = CompetitorInsights(**competition_insights),
        location_insights = location_insights,
        ai_strategy       = ai_strategy,
        market_gaps       = [GapItem(**g) for g in market_gaps],
        final_verdict = FinalVerdict(**normalize_output(final_verdict_data)),
        fallback_reason   = fallback_reason,
    )
 
    response = ApiResponse(
        success          = True,
        request_id       = request_id,
        latency_ms       = timer.total_ms(),
        source_type      = source_type.value,
        confidence_score = confidence.to_dict(),
        warnings         = warnings,
        data             = data.dict(),
        step_timings     = timer.to_dict(),
    )
 
    # [IMP-1] Cache full result
    background_tasks.add_task(
        cache_set, analysis_cache_key, response.dict(), CACHE_TTL_ANALYSIS_S
    )
 
    # ── Persist + quota increment (background) ────────────────────────────
    background_tasks.add_task(
        _persist_analysis,
        db=db, user=user, request_body=request_body,
        pricing_clean=pricing_clean, sales_insights=sales_insights,
        competition_insights=competition_insights,
        location_insights=location_insights,
        ai_strategy=ai_strategy, warnings=warnings,
        market_gaps=market_gaps, final_verdict_data=final_verdict_data,
        similar_products=similar_products,
    )
 
    log.info("analysis_complete",
             product=request_body.product_name, tier=tier_used.value,
             confidence=confidence.score, latency_ms=timer.total_ms())
 
    return response
 
 
def _persist_analysis(
    db: Session, user: Any, request_body: ProductTrackerRequest,
    pricing_clean: Dict, sales_insights: Dict, competition_insights: Dict,
    location_insights: List[LocationInsight], ai_strategy: str,
    warnings: List[str], market_gaps: List[Dict], final_verdict_data: Dict,
    similar_products: List[Dict],
) -> None:
    """Runs as a FastAPI BackgroundTask — DB write + quota increment."""
    try:
        analysis_data = {
            "product_name":      request_body.product_name,
            "category":          request_body.category,
            "source":            request_body.source,
            "base_cost":         request_body.base_cost,
            "pricing":           pricing_clean,
            "sales":             sales_insights,
            "competition":       competition_insights,
            "location_insights": [{"country": l.country, "market_share": l.market_share, "demand_level": l.demand_level} for l in location_insights],
            "ai_strategy":       ai_strategy,
            "warnings":          warnings,
            "market_gaps":       market_gaps,
            "final_verdict":     final_verdict_data,
            "similar_products":  similar_products,
            "success":           True,
        }
        saved = crud.create_tracker_analysis(db, request_body.user_email, analysis_data)
        log.info("analysis_saved", analysis_id=saved.id)
 
        if user:
            db.refresh(user)
            current_month = datetime.now().strftime("%Y-%m")
            if user.analysis_month != current_month:
                user.analysis_used = 0; user.analysis_month = current_month
            tier  = user.subscription_tier or "free"
            limit = get_analysis_limit(tier)
            if limit == float("inf") or (user.analysis_used or 0) < int(limit):
                user.analysis_used  = (user.analysis_used or 0) + 1
                user.analysis_month = current_month
                user.updated_at     = datetime.now()
                db.commit()
    except Exception:
        log.error("analysis_persist_failed",
                  product=request_body.product_name,
                  user=request_body.user_email,
                  exc_info=True)
 
 
# ─────────────────────────────────────────────────────────────────────────────
# REMAINING ENDPOINTS  — all return ApiResponse envelope  [IMP-8]
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/users/{user_id}/analysis-usage")
def get_analysis_usage(
    user_id: int,
    raw_request: Request,
    month: str = Query(None),
    db: Session = Depends(get_db),
) -> ApiResponse:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    current_month = month or datetime.now().strftime("%Y-%m")
    if user.analysis_month != current_month:
        user.analysis_used = 0; user.analysis_month = current_month
        db.commit(); db.refresh(user)
    tier      = user.subscription_tier or "free"
    limit     = get_analysis_limit(tier)
    used      = user.analysis_used or 0
    limit_out = _infinity_to_sentinel(limit)
    remaining = _infinity_to_sentinel(limit - used if limit != float("inf") else float("inf"))
    return ApiResponse(
        success=True,
        request_id=getattr(raw_request.state, "request_id", ""),
        latency_ms=0, source_type="internal",
        data={"count": used, "limit": limit_out, "month": user.analysis_month or current_month, "subscription_tier": tier, "remaining": remaining},
    )
 
 
@router.post("/users/{user_id}/analysis-usage")
def track_analysis_usage(
    user_id: int,
    request_body: AnalysisTrackRequest,
    raw_request: Request,
    db: Session = Depends(get_db),
) -> ApiResponse:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    current_month = datetime.now().strftime("%Y-%m")
    if user.analysis_month != current_month:
        user.analysis_used = 0; user.analysis_month = current_month
    tier  = user.subscription_tier or "free"
    limit = get_analysis_limit(tier)
    if limit != float("inf") and (user.analysis_used or 0) >= int(limit):
        raise QuotaError(f"Analysis limit reached. {user.analysis_used}/{int(limit)} this month.")
    user.analysis_used  = (user.analysis_used or 0) + request_body.increment
    user.analysis_month = current_month
    user.updated_at     = datetime.now()
    db.commit(); db.refresh(user)
    limit_out = _infinity_to_sentinel(limit)
    remaining = _infinity_to_sentinel(limit - user.analysis_used if limit != float("inf") else float("inf"))
    return ApiResponse(
        success=True, request_id=getattr(raw_request.state, "request_id", ""),
        latency_ms=0, source_type="internal",
        data={"success": True, "analysis_used": user.analysis_used, "analysis_month": user.analysis_month, "remaining": remaining, "limit": limit_out},
    )
 
 
@router.post("/users/{user_id}/check-analysis-limit")
def check_analysis_limit(
    user_id: int, raw_request: Request, db: Session = Depends(get_db),
) -> ApiResponse:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    current_month = datetime.now().strftime("%Y-%m")
    if user.analysis_month != current_month:
        user.analysis_used = 0; user.analysis_month = current_month; db.commit()
    tier      = user.subscription_tier or "free"
    limit     = get_analysis_limit(tier)
    used      = user.analysis_used or 0
    can       = limit == float("inf") or used < int(limit)
    limit_out = _infinity_to_sentinel(limit)
    remaining = _infinity_to_sentinel(limit - used if limit != float("inf") else float("inf"))
    return ApiResponse(
        success=True, request_id=getattr(raw_request.state, "request_id", ""),
        latency_ms=0, source_type="internal",
        data={"can_analyze": can, "used": used, "limit": limit_out, "remaining": remaining, "subscription_tier": tier, "upgrade_required": not can},
    )
 
 
@router.get("/product-tracker/history")
def get_tracker_history(
    raw_request: Request,
    user_email: str = Query(...),
    limit: int = Query(20),
    offset: int = Query(0),
    db: Session = Depends(get_db),
) -> ApiResponse:
    try:
        history = crud.get_user_tracker_history(db, user_email, limit, offset)
        return ApiResponse(
            success=True, request_id=getattr(raw_request.state, "request_id", ""),
            latency_ms=0, source_type="internal",
            data={"count": len(history), "items": [{"id": h.id, "product_name": h.product_name, "category": h.category, "source": h.source, "base_cost": float(h.base_cost), "recommended_price": float(h.recommended_price) if h.recommended_price else None, "profit_margin": float(h.profit_margin) if h.profit_margin else None, "market_demand": h.market_demand, "created_at": h.created_at.isoformat()} for h in history]},
        )
    except Exception:
        log.exception("history_fetch_error", user_email=user_email)
        raise DatabaseError("Failed to fetch analysis history.")
 
 
@router.get("/product-tracker/analysis/{analysis_id}")
def get_analysis_details(
    analysis_id: int, raw_request: Request, db: Session = Depends(get_db),
) -> ApiResponse:
    try:
        analysis = crud.get_tracker_analysis_by_id(db, analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return ApiResponse(
            success=True, request_id=getattr(raw_request.state, "request_id", ""),
            latency_ms=0, source_type="internal",
            data={
                "id": analysis.id,
                "product_name": analysis.product_name,
                "category": analysis.category,
                "source": analysis.source,
                "base_cost": float(analysis.base_cost),
                "pricing": {
                    "recommended_price": float(analysis.recommended_price) if analysis.recommended_price else 0,
                    "min_price": float(analysis.min_price) if analysis.min_price else 0,
                    "max_price": float(analysis.max_price) if analysis.max_price else 0,
                    "profit_margin": float(analysis.profit_margin) if analysis.profit_margin else 0,
                    "confidence": analysis.pricing_confidence or "Medium"
                },
                "sales": {
                    "estimated_monthly_sales": f"{analysis.estimated_monthly_sales_min}-{analysis.estimated_monthly_sales_max}" if analysis.estimated_monthly_sales_min else "N/A",
                    "estimated_daily_sales": float(analysis.estimated_daily_sales) if analysis.estimated_daily_sales else 0,
                    "market_demand": analysis.market_demand or "Medium"
                },
                "competition": {
                    "total_competitors": analysis.total_competitors or 0,
                    "avg_competitor_price": float(analysis.avg_competitor_price) if analysis.avg_competitor_price else 0,
                    "avg_competitor_rating": float(analysis.avg_competitor_rating) if analysis.avg_competitor_rating else 0,
                    "top_competitor": {
                        "name": analysis.top_competitor_name,
                        "price": float(analysis.top_competitor_price) if analysis.top_competitor_price else 0
                    } if analysis.top_competitor_name else None
                },
                "location_insights": analysis.location_insights or [],
                "ai_strategy": analysis.ai_strategy or "",
                "warnings": analysis.warnings or [],
                "created_at": analysis.created_at.isoformat()
            },
        )
    except HTTPException:
        raise
    except Exception:
        log.exception("analysis_fetch_error", analysis_id=analysis_id)
        raise DatabaseError("Failed to fetch analysis details.")
 
 
@router.delete("/product-tracker/analysis/{analysis_id}")
def delete_analysis(
    analysis_id: int, raw_request: Request,
    user_email: str = Query(...), db: Session = Depends(get_db),
) -> ApiResponse:
    try:
        success = crud.delete_tracker_analysis(db, analysis_id, user_email)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found or unauthorized")
        return ApiResponse(
            success=True, request_id=getattr(raw_request.state, "request_id", ""),
            latency_ms=0, source_type="internal",
            data={"message": "Analysis deleted successfully"},
        )
    except HTTPException:
        raise
    except Exception:
        log.exception("analysis_delete_error", analysis_id=analysis_id)
        raise DatabaseError("Failed to delete analysis.")
 
 
@router.get("/product-tracker/stats")
def get_tracker_stats(raw_request: Request, db: Session = Depends(get_db)) -> ApiResponse:
    try:
        from sqlalchemy import func
        total      = db.query(models.ProductTrackerAnalysis).count()
        popular    = crud.get_popular_categories(db, limit=5)
        recent     = db.query(models.ProductTrackerAnalysis).order_by(models.ProductTrackerAnalysis.created_at.desc()).limit(5).all()
        avg_margin = db.query(func.avg(models.ProductTrackerAnalysis.profit_margin)).scalar()
        return ApiResponse(
            success=True, request_id=getattr(raw_request.state, "request_id", ""),
            latency_ms=0, source_type="internal",
            data={"total_analyses": total, "average_profit_margin": round(float(avg_margin), 2) if avg_margin else 0, "popular_categories": popular, "recent_analyses": [{"product_name": r.product_name, "category": r.category, "created_at": r.created_at.isoformat()} for r in recent]},
        )
    except Exception:
        log.exception("stats_fetch_error")
        raise DatabaseError("Failed to fetch tracker stats.")

# ============================================
# 🔥 FIXED: Products by Sentiment (WITH PAGINATION)
# ============================================

# @app.get("/products/by-sentiment")
# def get_products_by_sentiment(
#     table: str = Query(..., description="rapidapi_flipkart_products or rapidapi_amazon_products"),
#     sentiment: str = Query(..., description="positive, neutral, or negative"),
#     page: int = Query(1, description="Page number (starts from 1)"),
#     limit: int = Query(24, description="Products per page"),
#     db: Session = Depends(get_db)
# ):
#     """
#     ✅ COMPLETE FIX: 
#     - Adjusted sentiment ranges: Positive 4.0+, Neutral 3.5-3.99, Negative <3.5
#     - Added pagination
#     - Synced with pie chart logic
#     """
#     try:
#         # Validate inputs
#         sentiment_lower = sentiment.lower()
#         if sentiment_lower not in ['positive', 'neutral', 'negative']:
#             raise HTTPException(status_code=400, detail="Invalid sentiment. Use: positive, neutral, or negative")
        
#         table_lower = table.lower()
#         if table_lower not in ['rapidapi_flipkart_products', 'rapidapi_amazon_products']:
#             raise HTTPException(status_code=400, detail="Invalid table")
        
#         # Calculate offset for pagination
#         offset = (page - 1) * limit
        
#         # Define field names based on table
#         if table_lower == 'rapidapi_flipkart_products':
#             rating_field = "product_star_rating"
#             price_field = "product_price"
#             review_field = "product_review_count"
#         else:  # Amazon
#             rating_field = "product_star_rating_numeric"
#             price_field = "product_price_numeric"
#             review_field = "product_num_ratings"
        
#         # 🔥 ADJUSTED RANGES - Match pie chart exactly
#         if sentiment_lower == 'positive':
#             rating_condition = f"{rating_field} >= 4.0"
#         elif sentiment_lower == 'neutral':
#             rating_condition = f"{rating_field} >= 3.5 AND {rating_field} < 4.0"
#         else:  # negative
#             rating_condition = f"{rating_field} < 3.5"
        
#         print(f"\n{'='*60}")
#         print(f"🔍 SENTIMENT PRODUCTS QUERY")
#         print(f"{'='*60}")
#         print(f"Table: {table_lower}")
#         print(f"Sentiment: {sentiment_lower}")
#         print(f"Condition: {rating_condition}")
#         print(f"Page: {page}, Limit: {limit}, Offset: {offset}")
        
#         # ========== COUNT QUERY ==========
#         count_query = text(f"""
#             SELECT COUNT(*) as total
#             FROM {table_lower}
#             WHERE {rating_field} IS NOT NULL
#               AND {rating_condition}
#               AND product_title IS NOT NULL
#               AND {price_field} IS NOT NULL
#         """)
        
#         count_result = db.execute(count_query).fetchone()
#         total_products = count_result.total if count_result else 0
#         total_pages = (total_products + limit - 1) // limit if total_products > 0 else 0
        
#         print(f"✅ Found {total_products} products (Page {page}/{total_pages})")
        
#         # ========== DATA QUERY ==========
#         products = []
        
#         if total_products > 0:
#             if table_lower == 'rapidapi_flipkart_products':
#                 data_query = text(f"""
#                     SELECT 
#                         product_title,
#                         category_name,
#                         brand,
#                         product_price,
#                         product_mrp,
#                         product_star_rating,
#                         product_review_count,
#                         product_photo,
#                         product_url,
#                         CASE 
#                             WHEN product_star_rating >= 4.5 THEN 0.90
#                             WHEN product_star_rating >= 4.2 THEN 0.85
#                             WHEN product_star_rating >= 4.0 THEN 0.80
#                             WHEN product_star_rating >= 3.7 THEN 0.65
#                             WHEN product_star_rating >= 3.5 THEN 0.55
#                             WHEN product_star_rating >= 3.2 THEN 0.40
#                             ELSE 0.25
#                         END AS sentiment_score
#                     FROM rapidapi_flipkart_products
#                     WHERE product_star_rating IS NOT NULL
#                       AND {rating_condition}
#                       AND product_title IS NOT NULL
#                       AND product_price IS NOT NULL
#                     ORDER BY product_review_count DESC, product_star_rating DESC
#                     LIMIT :limit OFFSET :offset
#                 """)
                
#             else:  # Amazon
#                 data_query = text(f"""
#                     SELECT 
#                         product_title,
#                         category_name,
#                         product_price_numeric AS price,
#                         product_star_rating_numeric AS rating,
#                         product_num_ratings AS review_count,
#                         product_photo,
#                         product_url,
#                         CASE 
#                             WHEN product_star_rating_numeric >= 4.5 THEN 0.90
#                             WHEN product_star_rating_numeric >= 4.2 THEN 0.85
#                             WHEN product_star_rating_numeric >= 4.0 THEN 0.80
#                             WHEN product_star_rating_numeric >= 3.7 THEN 0.65
#                             WHEN product_star_rating_numeric >= 3.5 THEN 0.55
#                             WHEN product_star_rating_numeric >= 3.2 THEN 0.40
#                             ELSE 0.25
#                         END AS sentiment_score
#                     FROM rapidapi_amazon_products
#                     WHERE product_star_rating_numeric IS NOT NULL
#                       AND {rating_condition}
#                       AND product_title IS NOT NULL
#                       AND product_price_numeric IS NOT NULL
#                     ORDER BY product_num_ratings DESC, product_star_rating_numeric DESC
#                     LIMIT :limit OFFSET :offset
#                 """)
            
#             result = db.execute(data_query, {"limit": limit, "offset": offset}).mappings().all()
            
#             # Format response
#             for row in result:
#                 product = dict(row)
                
#                 # Normalize field names for frontend
#                 if table_lower == 'rapidapi_flipkart_products':
#                     product['price'] = float(product.get('product_price', 0))
#                     product['rating'] = float(product.get('product_star_rating', 0))
#                     product['review_count'] = int(product.get('product_review_count', 0))
#                     product['image_url'] = product.get('product_photo')
#                 else:
#                     product['price'] = float(product.get('price', 0))
#                     product['rating'] = float(product.get('rating', 0))
#                     product['review_count'] = int(product.get('review_count', 0))
#                     product['image_url'] = product.get('product_photo')
                
#                 product['category'] = product.get('category_name')
#                 product['sentiment_score'] = float(product.get('sentiment_score', 0))
                
#                 products.append(product)
            
#             print(f"✅ Returning {len(products)} products")
        
#         print(f"{'='*60}\n")
        
#         return {
#             "success": True,
#             "sentiment": sentiment,
#             "source": table,
#             "page": page,
#             "limit": limit,
#             "total_products": total_products,
#             "total_pages": total_pages,
#             "count": len(products),
#             "data": products
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ CRITICAL ERROR: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Error: {str(e)}") 

@router.get("/products/by-sentiment")
def get_products_by_sentiment(
    table: str = Query(..., description="rapidapi_flipkart_products or rapidapi_amazon_products"),
    sentiment: str = Query(..., description="positive, neutral, or negative"),
    page: int = Query(1, description="Page number (starts from 1)"),
    limit: int = Query(24, description="Products per page"),
    category: str = Query(None, description="Optional category filter"),
    min_price: float = Query(None, description="Minimum price filter"),
    max_price: float = Query(None, description="Maximum price filter"),
    min_rating: float = Query(None, description="Minimum rating filter"),
    date_range: str = Query(None, description="Date range filter"),
    trending_only: bool = Query(False, description="Show only trending products"),
    sort_by: str = Query(None, description="Sort by field"),
    db: Session = Depends(get_db)
):
    """
    ✅ COMPLETE FIX with ALL Filters: 
    - Adjusted sentiment ranges: Positive 4.0+, Neutral 3.5-3.99, Negative <3.5
    - Added pagination
    - Added all filter support (category, price, rating, date, trending, sort)
    - Synced with pie chart logic
    """
    try:
        # Validate inputs
        sentiment_lower = sentiment.lower()
        if sentiment_lower not in ['positive', 'neutral', 'negative']:
            raise HTTPException(status_code=400, detail="Invalid sentiment. Use: positive, neutral, or negative")
        
        table_lower = table.lower()
        if table_lower not in ['rapidapi_flipkart_products', 'rapidapi_amazon_products']:
            raise HTTPException(status_code=400, detail="Invalid table")
        
        # Calculate offset for pagination
        offset = (page - 1) * limit
        
        # Define field names based on table
        if table_lower == 'rapidapi_flipkart_products':
            rating_field = "product_star_rating"
            price_field = "product_price"
            review_field = "product_review_count"
        else:  # Amazon
            rating_field = "product_star_rating_numeric"
            price_field = "product_price_numeric"
            review_field = "product_num_ratings"
        
        # 🔥 ADJUSTED RANGES - Match pie chart exactly
        if sentiment_lower == 'positive':
            rating_condition = f"{rating_field} >= 4.0"
        elif sentiment_lower == 'neutral':
            rating_condition = f"{rating_field} >= 3.5 AND {rating_field} < 4.0"
        else:  # negative
            rating_condition = f"{rating_field} < 3.5"
        
        # 🆕 Build dynamic filter conditions
        filter_conditions = []
        params = {"limit": limit, "offset": offset}
        
        # Category filter
        if category:
            filter_conditions.append("category_name = :category")
            params["category"] = category
        
        # Price filters
        if min_price is not None:
            filter_conditions.append(f"{price_field} >= :min_price")
            params["min_price"] = min_price
        
        if max_price is not None:
            filter_conditions.append(f"{price_field} <= :max_price")
            params["max_price"] = max_price
        
        # Rating filter
        if min_rating is not None:
            filter_conditions.append(f"{rating_field} >= :min_rating")
            params["min_rating"] = min_rating
        
        # Combine all filter conditions
        additional_filters = ""
        if filter_conditions:
            additional_filters = "AND " + " AND ".join(filter_conditions)
        
        print(f"\n{'='*60}")
        print(f"🔍 SENTIMENT PRODUCTS QUERY WITH ALL FILTERS")
        print(f"{'='*60}")
        print(f"Table: {table_lower}")
        print(f"Sentiment: {sentiment_lower}")
        print(f"Filters Applied:")
        print(f"  - Category: {category if category else 'All'}")
        print(f"  - Price Range: {min_price or 0} - {max_price or 'unlimited'}")
        print(f"  - Min Rating: {min_rating if min_rating else 'None'}")
        print(f"  - Date Range: {date_range if date_range else 'All'}")
        print(f"  - Trending Only: {trending_only}")
        print(f"  - Sort By: {sort_by if sort_by else 'default'}")
        print(f"Condition: {rating_condition}")
        print(f"Page: {page}, Limit: {limit}, Offset: {offset}")
        
        # ========== COUNT QUERY ==========
        count_query = text(f"""
            SELECT COUNT(*) as total
            FROM {table_lower}
            WHERE {rating_field} IS NOT NULL
              AND {rating_condition}
              AND product_title IS NOT NULL
              AND {price_field} IS NOT NULL
              {additional_filters}
        """)
        
        count_result = db.execute(count_query, params).fetchone()
        total_products = count_result.total if count_result else 0
        total_pages = (total_products + limit - 1) // limit if total_products > 0 else 0
        
        print(f"✅ Found {total_products} products (Page {page}/{total_pages})")
        
        # ========== DATA QUERY ==========
        products = []
        
        if total_products > 0:
            # Determine sort order
            sort_clause = f"ORDER BY {review_field} DESC, {rating_field} DESC"
            if sort_by == "price_low":
                sort_clause = f"ORDER BY {price_field} ASC"
            elif sort_by == "price_high":
                sort_clause = f"ORDER BY {price_field} DESC"
            elif sort_by == "rating":
                sort_clause = f"ORDER BY {rating_field} DESC"
            elif sort_by == "reviews":
                sort_clause = f"ORDER BY {review_field} DESC"
            
            if table_lower == 'rapidapi_flipkart_products':
                data_query = text(f"""
                    SELECT 
                        product_title,
                        category_name,
                        brand,
                        product_price,
                        product_mrp,
                        product_star_rating,
                        product_review_count,
                        product_photo,
                        product_url,
                        CASE 
                            WHEN product_star_rating >= 4.5 THEN 0.90
                            WHEN product_star_rating >= 4.2 THEN 0.85
                            WHEN product_star_rating >= 4.0 THEN 0.80
                            WHEN product_star_rating >= 3.7 THEN 0.65
                            WHEN product_star_rating >= 3.5 THEN 0.55
                            WHEN product_star_rating >= 3.2 THEN 0.40
                            ELSE 0.25
                        END AS sentiment_score
                    FROM rapidapi_flipkart_products
                    WHERE product_star_rating IS NOT NULL
                      AND {rating_condition}
                      AND product_title IS NOT NULL
                      AND product_price IS NOT NULL
                      {additional_filters}
                    {sort_clause}
                    LIMIT :limit OFFSET :offset
                """)
                
            else:  # Amazon
                data_query = text(f"""
                    SELECT 
                        product_title,
                        category_name,
                        product_price_numeric AS price,
                        product_star_rating_numeric AS rating,
                        product_num_ratings AS review_count,
                        product_photo,
                        product_url,
                        CASE 
                            WHEN product_star_rating_numeric >= 4.5 THEN 0.90
                            WHEN product_star_rating_numeric >= 4.2 THEN 0.85
                            WHEN product_star_rating_numeric >= 4.0 THEN 0.80
                            WHEN product_star_rating_numeric >= 3.7 THEN 0.65
                            WHEN product_star_rating_numeric >= 3.5 THEN 0.55
                            WHEN product_star_rating_numeric >= 3.2 THEN 0.40
                            ELSE 0.25
                        END AS sentiment_score
                    FROM rapidapi_amazon_products
                    WHERE product_star_rating_numeric IS NOT NULL
                      AND {rating_condition}
                      AND product_title IS NOT NULL
                      AND product_price_numeric IS NOT NULL
                      {additional_filters}
                    {sort_clause}
                    LIMIT :limit OFFSET :offset
                """)
            
            result = db.execute(data_query, params).mappings().all()
            
            # Format response
            for row in result:
                product = dict(row)
                
                # Normalize field names for frontend
                if table_lower == 'rapidapi_flipkart_products':
                    product['price'] = float(product.get('product_price', 0))
                    product['rating'] = float(product.get('product_star_rating', 0))
                    product['review_count'] = int(product.get('product_review_count', 0))
                    product['image_url'] = product.get('product_photo')
                else:
                    product['price'] = float(product.get('price', 0))
                    product['rating'] = float(product.get('rating', 0))
                    product['review_count'] = int(product.get('review_count', 0))
                    product['image_url'] = product.get('product_photo')
                
                product['category'] = product.get('category_name')
                product['sentiment_score'] = float(product.get('sentiment_score', 0))
                
                products.append(product)
            
            print(f"✅ Returning {len(products)} products")
        
        print(f"{'='*60}\n")
        
        return {
            "success": True,
            "sentiment": sentiment,
            "source": table,
            "page": page,
            "limit": limit,
            "filters_applied": {
                "category": category,
                "min_price": min_price,
                "max_price": max_price,
                "min_rating": min_rating,
                "date_range": date_range,
                "trending_only": trending_only,
                "sort_by": sort_by
            },
            "total_products": total_products,
            "total_pages": total_pages,
            "count": len(products),
            "data": products
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    





class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    business_name: Optional[str] = None
    location: str
    mobile_number: str

@router.put("/users/{user_id}")
def update_user_profile(
    user_id: int,
    data: UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile settings (requires authentication)"""
    try:
        # Check authorization
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this profile"
            )
        
        current_user.first_name = data.first_name
        current_user.last_name = data.last_name
        current_user.business_name = data.business_name
        current_user.location = data.location
        current_user.mobile_number = data.mobile_number
        current_user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "email": current_user.email,
                "business_name": current_user.business_name,
                "location": current_user.location,
                "mobile_number": current_user.mobile_number,
                "subscription_tier": current_user.subscription_tier,
                "updated_at": str(current_user.updated_at)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/users/{user_id}")
def delete_user_account(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    response: Response = None,
    db: Session = Depends(get_db)
):
    """
    Delete a user account.

    DPDP Retention Policy:
    - Legacy tracking data (products, ranks, alerts) → deleted IMMEDIATELY.
    - Core identity data (users_auth, profiles, consents) → SOFT-DELETED.
      A nightly scheduler hard-purges soft-deleted records after 30 days.
    """
    try:
        # Authorization check
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this account"
            )

        user_email = current_user.email

        # ── Immediate cleanup of all legacy tracking / analytics data ──────────

        # TrackedProduct + children
        user_products = db.query(models.TrackedProduct).filter(models.TrackedProduct.user_email == user_email).all()
        for prod in user_products:
            db.query(models.KeywordRankHistory).filter(models.KeywordRankHistory.tracked_product_id == prod.id).delete(synchronize_session=False)
            db.query(models.PriceAlert).filter(models.PriceAlert.tracked_product_id == prod.id).delete(synchronize_session=False)
        db.query(models.TrackedProduct).filter(models.TrackedProduct.user_email == user_email).delete(synchronize_session=False)

        # PriceAlert
        db.query(models.PriceAlert).filter(models.PriceAlert.user_email == user_email).delete(synchronize_session=False)

        # CompetitorSnapshot
        db.query(models.CompetitorSnapshot).filter(models.CompetitorSnapshot.user_email == user_email).delete(synchronize_session=False)

        # RankTracking
        db.query(models.RankTrackedKeyword).filter(models.RankTrackedKeyword.user_email == user_email).delete(synchronize_session=False)
        db.query(models.RankSnapshot).filter(models.RankSnapshot.user_email == user_email).delete(synchronize_session=False)
        db.query(models.RankAlertLog).filter(models.RankAlertLog.user_email == user_email).delete(synchronize_session=False)

        # ProductTrackerAnalysis
        db.query(models.ProductTrackerAnalysis).filter(models.ProductTrackerAnalysis.user_email == user_email).delete(synchronize_session=False)

        # Feedback
        db.query(models.Feedback).filter(models.Feedback.user_id == user_id).delete(synchronize_session=False)

        # KwTracked + children
        user_kws = db.query(models.KwTracked).filter(models.KwTracked.user_id == user_id).all()
        for kw in user_kws:
            db.query(models.KwRankHistory).filter(models.KwRankHistory.kw_id == kw.id).delete(synchronize_session=False)
            db.query(models.KwCompetitor).filter(models.KwCompetitor.kw_id == kw.id).delete(synchronize_session=False)
            db.query(models.KwAlertSettings).filter(models.KwAlertSettings.kw_id == kw.id).delete(synchronize_session=False)
        db.query(models.KwTracked).filter(models.KwTracked.user_id == user_id).delete(synchronize_session=False)

        # WhiteSpace
        db.query(models.WhiteSpaceWatchlist).filter(models.WhiteSpaceWatchlist.user_id == user_id).delete(synchronize_session=False)
        db.query(models.WhiteSpaceScan).filter(models.WhiteSpaceScan.user_id == user_id).delete(synchronize_session=False)

        # ── Soft-delete core identity data (DPDP 30-day grace period) ─────────
        from app.models.schema_v2 import UserAuth
        from datetime import datetime, timezone

        db.query(UserAuth).filter(UserAuth.id == user_id).update({
            "is_active": False,
            "deleted_at": datetime.now(timezone.utc),
        }, synchronize_session=False)

        # Record in deleted_users for compliance audit trail
        from app.models.schema_v2 import DeletedUser
        db.add(DeletedUser(
            email_hash=current_user.email_hash,
            deletion_reason="user_self_requested",
        ))

        db.commit()

        # ── Clear all active sessions immediately ──────────────────────────────
        delete_all_user_sessions(user_id)

        if response:
            response.delete_cookie(
                key="session_id",
                httponly=True,
                secure=SESSION_COOKIE_SECURE,
                samesite="lax",
            )

        return {
            "success": True,
            "message": (
                "Your account has been deactivated and your personal data is "
                "scheduled for permanent deletion within 30 days, as required "
                "by our data retention policy."
            )
        }
    except Exception as e:
        db.rollback()
        print(f"❌ Delete account error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting account: {str(e)}")



@router.get("/users/{user_id}/sessions")
def get_user_sessions(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    session_id: str = Cookie(None)
):
    """Retrieve all active login sessions for the user (requires authentication)"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view these sessions"
        )
    
    active_sessions = []
    try:
        user_sessions_key = f"user:sessions:{user_id}"
        session_tokens = r.smembers(user_sessions_key)
        
        expired_tokens = []
        for token_bytes in session_tokens:
            token = token_bytes.decode('utf-8') if isinstance(token_bytes, bytes) else token_bytes
            key = f"{SESSION_PREFIX}{token}"
            data = r.get(key)
            if data:
                session_data = json.loads(data)
                is_current = (token == session_id)
                active_sessions.append({
                    "session_token": token,
                    "device": session_data.get("device", "Unknown Device"),
                    "ip_address": session_data.get("ip_address", "Unknown IP"),
                    "location": session_data.get("location", "Unknown Location"),
                    "created_at": session_data.get("created_at"),
                    "is_current": is_current
                })
            else:
                expired_tokens.append(token)
                
        # Self-cleaning: remove any expired sessions from the user's set in background
        if expired_tokens:
            r.srem(user_sessions_key, *expired_tokens)
                
        active_sessions.sort(key=lambda s: (not s["is_current"], s.get("created_at", "")), reverse=True)
        return {"success": True, "sessions": active_sessions}
    except Exception as e:
        print(f"❌ Get user sessions error: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving sessions: {str(e)}")

@router.delete("/users/{user_id}/sessions/{session_token}")
def revoke_user_session(
    user_id: int,
    session_token: str,
    current_user: models.User = Depends(get_current_user)
):
    """Revoke a specific active session (log out another device)"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to revoke this session"
        )
    
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        data = r.get(key)
        if not data:
            raise HTTPException(status_code=404, detail="Session not found")
            
        session_data = json.loads(data)
        if session_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to revoke this session")
            
        delete_session(session_token)
        return {"success": True, "message": "Session revoked successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Revoke session error: {e}")
        raise HTTPException(status_code=500, detail=f"Error revoking session: {str(e)}")

class SubscriptionUpdate(BaseModel):
    user_id: int
    subscription_tier: str

class AIUsageUpdate(BaseModel):
    user_id: int
    increment: int = 1
    month: str

# ==================== SUBSCRIPTION ENDPOINTS ====================

@router.patch("/users/{user_id}/subscription")
def update_user_subscription(
    user_id: int, 
    data: SubscriptionUpdate, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Update user's subscription tier in database (requires authentication)
    
    Args:
        user_id: User ID
        data: SubscriptionUpdate with user_id and subscription_tier
        current_user: Authenticated user from session
    
    Returns:
        Success message with updated user data
    """
    try:
        # ✅ SECURITY: Verify user can only update their own subscription
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to update this subscription"
            )
        
        # Validate subscription tier
        valid_tiers = ['free', 'basic', 'premium', 'enterprise']
        if data.subscription_tier not in valid_tiers:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid subscription tier. Must be one of: {', '.join(valid_tiers)}"
            )
        
        # Update subscription tier
        current_user.subscription_tier = data.subscription_tier
        current_user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": f"Subscription updated to {data.subscription_tier}",
            "user": {
                "id": current_user.id,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "email": current_user.email,
                "subscription_tier": current_user.subscription_tier,
                "ai_chat_used": current_user.ai_chat_used,
                "ai_chat_month": current_user.ai_chat_month,
                "updated_at": str(current_user.updated_at)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== AI USAGE TRACKING ENDPOINTS ====================

@router.post("/users/{user_id}/ai-usage")
def track_ai_usage(
    user_id: int, 
    data: AIUsageUpdate, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Track and increment AI chat usage for the current month (requires authentication)
    Auto-resets counter if it's a new month
    
    Args:
        user_id: User ID
        data: AIUsageUpdate with increment and month
        current_user: Authenticated user from session
    
    Returns:
        Updated AI usage data
    """
    try:
        # ✅ SECURITY: Verify user can only track their own usage
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to update this user's AI usage"
            )
        
        current_month = data.month
        stored_month = current_user.ai_chat_month
        current_usage = current_user.ai_chat_used or 0
        
        # Reset counter if new month
        if stored_month != current_month:
            new_usage = data.increment
            print(f"🔄 Resetting AI usage for user {user_id} (new month: {current_month})")
        else:
            new_usage = current_usage + data.increment
            print(f"📊 Incrementing AI usage for user {user_id}: {current_usage} -> {new_usage}")
        
        # Update database
        current_user.ai_chat_used = new_usage
        current_user.ai_chat_month = current_month
        current_user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "ai_chat_used": current_user.ai_chat_used,
            "ai_chat_month": current_user.ai_chat_month,
            "message": "AI usage tracked successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/users/{user_id}/ai-usage")
def get_ai_usage(
    user_id: int, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Get current AI chat usage for the month (requires authentication)
    Auto-resets if viewing in a new month
    
    Args:
        user_id: User ID
        current_user: Authenticated user from session
    
    Returns:
        Current AI usage data
    """
    try:
        # ✅ SECURITY: Verify user can only view their own usage
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to view this user's AI usage"
            )
        
        current_month = datetime.now().strftime("%Y-%m")
        stored_month = current_user.ai_chat_month
        
        # Reset if new month
        if stored_month != current_month:
            usage = 0
        else:
            usage = current_user.ai_chat_used or 0
        
        return {
            "ai_chat_used": usage,
            "ai_chat_month": stored_month or current_month,
            "subscription_tier": current_user.subscription_tier or 'free'
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/users/{user_id}/profile")
def get_user_profile_complete(
    user_id: int, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Get complete user profile including subscription details (requires authentication)
    
    Args:
        user_id: User ID
        current_user: Authenticated user from session
    
    Returns:
        Complete user profile data
    """
    try:
        # ✅ SECURITY: Verify user can only view their own profile
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to view this profile"
            )
        
        return {
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "business_name": current_user.business_name,
            "location": current_user.location,
            "business_interests": current_user.business_interests,
            "subscription_tier": current_user.subscription_tier or 'free',
            "ai_chat_used": current_user.ai_chat_used or 0,
            "ai_chat_month": current_user.ai_chat_month,
            "created_at": str(current_user.created_at),
            "updated_at": str(current_user.updated_at) if current_user.updated_at else None,
            "is_active": current_user.is_active if hasattr(current_user, 'is_active') else True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== SUBSCRIPTION STATUS ENDPOINTS ====================

@router.get("/users/{user_id}/subscription-status")
def get_subscription_status(
    user_id: int, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Get detailed subscription status with usage limits (requires authentication)
    
    Args:
        user_id: User ID
        current_user: Authenticated user from session
    
    Returns:
        Subscription tier and all usage limits
    """
    try:
        # ✅ SECURITY: Verify user can only view their own subscription status
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to view this subscription status"
            )
        
        tier = current_user.subscription_tier or 'free'
        
        # Define limits based on tier
        tier_limits = {
            'free': {
                'maxAIChatMessagesPerMonth': 5,
                'maxTopN': 5,
                'hasChartAISummaries': False,
                'maxNotifications': 5,
                'maxFullAnalysesPerMonth': 5
            },
            'basic': {
                'maxAIChatMessagesPerMonth': 20,
                'maxTopN': 20,
                'hasChartAISummaries': True,
                'maxNotifications': 15,
                'maxFullAnalysesPerMonth': 20
            },
            'premium': {
                'maxAIChatMessagesPerMonth': float('inf'),
                'maxTopN': 100,
                'hasChartAISummaries': True,
                'maxNotifications': float('inf'),
                'maxFullAnalysesPerMonth': float('inf')
            },
            'enterprise': {
                'maxAIChatMessagesPerMonth': float('inf'),
                'maxTopN': float('inf'),
                'hasChartAISummaries': True,
                'maxNotifications': float('inf'),
                'maxFullAnalysesPerMonth': float('inf')
            }
        }
        
        current_month = datetime.now().strftime("%Y-%m")
        stored_month = current_user.ai_chat_month
        
        # Reset if new month
        if stored_month != current_month:
            ai_used = 0
        else:
            ai_used = current_user.ai_chat_used or 0
        
        # Convert inf to "unlimited" string for JSON serialization
        limits = tier_limits.get(tier, tier_limits['free'])
        serializable_limits = {}
        for key, value in limits.items():
            if value == float('inf'):
                serializable_limits[key] = "unlimited"
            else:
                serializable_limits[key] = value
        
        return {
            "user_id": user_id,
            "subscription_tier": tier,
            "limits": serializable_limits,
            "usage": {
                "ai_chat_used": ai_used,
                "ai_chat_month": stored_month or current_month
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/users/{user_id}/reset-ai-usage")
def reset_ai_usage(
    user_id: int, 
    current_user: models.User = Depends(get_current_user),  # ✅ Require authentication
    db: Session = Depends(get_db)
):
    """
    Manually reset AI usage counter (requires authentication)
    Users can only reset their own usage
    
    Args:
        user_id: User ID
        current_user: Authenticated user from session
    
    Returns:
        Success message
    """
    try:
        # ✅ SECURITY: Verify user can only reset their own usage
        if current_user.id != user_id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to reset this user's AI usage"
            )
        
        current_month = datetime.now().strftime("%Y-%m")
        
        current_user.ai_chat_used = 0
        current_user.ai_chat_month = current_month
        current_user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": "AI usage reset successfully",
            "data": {
                "id": current_user.id,
                "ai_chat_used": current_user.ai_chat_used,
                "ai_chat_month": current_user.ai_chat_month
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== KEYWORD INTELLIGENCE USAGE ENDPOINTS ====================

class KIUsageUpdate(BaseModel):
    user_id: int
    increment: int = 1

@router.post("/users/{user_id}/ki-usage")
def track_ki_usage(
    user_id: int,
    data: KIUsageUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Increment Keyword Intelligence search usage for the current billing cycle.
    Resets based on billing cycle (ki_cycle_start + 30 days), NOT calendar month.
    If ki_cycle_start is None (free user or never set), treats as fresh cycle from now.
    """
    try:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        now = datetime.now()
        cycle_start = current_user.ki_cycle_start
        current_used = current_user.ki_searches_used or 0

        # Determine if we are past the 30-day billing cycle
        if cycle_start and (now - cycle_start).days >= 30:
            # New cycle: reset counter and move cycle_start forward by 30-day increments
            cycles_elapsed = (now - cycle_start).days // 30
            new_cycle_start = cycle_start + timedelta(days=30 * cycles_elapsed)
            new_used = data.increment
            current_user.ki_cycle_start = new_cycle_start
            print(f"🔄 KI usage reset for user {user_id}: new cycle from {new_cycle_start.date()}")
        else:
            new_used = current_used + data.increment
            # If no cycle_start set yet (e.g. user just subscribed), set it now
            if not cycle_start:
                current_user.ki_cycle_start = now
            print(f"📊 KI usage incremented for user {user_id}: {current_used} → {new_used}")

        current_user.ki_searches_used = new_used
        current_user.updated_at = now
        db.commit()
        db.refresh(current_user)

        return {
            "success": True,
            "ki_searches_used": current_user.ki_searches_used,
            "ki_cycle_start": str(current_user.ki_cycle_start) if current_user.ki_cycle_start else None,
            "message": "KI usage tracked successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/users/{user_id}/ki-usage")
def get_ki_usage(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current Keyword Intelligence search usage for the active billing cycle.
    Resets automatically when the 30-day billing cycle rolls over.
    """
    try:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        now = datetime.now()
        cycle_start = current_user.ki_cycle_start
        current_used = current_user.ki_searches_used or 0

        # Auto-reset if billing cycle has rolled over (read-only: just return 0, don't write)
        if cycle_start and (now - cycle_start).days >= 30:
            used = 0
        else:
            used = current_used

        return {
            "ki_searches_used": used,
            "ki_cycle_start": str(cycle_start) if cycle_start else None,
            "subscription_tier": current_user.subscription_tier or "free"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==================== ADMIN ENDPOINTS (Optional) ====================

@router.patch("/admin/users/{user_id}/subscription")
def admin_update_subscription(
    user_id: int,
    data: SubscriptionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to update any user's subscription
    (Only for admin users - add admin check here)
    """
    try:
        # ✅ TODO: Add admin role check
        # if not current_user.is_admin:
        #     raise HTTPException(403, "Admin access required")
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        valid_tiers = ['free', 'basic', 'premium', 'enterprise']
        if data.subscription_tier not in valid_tiers:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid subscription tier. Must be one of: {', '.join(valid_tiers)}"
            )
        
        user.subscription_tier = data.subscription_tier
        user.updated_at = datetime.now()
        
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "message": f"Subscription updated to {data.subscription_tier} by admin",
            "user": {
                "id": user.id,
                "email": user.email,
                "subscription_tier": user.subscription_tier
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/admin/users/{user_id}/profile")
def admin_get_user_profile(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to view any user's profile
    (Only for admin users - add admin check here)
    """
    try:
        # ✅ TODO: Add admin role check
        # if not current_user.is_admin:
        #     raise HTTPException(403, "Admin access required")
        
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "business_name": user.business_name,
            "location": user.location,
            "business_interests": user.business_interests,
            "subscription_tier": user.subscription_tier or 'free',
            "ai_chat_used": user.ai_chat_used or 0,
            "ai_chat_month": user.ai_chat_month,
            "created_at": str(user.created_at),
            "updated_at": str(user.updated_at) if user.updated_at else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    

DB_TIMEOUT_MS = 8_000
 
SOV_TIER_LIMITS: Dict[str, int] = {
    "free":       1,
    "basic":      10,
    "premium":    -1,
    "enterprise": -1,
}
 
HHI_COMPETITIVE = 1_500   # < 1500 → easy to enter
HHI_MODERATE    = 2_500   # 1500–2500 → moderate
                           # > 2500 → hard to enter
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────────────────────────────────────────
 
class BrandShareData(BaseModel):
    brand:            str
    share_percentage: float
    total_reviews:    int
    total_sales:      int
    avg_rating:       Optional[float]
    avg_price:        Optional[float]
    product_count:    int
 
class MarketConcentration(BaseModel):
    hhi_score:        float
    label:            str
    top3_share:       float
    top1_share:       float
    entry_difficulty: str
    num_brands:       int
 
class ReviewVelocityItem(BaseModel):
    brand:            str
    total_reviews:    int
    review_density:   float
    velocity_label:   str
    share_percentage: float
 
class PriceGapItem(BaseModel):
    price_band:     str
    band_lo:        float
    band_hi:        float
    brand_count:    int
    total_products: int
    avg_rating:     float
    opportunity:    str
 
class LaunchReadinessScore(BaseModel):
    score:               int
    label:               str
    color:               str
    fragmentation_score: int
    price_gap_score:     int
    rating_gap_score:    int
    review_gap_score:    int
    reasoning:           List[str]
 
class ValueMapItem(BaseModel):
    brand:         str
    avg_price:     float
    avg_rating:    float
    total_reviews: int
    share_pct:     float
    quadrant:      str
 
class CategoryTrend(BaseModel):
    trend:            str
    signal:           str
    avg_reviews_new:  float
    avg_reviews_old:  float
    growth_proxy_pct: float
 
class ListingQualityBenchmark(BaseModel):
    median_title_length:   int
    median_reviews:        int
    pct_with_ratings:      float
    review_density_median: float
    your_brand_title_len:  Optional[int]
    your_brand_density:    Optional[float]
    your_brand_vs_median:  Optional[str]
 
# ── [NEW-A] Final Decision ──
class MarketDecision(BaseModel):
    verdict:     str    # "ENTER AGGRESSIVELY" | "ENTER WITH CAUTION" | "AVOID MARKET"
    color:       str    # "green" | "yellow" | "red"
    emoji:       str
    headline:    str
    sub_reasons: List[str]
 
# ── [NEW-B] Confidence Score ──
class ConfidenceScore(BaseModel):
    score:              float
    label:              str
    color:              str
    product_count:      int
    pct_with_ratings:   float
    rating_variance:    float
    price_completeness: float
    caveats:            List[str]
    tier_used:          str = ""
    sample_size:        int = 0
    has_sales_data:     bool = False
    has_review_data:    bool = False
    price_spread_pct:   float = 0.0

    def to_dict(self) -> dict:
        return self.dict()
 
# ── [NEW-C] Action Plan ──
class ActionStep(BaseModel):
    step:     int
    area:     str
    action:   str
    detail:   str
    timeline: str
    priority: str
    impact:   str
 
class ActionPlan(BaseModel):
    entry_price_recommendation: Optional[str]
    positioning_quadrant:       str
    steps:                      List[ActionStep]
 
 
# ─────────────────────────────────────────────────────────────────────────────
# SAFE TYPE HELPERS
# ─────────────────────────────────────────────────────────────────────────────
 
def safe_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "NULL":
        return default
    try:
        return float(Decimal(str(value))) if isinstance(value, Decimal) else float(value)
    except Exception:
        return default
 
def safe_int(value: Any, default: int = 0) -> int:
    if value is None or value == "NULL":
        return default
    try:
        return int(float(value))
    except Exception:
        return default
 
def extract_sales_number(sales_text: str) -> int:
    """Parse '9.4K+ bought', '2M bought', '1.2L bought' → int."""
    if not sales_text or sales_text == "NULL":
        return 0
    try:
        s = str(sales_text).upper().strip()
        m = re.search(r"([\d.]+)\s*([KMLC](?:R)?)?", s)
        if not m:
            return 0
        n    = float(m.group(1))
        unit = (m.group(2) or "").rstrip()
        mult = {"K": 1_000, "M": 1_000_000, "L": 100_000, "CR": 10_000_000}
        return int(n * mult.get(unit, 1))
    except Exception:
        return 0
 
 
# ─────────────────────────────────────────────────────────────────────────────
# DB TIMEOUT + ERROR HELPERS
# ─────────────────────────────────────────────────────────────────────────────
 
def _set_timeout(db: Session, ms: int = DB_TIMEOUT_MS) -> None:
    db.execute(text(f"SET LOCAL statement_timeout = {ms}"))
 
def _err(msg: str, code: int = 400) -> Dict:
    return {"success": False, "error": msg, "code": code}
 
 
# ─────────────────────────────────────────────────────────────────────────────
# OLLAMA HELPERS  (uses your existing OLLAMA_API_URL + MODEL_NAME)
# ─────────────────────────────────────────────────────────────────────────────
 
def _call_ollama(prompt: str, timeout: int = 60) -> str:
    try:
        resp = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=timeout,
        )
        if resp.status_code != 200:
            return ""
        raw = resp.json().get("response", "").strip()
        raw = raw.replace("<|MODEL_RESPONSE|>", "").replace("</s>", "").strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        return raw.strip()
    except Exception as e:
        print(f"[ollama] {e}")
        return ""
 
def _run_ollama_parallel(tasks: List[Tuple[str, int]]) -> List[str]:
    results: List[str] = [""] * len(tasks)
    future_to_idx: Dict[Any, int] = {}
    with ThreadPoolExecutor(max_workers=len(tasks)) as pool:
        for idx, (prompt, timeout) in enumerate(tasks):
            future_to_idx[pool.submit(_call_ollama, prompt, timeout)] = idx
        for future in as_completed(future_to_idx):
            try:
                results[future_to_idx[future]] = future.result()
            except Exception as e:
                print(f"[ollama] thread error: {e}")
    return results
 
 
# ─────────────────────────────────────────────────────────────────────────────
# USAGE / QUOTA HELPER
# ─────────────────────────────────────────────────────────────────────────────
 
def _check_and_increment_sov(user_id: Optional[int], db: Session) -> None:
    if not user_id:
        return
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    tier          = (user.subscription_tier or "free").lower()
    limit         = SOV_TIER_LIMITS.get(tier, 3)
    current_month = datetime.now().strftime("%Y-%m")
    if user.sov_month != current_month:
        user.sov_used  = 0
        user.sov_month = current_month
    if limit != -1 and (user.sov_used or 0) >= limit:
        raise HTTPException(
            status_code=403,
            detail=(
                f"You've reached your {tier.upper()} tier limit of {limit} SOV analyses "
                f"this month. Upgrade for more!"
            ),
        )
    user.sov_used = (user.sov_used or 0) + 1
    db.commit()
 
 
# ─────────────────────────────────────────────────────────────────────────────
# CORE SOV QUERY  (shared by all callers — no usage counter)
# ─────────────────────────────────────────────────────────────────────────────
 
def _get_category_sov_data(
    category_name: str,
    marketplace:   str,
    your_brand:    Optional[str],
    db:            Session,
) -> Dict:
    _set_timeout(db)
 
    if marketplace == "flipkart":
        query = text("""
            SELECT
                brand                                                   AS brand,
                COUNT(*)                                                AS product_count,
                COALESCE(SUM(product_rating_count),   0)               AS total_reviews,
                COALESCE(SUM(estimated_sales),        0)               AS total_sales,
                COALESCE(AVG(CAST(product_star_rating AS FLOAT)), 0)   AS avg_rating,
                COALESCE(AVG(product_price),          0)               AS avg_price
            FROM rapidapi_flipkart_products
            WHERE category_name = :cat
              AND brand IS NOT NULL
              AND brand NOT IN ('NULL', '', 'N/A')
            GROUP BY brand
            ORDER BY total_reviews DESC
            LIMIT 200
        """)
    else:
        query = text("""
            SELECT
               SPLIT_PART(product_title, ' ', 1) AS brand,
               COUNT(*)                                                AS product_count,
               COALESCE(SUM(product_num_ratings),    0)               AS total_reviews,
               COALESCE(SUM(avg_sales_volume),       0)               AS total_sales,
               COALESCE(AVG(product_star_rating_numeric), 0)          AS avg_rating,
               COALESCE(AVG(product_price_numeric),  0)               AS avg_price
            FROM rapidapi_amazon_products
            WHERE category_name = :cat
            GROUP BY SPLIT_PART(product_title, ' ', 1)
            ORDER BY total_reviews DESC
            LIMIT 200
        """)
 
    rows = db.execute(query, {"cat": category_name}).fetchall()
    if not rows:
        return _err(f"No data found for category: {category_name}", 404)
 
    total_reviews  = sum(safe_int(r[2]) for r in rows)
    total_sales    = sum(safe_int(r[3]) for r in rows)
    total_products = sum(safe_int(r[1]) for r in rows)
 
    brands: List[Dict]        = []
    your_brand_share: Optional[float] = None
    market_leader:    Optional[str]   = None
    max_share = 0.0
 
    for row in rows:
        brand_name   = str(row[0] or "Unknown").strip()
        review_count = safe_int(row[2])
        sales_count  = safe_int(row[3])
        share_pct    = (review_count / total_reviews * 100) if total_reviews > 0 else 0.0
 
        entry: Dict = {
            "brand":            brand_name,
            "share_percentage": round(share_pct, 2),
            "total_reviews":    review_count,
            "total_sales":      sales_count,
            "avg_rating":       round(safe_float(row[4]), 2),
            "avg_price":        round(safe_float(row[5]), 2),
            "product_count":    safe_int(row[1]),
        }
        brands.append(entry)
 
        if share_pct > max_share:
            max_share     = share_pct
            market_leader = brand_name
 
        if your_brand and brand_name.lower() == your_brand.lower():
            your_brand_share = share_pct
 
    return {
        "success":          True,
        "category_name":    category_name,
        "total_products":   total_products,
        "total_reviews":    total_reviews,
        "total_sales":      total_sales,
        "brands":           brands,
        "your_brand_share": round(your_brand_share, 2) if your_brand_share is not None else None,
        "market_leader":    market_leader,
        "marketplace":      marketplace,
    }
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-1]  MARKET CONCENTRATION  (HHI)
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_hhi(brands: List[Dict]) -> MarketConcentration:
    hhi  = sum((b["share_percentage"] ** 2) for b in brands)
    top1 = brands[0]["share_percentage"] if brands else 0.0
    top3 = sum(b["share_percentage"] for b in brands[:3])
 
    if hhi < HHI_COMPETITIVE:
        label, difficulty = "Competitive", "Easy"
    elif hhi < HHI_MODERATE:
        label, difficulty = "Moderate", "Moderate"
    else:
        label, difficulty = "Concentrated", "Hard"
 
    return MarketConcentration(
        hhi_score        = round(hhi, 1),
        label            = label,
        top3_share       = round(top3, 2),
        top1_share       = round(top1, 2),
        entry_difficulty = difficulty,
        num_brands       = len(brands),
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-2]  REVIEW VELOCITY
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_review_velocity(brands: List[Dict]) -> List[ReviewVelocityItem]:
    if not brands:
        return []
    densities = [b["total_reviews"] / max(b["product_count"], 1) for b in brands]
    sorted_d  = sorted(densities)
    median_d  = sorted_d[len(sorted_d) // 2]
 
    result: List[ReviewVelocityItem] = []
    for b, d in zip(brands, densities):
        if d > median_d * 1.25:
            vlabel = "Rising"
        elif d < median_d * 0.75:
            vlabel = "Declining"
        else:
            vlabel = "Stable"
        result.append(ReviewVelocityItem(
            brand            = b["brand"],
            total_reviews    = b["total_reviews"],
            review_density   = round(d, 1),
            velocity_label   = vlabel,
            share_percentage = b["share_percentage"],
        ))
    result.sort(key=lambda x: x.review_density, reverse=True)
    return result[:20]
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-3]  PRICE-GAP / WHITESPACE FINDER
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_price_gaps(brands: List[Dict], bucket_size: float = 500.0) -> List[PriceGapItem]:
    prices = [b["avg_price"] for b in brands if b["avg_price"] > 0]
    if not prices:
        return []
 
    min_p  = (min(prices) // bucket_size) * bucket_size
    max_p  = (max(prices) // bucket_size + 1) * bucket_size
    gaps:   List[PriceGapItem] = []
    band_lo = min_p
 
    while band_lo < max_p:
        band_hi = band_lo + bucket_size
        in_band = [b for b in brands if band_lo <= b["avg_price"] < band_hi]
        brand_c = len(in_band)
        prod_c  = sum(b["product_count"] for b in in_band)
        avg_r   = (
            sum(b["avg_rating"] for b in in_band if b["avg_rating"]) /
            max(sum(1 for b in in_band if b["avg_rating"]), 1)
        )
 
        if brand_c == 0:
            opp = "High"
        elif brand_c == 1 and avg_r < 3.8:
            opp = "High"
        elif brand_c <= 2:
            opp = "Medium"
        elif brand_c <= 4:
            opp = "Low"
        else:
            opp = "Crowded"
 
        gaps.append(PriceGapItem(
            price_band    = f"₹{int(band_lo):,}–₹{int(band_hi):,}",
            band_lo       = band_lo,
            band_hi       = band_hi,
            brand_count   = brand_c,
            total_products= prod_c,
            avg_rating    = round(avg_r, 2),
            opportunity   = opp,
        ))
        band_lo = band_hi
 
    return gaps
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-4]  LAUNCH READINESS SCORE
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_launch_readiness(
    brands:     List[Dict],
    hhi:        MarketConcentration,
    price_gaps: List[PriceGapItem],
) -> LaunchReadinessScore:
    reasoning: List[str] = []
 
    # Fragmentation
    if hhi.hhi_score < HHI_COMPETITIVE:
        frag = 25
        reasoning.append(f"Competitive market (HHI {hhi.hhi_score:.0f}) — easy to carve share.")
    elif hhi.hhi_score < HHI_MODERATE:
        frag = 13
        reasoning.append(f"Moderate concentration (HHI {hhi.hhi_score:.0f}) — needs differentiation.")
    else:
        frag = 0
        reasoning.append(f"Highly concentrated (HHI {hhi.hhi_score:.0f}) — tough to enter.")
 
    # Price gap
    high_opp = sum(1 for g in price_gaps if g.opportunity == "High")
    if high_opp >= 2:
        pgap = 25
        reasoning.append(f"{high_opp} price bands with no strong player — clear entry point.")
    elif high_opp == 1:
        pgap = 13
        reasoning.append("One underserved price band found.")
    else:
        pgap = 0
        reasoning.append("All price bands are covered by established brands.")
 
    # Rating gap
    ratings        = [b["avg_rating"] for b in brands if b["avg_rating"] and b["avg_rating"] > 0]
    avg_cat_rating = sum(ratings) / len(ratings) if ratings else 4.5
    if avg_cat_rating < 3.7:
        rgap = 25
        reasoning.append(f"Category avg rating is {avg_cat_rating:.1f}★ — easy to win on quality.")
    elif avg_cat_rating < 4.1:
        rgap = 13
        reasoning.append(f"Rating avg is {avg_cat_rating:.1f}★ — quality-focused brands can stand out.")
    else:
        rgap = 0
        reasoning.append(f"High rating bar ({avg_cat_rating:.1f}★) — quality must be excellent.")
 
    # Review gap
    densities   = [b["total_reviews"] / max(b["product_count"], 1) for b in brands]
    med_density = sorted(densities)[len(densities) // 2] if densities else 0
    if med_density < 50:
        revg = 25
        reasoning.append(f"Low review density ({med_density:.0f}/product) — early mover advantage.")
    elif med_density < 200:
        revg = 13
        reasoning.append(f"Moderate review density ({med_density:.0f}/product) — achievable in 3–6 months.")
    else:
        revg = 0
        reasoning.append(f"High review density ({med_density:.0f}/product) — review generation is hard.")
 
    total = frag + pgap + rgap + revg
    if total >= 75:
        label, color = "Strong Opportunity", "green"
    elif total >= 50:
        label, color = "Viable", "blue"
    elif total >= 25:
        label, color = "Risky", "orange"
    else:
        label, color = "Avoid", "red"
 
    return LaunchReadinessScore(
        score               = total,
        label               = label,
        color               = color,
        fragmentation_score = frag,
        price_gap_score     = pgap,
        rating_gap_score    = rgap,
        review_gap_score    = revg,
        reasoning           = reasoning,
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-5]  VALUE MAP
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_value_map(brands: List[Dict]) -> List[ValueMapItem]:
    prices  = [b["avg_price"]  for b in brands if b["avg_price"]  > 0]
    ratings = [b["avg_rating"] for b in brands if b["avg_rating"] and b["avg_rating"] > 0]
    if not prices or not ratings:
        return []
 
    med_p = sorted(prices)[len(prices) // 2]
    med_r = sorted(ratings)[len(ratings) // 2]
 
    result: List[ValueMapItem] = []
    for b in brands:
        p = b["avg_price"]  or 0
        r = b["avg_rating"] or 0
        if p <= 0 or r <= 0:
            continue
        high_p = p >= med_p
        high_r = r >= med_r
        if high_p and high_r:
            q = "Star"
        elif high_p and not high_r:
            q = "Overpriced"
        elif not high_p and high_r:
            q = "Budget Star"
        else:
            q = "Poor Value"
 
        result.append(ValueMapItem(
            brand         = b["brand"],
            avg_price     = round(p, 2),
            avg_rating    = round(r, 2),
            total_reviews = b["total_reviews"],
            share_pct     = b["share_percentage"],
            quadrant      = q,
        ))
    result.sort(key=lambda x: x.share_pct, reverse=True)
    return result[:30]
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-6]  CATEGORY TREND PROXY
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_category_trend(category_name: str, marketplace: str, db: Session) -> CategoryTrend:
    _set_timeout(db)
    try:
        if marketplace == "flipkart":
            q = text("""
                WITH ranked AS (
                    SELECT product_rating_count AS reviews,
                           ROW_NUMBER() OVER (ORDER BY id ASC)  AS rn_asc,
                           ROW_NUMBER() OVER (ORDER BY id DESC) AS rn_desc
                    FROM rapidapi_flipkart_products
                    WHERE category_name = :cat AND product_rating_count IS NOT NULL
                )
                SELECT
                    AVG(CASE WHEN rn_asc  <= 10 THEN reviews END) AS old_avg,
                    AVG(CASE WHEN rn_desc <= 10 THEN reviews END) AS new_avg
                FROM ranked
            """)
        else:
            q = text("""
                WITH ranked AS (
                    SELECT product_num_ratings AS reviews,
                           ROW_NUMBER() OVER (ORDER BY id ASC)  AS rn_asc,
                           ROW_NUMBER() OVER (ORDER BY id DESC) AS rn_desc
                    FROM rapidapi_amazon_products
                    WHERE category_name = :cat AND product_num_ratings IS NOT NULL
                )
                SELECT
                    AVG(CASE WHEN rn_asc  <= 10 THEN reviews END) AS old_avg,
                    AVG(CASE WHEN rn_desc <= 10 THEN reviews END) AS new_avg
                FROM ranked
            """)
        row     = db.execute(q, {"cat": category_name}).fetchone()
        old_avg = safe_float(row[0]) if row else 0.0
        new_avg = safe_float(row[1]) if row else 0.0
    except Exception as e:
        print(f"[trend] query error: {e}")
        old_avg, new_avg = 0.0, 0.0
 
    if old_avg <= 0:
        return CategoryTrend(
            trend="Unknown", signal="Insufficient data",
            avg_reviews_new=0, avg_reviews_old=0, growth_proxy_pct=0,
        )
 
    growth_proxy = ((new_avg - old_avg) / old_avg) * 100
    if growth_proxy > 20:
        trend  = "Growing"
        signal = f"New listings accumulate {growth_proxy:.0f}% more reviews than old ones — strong demand."
    elif growth_proxy > -10:
        trend  = "Stable"
        signal = "Review velocity is consistent — steady market."
    else:
        trend  = "Declining"
        signal = "Newer listings get fewer reviews — possible saturation or shifting demand."
 
    return CategoryTrend(
        trend            = trend,
        signal           = signal,
        avg_reviews_new  = round(new_avg, 1),
        avg_reviews_old  = round(old_avg, 1),
        growth_proxy_pct = round(growth_proxy, 1),
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-7]  LISTING QUALITY BENCHMARKS
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_listing_quality(
    category_name: str,
    marketplace:   str,
    your_brand:    Optional[str],
    db:            Session,
) -> ListingQualityBenchmark:
    _set_timeout(db)
    try:
        if marketplace == "flipkart":
            q = text("""
                SELECT brand,
                       LENGTH(product_title)              AS title_len,
                       product_rating_count               AS reviews,
                       COUNT(*) OVER (PARTITION BY brand) AS prod_count,
                       product_star_rating IS NOT NULL    AS has_rating
                FROM rapidapi_flipkart_products
                WHERE category_name = :cat AND product_title IS NOT NULL
            """)
        else:
            q = text("""
                SELECT SPLIT_PART(product_title, ' ', 1) AS brand,
                       LENGTH(product_title)              AS title_len,
                       product_num_ratings                AS reviews,
                       COUNT(*) OVER (PARTITION BY SPLIT_PART(product_title, ' ', 1)) AS prod_count,
                       product_star_rating_numeric IS NOT NULL AS has_rating
                FROM rapidapi_amazon_products
                WHERE category_name = :cat AND product_title IS NOT NULL
            """)
        rows = db.execute(q, {"cat": category_name}).fetchall()
    except Exception as e:
        print(f"[listing_quality] {e}")
        rows = []
 
    if not rows:
        return ListingQualityBenchmark(
            median_title_length=0, median_reviews=0, pct_with_ratings=0,
            review_density_median=0,
        )
 
    title_lens = sorted([safe_int(r[1]) for r in rows if r[1]])
    reviews    = sorted([safe_int(r[2]) for r in rows if r[2]])
    has_rating = [bool(r[4]) for r in rows]
    pct_rated  = sum(has_rating) / max(len(has_rating), 1) * 100
 
    med_title = title_lens[len(title_lens) // 2] if title_lens else 0
    med_rev   = reviews[len(reviews) // 2]        if reviews    else 0
 
    brand_groups: Dict[str, Dict] = {}
    for r in rows:
        bn = str(r[0] or "Unknown")
        if bn not in brand_groups:
            brand_groups[bn] = {"reviews": 0, "products": 0}
        brand_groups[bn]["reviews"]  += safe_int(r[2])
        brand_groups[bn]["products"] += 1
 
    densities   = sorted([v["reviews"] / max(v["products"], 1) for v in brand_groups.values()])
    med_density = densities[len(densities) // 2] if densities else 0.0
 
    your_title_len: Optional[int]   = None
    your_density:   Optional[float] = None
    your_vs_median: Optional[str]   = None
 
    if your_brand and your_brand in brand_groups:
        g            = brand_groups[your_brand]
        your_density = round(g["reviews"] / max(g["products"], 1), 1)
        your_rows    = [r for r in rows if str(r[0] or "").lower() == your_brand.lower()]
        if your_rows:
            your_title_len = safe_int(your_rows[0][1])
        if your_density > med_density * 1.15:
            your_vs_median = "Above"
        elif your_density < med_density * 0.85:
            your_vs_median = "Below"
        else:
            your_vs_median = "At"
 
    return ListingQualityBenchmark(
        median_title_length   = med_title,
        median_reviews        = med_rev,
        pct_with_ratings      = round(pct_rated, 1),
        review_density_median = round(med_density, 1),
        your_brand_title_len  = your_title_len,
        your_brand_density    = your_density,
        your_brand_vs_median  = your_vs_median,
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-A]  FINAL MARKET DECISION LAYER
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_market_decision(
    hhi:    MarketConcentration,
    launch: LaunchReadinessScore,
    trend:  CategoryTrend,
) -> MarketDecision:
    """
    Three-tier verdict combining HHI + launch score + trend:
      ENTER AGGRESSIVELY  — score ≥ 65, HHI < MODERATE, not declining
      ENTER WITH CAUTION  — score ≥ 40, HHI < 3500
      AVOID MARKET        — everything else
    """
    score     = launch.score
    hhi_val   = hhi.hhi_score
    declining = trend.trend == "Declining"
    sub: List[str] = []
 
    if score >= 65 and hhi_val < HHI_MODERATE and not declining:
        verdict = "ENTER AGGRESSIVELY"
        color   = "green"
        emoji   = "🚀"
        headline = (
            f"Strong opportunity: fragmented market (HHI {hhi_val:.0f}), "
            f"launch score {score}/100, {trend.trend.lower()} demand."
        )
        if score >= 75:
            sub.append(f"Launch score {score}/100 — top-quartile attractiveness.")
        if hhi_val < HHI_COMPETITIVE:
            sub.append("No single brand dominates — market share is up for grabs.")
        if trend.trend == "Growing":
            sub.append(f"Category is growing ({trend.growth_proxy_pct:+.1f}% review velocity).")
        sub.append("Recommend entering within 30 days before the window narrows.")
 
    elif score >= 40 and hhi_val < 3_500:
        verdict = "ENTER WITH CAUTION"
        color   = "yellow"
        emoji   = "⚠️"
        headline = (
            f"Viable but competitive: launch score {score}/100, "
            f"HHI {hhi_val:.0f} ({hhi.label})."
        )
        if declining:
            sub.append("Category trend is declining — demand may be softening.")
        if hhi_val >= HHI_MODERATE:
            sub.append(
                f"Market is moderately concentrated — top 3 brands hold {hhi.top3_share:.0f}% share."
            )
        if score < 55:
            sub.append("Launch score is below average — identify a clear niche before committing.")
        sub.append("Pilot with 2–3 SKUs before scaling inventory.")
 
    else:
        verdict = "AVOID MARKET"
        color   = "red"
        emoji   = "🚫"
        headline = (
            f"Poor entry conditions: launch score {score}/100, "
            f"HHI {hhi_val:.0f} ({hhi.label})."
        )
        if hhi_val >= 3_500:
            sub.append(f"Near-monopoly — top 3 brands hold {hhi.top3_share:.0f}% share.")
        if score < 25:
            sub.append(
                "Launch score critically low — no price gap, high existing ratings, "
                "high review moat."
            )
        if declining:
            sub.append("Category is declining — shrinking total addressable market.")
        sub.append("Consider adjacent categories with lower entry barriers.")
 
    return MarketDecision(
        verdict     = verdict,
        color       = color,
        emoji       = emoji,
        headline    = headline,
        sub_reasons = sub,
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-B]  DYNAMIC CONFIDENCE SCORE
# ─────────────────────────────────────────────────────────────────────────────
 
def _compute_confidence_score(brands: List[Dict]) -> ConfidenceScore:
    """
    Scores 0–100 based on data quality:
      - Product count       (more = higher confidence)
      - % brands with ratings (missing = penalty)
      - Rating variance     (high variance = uncertainty)
      - Price completeness  (missing prices = penalty)
    """
    caveats: List[str] = []
    score = 100
 
    # Product count
    total_products = sum(b["product_count"] for b in brands)
    if total_products < 20:
        score -= 30
        caveats.append(
            f"Only {total_products} products in dataset — sample too small for strong conclusions."
        )
    elif total_products < 50:
        score -= 15
        caveats.append(
            f"{total_products} products found — moderate sample; results are directionally accurate."
        )
 
    # Rating completeness
    with_rating = sum(1 for b in brands if b.get("avg_rating") and b["avg_rating"] > 0)
    pct_rated   = with_rating / max(len(brands), 1) * 100
    if pct_rated < 50:
        score -= 25
        caveats.append(
            f"Only {pct_rated:.0f}% of brands have rating data — quality signals unreliable."
        )
    elif pct_rated < 80:
        score -= 10
        caveats.append(f"{pct_rated:.0f}% of brands have ratings — some quality gaps exist.")
 
    # Rating variance
    ratings = [b["avg_rating"] for b in brands if b.get("avg_rating") and b["avg_rating"] > 0]
    if ratings:
        mean_r   = sum(ratings) / len(ratings)
        variance = sum((r - mean_r) ** 2 for r in ratings) / len(ratings)
    else:
        variance = 0.0
 
    if variance > 1.5:
        score -= 15
        caveats.append(
            f"High rating variance ({variance:.2f}) — category quality is inconsistent across brands."
        )
    elif variance > 0.8:
        score -= 5
        caveats.append(f"Moderate rating variance ({variance:.2f}) — some quality dispersion.")
 
    # Price completeness
    with_price = sum(1 for b in brands if b.get("avg_price") and b["avg_price"] > 0)
    pct_price  = with_price / max(len(brands), 1) * 100
    if pct_price < 60:
        score -= 15
        caveats.append(
            f"Only {pct_price:.0f}% of brands have price data — pricing analysis may be skewed."
        )
 
    score = max(0, min(100, score))
 
    if score >= 70:
        label, color = "High", "green"
    elif score >= 45:
        label, color = "Medium", "yellow"
    else:
        label, color = "Low", "red"
        caveats.append("Treat all metrics as directional signals, not definitive facts.")
 
    return ConfidenceScore(
        score              = score,
        label              = label,
        color              = color,
        product_count      = total_products,
        pct_with_ratings   = round(pct_rated, 1),
        rating_variance    = round(variance, 3),
        price_completeness = round(pct_price, 1),
        caveats            = caveats,
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-C]  ACTION PLAN GENERATOR
# ─────────────────────────────────────────────────────────────────────────────
 
def _generate_action_plan(
    brands:     List[Dict],
    hhi:        MarketConcentration,
    price_gaps: List[PriceGapItem],
    value_map:  List[ValueMapItem],
    launch:     LaunchReadinessScore,
    your_brand: Optional[str] = None,
) -> ActionPlan:
    """
    Concrete step-by-step entry plan covering:
      1. Pricing entry point   (based on price gaps)
      2. Review ramp strategy  (based on review density vs median)
      3. Positioning           (based on value map quadrant)
      4. Listing optimisation  (title + image + keyword)
      5. Launch phases         (30 / 60 / 90 day milestones)
    """
    steps:  List[ActionStep] = []
    step_n  = 1
 
    # ── STEP 1: Pricing Entry ──────────────────────────────────────────────
    high_gaps  = [g for g in price_gaps if g.opportunity == "High"]
    med_gaps   = [g for g in price_gaps if g.opportunity == "Medium"]
    best_gap   = (high_gaps + med_gaps + price_gaps or [None])[0]
    entry_price_rec: Optional[str] = None
 
    if best_gap:
        mid_price      = (best_gap.band_lo + best_gap.band_hi) / 2
        entry_price_rec = f"₹{int(best_gap.band_lo):,}–₹{int(best_gap.band_hi):,} (ideal ₹{int(mid_price):,})"
        steps.append(ActionStep(
            step     = step_n,
            area     = "Pricing",
            action   = f"Launch first SKU at {entry_price_rec}",
            detail   = (
                f"The {best_gap.price_band} band has only {best_gap.brand_count} competitor(s) "
                f"with avg rating {best_gap.avg_rating}★ — classified as '{best_gap.opportunity}' opportunity. "
                f"Price at ₹{int(mid_price):,} to anchor in the middle of the gap. "
                "Avoid the most crowded band until you have 50+ reviews."
            ),
            timeline = "Before launch (Day 0)",
            priority = "Critical",
            impact   = "Avoids direct price war; captures underserved demand from Day 1.",
        ))
    else:
        steps.append(ActionStep(
            step     = step_n,
            area     = "Pricing",
            action   = "Price 10–15% below category average",
            detail   = (
                "No clear whitespace band found. Compete on price initially "
                "to win first reviews quickly, then raise price once social proof is established."
            ),
            timeline = "Before launch (Day 0)",
            priority = "High",
            impact   = "Captures price-sensitive early buyers to seed reviews.",
        ))
    step_n += 1
 
    # ── STEP 2: Review Ramp ────────────────────────────────────────────────
    densities   = [b["total_reviews"] / max(b["product_count"], 1) for b in brands]
    med_density = sorted(densities)[len(densities) // 2] if densities else 100
    target_rev  = max(10, int(med_density * 0.5))  # reach 50% of median = visibility threshold
 
    steps.append(ActionStep(
        step     = step_n,
        area     = "Reviews",
        action   = f"Hit {target_rev} reviews per SKU within 60 days",
        detail   = (
            f"Category median review density is {med_density:.0f} reviews/product. "
            f"Reaching {target_rev} reviews (50% of median) makes you visible in organic search. "
            "Execute: automated post-purchase email sequence (Days 3, 7, 14 after delivery), "
            "insert card in packaging with QR code, and apply for platform early-reviewer programme "
            "(Amazon Vine / Flipkart Early Reviewer if eligible). "
            "Target verified buyers only — never incentivise directly."
        ),
        timeline = "Month 1–2",
        priority = "Critical",
        impact   = "Each 10-review milestone lifts click-through rate ~8% and improves organic rank.",
    ))
    step_n += 1
 
    # ── STEP 3: Positioning ───────────────────────────────────────────────
    overpriced   = [v for v in value_map if v.quadrant == "Overpriced"]
    budget_stars = [v for v in value_map if v.quadrant == "Budget Star"]
    pos_quadrant = "Mid-Market"
 
    if budget_stars:
        pos_quadrant = "Budget Star"
        target_b     = budget_stars[0]
        pos_detail   = (
            f"Target the 'Budget Star' quadrant: price below the category median "
            f"but deliver above-median quality. Benchmark: {target_b.brand} "
            f"(₹{target_b.avg_price:,.0f}, {target_b.avg_rating}★, {target_b.total_reviews} reviews). "
            "Win on unboxing experience, warranty, and responsive seller support."
        )
    elif overpriced:
        pos_quadrant = "Value Challenger"
        target_b     = overpriced[0]
        pos_detail   = (
            f"Attack the 'Overpriced' incumbent: {target_b.brand} is priced at "
            f"₹{target_b.avg_price:,.0f} with only {target_b.avg_rating}★ — "
            "their customers are dissatisfied. Launch at a lower price point with "
            "better quality signals: superior product images, more detailed listing, "
            "1-year warranty, and proactive customer support."
        )
    else:
        pos_detail = (
            "No clearly overpriced or budget-star brand found. Compete on listing quality: "
            "professional photography, keyword-rich title (target 80–120 characters), "
            "6 bullet points covering key use-cases, and A+ content if available."
        )
 
    steps.append(ActionStep(
        step     = step_n,
        area     = "Positioning",
        action   = f"Position as '{pos_quadrant}' in the value map",
        detail   = pos_detail,
        timeline = "Pre-launch to Month 1",
        priority = "High",
        impact   = "Clear positioning reduces ad spend needed and improves organic conversion rate.",
    ))
    step_n += 1
 
    # ── STEP 4: Listing Optimisation ──────────────────────────────────────
    steps.append(ActionStep(
        step     = step_n,
        area     = "Listing Quality",
        action   = "Launch with a fully optimised listing from Day 1",
        detail   = (
            "Title: 80–120 characters, lead with primary keyword, include size/colour/use-case. "
            "Images: minimum 6 images — white background hero, lifestyle shots, infographic with key specs, "
            "scale reference image, packaging shot. "
            "Bullets: 5–6 bullets, each starting with a capitalised benefit keyword. "
            "Backend keywords: fill all fields, use regional language variants (Hindi transliterations for IN market). "
            "Price: set a high MRP and meaningful discount to show savings badge."
        ),
        timeline = "Before launch (Day 0)",
        priority = "High",
        impact   = "Optimised listings convert 20–35% better than unoptimised ones at identical price.",
    ))
    step_n += 1
 
    # ── STEP 5: 30/60/90 Day Launch Phases ────────────────────────────────
    # Phase timelines depend on market difficulty
    if hhi.entry_difficulty == "Hard":
        phase_label = "slow-burn"
        p1_end, p2_end, p3_end = 45, 90, 180
    elif hhi.entry_difficulty == "Moderate":
        phase_label = "steady"
        p1_end, p2_end, p3_end = 30, 60, 90
    else:
        phase_label = "aggressive"
        p1_end, p2_end, p3_end = 21, 45, 90
 
    steps.append(ActionStep(
        step     = step_n,
        area     = "Launch Phase 1",
        action   = f"Days 1–{p1_end}: Seed reviews and establish baseline rank",
        detail   = (
            f"Run auto-targeting sponsored ads at 1.5× category average CPC for first {p1_end} days. "
            "Goal: 50–100 daily impressions, collect search term report data. "
            f"Target: {min(target_rev, 25)} reviews and a 4.0★+ rating before moving to Phase 2. "
            "Offer a 10–15% launch discount via coupon (not direct price cut) to boost conversion."
        ),
        timeline = f"Days 1–{p1_end}",
        priority = "Critical",
        impact   = f"Builds the review floor needed for organic visibility — {'fast' if phase_label == 'aggressive' else 'steady'} ramp.",
    ))
    step_n += 1
 
    steps.append(ActionStep(
        step     = step_n,
        area     = "Launch Phase 2",
        action   = f"Days {p1_end + 1}–{p2_end}: Scale what works, kill what doesn't",
        detail   = (
            "Switch from auto to manual campaigns using top search terms from Phase 1. "
            "Increase budget on top-3 performing keywords by 50%. "
            "A/B test two title variants and two hero images using platform split-test tools. "
            "Expand to 2–3 additional SKUs (variants: colour, size, bundle) using Phase 1 learnings. "
            "Respond to every review — positive and negative — within 24 hours."
        ),
        timeline = f"Days {p1_end + 1}–{p2_end}",
        priority = "High",
        impact   = "Multiplies revenue without proportional ad spend increase.",
    ))
    step_n += 1
 
    steps.append(ActionStep(
        step     = step_n,
        area     = "Launch Phase 3",
        action   = f"Days {p2_end + 1}–{p3_end}: Dominate the price-gap band and defend",
        detail   = (
            "By this phase you should have 50%+ of median review density. "
            "Raise price to the mid-point of your target price band if you used launch discounts. "
            "Launch a premium SKU targeting the next price band up. "
            "Set up brand store page and run brand awareness campaigns. "
            "Monitor and respond to any new entrants copying your strategy."
        ),
        timeline = f"Days {p2_end + 1}–{p3_end}",
        priority = "Medium",
        impact   = "Locks in market share and begins margin recovery after launch-phase discounting.",
    ))
 
    return ActionPlan(
        entry_price_recommendation = entry_price_rec,
        positioning_quadrant       = pos_quadrant,
        steps                      = steps,
    )
 
 
# ─────────────────────────────────────────────────────────────────────────────
# FALLBACK GROWTH STRATEGY
# ─────────────────────────────────────────────────────────────────────────────
 
def _generate_fallback_strategy(
    gap: float, target_days: int, current_share: float,
    target_share: float, num_phases: int,
) -> List[Dict]:
    days_per_phase = max(1, target_days // num_phases)
    strategies     = []
    for i in range(num_phases):
        start_day    = i * days_per_phase + 1
        end_day      = (i + 1) * days_per_phase if i < num_phases - 1 else target_days
        phase_target = round(current_share + (gap * (i + 1) / num_phases), 2)
 
        if i == 0:
            focus   = "Quick Wins & Foundation"
            actions = [
                "Launch review-generation campaign with post-purchase email sequences.",
                "Optimise top-5 product listings: keywords, images, bullet points.",
                "Run limited-time promotional pricing on bestsellers.",
                "Set up automated customer feedback loop.",
            ]
        elif i == num_phases - 1:
            focus        = "Market Dominance & Scaling"
            phase_target = target_share
            actions      = [
                "Scale proven products with increased inventory and ad budget.",
                "Launch premium SKU to capture higher-margin segment.",
                "Implement customer loyalty and referral programme.",
                "Expand to adjacent categories using this category's playbook.",
            ]
        elif i == 1:
            focus   = "Product Expansion & Marketing"
            actions = [
                "Add 5–7 product variants based on competitor price-gap analysis.",
                "Launch micro-influencer marketing campaign (10K–100K followers).",
                "Upgrade product photography with lifestyle shots and video.",
                "Run A/B tests on titles, pricing, and primary images.",
            ]
        else:
            focus   = "Growth Acceleration"
            actions = [
                "Expand catalogue with data-driven product selections.",
                "Launch seasonal promotions and bundle offers.",
                "Monitor and undercut competitors gaining share.",
                "Increase ad spend on top-performing ASINs/listings.",
            ]
 
        strategies.append({
            "phase":   f"Phase {i + 1} (Days {start_day}–{end_day})",
            "focus":   focus,
            "actions": actions,
            "target":  f"{phase_target}% market share",
        })
    return strategies
 
 
# ═════════════════════════════════════════════════════════════════════════════
# HTTP ENDPOINTS  (use `app` — paste these into Fastapi_main.py)
# ═════════════════════════════════════════════════════════════════════════════
 
# ─────────────────────────────────────────────────────────────────────────────
# USAGE
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/users/{user_id}/sov-usage")
async def get_sov_usage(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        tier          = (user.subscription_tier or "free").lower()
        limit         = SOV_TIER_LIMITS.get(tier, 3)
        current_month = datetime.now().strftime("%Y-%m")
        if user.sov_month != current_month:
            user.sov_used  = 0
            user.sov_month = current_month
            db.commit()
            db.refresh(user)
        count     = user.sov_used or 0
        remaining = (limit - count) if limit != -1 else -1
        return {
            "count": count, "limit": limit, "remaining": remaining,
            "subscription_tier": tier, "month": current_month,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching SOV usage: {e}")
 
 
# ─────────────────────────────────────────────────────────────────────────────
# CATEGORIES LIST
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/categories")
def get_sov_categories(
    marketplace: str = Query(default="all", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db),
):
    try:
        cats: set = set()
        _set_timeout(db)
        if marketplace in ("flipkart", "all"):
            rows = db.execute(text(
                "SELECT DISTINCT category_name FROM rapidapi_flipkart_products "
                "WHERE category_name IS NOT NULL AND category_name NOT IN ('NULL','') "
                "ORDER BY category_name"
            )).fetchall()
            cats.update(r[0] for r in rows if r[0])
        if marketplace in ("amazon", "all"):
            rows = db.execute(text(
                "SELECT DISTINCT category_name FROM rapidapi_amazon_products "
                "WHERE category_name IS NOT NULL AND category_name NOT IN ('NULL','') "
                "ORDER BY category_name"
            )).fetchall()
            cats.update(r[0] for r in rows if r[0])
        return {"categories": sorted(cats)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# CATEGORY SOV
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/category/{category_name}")
async def get_category_sov(
    category_name: str,
    marketplace:   str           = Query(default="flipkart", enum=["flipkart", "amazon"]),
    your_brand:    Optional[str] = Query(default=None),
    user_id:       Optional[int] = Query(default=None),
    db:            Session       = Depends(get_db),
):
    try:
        _check_and_increment_sov(user_id, db)
        data = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not data.get("success"):
            raise HTTPException(status_code=404, detail=data["error"])
        return data
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# KEYWORD SOV
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/keyword/{keyword}")
async def get_keyword_sov(
    keyword:    str,
    marketplace: str            = Query(default="flipkart", enum=["flipkart", "amazon"]),
    price_min:  Optional[float] = Query(default=None, ge=0),
    price_max:  Optional[float] = Query(default=None, ge=0),
    user_id:    Optional[int]   = Query(default=None),
    db:         Session         = Depends(get_db),
):
    try:
        _check_and_increment_sov(user_id, db)
        _set_timeout(db)
 
        params: Dict[str, Any] = {"kw": f"%{keyword}%"}
 
        if marketplace == "flipkart":
            price_cond = ""
            if price_min is not None:
                price_cond += " AND product_price >= :pmin"
                params["pmin"] = price_min
            if price_max is not None:
                price_cond += " AND product_price <= :pmax"
                params["pmax"] = price_max
            q = text(f"""
                SELECT brand,
                       COUNT(*)                                              AS product_count,
                       COALESCE(SUM(product_rating_count), 0)               AS total_reviews,
                       COALESCE(SUM(estimated_sales),      0)               AS total_sales,
                       COALESCE(AVG(CAST(product_star_rating AS FLOAT)), 0) AS avg_rating,
                       COALESCE(AVG(product_price), 0)                      AS avg_price,
                       MIN(product_price)                                   AS min_price,
                       MAX(product_price)                                   AS max_price
                FROM rapidapi_flipkart_products
                WHERE (LOWER(product_title) LIKE LOWER(:kw)
                    OR LOWER(category_name)  LIKE LOWER(:kw))
                  AND brand IS NOT NULL AND brand NOT IN ('NULL','')
                  {price_cond}
                GROUP BY brand
                ORDER BY total_reviews DESC
                LIMIT 100
            """)
        else:
            price_cond = ""
            if price_min is not None:
                price_cond += " AND product_price_numeric >= :pmin"
                params["pmin"] = price_min
            if price_max is not None:
                price_cond += " AND product_price_numeric <= :pmax"
                params["pmax"] = price_max
            q = text(f"""
                SELECT SPLIT_PART(product_title, ' ', 1)                        AS brand,
                       COUNT(*)                                                  AS product_count,
                       COALESCE(SUM(product_num_ratings),    0)                 AS total_reviews,
                       COALESCE(SUM(avg_sales_volume),       0)                 AS total_sales,
                       COALESCE(AVG(product_star_rating_numeric), 0)            AS avg_rating,
                       COALESCE(AVG(product_price_numeric),  0)                 AS avg_price,
                       MIN(product_price_numeric)                               AS min_price,
                       MAX(product_price_numeric)                               AS max_price
                FROM rapidapi_amazon_products
                WHERE (LOWER(product_title) LIKE LOWER(:kw)
                    OR LOWER(category_name)  LIKE LOWER(:kw))
                  {price_cond}
                GROUP BY SPLIT_PART(product_title, ' ', 1)
                ORDER BY total_reviews DESC
                LIMIT 100
            """)
 
        rows = db.execute(q, params).fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail=f"No products found for keyword: {keyword}")
 
        total_reviews  = sum(safe_int(r[2]) for r in rows)
        total_products = sum(safe_int(r[1]) for r in rows)
        min_p          = min((safe_float(r[6]) for r in rows if r[6]), default=0.0)
        max_p          = max((safe_float(r[7]) for r in rows if r[7]), default=0.0)
 
        brands = []
        for row in rows:
            rc    = safe_int(row[2])
            share = (rc / total_reviews * 100) if total_reviews > 0 else 0.0
            brands.append({
                "brand":            str(row[0] or "Unknown"),
                "share_percentage": round(share, 2),
                "total_reviews":    rc,
                "total_sales":      safe_int(row[3]),
                "avg_rating":       round(safe_float(row[4]), 2),
                "avg_price":        round(safe_float(row[5]), 2),
                "product_count":    safe_int(row[1]),
            })
 
        return {
            "keyword":        keyword,
            "total_products": total_products,
            "total_reviews":  total_reviews,
            "brands":         brands,
            "price_range":    {"min": round(min_p, 2), "max": round(max_p, 2)},
            "marketplace":    marketplace,
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# PROGRESS TRACKING
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/progress/{category_name}")
def track_sov_progress(
    category_name: str,
    your_brand:    str,
    target_share:  float   = Query(default=20.0, ge=0, le=100),
    target_days:   int     = Query(default=90, ge=1),
    marketplace:   str     = Query(default="flipkart", enum=["flipkart", "amazon"]),
    db:            Session = Depends(get_db),
):
    try:
        current_sov = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not current_sov.get("success"):
            raise HTTPException(status_code=404, detail=current_sov["error"])
 
        current_share  = current_sov.get("your_brand_share") or 0.0
        now            = datetime.now()
        start_date     = now - timedelta(days=30)
        target_date    = now + timedelta(days=target_days)
        days_elapsed   = max(1, (now - start_date).days)
        days_remaining = max(0, target_days)
 
        required_growth = (target_share - current_share) / target_days if target_days > 0 else 0
        actual_growth   = current_share / days_elapsed if days_elapsed > 0 else 0
        is_on_track     = actual_growth >= required_growth
 
        total_reviews = current_sov["total_reviews"]
        total_sales   = current_sov["total_sales"]
 
        weekly_progress = []
        for week in range(min(12, (days_elapsed + target_days) // 7 + 1)):
            wdate      = start_date + timedelta(weeks=week)
            proj_share = min(current_share + actual_growth * week * 7, 100)
            weekly_progress.append({
                "date":             wdate.strftime("%Y-%m-%d"),
                "share_percentage": round(proj_share, 2),
                "reviews":          int(total_reviews * proj_share / 100),
                "sales":            int(total_sales   * proj_share / 100),
            })
 
        return {
            "category_name":        category_name,
            "your_brand":           your_brand,
            "current_share":        round(current_share, 2),
            "target_share":         target_share,
            "start_date":           start_date.strftime("%Y-%m-%d"),
            "target_date":          target_date.strftime("%Y-%m-%d"),
            "days_elapsed":         days_elapsed,
            "days_remaining":       days_remaining,
            "is_on_track":          is_on_track,
            "required_growth_rate": round(required_growth, 4),
            "actual_growth_rate":   round(actual_growth, 4),
            "weekly_progress":      weekly_progress,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# COMPETITOR ANALYSIS
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/competitors/{category_name}")
def analyze_sov_competitors(
    category_name: str,
    your_brand:    str,
    marketplace:   str     = Query(default="flipkart", enum=["flipkart", "amazon"]),
    limit:         int     = Query(default=10, ge=1, le=50),
    db:            Session = Depends(get_db),
):
    try:
        sov = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not sov.get("success"):
            raise HTTPException(status_code=404, detail=sov["error"])
 
        competitors = [
            {
                "competitor_name": b["brand"],
                "market_share":    b["share_percentage"],
                "avg_price":       b["avg_price"],
                "total_products":  b["product_count"],
                "avg_rating":      b["avg_rating"],
                "total_reviews":   b["total_reviews"],
                "total_sales":     b["total_sales"],
            }
            for b in sov["brands"]
            if b["brand"].lower() != your_brand.lower()
        ]
        competitors.sort(key=lambda x: x["market_share"], reverse=True)
        return {"competitors": competitors[:limit]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# COMBINED SOV (Flipkart + Amazon)
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/combined/{category_name}")
def get_combined_sov(
    category_name: str,
    your_brand:    Optional[str] = Query(default=None),
    db:            Session       = Depends(get_db),
):
    try:
        fk = _get_category_sov_data(category_name, "flipkart", your_brand, db)
        am = _get_category_sov_data(category_name, "amazon",   your_brand, db)
 
        if not fk.get("success") and not am.get("success"):
            raise HTTPException(status_code=404, detail="No data found in either marketplace.")
 
        brand_map: Dict[str, Dict] = {}
        for data in [fk, am]:
            if not data.get("success"):
                continue
            for b in data["brands"]:
                key = b["brand"].lower()
                if key not in brand_map:
                    brand_map[key] = {
                        "name": b["brand"], "reviews": 0, "sales": 0,
                        "products": 0, "ratings": [], "prices": [],
                    }
                brand_map[key]["reviews"]  += b["total_reviews"]
                brand_map[key]["sales"]    += b["total_sales"]
                brand_map[key]["products"] += b["product_count"]
                if b["avg_rating"]: brand_map[key]["ratings"].append(b["avg_rating"])
                if b["avg_price"]:  brand_map[key]["prices"].append(b["avg_price"])
 
        total_rev            = sum(v["reviews"] for v in brand_map.values())
        combined             = []
        your_combined_share: Optional[float] = None
 
        for key, v in brand_map.items():
            share = (v["reviews"] / total_rev * 100) if total_rev > 0 else 0.0
            entry = {
                "brand":            v["name"],
                "share_percentage": round(share, 2),
                "total_reviews":    v["reviews"],
                "total_sales":      v["sales"],
                "avg_rating":       round(sum(v["ratings"]) / len(v["ratings"]), 2) if v["ratings"] else None,
                "avg_price":        round(sum(v["prices"])  / len(v["prices"]),  2) if v["prices"]  else None,
                "product_count":    v["products"],
            }
            combined.append(entry)
            if your_brand and key == your_brand.lower():
                your_combined_share = share
 
        combined.sort(key=lambda x: x["share_percentage"], reverse=True)
        return {
            "category_name":             category_name,
            "combined_brands":           combined,
            "flipkart_data":             fk if fk.get("success") else None,
            "amazon_data":               am if am.get("success") else None,
            "your_brand_combined_share": round(your_combined_share, 2) if your_combined_share else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# BRANDS LIST
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/brands")
def get_all_brands(
    marketplace: str = Query(default="all", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db),
):
    try:
        brands: set = set()
        _set_timeout(db)
        if marketplace in ("flipkart", "all"):
            rows = db.execute(text(
                "SELECT DISTINCT brand FROM rapidapi_flipkart_products "
                "WHERE brand IS NOT NULL AND brand NOT IN ('NULL','') ORDER BY brand"
            )).fetchall()
            brands.update(r[0] for r in rows if r[0])
        if marketplace in ("amazon", "all"):
            rows = db.execute(text(
                "SELECT DISTINCT SPLIT_PART(product_title, ' ', 1) AS brand "
                "FROM rapidapi_amazon_products "
                "WHERE product_title IS NOT NULL "
                "ORDER BY brand"
            )).fetchall()
            brands.update(r[0] for r in rows if r[0])
        return {"brands": sorted(brands)[:200]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-8]  CSV EXPORT
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/export/{category_name}")
def export_sov_csv(
    category_name: str,
    marketplace:   str           = Query(default="flipkart", enum=["flipkart", "amazon"]),
    your_brand:    Optional[str] = Query(default=None),
    user_id:       Optional[int] = Query(default=None),
    db:            Session       = Depends(get_db),
):
    try:
        data = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not data.get("success"):
            raise HTTPException(status_code=404, detail=data["error"])
 
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "brand", "share_percentage", "total_reviews", "total_sales",
            "avg_rating", "avg_price", "product_count",
        ])
        writer.writeheader()
        for b in data["brands"]:
            writer.writerow({k: b.get(k, "") for k in writer.fieldnames})
 
        output.seek(0)
        filename = f"sov_{marketplace}_{category_name.replace(' ', '_')}.csv"
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-9]  MARKET HEALTH  ← MAIN UPDATED ENDPOINT
#          Now includes: [NEW-A] decision, [NEW-B] confidence, [NEW-C] action plan
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/market-health/{category_name}")
def get_market_health(
    category_name: str,
    marketplace:   str           = Query(default="flipkart", enum=["flipkart", "amazon"]),
    your_brand:    Optional[str] = Query(default=None),
    user_id:       Optional[int] = Query(default=None),
    db:            Session       = Depends(get_db),
):
    """
    One-stop seller dashboard.  Returns everything needed to decide
    whether to enter, expand, or exit a category.
 
    Sections in response:
      sov_summary          — total brands / products / reviews / leader
      concentration        — HHI score and label
      trend                — Growing / Stable / Declining
      launch_readiness     — 0–100 composite score
      market_decision      — [NEW-A] ENTER AGGRESSIVELY / CAUTION / AVOID
      confidence_score     — [NEW-B] data quality score with caveats
      action_plan          — [NEW-C] step-by-step entry plan
      top_price_gaps       — High/Medium opportunity price bands
      value_map            — price vs rating quadrants
      review_velocity      — who has momentum
      listing_quality      — category listing benchmarks
    """
    try:
        _check_and_increment_sov(user_id, db)
 
        sov = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not sov.get("success"):
            raise HTTPException(status_code=404, detail=sov["error"])
 
        brands = sov["brands"]
 
        # ── core analytics ──
        hhi        = _compute_hhi(brands)
        price_gaps = _compute_price_gaps(brands)
        launch     = _compute_launch_readiness(brands, hhi, price_gaps)
        trend      = _compute_category_trend(category_name, marketplace, db)
        value_map  = _compute_value_map(brands)
        velocity   = _compute_review_velocity(brands)
        listing_q  = _compute_listing_quality(category_name, marketplace, your_brand, db)
 
        # ── new decision layers ──
        decision    = _compute_market_decision(hhi, launch, trend)         # [NEW-A]
        confidence  = _compute_confidence_score(brands)                     # [NEW-B]
        action_plan = _generate_action_plan(                                # [NEW-C]
            brands, hhi, price_gaps, value_map, launch, your_brand
        )
 
        return {
            # ── summary ──
            "category_name": category_name,
            "marketplace":   marketplace,
            "generated_at":  datetime.utcnow().isoformat() + "Z",
            "sov_summary": {
                "total_brands":     len(brands),
                "total_products":   sov["total_products"],
                "total_reviews":    sov["total_reviews"],
                "total_sales":      sov["total_sales"],
                "market_leader":    sov["market_leader"],
                "your_brand_share": sov["your_brand_share"],
            },
 
            # ── core analytics ──
            "concentration":    hhi.dict(),
            "trend":            trend.dict(),
            "launch_readiness": launch.dict(),
 
            # ── [NEW-A] final verdict ──
            "market_decision": decision.dict(),
 
            # ── [NEW-B] data quality ──
            "confidence_score": confidence.dict(),
 
            # ── [NEW-C] action plan ──
            "action_plan": action_plan.dict(),
 
            # ── supporting data ──
            "top_price_gaps":   [g.dict() for g in price_gaps if g.opportunity in ("High", "Medium")][:8],
            "all_price_gaps":   [g.dict() for g in price_gaps],
            "value_map":        [v.dict() for v in value_map[:20]],
            "review_velocity":  [v.dict() for v in velocity],
            "listing_quality":  listing_q.dict(),
        }
 
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# [NEW-10]  PRICING MAP
# ─────────────────────────────────────────────────────────────────────────────
 
@router.get("/api/sov/pricing-map/{category_name}")
def get_pricing_map(
    category_name: str,
    marketplace:   str   = Query(default="flipkart", enum=["flipkart", "amazon"]),
    bucket_size:   float = Query(default=500.0, ge=100, le=5000),
    db:            Session = Depends(get_db),
):
    try:
        sov = _get_category_sov_data(category_name, marketplace, None, db)
        if not sov.get("success"):
            raise HTTPException(status_code=404, detail=sov["error"])
        gaps = _compute_price_gaps(sov["brands"], bucket_size=bucket_size)
        return {
            "category_name": category_name,
            "marketplace":   marketplace,
            "bucket_size":   bucket_size,
            "price_bands":   [g.dict() for g in gaps],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ─────────────────────────────────────────────────────────────────────────────
# AI INSIGHTS
# ─────────────────────────────────────────────────────────────────────────────
 
@router.post("/api/sov/ai-insights")
def get_ai_insights(
    category_name: str   = Query(...),
    your_brand:    str   = Query(...),
    target_share:  float = Query(default=25.0),
    target_days:   int   = Query(default=60),
    marketplace:   str   = Query(default="flipkart", enum=["flipkart", "amazon"]),
    db:            Session = Depends(get_db),
):
    try:
        sov = _get_category_sov_data(category_name, marketplace, your_brand, db)
        if not sov.get("success"):
            return {
                "error":               sov["error"],
                "ai_generated_insights": "Cannot generate insights without valid SOV data.",
            }
 
        brands        = sov["brands"]
        current_share = sov.get("your_brand_share") or 0.0
        market_leader = sov.get("market_leader")
 
        if not brands:
            return {"error": "No brand data found.", "ai_generated_insights": "No brands in this category."}
 
        your_brand_data = next((b for b in brands if b["brand"].lower() == your_brand.lower()), None)
        if not your_brand_data:
            available = [b["brand"] for b in brands[:10]]
            return {
                "error":                 f"Brand '{your_brand}' not found in {marketplace}.",
                "ai_generated_insights": f"Available brands: {', '.join(available)}",
                "available_brands":      available,
            }
 
        leader_data    = next((b for b in brands if b["brand"] == market_leader), None)
        your_products  = your_brand_data.get("product_count",  0) or 0
        your_avg_price = your_brand_data.get("avg_price",      0) or 0
        your_avg_rating= your_brand_data.get("avg_rating",     0) or 0
        your_reviews   = your_brand_data.get("total_reviews",  0) or 0
        leader_share   = (leader_data.get("share_percentage", 0) or 0) if leader_data else 0
        rank           = next(
            (i + 1 for i, b in enumerate(brands) if b["brand"].lower() == your_brand.lower()), None
        )
        gap          = target_share - current_share
        total_brands = len(brands)
        num_phases   = 2 if target_days <= 30 else (3 if target_days <= 60 else 4)
        top_5        = brands[:5]
 
        competitor_lines = "\n".join(
            f"- {b['brand']}: {b['share_percentage']}% share, {b['product_count']} products, "
            f"₹{b['avg_price']} avg price, {b['avg_rating']}★"
            for b in top_5 if b["brand"].lower() != your_brand.lower()
        ) or "- No competitor data available"
 
        hhi        = _compute_hhi(brands)
        price_gaps = _compute_price_gaps(brands)
        launch     = _compute_launch_readiness(brands, hhi, price_gaps)
        decision   = _compute_market_decision(hhi, launch,
                         _compute_category_trend(category_name, marketplace, db))
        confidence = _compute_confidence_score(brands)
        action_plan= _generate_action_plan(brands, hhi, price_gaps,
                         _compute_value_map(brands), launch, your_brand)
        high_gaps  = [g for g in price_gaps if g.opportunity == "High"]
 
        ai_prompt = (
            "You are an expert e-commerce market analyst. Analyse the data below.\n\n"
            "MARKET DATA:\n"
            f"- Marketplace: {marketplace.upper()} | Category: {category_name}\n"
            f"- Brand: {your_brand} | Rank: #{rank} of {total_brands}\n"
            f"- Current Share: {current_share}% | Target: {target_share}% | Timeline: {target_days} days\n"
            f"- Market Leader: {market_leader} ({leader_share:.1f}% share)\n"
            f"- Market HHI: {hhi.hhi_score:.0f} ({hhi.label}) | Entry: {hhi.entry_difficulty}\n"
            f"- Launch Score: {launch.score}/100 ({launch.label})\n"
            f"- Market Verdict: {decision.verdict}\n"
            f"- Data Confidence: {confidence.label} ({confidence.score}/100)\n"
            f"- Price Whitespace: {len(high_gaps)} high-opportunity bands\n\n"
            "YOUR BRAND:\n"
            f"- Products: {your_products} | Avg Price: ₹{your_avg_price} | "
            f"Rating: {your_avg_rating}★ | Reviews: {your_reviews}\n\n"
            "TOP COMPETITORS:\n"
            f"{competitor_lines}\n\n"
            "Respond in EXACTLY this format:\n\n"
            "1. KEY INSIGHTS:\n- [Critical observation]\n- [Major opportunity]\n- [Biggest challenge]\n\n"
            "2. PRIORITY ACTIONS:\n- [Specific action with expected impact]\n- [Specific action]\n- [Specific action]\n\n"
            "3. COMPETITIVE ADVANTAGE:\n[One sentence on how to differentiate]\n\n"
            "4. RISK FACTORS:\n[One sentence on main risks to watch]"
        )
 
        growth_prompt = (
            f"Create a {num_phases}-phase e-commerce growth roadmap. "
            "Return ONLY valid JSON — no text before or after.\n\n"
            f"Brand: {your_brand} | Marketplace: {marketplace.upper()} | Category: {category_name}\n"
            f"Current Share: {current_share}% | Target: {target_share}% | Gap: {gap:.1f}% | Days: {target_days}\n"
            f"Rank: #{rank} | Products: {your_products} | Price: ₹{your_avg_price} | Rating: {your_avg_rating}★\n\n"
            "Competitors:\n"
            f"{competitor_lines}\n\n"
            f"Price whitespace bands: {[g.price_band for g in high_gaps[:3]]}\n\n"
            "Rules: Phase 1 = quick wins. Middle = expand. Last = scale. 3-4 actions each. "
            f"Targets must progress linearly to {target_share}%.\n"
            'Output ONLY: {"phases":[{"phase":"Phase 1 (Days 1-X)","focus":"…","actions":["…"],"target":"X.X% market share"}]}'
        )
 
        ai_output, growth_output = _run_ollama_parallel([
            (ai_prompt,     30),
            (growth_prompt, 90),
        ])
 
        # ── rule-based recommendations ──
        avg_products = sum(b.get("product_count", 0) for b in top_5) / max(len(top_5), 1)
        avg_rating   = sum(b.get("avg_rating",    0) for b in top_5 if b.get("avg_rating")) / max(sum(1 for b in top_5 if b.get("avg_rating")), 1)
        avg_reviews  = sum(b.get("total_reviews", 0) for b in top_5) / max(len(top_5), 1)
        avg_price    = sum(b.get("avg_price",     0) for b in top_5 if b.get("avg_price"))  / max(sum(1 for b in top_5 if b.get("avg_price")), 1)
 
        recs = []
        if avg_products > 0 and your_products < avg_products:
            recs.append({"type": "Product Expansion", "priority": "High", "current": your_products, "benchmark": int(avg_products), "action": f"Add {int(avg_products - your_products)} more products to match category leaders.", "impact": "Could increase share by 2–5%"})
        if avg_rating > 0 and your_avg_rating > 0 and your_avg_rating < avg_rating:
            recs.append({"type": "Quality Improvement", "priority": "High", "current": your_avg_rating, "benchmark": round(avg_rating, 2), "action": f"Improve rating by {round(avg_rating - your_avg_rating, 2)}★ through quality + post-purchase support.", "impact": "Better ratings lift conversion 15–20%"})
        if avg_reviews > 0 and your_reviews < avg_reviews:
            recs.append({"type": "Review Generation", "priority": "Medium", "current": your_reviews, "benchmark": int(avg_reviews), "action": f"Close {int(avg_reviews - your_reviews)} review gap with follow-up campaigns.", "impact": "Reviews increase trust and organic rank"})
        if avg_price > 0 and your_avg_price > 0:
            diff = your_avg_price - avg_price
            if diff > avg_price * 0.15:
                recs.append({"type": "Pricing Optimisation", "priority": "Medium", "current": your_avg_price, "benchmark": round(avg_price, 2), "action": f"Reduce price by ₹{round(diff, 0):.0f} to match market.", "impact": "Price cut can lift sales 10–15%"})
            elif diff < -avg_price * 0.15:
                recs.append({"type": "Premium Positioning", "priority": "Low", "current": your_avg_price, "benchmark": round(avg_price, 2), "action": f"Price is ₹{round(-diff, 0):.0f} below market — consider premium SKU.", "impact": "Margin improvement opportunity"})
        if high_gaps:
            recs.append({"type": "Price Whitespace", "priority": "High", "current": "None", "benchmark": high_gaps[0].price_band, "action": f"Launch a product at {high_gaps[0].price_band} — no strong player exists here.", "impact": "First-mover advantage in underserved segment"})
 
        # ── parse growth JSON ──
        growth_strategy = []
        if growth_output:
            try:
                gd = json.loads(growth_output)
                if isinstance(gd.get("phases"), list) and gd["phases"]:
                    growth_strategy = gd["phases"]
            except (json.JSONDecodeError, ValueError):
                pass
        if not growth_strategy:
            growth_strategy = _generate_fallback_strategy(
                gap, target_days, current_share, target_share, num_phases
            )
 
        # ── product gaps ──
        product_gaps = []
        try:
            _set_timeout(db)
            if marketplace == "flipkart":
                gq = text("""
                    SELECT product_title, COUNT(*) AS cnt,
                           AVG(product_price) AS ap,
                           AVG(CAST(product_star_rating AS FLOAT)) AS ar,
                           SUM(product_rating_count) AS tr
                    FROM rapidapi_flipkart_products
                    WHERE category_name = :cat AND LOWER(brand) != LOWER(:yb)
                    GROUP BY product_title HAVING COUNT(*) >= 2
                    ORDER BY tr DESC LIMIT 10
                """)
            else:
                gq = text("""
                    SELECT product_title, COUNT(*) AS cnt,
                           AVG(product_price_numeric) AS ap,
                           AVG(product_star_rating_numeric) AS ar,
                           SUM(product_num_ratings) AS tr
                    FROM rapidapi_amazon_products
                    WHERE category_name = :cat
                      AND LOWER(SPLIT_PART(product_title, ' ', 1)) != LOWER(:yb)
                    GROUP BY product_title HAVING COUNT(*) >= 2
                    ORDER BY tr DESC LIMIT 10
                """)
            grows = db.execute(gq, {"cat": category_name, "yb": your_brand}).fetchall()
            for gr in grows[:5]:
                demand = safe_int(gr[4])
                product_gaps.append({
                    "product_type":         (str(gr[0]) or "")[:100],
                    "competitors_offering": safe_int(gr[1]),
                    "avg_price":            round(safe_float(gr[2]), 2),
                    "avg_rating":           round(safe_float(gr[3]), 2),
                    "total_demand":         demand,
                    "opportunity":          "High" if demand > 1000 else ("Medium" if demand > 500 else "Low"),
                })
        except Exception as e:
            print(f"[product_gaps] {e}")
 
        # ── pricing insights ──
        pricing_insights: Dict = {}
        if your_avg_price and avg_price > 0:
            pricing_insights = {
                "your_price":                your_avg_price,
                "market_average":            round(avg_price, 2),
                "budget_competitors":        sum(1 for b in brands if b.get("avg_price") and b["avg_price"] < your_avg_price * 0.8),
                "similar_price_competitors": sum(1 for b in brands if b.get("avg_price") and your_avg_price * 0.8 <= b["avg_price"] <= your_avg_price * 1.2),
                "premium_competitors":       sum(1 for b in brands if b.get("avg_price") and b["avg_price"] > your_avg_price * 1.2),
                "price_positioning":         "Budget" if your_avg_price < avg_price * 0.8 else ("Premium" if your_avg_price > avg_price * 1.2 else "Mid-Range"),
            }
 
        return {
            "current_analysis": {
                "current_share":         current_share,
                "target_share":          target_share,
                "gap":                   round(gap, 2),
                "days_to_target":        target_days,
                "required_daily_growth": round(gap / target_days, 4) if target_days > 0 else 0,
            },
            "market_position": {
                "rank":                  rank,
                "total_brands":          total_brands,
                "distance_from_leader":  round(leader_share - current_share, 2),
                "market_leader":         market_leader,
            },
            "market_health": {
                "hhi_score":        hhi.hhi_score,
                "hhi_label":        hhi.label,
                "entry_difficulty": hhi.entry_difficulty,
                "launch_score":     launch.score,
                "launch_label":     launch.label,
                "category_trend":   _compute_category_trend(category_name, marketplace, db).dict(),
            },
            # ── new decision layers in ai-insights too ──
            "market_decision":    decision.dict(),       # [NEW-A]
            "confidence_score":   confidence.dict(),     # [NEW-B]
            "action_plan":        action_plan.dict(),    # [NEW-C]
 
            "competitive_analysis": [
                {
                    "brand":            b["brand"],
                    "share":            b["share_percentage"],
                    "products":         b["product_count"],
                    "avg_price":        b["avg_price"],
                    "avg_rating":       b["avg_rating"],
                    "reviews":          b["total_reviews"],
                    "advantage":        "Higher" if b["share_percentage"] > current_share else "Lower",
                    "price_comparison": "Cheaper" if b["avg_price"] < your_avg_price else "More Expensive",
                }
                for b in top_5 if b["brand"].lower() != your_brand.lower()
            ],
            "actionable_recommendations": recs,
            "growth_strategy":            growth_strategy,
            "product_gaps":               product_gaps,
            "pricing_insights":           pricing_insights,
            "price_whitespace":           [g.dict() for g in high_gaps[:5]],
            "value_map":                  [v.dict() for v in _compute_value_map(brands)[:10]],
            "ai_generated_insights": (
                ai_output if ai_output and len(ai_output) > 20
                else "AI analysis temporarily unavailable. Rule-based recommendations above are accurate."
            ),
        }
 
    except Exception as e:
        print(f"[ai_insights] {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
    


# import os
# import json
# import time
# import math
# import asyncio
# import requests
# import numpy as np
# from io import BytesIO
# from datetime import datetime, timedelta
# from typing import List, Optional, Dict, Any
# from pathlib import Path
# from collections import defaultdict

# from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
# from fastapi.responses import StreamingResponse
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from apscheduler.schedulers.background import BackgroundScheduler
# from apscheduler.triggers.cron import CronTrigger
# from reportlab.lib.pagesizes import A4
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.lib.units import cm
# from reportlab.lib import colors
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
# from dotenv import load_dotenv

# from app.models.legacy_models import TrackedProduct, KeywordRankHistory, User
# from app.db.session import get_db, SessionLocal

# # ─────────────────────────────────────────
# # ENV + CONFIG
# # ─────────────────────────────────────────
# BASE_DIR = Path(__file__).resolve().parent
# load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

# RAPIDAPI_KEY  = os.environ.get("RAPIDAPI_KEY")
# RAPIDAPI_HOST = os.environ.get("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
# AMAZON_API_URL         = "https://real-time-amazon-data.p.rapidapi.com/seller-products"
# AMAZON_REVIEWS_API_URL = "https://real-time-amazon-data.p.rapidapi.com/seller-reviews"
# AMAZON_SEARCH_API_URL  = "https://real-time-amazon-data.p.rapidapi.com/search"

# HEADERS = {
#     "X-RapidAPI-Key":  RAPIDAPI_KEY,
#     "X-RapidAPI-Host": RAPIDAPI_HOST,
# }

# OLLAMA_BASE = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
# OLLAMA_MODEL = "llama3.2:3b"

# # ─────────────────────────────────────────
# # BREVO EMAIL CONFIG
# # ─────────────────────────────────────────
# BREVO_API_KEY     = os.environ.get("BREVO_API_KEY", "")
# BREVO_SENDER_EMAIL = os.environ.get("BREVO_SENDER_EMAIL", "noreply@insydz.com")
# BREVO_SENDER_NAME  = os.environ.get("BREVO_SENDER_NAME", "Insydz")
# BREVO_API_URL      = "https://api.brevo.com/v3/smtp/email"

# # Marketplaces supported for cross-comparison
# SUPPORTED_COUNTRIES = ["IN", "US", "UK", "DE", "AE"]

# # Rate limit: max 4 manual rank-update calls per user per calendar day
# RANK_UPDATE_DAILY_LIMIT = 4

# # ─────────────────────────────────────────
# # SUBSCRIPTION TIERS  (unchanged from original)
# # ─────────────────────────────────────────
# KEYWORD_TRACKER_LIMITS = {
#     "free":       2,
#     "basic":      10,
#     "premium":    -1,
#     "enterprise": -1,
# }



# # ─────────────────────────────────────────
# # PYDANTIC MODELS
# # ─────────────────────────────────────────

# class ProductTrackRequest(BaseModel):
#     seller_id: str
#     asin: str
#     product_title: str
#     product_photo: str
#     country: str = "IN"
#     user_email: str


# class TrackedProductResponse(BaseModel):
#     id: int
#     seller_id: str
#     asin: str
#     product_title: str
#     product_photo: str
#     country: str
#     user_email: str
#     review_comments: Optional[List[str]] = []
#     review_ratings:  Optional[List[int]]  = []
#     model_config = {"from_attributes": True}


# class KeywordTrackRequest(BaseModel):
#     tracked_product_id: int
#     keywords: List[str]
#     user_email: str


# class KeywordRankResponse(BaseModel):
#     keyword:    str
#     rank:       Optional[int] = 0
#     velocity:   Optional[float] = 0.0   # NEW: momentum score
#     checked_at: datetime
#     user_email: str
#     model_config = {"from_attributes": True}


# class AIAnalysisResponse(BaseModel):
#     product_title:  str
#     asin:           str
#     total_keywords: int
#     analysis:       dict


# class UpdateRanksRequest(BaseModel):
#     user_email: str


# class UsageLimitsResponse(BaseModel):
#     count:             int
#     limit:             int
#     remaining:         int
#     subscription_tier: str


# class CompetitorProduct(BaseModel):
#     id:                           int
#     asin:                         str
#     category_id:                  Optional[int]
#     category_name:                Optional[str]
#     product_title:                str
#     product_url:                  Optional[str]
#     product_photo:                Optional[str]
#     product_price:                Optional[str]
#     product_price_numeric:        Optional[float]
#     product_original_price:       Optional[str]
#     product_original_price_numeric: Optional[float]
#     product_star_rating:          Optional[str]
#     product_star_rating_numeric:  Optional[float]
#     product_num_ratings:          Optional[int]
#     is_best_seller:               Optional[bool]
#     is_amazon_choice:             Optional[bool]
#     is_prime:                     Optional[bool]
#     sales_volume:                 Optional[str]
#     country:                      Optional[str]
#     avg_price:                    Optional[float]
#     min_price:                    Optional[float]
#     max_price:                    Optional[float]
#     avg_sales_volume:             Optional[float]
#     min_sales_volume:             Optional[float]
#     max_sales_volume:             Optional[float]


# class ProductComparison(BaseModel):
#     seller_product:     dict
#     competitor_product: CompetitorProduct
#     comparison_metrics: dict


# class ComparisonResponse(BaseModel):
#     seller_id:             str
#     total_seller_products: int
#     total_comparisons:     int
#     comparisons:           List[ProductComparison]


# class PriceAlertRequest(BaseModel):
#     tracked_product_id: int
#     user_email:         str
#     threshold_percent:  float    # trigger when competitor is X% cheaper
#     delivery_email:     str      # email to send the alert to


# class CompetitorSnapshotDiff(BaseModel):
#     asin:          str
#     product_title: str
#     changes:       List[dict]        # list of {field, old_value, new_value}
#     detected_at:   datetime


# # ─────────────────────────────────────────
# # HELPERS — reviews, parsing
# # ─────────────────────────────────────────

# def parse_review_comments(comments_json: str) -> List[str]:
#     if not comments_json:
#         return []
#     try:
#         return json.loads(comments_json)
#     except Exception:
#         return []


# def parse_review_ratings(ratings_json: str) -> List[int]:
#     if not ratings_json:
#         return []
#     try:
#         return json.loads(ratings_json)
#     except Exception:
#         return []


# def fetch_seller_reviews(seller_id: str, country: str) -> tuple:
#     try:
#         resp = requests.get(
#             AMAZON_REVIEWS_API_URL,
#             headers=HEADERS,
#             params={"seller_id": seller_id, "country": country, "page": 1},
#             timeout=20,
#         )
#         resp.raise_for_status()
#         data = resp.json()
#         if data.get("status") != "OK":
#             return [], []
#         reviews = data.get("data", {}).get("seller_reviews", [])
#         comments = [r.get("review_comment", "") for r in reviews]
#         ratings  = [r.get("review_star_rating", 0) for r in reviews]
#         return comments, ratings
#     except Exception as e:
#         print(f"[reviews] error: {e}")
#         return [], []


# # ─────────────────────────────────────────
# # HELPERS — subscription limit (race-safe)
# # ─────────────────────────────────────────

# def check_keyword_tracker_limit(user_id: int, db: Session) -> dict:
#     """
#     Returns current usage. Does NOT increment — call increment_keyword_usage separately.
#     Resets counter at month boundary.
#     """
#     row = db.execute(
#         text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid"),
#         {"uid": user_id},
#     ).fetchone()
#     if not row:
#         raise HTTPException(status_code=404, detail="User not found")

#     tier, used, tracked_month = row[0] or "free", row[1], row[2]
#     current_month = datetime.utcnow().strftime("%Y-%m")

#     if tracked_month != current_month:
#         db.execute(
#             text("UPDATE users SET keyword_tracker_used=0, keyword_tracker_month=:m WHERE id=:uid"),
#             {"m": current_month, "uid": user_id},
#         )
#         db.commit()
#         used = 0

#     limit     = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
#     remaining = (limit - used) if limit != -1 else -1
#     return {"count": used, "limit": limit, "remaining": remaining, "subscription_tier": tier}


# def atomic_increment_usage(user_id: int, increment: int, db: Session) -> bool:
#     """
#     Atomically increments usage only if under the limit.
#     Returns True if increment succeeded, False if limit would be exceeded.
#     Uses SELECT FOR UPDATE to prevent race conditions.
#     """
#     row = db.execute(
#         text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid FOR UPDATE"),
#         {"uid": user_id},
#     ).fetchone()
#     if not row:
#         return False

#     tier, used, tracked_month = row[0] or "free", row[1], row[2]
#     current_month = datetime.utcnow().strftime("%Y-%m")
#     if tracked_month != current_month:
#         used = 0

#     limit = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
#     if limit != -1 and (used + increment) > limit:
#         db.rollback()
#         return False

#     db.execute(
#         text("UPDATE users SET keyword_tracker_used=COALESCE(keyword_tracker_used,0)+:inc, keyword_tracker_month=:m WHERE id=:uid"),
#         {"inc": increment, "m": current_month, "uid": user_id},
#     )
#     db.commit()
#     return True


# # ─────────────────────────────────────────
# # HELPERS — rank update rate limiting (4/day)
# # ─────────────────────────────────────────

# def check_rank_update_ratelimit(user_email: str, db: Session) -> dict:
#     """
#     Returns {allowed: bool, used: int, limit: int, resets_at: str}
#     Requires rank_update_ratelimit table — run migrations.sql first.
#     """
#     today = datetime.utcnow().strftime("%Y-%m-%d")
#     row = db.execute(
#         text("SELECT call_count FROM rank_update_ratelimit WHERE user_email=:email AND update_date=:today"),
#         {"email": user_email, "today": today},
#     ).fetchone()
#     used = row[0] if row else 0

#     resets_at = (datetime.utcnow().replace(hour=0, minute=0, second=0) + timedelta(days=1)).isoformat() + "Z"
#     return {
#         "allowed":   used < RANK_UPDATE_DAILY_LIMIT,
#         "used":      used,
#         "limit":     RANK_UPDATE_DAILY_LIMIT,
#         "resets_at": resets_at,
#     }


# def increment_rank_update_count(user_email: str, db: Session):
#     today = datetime.utcnow().strftime("%Y-%m-%d")
#     db.execute(
#         text("""
#             INSERT INTO rank_update_ratelimit (user_email, update_date, call_count)
#             VALUES (:email, :today, 1)
#             ON CONFLICT (user_email, update_date)
#             DO UPDATE SET call_count = rank_update_ratelimit.call_count + 1
#         """),
#         {"email": user_email, "today": today},
#     )
#     db.commit()


# # ─────────────────────────────────────────
# # HELPERS — similarity + competitor matching
# # ─────────────────────────────────────────

# def calculate_similarity_score(title_a: str, title_b: str) -> float:
#     words_a = set(title_a.lower().split())
#     words_b = set(title_b.lower().split())
#     if not words_a or not words_b:
#         return 0.0
#     return len(words_a & words_b) / len(words_a | words_b)


# def find_competitor_matches(seller_product: dict, db: Session, country: str = "IN",
#                              similarity_threshold: float = 0.3, max_matches: int = 5) -> List[CompetitorProduct]:
#     seller_title = seller_product.get("product_title", "")
#     search_terms = [w for w in seller_title.lower().split() if len(w) > 3][:4]
#     if not search_terms:
#         return []

#     search_pattern = "%".join(search_terms)
#     rows = db.execute(text("""
#         SELECT id,asin,category_id,category_name,product_title,product_url,
#                product_photo,product_price,product_price_numeric,product_original_price,
#                product_original_price_numeric,product_star_rating,product_star_rating_numeric,
#                product_num_ratings,is_best_seller,is_amazon_choice,is_prime,
#                sales_volume,country,avg_price,min_price,max_price,
#                avg_sales_volume,min_sales_volume,max_sales_volume
#         FROM rapidapi_amazon_products
#         WHERE country=:country
#           AND LOWER(product_title) LIKE :pat
#           AND asin != :seller_asin
#         ORDER BY
#             CASE WHEN is_best_seller THEN 1 WHEN is_amazon_choice THEN 2 ELSE 3 END,
#             product_num_ratings DESC,
#             product_star_rating_numeric DESC
#         LIMIT :lim
#     """), {"country": country, "pat": f"%{search_pattern}%",
#            "seller_asin": seller_product.get("asin"), "lim": max_matches * 2}).fetchall()

#     competitors = []
#     for r in rows:
#         if calculate_similarity_score(seller_title, r[4]) >= similarity_threshold:
#             competitors.append(CompetitorProduct(
#                 id=r[0], asin=r[1], category_id=r[2], category_name=r[3], product_title=r[4],
#                 product_url=r[5], product_photo=r[6], product_price=r[7], product_price_numeric=r[8],
#                 product_original_price=r[9], product_original_price_numeric=r[10],
#                 product_star_rating=r[11], product_star_rating_numeric=r[12],
#                 product_num_ratings=r[13], is_best_seller=r[14], is_amazon_choice=r[15],
#                 is_prime=r[16], sales_volume=r[17], country=r[18],
#                 avg_price=r[19], min_price=r[20], max_price=r[21],
#                 avg_sales_volume=r[22], min_sales_volume=r[23], max_sales_volume=r[24],
#             ))
#     return competitors[:max_matches]


# def generate_comparison_metrics(seller_product: dict, competitor: CompetitorProduct) -> dict:
#     sp = seller_product.get("product_price_numeric", 0) or 0
#     cp = competitor.product_price_numeric or 0
#     sr = seller_product.get("product_star_rating_numeric", 0) or 0
#     cr = competitor.product_star_rating_numeric or 0
#     sn = seller_product.get("product_num_ratings", 0) or 0
#     cn = competitor.product_num_ratings or 0

#     price_diff = (sp - cp) if sp and cp else None
#     price_pct  = ((sp - cp) / cp * 100) if sp and cp and cp > 0 else None
#     rating_diff = (sr - cr) if sr and cr else None
#     review_diff = (sn - cn) if sn and cn else None

#     advantages, disadvantages = [], []
#     if price_diff and price_diff < 0:
#         advantages.append(f"Lower price by ₹{abs(price_diff):.2f} ({abs(price_pct):.1f}%)")
#     elif price_diff and price_diff > 0:
#         disadvantages.append(f"Higher price by ₹{price_diff:.2f} ({price_pct:.1f}%)")
#     if rating_diff and rating_diff > 0:
#         advantages.append(f"Better rating by {rating_diff:.1f} stars")
#     elif rating_diff and rating_diff < 0:
#         disadvantages.append(f"Lower rating by {abs(rating_diff):.1f} stars")
#     if review_diff and review_diff > 0:
#         advantages.append(f"More reviews (+{review_diff})")
#     elif review_diff and review_diff < 0:
#         disadvantages.append(f"Fewer reviews ({review_diff})")
#     if competitor.is_best_seller and not seller_product.get("is_best_seller"):
#         disadvantages.append("Competitor is Best Seller")
#     elif seller_product.get("is_best_seller") and not competitor.is_best_seller:
#         advantages.append("You are Best Seller")
#     if competitor.is_amazon_choice and not seller_product.get("is_amazon_choice"):
#         disadvantages.append("Competitor is Amazon's Choice")
#     elif seller_product.get("is_amazon_choice") and not competitor.is_amazon_choice:
#         advantages.append("You are Amazon's Choice")

#     return {
#         "price_comparison": {
#             "seller_price": sp, "competitor_price": cp,
#             "difference": price_diff, "difference_percent": price_pct,
#             "is_cheaper": price_diff < 0 if price_diff is not None else None,
#         },
#         "rating_comparison": {
#             "seller_rating": sr, "competitor_rating": cr,
#             "difference": rating_diff,
#             "is_better": rating_diff > 0 if rating_diff is not None else None,
#         },
#         "review_count_comparison": {
#             "seller_reviews": sn, "competitor_reviews": cn,
#             "difference": review_diff,
#             "has_more": review_diff > 0 if review_diff is not None else None,
#         },
#         "badges": {
#             "seller_best_seller": seller_product.get("is_best_seller", False),
#             "competitor_best_seller": competitor.is_best_seller or False,
#             "seller_amazon_choice": seller_product.get("is_amazon_choice", False),
#             "competitor_amazon_choice": competitor.is_amazon_choice or False,
#             "seller_prime": seller_product.get("is_prime", False),
#             "competitor_prime": competitor.is_prime or False,
#         },
#         "competitive_advantages":    advantages,
#         "competitive_disadvantages": disadvantages,
#         "similarity_score": calculate_similarity_score(
#             seller_product.get("product_title", ""),
#             competitor.product_title,
#         ),
#     }


# # ─────────────────────────────────────────
# # HELPERS — rank velocity
# # ─────────────────────────────────────────

# def compute_velocity(ranks: list) -> float:
#     """
#     Positive = improving (rank number dropping).
#     Negative = declining.
#     Uses a weighted average of recent changes, heavier on latest.
#     """
#     if len(ranks) < 2:
#         return 0.0
#     deltas = []
#     weights = []
#     for i in range(len(ranks) - 1):
#         prev = ranks[i + 1].get("rank", 0) or 0
#         curr = ranks[i].get("rank", 0) or 0
#         if prev and curr:
#             days = max((datetime.fromisoformat(ranks[i]["checked_at"]) -
#                         datetime.fromisoformat(ranks[i + 1]["checked_at"])).days, 1)
#             deltas.append((prev - curr) / days)
#             weights.append(1 / (i + 1))     # more recent = higher weight
#     if not deltas:
#         return 0.0
#     total_w = sum(weights)
#     return round(sum(d * w for d, w in zip(deltas, weights)) / total_w, 3)


# # ─────────────────────────────────────────
# # HELPERS — rank prediction (linear regression)
# # ─────────────────────────────────────────

# def predict_rank(rank_history: list) -> dict:
#     """
#     Simple linear regression on up to last 30 data points.
#     Returns predicted rank at day +7 and +30 with confidence interval.
#     """
#     if len(rank_history) < 3:
#         return {"predicted_7d": None, "predicted_30d": None, "confidence": "low",
#                 "trend": "not_enough_data"}

#     points = sorted(rank_history, key=lambda x: x["checked_at"])[-30:]
#     base_ts = datetime.fromisoformat(points[0]["checked_at"]).timestamp()
#     X = np.array([(datetime.fromisoformat(p["checked_at"]).timestamp() - base_ts) / 86400
#                   for p in points])
#     Y = np.array([p["rank"] for p in points if p["rank"]])

#     if len(Y) < 3:
#         return {"predicted_7d": None, "predicted_30d": None, "confidence": "low", "trend": "sparse"}

#     coeffs = np.polyfit(X, Y, 1)
#     poly   = np.poly1d(coeffs)

#     last_day = X[-1]
#     pred_7  = max(1, round(float(poly(last_day + 7))))
#     pred_30 = max(1, round(float(poly(last_day + 30))))

#     residuals = Y - poly(X)
#     std_err   = float(np.std(residuals))
#     r2        = float(1 - np.var(residuals) / (np.var(Y) + 1e-9))

#     confidence = "high" if r2 > 0.75 else "medium" if r2 > 0.4 else "low"
#     trend = "improving" if coeffs[0] < -0.3 else "declining" if coeffs[0] > 0.3 else "stable"

#     return {
#         "predicted_7d":        pred_7,
#         "predicted_30d":       pred_30,
#         "confidence":          confidence,
#         "trend":               trend,
#         "r2_score":            round(r2, 3),
#         "std_error":           round(std_err, 2),
#         "margin_7d":           round(std_err * 1.5),
#         "margin_30d":          round(std_err * 2.5),
#     }


# # ─────────────────────────────────────────
# # HELPERS — Ollama (llama3.2:3b) — human-like NLP
# # ─────────────────────────────────────────

# def _call_ollama(prompt: str, timeout: int = 90) -> str:
#     """
#     Raw call to Ollama. Returns the text response or raises.
#     """
#     resp = requests.post(
#         f"{OLLAMA_BASE}/api/generate",
#         json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
#         timeout=timeout,
#     )
#     resp.raise_for_status()
#     return resp.json().get("response", "").strip()


# def _call_ollama_json(prompt: str, timeout: int = 90) -> dict:
#     """
#     Calls Ollama expecting JSON back. Strips markdown fences, parses safely.
#     """
#     resp = requests.post(
#         f"{OLLAMA_BASE}/api/generate",
#         json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
#         timeout=timeout,
#     )
#     resp.raise_for_status()
#     raw = resp.json().get("response", "{}").strip()
#     raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
#     try:
#         return json.loads(raw)
#     except json.JSONDecodeError:
#         return {}


# SYSTEM_PERSONA = """You are Insydz, an elite Amazon marketplace strategist with 12 years of hands-on seller experience.
# You speak like a real expert friend — direct, warm, specific, never robotic.
# You use conversational language, occasional em-dashes, and short punchy sentences when making a point.
# You never say "certainly", "absolutely", "great question", or use hollow filler phrases.
# You back every claim with the actual data you've been given.
# When something is bad, you say so clearly. When something is good, you celebrate it.
# Your job is to help sellers actually win on Amazon — not to sound like an AI."""


# def ai_keyword_analysis(product_title: str, asin: str, country: str,
#                          rank_summary: list) -> dict:
#     """
#     Full AI keyword analysis — dynamic, data-driven, human-like.
#     """
#     trend_lines = "\n".join(
#         f"  • '{r['keyword']}': rank {r['current_rank']} "
#         f"({'↑ improved by ' + str(r['change']) if r['change'] > 0 else '↓ dropped by ' + str(abs(r['change'])) if r['change'] < 0 else '→ stable'}, "
#         f"velocity trend: {r.get('trend','unknown')})"
#         for r in rank_summary
#     )

#     prompt = f"""{SYSTEM_PERSONA}

# You're analyzing this Amazon product:
#   Product: {product_title}
#   ASIN: {asin}
#   Marketplace: {country}

# Here's the live keyword ranking data:
# {trend_lines}

# Write a sharp, specific analysis. Respond ONLY in this exact JSON structure (no markdown, no preamble):
# {{
#   "opening": "A 2-3 sentence honest opener that names specific keywords and calls out what's actually happening — not generic praise.",
#   "why_changed": "Explain WHY these specific ranks changed. Reference actual keywords, not vague market forces. Be a detective.",
#   "immediate_actions": ["3-4 specific, implementable actions the seller can do this week. No fluff like 'optimize your listing'. Name the exact keyword, exact section, exact change."],
#   "keyword_focus": "Which 1-2 keywords are the biggest opportunity right now and exactly why — based on the data above.",
#   "prediction": "What will likely happen in the next 30 days if they do nothing. Be honest, not scary.",
#   "roadmap": {{
#     "week_1_2": "Specific actions, named keywords, exact listing sections to change.",
#     "week_3_4": "What to do after the first changes take hold — what to monitor, what to test.",
#     "month_2_3": "The bigger play — where this product can realistically be in 60-90 days if they execute."
#   }},
#   "closing_thought": "One honest, direct closing sentence — like what you'd tell a friend who asked you for real advice."
# }}"""

#     result = _call_ollama_json(prompt, timeout=120)
#     if not result:
#         result = {
#             "opening": f"Looking at the keyword data for '{product_title}', there are clear patterns here worth acting on.",
#             "why_changed": "Rank fluctuations are likely tied to competitor activity and listing freshness.",
#             "immediate_actions": ["Review your top keyword's placement in the product title.", "Add backend search terms you're missing.", "Check if any competitor changed their price recently."],
#             "keyword_focus": "Focus on the keyword with the most recent positive momentum.",
#             "prediction": "Without changes, rankings will likely drift further as competitors iterate faster.",
#             "roadmap": {"week_1_2": "Audit title and bullets.", "week_3_4": "Test a revised main image.", "month_2_3": "Launch a targeted PPC campaign on your best-performing keyword."},
#             "closing_thought": "The data's telling you something — the question is whether you'll act on it this week or next month.",
#         }
#     return result


# def ai_competitor_recommendation(seller_product: dict, comparisons: list) -> dict:
#     """
#     Competitor-aware AI recommendation — what should the seller actually do?
#     """
#     comp_lines = []
#     for c in comparisons[:5]:
#         m = c.get("comparison_metrics", {})
#         price_c = m.get("price_comparison", {})
#         rating_c = m.get("rating_comparison", {})
#         comp_lines.append(
#             f"  Competitor '{c['competitor_product'].get('product_title','?')[:60]}': "
#             f"price={price_c.get('competitor_price','?')}, rating={rating_c.get('competitor_rating','?')}, "
#             f"best_seller={c['competitor_product'].get('is_best_seller',False)}, "
#             f"amazon_choice={c['competitor_product'].get('is_amazon_choice',False)}"
#         )
#     comp_text = "\n".join(comp_lines) if comp_lines else "  No competitors found."

#     prompt = f"""{SYSTEM_PERSONA}

# Seller's product:
#   Title: {seller_product.get('product_title','?')}
#   ASIN: {seller_product.get('asin','?')}
#   Price: {seller_product.get('product_price_numeric','unknown')}
#   Rating: {seller_product.get('product_star_rating_numeric','unknown')}
#   Reviews: {seller_product.get('product_num_ratings','unknown')}
#   Best Seller: {seller_product.get('is_best_seller',False)}
#   Amazon Choice: {seller_product.get('is_amazon_choice',False)}

# Top competitors in the same category:
# {comp_text}

# You're sitting across the table from this seller. Give them your real take.
# Respond ONLY in this exact JSON structure:
# {{
#   "headline": "One punchy sentence that captures the seller's competitive position right now.",
#   "where_you_stand": "2-3 sentences: honest assessment of their position vs the competition. Use the actual numbers.",
#   "biggest_threat": "Which competitor is the real threat and why — specific, not generic.",
#   "biggest_opportunity": "The one thing the data is screaming at you that the seller should exploit right now.",
#   "price_strategy": "Specific price advice — should they cut, hold, or go premium? Why? What number?",
#   "listing_fixes": ["2-3 specific listing changes based on what competitors are doing better"],
#   "win_conditions": "What would it realistically take for this seller to outperform the top competitor in 90 days?",
#   "action_this_week": "The single most impactful thing they can do in the next 7 days. One thing only."
# }}"""

#     result = _call_ollama_json(prompt, timeout=120)
#     if not result:
#         result = {
#             "headline": "Your product has potential but is being outmaneuvered on key signals.",
#             "where_you_stand": "The competition is running tighter on price and credibility signals like reviews.",
#             "biggest_threat": "The best-seller badge holder in your category — they have pricing and social proof locked in.",
#             "biggest_opportunity": "Your rating, if higher, is an untapped trust signal you should be leading with.",
#             "price_strategy": "Hold your price but build value perception through images and A+ content first.",
#             "listing_fixes": ["Update your main image to show product in use.", "Add a comparison table in A+ content.", "Include size/quantity callouts in bullet 1."],
#             "win_conditions": "500+ reviews, a sub-10 keyword rank on your top term, and a PPC ACoS below 25%.",
#             "action_this_week": "Rewrite your title to front-load your top keyword — this week, not next.",
#         }
#     return result


# def ai_review_sentiment(comments: List[str], product_title: str) -> dict:
#     """
#     NLP sentiment breakdown by topic. Dynamic per product.
#     """
#     if not comments:
#         return {"error": "No reviews to analyze", "topics": {}}

#     sample = comments[:30]
#     reviews_text = "\n".join(f"  - {c}" for c in sample if c.strip())

#     prompt = f"""{SYSTEM_PERSONA}

# Product: {product_title}

# Customer reviews (sample of {len(sample)}):
# {reviews_text}

# Read these like a real person would. What are customers actually saying?
# Respond ONLY in this JSON structure:
# {{
#   "overall_mood": "One honest sentence on the vibe of these reviews.",
#   "score": <number 1-10 representing overall sentiment>,
#   "topics": {{
#     "quality":   {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "What customers specifically say about quality"}},
#     "packaging": {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "What customers say about packaging"}},
#     "value":     {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Price vs value perception"}},
#     "shipping":  {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Delivery and fulfillment feedback"}},
#     "support":   {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Customer service mentions if any"}}
#   }},
#   "top_complaint": "The most repeated complaint, verbatim-style",
#   "top_praise":    "The most repeated compliment, verbatim-style",
#   "seller_action": "One specific change the seller could make based on these reviews that would directly address the biggest complaint."
# }}"""

#     result = _call_ollama_json(prompt, timeout=90)
#     if not result:
#         result = {
#             "overall_mood": "Mixed reviews with room for improvement.",
#             "score": 6,
#             "topics": {
#                 "quality":   {"sentiment": "neutral", "score": 6, "summary": "Customers find quality acceptable."},
#                 "packaging": {"sentiment": "neutral", "score": 6, "summary": "Packaging mentioned occasionally."},
#                 "value":     {"sentiment": "neutral", "score": 6, "summary": "Price perceived as fair."},
#                 "shipping":  {"sentiment": "neutral", "score": 6, "summary": "Delivery timing varies."},
#                 "support":   {"sentiment": "neutral", "score": 6, "summary": "Limited support mentions."},
#             },
#             "top_complaint": "Product description doesn't fully match the item received.",
#             "top_praise":    "Fast delivery and good packaging.",
#             "seller_action": "Align your listing description more closely with the actual product.",
#         }
#     return result


# def ai_keyword_suggestions(product_title: str, asin: str, country: str) -> dict:
#     """
#     Suggest 15-20 high-intent keywords grouped by intent type.
#     """
#     prompt = f"""{SYSTEM_PERSONA}

# Product title: "{product_title}"
# ASIN: {asin}
# Marketplace: Amazon {country}

# Generate 15-20 high-intent Amazon search keywords a seller should track for this product.
# Think like a buyer — what would someone type when they're ready to buy?
# Group them by intent. Respond ONLY in this JSON:
# {{
#   "branded": ["keywords that include brand or product-specific terms"],
#   "generic": ["broad category keywords buyers use"],
#   "long_tail": ["specific 3-5 word phrases with clear purchase intent"],
#   "problem_solving": ["keywords buyers use when searching by the problem the product solves"],
#   "competitor_adjacent": ["terms buyers use when comparing similar products"],
#   "reasoning": "One sentence on your keyword strategy for this specific product."
# }}"""

#     result = _call_ollama_json(prompt, timeout=90)
#     if not result or "generic" not in result:
#         result = {
#             "branded": [],
#             "generic": [product_title.split()[0] if product_title else "product"],
#             "long_tail": [],
#             "problem_solving": [],
#             "competitor_adjacent": [],
#             "reasoning": "Keyword suggestions could not be generated — please try again.",
#         }
#     return result


# # ─────────────────────────────────────────
# # HELPERS — price alert via Brevo email
# # ─────────────────────────────────────────

# def send_brevo_email(to_email: str, subject: str, html_body: str) -> bool:
#     """
#     Sends a transactional email via Brevo API.
#     Returns True on success, False on failure.
#     """
#     if not BREVO_API_KEY:
#         print("[brevo] BREVO_API_KEY not set — email not sent")
#         return False

#     payload = {
#         "sender": {
#             "name":  BREVO_SENDER_NAME,
#             "email": BREVO_SENDER_EMAIL,
#         },
#         "to": [{"email": to_email}],
#         "subject": subject,
#         "htmlContent": html_body,
#     }

#     try:
#         resp = requests.post(
#             BREVO_API_URL,
#             headers={
#                 "accept":       "application/json",
#                 "content-type": "application/json",
#                 "api-key":      BREVO_API_KEY,
#             },
#             json=payload,
#             timeout=15,
#         )
#         resp.raise_for_status()
#         print(f"[brevo] email sent to {to_email} — subject: {subject}")
#         return True
#     except Exception as e:
#         print(f"[brevo] failed to send email to {to_email}: {e}")
#         return False


# def _price_alert_email_html(
#     product_title: str,
#     asin: str,
#     threshold_percent: float,
#     triggered: list,
# ) -> str:
#     """
#     Builds a clean HTML email body for price alerts.
#     """
#     rows = ""
#     for item in triggered:
#         rows += f"""
#         <tr>
#           <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">
#             {item['competitor_title'][:70]}
#           </td>
#           <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;text-align:center;">
#             {item['competitor_asin']}
#           </td>
#           <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:600;color:#d94f3d;text-align:center;">
#             ₹{item['competitor_price']}
#           </td>
#         </tr>"""

#     return f"""
# <!DOCTYPE html>
# <html>
# <head><meta charset="UTF-8"></head>
# <body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Arial,sans-serif;">
#   <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
#     <tr><td align="center">
#       <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

#         <!-- Header -->
#         <tr>
#           <td style="background:#1a1a2e;padding:28px 32px;">
#             <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Insydz</p>
#             <p style="margin:4px 0 0;font-size:13px;color:#9090b0;">Competitor Price Alert</p>
#           </td>
#         </tr>

#         <!-- Body -->
#         <tr>
#           <td style="padding:32px;">
#             <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;">
#               Price alert triggered for your product
#             </p>
#             <p style="margin:0 0 24px;font-size:14px;color:#555;">
#               <strong>{product_title}</strong> &nbsp;·&nbsp; ASIN: {asin}
#             </p>

#             <p style="margin:0 0 12px;font-size:14px;color:#555;">
#               The following competitors are priced more than
#               <strong style="color:#d94f3d;">{threshold_percent}%</strong> below your listed price:
#             </p>

#             <!-- Competitor table -->
#             <table width="100%" cellpadding="0" cellspacing="0"
#                    style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
#               <tr style="background:#f8f8f8;">
#                 <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:left;border-bottom:1px solid #f0f0f0;">
#                   COMPETITOR
#                 </th>
#                 <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:center;border-bottom:1px solid #f0f0f0;">
#                   ASIN
#                 </th>
#                 <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:center;border-bottom:1px solid #f0f0f0;">
#                   THEIR PRICE
#                 </th>
#               </tr>
#               {rows}
#             </table>

#             <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
#               Log in to <a href="https://insydz.com" style="color:#1a1a2e;font-weight:600;">insydz.com</a>
#               to review your pricing strategy and take action.
#             </p>
#           </td>
#         </tr>

#         <!-- Footer -->
#         <tr>
#           <td style="padding:20px 32px;background:#f8f8f8;border-top:1px solid #f0f0f0;">
#             <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
#               You're receiving this because you set up a price alert on Insydz.
#               &nbsp;·&nbsp; <a href="https://insydz.com" style="color:#aaa;">Manage alerts</a>
#             </p>
#           </td>
#         </tr>

#       </table>
#     </td></tr>
#   </table>
# </body>
# </html>"""


# def fire_price_alert(
#     product_title: str,
#     asin: str,
#     threshold_percent: float,
#     triggered: list,
#     delivery_email: str,
# ):
#     """
#     Sends a price alert email via Brevo.
#     Called when competitors are found below the seller's threshold.
#     """
#     if not triggered:
#         return

#     subject   = f"[Insydz] Price alert — {len(triggered)} competitor(s) underpricing you"
#     html_body = _price_alert_email_html(product_title, asin, threshold_percent, triggered)
#     sent      = send_brevo_email(delivery_email, subject, html_body)

#     if not sent:
#         print(f"[price alert] email delivery failed for {delivery_email} — product {asin}")


# def fire_competitor_change_alert(
#     seller_email: str,
#     seller_id: str,
#     changes: list,
# ):
#     """
#     Sends a daily competitor change digest email via Brevo.
#     Called by the background scheduler when competitor snapshots show diffs.
#     """
#     if not changes:
#         return

#     rows = ""
#     for c in changes[:10]:
#         change_lines = "".join(
#             f"<li style='font-size:13px;color:#555;margin-bottom:4px;'>"
#             f"<strong>{ch['field'].replace('_',' ').title()}</strong>: "
#             f"{ch['old_value']} → <strong>{ch['new_value']}</strong></li>"
#             for ch in c.get("changes", [])
#         )
#         rows += f"""
#         <tr>
#           <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
#             <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">
#               {c.get('competitor_title','Unknown')[:65]}
#             </p>
#             <p style="margin:0 0 6px;font-size:12px;color:#aaa;">ASIN: {c.get('competitor_asin','?')}</p>
#             <ul style="margin:0;padding-left:16px;">{change_lines}</ul>
#           </td>
#         </tr>"""

#     html_body = f"""
# <!DOCTYPE html>
# <html>
# <head><meta charset="UTF-8"></head>
# <body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Arial,sans-serif;">
#   <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
#     <tr><td align="center">
#       <table width="600" cellpadding="0" cellspacing="0"
#              style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
#         <tr>
#           <td style="background:#1a1a2e;padding:28px 32px;">
#             <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Insydz</p>
#             <p style="margin:4px 0 0;font-size:13px;color:#9090b0;">Daily Competitor Change Report</p>
#           </td>
#         </tr>
#         <tr>
#           <td style="padding:32px;">
#             <p style="margin:0 0 20px;font-size:15px;color:#1a1a1a;">
#               Here's what changed with your competitors in the last 24 hours:
#             </p>
#             <table width="100%" cellpadding="0" cellspacing="0"
#                    style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
#               {rows}
#             </table>
#             <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
#               Log in to <a href="https://insydz.com" style="color:#1a1a2e;font-weight:600;">insydz.com</a>
#               to take action on these changes.
#             </p>
#           </td>
#         </tr>
#         <tr>
#           <td style="padding:20px 32px;background:#f8f8f8;border-top:1px solid #f0f0f0;">
#             <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
#               Insydz daily digest &nbsp;·&nbsp;
#               <a href="https://insydz.com" style="color:#aaa;">Manage notifications</a>
#             </p>
#           </td>
#         </tr>
#       </table>
#     </td></tr>
#   </table>
# </body>
# </html>"""

#     subject = f"[Insydz] {len(changes)} competitor change(s) detected today"
#     send_brevo_email(seller_email, subject, html_body)


# # ─────────────────────────────────────────
# # PDF EXPORT HELPER
# # ─────────────────────────────────────────

# def generate_pdf_report(product: TrackedProductResponse, rank_history: list,
#                          ai_analysis: dict, prediction: dict) -> BytesIO:
#     buf    = BytesIO()
#     doc    = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
#                                 topMargin=2*cm, bottomMargin=2*cm)
#     styles = getSampleStyleSheet()
#     story  = []

#     title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=18, spaceAfter=12)
#     h2_style    = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=13, spaceAfter=6)
#     body_style  = ParagraphStyle("body", parent=styles["Normal"], fontSize=10, leading=14)

#     story.append(Paragraph(f"Keyword Rank Report", title_style))
#     story.append(Paragraph(f"{product.product_title}", h2_style))
#     story.append(Paragraph(f"ASIN: {product.asin} | Country: {product.country} | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style))
#     story.append(Spacer(1, 0.4*cm))

#     # Rank history table
#     story.append(Paragraph("Keyword Rank History", h2_style))
#     table_data = [["Keyword", "Rank", "Velocity", "Last Checked"]]
#     for entry in rank_history[:20]:
#         table_data.append([
#             entry.get("keyword", ""),
#             str(entry.get("rank", "-")),
#             str(entry.get("velocity", "0")),
#             entry.get("checked_at", "")[:16],
#         ])
#     t = Table(table_data, colWidths=[6*cm, 2.5*cm, 2.5*cm, 5*cm])
#     t.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
#         ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
#         ("FONTSIZE",   (0, 0), (-1, -1), 9),
#         ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
#         ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
#         ("PADDING", (0, 0), (-1, -1), 4),
#     ]))
#     story.append(t)
#     story.append(Spacer(1, 0.4*cm))

#     # Prediction
#     if prediction.get("predicted_7d"):
#         story.append(Paragraph("Rank Prediction", h2_style))
#         story.append(Paragraph(
#             f"7-day forecast: <b>#{prediction['predicted_7d']}</b> (±{prediction.get('margin_7d',0)}) | "
#             f"30-day forecast: <b>#{prediction['predicted_30d']}</b> (±{prediction.get('margin_30d',0)}) | "
#             f"Confidence: {prediction.get('confidence','low')} | Trend: {prediction.get('trend','unknown')}",
#             body_style
#         ))
#         story.append(Spacer(1, 0.4*cm))

#     # AI Analysis
#     if ai_analysis:
#         story.append(Paragraph("AI Strategic Analysis", h2_style))
#         for key, label in [
#             ("opening", "Overview"), ("why_changed", "Why Rankings Changed"),
#             ("keyword_focus", "Focus Keywords"), ("prediction", "30-Day Outlook"),
#         ]:
#             if ai_analysis.get(key):
#                 story.append(Paragraph(f"<b>{label}:</b> {ai_analysis[key]}", body_style))
#                 story.append(Spacer(1, 0.2*cm))

#         roadmap = ai_analysis.get("roadmap", {})
#         if roadmap:
#             story.append(Paragraph("Roadmap", h2_style))
#             for phase, content in roadmap.items():
#                 story.append(Paragraph(f"<b>{phase.replace('_', ' ').title()}:</b> {content}", body_style))
#                 story.append(Spacer(1, 0.15*cm))

#     doc.build(story)
#     buf.seek(0)
#     return buf


# # ─────────────────────────────────────────
# 
def _background_abandoned_signup_reminders():
    """Check for abandoned signups and send 6h, 24h, 72h reminders"""
    try:
        keys = r.keys(f"{ABANDONED_SIGNUP_PREFIX}*")
        now = datetime.now(timezone.utc)
        for key_bytes in keys:
            key = key_bytes.decode('utf-8') if isinstance(key_bytes, bytes) else key_bytes
            email = key.replace(ABANDONED_SIGNUP_PREFIX, "")
            data_str = r.get(key)
            if not data_str:
                continue
                
            data = json.loads(data_str)
            created_at_str = data.get("created_at")
            if not created_at_str:
                continue
                
            try:
                created_at = datetime.fromisoformat(created_at_str)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
                
            hours_passed = (now - created_at).total_seconds() / 3600.0
            reminders_sent = data.get("reminders_sent", [])
            
            should_update = False
            verify_link = f"https://insydz.com/signup?resume={email}"
            
            if hours_passed >= 72 and "72h" not in reminders_sent:
                print(f"📧 Sending 72h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("72h")
                should_update = True
            elif hours_passed >= 24 and hours_passed < 72 and "24h" not in reminders_sent:
                print(f"📧 Sending 24h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("24h")
                should_update = True
            elif hours_passed >= 6 and hours_passed < 24 and "6h" not in reminders_sent:
                print(f"📧 Sending 6h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("6h")
                should_update = True
                
            if should_update:
                data["reminders_sent"] = reminders_sent
                ttl = r.ttl(key)
                if ttl > 0:
                    r.setex(key, ttl, json.dumps(data))
    except Exception as e:
        print(f"❌ Error in _background_abandoned_signup_reminders: {e}")

# APSCHEDULER — background auto-rank updates
# # ─────────────────────────────────────────

# def _background_rank_update_all():
#     """Runs daily at 6 AM UTC. Updates ranks for all active tracked products."""
#     db = SessionLocal()
#     try:
#         products = db.query(TrackedProduct).all()
#         updated = 0
#         for product in products:
#             kws = db.query(KeywordRankHistory).filter(
#                 KeywordRankHistory.tracked_product_id == product.id
#             ).all()
#             for kw in kws:
#                 try:
#                     # Real keyword rank check via search API
#                     resp = requests.get(
#                         AMAZON_SEARCH_API_URL,
#                         headers=HEADERS,
#                         params={"query": kw.keyword, "country": product.country,
#                                 "page": "1", "sort_by": "RELEVANCE"},
#                         timeout=20,
#                     )
#                     resp.raise_for_status()
#                     results = resp.json().get("data", {}).get("products", [])
#                     rank = next((i + 1 for i, p in enumerate(results) if p.get("asin") == product.asin), 0)
#                     kw.rank       = rank
#                     kw.checked_at = datetime.utcnow()
#                     updated += 1
#                 except Exception as e:
#                     print(f"[scheduler] rank update error for {product.asin}/{kw.keyword}: {e}")
#         db.commit()
#         print(f"[scheduler] auto rank update complete — {updated} keywords updated")
#     except Exception as e:
#         print(f"[scheduler] fatal error: {e}")
#     finally:
#         db.close()


# def _background_snapshot_competitors():
#     """
#     Runs daily at 7 AM UTC.
#     1. Snapshots today's competitor data for every tracked product.
#     2. Diffs against yesterday's snapshot.
#     3. Emails each seller a change digest via Brevo if anything changed.
#     """
#     db = SessionLocal()
#     try:
#         today     = datetime.utcnow().strftime("%Y-%m-%d")
#         yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

#         sellers = db.execute(
#             text("SELECT DISTINCT seller_id, user_email, country FROM tracked_products")
#         ).fetchall()

#         for seller_id, user_email, country in sellers:
#             products = db.query(TrackedProduct).filter(
#                 TrackedProduct.seller_id == seller_id,
#                 TrackedProduct.user_email == user_email,
#             ).all()

#             all_changes_for_seller = []

#             for product in products:
#                 seller_dict = {
#                     "asin": product.asin, "product_title": product.product_title,
#                     "product_price_numeric": None, "product_star_rating_numeric": None,
#                     "product_num_ratings": None,
#                 }
#                 competitors = find_competitor_matches(seller_dict, db, country=country, max_matches=5)
#                 snapshot = [c.model_dump() for c in competitors]

#                 # Save today's snapshot
#                 db.execute(text("""
#                     INSERT INTO competitor_snapshots (seller_id, user_email, asin, snapshot_date, snapshot_data)
#                     VALUES (:sid, :email, :asin, :date, :data)
#                     ON CONFLICT (asin, snapshot_date, user_email) DO UPDATE SET snapshot_data=:data
#                 """), {"sid": seller_id, "email": user_email, "asin": product.asin,
#                        "date": today, "data": json.dumps(snapshot)})

#                 # Fetch yesterday's snapshot for diff
#                 yesterday_row = db.execute(text("""
#                     SELECT snapshot_data FROM competitor_snapshots
#                     WHERE asin=:asin AND user_email=:email AND snapshot_date=:yesterday
#                 """), {"asin": product.asin, "email": user_email, "yesterday": yesterday}).fetchone()

#                 if not yesterday_row:
#                     continue

#                 yesterday_data = json.loads(yesterday_row[0]) if isinstance(yesterday_row[0], str) else (yesterday_row[0] or [])
#                 yesterday_map  = {c["asin"]: c for c in yesterday_data}
#                 today_map      = {c["asin"]: c for c in snapshot}

#                 watch_fields = [
#                     "product_price_numeric", "product_star_rating_numeric",
#                     "product_num_ratings", "is_best_seller", "is_amazon_choice",
#                 ]

#                 for comp_asin, today_comp in today_map.items():
#                     yesterday_comp = yesterday_map.get(comp_asin)
#                     if not yesterday_comp:
#                         continue
#                     diffs = []
#                     for field in watch_fields:
#                         old_val = yesterday_comp.get(field)
#                         new_val = today_comp.get(field)
#                         if old_val != new_val and old_val is not None and new_val is not None:
#                             diffs.append({"field": field, "old_value": old_val, "new_value": new_val})
#                     if diffs:
#                         all_changes_for_seller.append({
#                             "seller_asin":      product.asin,
#                             "competitor_asin":  comp_asin,
#                             "competitor_title": today_comp.get("product_title", "Unknown"),
#                             "changes":          diffs,
#                         })

#             db.commit()

#             # Email the seller a digest if anything changed
#             if all_changes_for_seller:
#                 fire_competitor_change_alert(
#                     seller_email=user_email,
#                     seller_id=seller_id,
#                     changes=all_changes_for_seller,
#                 )

#         print(f"[scheduler] competitor snapshot complete — {today}")
#     except Exception as e:
#         print(f"[scheduler] snapshot error: {e}")
#     finally:
#         db.close()


# scheduler = BackgroundScheduler(timezone="UTC")
# scheduler.add_job(_background_rank_update_all,    CronTrigger(hour=6, minute=0),  id="daily_rank_update")
# scheduler.add_job(_background_snapshot_competitors, CronTrigger(hour=7, minute=0), id="daily_snapshots")
    scheduler.add_job(_background_abandoned_signup_reminders, CronTrigger(minute=0), id="abandoned_signup_reminders")
# scheduler.start()


# # ═══════════════════════════════════════════════════════
# # API ENDPOINTS
# # ═══════════════════════════════════════════════════════


# # ─────────────────────────────────────────
# # EXISTING ENDPOINTS (preserved + enhanced)
# # ─────────────────────────────────────────

# @router.get("/users/{user_id}/keyword-tracker-usage", response_model=UsageLimitsResponse)
# def get_keyword_tracker_usage(user_id: int, db: Session = Depends(get_db)):
#     """Current keyword tracker usage and limits for a user."""
#     return UsageLimitsResponse(**check_keyword_tracker_limit(user_id, db))


# @router.get("/keyword_tracker/fetch_and_store_products/{seller_id}", response_model=List[TrackedProductResponse])
# def fetch_and_store_seller_products(
#     seller_id: str, country: str = "IN", page: int = 1,
#     user_email: str = None, user_id: int = None,
#     db: Session = Depends(get_db),
# ):
#     """
#     Fetch products from Amazon API + reviews.
#     Stores comments and ratings in separate columns.
#     Checks subscription limits before allowing (race-safe).
#     """
#     if not user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")

#     print(f"[fetch] user_id={user_id}, user_email={user_email}, seller_id={seller_id}")

#     try:
#         resp = requests.get(AMAZON_API_URL, headers=HEADERS,
#                             params={"seller_id": seller_id, "country": country,
#                                     "page": page, "sort_by": "RELEVANCE"}, timeout=20)
#         resp.raise_for_status()
#         seller_products = resp.json().get("data", {}).get("seller_products", [])
#         if not seller_products:
#             return []

#         # Find how many are truly new (not yet in DB)
#         new_asins = []
#         for item in seller_products:
#             existing = db.query(TrackedProduct).filter(
#                 TrackedProduct.seller_id == seller_id,
#                 TrackedProduct.asin == item["asin"],
#                 TrackedProduct.user_email == user_email,
#             ).first()
#             if not existing:
#                 new_asins.append(item["asin"])

#         # Atomic limit check only for genuinely new products
#         if user_id and new_asins:
#             ok = atomic_increment_usage(user_id, len(new_asins), db)
#             if not ok:
#                 usage = check_keyword_tracker_limit(user_id, db)
#                 raise HTTPException(
#                     status_code=403,
#                     detail=(f"Keyword Tracker limit reached for {usage['subscription_tier'].upper()} plan. "
#                             f"You've used all {usage['limit']} product trackings this month. Upgrade for more!"),
#                 )

#         comments, ratings = fetch_seller_reviews(seller_id, country)
#         comments_json = json.dumps(comments) if comments else None
#         ratings_json  = json.dumps(ratings)  if ratings  else None

#         saved_products = []
#         for item in seller_products:
#             existing = db.query(TrackedProduct).filter(
#                 TrackedProduct.seller_id == seller_id,
#                 TrackedProduct.asin == item["asin"],
#                 TrackedProduct.user_email == user_email,
#             ).first()
#             if existing:
#                 existing.review_comments = comments_json
#                 existing.review_ratings  = ratings_json
#                 db.commit()
#                 db.refresh(existing)
#                 saved_products.append(existing)
#             else:
#                 new_product = TrackedProduct(
#                     seller_id=seller_id, asin=item["asin"],
#                     product_title=item["product_title"],
#                     product_photo=item.get("product_photo", ""),
#                     country=country, user_email=user_email,
#                     review_comments=comments_json, review_ratings=ratings_json,
#                 )
#                 db.add(new_product)
#                 db.commit()
#                 db.refresh(new_product)
#                 saved_products.append(new_product)

#         return [
#             TrackedProductResponse(
#                 id=p.id, seller_id=p.seller_id, asin=p.asin,
#                 product_title=p.product_title, product_photo=p.product_photo,
#                 country=p.country, user_email=p.user_email,
#                 review_comments=parse_review_comments(p.review_comments),
#                 review_ratings=parse_review_ratings(p.review_ratings),
#             )
#             for p in saved_products
#         ]

#     except HTTPException:
#         raise
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"RapidAPI request failed: {e}")
#     except Exception as e:
#         import traceback; traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


# @router.post("/keyword_tracker/track_keywords")
# def track_keywords(req: KeywordTrackRequest, db: Session = Depends(get_db)):
#     if not req.user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")

#     product = db.query(TrackedProduct).filter(
#         TrackedProduct.id == req.tracked_product_id,
#         TrackedProduct.user_email == req.user_email,
#     ).first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Tracked product not found or doesn't belong to this user")

#     added = 0
#     for kw in req.keywords:
#         existing = db.query(KeywordRankHistory).filter(
#             KeywordRankHistory.tracked_product_id == req.tracked_product_id,
#             KeywordRankHistory.keyword == kw,
#             KeywordRankHistory.user_email == req.user_email,
#         ).first()
#         if not existing:
#             db.add(KeywordRankHistory(
#                 tracked_product_id=req.tracked_product_id,
#                 keyword=kw, rank=0,
#                 checked_at=datetime.utcnow(),
#                 user_email=req.user_email,
#             ))
#             added += 1

#     db.commit()
#     return {"status": "ok", "message": f"Added {added} new keywords for {req.user_email}"}


# @router.get("/keyword_tracker/tracked_products/{seller_id}", response_model=List[TrackedProductResponse])
# def get_tracked_products(seller_id: str, user_email: str = None, db: Session = Depends(get_db)):
#     query = db.query(TrackedProduct).filter(TrackedProduct.seller_id == seller_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     return [
#         TrackedProductResponse(
#             id=p.id, seller_id=p.seller_id, asin=p.asin,
#             product_title=p.product_title, product_photo=p.product_photo,
#             country=p.country, user_email=p.user_email,
#             review_comments=parse_review_comments(p.review_comments),
#             review_ratings=parse_review_ratings(p.review_ratings),
#         )
#         for p in query.all()
#     ]


# @router.get("/keyword_tracker/rank_history/{tracked_product_id}")
# def get_rank_history(tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)):
#     """
#     Rank history enriched with velocity per keyword.
#     """
#     query = db.query(KeywordRankHistory).filter(
#         KeywordRankHistory.tracked_product_id == tracked_product_id
#     )
#     if user_email:
#         query = query.filter(KeywordRankHistory.user_email == user_email)
#     history = query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

#     # Group by keyword, compute velocity
#     by_kw: dict = defaultdict(list)
#     for entry in history:
#         by_kw[entry.keyword].append({
#             "rank": entry.rank,
#             "checked_at": entry.checked_at.isoformat(),
#         })

#     result = []
#     for entry in history:
#         kw_data = by_kw[entry.keyword]
#         # velocity only meaningful for the latest entry per keyword
#         v = compute_velocity(kw_data) if entry == history[0] or entry.keyword != getattr(history[history.index(entry)-1] if history.index(entry) > 0 else entry, 'keyword', None) else 0.0
#         result.append({
#             "keyword":    entry.keyword,
#             "rank":       entry.rank,
#             "velocity":   v,
#             "checked_at": entry.checked_at.isoformat(),
#             "user_email": entry.user_email,
#         })
#     return result


# @router.post("/keyword_tracker/update_daily_ranks")
# def update_daily_ranks(req: UpdateRanksRequest, db: Session = Depends(get_db)):
#     """
#     Manual rank update. Limited to 4 calls per user per calendar day.
#     Uses keyword search (not seller listing) for accurate keyword-level ranks.
#     """
#     if not req.user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")

#     # Rate limit check
#     rl = check_rank_update_ratelimit(req.user_email, db)
#     if not rl["allowed"]:
#         raise HTTPException(
#             status_code=429,
#             detail=(f"You've used all {RANK_UPDATE_DAILY_LIMIT} manual rank updates for today. "
#                     f"Resets at {rl['resets_at']}. Automated daily updates still run in the background."),
#             headers={"X-RateLimit-Limit": str(rl["limit"]),
#                      "X-RateLimit-Used": str(rl["used"]),
#                      "X-RateLimit-ResetAt": rl["resets_at"]},
#         )

#     increment_rank_update_count(req.user_email, db)

#     products = db.query(TrackedProduct).filter(TrackedProduct.user_email == req.user_email).all()
#     if not products:
#         return {"status": "success", "message": "No products found.", "updated_count": 0,
#                 "rate_limit": rl}

#     updated = 0
#     for product in products:
#         kw_entries = db.query(KeywordRankHistory).filter(
#             KeywordRankHistory.tracked_product_id == product.id,
#             KeywordRankHistory.user_email == req.user_email,
#         ).all()

#         for kw in kw_entries:
#             try:
#                 # FIXED: search by keyword, find ASIN rank in search results
#                 resp = requests.get(
#                     AMAZON_SEARCH_API_URL,
#                     headers=HEADERS,
#                     params={"query": kw.keyword, "country": product.country,
#                             "page": "1", "sort_by": "RELEVANCE"},
#                     timeout=20,
#                 )
#                 resp.raise_for_status()
#                 results = resp.json().get("data", {}).get("products", [])
#                 rank = next((i + 1 for i, p in enumerate(results) if p.get("asin") == product.asin), 0)
#                 kw.rank       = rank
#                 kw.checked_at = datetime.utcnow()
#                 updated += 1
#             except Exception as e:
#                 print(f"[rank update] {product.asin}/{kw.keyword}: {e}")

#     db.commit()

#     new_rl = check_rank_update_ratelimit(req.user_email, db)
#     return {
#         "status":        "success",
#         "message":       f"Updated {updated} keyword ranks.",
#         "updated_count": updated,
#         "rate_limit": {
#             "used":       new_rl["used"],
#             "limit":      new_rl["limit"],
#             "remaining":  new_rl["limit"] - new_rl["used"],
#             "resets_at":  new_rl["resets_at"],
#         },
#     }


# # ─────────────────────────────────────────
# # PRODUCT DETAIL — click on product → full picture
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/product_detail/{tracked_product_id}")
# def get_product_detail(
#     tracked_product_id: int,
#     user_email: str = None,
#     db: Session = Depends(get_db),
# ):
#     """
#     Single endpoint powering the product detail page when a seller clicks a product.
#     Returns:
#       - product info
#       - competitor list with comparison table
#       - AI competitor recommendation
#       - rank history with velocity
#       - rank prediction
#       - review sentiment breakdown
#       - keyword suggestions
#     """
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     # Rank history + velocity
#     kw_history = db.query(KeywordRankHistory).filter(
#         KeywordRankHistory.tracked_product_id == tracked_product_id
#     )
#     if user_email:
#         kw_history = kw_history.filter(KeywordRankHistory.user_email == user_email)
#     kw_history = kw_history.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

#     by_kw: dict = defaultdict(list)
#     for entry in kw_history:
#         by_kw[entry.keyword].append({"rank": entry.rank, "checked_at": entry.checked_at.isoformat()})

#     keyword_data = []
#     for kw, ranks in by_kw.items():
#         keyword_data.append({
#             "keyword":      kw,
#             "current_rank": ranks[0]["rank"] if ranks else 0,
#             "history":      ranks,
#             "velocity":     compute_velocity(ranks),
#             "prediction":   predict_rank(ranks),
#         })

#     # Competitors
#     seller_dict = {
#         "asin": product.asin, "product_title": product.product_title,
#         "product_price_numeric": None, "product_star_rating_numeric": None,
#         "product_num_ratings": None, "is_best_seller": False,
#         "is_amazon_choice": False, "is_prime": False,
#     }
#     competitors = find_competitor_matches(seller_dict, db, country=product.country, max_matches=5)
#     comparisons = [
#         {
#             "competitor_product": c.model_dump(),
#             "comparison_metrics": generate_comparison_metrics(seller_dict, c),
#         }
#         for c in competitors
#     ]

#     # AI recommendation (competitor-aware)
#     ai_rec = ai_competitor_recommendation(seller_dict, comparisons)

#     # Review sentiment
#     comments = parse_review_comments(product.review_comments)
#     sentiment = ai_review_sentiment(comments, product.product_title) if comments else {}

#     # Keyword suggestions
#     suggestions = ai_keyword_suggestions(product.product_title, product.asin, product.country)

#     # Overall rank prediction (aggregate across keywords)
#     all_rank_points = []
#     for kw, ranks in by_kw.items():
#         all_rank_points.extend(ranks)
#     overall_prediction = predict_rank(sorted(all_rank_points, key=lambda x: x["checked_at"]))

#     return {
#         "product": {
#             "id": product.id, "seller_id": product.seller_id, "asin": product.asin,
#             "product_title": product.product_title, "product_photo": product.product_photo,
#             "country": product.country, "user_email": product.user_email,
#         },
#         "keywords":                keyword_data,
#         "competitors":             comparisons,
#         "ai_recommendation":       ai_rec,
#         "review_sentiment":        sentiment,
#         "keyword_suggestions":     suggestions,
#         "overall_rank_prediction": overall_prediction,
#     }


# # ─────────────────────────────────────────
# # AI KEYWORD ANALYSIS ENDPOINT (enhanced)
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/ai_analysis/{tracked_product_id}", response_model=AIAnalysisResponse)
# def get_ai_keyword_analysis(
#     tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)
# ):
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Tracked product not found")

#     rank_query = db.query(KeywordRankHistory).filter(KeywordRankHistory.tracked_product_id == tracked_product_id)
#     if user_email:
#         rank_query = rank_query.filter(KeywordRankHistory.user_email == user_email)
#     rank_history = rank_query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()
#     if not rank_history:
#         raise HTTPException(status_code=404, detail="No rank history found")

#     by_kw: dict = defaultdict(list)
#     for entry in rank_history:
#         by_kw[entry.keyword].append({"rank": entry.rank, "checked_at": entry.checked_at.isoformat()})

#     rank_summary = []
#     for kw, ranks in by_kw.items():
#         change = (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) >= 2 else 0
#         rank_summary.append({
#             "keyword":       kw,
#             "current_rank":  ranks[0]["rank"],
#             "previous_rank": ranks[1]["rank"] if len(ranks) >= 2 else None,
#             "change":        change,
#             "trend":         "improved" if change > 0 else "declined" if change < 0 else "stable",
#             "velocity":      compute_velocity(ranks),
#         })

#     analysis = ai_keyword_analysis(product.product_title, product.asin, product.country, rank_summary)
#     return {"product_title": product.product_title, "asin": product.asin,
#             "total_keywords": len(rank_summary), "analysis": analysis}


# # ─────────────────────────────────────────
# # NEW: KEYWORD SUGGESTIONS
# # ─────────────────────────────────────────

# @router.post("/keyword_tracker/suggest_keywords/{tracked_product_id}")
# def suggest_keywords(
#     tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)
# ):
#     """AI-powered keyword suggestions grouped by search intent."""
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     suggestions = ai_keyword_suggestions(product.product_title, product.asin, product.country)
#     return {
#         "product_title": product.product_title,
#         "asin":          product.asin,
#         "suggestions":   suggestions,
#     }


# # ─────────────────────────────────────────
# # NEW: REVIEW SENTIMENT ANALYSIS
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/review_sentiment/{tracked_product_id}")
# def get_review_sentiment(
#     tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)
# ):
#     """NLP sentiment breakdown by topic (quality, packaging, value, shipping, support)."""
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     comments = parse_review_comments(product.review_comments)
#     if not comments:
#         return {"product_title": product.product_title, "asin": product.asin,
#                 "sentiment": {"error": "No reviews available for analysis."}}

#     sentiment = ai_review_sentiment(comments, product.product_title)
#     return {"product_title": product.product_title, "asin": product.asin, "sentiment": sentiment}


# # ─────────────────────────────────────────
# # NEW: RANK PREDICTION
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/rank_prediction/{tracked_product_id}")
# def get_rank_prediction(
#     tracked_product_id: int, keyword: str = None,
#     user_email: str = None, db: Session = Depends(get_db)
# ):
#     """
#     Linear regression rank prediction.
#     Pass ?keyword=... for single keyword. Omit for aggregate across all keywords.
#     """
#     query = db.query(KeywordRankHistory).filter(KeywordRankHistory.tracked_product_id == tracked_product_id)
#     if user_email:
#         query = query.filter(KeywordRankHistory.user_email == user_email)
#     if keyword:
#         query = query.filter(KeywordRankHistory.keyword == keyword)
#     history = query.order_by(KeywordRankHistory.checked_at.asc()).all()

#     if not history:
#         raise HTTPException(status_code=404, detail="No rank history found")

#     points = [{"rank": h.rank, "checked_at": h.checked_at.isoformat()} for h in history]
#     prediction = predict_rank(points)
#     return {"keyword": keyword or "aggregate", "prediction": prediction, "data_points": len(points)}


# # ─────────────────────────────────────────
# # NEW: PRICE ALERT
# # ─────────────────────────────────────────

# @router.post("/keyword_tracker/set_price_alert")
# def set_price_alert(req: PriceAlertRequest, db: Session = Depends(get_db)):
#     """
#     Set a price alert threshold. When any competitor is cheaper by
#     req.threshold_percent%, an email is sent to req.delivery_email via Brevo.
#     Checks immediately on creation and stores config for future background checks.
#     """
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == req.tracked_product_id)
#     if req.user_email:
#         query = query.filter(TrackedProduct.user_email == req.user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     db.execute(text("""
#         INSERT INTO price_alerts (tracked_product_id, user_email, threshold_percent, delivery_email)
#         VALUES (:pid, :email, :thresh, :demail)
#         ON CONFLICT DO NOTHING
#     """), {"pid": req.tracked_product_id, "email": req.user_email,
#            "thresh": req.threshold_percent, "demail": req.delivery_email})
#     db.commit()

#     # Immediate check on alert creation
#     seller_dict = {"asin": product.asin, "product_title": product.product_title}
#     competitors = find_competitor_matches(seller_dict, db, country=product.country, max_matches=5)
#     triggered = []
#     for comp in competitors:
#         if comp.product_price_numeric:
#             triggered.append({
#                 "competitor_asin":  comp.asin,
#                 "competitor_title": comp.product_title,
#                 "competitor_price": comp.product_price_numeric,
#                 "alert_threshold":  req.threshold_percent,
#             })

#     if triggered:
#         fire_price_alert(
#             product_title=product.product_title,
#             asin=product.asin,
#             threshold_percent=req.threshold_percent,
#             triggered=triggered,
#             delivery_email=req.delivery_email,
#         )

#     return {
#         "status":          "alert_set",
#         "product":         product.product_title,
#         "threshold":       f"{req.threshold_percent}%",
#         "alert_email":     req.delivery_email,
#         "immediate_check": triggered,
#         "email_sent":      len(triggered) > 0,
#     }


# # ─────────────────────────────────────────
# # NEW: MULTI-MARKETPLACE COMPARISON
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/cross_market_comparison/{asin}")
# async def cross_market_comparison(
#     asin: str,
#     countries: str = "IN,US,UK,DE",
#     db: Session = Depends(get_db),
# ):
#     """
#     Fetch the same ASIN across multiple marketplaces in parallel.
#     Returns price, rating, rank, and badge comparison per country.
#     """
#     country_list = [c.strip().upper() for c in countries.split(",") if c.strip().upper() in SUPPORTED_COUNTRIES]
#     if not country_list:
#         raise HTTPException(status_code=400, detail=f"No valid countries. Supported: {SUPPORTED_COUNTRIES}")

#     async def fetch_country(country: str) -> dict:
#         loop = asyncio.get_event_loop()
#         try:
#             resp = await loop.run_in_executor(
#                 None,
#                 lambda: requests.get(
#                     AMAZON_SEARCH_API_URL,
#                     headers=HEADERS,
#                     params={"query": asin, "country": country, "page": "1"},
#                     timeout=20,
#                 ),
#             )
#             resp.raise_for_status()
#             products = resp.json().get("data", {}).get("products", [])
#             match = next((p for p in products if p.get("asin") == asin), None)
#             if match:
#                 return {"country": country, "found": True, "data": match, "rank_in_search": next((i+1 for i, p in enumerate(products) if p.get("asin") == asin), None)}
#             return {"country": country, "found": False, "data": None, "rank_in_search": None}
#         except Exception as e:
#             return {"country": country, "found": False, "error": str(e), "data": None}

#     results = await asyncio.gather(*[fetch_country(c) for c in country_list])

#     found_markets = [r for r in results if r.get("found")]
#     if not found_markets:
#         return {"asin": asin, "markets": results, "best_market": None, "insights": "Product not found in any requested marketplace."}

#     best = max(found_markets, key=lambda r: r["data"].get("product_star_rating_numeric") or 0)

#     # AI cross-market insight
#     market_summary = "\n".join(
#         f"  {r['country']}: price={r['data'].get('product_price','?')}, rating={r['data'].get('product_star_rating','?')}, rank={r.get('rank_in_search','?')}"
#         for r in found_markets
#     )
#     prompt = f"""{SYSTEM_PERSONA}

# Product ASIN {asin} across marketplaces:
# {market_summary}

# In 2-3 direct sentences, tell the seller: which market is performing best and why, and one specific action they should take based on this cross-market data."""
#     try:
#         insight = _call_ollama(prompt, timeout=60)
#     except Exception:
#         insight = "Cross-market data collected. Compare pricing and ratings per country to identify expansion opportunities."

#     return {"asin": asin, "markets": results, "best_market": best.get("country"), "ai_insight": insight}


# # ─────────────────────────────────────────
# # NEW: COMPETITOR CHANGE ALERTS (diff)
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/competitor_changes/{seller_id}")
# def get_competitor_changes(
#     seller_id: str, user_email: str = None, db: Session = Depends(get_db)
# ):
#     """
#     Diff today's competitor snapshot vs yesterday's.
#     Returns detected changes in price, rating, badges.
#     """
#     today     = datetime.utcnow().strftime("%Y-%m-%d")
#     yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

#     query_params: dict = {"sid": seller_id, "today": today, "yesterday": yesterday}
#     email_filter = "AND user_email = :email" if user_email else ""
#     if user_email:
#         query_params["email"] = user_email

#     rows = db.execute(text(f"""
#         SELECT t.asin, t.snapshot_date, t.snapshot_data
#         FROM competitor_snapshots t
#         WHERE t.seller_id = :sid
#           AND t.snapshot_date IN (:today, :yesterday)
#           {email_filter}
#         ORDER BY t.asin, t.snapshot_date DESC
#     """), query_params).fetchall()

#     by_asin: dict = defaultdict(dict)
#     for asin, date, data in rows:
#         by_asin[asin][str(date)] = json.loads(data) if isinstance(data, str) else data

#     changes = []
#     watch_fields = ["product_price_numeric", "product_star_rating_numeric",
#                     "product_num_ratings", "is_best_seller", "is_amazon_choice"]

#     for asin, snapshots in by_asin.items():
#         today_data     = snapshots.get(today, [])
#         yesterday_data = snapshots.get(yesterday, [])
#         if not today_data or not yesterday_data:
#             continue

#         today_map     = {c["asin"]: c for c in today_data}
#         yesterday_map = {c["asin"]: c for c in yesterday_data}

#         for comp_asin, today_comp in today_map.items():
#             yesterday_comp = yesterday_map.get(comp_asin)
#             if not yesterday_comp:
#                 continue
#             diffs = []
#             for field in watch_fields:
#                 old_val = yesterday_comp.get(field)
#                 new_val = today_comp.get(field)
#                 if old_val != new_val and old_val is not None and new_val is not None:
#                     diffs.append({"field": field, "old_value": old_val, "new_value": new_val})
#             if diffs:
#                 changes.append({
#                     "seller_asin":     asin,
#                     "competitor_asin": comp_asin,
#                     "competitor_title": today_comp.get("product_title", ""),
#                     "changes":         diffs,
#                     "detected_at":     today,
#                 })

#     return {
#         "seller_id":     seller_id,
#         "period":        f"{yesterday} → {today}",
#         "total_changes": len(changes),
#         "changes":       changes,
#     }


# # ─────────────────────────────────────────
# # NEW: EXPORT (CSV + PDF)
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/export/{tracked_product_id}")
# def export_report(
#     tracked_product_id: int,
#     format: str = "pdf",
#     user_email: str = None,
#     db: Session = Depends(get_db),
# ):
#     """
#     Export rank history + AI analysis as PDF or CSV.
#     ?format=pdf  (default)
#     ?format=csv
#     """
#     query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
#     if user_email:
#         query = query.filter(TrackedProduct.user_email == user_email)
#     product = query.first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     kw_query = db.query(KeywordRankHistory).filter(
#         KeywordRankHistory.tracked_product_id == tracked_product_id
#     )
#     if user_email:
#         kw_query = kw_query.filter(KeywordRankHistory.user_email == user_email)
#     history = kw_query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

#     rank_history_dicts = [
#         {"keyword": h.keyword, "rank": h.rank,
#          "velocity": 0.0, "checked_at": h.checked_at.isoformat()}
#         for h in history
#     ]

#     if format.lower() == "csv":
#         import csv
#         buf = BytesIO()
#         import io
#         text_buf = io.StringIO()
#         writer = csv.DictWriter(text_buf, fieldnames=["keyword", "rank", "velocity", "checked_at"])
#         writer.writeheader()
#         writer.writerows(rank_history_dicts)
#         csv_bytes = text_buf.getvalue().encode("utf-8")
#         return StreamingResponse(
#             BytesIO(csv_bytes),
#             media_type="text/csv",
#             headers={"Content-Disposition": f"attachment; filename={product.asin}_ranks.csv"},
#         )

#     # PDF
#     by_kw: dict = defaultdict(list)
#     for h in history:
#         by_kw[h.keyword].append({"rank": h.rank, "checked_at": h.checked_at.isoformat()})

#     rank_summary = [
#         {
#             "keyword": kw, "current_rank": ranks[0]["rank"],
#             "previous_rank": ranks[1]["rank"] if len(ranks) > 1 else None,
#             "change": (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) > 1 else 0,
#             "trend": "stable", "velocity": compute_velocity(ranks),
#         }
#         for kw, ranks in by_kw.items()
#     ]

#     ai_analysis = ai_keyword_analysis(product.product_title, product.asin, product.country, rank_summary)
#     prediction  = predict_rank([{"rank": h.rank, "checked_at": h.checked_at.isoformat()} for h in history])

#     product_resp = TrackedProductResponse(
#         id=product.id, seller_id=product.seller_id, asin=product.asin,
#         product_title=product.product_title, product_photo=product.product_photo,
#         country=product.country, user_email=product.user_email,
#     )
#     pdf_buf = generate_pdf_report(product_resp, rank_history_dicts, ai_analysis, prediction)

#     return StreamingResponse(
#         pdf_buf,
#         media_type="application/pdf",
#         headers={"Content-Disposition": f"attachment; filename={product.asin}_report.pdf"},
#     )


# # ─────────────────────────────────────────
# # NEW: RATE LIMIT STATUS
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/rate_limit_status")
# def get_rate_limit_status(user_email: str, db: Session = Depends(get_db)):
#     """Check remaining manual rank update calls for today."""
#     rl = check_rank_update_ratelimit(user_email, db)
#     return {
#         "user_email": user_email,
#         "rank_updates_used":      rl["used"],
#         "rank_updates_limit":     rl["limit"],
#         "rank_updates_remaining": rl["limit"] - rl["used"],
#         "resets_at":              rl["resets_at"],
#         "auto_update_schedule":   "Daily at 06:00 UTC (always runs)",
#     }


# # ─────────────────────────────────────────
# # EXISTING: competitor comparison endpoints (preserved)
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/competitor_comparison/{seller_id}", response_model=ComparisonResponse)
# def get_competitor_comparison(
#     seller_id: str, country: str = "IN", user_email: str = None,
#     max_competitors_per_product: int = 3, db: Session = Depends(get_db)
# ):
#     if not user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")
#     products = db.query(TrackedProduct).filter(
#         TrackedProduct.seller_id == seller_id,
#         TrackedProduct.user_email == user_email,
#         TrackedProduct.country == country,
#     ).all()
#     if not products:
#         raise HTTPException(status_code=404, detail=f"No tracked products found for seller {seller_id}")

#     all_comparisons = []
#     for p in products:
#         seller_dict = {
#             "asin": p.asin, "product_title": p.product_title, "product_photo": p.product_photo,
#             "country": p.country, "product_price_numeric": None,
#             "product_star_rating_numeric": None, "product_num_ratings": None,
#             "is_best_seller": False, "is_amazon_choice": False, "is_prime": False,
#         }
#         for comp in find_competitor_matches(seller_dict, db, country=country, max_matches=max_competitors_per_product):
#             all_comparisons.append(ProductComparison(
#                 seller_product=seller_dict, competitor_product=comp,
#                 comparison_metrics=generate_comparison_metrics(seller_dict, comp),
#             ))

#     return ComparisonResponse(
#         seller_id=seller_id, total_seller_products=len(products),
#         total_comparisons=len(all_comparisons), comparisons=all_comparisons,
#     )


# @router.get("/keyword_tracker/fetch_and_compare/{seller_id}")
# def fetch_products_with_comparison(
#     seller_id: str, country: str = "IN", page: int = 1,
#     user_email: str = None, user_id: int = None, db: Session = Depends(get_db)
# ):
#     if not user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")
#     try:
#         resp = requests.get(AMAZON_API_URL, headers=HEADERS,
#                             params={"seller_id": seller_id, "country": country,
#                                     "page": page, "sort_by": "RELEVANCE"}, timeout=20)
#         resp.raise_for_status()
#         seller_products = resp.json().get("data", {}).get("seller_products", [])
#         if not seller_products:
#             return {"products": [], "comparisons": []}

#         comments, ratings = fetch_seller_reviews(seller_id, country)
#         comments_json = json.dumps(comments) if comments else None
#         ratings_json  = json.dumps(ratings)  if ratings  else None
#         saved_products = []

#         for item in seller_products:
#             existing = db.query(TrackedProduct).filter(
#                 TrackedProduct.seller_id == seller_id, TrackedProduct.asin == item["asin"],
#                 TrackedProduct.user_email == user_email,
#             ).first()
#             if existing:
#                 existing.review_comments = comments_json
#                 existing.review_ratings  = ratings_json
#                 db.commit(); db.refresh(existing)
#                 saved_products.append(existing)
#             else:
#                 new_p = TrackedProduct(
#                     seller_id=seller_id, asin=item["asin"], product_title=item["product_title"],
#                     product_photo=item.get("product_photo", ""), country=country,
#                     user_email=user_email, review_comments=comments_json, review_ratings=ratings_json,
#                 )
#                 db.add(new_p); db.commit(); db.refresh(new_p)
#                 saved_products.append(new_p)

#         all_comparisons = []
#         for sp in seller_products:
#             for comp in find_competitor_matches(sp, db, country=country, max_matches=3):
#                 all_comparisons.append({
#                     "seller_product":     {"asin": sp["asin"], "title": sp["product_title"], "photo": sp.get("product_photo")},
#                     "competitor_product": comp.model_dump(),
#                     "comparison_metrics": generate_comparison_metrics(sp, comp),
#                 })

#         return {
#             "products": [
#                 {"id": p.id, "seller_id": p.seller_id, "asin": p.asin,
#                  "product_title": p.product_title, "product_photo": p.product_photo,
#                  "country": p.country, "user_email": p.user_email,
#                  "review_comments": parse_review_comments(p.review_comments),
#                  "review_ratings":  parse_review_ratings(p.review_ratings)}
#                 for p in saved_products
#             ],
#             "comparisons":       all_comparisons,
#             "total_products":    len(saved_products),
#             "total_comparisons": len(all_comparisons),
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # ═══════════════════════════════════════════════════════════════════
# # COMPETITOR INTELLIGENCE CHAT
# # A conversational AI endpoint — seller asks anything about their
# # competitors. Past, present, future. Human-like, memory-aware,
# # data-grounded. Feels like talking to a real strategist.
# # ═══════════════════════════════════════════════════════════════════

# # ─────────────────────────────────────────
# # CHAT PERSONA — deeper than SYSTEM_PERSONA
# # ─────────────────────────────────────────

# CHAT_PERSONA = """You are Insydz — a sharp, experienced Amazon marketplace strategist who has helped hundreds of sellers compete and win.

# Your personality:
# - You speak like a real person, not a report generator. Conversational, direct, occasionally blunt.
# - You never hedge everything. If the data says a competitor is crushing it, you say so.
# - You remember what was said earlier in this conversation and refer back to it naturally.
# - You ask one follow-up question when you need more context — but only one.
# - You use "I", "you", "we" naturally. You're having a conversation, not writing a document.
# - Short sentences when making a point. Longer ones when explaining nuance.
# - You never use: "Certainly!", "Absolutely!", "Great question!", "Of course!", "As an AI..."
# - When you don't know something from the data, you say "I don't have that data right now" — not "I cannot determine..."
# - You occasionally say things like "Honestly,", "Here's the thing —", "Look,", "Real talk —" to sound human.
# - Numbers matter. Always reference the actual figures you've been given.
# - You give opinions. "I think they're about to drop their price" is better than "price changes are possible".

# Your knowledge scope for this conversation:
# - Everything about the seller's tracked product (title, ASIN, country, reviews, ratings)
# - Full competitor list with prices, ratings, review counts, badges (best seller, amazon choice, prime)
# - Keyword rank history with velocity and trends
# - Competitor snapshot history (changes over time)
# - Rank prediction data (7-day and 30-day forecasts)

# Time awareness:
# - "past" questions → use snapshot history, rank history, rating/price changes over time
# - "present" questions → use current competitor data, current ranks, current badges
# - "future" questions → use rank prediction, velocity trends, price patterns, your strategic judgment
# - "what should I do" → give a direct action plan based on everything above

# Never make up data. If a specific number isn't in the context, say so and reason from what you do have."""


# # ─────────────────────────────────────────
# # PYDANTIC MODELS FOR CHAT
# # ─────────────────────────────────────────

# class ChatMessage(BaseModel):
#     role: str       # "user" or "assistant"
#     content: str


# class CompetitorChatRequest(BaseModel):
#     tracked_product_id: int
#     user_email:         str
#     message:            str                          # current user message
#     history:            Optional[List[ChatMessage]] = []   # prior turns


# class CompetitorChatResponse(BaseModel):
#     reply:              str
#     context_used:       dict    # what data was loaded — helpful for frontend debug/display
#     suggested_followups: List[str]   # 3 natural next questions the seller might want to ask


# # ─────────────────────────────────────────
# # HELPER — build rich context snapshot
# # ─────────────────────────────────────────

# def _build_competitor_context(
#     product: TrackedProduct,
#     db: Session,
#     user_email: str,
# ) -> dict:
#     """
#     Assembles everything known about a product and its competitors
#     into a structured context dict for the AI.
#     """

#     # ── Keyword rank history ──
#     kw_rows = db.execute(text("""
#         SELECT keyword, rank, checked_at
#         FROM keyword_rank_history
#         WHERE tracked_product_id = :pid AND user_email = :email
#         ORDER BY keyword, checked_at DESC
#     """), {"pid": product.id, "email": user_email}).fetchall()

#     by_kw: dict = defaultdict(list)
#     for kw, rank, checked_at in kw_rows:
#         by_kw[kw].append({"rank": rank, "checked_at": checked_at.isoformat()})

#     keyword_summary = []
#     for kw, ranks in by_kw.items():
#         velocity = compute_velocity(ranks)
#         change   = (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) >= 2 else 0
#         keyword_summary.append({
#             "keyword":        kw,
#             "current_rank":   ranks[0]["rank"] if ranks else 0,
#             "previous_rank":  ranks[1]["rank"] if len(ranks) >= 2 else None,
#             "change":         change,
#             "velocity":       velocity,
#             "trend":          "improving" if velocity > 0.3 else "declining" if velocity < -0.3 else "stable",
#             "history_count":  len(ranks),
#         })

#     # Overall rank prediction
#     all_points = [{"rank": r["rank"], "checked_at": r["checked_at"]}
#                   for ranks in by_kw.values() for r in ranks]
#     prediction = predict_rank(sorted(all_points, key=lambda x: x["checked_at"])) if all_points else {}

#     # ── Live competitors ──
#     seller_dict = {
#         "asin":                      product.asin,
#         "product_title":             product.product_title,
#         "product_price_numeric":     None,
#         "product_star_rating_numeric": None,
#         "product_num_ratings":       None,
#         "is_best_seller":            False,
#         "is_amazon_choice":          False,
#         "is_prime":                  False,
#     }
#     competitors = find_competitor_matches(seller_dict, db, country=product.country, max_matches=6)
#     competitor_details = []
#     for c in competitors:
#         metrics = generate_comparison_metrics(seller_dict, c)
#         competitor_details.append({
#             "asin":             c.asin,
#             "title":            c.product_title,
#             "price":            c.product_price_numeric,
#             "rating":           c.product_star_rating_numeric,
#             "review_count":     c.product_num_ratings,
#             "is_best_seller":   c.is_best_seller,
#             "is_amazon_choice": c.is_amazon_choice,
#             "is_prime":         c.is_prime,
#             "sales_volume":     c.sales_volume,
#             "advantages_over_you":    metrics.get("competitive_disadvantages", []),
#             "your_advantages_over":   metrics.get("competitive_advantages", []),
#             "price_diff_percent":     metrics.get("price_comparison", {}).get("difference_percent"),
#             "rating_diff":            metrics.get("rating_comparison", {}).get("difference"),
#         })

#     # ── Snapshot history (competitor changes over time) ──
#     snapshot_rows = db.execute(text("""
#         SELECT snapshot_date, snapshot_data
#         FROM competitor_snapshots
#         WHERE asin = :asin AND user_email = :email
#         ORDER BY snapshot_date DESC
#         LIMIT 14
#     """), {"asin": product.asin, "email": user_email}).fetchall()

#     snapshot_timeline = []
#     for snap_date, snap_data in snapshot_rows:
#         data = json.loads(snap_data) if isinstance(snap_data, str) else (snap_data or [])
#         snapshot_timeline.append({
#             "date":        str(snap_date),
#             "competitors": [
#                 {
#                     "asin":             c.get("asin"),
#                     "title":            c.get("product_title", "")[:60],
#                     "price":            c.get("product_price_numeric"),
#                     "rating":           c.get("product_star_rating_numeric"),
#                     "review_count":     c.get("product_num_ratings"),
#                     "is_best_seller":   c.get("is_best_seller"),
#                     "is_amazon_choice": c.get("is_amazon_choice"),
#                 }
#                 for c in data[:5]
#             ],
#         })

#     # ── Review sentiment (from stored comments) ──
#     comments = parse_review_comments(product.review_comments)
#     ratings  = parse_review_ratings(product.review_ratings)
#     avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

#     return {
#         "product": {
#             "id":            product.id,
#             "asin":          product.asin,
#             "title":         product.product_title,
#             "country":       product.country,
#             "seller_id":     product.seller_id,
#             "avg_rating":    avg_rating,
#             "review_count":  len(ratings),
#             "sample_reviews": comments[:10],
#         },
#         "keywords":           keyword_summary,
#         "rank_prediction":    prediction,
#         "competitors":        competitor_details,
#         "snapshot_timeline":  snapshot_timeline,
#         "data_freshness": {
#             "competitors_live":    len(competitor_details) > 0,
#             "keyword_data_points": sum(k["history_count"] for k in keyword_summary),
#             "snapshot_days":       len(snapshot_timeline),
#         },
#     }


# def _format_context_for_prompt(ctx: dict) -> str:
#     """
#     Converts the context dict into a dense, readable text block
#     that the AI can reason over naturally.
#     """
#     lines = []

#     p = ctx["product"]
#     lines.append(f"=== SELLER'S PRODUCT ===")
#     lines.append(f"Title: {p['title']}")
#     lines.append(f"ASIN: {p['asin']} | Country: {p['country']}")
#     lines.append(f"Avg rating: {p['avg_rating'] or 'unknown'} | Reviews: {p['review_count']}")
#     if p["sample_reviews"]:
#         lines.append(f"Sample customer feedback: {' | '.join(p['sample_reviews'][:3])}")

#     lines.append(f"\n=== KEYWORD RANKINGS ===")
#     if ctx["keywords"]:
#         for k in ctx["keywords"]:
#             arrow = "↑" if k["trend"] == "improving" else "↓" if k["trend"] == "declining" else "→"
#             lines.append(
#                 f"  '{k['keyword']}': rank #{k['current_rank']} {arrow} "
#                 f"(velocity: {k['velocity']:+.2f}, trend: {k['trend']}, "
#                 f"prev rank: {k['previous_rank'] or 'N/A'})"
#             )
#     else:
#         lines.append("  No keyword data available yet.")

#     pred = ctx["rank_prediction"]
#     if pred.get("predicted_7d"):
#         lines.append(
#             f"\n=== RANK FORECAST ===\n"
#             f"  7-day: #{pred['predicted_7d']} (±{pred.get('margin_7d', '?')}) | "
#             f"30-day: #{pred['predicted_30d']} (±{pred.get('margin_30d', '?')}) | "
#             f"Trend: {pred.get('trend', 'unknown')} | Confidence: {pred.get('confidence', 'low')}"
#         )

#     lines.append(f"\n=== CURRENT COMPETITORS ({len(ctx['competitors'])} found) ===")
#     for i, c in enumerate(ctx["competitors"], 1):
#         badges = []
#         if c["is_best_seller"]:   badges.append("BEST SELLER")
#         if c["is_amazon_choice"]: badges.append("AMAZON'S CHOICE")
#         if c["is_prime"]:         badges.append("PRIME")
#         badge_str = f" [{', '.join(badges)}]" if badges else ""
#         lines.append(
#             f"  {i}. {c['title'][:55]}{badge_str}\n"
#             f"     ASIN: {c['asin']} | Price: ₹{c['price'] or '?'} | "
#             f"Rating: {c['rating'] or '?'} | Reviews: {c['review_count'] or '?'}\n"
#             f"     Their edge over you: {', '.join(c['advantages_over_you']) or 'none identified'}\n"
#             f"     Your edge over them: {', '.join(c['your_advantages_over']) or 'none identified'}"
#         )

#     if ctx["snapshot_timeline"]:
#         lines.append(f"\n=== COMPETITOR HISTORY (last {len(ctx['snapshot_timeline'])} days) ===")
#         for snap in ctx["snapshot_timeline"][:7]:
#             comp_summary = ", ".join(
#                 f"{c['title'][:30]} @₹{c['price'] or '?'} ★{c['rating'] or '?'}"
#                 for c in snap["competitors"][:3]
#             )
#             lines.append(f"  {snap['date']}: {comp_summary}")
#     else:
#         lines.append("\n=== COMPETITOR HISTORY ===\n  No historical snapshots yet (scheduler runs daily).")

#     return "\n".join(lines)


# def _format_history_for_prompt(history: List[ChatMessage]) -> str:
#     """Formats prior conversation turns into a readable block."""
#     if not history:
#         return ""
#     lines = ["\n=== CONVERSATION SO FAR ==="]
#     for msg in history[-10:]:   # last 10 turns max — keeps prompt lean
#         prefix = "Seller" if msg.role == "user" else "Insydz"
#         lines.append(f"{prefix}: {msg.content}")
#     return "\n".join(lines)


# def _generate_followup_suggestions(message: str, ctx: dict) -> List[str]:
#     """
#     Returns 3 natural follow-up questions based on what was just asked
#     and what data is available. No AI call — pure logic, fast.
#     """
#     msg_lower = message.lower()
#     has_history  = len(ctx["snapshot_timeline"]) > 0
#     has_keywords = len(ctx["keywords"]) > 0
#     has_comps    = len(ctx["competitors"]) > 0
#     has_pred     = bool(ctx["rank_prediction"].get("predicted_7d"))

#     suggestions = []

#     # Context-aware suggestion pools
#     if any(w in msg_lower for w in ["future", "predict", "forecast", "will", "going to"]):
#         suggestions += [
#             "Which keyword should I push hardest in the next 30 days?",
#             "Is my price likely to become a problem against competitors?",
#             "What's the biggest risk to my ranking in the next month?",
#         ]
#     elif any(w in msg_lower for w in ["past", "history", "before", "used to", "changed"]):
#         suggestions += [
#             "Have any competitors gained or lost badges recently?",
#             "Which competitor has been most consistent over time?",
#             "How has my keyword rank trended compared to 2 weeks ago?",
#         ]
#     elif any(w in msg_lower for w in ["price", "pricing", "cheaper", "expensive", "cost"]):
#         suggestions += [
#             "Should I lower my price or compete on quality signals instead?",
#             "Which competitor is most vulnerable to a price undercut?",
#             "What's the sweet spot price for my category right now?",
#         ]
#     elif any(w in msg_lower for w in ["review", "rating", "customer", "feedback"]):
#         suggestions += [
#             "What are customers complaining about most with my competitors?",
#             "How can I use their negative reviews to improve my listing?",
#             "Which competitor has the worst review quality despite high volume?",
#         ]
#     elif any(w in msg_lower for w in ["keyword", "rank", "search", "seo"]):
#         suggestions += [
#             "Which competitor is winning on my most important keyword?",
#             "Are there keywords I should be tracking that I'm missing?",
#             "What does my rank velocity tell you about the next 2 weeks?",
#         ]
#     else:
#         # Generic but still contextual
#         if has_comps:
#             suggestions.append("Who is my most dangerous competitor right now and why?")
#         if has_pred:
#             suggestions.append("What does my rank prediction tell you about the next month?")
#         if has_history:
#             suggestions.append("Has anything changed with my competitors in the past week?")
#         if has_keywords:
#             suggestions.append("Which of my keywords has the best momentum right now?")
#         suggestions.append("What's the one thing I should do this week to improve my position?")

#     return suggestions[:3]


# # ─────────────────────────────────────────
# # THE CHAT ENDPOINT
# # ─────────────────────────────────────────

# @router.post("/keyword_tracker/competitor_chat", response_model=CompetitorChatResponse)
# def competitor_chat(req: CompetitorChatRequest, db: Session = Depends(get_db)):
#     """
#     Conversational competitor intelligence chat.

#     Send a message + optional conversation history.
#     Returns Insydz's reply, the context she used, and 3 suggested follow-ups.

#     The AI has full access to:
#       - Seller's product data and reviews
#       - All competitors with prices, ratings, badges
#       - Keyword rank history and velocity
#       - Competitor snapshot timeline (past changes)
#       - Rank predictions (7d + 30d)

#     Frontend usage:
#       1. First message: send message + empty history []
#       2. Each subsequent turn: append previous {role, content} pairs to history
#       3. Display suggested_followups as quick-reply chips
#     """
#     if not req.user_email:
#         raise HTTPException(status_code=400, detail="user_email is required")
#     if not req.message.strip():
#         raise HTTPException(status_code=400, detail="message cannot be empty")

#     # ── Load product ──
#     product = db.query(TrackedProduct).filter(
#         TrackedProduct.id == req.tracked_product_id,
#         TrackedProduct.user_email == req.user_email,
#     ).first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found or doesn't belong to this user")

#     # ── Build context ──
#     ctx            = _build_competitor_context(product, db, req.user_email)
#     context_text   = _format_context_for_prompt(ctx)
#     history_text   = _format_history_for_prompt(req.history)

#     # ── Detect intent for prompt shaping ──
#     msg_lower = req.message.lower()
#     time_hint = ""
#     if any(w in msg_lower for w in ["future", "predict", "forecast", "will", "going to", "next month", "next week"]):
#         time_hint = "\nThe seller is asking about the FUTURE. Lean on rank predictions, velocity trends, and your strategic judgment. Be specific about timeframes."
#     elif any(w in msg_lower for w in ["past", "history", "before", "last week", "last month", "used to", "changed", "was"]):
#         time_hint = "\nThe seller is asking about the PAST. Use the snapshot timeline and rank history. Call out specific dates and changes."
#     elif any(w in msg_lower for w in ["now", "current", "today", "right now", "at the moment"]):
#         time_hint = "\nThe seller is asking about the PRESENT. Focus on current competitor data, live ranks, and active badges."
#     elif any(w in msg_lower for w in ["should", "do", "action", "help", "advice", "recommend", "strategy"]):
#         time_hint = "\nThe seller wants actionable advice. Give them a direct, specific answer — not a list of options. Tell them exactly what to do."

#     # ── Build the full prompt ──
#     prompt = f"""{CHAT_PERSONA}
# {time_hint}

# {context_text}
# {history_text}

# === SELLER'S QUESTION ===
# {req.message.strip()}

# === YOUR REPLY ===
# Respond as Insydz. Be conversational, specific, and use the actual data above.
# - Keep your reply focused — 3 to 6 sentences for simple questions, a short structured answer for complex ones.
# - Reference actual competitor names, prices, ratings, or keyword ranks from the data above.
# - If the data doesn't support a confident answer, say what you do know and what you'd need to be certain.
# - End with ONE natural follow-up question if it would genuinely help the seller — but only if it makes sense. Don't force it.
# - Do NOT use markdown headers, bullet asterisks, or numbered lists unless the question specifically calls for a structured breakdown.
# - Write as you'd speak to someone across a table."""

#     # ── Call Ollama ──
#     try:
#         reply = _call_ollama(prompt, timeout=120)
#         if not reply:
#             reply = (
#                 "I'm having a moment — Ollama didn't return a response. "
#                 "Try asking again in a few seconds. "
#                 "If it keeps happening, check that the model is loaded with `ollama run llama3.2:3b`."
#             )
#     except requests.exceptions.ConnectionError:
#         reply = (
#             "Can't reach Ollama right now. Make sure it's running on "
#             f"{OLLAMA_BASE} with `ollama serve`. "
#             "Once it's up, your question will work fine."
#         )
#     except requests.exceptions.Timeout:
#         reply = (
#             "That one took too long — the model timed out. "
#             "Try a slightly shorter question, or check if the server is under load."
#         )
#     except Exception as e:
#         reply = f"Something went wrong on my end: {str(e)}. Try again in a moment."

#     # ── Suggested follow-ups ──
#     followups = _generate_followup_suggestions(req.message, ctx)

#     return CompetitorChatResponse(
#         reply=reply,
#         context_used={
#             "product_asin":          ctx["product"]["asin"],
#             "product_title":         ctx["product"]["title"],
#             "competitors_loaded":    len(ctx["competitors"]),
#             "keywords_loaded":       len(ctx["keywords"]),
#             "snapshot_days":         ctx["data_freshness"]["snapshot_days"],
#             "keyword_data_points":   ctx["data_freshness"]["keyword_data_points"],
#             "rank_prediction_available": bool(ctx["rank_prediction"].get("predicted_7d")),
#         },
#         suggested_followups=followups,
#     )


# # ─────────────────────────────────────────
# # CHAT STARTER — first message suggestions
# # when seller opens the chat for the first time
# # ─────────────────────────────────────────

# @router.get("/keyword_tracker/competitor_chat/starters/{tracked_product_id}")
# def get_chat_starters(
#     tracked_product_id: int,
#     user_email: str,
#     db: Session = Depends(get_db),
# ):
#     """
#     Returns contextual opening questions for the chat UI
#     so sellers know what they can ask Insydz about.
#     Generated based on what data is actually available for this product.
#     """
#     product = db.query(TrackedProduct).filter(
#         TrackedProduct.id == tracked_product_id,
#         TrackedProduct.user_email == user_email,
#     ).first()
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     has_keywords = db.execute(text(
#         "SELECT COUNT(*) FROM keyword_rank_history WHERE tracked_product_id=:pid AND user_email=:email"
#     ), {"pid": tracked_product_id, "email": user_email}).scalar() > 0

#     has_snapshots = db.execute(text(
#         "SELECT COUNT(*) FROM competitor_snapshots WHERE asin=:asin AND user_email=:email"
#     ), {"asin": product.asin, "email": user_email}).scalar() > 0

#     has_reviews = bool(parse_review_comments(product.review_comments))

#     starters = [
#         {
#             "category": "Right now",
#             "questions": [
#                 "Who is my biggest competitor right now and what are they doing better than me?",
#                 "Which competitor is most likely to steal my customers this week?",
#                 "How does my price compare to the top 3 competitors today?",
#             ],
#         },
#         {
#             "category": "Looking back",
#             "questions": [
#                 "Have any competitors changed their price or rating recently?"
#                 if has_snapshots else
#                 "What's the competitive landscape in my category?",
#                 "Which competitor has been most consistent over time?",
#                 "Has my ranking been improving or declining over the past few weeks?",
#             ],
#         },
#         {
#             "category": "Looking ahead",
#             "questions": [
#                 "Where do you think my ranking will be in 30 days?",
#                 "Which competitor do you think is about to make a move?",
#                 "What should I do in the next 2 weeks to stay ahead?",
#             ],
#         },
#     ]

#     if has_keywords:
#         starters.append({
#             "category": "Keywords",
#             "questions": [
#                 "Which of my keywords has the best momentum right now?",
#                 "Which keyword should I focus on to climb the fastest?",
#                 "Are any of my keywords at risk of dropping out of the top 20?",
#             ],
#         })

#     if has_reviews:
#         starters.append({
#             "category": "Reviews & sentiment",
#             "questions": [
#                 "What are customers saying about my competitors that I can learn from?",
#                 "Which competitor has the worst review quality despite high volume?",
#                 "How can I use competitor review weaknesses in my own listing?",
#             ],
#         })

#     return {
#         "product_title": product.product_title,
#         "asin":          product.asin,
#         "starters":      starters,
#         "intro": (
#             f"Hey — I'm Insydz. I've pulled up everything on your competitors "
#             f"for '{product.product_title}'. "
#             f"Ask me anything — past, present, or where things are headed. "
#             f"What do you want to know?"
#         ),
#     }

import os
import json
import time
import math
import asyncio
import requests
import numpy as np
from io import BytesIO
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from dotenv import load_dotenv

from app.models.legacy_models import TrackedProduct, KeywordRankHistory, User
from app.db.session import get_db, SessionLocal

# ─────────────────────────────────────────
# ENV + CONFIG
# ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

RAPIDAPI_KEY  = os.environ.get("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.environ.get("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
AMAZON_API_URL            = "https://real-time-amazon-data.p.rapidapi.com/seller-products"
AMAZON_REVIEWS_API_URL    = "https://real-time-amazon-data.p.rapidapi.com/seller-reviews"
AMAZON_SEARCH_API_URL     = "https://real-time-amazon-data.p.rapidapi.com/search"
AMAZON_SELLER_PROFILE_URL = "https://real-time-amazon-data.p.rapidapi.com/seller-profile"   # NEW

HEADERS = {
    "X-RapidAPI-Key":  RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}

OLLAMA_BASE  = settings.OLLAMA_BASE_URL
OLLAMA_MODEL = "llama3.2:3b"

# ─────────────────────────────────────────
# BREVO EMAIL CONFIG
# ─────────────────────────────────────────
BREVO_API_KEY      = os.environ.get("BREVO_API_KEY", "")
BREVO_SENDER_EMAIL = os.environ.get("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME  = os.environ.get("BREVO_SENDER_NAME", "Insydz")
BREVO_API_URL      = "https://api.brevo.com/v3/smtp/email"

# Marketplaces supported for cross-comparison
SUPPORTED_COUNTRIES = ["IN", "US", "UK", "DE", "AE"]

# Rate limit: max 4 manual rank-update calls per user per calendar day
RANK_UPDATE_DAILY_LIMIT = 4

# ─────────────────────────────────────────
# SUBSCRIPTION TIERS
# ─────────────────────────────────────────



# ─────────────────────────────────────────
# PYDANTIC MODELS
# ─────────────────────────────────────────

class ProductTrackRequest(BaseModel):
    seller_id:     str
    asin:          str
    product_title: str
    product_photo: str
    country:       str = "IN"
    user_email:    str


class TrackedProductResponse(BaseModel):
    id:            int
    seller_id:     str
    asin:          str
    product_title: str
    product_photo: str
    country:       str
    user_email:    str
    # ── Product listing fields (NEW) ──
    product_price:               Optional[str]   = None
    product_original_price:      Optional[str]   = None
    currency:                    Optional[str]   = None
    product_star_rating:         Optional[str]   = None
    product_star_rating_numeric: Optional[float] = None
    product_num_ratings:         Optional[int]   = None
    product_url:                 Optional[str]   = None
    product_num_offers:          Optional[int]   = None
    product_minimum_offer_price: Optional[str]   = None
    is_best_seller:              Optional[bool]  = False
    is_amazon_choice:            Optional[bool]  = False
    is_prime:                    Optional[bool]  = False
    climate_pledge_friendly:     Optional[bool]  = False
    sales_volume:                Optional[str]   = None
    delivery:                    Optional[str]   = None
    has_variations:              Optional[bool]  = False
    unit_price:                  Optional[str]   = None
    unit_count:                  Optional[int]   = None
    # ── Seller profile fields ──
    seller_name:          Optional[str]   = None
    seller_logo:          Optional[str]   = None
    seller_link:          Optional[str]   = None
    store_link:           Optional[str]   = None
    seller_phone:         Optional[str]   = None
    business_name:        Optional[str]   = None
    business_address:     Optional[str]   = None
    seller_rating:        Optional[float] = None
    seller_ratings_total: Optional[int]   = None
    # ── Review fields ──
    review_comments:     Optional[List[str]]  = []
    review_ratings:      Optional[List[int]]  = []
    review_authors:      Optional[List[str]]  = []
    review_dates:        Optional[List[str]]  = []
    review_has_response: Optional[List[bool]] = []
    model_config = {"from_attributes": True}

    @field_validator("review_comments", mode="before")
    @classmethod
    def parse_comments(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []

    @field_validator("review_ratings", mode="before")
    @classmethod
    def parse_ratings(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v or []


class KeywordTrackRequest(BaseModel):
    tracked_product_id: int
    keywords:           List[str]
    user_email:         str


class KeywordRankResponse(BaseModel):
    keyword:    str
    rank:       Optional[int]   = 0
    velocity:   Optional[float] = 0.0
    checked_at: datetime
    user_email: str
    model_config = {"from_attributes": True}


class AIAnalysisResponse(BaseModel):
    product_title:  str
    asin:           str
    total_keywords: int
    analysis:       dict


class UpdateRanksRequest(BaseModel):
    user_email: str


class UsageLimitsResponse(BaseModel):
    count:             int
    limit:             int
    remaining:         int
    subscription_tier: str


class CompetitorProduct(BaseModel):
    id:                             int
    asin:                           str
    category_id:                    Optional[int]
    category_name:                  Optional[str]
    product_title:                  str
    product_url:                    Optional[str]
    product_photo:                  Optional[str]
    product_price:                  Optional[str]
    product_price_numeric:          Optional[float]
    product_original_price:         Optional[str]
    product_original_price_numeric: Optional[float]
    product_star_rating:            Optional[str]
    product_star_rating_numeric:    Optional[float]
    product_num_ratings:            Optional[int]
    is_best_seller:                 Optional[bool]
    is_amazon_choice:               Optional[bool]
    is_prime:                       Optional[bool]
    sales_volume:                   Optional[str]
    country:                        Optional[str]
    avg_price:                      Optional[float]
    min_price:                      Optional[float]
    max_price:                      Optional[float]
    avg_sales_volume:               Optional[float]
    min_sales_volume:               Optional[float]
    max_sales_volume:               Optional[float]


class ProductComparison(BaseModel):
    seller_product:     dict
    competitor_product: CompetitorProduct
    comparison_metrics: dict


class ComparisonResponse(BaseModel):
    seller_id:             str
    total_seller_products: int
    total_comparisons:     int
    comparisons:           List[ProductComparison]


class PriceAlertRequest(BaseModel):
    tracked_product_id: int
    user_email:         str
    threshold_percent:  float
    delivery_email:     str


class CompetitorSnapshotDiff(BaseModel):
    asin:          str
    product_title: str
    changes:       List[dict]
    detected_at:   datetime


class ChatMessage(BaseModel):
    role:    str
    content: str


class CompetitorChatRequest(BaseModel):
    tracked_product_id: int
    user_email:         str
    message:            str
    history:            Optional[List[ChatMessage]] = []


class CompetitorChatResponse(BaseModel):
    reply:               str
    context_used:        dict
    suggested_followups: List[str]


# ─────────────────────────────────────────
# HELPERS — parse stored JSON columns
# ─────────────────────────────────────────

def parse_review_comments(comments_json: str) -> List[str]:
    if not comments_json:
        return []
    try:
        return json.loads(comments_json)
    except Exception:
        return []


def parse_review_ratings(ratings_json: str) -> List[int]:
    if not ratings_json:
        return []
    try:
        return json.loads(ratings_json)
    except Exception:
        return []


def parse_review_authors(authors_json: str) -> List[str]:       # NEW
    if not authors_json:
        return []
    try:
        return json.loads(authors_json)
    except Exception:
        return []


def parse_review_dates(dates_json: str) -> List[str]:            # NEW
    if not dates_json:
        return []
    try:
        return json.loads(dates_json)
    except Exception:
        return []


def parse_review_has_response(flags_json: str) -> List[bool]:    # NEW
    if not flags_json:
        return []
    try:
        return json.loads(flags_json)
    except Exception:
        return []


# ─────────────────────────────────────────
# HELPER — centralised ORM → response builder
# ─────────────────────────────────────────

def _to_response(p) -> TrackedProductResponse:
    return TrackedProductResponse(
        id=p.id,
        seller_id=p.seller_id,
        asin=p.asin,
        product_title=p.product_title,
        product_photo=p.product_photo,
        country=p.country,
        user_email=p.user_email,
        # product listing fields
        product_price=getattr(p, "product_price", None),
        product_original_price=getattr(p, "product_original_price", None),
        currency=getattr(p, "currency", None),
        product_star_rating=getattr(p, "product_star_rating", None),
        product_star_rating_numeric=getattr(p, "product_star_rating_numeric", None),
        product_num_ratings=getattr(p, "product_num_ratings", None),
        product_url=getattr(p, "product_url", None),
        product_num_offers=getattr(p, "product_num_offers", None),
        product_minimum_offer_price=getattr(p, "product_minimum_offer_price", None),
        is_best_seller=getattr(p, "is_best_seller", False),
        is_amazon_choice=getattr(p, "is_amazon_choice", False),
        is_prime=getattr(p, "is_prime", False),
        climate_pledge_friendly=getattr(p, "climate_pledge_friendly", False),
        sales_volume=getattr(p, "sales_volume", None),
        delivery=getattr(p, "delivery", None),
        has_variations=getattr(p, "has_variations", False),
        unit_price=getattr(p, "unit_price", None),
        unit_count=getattr(p, "unit_count", None),
        # seller profile
        seller_name=getattr(p, "seller_name", None),
        seller_logo=getattr(p, "seller_logo", None),
        seller_link=getattr(p, "seller_link", None),
        store_link=getattr(p, "store_link", None),
        seller_phone=getattr(p, "seller_phone", None),
        business_name=getattr(p, "business_name", None),
        business_address=getattr(p, "business_address", None),
        seller_rating=getattr(p, "seller_rating", None),
        seller_ratings_total=getattr(p, "seller_ratings_total", None),
        # reviews
        review_comments=parse_review_comments(p.review_comments),
        review_ratings=parse_review_ratings(p.review_ratings),
        review_authors=parse_review_authors(getattr(p, "review_authors", None)),
        review_dates=parse_review_dates(getattr(p, "review_dates", None)),
        review_has_response=parse_review_has_response(getattr(p, "review_has_response", None)),
    )

# def _extract_product_fields(item: dict) -> dict:
#     raw_rating = item.get("product_star_rating")
#     try:
#         rating_numeric = float(raw_rating) if raw_rating else None
#     except (ValueError, TypeError):
#         rating_numeric = None

#     # Fix unit_count — ensure it's int or None
#     raw_unit_count = item.get("unit_count")
#     try:
#         unit_count = int(raw_unit_count) if raw_unit_count is not None else None
#     except (ValueError, TypeError):
#         unit_count = None

#     return {
#         "product_price":               item.get("product_price"),
#         "product_original_price":      item.get("product_original_price"),
#         "currency":                    item.get("currency"),
#         "product_star_rating":         raw_rating,
#         "product_star_rating_numeric": rating_numeric,
#         "product_num_ratings":         item.get("product_num_ratings"),
#         "product_url":                 item.get("product_url"),
#         "product_num_offers":          item.get("product_num_offers"),
#         "product_minimum_offer_price": item.get("product_minimum_offer_price"),
#         "is_best_seller":              bool(item.get("is_best_seller", False)),   # explicit bool cast
#         "is_amazon_choice":            bool(item.get("is_amazon_choice", False)),
#         "is_prime":                    bool(item.get("is_prime", False)),
#         "climate_pledge_friendly":     bool(item.get("climate_pledge_friendly", False)),
#         "sales_volume":                item.get("sales_volume"),
#         "delivery":                    item.get("delivery"),
#         "has_variations":              bool(item.get("has_variations", False)),
#         "unit_price":                  item.get("unit_price"),
#         "unit_count":                  unit_count,
#     }
def _extract_product_fields(item: dict) -> dict:
    raw_rating = item.get("product_star_rating")
    try:
        rating_numeric = float(raw_rating) if raw_rating else None
    except (ValueError, TypeError):
        rating_numeric = None

    raw_unit_count = item.get("unit_count")
    try:
        unit_count = int(raw_unit_count) if raw_unit_count is not None else None
    except (ValueError, TypeError):
        unit_count = None

    raw_num_ratings = item.get("product_num_ratings")
    try:
        num_ratings = int(raw_num_ratings) if raw_num_ratings is not None else None
    except (ValueError, TypeError):
        num_ratings = None

    raw_num_offers = item.get("product_num_offers")
    try:
        num_offers = int(raw_num_offers) if raw_num_offers is not None else None
    except (ValueError, TypeError):
        num_offers = None

    def to_bool(val) -> bool:
        if val is None:
            return False
        if isinstance(val, bool):
            return val
        if isinstance(val, int):
            return val != 0
        if isinstance(val, str):
            return val.lower() in ("true", "1", "yes", "t")
        return False

    return {
        "product_price":               item.get("product_price"),
        "product_original_price":      item.get("product_original_price"),
        "currency":                    item.get("currency"),
        "product_star_rating":         raw_rating,
        "product_star_rating_numeric": rating_numeric,
        "product_num_ratings":         num_ratings,
        "product_url":                 item.get("product_url"),
        "product_num_offers":          num_offers,
        "product_minimum_offer_price": item.get("product_minimum_offer_price"),
        "is_best_seller":              to_bool(item.get("is_best_seller")),
        "is_amazon_choice":            to_bool(item.get("is_amazon_choice")),
        "is_prime":                    to_bool(item.get("is_prime")),
        "climate_pledge_friendly":     to_bool(item.get("climate_pledge_friendly")),
        "sales_volume":                item.get("sales_volume"),
        "delivery":                    item.get("delivery"),
        "has_variations":              to_bool(item.get("has_variations")),
        "unit_price":                  item.get("unit_price"),
        "unit_count":                  unit_count,
    }

def _parse_price(price_str: str) -> Optional[float]:
    """Strips currency symbols and converts '$22.81' → 22.81"""
    if not price_str:
        return None
    try:
        return float(price_str.replace("$", "").replace("₹", "").replace(",", "").strip())
    except (ValueError, TypeError):
        return None

        
# ─────────────────────────────────────────
# HELPERS — API fetch functions
# ─────────────────────────────────────────

def fetch_seller_profile(seller_id: str, country: str) -> dict:
    """
    Calls /seller-profile once per seller.
    Returns a flat dict of all profile fields, safe to ** unpack into ORM.
    """
    try:
        resp = requests.get(
            AMAZON_SELLER_PROFILE_URL,
            headers=HEADERS,
            params={"seller_id": seller_id, "country": country},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK":
            return {}
        d = data.get("data", {})
        return {
            "seller_name":          d.get("name"),
            "seller_logo":          d.get("logo"),
            "seller_link":          d.get("seller_link"),
            "store_link":           d.get("store_link"),
            "seller_phone":         d.get("phone"),
            "business_name":        d.get("business_name"),
            "business_address":     d.get("business_address"),
            "seller_rating":        d.get("rating"),
            "seller_ratings_total": d.get("ratings_total"),
        }
    except Exception as e:
        print(f"[seller profile] error for {seller_id}/{country}: {e}")
        return {}


def fetch_seller_reviews(seller_id: str, country: str) -> tuple:
    """
    Returns five parallel lists:
      (comments, ratings, authors, dates, has_response_flags)
    Index N across all five lists belongs to the same review.
    """
    try:
        resp = requests.get(
            AMAZON_REVIEWS_API_URL,
            headers=HEADERS,
            params={"seller_id": seller_id, "country": country, "page": 1},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") != "OK":
            return [], [], [], [], []
        reviews = data.get("data", {}).get("seller_reviews", [])
        comments     = [r.get("review_comment", "")    for r in reviews]
        ratings      = [r.get("review_star_rating", 0) for r in reviews]
        authors      = [r.get("review_author", "")     for r in reviews]   # NEW
        dates        = [r.get("review_date", "")       for r in reviews]   # NEW
        has_response = [r.get("has_response", False)   for r in reviews]   # NEW
        return comments, ratings, authors, dates, has_response
    except Exception as e:
        print(f"[reviews] error for {seller_id}/{country}: {e}")
        return [], [], [], [], []


# ─────────────────────────────────────────
# HELPERS — subscription limit (race-safe)
# ─────────────────────────────────────────

def check_keyword_tracker_limit(user_id: int, db: Session) -> dict:
    row = db.execute(
        text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid"),
        {"uid": user_id},
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    tier, used, tracked_month = row[0] or "free", row[1], row[2]
    current_month = datetime.utcnow().strftime("%Y-%m")

    if tracked_month != current_month:
        db.execute(
            text("UPDATE users SET keyword_tracker_used=0, keyword_tracker_month=:m WHERE id=:uid"),
            {"m": current_month, "uid": user_id},
        )
        db.commit()
        used = 0

    # limit     = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
    # remaining = (limit - used) if limit != -1 else -1
    # return {"count": used, "limit": limit, "remaining": remaining, "subscription_tier": tier}


def atomic_increment_usage(user_id: int, increment: int, db: Session) -> bool:
    row = db.execute(
        text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid FOR UPDATE"),
        {"uid": user_id},
    ).fetchone()
    if not row:
        return False

    tier, used, tracked_month = row[0] or "free", row[1], row[2]
    current_month = datetime.utcnow().strftime("%Y-%m")
    if tracked_month != current_month:
        used = 0

    # limit = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
    # if limit != -1 and (used + increment) > limit:
    #     db.rollback()
    #     return False

    db.execute(
        text("UPDATE users SET keyword_tracker_used=COALESCE(keyword_tracker_used,0)+:inc, keyword_tracker_month=:m WHERE id=:uid"),
        {"inc": increment, "m": current_month, "uid": user_id},
    )
    db.commit()
    return True


# ─────────────────────────────────────────
# HELPERS — rank update rate limiting (4/day)
# ─────────────────────────────────────────

def check_rank_update_ratelimit(user_email: str, db: Session) -> dict:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    row = db.execute(
        text("SELECT call_count FROM rank_update_ratelimit WHERE user_email=:email AND update_date=:today"),
        {"email": user_email, "today": today},
    ).fetchone()
    used = row[0] if row else 0

    resets_at = (datetime.utcnow().replace(hour=0, minute=0, second=0) + timedelta(days=1)).isoformat() + "Z"
    return {
        "allowed":   used < RANK_UPDATE_DAILY_LIMIT,
        "used":      used,
        "limit":     RANK_UPDATE_DAILY_LIMIT,
        "resets_at": resets_at,
    }


def increment_rank_update_count(user_email: str, db: Session):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    db.execute(
        text("""
            INSERT INTO rank_update_ratelimit (user_email, update_date, call_count)
            VALUES (:email, :today, 1)
            ON CONFLICT (user_email, update_date)
            DO UPDATE SET call_count = rank_update_ratelimit.call_count + 1
        """),
        {"email": user_email, "today": today},
    )
    db.commit()


# ─────────────────────────────────────────
# HELPERS — similarity + competitor matching
# ─────────────────────────────────────────

def calculate_similarity_score(title_a: str, title_b: str) -> float:
    words_a = set(title_a.lower().split())
    words_b = set(title_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    return len(words_a & words_b) / len(words_a | words_b)


def find_competitor_matches(seller_product: dict, db: Session, country: str = "IN",
                             similarity_threshold: float = 0.3, max_matches: int = 5) -> List[CompetitorProduct]:
    seller_title = seller_product.get("product_title", "")
    search_terms = [w for w in seller_title.lower().split() if len(w) > 3][:4]
    if not search_terms:
        return []

    search_pattern = "%".join(search_terms)
    rows = db.execute(text("""
        SELECT id,asin,category_id,category_name,product_title,product_url,
               product_photo,product_price,product_price_numeric,product_original_price,
               product_original_price_numeric,product_star_rating,product_star_rating_numeric,
               product_num_ratings,is_best_seller,is_amazon_choice,is_prime,
               sales_volume,country,avg_price,min_price,max_price,
               avg_sales_volume,min_sales_volume,max_sales_volume
        FROM rapidapi_amazon_products
        WHERE country=:country
          AND LOWER(product_title) LIKE :pat
          AND asin != :seller_asin
        ORDER BY
            CASE WHEN is_best_seller THEN 1 WHEN is_amazon_choice THEN 2 ELSE 3 END,
            product_num_ratings DESC,
            product_star_rating_numeric DESC
        LIMIT :lim
    """), {"country": country, "pat": f"%{search_pattern}%",
           "seller_asin": seller_product.get("asin"), "lim": max_matches * 2}).fetchall()

    competitors = []
    for r in rows:
        if calculate_similarity_score(seller_title, r[4]) >= similarity_threshold:
            competitors.append(CompetitorProduct(
                id=r[0], asin=r[1], category_id=r[2], category_name=r[3], product_title=r[4],
                product_url=r[5], product_photo=r[6], product_price=r[7], product_price_numeric=r[8],
                product_original_price=r[9], product_original_price_numeric=r[10],
                product_star_rating=r[11], product_star_rating_numeric=r[12],
                product_num_ratings=r[13], is_best_seller=r[14], is_amazon_choice=r[15],
                is_prime=r[16], sales_volume=r[17], country=r[18],
                avg_price=r[19], min_price=r[20], max_price=r[21],
                avg_sales_volume=r[22], min_sales_volume=r[23], max_sales_volume=r[24],
            ))
    return competitors[:max_matches]


def generate_comparison_metrics(seller_product: dict, competitor: CompetitorProduct) -> dict:
    sp = seller_product.get("product_price_numeric", 0) or 0
    cp = competitor.product_price_numeric or 0
    sr = seller_product.get("product_star_rating_numeric", 0) or 0
    cr = competitor.product_star_rating_numeric or 0
    sn = seller_product.get("product_num_ratings", 0) or 0
    cn = competitor.product_num_ratings or 0

    price_diff  = (sp - cp) if sp and cp else None
    price_pct   = ((sp - cp) / cp * 100) if sp and cp and cp > 0 else None
    rating_diff = (sr - cr) if sr and cr else None
    review_diff = (sn - cn) if sn and cn else None

    advantages, disadvantages = [], []
    if price_diff and price_diff < 0:
        advantages.append(f"Lower price by ₹{abs(price_diff):.2f} ({abs(price_pct):.1f}%)")
    elif price_diff and price_diff > 0:
        disadvantages.append(f"Higher price by ₹{price_diff:.2f} ({price_pct:.1f}%)")
    if rating_diff and rating_diff > 0:
        advantages.append(f"Better rating by {rating_diff:.1f} stars")
    elif rating_diff and rating_diff < 0:
        disadvantages.append(f"Lower rating by {abs(rating_diff):.1f} stars")
    if review_diff and review_diff > 0:
        advantages.append(f"More reviews (+{review_diff})")
    elif review_diff and review_diff < 0:
        disadvantages.append(f"Fewer reviews ({review_diff})")
    if competitor.is_best_seller and not seller_product.get("is_best_seller"):
        disadvantages.append("Competitor is Best Seller")
    elif seller_product.get("is_best_seller") and not competitor.is_best_seller:
        advantages.append("You are Best Seller")
    if competitor.is_amazon_choice and not seller_product.get("is_amazon_choice"):
        disadvantages.append("Competitor is Amazon's Choice")
    elif seller_product.get("is_amazon_choice") and not competitor.is_amazon_choice:
        advantages.append("You are Amazon's Choice")

    return {
        "price_comparison": {
            "seller_price": sp, "competitor_price": cp,
            "difference": price_diff, "difference_percent": price_pct,
            "is_cheaper": price_diff < 0 if price_diff is not None else None,
        },
        "rating_comparison": {
            "seller_rating": sr, "competitor_rating": cr,
            "difference": rating_diff,
            "is_better": rating_diff > 0 if rating_diff is not None else None,
        },
        "review_count_comparison": {
            "seller_reviews": sn, "competitor_reviews": cn,
            "difference": review_diff,
            "has_more": review_diff > 0 if review_diff is not None else None,
        },
        "badges": {
            "seller_best_seller":       seller_product.get("is_best_seller", False),
            "competitor_best_seller":   competitor.is_best_seller or False,
            "seller_amazon_choice":     seller_product.get("is_amazon_choice", False),
            "competitor_amazon_choice": competitor.is_amazon_choice or False,
            "seller_prime":             seller_product.get("is_prime", False),
            "competitor_prime":         competitor.is_prime or False,
        },
        "competitive_advantages":    advantages,
        "competitive_disadvantages": disadvantages,
        "similarity_score": calculate_similarity_score(
            seller_product.get("product_title", ""),
            competitor.product_title,
        ),
    }


# ─────────────────────────────────────────
# HELPERS — rank velocity
# ─────────────────────────────────────────

def compute_velocity(ranks: list) -> float:
    if len(ranks) < 2:
        return 0.0
    deltas, weights = [], []
    for i in range(len(ranks) - 1):
        prev = ranks[i + 1].get("rank", 0) or 0
        curr = ranks[i].get("rank", 0) or 0
        if prev and curr:
            days = max((datetime.fromisoformat(ranks[i]["checked_at"]) -
                        datetime.fromisoformat(ranks[i + 1]["checked_at"])).days, 1)
            deltas.append((prev - curr) / days)
            weights.append(1 / (i + 1))
    if not deltas:
        return 0.0
    total_w = sum(weights)
    return round(sum(d * w for d, w in zip(deltas, weights)) / total_w, 3)


# ─────────────────────────────────────────
# HELPERS — rank prediction (linear regression)
# ─────────────────────────────────────────

def predict_rank(rank_history: list) -> dict:
    if len(rank_history) < 3:
        return {"predicted_7d": None, "predicted_30d": None, "confidence": "low",
                "trend": "not_enough_data"}

    points  = sorted(rank_history, key=lambda x: x["checked_at"])[-30:]
    base_ts = datetime.fromisoformat(points[0]["checked_at"]).timestamp()
    X = np.array([(datetime.fromisoformat(p["checked_at"]).timestamp() - base_ts) / 86400
                  for p in points])
    Y = np.array([p["rank"] for p in points if p["rank"]])

    if len(Y) < 3:
        return {"predicted_7d": None, "predicted_30d": None, "confidence": "low", "trend": "sparse"}

    coeffs   = np.polyfit(X, Y, 1)
    poly     = np.poly1d(coeffs)
    last_day = X[-1]
    pred_7   = max(1, round(float(poly(last_day + 7))))
    pred_30  = max(1, round(float(poly(last_day + 30))))

    residuals = Y - poly(X)
    std_err   = float(np.std(residuals))
    r2        = float(1 - np.var(residuals) / (np.var(Y) + 1e-9))

    confidence = "high" if r2 > 0.75 else "medium" if r2 > 0.4 else "low"
    trend      = "improving" if coeffs[0] < -0.3 else "declining" if coeffs[0] > 0.3 else "stable"

    return {
        "predicted_7d":  pred_7,
        "predicted_30d": pred_30,
        "confidence":    confidence,
        "trend":         trend,
        "r2_score":      round(r2, 3),
        "std_error":     round(std_err, 2),
        "margin_7d":     round(std_err * 1.5),
        "margin_30d":    round(std_err * 2.5),
    }


# ─────────────────────────────────────────
# HELPERS — Ollama (llama3.2:3b)
# ─────────────────────────────────────────

def _call_ollama(prompt: str, timeout: int = 90) -> str:
    resp = requests.post(
        f"{OLLAMA_BASE}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json().get("response", "").strip()


def _call_ollama_json(prompt: str, timeout: int = 90) -> dict:
    resp = requests.post(
        f"{OLLAMA_BASE}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
        timeout=timeout,
    )
    resp.raise_for_status()
    raw = resp.json().get("response", "{}").strip()
    raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


SYSTEM_PERSONA = """You are Insydz, an elite Amazon marketplace strategist with 12 years of hands-on seller experience.
You speak like a real expert friend — direct, warm, specific, never robotic.
You use conversational language, occasional em-dashes, and short punchy sentences when making a point.
You never say "certainly", "absolutely", "great question", or use hollow filler phrases.
You back every claim with the actual data you've been given.
When something is bad, you say so clearly. When something is good, you celebrate it.
Your job is to help sellers actually win on Amazon — not to sound like an AI."""


def ai_keyword_analysis(product_title: str, asin: str, country: str, rank_summary: list) -> dict:
    trend_lines = "\n".join(
        f"  • '{r['keyword']}': rank {r['current_rank']} "
        f"({'↑ improved by ' + str(r['change']) if r['change'] > 0 else '↓ dropped by ' + str(abs(r['change'])) if r['change'] < 0 else '→ stable'}, "
        f"velocity trend: {r.get('trend','unknown')})"
        for r in rank_summary
    )

    prompt = f"""{SYSTEM_PERSONA}

You're analyzing this Amazon product:
  Product: {product_title}
  ASIN: {asin}
  Marketplace: {country}

Here's the live keyword ranking data:
{trend_lines}

Write a sharp, specific analysis. Respond ONLY in this exact JSON structure (no markdown, no preamble):
{{
  "opening": "A 2-3 sentence honest opener that names specific keywords and calls out what's actually happening — not generic praise.",
  "why_changed": "Explain WHY these specific ranks changed. Reference actual keywords, not vague market forces. Be a detective.",
  "immediate_actions": ["3-4 specific, implementable actions the seller can do this week. No fluff like 'optimize your listing'. Name the exact keyword, exact section, exact change."],
  "keyword_focus": "Which 1-2 keywords are the biggest opportunity right now and exactly why — based on the data above.",
  "prediction": "What will likely happen in the next 30 days if they do nothing. Be honest, not scary.",
  "roadmap": {{
    "week_1_2": "Specific actions, named keywords, exact listing sections to change.",
    "week_3_4": "What to do after the first changes take hold — what to monitor, what to test.",
    "month_2_3": "The bigger play — where this product can realistically be in 60-90 days if they execute."
  }},
  "closing_thought": "One honest, direct closing sentence — like what you'd tell a friend who asked you for real advice."
}}"""

    result = _call_ollama_json(prompt, timeout=120)
    if not result:
        result = {
            "opening": f"Looking at the keyword data for '{product_title}', there are clear patterns here worth acting on.",
            "why_changed": "Rank fluctuations are likely tied to competitor activity and listing freshness.",
            "immediate_actions": ["Review your top keyword's placement in the product title.", "Add backend search terms you're missing.", "Check if any competitor changed their price recently."],
            "keyword_focus": "Focus on the keyword with the most recent positive momentum.",
            "prediction": "Without changes, rankings will likely drift further as competitors iterate faster.",
            "roadmap": {"week_1_2": "Audit title and bullets.", "week_3_4": "Test a revised main image.", "month_2_3": "Launch a targeted PPC campaign on your best-performing keyword."},
            "closing_thought": "The data's telling you something — the question is whether you'll act on it this week or next month.",
        }
    return result


def ai_competitor_recommendation(seller_product: dict, comparisons: list) -> dict:
    comp_lines = []
    for c in comparisons[:5]:
        m       = c.get("comparison_metrics", {})
        price_c  = m.get("price_comparison", {})
        rating_c = m.get("rating_comparison", {})
        comp_lines.append(
            f"  Competitor '{c['competitor_product'].get('product_title','?')[:60]}': "
            f"price={price_c.get('competitor_price','?')}, rating={rating_c.get('competitor_rating','?')}, "
            f"best_seller={c['competitor_product'].get('is_best_seller',False)}, "
            f"amazon_choice={c['competitor_product'].get('is_amazon_choice',False)}"
        )
    comp_text = "\n".join(comp_lines) if comp_lines else "  No competitors found."

    prompt = f"""{SYSTEM_PERSONA}

Seller's product:
  Title: {seller_product.get('product_title','?')}
  ASIN: {seller_product.get('asin','?')}
  Price: {seller_product.get('product_price_numeric','unknown')}
  Rating: {seller_product.get('product_star_rating_numeric','unknown')}
  Reviews: {seller_product.get('product_num_ratings','unknown')}
  Best Seller: {seller_product.get('is_best_seller',False)}
  Amazon Choice: {seller_product.get('is_amazon_choice',False)}

Top competitors in the same category:
{comp_text}

You're sitting across the table from this seller. Give them your real take.
Respond ONLY in this exact JSON structure:
{{
  "headline": "One punchy sentence that captures the seller's competitive position right now.",
  "where_you_stand": "2-3 sentences: honest assessment of their position vs the competition. Use the actual numbers.",
  "biggest_threat": "Which competitor is the real threat and why — specific, not generic.",
  "biggest_opportunity": "The one thing the data is screaming at you that the seller should exploit right now.",
  "price_strategy": "Specific price advice — should they cut, hold, or go premium? Why? What number?",
  "listing_fixes": ["2-3 specific listing changes based on what competitors are doing better"],
  "win_conditions": "What would it realistically take for this seller to outperform the top competitor in 90 days?",
  "action_this_week": "The single most impactful thing they can do in the next 7 days. One thing only."
}}"""

    result = _call_ollama_json(prompt, timeout=120)
    if not result:
        result = {
            "headline": "Your product has potential but is being outmaneuvered on key signals.",
            "where_you_stand": "The competition is running tighter on price and credibility signals like reviews.",
            "biggest_threat": "The best-seller badge holder in your category — they have pricing and social proof locked in.",
            "biggest_opportunity": "Your rating, if higher, is an untapped trust signal you should be leading with.",
            "price_strategy": "Hold your price but build value perception through images and A+ content first.",
            "listing_fixes": ["Update your main image to show product in use.", "Add a comparison table in A+ content.", "Include size/quantity callouts in bullet 1."],
            "win_conditions": "500+ reviews, a sub-10 keyword rank on your top term, and a PPC ACoS below 25%.",
            "action_this_week": "Rewrite your title to front-load your top keyword — this week, not next.",
        }
    return result


def ai_review_sentiment(comments: List[str], product_title: str) -> dict:
    if not comments:
        return {"error": "No reviews to analyze", "topics": {}}

    sample       = comments[:30]
    reviews_text = "\n".join(f"  - {c}" for c in sample if c.strip())

    prompt = f"""{SYSTEM_PERSONA}

Product: {product_title}

Customer reviews (sample of {len(sample)}):
{reviews_text}

Read these like a real person would. What are customers actually saying?
Respond ONLY in this JSON structure:
{{
  "overall_mood": "One honest sentence on the vibe of these reviews.",
  "score": <number 1-10 representing overall sentiment>,
  "topics": {{
    "quality":   {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "What customers specifically say about quality"}},
    "packaging": {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "What customers say about packaging"}},
    "value":     {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Price vs value perception"}},
    "shipping":  {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Delivery and fulfillment feedback"}},
    "support":   {{"sentiment": "positive|neutral|negative", "score": <1-10>, "summary": "Customer service mentions if any"}}
  }},
  "top_complaint": "The most repeated complaint, verbatim-style",
  "top_praise":    "The most repeated compliment, verbatim-style",
  "seller_action": "One specific change the seller could make based on these reviews that would directly address the biggest complaint."
}}"""

    result = _call_ollama_json(prompt, timeout=90)
    if not result:
        result = {
            "overall_mood": "Mixed reviews with room for improvement.",
            "score": 6,
            "topics": {
                "quality":   {"sentiment": "neutral", "score": 6, "summary": "Customers find quality acceptable."},
                "packaging": {"sentiment": "neutral", "score": 6, "summary": "Packaging mentioned occasionally."},
                "value":     {"sentiment": "neutral", "score": 6, "summary": "Price perceived as fair."},
                "shipping":  {"sentiment": "neutral", "score": 6, "summary": "Delivery timing varies."},
                "support":   {"sentiment": "neutral", "score": 6, "summary": "Limited support mentions."},
            },
            "top_complaint": "Product description doesn't fully match the item received.",
            "top_praise":    "Fast delivery and good packaging.",
            "seller_action": "Align your listing description more closely with the actual product.",
        }
    return result


def ai_keyword_suggestions(product_title: str, asin: str, country: str) -> dict:
    prompt = f"""{SYSTEM_PERSONA}

Product title: "{product_title}"
ASIN: {asin}
Marketplace: Amazon {country}

Generate 15-20 high-intent Amazon search keywords a seller should track for this product.
Think like a buyer — what would someone type when they're ready to buy?
Group them by intent. Respond ONLY in this JSON:
{{
  "branded": ["keywords that include brand or product-specific terms"],
  "generic": ["broad category keywords buyers use"],
  "long_tail": ["specific 3-5 word phrases with clear purchase intent"],
  "problem_solving": ["keywords buyers use when searching by the problem the product solves"],
  "competitor_adjacent": ["terms buyers use when comparing similar products"],
  "reasoning": "One sentence on your keyword strategy for this specific product."
}}"""

    result = _call_ollama_json(prompt, timeout=90)
    if not result or "generic" not in result:
        result = {
            "branded": [],
            "generic": [product_title.split()[0] if product_title else "product"],
            "long_tail": [],
            "problem_solving": [],
            "competitor_adjacent": [],
            "reasoning": "Keyword suggestions could not be generated — please try again.",
        }
    return result


# ─────────────────────────────────────────
# HELPERS — Brevo email
# ─────────────────────────────────────────

def send_brevo_email(to_email: str, subject: str, html_body: str) -> bool:
    if not BREVO_API_KEY:
        print("[brevo] BREVO_API_KEY not set — email not sent")
        return False

    payload = {
        "sender": {"name": BREVO_SENDER_NAME, "email": BREVO_SENDER_EMAIL},
        "to":      [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_body,
    }

    try:
        resp = requests.post(
            BREVO_API_URL,
            headers={"accept": "application/json", "content-type": "application/json",
                     "api-key": BREVO_API_KEY},
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        print(f"[brevo] email sent to {to_email} — subject: {subject}")
        return True
    except Exception as e:
        print(f"[brevo] failed to send to {to_email}: {e}")
        return False


def _price_alert_email_html(product_title: str, asin: str,
                             threshold_percent: float, triggered: list) -> str:
    rows = ""
    for item in triggered:
        rows += f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">
            {item['competitor_title'][:70]}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;text-align:center;">
            {item['competitor_asin']}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:600;color:#d94f3d;text-align:center;">
            ₹{item['competitor_price']}
          </td>
        </tr>"""

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a1a2e;padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Insydz</p>
            <p style="margin:4px 0 0;font-size:13px;color:#9090b0;">Competitor Price Alert</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;">Price alert triggered for your product</p>
            <p style="margin:0 0 24px;font-size:14px;color:#555;"><strong>{product_title}</strong> &nbsp;·&nbsp; ASIN: {asin}</p>
            <p style="margin:0 0 12px;font-size:14px;color:#555;">
              The following competitors are priced more than
              <strong style="color:#d94f3d;">{threshold_percent}%</strong> below your listed price:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
              <tr style="background:#f8f8f8;">
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:left;border-bottom:1px solid #f0f0f0;">COMPETITOR</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:center;border-bottom:1px solid #f0f0f0;">ASIN</th>
                <th style="padding:10px 12px;font-size:12px;font-weight:600;color:#888;text-align:center;border-bottom:1px solid #f0f0f0;">THEIR PRICE</th>
              </tr>
              {rows}
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
              Log in to <a href="https://insydz.com" style="color:#1a1a2e;font-weight:600;">insydz.com</a>
              to review your pricing strategy and take action.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f8f8f8;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              You're receiving this because you set up a price alert on Insydz.
              &nbsp;·&nbsp; <a href="https://insydz.com" style="color:#aaa;">Manage alerts</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def fire_price_alert(product_title: str, asin: str, threshold_percent: float,
                     triggered: list, delivery_email: str):
    if not triggered:
        return
    subject   = f"[Insydz] Price alert — {len(triggered)} competitor(s) underpricing you"
    html_body = _price_alert_email_html(product_title, asin, threshold_percent, triggered)
    sent      = send_brevo_email(delivery_email, subject, html_body)
    if not sent:
        print(f"[price alert] email delivery failed for {delivery_email} — product {asin}")


def fire_competitor_change_alert(seller_email: str, seller_id: str, changes: list):
    if not changes:
        return

    rows = ""
    for c in changes[:10]:
        change_lines = "".join(
            f"<li style='font-size:13px;color:#555;margin-bottom:4px;'>"
            f"<strong>{ch['field'].replace('_',' ').title()}</strong>: "
            f"{ch['old_value']} → <strong>{ch['new_value']}</strong></li>"
            for ch in c.get("changes", [])
        )
        rows += f"""
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">{c.get('competitor_title','Unknown')[:65]}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#aaa;">ASIN: {c.get('competitor_asin','?')}</p>
            <ul style="margin:0;padding-left:16px;">{change_lines}</ul>
          </td>
        </tr>"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a1a2e;padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Insydz</p>
            <p style="margin:4px 0 0;font-size:13px;color:#9090b0;">Daily Competitor Change Report</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#1a1a1a;">Here's what changed with your competitors in the last 24 hours:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
              {rows}
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
              Log in to <a href="https://insydz.com" style="color:#1a1a2e;font-weight:600;">insydz.com</a> to take action on these changes.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f8f8f8;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
              Insydz daily digest &nbsp;·&nbsp;
              <a href="https://insydz.com" style="color:#aaa;">Manage notifications</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    subject = f"[Insydz] {len(changes)} competitor change(s) detected today"
    send_brevo_email(seller_email, subject, html_body)


# ─────────────────────────────────────────
# PDF EXPORT HELPER
# ─────────────────────────────────────────

def generate_pdf_report(product: TrackedProductResponse, rank_history: list,
                         ai_analysis: dict, prediction: dict) -> BytesIO:
    buf    = BytesIO()
    doc    = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                                topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story  = []

    title_style = ParagraphStyle("title", parent=styles["Title"],   fontSize=18, spaceAfter=12)
    h2_style    = ParagraphStyle("h2",    parent=styles["Heading2"], fontSize=13, spaceAfter=6)
    body_style  = ParagraphStyle("body",  parent=styles["Normal"],   fontSize=10, leading=14)

    story.append(Paragraph("Keyword Rank Report", title_style))
    story.append(Paragraph(f"{product.product_title}", h2_style))
    story.append(Paragraph(
        f"ASIN: {product.asin} | Country: {product.country} | "
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        body_style,
    ))

    # Seller profile section (NEW)
    if product.seller_name or product.business_name:
        story.append(Spacer(1, 0.3*cm))
        story.append(Paragraph("Seller Information", h2_style))
        if product.seller_name:
            story.append(Paragraph(f"<b>Seller:</b> {product.seller_name}", body_style))
        if product.business_name:
            story.append(Paragraph(f"<b>Business:</b> {product.business_name}", body_style))
        if product.business_address:
            story.append(Paragraph(f"<b>Address:</b> {product.business_address}", body_style))
        if product.seller_rating:
            story.append(Paragraph(
                f"<b>Seller Rating:</b> {product.seller_rating} "
                f"({product.seller_ratings_total or 0} ratings)",
                body_style,
            ))

    story.append(Spacer(1, 0.4*cm))

    # Rank history table
    story.append(Paragraph("Keyword Rank History", h2_style))
    table_data = [["Keyword", "Rank", "Velocity", "Last Checked"]]
    for entry in rank_history[:20]:
        table_data.append([
            entry.get("keyword", ""),
            str(entry.get("rank", "-")),
            str(entry.get("velocity", "0")),
            entry.get("checked_at", "")[:16],
        ])
    t = Table(table_data, colWidths=[6*cm, 2.5*cm, 2.5*cm, 5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0),  colors.HexColor("#2563EB")),
        ("TEXTCOLOR",     (0, 0), (-1, 0),  colors.white),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
        ("GRID",          (0, 0), (-1, -1), 0.3, colors.HexColor("#E5E7EB")),
        ("PADDING",       (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4*cm))

    # Prediction
    if prediction.get("predicted_7d"):
        story.append(Paragraph("Rank Prediction", h2_style))
        story.append(Paragraph(
            f"7-day forecast: <b>#{prediction['predicted_7d']}</b> (±{prediction.get('margin_7d',0)}) | "
            f"30-day forecast: <b>#{prediction['predicted_30d']}</b> (±{prediction.get('margin_30d',0)}) | "
            f"Confidence: {prediction.get('confidence','low')} | Trend: {prediction.get('trend','unknown')}",
            body_style,
        ))
        story.append(Spacer(1, 0.4*cm))

    # AI Analysis
    if ai_analysis:
        story.append(Paragraph("AI Strategic Analysis", h2_style))
        for key, label in [
            ("opening", "Overview"), ("why_changed", "Why Rankings Changed"),
            ("keyword_focus", "Focus Keywords"), ("prediction", "30-Day Outlook"),
        ]:
            if ai_analysis.get(key):
                story.append(Paragraph(f"<b>{label}:</b> {ai_analysis[key]}", body_style))
                story.append(Spacer(1, 0.2*cm))

        roadmap = ai_analysis.get("roadmap", {})
        if roadmap:
            story.append(Paragraph("Roadmap", h2_style))
            for phase, content in roadmap.items():
                story.append(Paragraph(f"<b>{phase.replace('_', ' ').title()}:</b> {content}", body_style))
                story.append(Spacer(1, 0.15*cm))

    doc.build(story)
    buf.seek(0)
    return buf


# ─────────────────────────────────────────

def _background_abandoned_signup_reminders():
    """Check for abandoned signups and send 6h, 24h, 72h reminders"""
    try:
        keys = r.keys(f"{ABANDONED_SIGNUP_PREFIX}*")
        now = datetime.now(timezone.utc)
        for key_bytes in keys:
            key = key_bytes.decode('utf-8') if isinstance(key_bytes, bytes) else key_bytes
            email = key.replace(ABANDONED_SIGNUP_PREFIX, "")
            data_str = r.get(key)
            if not data_str:
                continue
                
            data = json.loads(data_str)
            created_at_str = data.get("created_at")
            if not created_at_str:
                continue
                
            try:
                created_at = datetime.fromisoformat(created_at_str)
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
                
            hours_passed = (now - created_at).total_seconds() / 3600.0
            reminders_sent = data.get("reminders_sent", [])
            
            should_update = False
            verify_link = f"https://insydz.com/signup?resume={email}"
            
            if hours_passed >= 72 and "72h" not in reminders_sent:
                print(f"📧 Sending 72h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("72h")
                should_update = True
            elif hours_passed >= 24 and hours_passed < 72 and "24h" not in reminders_sent:
                print(f"📧 Sending 24h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("24h")
                should_update = True
            elif hours_passed >= 6 and hours_passed < 24 and "6h" not in reminders_sent:
                print(f"📧 Sending 6h abandoned signup reminder to {email}")
                send_unverified_reminder_email(email, verify_link)
                reminders_sent.append("6h")
                should_update = True
                
            if should_update:
                data["reminders_sent"] = reminders_sent
                ttl = r.ttl(key)
                if ttl > 0:
                    r.setex(key, ttl, json.dumps(data))
    except Exception as e:
        print(f"❌ Error in _background_abandoned_signup_reminders: {e}")

# APSCHEDULER — background auto-rank updates
# ─────────────────────────────────────────

def _background_rank_update_all():
    """Runs daily at 6 AM UTC. Updates ranks for all active tracked products."""
    db = SessionLocal()
    try:
        products = db.query(TrackedProduct).all()
        updated  = 0
        for product in products:
            kws = db.query(KeywordRankHistory).filter(
                KeywordRankHistory.tracked_product_id == product.id
            ).all()
            for kw in kws:
                try:
                    resp = requests.get(
                        AMAZON_SEARCH_API_URL,
                        headers=HEADERS,
                        params={"query": kw.keyword, "country": product.country,
                                "page": "1", "sort_by": "RELEVANCE"},
                        timeout=20,
                    )
                    resp.raise_for_status()
                    results = resp.json().get("data", {}).get("products", [])
                    rank = next((i + 1 for i, p in enumerate(results) if p.get("asin") == product.asin), 0)
                    kw.rank       = rank
                    kw.checked_at = datetime.utcnow()
                    updated += 1
                except Exception as e:
                    print(f"[scheduler] rank update error for {product.asin}/{kw.keyword}: {e}")
        db.commit()
        print(f"[scheduler] auto rank update complete — {updated} keywords updated")
    except Exception as e:
        print(f"[scheduler] fatal error: {e}")
    finally:
        db.close()


def _background_snapshot_competitors():
    """
    Runs daily at 7 AM UTC.
    1. Snapshots today's competitor data for every tracked product.
    2. Diffs against yesterday's snapshot.
    3. Emails each seller a change digest via Brevo if anything changed.
    """
    db = SessionLocal()
    try:
        today     = datetime.utcnow().strftime("%Y-%m-%d")
        yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

        sellers = db.execute(
            text("SELECT DISTINCT seller_id, user_email, country FROM tracked_products")
        ).fetchall()

        for seller_id, user_email, country in sellers:
            products = db.query(TrackedProduct).filter(
                TrackedProduct.seller_id  == seller_id,
                TrackedProduct.user_email == user_email,
            ).all()

            all_changes_for_seller = []

            for product in products:
                seller_dict = {
                    "asin": product.asin, "product_title": product.product_title,
                    "product_price_numeric": None, "product_star_rating_numeric": None,
                    "product_num_ratings": None,
                }
                competitors = find_competitor_matches(seller_dict, db, country=country, max_matches=5)
                snapshot    = [c.model_dump() for c in competitors]

                db.execute(text("""
                    INSERT INTO competitor_snapshots (seller_id, user_email, asin, snapshot_date, snapshot_data)
                    VALUES (:sid, :email, :asin, :date, :data)
                    ON CONFLICT (asin, snapshot_date, user_email) DO UPDATE SET snapshot_data=:data
                """), {"sid": seller_id, "email": user_email, "asin": product.asin,
                       "date": today, "data": json.dumps(snapshot)})

                yesterday_row = db.execute(text("""
                    SELECT snapshot_data FROM competitor_snapshots
                    WHERE asin=:asin AND user_email=:email AND snapshot_date=:yesterday
                """), {"asin": product.asin, "email": user_email, "yesterday": yesterday}).fetchone()

                if not yesterday_row:
                    continue

                yesterday_data = json.loads(yesterday_row[0]) if isinstance(yesterday_row[0], str) else (yesterday_row[0] or [])
                yesterday_map  = {c["asin"]: c for c in yesterday_data}
                today_map      = {c["asin"]: c for c in snapshot}

                watch_fields = [
                    "product_price_numeric", "product_star_rating_numeric",
                    "product_num_ratings", "is_best_seller", "is_amazon_choice",
                ]

                for comp_asin, today_comp in today_map.items():
                    yesterday_comp = yesterday_map.get(comp_asin)
                    if not yesterday_comp:
                        continue
                    diffs = []
                    for field in watch_fields:
                        old_val = yesterday_comp.get(field)
                        new_val = today_comp.get(field)
                        if old_val != new_val and old_val is not None and new_val is not None:
                            diffs.append({"field": field, "old_value": old_val, "new_value": new_val})
                    if diffs:
                        all_changes_for_seller.append({
                            "seller_asin":      product.asin,
                            "competitor_asin":  comp_asin,
                            "competitor_title": today_comp.get("product_title", "Unknown"),
                            "changes":          diffs,
                        })

            db.commit()

            if all_changes_for_seller:
                fire_competitor_change_alert(
                    seller_email=user_email,
                    seller_id=seller_id,
                    changes=all_changes_for_seller,
                )

        print(f"[scheduler] competitor snapshot complete — {today}")
    except Exception as e:
        print(f"[scheduler] snapshot error: {e}")
    finally:
        db.close()


scheduler = BackgroundScheduler(timezone="UTC")
scheduler.add_job(_background_rank_update_all,      CronTrigger(hour=6, minute=0), id="daily_rank_update")
scheduler.add_job(_background_snapshot_competitors, CronTrigger(hour=7, minute=0), id="daily_snapshots")
scheduler.add_job(_background_abandoned_signup_reminders, CronTrigger(minute=0), id="abandoned_signup_reminders")


# ─────────────────────────────────────────
# DPDP DATA RETENTION — nightly cleanup
# ─────────────────────────────────────────

def _background_data_retention():
    """
    DPDP Data Retention Policy — runs nightly at 02:00 UTC.

    1. Hard-purge users_auth rows where deleted_at is older than 30 days.
       (Cascades automatically to user_profiles, user_business_info,
       user_subscriptions, user_app_state, user_consents via FK ON DELETE CASCADE.)

    2. Anonymize audit_log entries older than 90 days — strip resource_id
       to remove any user-identifiable reference while keeping the action
       type and timestamp for compliance.
    """
    from datetime import datetime, timezone, timedelta
    from sqlalchemy import text as _text

    db = SessionLocal()
    try:
        cutoff_hard_delete = datetime.now(timezone.utc) - timedelta(days=30)
        cutoff_anonymize   = datetime.now(timezone.utc) - timedelta(days=90)

        # ── 1. Hard-purge soft-deleted users (30-day grace period expired) ────
        result = db.execute(_text("""
            DELETE FROM users_auth
            WHERE deleted_at IS NOT NULL
              AND deleted_at < :cutoff
        """), {"cutoff": cutoff_hard_delete})
        purged = result.rowcount
        db.commit()

        # ── 2. Anonymize old audit log entries (90 days) ──────────────────────
        db.execute(_text("""
            UPDATE audit_logs
            SET resource_id = '[anonymized]'
            WHERE created_at < :cutoff
              AND resource_id IS NOT NULL
              AND resource_id != '[anonymized]'
        """), {"cutoff": cutoff_anonymize})
        db.commit()

        print(f"[retention] ✅ Hard-purged {purged} expired user(s). Audit logs anonymized.")
    except Exception as e:
        db.rollback()
        print(f"[retention] ❌ Error during retention cleanup: {e}")
    finally:
        db.close()


scheduler.add_job(
    _background_data_retention,
    CronTrigger(hour=2, minute=0),   # 02:00 UTC daily
    id="dpdp_data_retention"
)

scheduler.start()



# ═══════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════

@router.get("/users/{user_id}/keyword-tracker-usage", response_model=UsageLimitsResponse)
def get_keyword_tracker_usage(user_id: int, db: Session = Depends(get_db)):
    """Current keyword tracker usage and limits for a user."""
    service = SellerInboundService()
    return UsageLimitsResponse(**service.check_keyword_tracker_limit(user_id, db))


# ─────────────────────────────────────────
# FETCH + STORE (main entry point)
# Now calls all 3 APIs: seller-products, seller-profile, seller-reviews
# ─────────────────────────────────────────

@router.get("/keyword_tracker/fetch_and_store_products/{seller_id}", response_model=List[TrackedProductResponse])
def fetch_and_store_seller_products(
    seller_id:  str,
    country:    str = "IN",
    page:       int = 1,
    user_email: str = None,
    user_id:    int = None,
    db: Session = Depends(get_db),
):
    """
    Fetch products from Amazon API + reviews.
    Uses unified SellerInboundService for data migration.
    """
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    print(f"[fetch] user_id={user_id}, user_email={user_email}, seller_id={seller_id}")

    service = SellerInboundService()
    try:
        
        # ── 1. Seller products ──
        resp = requests.get(
            AMAZON_API_URL, headers=HEADERS,
            params={"seller_id": seller_id, "country": country,
                    "page": page, "sort_by": "RELEVANCE"},
            timeout=20,
        )
        resp.raise_for_status()
        seller_products = resp.json().get("data", {}).get("seller_products", [])
        if not seller_products:
            return []


        # ── 2. Subscription limit check (only for new ASINs) ──
        new_asins = [
            item["asin"] for item in seller_products
            if not db.query(TrackedProduct).filter(
                TrackedProduct.seller_id  == seller_id,
                TrackedProduct.asin       == item["asin"],
                TrackedProduct.user_email == user_email,
            ).first()
        ]
        if user_id and new_asins:
            ok = atomic_increment_usage(user_id, len(new_asins), db)
            if not ok:
                usage = check_keyword_tracker_limit(user_id, db)
                raise HTTPException(
                    status_code=403,
                    detail=(
                        f"Keyword Tracker limit reached for {usage['subscription_tier'].upper()} plan. "
                        f"You've used all {usage['limit']} product trackings this month. Upgrade for more!"
                    ),
                )

        # ── 3. Seller profile (one call for the whole seller) ──
        profile = fetch_seller_profile(seller_id, country)

        # ── 4. Reviews ──
        comments, ratings, authors, dates, has_response = fetch_seller_reviews(seller_id, country)
        comments_json     = json.dumps(comments)     if comments     else None
        ratings_json      = json.dumps(ratings)      if ratings      else None
        authors_json      = json.dumps(authors)      if authors      else None
        dates_json        = json.dumps(dates)        if dates        else None
        has_response_json = json.dumps(has_response) if has_response else None

        # ── 5. Upsert each product ──
        # saved_products = []
        # for item in seller_products:
        #     product_fields = _extract_product_fields(item)   # all the new fields

        #     existing = db.query(TrackedProduct).filter(
        #         TrackedProduct.seller_id  == seller_id,
        #         TrackedProduct.asin       == item["asin"],
        #         TrackedProduct.user_email == user_email,
        #     ).first()

        #     if existing:
        #         # Refresh every field — prices and badges change frequently
        #         existing.product_title       = item["product_title"]
        #         existing.product_photo       = item.get("product_photo", "")
        #         existing.review_comments     = comments_json
        #         existing.review_ratings      = ratings_json
        #         existing.review_authors      = authors_json
        #         existing.review_dates        = dates_json
        #         existing.review_has_response = has_response_json
        #         for field, value in {**product_fields, **profile}.items():
        #             if value is not None:  # keeps False, 0, empty string — only skips None
        #                 setattr(existing, field, value)
        #         db.commit()
        #         db.refresh(existing)
        #         saved_products.append(existing)
        #     else:
        #         new_product = TrackedProduct(
        #             seller_id=seller_id,
        #             asin=item["asin"],
        #             product_title=item["product_title"],
        #             product_photo=item.get("product_photo", ""),
        #             country=country,
        #             user_email=user_email,
        #             review_comments=comments_json,
        #             review_ratings=ratings_json,
        #             review_authors=authors_json,
        #             review_dates=dates_json,
        #             review_has_response=has_response_json,
        #             **product_fields,   # all listing fields
        #             **profile,          # all seller profile fields
        #         )
        #         db.add(new_product)
        #         db.commit()
        #         db.refresh(new_product)
        #         saved_products.append(new_product)

        # return [_to_response(p) for p in saved_products]
        saved_products = []
        for item in seller_products:
            product_fields = _extract_product_fields(item)

            # ── DEBUG (remove after confirming fix) ──
            print(f"\n=== {item.get('asin')} ===")
            print(f"  is_best_seller={repr(item.get('is_best_seller'))} → {product_fields['is_best_seller']}")
            print(f"  is_prime={repr(item.get('is_prime'))} → {product_fields['is_prime']}")
            print(f"  unit_price={repr(item.get('unit_price'))}, unit_count={repr(item.get('unit_count'))}")

            existing = db.query(TrackedProduct).filter(
                TrackedProduct.seller_id  == seller_id,
                TrackedProduct.asin       == item["asin"],
                TrackedProduct.user_email == user_email,
            ).first()

            BOOLEAN_FIELDS = {
                "is_best_seller", "is_amazon_choice", "is_prime",
                "climate_pledge_friendly", "has_variations"
            }

            if existing:
                existing.product_title       = item["product_title"]
                existing.product_photo       = item.get("product_photo", "")
                existing.review_comments     = comments_json
                existing.review_ratings      = ratings_json
                existing.review_authors      = authors_json
                existing.review_dates        = dates_json
                existing.review_has_response = has_response_json
                for field, value in {**product_fields, **profile}.items():
                    if field in BOOLEAN_FIELDS:
                        setattr(existing, field, value)  # always write booleans, even False
                    elif value is not None:
                        setattr(existing, field, value)
                db.commit()
                db.refresh(existing)
                saved_products.append(existing)
            else:
                new_product = TrackedProduct(
                    # id=user_id,
                    # page=page,
                    seller_id=seller_id,
                    asin=item["asin"],
                    product_title=item["product_title"],
                    product_photo=item.get("product_photo", ""),
                    country=country,
                    user_email=user_email,
                    review_comments=comments_json,
                    review_ratings=ratings_json,
                    review_authors=authors_json,
                    review_dates=dates_json,
                    review_has_response=has_response_json,
                    **product_fields,
                    **profile,
                )
                db.add(new_product)
                db.commit()
                db.refresh(new_product)
                saved_products.append(new_product)

        return [_to_response(p) for p in saved_products]

    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"RapidAPI request failed: {e}")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/keyword_tracker/track_keywords")
def track_keywords(req: KeywordTrackRequest, db: Session = Depends(get_db)):
    if not req.user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    product = db.query(TrackedProduct).filter(
        TrackedProduct.id         == req.tracked_product_id,
        TrackedProduct.user_email == req.user_email,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Tracked product not found or doesn't belong to this user")

    added = 0
    for kw in req.keywords:
        existing = db.query(KeywordRankHistory).filter(
            KeywordRankHistory.tracked_product_id == req.tracked_product_id,
            KeywordRankHistory.keyword            == kw,
            KeywordRankHistory.user_email         == req.user_email,
        ).first()
        if not existing:
            db.add(KeywordRankHistory(
                tracked_product_id=req.tracked_product_id,
                keyword=kw, rank=0,
                checked_at=datetime.utcnow(),
                user_email=req.user_email,
            ))
            added += 1

    db.commit()
    return {"status": "ok", "message": f"Added {added} new keywords for {req.user_email}"}


@router.get("/keyword_tracker/tracked_products/{seller_id}", response_model=List[TrackedProductResponse])
def get_tracked_products(seller_id: str, user_email: str = None, db: Session = Depends(get_db)):
    query = db.query(TrackedProduct).filter(TrackedProduct.seller_id == seller_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    return [_to_response(p) for p in query.all()]


@router.get("/keyword_tracker/rank_history/{tracked_product_id}")
def get_rank_history(tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)):
    """Rank history enriched with velocity per keyword."""
    query = db.query(KeywordRankHistory).filter(
        KeywordRankHistory.tracked_product_id == tracked_product_id
    )
    if user_email:
        query = query.filter(KeywordRankHistory.user_email == user_email)
    history = query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

    by_kw: dict = defaultdict(list)
    for entry in history:
        by_kw[entry.keyword].append({"rank": entry.rank, "checked_at": entry.checked_at.isoformat()})

    result = []
    for entry in history:
        kw_data = by_kw[entry.keyword]
        v = compute_velocity(kw_data) if entry == history[0] or entry.keyword != getattr(
            history[history.index(entry)-1] if history.index(entry) > 0 else entry, 'keyword', None
        ) else 0.0
        result.append({
            "keyword":    entry.keyword,
            "rank":       entry.rank,
            "velocity":   v,
            "checked_at": entry.checked_at.isoformat(),
            "user_email": entry.user_email,
        })
    return result


@router.post("/keyword_tracker/update_daily_ranks")
def update_daily_ranks(req: UpdateRanksRequest, db: Session = Depends(get_db)):
    """Manual rank update — limited to 4 calls per user per calendar day."""
    if not req.user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    rl = check_rank_update_ratelimit(req.user_email, db)
    if not rl["allowed"]:
        raise HTTPException(
            status_code=429,
            detail=(f"You've used all {RANK_UPDATE_DAILY_LIMIT} manual rank updates for today. "
                    f"Resets at {rl['resets_at']}. Automated daily updates still run in the background."),
            headers={"X-RateLimit-Limit": str(rl["limit"]),
                     "X-RateLimit-Used": str(rl["used"]),
                     "X-RateLimit-ResetAt": rl["resets_at"]},
        )

    increment_rank_update_count(req.user_email, db)

    products = db.query(TrackedProduct).filter(TrackedProduct.user_email == req.user_email).all()
    if not products:
        return {"status": "success", "message": "No products found.", "updated_count": 0, "rate_limit": rl}

    updated = 0
    for product in products:
        kw_entries = db.query(KeywordRankHistory).filter(
            KeywordRankHistory.tracked_product_id == product.id,
            KeywordRankHistory.user_email         == req.user_email,
        ).all()

        for kw in kw_entries:
            try:
                resp = requests.get(
                    AMAZON_SEARCH_API_URL,
                    headers=HEADERS,
                    params={"query": kw.keyword, "country": product.country,
                            "page": "1", "sort_by": "RELEVANCE"},
                    timeout=20,
                )
                resp.raise_for_status()
                results = resp.json().get("data", {}).get("products", [])
                rank = next((i + 1 for i, p in enumerate(results) if p.get("asin") == product.asin), 0)
                kw.rank       = rank
                kw.checked_at = datetime.utcnow()
                updated += 1
            except Exception as e:
                print(f"[rank update] {product.asin}/{kw.keyword}: {e}")

    db.commit()

    new_rl = check_rank_update_ratelimit(req.user_email, db)
    return {
        "status":        "success",
        "message":       f"Updated {updated} keyword ranks.",
        "updated_count": updated,
        "rate_limit": {
            "used":      new_rl["used"],
            "limit":     new_rl["limit"],
            "remaining": new_rl["limit"] - new_rl["used"],
            "resets_at": new_rl["resets_at"],
        },
    }


@router.get("/keyword_tracker/product_detail/{tracked_product_id}")
def get_product_detail(
    tracked_product_id: int,
    user_email: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    kw_history = db.query(KeywordRankHistory).filter(
        KeywordRankHistory.tracked_product_id == tracked_product_id
    )
    if user_email:
        kw_history = kw_history.filter(KeywordRankHistory.user_email == user_email)
    kw_history = kw_history.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

    by_kw: dict = defaultdict(list)
    for entry in kw_history:
        by_kw[entry.keyword].append({"rank": entry.rank, "checked_at": entry.checked_at.isoformat()})

    keyword_data = []
    for kw, ranks in by_kw.items():
        keyword_data.append({
            "keyword":      kw,
            "current_rank": ranks[0]["rank"] if ranks else 0,
            "history":      ranks,
            "velocity":     compute_velocity(ranks),
            "prediction":   predict_rank(ranks),
        })

    seller_dict = {
        "asin": product.asin, "product_title": product.product_title,
        "product_price_numeric": None, "product_star_rating_numeric": None,
        "product_num_ratings": None, "is_best_seller": False,
        "is_amazon_choice": False, "is_prime": False,
    }
    competitors = find_competitor_matches(seller_dict, db, country=product.country, max_matches=5)
    comparisons = [
        {
            "competitor_product": c.model_dump(),
            "comparison_metrics": generate_comparison_metrics(seller_dict, c),
        }
        for c in competitors
    ]

    ai_rec    = ai_competitor_recommendation(seller_dict, comparisons)
    comments  = parse_review_comments(product.review_comments)
    sentiment = ai_review_sentiment(comments, product.product_title) if comments else {}
    suggestions = ai_keyword_suggestions(product.product_title, product.asin, product.country)

    all_rank_points = []
    for kw, ranks in by_kw.items():
        all_rank_points.extend(ranks)
    overall_prediction = predict_rank(sorted(all_rank_points, key=lambda x: x["checked_at"]))

    return {
        "product": {
            "id":            product.id,
            "seller_id":     product.seller_id,
            "asin":          product.asin,
            "product_title": product.product_title,
            "product_photo": product.product_photo,
            "country":       product.country,
            "user_email":    product.user_email,
            # seller profile fields surfaced in detail view (NEW)
            "seller_name":          getattr(product, "seller_name", None),
            "seller_logo":          getattr(product, "seller_logo", None),
            "seller_link":          getattr(product, "seller_link", None),
            "store_link":           getattr(product, "store_link", None),
            "seller_phone":         getattr(product, "seller_phone", None),
            "business_name":        getattr(product, "business_name", None),
            "business_address":     getattr(product, "business_address", None),
            "seller_rating":        getattr(product, "seller_rating", None),
            "seller_ratings_total": getattr(product, "seller_ratings_total", None),
        },
        "keywords":                keyword_data,
        "competitors":             comparisons,
        "ai_recommendation":       ai_rec,
        "review_sentiment":        sentiment,
        "keyword_suggestions":     suggestions,
        "overall_rank_prediction": overall_prediction,
    }


@router.get("/keyword_tracker/ai_analysis/{tracked_product_id}", response_model=AIAnalysisResponse)
def get_ai_keyword_analysis(
    tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)
):
    query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Tracked product not found")

    rank_query = db.query(KeywordRankHistory).filter(KeywordRankHistory.tracked_product_id == tracked_product_id)
    if user_email:
        rank_query = rank_query.filter(KeywordRankHistory.user_email == user_email)
    rank_history = rank_query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()
    if not rank_history:
        raise HTTPException(status_code=404, detail="No rank history found")

    by_kw: dict = defaultdict(list)
    for entry in rank_history:
        by_kw[entry.keyword].append({"rank": entry.rank, "checked_at": entry.checked_at.isoformat()})

    rank_summary = []
    for kw, ranks in by_kw.items():
        change = (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) >= 2 else 0
        rank_summary.append({
            "keyword":       kw,
            "current_rank":  ranks[0]["rank"],
            "previous_rank": ranks[1]["rank"] if len(ranks) >= 2 else None,
            "change":        change,
            "trend":         "improved" if change > 0 else "declined" if change < 0 else "stable",
            "velocity":      compute_velocity(ranks),
        })

    analysis = ai_keyword_analysis(product.product_title, product.asin, product.country, rank_summary)
    return {"product_title": product.product_title, "asin": product.asin,
            "total_keywords": len(rank_summary), "analysis": analysis}


@router.post("/keyword_tracker/suggest_keywords/{tracked_product_id}")
def suggest_keywords(tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)):
    """AI-powered keyword suggestions grouped by search intent."""
    query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    suggestions = ai_keyword_suggestions(product.product_title, product.asin, product.country)
    return {"product_title": product.product_title, "asin": product.asin, "suggestions": suggestions}


@router.get("/keyword_tracker/review_sentiment/{tracked_product_id}")
def get_review_sentiment(tracked_product_id: int, user_email: str = None, db: Session = Depends(get_db)):
    """NLP sentiment breakdown by topic (quality, packaging, value, shipping, support)."""
    query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    comments = parse_review_comments(product.review_comments)
    if not comments:
        return {"product_title": product.product_title, "asin": product.asin,
                "sentiment": {"error": "No reviews available for analysis."}}

    sentiment = ai_review_sentiment(comments, product.product_title)
    return {"product_title": product.product_title, "asin": product.asin, "sentiment": sentiment}


@router.get("/keyword_tracker/rank_prediction/{tracked_product_id}")
def get_rank_prediction(
    tracked_product_id: int, keyword: str = None,
    user_email: str = None, db: Session = Depends(get_db)
):
    query = db.query(KeywordRankHistory).filter(KeywordRankHistory.tracked_product_id == tracked_product_id)
    if user_email:
        query = query.filter(KeywordRankHistory.user_email == user_email)
    if keyword:
        query = query.filter(KeywordRankHistory.keyword == keyword)
    history = query.order_by(KeywordRankHistory.checked_at.asc()).all()
    if not history:
        raise HTTPException(status_code=404, detail="No rank history found")

    points     = [{"rank": h.rank, "checked_at": h.checked_at.isoformat()} for h in history]
    prediction = predict_rank(points)
    return {"keyword": keyword or "aggregate", "prediction": prediction, "data_points": len(points)}


@router.post("/keyword_tracker/set_price_alert")
def set_price_alert(req: PriceAlertRequest, db: Session = Depends(get_db)):
    query = db.query(TrackedProduct).filter(TrackedProduct.id == req.tracked_product_id)
    if req.user_email:
        query = query.filter(TrackedProduct.user_email == req.user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.execute(text("""
        INSERT INTO price_alerts (tracked_product_id, user_email, threshold_percent, delivery_email)
        VALUES (:pid, :email, :thresh, :demail)
        ON CONFLICT DO NOTHING
    """), {"pid": req.tracked_product_id, "email": req.user_email,
           "thresh": req.threshold_percent, "demail": req.delivery_email})
    db.commit()

    seller_dict = {"asin": product.asin, "product_title": product.product_title}
    competitors = find_competitor_matches(seller_dict, db, country=product.country, max_matches=5)
    triggered   = []
    for comp in competitors:
        if comp.product_price_numeric:
            triggered.append({
                "competitor_asin":  comp.asin,
                "competitor_title": comp.product_title,
                "competitor_price": comp.product_price_numeric,
                "alert_threshold":  req.threshold_percent,
            })

    if triggered:
        fire_price_alert(
            product_title=product.product_title,
            asin=product.asin,
            threshold_percent=req.threshold_percent,
            triggered=triggered,
            delivery_email=req.delivery_email,
        )

    return {
        "status":          "alert_set",
        "product":         product.product_title,
        "threshold":       f"{req.threshold_percent}%",
        "alert_email":     req.delivery_email,
        "immediate_check": triggered,
        "email_sent":      len(triggered) > 0,
    }


@router.get("/keyword_tracker/cross_market_comparison/{asin}")
async def cross_market_comparison(
    asin: str,
    countries: str = "IN,US,UK,DE",
    db: Session = Depends(get_db),
):
    country_list = [c.strip().upper() for c in countries.split(",") if c.strip().upper() in SUPPORTED_COUNTRIES]
    if not country_list:
        raise HTTPException(status_code=400, detail=f"No valid countries. Supported: {SUPPORTED_COUNTRIES}")

    async def fetch_country(country: str) -> dict:
        loop = asyncio.get_event_loop()
        try:
            resp = await loop.run_in_executor(
                None,
                lambda: requests.get(
                    AMAZON_SEARCH_API_URL,
                    headers=HEADERS,
                    params={"query": asin, "country": country, "page": "1"},
                    timeout=20,
                ),
            )
            resp.raise_for_status()
            products = resp.json().get("data", {}).get("products", [])
            match    = next((p for p in products if p.get("asin") == asin), None)
            if match:
                return {"country": country, "found": True, "data": match,
                        "rank_in_search": next((i+1 for i, p in enumerate(products) if p.get("asin") == asin), None)}
            return {"country": country, "found": False, "data": None, "rank_in_search": None}
        except Exception as e:
            return {"country": country, "found": False, "error": str(e), "data": None}

    results      = await asyncio.gather(*[fetch_country(c) for c in country_list])
    found_markets = [r for r in results if r.get("found")]
    if not found_markets:
        return {"asin": asin, "markets": results, "best_market": None,
                "insights": "Product not found in any requested marketplace."}

    best = max(found_markets, key=lambda r: r["data"].get("product_star_rating_numeric") or 0)

    market_summary = "\n".join(
        f"  {r['country']}: price={r['data'].get('product_price','?')}, "
        f"rating={r['data'].get('product_star_rating','?')}, rank={r.get('rank_in_search','?')}"
        for r in found_markets
    )
    prompt = f"""{SYSTEM_PERSONA}

Product ASIN {asin} across marketplaces:
{market_summary}

In 2-3 direct sentences, tell the seller: which market is performing best and why, and one specific action they should take based on this cross-market data."""
    try:
        insight = _call_ollama(prompt, timeout=60)
    except Exception:
        insight = "Cross-market data collected. Compare pricing and ratings per country to identify expansion opportunities."

    return {"asin": asin, "markets": results, "best_market": best.get("country"), "ai_insight": insight}


@router.get("/keyword_tracker/competitor_changes/{seller_id}")
def get_competitor_changes(seller_id: str, user_email: str = None, db: Session = Depends(get_db)):
    today     = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

    query_params: dict = {"sid": seller_id, "today": today, "yesterday": yesterday}
    email_filter = "AND user_email = :email" if user_email else ""
    if user_email:
        query_params["email"] = user_email

    rows = db.execute(text(f"""
        SELECT t.asin, t.snapshot_date, t.snapshot_data
        FROM competitor_snapshots t
        WHERE t.seller_id = :sid
          AND t.snapshot_date IN (:today, :yesterday)
          {email_filter}
        ORDER BY t.asin, t.snapshot_date DESC
    """), query_params).fetchall()

    by_asin: dict = defaultdict(dict)
    for asin, date, data in rows:
        by_asin[asin][str(date)] = json.loads(data) if isinstance(data, str) else data

    changes      = []
    watch_fields = ["product_price_numeric", "product_star_rating_numeric",
                    "product_num_ratings", "is_best_seller", "is_amazon_choice"]

    for asin, snapshots in by_asin.items():
        today_data     = snapshots.get(today, [])
        yesterday_data = snapshots.get(yesterday, [])
        if not today_data or not yesterday_data:
            continue

        today_map     = {c["asin"]: c for c in today_data}
        yesterday_map = {c["asin"]: c for c in yesterday_data}

        for comp_asin, today_comp in today_map.items():
            yesterday_comp = yesterday_map.get(comp_asin)
            if not yesterday_comp:
                continue
            diffs = []
            for field in watch_fields:
                old_val = yesterday_comp.get(field)
                new_val = today_comp.get(field)
                if old_val != new_val and old_val is not None and new_val is not None:
                    diffs.append({"field": field, "old_value": old_val, "new_value": new_val})
            if diffs:
                changes.append({
                    "seller_asin":      asin,
                    "competitor_asin":  comp_asin,
                    "competitor_title": today_comp.get("product_title", ""),
                    "changes":          diffs,
                    "detected_at":      today,
                })

    return {
        "seller_id":     seller_id,
        "period":        f"{yesterday} → {today}",
        "total_changes": len(changes),
        "changes":       changes,
    }


@router.get("/keyword_tracker/export/{tracked_product_id}")
def export_report(
    tracked_product_id: int,
    format:     str = "pdf",
    user_email: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(TrackedProduct).filter(TrackedProduct.id == tracked_product_id)
    if user_email:
        query = query.filter(TrackedProduct.user_email == user_email)
    product = query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    kw_query = db.query(KeywordRankHistory).filter(
        KeywordRankHistory.tracked_product_id == tracked_product_id
    )
    if user_email:
        kw_query = kw_query.filter(KeywordRankHistory.user_email == user_email)
    history = kw_query.order_by(KeywordRankHistory.keyword, KeywordRankHistory.checked_at.desc()).all()

    rank_history_dicts = [
        {"keyword": h.keyword, "rank": h.rank, "velocity": 0.0,
         "checked_at": h.checked_at.isoformat()}
        for h in history
    ]

    if format.lower() == "csv":
        import csv, io
        text_buf = io.StringIO()
        writer   = csv.DictWriter(text_buf, fieldnames=["keyword", "rank", "velocity", "checked_at"])
        writer.writeheader()
        writer.writerows(rank_history_dicts)
        return StreamingResponse(
            BytesIO(text_buf.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={product.asin}_ranks.csv"},
        )

    # PDF
    by_kw: dict = defaultdict(list)
    for h in history:
        by_kw[h.keyword].append({"rank": h.rank, "checked_at": h.checked_at.isoformat()})

    rank_summary = [
        {
            "keyword":      kw,
            "current_rank": ranks[0]["rank"],
            "previous_rank": ranks[1]["rank"] if len(ranks) > 1 else None,
            "change":       (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) > 1 else 0,
            "trend":        "stable",
            "velocity":     compute_velocity(ranks),
        }
        for kw, ranks in by_kw.items()
    ]

    ai_analysis = ai_keyword_analysis(product.product_title, product.asin, product.country, rank_summary)
    prediction  = predict_rank([{"rank": h.rank, "checked_at": h.checked_at.isoformat()} for h in history])
    product_resp = _to_response(product)
    pdf_buf      = generate_pdf_report(product_resp, rank_history_dicts, ai_analysis, prediction)

    return StreamingResponse(
        pdf_buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={product.asin}_report.pdf"},
    )


@router.get("/keyword_tracker/rate_limit_status")
def get_rate_limit_status(user_email: str, db: Session = Depends(get_db)):
    rl = check_rank_update_ratelimit(user_email, db)
    return {
        "user_email":             user_email,
        "rank_updates_used":      rl["used"],
        "rank_updates_limit":     rl["limit"],
        "rank_updates_remaining": rl["limit"] - rl["used"],
        "resets_at":              rl["resets_at"],
        "auto_update_schedule":   "Daily at 06:00 UTC (always runs)",
    }


@router.get("/keyword_tracker/competitor_comparison/{seller_id}", response_model=ComparisonResponse)
def get_competitor_comparison(
    seller_id: str, country: str = "IN", user_email: str = None,
    max_competitors_per_product: int = 3, db: Session = Depends(get_db)
):
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    cache_key = f"competitor_comp:{seller_id}:{country}:{user_email}:{max_competitors_per_product}"
    cached = r.get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    products = db.query(TrackedProduct).filter(
        TrackedProduct.seller_id  == seller_id,
        TrackedProduct.user_email == user_email,
        TrackedProduct.country    == country,
    ).all()
    if not products:
        raise HTTPException(status_code=404, detail=f"No tracked products found for seller {seller_id}")

    all_comparisons = []
    for p in products:
        seller_dict = {
            "asin": p.asin, "product_title": p.product_title, "product_photo": p.product_photo,
            "country": p.country, "product_price_numeric": None,
            "product_star_rating_numeric": None, "product_num_ratings": None,
            "is_best_seller": False, "is_amazon_choice": False, "is_prime": False,
        }
        for comp in find_competitor_matches(seller_dict, db, country=country, max_matches=max_competitors_per_product):
            all_comparisons.append(ProductComparison(
                seller_product=seller_dict, competitor_product=comp,
                comparison_metrics=generate_comparison_metrics(seller_dict, comp),
            ))

    final_result = ComparisonResponse(
        seller_id=seller_id, total_seller_products=len(products),
        total_comparisons=len(all_comparisons), comparisons=all_comparisons,
    )
    final_result = sanitize_data(final_result.dict())
    r.setex(cache_key, 1200, json.dumps(final_result))
    return final_result


@router.get("/keyword_tracker/fetch_and_compare/{seller_id}")
def fetch_products_with_comparison(
    seller_id: str, country: str = "US", page: int = 1,
    user_email: str = None, user_id: int = None, db: Session = Depends(get_db)
):
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")
    
    service = SellerInboundService()
    try:
        # We can still use the service's helper functions directly if we want to keep the custom logic of this route
        # Or we can just use ingest_seller_data if it fits. 
        # This route seems to be very similar to fetch_and_store_seller_products but doesn't return the comparisons yet in this snippet.
        # I'll use the service's helpers to maintain existing logic structure.
        
        resp = requests.get(AMAZON_API_URL, headers=HEADERS,
                            params={"seller_id": seller_id, "country": country,
                                    "page": page, "sort_by": "RELEVANCE"}, timeout=20)
        resp.raise_for_status()
        seller_products = resp.json().get("data", {}).get("seller_products", [])
        if not seller_products:
            return {"products": [], "comparisons": []}
        
        # service = SellerInboundService()

        service.ingest_seller_data(
            db=db,
            seller_id=seller_id,
            # country=country,
            # seller_products=seller_products,  
            # profile=fetch_seller_profile(seller_id, country),
        )

        profile = fetch_seller_profile(seller_id, country)
        comments, ratings, authors, dates, has_response = fetch_seller_reviews(seller_id, country)
        comments_json     = json.dumps(comments)     if comments     else None
        ratings_json      = json.dumps(ratings)      if ratings      else None
        authors_json      = json.dumps(authors)      if authors      else None
        dates_json        = json.dumps(dates)        if dates        else None
        has_response_json = json.dumps(has_response) if has_response else None

        saved_products = []
        for item in seller_products:
            product_fields = _extract_product_fields(item)

            existing = db.query(TrackedProduct).filter(
                TrackedProduct.seller_id  == seller_id,
                TrackedProduct.asin       == item["asin"],
                TrackedProduct.user_email == user_email,
            ).first()
            # if existing:
            #     existing.product_title       = item["product_title"]
            #     existing.product_photo       = item.get("product_photo", "")
            #     existing.review_comments     = comments_json
            #     existing.review_ratings      = ratings_json
            #     existing.review_authors      = authors_json
            #     existing.review_dates        = dates_json
            #     existing.review_has_response = has_response_json
            #     for field, value in {**product_fields, **profile}.items():
            #         if value is not None:  # keeps False, 0, empty string — only skips None
            #             setattr(existing, field, value)
            #     db.commit(); db.refresh(existing)
            #     saved_products.append(existing)
            # else:
            #     new_p = TrackedProduct(
            #         seller_id=seller_id,
            #         asin=item["asin"],
            #         product_title=item["product_title"],
            #         product_photo=item.get("product_photo", ""),
            #         country=country,
            #         user_email=user_email,
            #         review_comments=comments_json,
            #         review_ratings=ratings_json,
            #         review_authors=authors_json,
            #         review_dates=dates_json,
            #         review_has_response=has_response_json,
            #         **product_fields,
            #         **profile,
            #     )
            #     db.add(new_p); db.commit(); db.refresh(new_p)
            #     saved_products.append(new_p)
            BOOLEAN_FIELDS = {
                "is_best_seller", "is_amazon_choice", "is_prime",
                "climate_pledge_friendly", "has_variations"
            }

            if existing:
                existing.product_title       = item["product_title"]
                existing.product_photo       = item.get("product_photo", "")
                existing.review_comments     = comments_json
                existing.review_ratings      = ratings_json
                existing.review_authors      = authors_json
                existing.review_dates        = dates_json
                existing.review_has_response = has_response_json
                for field, value in {**product_fields, **profile}.items():
                    if field in BOOLEAN_FIELDS:
                        setattr(existing, field, value)
                    elif value is not None:
                        setattr(existing, field, value)
                db.commit()
                db.refresh(existing)
                saved_products.append(existing)
            else:
                new_p = TrackedProduct(
                    seller_id=seller_id,
                    asin=item["asin"],
                    product_title=item["product_title"],
                    product_photo=item.get("product_photo", ""),
                    country=country,
                    user_email=user_email,
                    review_comments=comments_json,
                    review_ratings=ratings_json,
                    review_authors=authors_json,
                    review_dates=dates_json,
                    review_has_response=has_response_json,
                    **product_fields,
                    **profile,
                )
                db.add(new_p)
                db.commit()
                db.refresh(new_p)
                saved_products.append(new_p)
                
        # Comparisons use the now-enriched seller dict (has real price/rating/badges)
        all_comparisons = []
        for sp in seller_products:
            pf = _extract_product_fields(sp)
            seller_dict = {
                "asin":                      sp["asin"],
                "product_title":             sp["product_title"],
                "product_photo":             sp.get("product_photo"),
                "product_price_numeric":     _parse_price(sp.get("product_price")),
                "product_star_rating_numeric": pf["product_star_rating_numeric"],
                "product_num_ratings":       pf["product_num_ratings"],
                "is_best_seller":            pf["is_best_seller"],
                "is_amazon_choice":          pf["is_amazon_choice"],
                "is_prime":                  pf["is_prime"],
            }
            for comp in find_competitor_matches(seller_dict, db, country=country, max_matches=3):
                all_comparisons.append({
                    "seller_product":     seller_dict,
                    "competitor_product": comp.model_dump(),
                    "comparison_metrics": generate_comparison_metrics(seller_dict, comp),
                })

        return {
            "products":          [_to_response(p).__dict__ for p in saved_products],
            "comparisons":       all_comparisons,
            "total_products":    len(saved_products),
            "total_comparisons": len(all_comparisons),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════════
# COMPETITOR INTELLIGENCE CHAT
# ═══════════════════════════════════════════════════════════════════

CHAT_PERSONA = """You are Insydz — a sharp, experienced Amazon marketplace strategist who has helped hundreds of sellers compete and win.

Your personality:
- You speak like a real person, not a report generator. Conversational, direct, occasionally blunt.
- You never hedge everything. If the data says a competitor is crushing it, you say so.
- You remember what was said earlier in this conversation and refer back to it naturally.
- You ask one follow-up question when you need more context — but only one.
- You use "I", "you", "we" naturally. You're having a conversation, not writing a document.
- Short sentences when making a point. Longer ones when explaining nuance.
- You never use: "Certainly!", "Absolutely!", "Great question!", "Of course!", "As an AI..."
- When you don't know something from the data, you say "I don't have that data right now" — not "I cannot determine..."
- You occasionally say things like "Honestly,", "Here's the thing —", "Look,", "Real talk —" to sound human.
- Numbers matter. Always reference the actual figures you've been given.
- You give opinions. "I think they're about to drop their price" is better than "price changes are possible".

Your knowledge scope for this conversation:
- Everything about the seller's tracked product (title, ASIN, country, reviews, ratings)
- Full seller profile (business name, address, phone, logo, seller rating)
- Full competitor list with prices, ratings, review counts, badges
- Keyword rank history with velocity and trends
- Competitor snapshot history (changes over time)
- Rank prediction data (7-day and 30-day forecasts)

Time awareness:
- "past" questions → use snapshot history, rank history, rating/price changes over time
- "present" questions → use current competitor data, current ranks, current badges
- "future" questions → use rank prediction, velocity trends, price patterns, your strategic judgment
- "what should I do" → give a direct action plan based on everything above

Never make up data. If a specific number isn't in the context, say so and reason from what you do have."""


def _build_competitor_context(product: TrackedProduct, db: Session, user_email: str) -> dict:
    # Keyword rank history
    kw_rows = db.execute(text("""
        SELECT keyword, rank, checked_at
        FROM keyword_rank_history
        WHERE tracked_product_id = :pid AND user_email = :email
        ORDER BY keyword, checked_at DESC
    """), {"pid": product.id, "email": user_email}).fetchall()

    by_kw: dict = defaultdict(list)
    for kw, rank, checked_at in kw_rows:
        by_kw[kw].append({"rank": rank, "checked_at": checked_at.isoformat()})

    keyword_summary = []
    for kw, ranks in by_kw.items():
        velocity = compute_velocity(ranks)
        change   = (ranks[1]["rank"] - ranks[0]["rank"]) if len(ranks) >= 2 else 0
        keyword_summary.append({
            "keyword":       kw,
            "current_rank":  ranks[0]["rank"] if ranks else 0,
            "previous_rank": ranks[1]["rank"] if len(ranks) >= 2 else None,
            "change":        change,
            "velocity":      velocity,
            "trend":         "improving" if velocity > 0.3 else "declining" if velocity < -0.3 else "stable",
            "history_count": len(ranks),
        })

    all_points = [{"rank": r["rank"], "checked_at": r["checked_at"]}
                  for ranks in by_kw.values() for r in ranks]
    prediction = predict_rank(sorted(all_points, key=lambda x: x["checked_at"])) if all_points else {}

    seller_dict = {
        "asin":                      product.asin,
        "product_title":             product.product_title,
        "product_price_numeric":     None,
        "product_star_rating_numeric": None,
        "product_num_ratings":       None,
        "is_best_seller":            False,
        "is_amazon_choice":          False,
        "is_prime":                  False,
    }
    competitors        = find_competitor_matches(seller_dict, db, country=product.country, max_matches=6)
    competitor_details = []
    for c in competitors:
        metrics = generate_comparison_metrics(seller_dict, c)
        competitor_details.append({
            "asin":             c.asin,
            "title":            c.product_title,
            "price":            c.product_price_numeric,
            "rating":           c.product_star_rating_numeric,
            "review_count":     c.product_num_ratings,
            "is_best_seller":   c.is_best_seller,
            "is_amazon_choice": c.is_amazon_choice,
            "is_prime":         c.is_prime,
            "sales_volume":     c.sales_volume,
            "advantages_over_you":  metrics.get("competitive_disadvantages", []),
            "your_advantages_over": metrics.get("competitive_advantages", []),
            "price_diff_percent":   metrics.get("price_comparison", {}).get("difference_percent"),
            "rating_diff":          metrics.get("rating_comparison", {}).get("difference"),
        })

    snapshot_rows = db.execute(text("""
        SELECT snapshot_date, snapshot_data
        FROM competitor_snapshots
        WHERE asin = :asin AND user_email = :email
        ORDER BY snapshot_date DESC
        LIMIT 14
    """), {"asin": product.asin, "email": user_email}).fetchall()

    snapshot_timeline = []
    for snap_date, snap_data in snapshot_rows:
        data = json.loads(snap_data) if isinstance(snap_data, str) else (snap_data or [])
        snapshot_timeline.append({
            "date":        str(snap_date),
            "competitors": [
                {
                    "asin":             c.get("asin"),
                    "title":            c.get("product_title", "")[:60],
                    "price":            c.get("product_price_numeric"),
                    "rating":           c.get("product_star_rating_numeric"),
                    "review_count":     c.get("product_num_ratings"),
                    "is_best_seller":   c.get("is_best_seller"),
                    "is_amazon_choice": c.get("is_amazon_choice"),
                }
                for c in data[:5]
            ],
        })

    comments   = parse_review_comments(product.review_comments)
    ratings    = parse_review_ratings(product.review_ratings)
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

    return {
        "product": {
            "id":           product.id,
            "asin":         product.asin,
            "title":        product.product_title,
            "country":      product.country,
            "seller_id":    product.seller_id,
            "avg_rating":   avg_rating,
            "review_count": len(ratings),
            "sample_reviews": comments[:10],
            # seller profile in chat context (NEW)
            "seller_name":          getattr(product, "seller_name", None),
            "business_name":        getattr(product, "business_name", None),
            "business_address":     getattr(product, "business_address", None),
            "seller_rating":        getattr(product, "seller_rating", None),
            "seller_ratings_total": getattr(product, "seller_ratings_total", None),
        },
        "keywords":          keyword_summary,
        "rank_prediction":   prediction,
        "competitors":       competitor_details,
        "snapshot_timeline": snapshot_timeline,
        "data_freshness": {
            "competitors_live":    len(competitor_details) > 0,
            "keyword_data_points": sum(k["history_count"] for k in keyword_summary),
            "snapshot_days":       len(snapshot_timeline),
        },
    }


def _format_context_for_prompt(ctx: dict) -> str:
    lines = []
    p = ctx["product"]
    lines.append("=== SELLER'S PRODUCT ===")
    lines.append(f"Title: {p['title']}")
    lines.append(f"ASIN: {p['asin']} | Country: {p['country']}")
    lines.append(f"Avg rating: {p['avg_rating'] or 'unknown'} | Reviews: {p['review_count']}")
    # seller profile (NEW)
    if p.get("seller_name") or p.get("business_name"):
        lines.append(f"Seller: {p.get('seller_name','?')} | Business: {p.get('business_name','?')}")
        if p.get("business_address"):
            lines.append(f"Address: {p['business_address']}")
        if p.get("seller_rating"):
            lines.append(f"Seller rating: {p['seller_rating']} ({p.get('seller_ratings_total',0)} ratings)")
    if p["sample_reviews"]:
        lines.append(f"Sample customer feedback: {' | '.join(p['sample_reviews'][:3])}")

    lines.append("\n=== KEYWORD RANKINGS ===")
    if ctx["keywords"]:
        for k in ctx["keywords"]:
            arrow = "↑" if k["trend"] == "improving" else "↓" if k["trend"] == "declining" else "→"
            lines.append(
                f"  '{k['keyword']}': rank #{k['current_rank']} {arrow} "
                f"(velocity: {k['velocity']:+.2f}, trend: {k['trend']}, "
                f"prev rank: {k['previous_rank'] or 'N/A'})"
            )
    else:
        lines.append("  No keyword data available yet.")

    pred = ctx["rank_prediction"]
    if pred.get("predicted_7d"):
        lines.append(
            f"\n=== RANK FORECAST ===\n"
            f"  7-day: #{pred['predicted_7d']} (±{pred.get('margin_7d','?')}) | "
            f"30-day: #{pred['predicted_30d']} (±{pred.get('margin_30d','?')}) | "
            f"Trend: {pred.get('trend','unknown')} | Confidence: {pred.get('confidence','low')}"
        )

    lines.append(f"\n=== CURRENT COMPETITORS ({len(ctx['competitors'])} found) ===")
    for i, c in enumerate(ctx["competitors"], 1):
        badges    = []
        if c["is_best_seller"]:   badges.append("BEST SELLER")
        if c["is_amazon_choice"]: badges.append("AMAZON'S CHOICE")
        if c["is_prime"]:         badges.append("PRIME")
        badge_str = f" [{', '.join(badges)}]" if badges else ""
        lines.append(
            f"  {i}. {c['title'][:55]}{badge_str}\n"
            f"     ASIN: {c['asin']} | Price: ₹{c['price'] or '?'} | "
            f"Rating: {c['rating'] or '?'} | Reviews: {c['review_count'] or '?'}\n"
            f"     Their edge over you: {', '.join(c['advantages_over_you']) or 'none identified'}\n"
            f"     Your edge over them: {', '.join(c['your_advantages_over']) or 'none identified'}"
        )

    if ctx["snapshot_timeline"]:
        lines.append(f"\n=== COMPETITOR HISTORY (last {len(ctx['snapshot_timeline'])} days) ===")
        for snap in ctx["snapshot_timeline"][:7]:
            comp_summary = ", ".join(
                f"{c['title'][:30]} @₹{c['price'] or '?'} ★{c['rating'] or '?'}"
                for c in snap["competitors"][:3]
            )
            lines.append(f"  {snap['date']}: {comp_summary}")
    else:
        lines.append("\n=== COMPETITOR HISTORY ===\n  No historical snapshots yet (scheduler runs daily).")

    return "\n".join(lines)


def _format_history_for_prompt(history: List[ChatMessage]) -> str:
    if not history:
        return ""
    lines = ["\n=== CONVERSATION SO FAR ==="]
    for msg in history[-10:]:
        prefix = "Seller" if msg.role == "user" else "Insydz"
        lines.append(f"{prefix}: {msg.content}")
    return "\n".join(lines)


def _generate_followup_suggestions(message: str, ctx: dict) -> List[str]:
    msg_lower    = message.lower()
    has_history  = len(ctx["snapshot_timeline"]) > 0
    has_keywords = len(ctx["keywords"]) > 0
    has_comps    = len(ctx["competitors"]) > 0
    has_pred     = bool(ctx["rank_prediction"].get("predicted_7d"))

    suggestions = []

    if any(w in msg_lower for w in ["future", "predict", "forecast", "will", "going to"]):
        suggestions += [
            "Which keyword should I push hardest in the next 30 days?",
            "Is my price likely to become a problem against competitors?",
            "What's the biggest risk to my ranking in the next month?",
        ]
    elif any(w in msg_lower for w in ["past", "history", "before", "used to", "changed"]):
        suggestions += [
            "Have any competitors gained or lost badges recently?",
            "Which competitor has been most consistent over time?",
            "How has my keyword rank trended compared to 2 weeks ago?",
        ]
    elif any(w in msg_lower for w in ["price", "pricing", "cheaper", "expensive", "cost"]):
        suggestions += [
            "Should I lower my price or compete on quality signals instead?",
            "Which competitor is most vulnerable to a price undercut?",
            "What's the sweet spot price for my category right now?",
        ]
    elif any(w in msg_lower for w in ["review", "rating", "customer", "feedback"]):
        suggestions += [
            "What are customers complaining about most with my competitors?",
            "How can I use their negative reviews to improve my listing?",
            "Which competitor has the worst review quality despite high volume?",
        ]
    elif any(w in msg_lower for w in ["keyword", "rank", "search", "seo"]):
        suggestions += [
            "Which competitor is winning on my most important keyword?",
            "Are there keywords I should be tracking that I'm missing?",
            "What does my rank velocity tell you about the next 2 weeks?",
        ]
    else:
        if has_comps:    suggestions.append("Who is my most dangerous competitor right now and why?")
        if has_pred:     suggestions.append("What does my rank prediction tell you about the next month?")
        if has_history:  suggestions.append("Has anything changed with my competitors in the past week?")
        if has_keywords: suggestions.append("Which of my keywords has the best momentum right now?")
        suggestions.append("What's the one thing I should do this week to improve my position?")

    return suggestions[:3]


@router.post("/keyword_tracker/competitor_chat", response_model=CompetitorChatResponse)
def competitor_chat(req: CompetitorChatRequest, db: Session = Depends(get_db)):
    if not req.user_email:
        raise HTTPException(status_code=400, detail="user_email is required")
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    product = db.query(TrackedProduct).filter(
        TrackedProduct.id         == req.tracked_product_id,
        TrackedProduct.user_email == req.user_email,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or doesn't belong to this user")

    ctx          = _build_competitor_context(product, db, req.user_email)
    context_text = _format_context_for_prompt(ctx)
    history_text = _format_history_for_prompt(req.history)

    msg_lower = req.message.lower()
    time_hint = ""
    if any(w in msg_lower for w in ["future", "predict", "forecast", "will", "going to", "next month", "next week"]):
        time_hint = "\nThe seller is asking about the FUTURE. Lean on rank predictions, velocity trends, and your strategic judgment. Be specific about timeframes."
    elif any(w in msg_lower for w in ["past", "history", "before", "last week", "last month", "used to", "changed", "was"]):
        time_hint = "\nThe seller is asking about the PAST. Use the snapshot timeline and rank history. Call out specific dates and changes."
    elif any(w in msg_lower for w in ["now", "current", "today", "right now", "at the moment"]):
        time_hint = "\nThe seller is asking about the PRESENT. Focus on current competitor data, live ranks, and active badges."
    elif any(w in msg_lower for w in ["should", "do", "action", "help", "advice", "recommend", "strategy"]):
        time_hint = "\nThe seller wants actionable advice. Give them a direct, specific answer — not a list of options. Tell them exactly what to do."

    prompt = f"""{CHAT_PERSONA}
{time_hint}

{context_text}
{history_text}

=== SELLER'S QUESTION ===
{req.message.strip()}

=== YOUR REPLY ===
Respond as Insydz. Be conversational, specific, and use the actual data above.
- Keep your reply focused — 3 to 6 sentences for simple questions, a short structured answer for complex ones.
- Reference actual competitor names, prices, ratings, or keyword ranks from the data above.
- If the data doesn't support a confident answer, say what you do know and what you'd need to be certain.
- End with ONE natural follow-up question if it would genuinely help the seller — but only if it makes sense. Don't force it.
- Do NOT use markdown headers, bullet asterisks, or numbered lists unless the question specifically calls for a structured breakdown.
- Write as you'd speak to someone across a table."""

    try:
        reply = _call_ollama(prompt, timeout=120)
        if not reply:
            reply = (
                "I'm having a moment — Ollama didn't return a response. "
                "Try asking again in a few seconds. "
                "If it keeps happening, check that the model is loaded with `ollama run llama3.2:3b`."
            )
    except requests.exceptions.ConnectionError:
        reply = (
            f"Can't reach Ollama right now. Make sure it's running on "
            f"{OLLAMA_BASE} with `ollama serve`. "
            "Once it's up, your question will work fine."
        )
    except requests.exceptions.Timeout:
        reply = (
            "That one took too long — the model timed out. "
            "Try a slightly shorter question, or check if the server is under load."
        )
    except Exception as e:
        reply = f"Something went wrong on my end: {str(e)}. Try again in a moment."

    followups = _generate_followup_suggestions(req.message, ctx)

    return CompetitorChatResponse(
        reply=reply,
        context_used={
            "product_asin":              ctx["product"]["asin"],
            "product_title":             ctx["product"]["title"],
            "seller_name":               ctx["product"].get("seller_name"),
            "business_name":             ctx["product"].get("business_name"),
            "competitors_loaded":        len(ctx["competitors"]),
            "keywords_loaded":           len(ctx["keywords"]),
            "snapshot_days":             ctx["data_freshness"]["snapshot_days"],
            "keyword_data_points":       ctx["data_freshness"]["keyword_data_points"],
            "rank_prediction_available": bool(ctx["rank_prediction"].get("predicted_7d")),
        },
        suggested_followups=followups,
    )


@router.get("/keyword_tracker/competitor_chat/starters/{tracked_product_id}")
def get_chat_starters(
    tracked_product_id: int,
    user_email: str,
    db: Session = Depends(get_db),
):
    product = db.query(TrackedProduct).filter(
        TrackedProduct.id         == tracked_product_id,
        TrackedProduct.user_email == user_email,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    has_keywords = db.execute(text(
        "SELECT COUNT(*) FROM keyword_rank_history WHERE tracked_product_id=:pid AND user_email=:email"
    ), {"pid": tracked_product_id, "email": user_email}).scalar() > 0

    has_snapshots = db.execute(text(
        "SELECT COUNT(*) FROM competitor_snapshots WHERE asin=:asin AND user_email=:email"
    ), {"asin": product.asin, "email": user_email}).scalar() > 0

    has_reviews = bool(parse_review_comments(product.review_comments))

    starters = [
        {
            "category": "Right now",
            "questions": [
                "Who is my biggest competitor right now and what are they doing better than me?",
                "Which competitor is most likely to steal my customers this week?",
                "How does my price compare to the top 3 competitors today?",
            ],
        },
        {
            "category": "Looking back",
            "questions": [
                "Have any competitors changed their price or rating recently?"
                if has_snapshots else "What's the competitive landscape in my category?",
                "Which competitor has been most consistent over time?",
                "Has my ranking been improving or declining over the past few weeks?",
            ],
        },
        {
            "category": "Looking ahead",
            "questions": [
                "Where do you think my ranking will be in 30 days?",
                "Which competitor do you think is about to make a move?",
                "What should I do in the next 2 weeks to stay ahead?",
            ],
        },
    ]

    if has_keywords:
        starters.append({
            "category": "Keywords",
            "questions": [
                "Which of my keywords has the best momentum right now?",
                "Which keyword should I focus on to climb the fastest?",
                "Are any of my keywords at risk of dropping out of the top 20?",
            ],
        })

    if has_reviews:
        starters.append({
            "category": "Reviews & sentiment",
            "questions": [
                "What are customers saying about my competitors that I can learn from?",
                "Which competitor has the worst review quality despite high volume?",
                "How can I use competitor review weaknesses in my own listing?",
            ],
        })

    seller_name = getattr(product, "seller_name", None)
    return {
        "product_title": product.product_title,
        "asin":          product.asin,
        "seller_name":   seller_name,
        "starters":      starters,
        "intro": (
            f"Hey — I'm Insydz. I've pulled up everything on your competitors "
            f"for '{product.product_title}'"
            + (f" (sold by {seller_name})" if seller_name else "")
            + ". Ask me anything — past, present, or where things are headed. "
            "What do you want to know?"
        ),
    }


from fastapi.responses import Response
from datetime import datetime

@router.get("/sitemap.xml", include_in_schema=False)
async def sitemap():
    """
    Production-ready static sitemap
    Update this list when adding new pages
    """
    base_url = "https://insydz.com"
    today = datetime.now().strftime("%Y-%m-%d")
    
    # ✅ Public marketing pages only
    pages = [
        "/",
        "/about",
        "/privacy-policy",
        "/terms-service",
        "/pricing",
        "/use-cases",
        "/solutions",
        "/features",
        "/compare/insydzvshelium",
        "/compare/insydzvsjunglescout",
        "/compare/insydzvsvirallaunch",
        "/solutions/amazon-sellers",
        "/solutions/flipkart-sellers",
        "/solutions/brand-managers",
        "/solutions/ecommerce-agencies",
        "/use-cases/track-competitor-prices",
        "/use-cases/find-profitable-products",
        "/use-cases/analyze-customer-reviews",
        "/use-cases/improve-seo",
        "/use-cases/avoid-stockouts",
        "/features/competitor-price-tracking-feature",
        "/features/review-analytics-feature",
        "/features/price-optimization-feature",
        "/features/keyword-rank-tracking-feature",
        "/features/product-research-feature",
        "/features/ai-recommendations-feature",
        "/features/whatsapp-alerts-feature",
        "/features/festive-trend-feature",
        "/free-tools/free-amazon-product-analyzer",
        "/free-tools/free-review-sentiment-checker",
        "/free-tools/free-competitor-price-checker",
        "/free-tools/free-keyword-rank-checker",
        "/resources/expert-blog",
        "/resources/expert-blog/amazon-competitor-price-tracking-tool",
        "/resources/expert-blog/amazon-seo-tool-india",
        "/resources/expert-blog/how-to-rank-page-1-amazon-india",
        "/resources/expert-blog/best-competitor-price-tracking-tools-india",
        "/resources/expert-blog/insydz-vs-helium-10-india",
        "/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers",
        "/resources/expert-blog/review-analysis-guide-india",
        "/resources/expert-blog/best-amazon-keyword-research-tool-india",
        "/resources/expert-blog/best-flipkart-analytics-tool",
        "/resources/expert-blog/flipkart-keyword-research-tool",
        "/resources/expert-blog/flipkart-seller-analytics-tool",
        "/resources/expert-blog/insydz-vs-sellerapp-india",
        "/resources/expert-blog/amazon-review-analysis-guide-india",
        "/resources/expert-blog/manual-vs-automated-competitor-tracking-tool",
        "/resources/expert-blog/amazon-private-label-india-2026",
        "/resources/expert-blog/amazon-vine-program-india-2026",
        "/resources/expert-blog/amazon-vs-flipkart-india-seller",
        "/resources/video-guides",
        "/author/vikrant-singh",
        "/about/our-vision",
        "/about/careers",
        "/about/contact-us",
    ]
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for page in pages:
        xml.append("  <url>")
        xml.append(f"    <loc>{base_url}{page}</loc>")
        xml.append(f"    <lastmod>{today}</lastmod>")
        xml.append("  </url>")
    
    xml.append("</urlset>")
    
    return Response(
        content="\n".join(xml),
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=86400"}  # 24h cache
    )


@router.get("/robots.txt", include_in_schema=False)
async def robots():
    return Response(
        content="""User-agent: *
Allow: /
Disallow: /login
Disallow: /signup
Disallow: /dashboard
Disallow: /settings
Disallow: /subscription
Disallow: /product-tracker
Disallow: /sales
Disallow: /overview

Sitemap: https://insydz.com/sitemap.xml
""",
        media_type="text/plain"
    )










import json
import re
import hashlib
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
import requests
 
 
# ──────────────────────────────────────────────────────────────────────
# SCHEMA
# ──────────────────────────────────────────────────────────────────────
 
class IntelligenceQuery(BaseModel):
    source:  str                          # "amazon" | "flipkart"
    filters: Optional[Dict[str, Any]] = {}
 
 
class IntelligenceResponse(BaseModel):
    market_pulse:     str
    opportunity:      str
    risk_flag:        str
    verdict:          str
    micro_insights:   List[str]
    momentum_score:   int
    momentum_label:   str
    context_summary:  str
    cached:           bool
    data_rows:        int
 
 
# ──────────────────────────────────────────────────────────────────────
# WHERE CLAUSE  (shared helper)
# ──────────────────────────────────────────────────────────────────────
 
def _where(filters: Dict, source: str) -> str:
    conds = []
    cat = filters.get("category", "")
    if cat and cat != "All Categories":
        safe = cat.replace("'", "''")
        conds.append(f"LOWER(category_name) = LOWER('{safe}')")
    pr = filters.get("priceRange", [0, 5_000_000])
    pf = "product_price" if source == "flipkart" else "product_price_numeric"
    if pr[0] > 0:         conds.append(f"{pf} >= {pr[0]}")
    if pr[1] < 5_000_000: conds.append(f"{pf} <= {pr[1]}")
    rat = filters.get("rating", 0)
    if rat > 0:
        rf = "product_star_rating" if source == "flipkart" else "product_star_rating_numeric"
        conds.append(f"{rf} >= {rat}")
    if filters.get("showTrendingOnly"):
        conds.append("sales_volume IS NOT NULL AND sales_volume != ''")
    return " AND ".join(conds) if conds else "1=1"
 
# ──────────────────────────────────────────────────────────────────────
# THREE PARALLEL SQL QUERIES
# ──────────────────────────────────────────────────────────────────────
 
def _sql_category_overview(source: str, where: str, limit: int = 15) -> str:
    if source == "flipkart":
        return f"""
            SELECT category_name,
                COUNT(*)                           AS listings,
                ROUND(AVG(product_price),0)        AS avg_price,
                ROUND(MIN(product_price),0)        AS min_price,
                ROUND(MAX(product_price),0)        AS max_price,
                ROUND(AVG(product_star_rating),2)  AS avg_rating,
                SUM(product_rating_count)          AS total_reviews,
                ROUND(AVG(estimated_sales),0)      AS avg_sales,
                COUNT(DISTINCT brand)              AS brand_count
            FROM rapidapi_flipkart_products
            WHERE product_title IS NOT NULL AND {where}
            GROUP BY category_name
            ORDER BY total_reviews DESC NULLS LAST
            LIMIT {limit}
        """
    return f"""
        SELECT category_name,
            COUNT(*)                                  AS listings,
            ROUND(AVG(product_price_numeric)::numeric,0)       AS avg_price,
            ROUND(MIN(product_price_numeric)::numeric,0)       AS min_price,
            ROUND(MAX(product_price_numeric)::numeric,0)       AS max_price,
            ROUND(AVG(product_star_rating_numeric)::numeric,2) AS avg_rating,
            SUM(product_num_ratings)                  AS total_reviews,
            ROUND(AVG(avg_sales_volume)::numeric,0)            AS avg_sales
        FROM rapidapi_amazon_products
        WHERE product_title IS NOT NULL AND {where}
        GROUP BY category_name
        ORDER BY total_reviews DESC NULLS LAST
        LIMIT {limit}
    """
 
def _sql_brand_leaders(source: str, where: str, limit: int = 10) -> str:
    if source == "flipkart":
        return f"""
            SELECT brand,
                COUNT(*)                           AS listings,
                ROUND(AVG(product_price),0)        AS avg_price,
                ROUND(AVG(product_star_rating),2)  AS avg_rating,
                SUM(product_rating_count)          AS total_reviews,
                ROUND(AVG(estimated_sales),0)      AS avg_sales
            FROM rapidapi_flipkart_products
            WHERE product_title IS NOT NULL AND brand IS NOT NULL AND {where}
            GROUP BY brand
            ORDER BY total_reviews DESC NULLS LAST
            LIMIT {limit}
        """
    return f"""
        SELECT category_name AS brand,
            COUNT(*)                                  AS listings,
            ROUND(AVG(product_price_numeric)::numeric,0)       AS avg_price,
            ROUND(AVG(product_star_rating_numeric)::numeric,2) AS avg_rating,
            SUM(product_num_ratings)                  AS total_reviews,
            ROUND(AVG(avg_sales_volume)::numeric,0)            AS avg_sales
        FROM rapidapi_amazon_products
        WHERE product_title IS NOT NULL AND {where}
        GROUP BY category_name
        ORDER BY total_reviews DESC NULLS LAST
        LIMIT {limit}
    """
 
def _sql_price_bands(source: str, where: str) -> str:
    if source == "flipkart":
        return f"""
            SELECT
                CASE
                    WHEN product_price < 500    THEN 'Under ₹500'
                    WHEN product_price < 1000   THEN '₹500-₹1K'
                    WHEN product_price < 2500   THEN '₹1K-₹2.5K'
                    WHEN product_price < 5000   THEN '₹2.5K-₹5K'
                    WHEN product_price < 15000  THEN '₹5K-₹15K'
                    ELSE 'Above ₹15K'
                END AS price_band,
                COUNT(*)                          AS listings,
                ROUND(AVG(product_star_rating),2) AS avg_rating,
                SUM(product_rating_count)         AS total_reviews
            FROM rapidapi_flipkart_products
            WHERE product_title IS NOT NULL AND product_price IS NOT NULL AND {where}
            GROUP BY 1
            ORDER BY total_reviews DESC NULLS LAST
        """
    return f"""
        SELECT
            CASE
                WHEN product_price_numeric < 500   THEN 'Under ₹500'
                WHEN product_price_numeric < 1000  THEN '₹500-₹1K'
                WHEN product_price_numeric < 2500  THEN '₹1K-₹2.5K'
                WHEN product_price_numeric < 5000  THEN '₹2.5K-₹5K'
                WHEN product_price_numeric < 15000 THEN '₹5K-₹15K'
                ELSE 'Above ₹15K'
            END AS price_band,
            COUNT(*)                                  AS listings,
            ROUND(AVG(product_star_rating_numeric)::numeric,2) AS avg_rating,
            SUM(product_num_ratings)                  AS total_reviews
        FROM rapidapi_amazon_products
        WHERE product_title IS NOT NULL AND product_price_numeric IS NOT NULL AND {where}
        GROUP BY 1
        ORDER BY total_reviews DESC NULLS LAST
    """
 
 
# ──────────────────────────────────────────────────────────────────────
# MOMENTUM SCORER
# Gives the current filter-context a 0-100 score
# ──────────────────────────────────────────────────────────────────────
 
def compute_momentum(cat_data: List[Dict], brand_data: List[Dict], band_data: List[Dict]) -> Tuple[int, str]:
    if not cat_data:
        return 0, "No data"
 
    def f(v): return float(v) if v is not None else 0.0
    total_reviews  = sum(f(r.get("total_reviews", 0)) for r in cat_data)
    avg_rating     = sum(f(r.get("avg_rating", 0)) for r in cat_data if r.get("avg_rating")) / max(len([r for r in cat_data if r.get("avg_rating")]), 1)
    total_listings = sum(f(r.get("listings", 0)) for r in cat_data)
    avg_sales      = sum(f(r.get("avg_sales", 0)) for r in cat_data if r.get("avg_sales")) / max(len([r for r in cat_data if r.get("avg_sales")]), 1)

    # Demand signal (reviews + sales)
    demand   = min(total_reviews / 20000, 1.0) * 35
    # Quality signal (avg rating)
    quality  = min(avg_rating / 5.0, 1.0) * 25
    # Market depth (listings variety)
    depth    = min(total_listings / 200, 1.0) * 20
    # Sales velocity
    velocity = min(avg_sales / 500, 1.0) * 20
 
    raw = demand + quality + depth + velocity
    score = round(raw)
    score = max(5, min(score, 98))   # never 0 or 100 — keeps it realistic
 
    label = (
        "🔥 Hot Market"      if score >= 80 else
        "📈 Strong Momentum" if score >= 65 else
        "⚡ Active Market"   if score >= 50 else
        "🌱 Growing"         if score >= 35 else
        "😴 Low Activity"
    )
    return score, label
 
 
# ──────────────────────────────────────────────────────────────────────
# MICRO-INSIGHT GENERATOR
# Derives 3 crisp data-driven facts from the raw query results
# ──────────────────────────────────────────────────────────────────────
 
def extract_micro_insights(cat_data: List[Dict], brand_data: List[Dict], band_data: List[Dict]) -> List[str]:
    insights = []
 
    # 1. Top category by reviews
    if cat_data:
        top = cat_data[0]
        cat_name = top.get("category_name", "Top category")
        reviews  = top.get("total_reviews", 0) or 0
        rating   = top.get("avg_rating", 0) or 0
        if reviews > 0:
            insights.append(
                f"**{cat_name}** leads with {int(reviews):,} total reviews "
                f"and a {rating}★ avg rating"
            )
 
    # 2. Best price band by demand
    if band_data:
        top_band = band_data[0]
        band_name  = top_band.get("price_band", "")
        band_rev   = top_band.get("total_reviews", 0) or 0
        band_list  = top_band.get("listings", 0) or 0
        if band_name and band_rev > 0:
            insights.append(
                f"**{band_name}** price range captures the most demand "
                f"({int(band_rev):,} reviews across {int(band_list):,} listings)"
            )
 
    # 3. Hidden gem — high rating, low reviews
    rated = [r for r in cat_data if r.get("avg_rating", 0) >= 4.2 and (r.get("total_reviews", 0) or 0) < 1000]
    if rated:
        gem = min(rated, key=lambda x: x.get("total_reviews", 9999999))
        gem_cat = gem.get("category_name", "")
        gem_rev = gem.get("total_reviews", 0) or 0
        gem_rat = gem.get("avg_rating", 0)
        if gem_cat:
            insights.append(
                f"**{gem_cat}** is an underexplored gem — {gem_rat}★ avg with only "
                f"{int(gem_rev):,} reviews (low competition signal)"
            )
 
    # 4. Quality gap — high sales, low rating
    for row in cat_data[:8]:
        sales  = row.get("avg_sales", 0) or 0
        rating = row.get("avg_rating", 0) or 0
        cat    = row.get("category_name", "")
        if sales > 200 and 0 < rating < 3.7 and cat:
            insights.append(
                f"**{cat}** sells ~{int(sales)} units/mo despite {rating}★ ratings "
                f"— quality gap opportunity"
            )
            break
 
    # 5. Brand concentration
    if brand_data and len(brand_data) >= 3:
        top3_reviews = sum(b.get("total_reviews", 0) or 0 for b in brand_data[:3])
        total_reviews = sum(b.get("total_reviews", 0) or 0 for b in brand_data)
        if total_reviews > 0:
            concentration = round((top3_reviews / total_reviews) * 100)
            top_brand = brand_data[0].get("brand", brand_data[0].get("category_name", "Top brand"))
            if concentration > 60:
                insights.append(
                    f"Market is concentrated — top 3 brands hold {concentration}% of reviews. "
                    f"**{top_brand}** dominates"
                )
            else:
                insights.append(
                    f"Market is fragmented — top 3 brands hold only {concentration}% of reviews. "
                    f"Entry opportunity exists"
                )
 
    return insights[:3]   # max 3
 
 
# ──────────────────────────────────────────────────────────────────────
# MASTER PROMPT — purpose-built for Decision Intelligence panel
# Designed to output structured sections the frontend can parse
# ──────────────────────────────────────────────────────────────────────
 
def build_intelligence_prompt(
    source:          str,
    platform:        str,
    filters:         Dict,
    cat_data:        List[Dict],
    brand_data:      List[Dict],
    band_data:       List[Dict],
    micro_insights:  List[str],
    momentum_score:  int,
    momentum_label:  str,
    context_summary: str,
) -> str:
 
    cat_json   = json.dumps(cat_data[:8],   indent=2, default=str)
    brand_json = json.dumps(brand_data[:6], indent=2, default=str)
    band_json  = json.dumps(band_data,      indent=2, default=str)
 
    micro_block = "\n".join(f"- {m}" for m in micro_insights)
 
    prompt = f"""You are Insydz, a senior e-commerce intelligence analyst for Indian marketplaces.
 
Platform: {platform}
Current filter context: {context_summary}
Momentum score: {momentum_score}/100 ({momentum_label})
 
Pre-computed data insights (use these as your foundation):
{micro_block}
 
Raw market data:
 
Category overview:
{cat_json}
 
Brand leaders:
{brand_json}
 
Price band distribution:
{band_json}
 
Your job: Write a structured intelligence brief in EXACTLY this format.
Do NOT deviate from the section headers. Do NOT add extra sections.
Use ₹ always. Be specific with numbers. Sound like a real analyst, not a bot.
Max 40 words per section. No bullet overload inside sections — use prose.
 
MARKET_PULSE:
[1-2 sentences: what the data shows about demand, pricing, and consumer behaviour right now]
 
OPPORTUNITY:
[1 sentence: the single most actionable opportunity in this data — be specific with category/price/numbers]
 
RISK:
[1 sentence: the biggest risk or red flag in this market right now]
 
VERDICT:
[1 sentence: the bottom-line recommendation — decisive, specific, no hedging]
"""
    return prompt
 
 
# ──────────────────────────────────────────────────────────────────────
# RESPONSE PARSER
# Extracts structured sections from the model's free-text output
# ──────────────────────────────────────────────────────────────────────
 
SECTION_PATTERN = re.compile(
    r"(MARKET_PULSE|OPPORTUNITY|RISK|VERDICT)\s*:\s*(.*?)(?=(?:MARKET_PULSE|OPPORTUNITY|RISK|VERDICT)\s*:|$)",
    re.IGNORECASE | re.DOTALL
)
 
BAD_OPENERS = re.compile(
    r"^(great|certainly|of course|absolutely|sure|hello|hi there|as an ai|i'?m an? ai)\b[^.]*[.!]?\s*",
    re.IGNORECASE
)
 
def parse_intelligence_response(raw: str) -> Dict[str, str]:
    raw = raw.strip()
    raw = BAD_OPENERS.sub("", raw).strip()
 
    result = {
        "market_pulse": "",
        "opportunity":  "",
        "risk":         "",
        "verdict":      "",
    }
 
    for match in SECTION_PATTERN.finditer(raw):
        key     = match.group(1).lower().replace("market_pulse", "market_pulse")
        content = match.group(2).strip()
        # Clean up any trailing section header noise
        content = content.split("\n\n")[0].strip()
        # Map key
        mapped = {
            "market_pulse": "market_pulse",
            "opportunity":  "opportunity",
            "risk":         "risk",
            "verdict":      "verdict",
        }.get(key.lower())
        if mapped:
            result[mapped] = content
 
    # Fallback — if parsing failed, slice the raw text
    if not any(result.values()):
        lines = [l.strip() for l in raw.split("\n") if len(l.strip()) > 20]
        result["market_pulse"] = lines[0] if len(lines) > 0 else "Market data analysed."
        result["opportunity"]  = lines[1] if len(lines) > 1 else "Review top categories for entry points."
        result["risk"]         = lines[2] if len(lines) > 2 else "Monitor competition levels closely."
        result["verdict"]      = lines[3] if len(lines) > 3 else "Focus on high-demand, lower-competition segments."
 
    return result
 
 
# ──────────────────────────────────────────────────────────────────────
# CONTEXT SUMMARY BUILDER
# Human-readable description of active filters
# ──────────────────────────────────────────────────────────────────────
 
def build_context_summary(filters: Dict, platform: str) -> str:
    parts = [platform]
    cat = filters.get("category", "")
    if cat and cat != "All Categories": parts.append(cat)
    pr = filters.get("priceRange", [0, 5_000_000])
    if pr[0] > 0 or pr[1] < 5_000_000:
        parts.append(f"₹{pr[0]:,}–₹{pr[1]:,}")
    rat = filters.get("rating", 0)
    if rat > 0: parts.append(f"{rat}★+")
    if filters.get("showTrendingOnly"): parts.append("Trending only")
    return " · ".join(parts)
 
 
# ──────────────────────────────────────────────────────────────────────
# OLLAMA CALL
# ──────────────────────────────────────────────────────────────────────
 
INTEL_OLLAMA_PARAMS = {
    "temperature":    0.55,    # more factual than the chatbot
    "top_p":          0.85,
    "top_k":          40,
    "repeat_penalty": 1.1,
    "num_predict":    350,
    "stop":           ["User:", "Question:", "Seller:"]
}
 
def call_ollama_intel(prompt: str) -> str:
    try:
        resp = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False, "options": INTEL_OLLAMA_PARAMS},
            timeout=90
        )
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except requests.exceptions.Timeout:
        return ""
    except Exception:
        return ""
 
 
# ──────────────────────────────────────────────────────────────────────
# MAIN ENDPOINT  —  POST /ai/intelligence
# ──────────────────────────────────────────────────────────────────────
 
@router.post("/ai/intelligence")
def get_intelligence(query: IntelligenceQuery, db: Session = Depends(get_db)):
 
    # ── Validate source ──
    raw_source = (query.source or "").lower().strip()
    if raw_source not in ("amazon", "flipkart"):
        raise HTTPException(400, f"Invalid source '{query.source}'.")
    source   = raw_source
    platform = "Flipkart" if source == "flipkart" else "Amazon"
 
    filters = query.filters or {}
 
    # ── Cache ──
    cache_key = f"intel:{source}:{json.dumps(filters, sort_keys=True)}"
    cached = r.get(cache_key)
    if cached:
        try:
            data = json.loads(cached)
            data["cached"] = True
            return data
        except Exception:
            pass
 
    # ── Build WHERE clause ──
    where = _where(filters, source)
 
    # ── Run 3 queries in parallel ──
    sql_cat   = _sql_category_overview(source, where)
    sql_brand = _sql_brand_leaders(source, where)
    sql_band  = _sql_price_bands(source, where)
 
    cat_data = brand_data = band_data = []
    try:
        cat_data   = [dict(r._mapping) for r in db.execute(text(sql_cat)).all()]
        brand_data = [dict(r._mapping) for r in db.execute(text(sql_brand)).all()]
        band_data  = [dict(r._mapping) for r in db.execute(text(sql_band)).all()]
    except Exception as e:
        raise HTTPException(500, f"Database error: {str(e)}")
 
    total_rows = len(cat_data) + len(brand_data) + len(band_data)
 
    if total_rows == 0:
        # Return a graceful no-data response
        return {
            "market_pulse":    "No data found for the current filter combination.",
            "opportunity":     "Try broadening your filters to surface opportunities.",
            "risk":            "Insufficient data to assess risk.",
            "verdict":         "Adjust filters and try again.",
            "micro_insights":  [],
            "momentum_score":  0,
            "momentum_label":  "No Data",
            "context_summary": build_context_summary(filters, platform),
            "cached":          False,
            "data_rows":       0,
        }
 
    # ── Compute derived metrics ──
    momentum_score, momentum_label = compute_momentum(cat_data, brand_data, band_data)
    micro_insights  = extract_micro_insights(cat_data, brand_data, band_data)
    context_summary = build_context_summary(filters, platform)
 
    # ── Build prompt and call model ──
    prompt = build_intelligence_prompt(
        source=source, platform=platform, filters=filters,
        cat_data=cat_data, brand_data=brand_data, band_data=band_data,
        micro_insights=micro_insights, momentum_score=momentum_score,
        momentum_label=momentum_label, context_summary=context_summary,
    )
 
    raw_response = call_ollama_intel(prompt)
    parsed       = parse_intelligence_response(raw_response)
 
    # Fallback to micro_insights if model returned nothing useful
    if not parsed["market_pulse"] and micro_insights:
        parsed["market_pulse"] = micro_insights[0].replace("**", "")
    if not parsed["opportunity"] and len(micro_insights) > 1:
        parsed["opportunity"] = micro_insights[1].replace("**", "")
    if not parsed["opportunity"] and micro_insights:
        parsed["opportunity"] = micro_insights[0].replace("**", "")
    if not parsed["risk"]:
        # Build a data-driven risk from what we know
        top_cat = cat_data[0].get("category_name", "this market") if cat_data else "this market"
        top_reviews = int(float(cat_data[0].get("total_reviews", 0) or 0)) if cat_data else 0
        parsed["risk"] = f"{top_cat} has {top_reviews:,} existing reviews — established sellers have a strong head start. New entrants need a clear quality or price differentiator to break through."
    if not parsed["verdict"]:
        if micro_insights:
            parsed["verdict"] = micro_insights[-1].replace("**", "")
        else:
            parsed["verdict"] = "Focus on the highest-demand, lowest-competition segment in the data signals above."
    # ── Build response ──
    result = {
        "market_pulse":    parsed["market_pulse"],
        "opportunity":     parsed["opportunity"],
        "risk":            parsed["risk"],
        "verdict":         parsed["verdict"],
        "micro_insights":  micro_insights,
        "momentum_score":  momentum_score,
        "momentum_label":  momentum_label,
        "context_summary": context_summary,
        "cached":          False,
        "data_rows":       total_rows,
    }
 
    # Cache for 20 minutes
    result = sanitize_data(result)
    r.setex(cache_key, 1200, json.dumps(result))
 
    return result
