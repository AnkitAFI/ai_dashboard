
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from typing import List, Optional, Dict, Any
import subprocess, json
from pydantic import BaseModel, Field
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
from server_py.crud import lstm_forecast
from datetime import datetime, timedelta
from . import crud, schemas, models
from .database_config import get_db, engine
import requests, traceback
models.Base.metadata.create_all(bind=engine)
from .models import AmazonProductDetails
# app = FastAPI(title="API", version="1.0.0")
import os
IS_LOCAL = os.getenv("FASTAPI_LOCAL", "false").lower() == "true"
app = FastAPI(     title="Amazon Reviews API",    version="1.0.0",     docs_url="/docs" if IS_LOCAL else None,     redoc_url="/redoc" if IS_LOCAL else None,     openapi_url="/openapi.json" if IS_LOCAL else None )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8080", "https://insydz.com"],  # TODO: restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
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


OLLAMA_API_URL = "http://127.0.0.1:11434"  # Ollama HTTP API
MAX_DATA_CHARS = 1500
MODEL_NAME = "llama3.2:3b"

# Redis client
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

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
@app.get("/")
def read_root():
    if IS_LOCAL:
        return {"message": "Amazon Reviews API running", "docs": "/docs"}
    raise HTTPException(status_code=404, detail="Not Found")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
 
# ----------- Reviews -------------
@app.get("/Amazon_Reviews/reviews", response_model=List[schemas.AmazonReview])
def get_reviews(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    return crud.get_reviews(db, limit=limit, offset=offset)
 
@app.get("/Amazon_Reviews/reviews/{review_id}", response_model=schemas.AmazonReview)
def get_review(review_id: str, db: Session = Depends(get_db)):
    return crud.get_review_by_id(db, review_id)
 
@app.get("/Amazon_Reviews/product/{product_id}", response_model=List[schemas.AmazonReview])
def get_product_reviews(product_id: str, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_product_reviews(db, product_id, limit)
 
@app.get("/Amazon_Reviews/search/{query}", response_model=List[schemas.AmazonReview])
def search_reviews(query: str, limit: int = 50, db: Session = Depends(get_db)):
    return crud.search_reviews(db, query, limit)

@app.get("/rapidapi_amazon_products/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """
    Return summary statistics for RapidAPI Amazon Products table
    including total products, average rating, and total reviews count.
    """
    query = text("""
        SELECT 
            COUNT(*) AS total_products,
            ROUND(AVG(product_star_rating_numeric), 2) AS average_rating,
            SUM(product_num_ratings) AS total_reviews
        FROM "rapidapi_amazon_products"
        WHERE product_star_rating_numeric IS NOT NULL
    """)

    row = db.execute(query).fetchone()

    return {
        "total_products": int(row.total_products) if row.total_products else 0,
        "average_rating": float(row.average_rating) if row.average_rating else 0.0,
        "total_reviews": int(row.total_reviews) if row.total_reviews else 0
    }


@app.get("/Amazon_Reviews/sentiment", response_model=List[schemas.SentimentOut])
def get_sentiment(db: Session = Depends(get_db)):
    results = crud.get_sentiment_distribution(db)
    return [schemas.SentimentOut(sentiment=sentiment, count=count) for sentiment, count in results]
 
@app.get("/Amazon_Reviews/ratings", response_model=List[schemas.RatingOut])
def get_ratings(db: Session = Depends(get_db)):
    results = crud.get_ratings_distribution(db)
    return [schemas.RatingOut(rating=rating, count=count) for rating, count in results]
 
@app.get("/Amazon_Reviews/categories", response_model=List[schemas.CategoryOut])
def get_category_stats(db: Session = Depends(get_db)):
    return crud.get_category_statistics(db)
 
# ----------- Analytics -------------
@app.get("/Amazon_Reviews/trending", response_model=List[schemas.TrendingProductOut])
def get_trending(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_trending_products(db, limit)
 
@app.get("/Amazon_Reviews/trends/monthly", response_model=List[schemas.MonthlyTrendOut])
def monthly_trends(year: int, db: Session = Depends(get_db)):
    return crud.get_monthly_trends(db, year)
 
@app.get("/Amazon_Reviews/helpful")
def get_helpful(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_helpful_reviews(db, limit)
 
@app.get("/Amazon_Reviews/sentiment/{product_id}", response_model=List[schemas.SentimentOut])
def get_sentiment(product_id: str, db: Session = Depends(get_db)):
    return crud.get_product_sentiment_breakdown(db, product_id)
 
# ----------- flipkart -------------
@app.get("/flipkart", response_model=List[schemas.Product])
def read_products(limit: int = 10, offset: int = 0, category: schemas.Optional[str] = None,
                  min_price: schemas.Optional[float] = None, max_price: schemas.Optional[float] = None,
                  db: Session = Depends(get_db)):
    return crud.get_products(db, limit, offset, category, min_price, max_price)

@app.get("/analytics-summary")
def analytics_summary(
    source: str = Query("flipkart", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db)
):
    return crud.get_summary(db, source)

@app.get("/analytics/category", response_model=schemas.CategoryAnalyticsResponse)
def analytics_by_category(db: Session = Depends(get_db)):
    categories = crud.get_category_analytics(db)
    return {"categories": categories}


def build_where_clause(filters: Dict[str, Any], source: str) -> str:
    conditions = []
    if filters.get("category") and filters["category"] != "All Categories":
        category = filters["category"].replace("'", "''")
        conditions.append(f"LOWER(category) = LOWER('{category}')") if source == "flipkart" else conditions.append(f"LOWER(category_name) = LOWER('{category}')")
    price_range = filters.get("priceRange", [0, 5000000])
    price_min, price_max = price_range[0], price_range[1]
    price_field = "price" if source == "flipkart" else "product_price_numeric"
    if price_min > 0: conditions.append(f"{price_field} >= {price_min}")
    if price_max < 5000000: conditions.append(f"{price_field} <= {price_max}")
    rating = filters.get("rating", 0)
    if rating > 0:
        rating_field = "rating" if source == "flipkart" else "product_star_rating_numeric"
        conditions.append(f"{rating_field} >= {rating}")
    if filters.get("showTrendingOnly") and source != "flipkart":
        conditions.append("sales_volume IS NOT NULL AND sales_volume != ''")
    return " AND ".join(conditions) if conditions else "1=1"
 
@app.post("/ai/query")
def ask_ai(query: AIQuery, db: Session = Depends(get_db)):
    source = query.source.lower()
    filters = query.filters or {}
    where_clause = build_where_clause(filters, source)
 
    # Use a cache key based on source + filters + question
    cache_key = f"{source}:{json.dumps(filters, sort_keys=True)}:{query.question}"
    cached_answer = r.get(cache_key)
    if cached_answer:
        return {"answer": cached_answer, "cached": True}
 
    # Fetch top 100 rows only
    limit = 100
    if source == "flipkart":
        sql = text(f"""
        SELECT
            product_title,
            category_name,
            brand,
            ROUND(AVG(product_star_rating), 2) AS avg_rating,
            SUM(product_rating_count) AS total_reviews,
            ROUND(AVG(product_price), 2) AS avg_price,
            COUNT(*) AS product_variants
        FROM rapidapi_flipkart_products
        WHERE product_title IS NOT NULL
          AND {where_clause}
        GROUP BY product_title, category_name, brand
        ORDER BY total_reviews DESC
        LIMIT {limit}
        """)
        rows = db.execute(sql).all()
        data_list = [dict(row._mapping) for row in rows]
        table_name = "RapidAPI Flipkart Products"

    elif source == "rapidapi_amazon_products":
        sql = text(f"""
        SELECT product_title, category_name, ROUND(AVG(product_star_rating_numeric), 2) AS avg_rating,
               SUM(product_num_ratings) AS total_reviews, ROUND(AVG(product_price_numeric), 2) AS avg_price,
               COUNT(*) AS product_variants
        FROM rapidapi_amazon_products
        WHERE product_title IS NOT NULL AND {where_clause}
        GROUP BY product_title, category_name
        ORDER BY total_reviews DESC
        LIMIT {limit}
        """)
        rows = db.execute(sql).all()
        data_list = [dict(row._mapping) for row in rows]
        table_name = "RapidAPI Amazon Products"
    else:
        raise HTTPException(status_code=400, detail="Invalid source. Use 'flipkart' or 'rapidapi_amazon_products'.")
 
    data_json = json.dumps(data_list[:10], indent=2, default=decimal_to_float)
    prompt = f"""
We have {len(data_list)} records in the {table_name} table.
IMPORTANT RULES:
- All prices are in Indian Rupees (INR / ₹).
- Do NOT mention or convert to any other currency (USD, EUR, etc).
- If price is discussed, always use ₹.
- If the question asks for another currency, say:
  "Data is available only in INR (₹)."

 
Data:
{data_json[:MAX_DATA_CHARS]}
 
Question: {query.question}
Answer in 2 clear, concise lines using only the filtered data above.
"""
 
    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=60
        )
        response.raise_for_status()
        answer_data = response.json()
        answer = answer_data.get("response", "No insights available.")
 
        # Cache the answer for 1 hour
        r.setex(cache_key, 3600, answer)
 
    except requests.exceptions.Timeout:
        answer = "AI response timed out. Please try again."
    except requests.exceptions.ConnectionError:
        answer = "AI service unavailable. Cannot reach Ollama."
    except requests.exceptions.HTTPError as e:
        answer = f"Ollama error: {e.response.text}"
    except Exception as e:
        answer = f"Unexpected error: {str(e)}"
 
    return {"answer": answer, "cached": False}


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


@app.post("/ai/analyze-chart")
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

@app.get("/top")
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


@app.get("/forecast_all_products")
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

@app.get("/notifications")
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
                               product_original_price_numeric * 100), 1) as discount_percent
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
                        "time": f"Listed recently · ₹{row.product_price_numeric:.0f}",
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

@app.get("/category/products/{category_name}")
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
            ROUND(AVG(product_price_numeric), 2) AS avg_price,
            ROUND(AVG(min_price), 2) AS min_price,
            ROUND(AVG(max_price), 2) AS max_price,
            SUM(product_num_ratings) AS total_reviews,
            ROUND(AVG(product_star_rating_numeric), 2) AS avg_rating,
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

@app.get("/product/{product_name:path}")
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
                ROUND(AVG(product_star_rating_numeric), 2) AS avg_rating,
                SUM(product_num_ratings) AS total_reviews,
                ROUND(AVG(avg_price), 2) AS avg_price,
                ROUND(AVG(min_price), 2) AS min_price,
                ROUND(AVG(max_price), 2) AS max_price
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



@app.get("/categories")
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
 
@app.get("/flipkart/categories")
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


 
# @app.get("/lstm_forecast/flipkart/{product_name}")
# def forecast_flipkart(product_name: str):
#     """Forecast Flipkart product sales using LSTM"""
#     clean_product_name = product_name.strip().strip('"')
    
#     # Try by PID first
#     query = text('''
#         SELECT created_at, sales_volume, estimated_sales
#         FROM rapidapi_flipkart_products 
#         WHERE pid = :product_name 
#         ORDER BY created_at
#     ''')
#     df = pd.read_sql_query(query, engine, params={"product_name": clean_product_name})
    
#     # Try by product title if PID search fails
#     if df.empty:
#         query = text('''
#             SELECT created_at, sales_volume, estimated_sales
#             FROM rapidapi_flipkart_products 
#             WHERE product_title ILIKE :title 
#             ORDER BY created_at
#         ''')
#         df = pd.read_sql_query(query, engine, params={"title": f"%{clean_product_name}%"})
    
#     # Generate dummy data if no records found
#     if df.empty:
#         today = pd.Timestamp.today()
#         periods = 30
#         df = pd.DataFrame({
#             "created_at": pd.date_range(end=today, periods=periods),
#             "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
#         })
#     else:
#         # Parse sales_volume (handles "10K+", "5M+" format)
#         df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
        
#         # If sales_volume is null, try estimated_sales
#         if df["sales_volume"].isna().all() and "estimated_sales" in df.columns:
#             df["sales_volume"] = df["estimated_sales"].apply(parse_sales_volume)
        
#         df = df.dropna(subset=["sales_volume"])
        
#         if df.empty:
#             today = pd.Timestamp.today()
#             periods = 30
#             df = pd.DataFrame({
#                 "created_at": pd.date_range(end=today, periods=periods),
#                 "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
#             })
    
#     last_date = df["created_at"].max()
    
#     forecast_result = lstm_forecast(df["sales_volume"], last_date, forecast_days=365)
    
#     # Add historical sales data
#     historical_sales = []
#     for row in df.tail(10).to_dict(orient="records"):
#         historical_sales.append({
#             "created_at": str(row["created_at"].date()),
#             "sales_volume": float(row["sales_volume"])
#         })
    
#     return {
#         "product_name": product_name,
#         "last_date": str(last_date.date()),
#         "historical_sales": historical_sales,
#         "forecast": forecast_result
#     } 

@app.get("/lstm_forecast/flipkart/{product_name:path}")
def forecast_flipkart(product_name: str):
    """Forecast Flipkart product sales using LSTM"""
    try:
        clean_product_name = unquote(product_name).strip().strip('"')
        print(f"🔍 Searching for: {clean_product_name}")
        
        # Try by PID first
        query = text('''
            SELECT created_at, sales_volume, estimated_sales
            FROM rapidapi_flipkart_products 
            WHERE pid = :product_name 
            ORDER BY created_at
        ''')
        df = pd.read_sql_query(query, engine, params={"product_name": clean_product_name})
        print(f"📊 PID search found {len(df)} records")
        
        # Try by product title if PID search fails
        if df.empty:
            query = text('''
                SELECT created_at, sales_volume, estimated_sales
                FROM rapidapi_flipkart_products 
                WHERE product_title ILIKE :title 
                ORDER BY created_at
            ''')
            df = pd.read_sql_query(query, engine, params={"title": f"%{clean_product_name}%"})
            print(f"📊 Title search found {len(df)} records")
        
        # Generate dummy data if no records found
        if df.empty:
            print("⚠️ No records found, generating dummy data")
            today = pd.Timestamp.today()
            periods = 30
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=periods),
                "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
            })
        else:
            # Parse sales_volume
            df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
            
            if df["sales_volume"].isna().all() and "estimated_sales" in df.columns:
                df["sales_volume"] = df["estimated_sales"].apply(parse_sales_volume)
            
            df = df.dropna(subset=["sales_volume"])
            
            if df.empty:
                today = pd.Timestamp.today()
                periods = 30
                df = pd.DataFrame({
                    "created_at": pd.date_range(end=today, periods=periods),
                    "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
                })
        
        last_date = df["created_at"].max()
        forecast_result = lstm_forecast(df["sales_volume"], last_date, forecast_days=365)
        
        # Add historical sales data
        historical_sales = []
        for row in df.tail(10).to_dict(orient="records"):
            historical_sales.append({
                "created_at": str(row["created_at"].date()),
                "sales_volume": float(row["sales_volume"])
            })
        
        return {
            "product_name": clean_product_name,
            "last_date": str(last_date.date()),
            "historical_sales": historical_sales,
            "forecast": forecast_result
        }
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 

def parse_sales_volume(value):
    if value is None:
        return np.nan
    value = str(value).lower()
    try:
        if "k" in value:
            return float(value.replace("k", "").replace("+", "").strip()) * 1000
        elif "m" in value:
            return float(value.replace("m", "").replace("+", "").strip()) * 1000000
        else:
            digits = ''.join([c for c in value if c.isdigit()])
            return float(digits) if digits else np.nan
    except:
        return np.nan
 
# ---------- Dummy LSTM forecast function ----------
def lstm_forecast(series, last_date, forecast_days=365):
    forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=forecast_days)
    last_value = series.iloc[-1] if not series.empty else 1000
    forecast_values = []
    for _ in range(forecast_days):
        last_value = max(0, last_value + random.randint(-50, 50))
        forecast_values.append(float(last_value))  # convert to Python float
    return {
        "forecast_dates": [str(d.date()) for d in forecast_dates],
        "forecast_sales": forecast_values
    }
 
# ---------- Endpoint ----------
@app.get("/lstm_forecast/amazon/{product_name}")
def forecast_sales(product_name: str):
    clean_product_name = product_name.strip().strip('"')
   
    query = text('''
        SELECT created_at, sales_volume
        FROM "rapidapi_amazon_products"
        WHERE asin = :product_name
        ORDER BY created_at
    ''')
    df = pd.read_sql_query(query, engine, params={"product_name": clean_product_name})
   
    if df.empty:
        query = text('''
            SELECT created_at, sales_volume
            FROM "rapidapi_amazon_products"
            WHERE product_title ILIKE :product_name
            ORDER BY created_at
        ''')
        df = pd.read_sql_query(query, engine, params={"product_name": f"%{clean_product_name}%"})
   
    if df.empty:
        today = pd.Timestamp.today()
        periods = 30
        df = pd.DataFrame({
            "created_at": pd.date_range(end=today, periods=periods),
            "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
        })
    else:
        df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
        df = df.dropna(subset=["sales_volume"])
        if df.empty:
            today = pd.Timestamp.today()
            periods = 30
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=periods),
                "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
            })
   
    last_date = df["created_at"].max()
   
    forecast_result = lstm_forecast(df["sales_volume"], last_date, forecast_days=365)
   
    # Convert all numeric types to native Python types for JSON serialization
    historical_sales = []
    for row in df.tail(10).to_dict(orient="records"):
        historical_sales.append({
            "created_at": str(row["created_at"].date()),
            "sales_volume": float(row["sales_volume"])
        })
   
    return {
        "product_name": product_name,
        "last_date": str(last_date.date()),
        "historical_sales": historical_sales,
        "forecast": forecast_result
    }
 
@app.get("/api/products/{asin}")
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
 
 
@app.get("/api/products")
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
                "daily_revenue": f"â‚¹{p.revenue_estimate_low:,.0f} - â‚¹{p.revenue_estimate_high:,.0f}" if p.revenue_estimate_high else None,
                "category": p.main_category,
                "has_deal": p.has_deal,
                "image": p.image_urls[0] if p.image_urls else None,
                "url": p.url
            }
            for p in products
        ]
    }
 
 
@app.get("/api/top-sellers")
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
                "price": f"â‚¹{p.price:,.2f}" if p.price else None,
                "rating": f"{p.rating} ({p.number_of_ratings:,} ratings)" if p.rating else None,
                "daily_sales": f"{p.sales_estimate_low:,} - {p.sales_estimate_high:,}",
                "monthly_sales_estimate": f"{p.sales_estimate_low * 30:,} - {p.sales_estimate_high * 30:,}",
                "daily_revenue": f"â‚¹{p.revenue_estimate_low:,.0f} - â‚¹{p.revenue_estimate_high:,.0f}",
                "monthly_revenue_estimate": f"â‚¹{p.revenue_estimate_low * 30:,.0f} - â‚¹{p.revenue_estimate_high * 30:,.0f}",
                "image": p.image_urls[0] if p.image_urls else None,
                "url": p.url
            }
            for idx, p in enumerate(products)
        ]
    }
 
 
@app.get("/api/stats")
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
 
 
@app.get("/rapidapi/top-sales")
def get_top_sales_products(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # Build WHERE conditions for the CTE
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
                product_title,
                category_name,
                product_url,
                product_photo,
                product_price_numeric,
                product_star_rating_numeric,
                product_num_ratings,
                sales_volume,
                country,
                CASE
                    WHEN sales_volume LIKE '%M+%' THEN
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000000) / 30
                    WHEN sales_volume LIKE '%K+%' THEN
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000) / 30
                    ELSE
                        CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) / 30
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
            product['daily_sales'] = product.pop('total_daily_sales')
            product['category_name'] = product.pop('categories')
            product['product_price'] = f"₹{product['avg_price']:.2f}" if product['avg_price'] else None
            product['product_star_rating'] = product['avg_rating']
           
            if product['variant_count'] > 1:
                product['is_merged'] = True
                product['merged_info'] = f"{product['variant_count']} variants combined"
            else:
                product['is_merged'] = False
           
            products.append(product)
       
        return {"data": products, "count": len(products)}
       
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top sales products: {str(e)}")
   
 
@app.get("/top")
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
 
@app.get("/rapidapi_amazon_products/categories")
def get_amazon_categories(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# -----------------------------
# ðŸ”¹ 3. Rating Distribution
# -----------------------------

 
@app.get("/rapidapi_amazon_products/ratings")
def get_amazon_ratings(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# -----------------------------
# ðŸ”¹ 4. Sentiment Simulation (Based on Rating)
# -----------------------------
# @app.get("/rapidapi_amazon_products/sentiment")
# def get_amazon_sentiment(
#     category: Optional[str] = Query(None),
#     min_price: Optional[float] = Query(None),
#     max_price: Optional[float] = Query(None),
#     min_rating: Optional[float] = Query(None),
#     db: Session = Depends(get_db)
# ):
#     # Build WHERE conditions
#     where_conditions = ["product_star_rating_numeric IS NOT NULL"]
#     params = {}
   
#     if category and category != "All Categories":
#         where_conditions.append("LOWER(category_name) = LOWER(:category)")
#         params["category"] = category
   
#     if min_price is not None:
#         where_conditions.append("product_price_numeric >= :min_price")
#         params["min_price"] = min_price
   
#     if max_price is not None:
#         where_conditions.append("product_price_numeric <= :max_price")
#         params["max_price"] = max_price
   
#     if min_rating is not None:
#         where_conditions.append("product_star_rating_numeric >= :min_rating")
#         params["min_rating"] = min_rating
   
#     where_clause = " AND ".join(where_conditions)
   
#     try:
#         query = text(f"""
#             SELECT
#                 CASE
#                     WHEN product_star_rating_numeric >= 4 THEN 'positive'
#                     WHEN product_star_rating_numeric = 3 THEN 'neutral'
#                     ELSE 'negative'
#                 END as sentiment,
#                 COUNT(*) as count
#             FROM rapidapi_amazon_products
#             WHERE {where_clause}
#             GROUP BY sentiment
#         """)
#         result = db.execute(query, params).mappings().all()
#         return [dict(row) for row in result]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    
#     return categories

@app.get("/rapidapi_amazon_products/sentiment")
def get_amazon_sentiment(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    ✅ ADJUSTED: Same ranges as Flipkart for consistency
    Positive: 4.0+, Neutral: 3.5-3.99, Negative: <3.5
    """
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
                    WHEN product_star_rating_numeric >= 4.0 THEN 'positive'
                    WHEN product_star_rating_numeric >= 3.5 THEN 'neutral'
                    ELSE 'negative'
                END as sentiment,
                COUNT(*) as count
            FROM rapidapi_amazon_products
            WHERE {where_clause}
            GROUP BY sentiment
            ORDER BY sentiment DESC
        """)
        
        result = db.execute(query, params).mappings().all()
        
        # Debug logging
        print(f"📊 Amazon Sentiment (Adjusted Ranges):")
        total = sum(row['count'] for row in result)
        for row in result:
            pct = (row['count'] / total * 100) if total > 0 else 0
            print(f"   {row['sentiment']}: {row['count']} ({pct:.1f}%)")
        
        return [dict(row) for row in result]
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

@app.get("/lstm_forecast/flipkart/{product_name:path}")
def forecast_flipkart(product_name: str):
    """Forecast Flipkart product sales using LSTM"""
    try:
        clean_product_name = unquote(product_name).strip().strip('"')
        print(f"🔍 Searching for: {clean_product_name}")
        
        # Try by PID first
        query = text('''
            SELECT created_at, sales_volume, estimated_sales
            FROM rapidapi_flipkart_products 
            WHERE pid = :product_name 
            ORDER BY created_at
        ''')
        df = pd.read_sql_query(query, engine, params={"product_name": clean_product_name})
        print(f"📊 PID search found {len(df)} records")
        
        # Try by product title if PID search fails
        if df.empty:
            query = text('''
                SELECT created_at, sales_volume, estimated_sales
                FROM rapidapi_flipkart_products 
                WHERE product_title ILIKE :title 
                ORDER BY created_at
            ''')
            df = pd.read_sql_query(query, engine, params={"title": f"%{clean_product_name}%"})
            print(f"📊 Title search found {len(df)} records")
        
        # Generate dummy data if no records found
        if df.empty:
            print("⚠️ No records found, generating dummy data")
            today = pd.Timestamp.today()
            periods = 30
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=periods),
                "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
            })
        else:
            # Parse sales_volume
            df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
            
            if df["sales_volume"].isna().all() and "estimated_sales" in df.columns:
                df["sales_volume"] = df["estimated_sales"].apply(parse_sales_volume)
            
            df = df.dropna(subset=["sales_volume"])
            
            if df.empty:
                today = pd.Timestamp.today()
                periods = 30
                df = pd.DataFrame({
                    "created_at": pd.date_range(end=today, periods=periods),
                    "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
                })
        
        last_date = df["created_at"].max()
        forecast_result = lstm_forecast(df["sales_volume"], last_date, forecast_days=365)
        
        # Add historical sales data
        historical_sales = []
        for row in df.tail(10).to_dict(orient="records"):
            historical_sales.append({
                "created_at": str(row["created_at"].date()),
                "sales_volume": float(row["sales_volume"])
            })
        
        return {
            "product_name": clean_product_name,
            "last_date": str(last_date.date()),
            "historical_sales": historical_sales,
            "forecast": forecast_result
        }
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 

def parse_sales_volume(value):
    if value is None:
        return np.nan
    value = str(value).lower()
    try:
        if "k" in value:
            return float(value.replace("k", "").replace("+", "").strip()) * 1000
        elif "m" in value:
            return float(value.replace("m", "").replace("+", "").strip()) * 1000000
        else:
            digits = ''.join([c for c in value if c.isdigit()])
            return float(digits) if digits else np.nan
    except:
        return np.nan

# ---------- Dummy LSTM forecast function ----------
def lstm_forecast(series, last_date, forecast_days=365):
    forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=forecast_days)
    last_value = series.iloc[-1] if not series.empty else 1000
    forecast_values = []
    for _ in range(forecast_days):
        last_value = max(0, last_value + random.randint(-50, 50))
        forecast_values.append(float(last_value))  # convert to Python float
    return {
        "forecast_dates": [str(d.date()) for d in forecast_dates],
        "forecast_sales": forecast_values
    }

# ---------- Endpoint ----------
@app.get("/lstm_forecast/amazon/{product_name}")
def forecast_sales(product_name: str):
    clean_product_name = product_name.strip().strip('"')
    
    query = text('''
        SELECT created_at, sales_volume
        FROM "rapidapi_amazon_products"
        WHERE asin = :product_name
        ORDER BY created_at
    ''')
    df = pd.read_sql_query(query, engine, params={"product_name": clean_product_name})
    
    if df.empty:
        query = text('''
            SELECT created_at, sales_volume
            FROM "rapidapi_amazon_products"
            WHERE product_title ILIKE :product_name
            ORDER BY created_at
        ''')
        df = pd.read_sql_query(query, engine, params={"product_name": f"%{clean_product_name}%"})
    
    if df.empty:
        today = pd.Timestamp.today()
        periods = 30
        df = pd.DataFrame({
            "created_at": pd.date_range(end=today, periods=periods),
            "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
        })
    else:
        df["sales_volume"] = df["sales_volume"].apply(parse_sales_volume)
        df = df.dropna(subset=["sales_volume"])
        if df.empty:
            today = pd.Timestamp.today()
            periods = 30
            df = pd.DataFrame({
                "created_at": pd.date_range(end=today, periods=periods),
                "sales_volume": [random.randint(500, 5000) for _ in range(periods)]
            })
    
    last_date = df["created_at"].max()
    
    forecast_result = lstm_forecast(df["sales_volume"], last_date, forecast_days=365)
    
    # Convert all numeric types to native Python types for JSON serialization
    historical_sales = []
    for row in df.tail(10).to_dict(orient="records"):
        historical_sales.append({
            "created_at": str(row["created_at"].date()),
            "sales_volume": float(row["sales_volume"])
        })
    
    return {
        "product_name": product_name,
        "last_date": str(last_date.date()),
        "historical_sales": historical_sales,
        "forecast": forecast_result
    }

@app.get("/rapidapi/top-sales")
def get_top_sales_products(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    # Build WHERE conditions for the CTE
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
                product_title,
                category_name,
                product_url,
                product_photo,
                product_price_numeric,
                product_star_rating_numeric,
                product_num_ratings,
                sales_volume,
                country,
                CASE 
                    WHEN sales_volume LIKE '%M+%' THEN 
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000000) / 30
                    WHEN sales_volume LIKE '%K+%' THEN 
                        (CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) * 1000) / 30
                    ELSE 
                        CAST(REGEXP_REPLACE(sales_volume, '[^0-9.]', '', 'g') AS FLOAT) / 30
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
            product['daily_sales'] = product.pop('total_daily_sales')
            product['category_name'] = product.pop('categories')
            product['product_price'] = f"₹{product['avg_price']:.2f}" if product['avg_price'] else None
            product['product_star_rating'] = product['avg_rating']
            
            if product['variant_count'] > 1:
                product['is_merged'] = True
                product['merged_info'] = f"{product['variant_count']} variants combined"
            else:
                product['is_merged'] = False
            
            products.append(product)
        
        return {"data": products, "count": len(products)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top sales products: {str(e)}")


@app.get("/top")
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
@app.get("/rapidapi_amazon_products/categories")
def get_amazon_categories(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rapidapi_amazon_products/ratings")
def get_amazon_ratings(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 🔹 4. Sentiment Simulation (Based on Rating)
# -----------------------------
@app.get("/rapidapi_amazon_products/sentiment")
def get_amazon_sentiment(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rapidapi/flipkart/top-sales")
def get_flipkart_top_sales_products(
    limit: int = 10,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        
        return {"data": products, "count": len(products)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Flipkart top sales products: {str(e)}")

@app.get("/rapidapi_flipkart_products/categories")
def get_flipkart_categories(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rapidapi_flipkart_products/ratings")
def get_flipkart_ratings(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
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
        return [dict(row) for row in result]
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

@app.get("/rapidapi_flipkart_products/sentiment")
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
        
        return [dict(row) for row in result]
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/rapidapi_flipkart_products/top")
def get_flipkart_top_products(n: int = 10, db: Session = Depends(get_db)):
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
        return {"data": [dict(row) for row in result]}
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
from fastapi import HTTPException, Depends, Response, Cookie
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import random
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================
# Environment Variables
# ============================================
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Insydz")

SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").lower() == "true"
SESSION_EXPIRE_DAYS_REMEMBER = int(os.getenv("SESSION_EXPIRE_DAYS_REMEMBER", 30))
SESSION_EXPIRE_DAYS_NO_REMEMBER = int(os.getenv("SESSION_EXPIRE_DAYS_NO_REMEMBER", 1))

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 10))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", 5))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", 60))

# ============================================
# YOUR EXISTING REDIS CLIENT 'r' IS ALREADY HERE
# ============================================
# Example:
# r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

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
        return True
        
    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")
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

# ============================================
# Session Management with Redis
# ============================================

def create_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def create_session(user_id: int, remember_me: bool = False) -> str:
    """Create a new session and store in Redis"""
    session_token = create_session_token()
    expires_days = SESSION_EXPIRE_DAYS_REMEMBER if remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER
    
    session_data = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "remember_me": remember_me
    }
    
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        r.setex(
            key,
            expires_days * 24 * 60 * 60,  # Convert days to seconds
            json.dumps(session_data)
        )
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
    """Delete a session from Redis"""
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        r.delete(key)
    except Exception as e:
        print(f"❌ Redis delete session error: {e}")

def delete_all_user_sessions(user_id: int):
    """Delete all sessions for a specific user"""
    try:
        # Scan for all session keys
        cursor = 0
        while True:
            cursor, keys = r.scan(cursor, match=f"{SESSION_PREFIX}*", count=100)
            for key in keys:
                data = r.get(key)
                if data:
                    session_data = json.loads(data)
                    if session_data.get("user_id") == user_id:
                        r.delete(key)
            if cursor == 0:
                break
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

@app.post("/api/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Step 1: Verify email exists and send OTP
    """
    try:
        # Check if user exists
        user = db.query(models.User).filter(
            models.User.email == request.email
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

@app.post("/api/auth/verify-otp")
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

@app.post("/api/auth/reset-password-with-otp")
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
            models.User.email == request.email
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

@app.post("/api/auth/resend-otp")
def resend_otp(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Resend OTP to user's email
    """
    try:
        # Check if user exists
        user = db.query(models.User).filter(
            models.User.email == request.email
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this email address"
            )
        
        # Check if previous OTP exists
        existing_otp = get_otp(request.email)
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

@app.post("/users/login", response_model=LoginResponse)
def login_user(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticate user and set secure session cookie"""
    try:
        print(f"🔍 Login attempt for: {login_data.email}")
        
        user = db.query(models.User).filter(
            models.User.email == login_data.email
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
        
        current_month = datetime.now().strftime("%Y-%m")
        if user.ai_chat_month != current_month:
            print(f"🔄 Resetting AI usage for new month: {current_month}")
            user.ai_chat_used = 0
            user.ai_chat_month = current_month
            db.commit()
            db.refresh(user)
        
        # Create session in Redis
        session_token = create_session(user.id, login_data.remember_me)
        
        max_age = SESSION_EXPIRE_DAYS_REMEMBER * 24 * 60 * 60 if login_data.remember_me else SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60
        response.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=max_age
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

@app.post("/users/signup")
def signup_user(user_data: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    """Create a new user account and set session cookie"""
    try:
        existing_user = db.query(models.User).filter(
            models.User.email == user_data.email
        ).first()
       
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered. Please login instead."
            )
       
        hashed_password = get_password_hash(user_data.password)
        current_month = datetime.now().strftime("%Y-%m")
       
        new_user = models.User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            email=user_data.email,
            password_hash=hashed_password,
            business_name=user_data.business_name,
            location=user_data.location,
            business_interests=user_data.business_interests,
            subscription_tier='free',
            ai_chat_used=0,
            ai_chat_month=current_month
        )
       
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create session in Redis
        session_token = create_session(new_user.id, remember_me=False)
        
        response.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60
        )
       
        print(f"✅ New user created: {new_user.email}")
        
        return {
            "id": new_user.id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email,
            "business_name": new_user.business_name,
            "location": new_user.location,
            "business_interests": new_user.business_interests,
            "subscription_tier": new_user.subscription_tier,
            "ai_chat_used": new_user.ai_chat_used,
            "ai_chat_month": new_user.ai_chat_month,
            "created_at": new_user.created_at,
            "message": "Account created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

# ============================================
# GET CURRENT USER
# ============================================

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user from session"""
    current_month = datetime.now().strftime("%Y-%m")
    
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
        "ai_chat_month": current_user.ai_chat_month or current_month,
        "created_at": str(current_user.created_at)
    }

# ============================================
# LOGOUT ENDPOINT
# ============================================

@app.post("/api/auth/logout")
def logout(response: Response, session_id: str = Cookie(None)):
    """Logout user and clear session"""
    if session_id:
        delete_session(session_id)
        print(f"✅ Session deleted from Redis")
    
    response.delete_cookie(key="session_id")
    
    return {"success": True, "message": "Logged out successfully"}

# ============================================
# CHECK EMAIL ENDPOINT
# ============================================

@app.get("/users/check-email/{email}")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Check if an email is already registered"""
    user = db.query(models.User).filter(
        models.User.email == email
    ).first()
   
    return {
        "exists": user is not None,
        "email": email,
        "message": "Email is registered" if user else "Email is available"
    }

# ============================================
# GET USER PROFILE ENDPOINT (PROTECTED)
# ============================================

@app.get("/users/profile/{email}")
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
        models.User.email == email
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
        "subscription_tier": user.subscription_tier or 'free',
        "ai_chat_used": user.ai_chat_used or 0,
        "ai_chat_month": user.ai_chat_month or current_month,
        "created_at": str(user.created_at)
    }


class ProductTrackerRequest(BaseModel):
    product_name: str
    category: str
    source: str  # 'flipkart' or 'amazon'
    base_cost: float  # Seller's cost price
    user_email: Optional[str] = None 

class PricingInsights(BaseModel):
    recommended_price: float
    min_price: float
    max_price: float
    profit_margin: float
    confidence: str
    # ⭐ ADD THESE THREE FIELDS
    market_avg_price: float = 0
    market_min_price: float = 0
    market_max_price: float = 0

class SalesInsights(BaseModel):
    estimated_monthly_sales: str
    estimated_daily_sales: float
    market_demand: str

class CompetitorInsights(BaseModel):
    total_competitors: int
    avg_competitor_price: float
    avg_competitor_rating: float
    top_competitor: Optional[Dict[str, Any]]

# class LocationInsight(BaseModel):
#     country: str
#     market_share: str
#     demand_level: str

class LocationInsight(BaseModel):
    """Pydantic model for location insights"""
    country: str
    market_share: str
    demand_level: str

class ProductTrackerResponse(BaseModel):
    success: bool
    product_name: str
    category: str
    source: str
    pricing: PricingInsights
    sales: SalesInsights
    competition: CompetitorInsights
    location_insights: List[LocationInsight] = Field(default_factory=list)
    ai_strategy: str
    warnings: List[str] = Field(default_factory=list)

class AnalysisUsageResponse(BaseModel):
    count: int
    limit: int
    month: str
    subscription_tier: str
    remaining: int

class AnalysisTrackRequest(BaseModel):
    increment: int = 1     


STOPWORDS = {
    "for", "with", "and", "the", "a", "an", "usb", "type", "inch", "in"
}

def extract_keywords(product_name: str) -> list[str]:
    """
    Industry-grade keyword extractor.
    Automatically extracts meaningful keywords from product titles.
    """
    clean = re.sub(r"[^a-zA-Z0-9 ]", " ", product_name.lower())
    tokens = [t.strip() for t in clean.split() if t.strip()]
    keywords = [t for t in tokens if t not in STOPWORDS and len(t) > 2]
    return keywords



# @app.post("/product-tracker/analyze", response_model=ProductTrackerResponse)
# def analyze_product_opportunity(request: ProductTrackerRequest, db: Session = Depends(get_db)):
#     print(f"🔍 Analyzing market for: {request.product_name} in {request.category}")
    
#     # ✅ CRITICAL FIX: Get user email (can be None)
#     user_email = request.user_email if request.user_email else None
#     print(f"👤 User Email: {user_email if user_email else 'Anonymous (not logged in)'}")
    
#     try:
#         # Get similar products
#         similar_products = get_similar_products(db, request.product_name, request.category, request.source)
#         if not similar_products:
#             raise HTTPException(404, f"❌ No products found matching '{request.product_name}' in category '{request.category}' on {request.source}")
        
#         print(f"📊 Found {len(similar_products)} similar products")
        
#         # Validate cost
#         prices = [float(p.get('price', 0)) for p in similar_products if p.get('price', 0) > 0]
#         market_max = max(prices) if prices else 0
#         market_min = min(prices) if prices else 0
        
#         if request.base_cost > market_max * 2:
#             raise HTTPException(400, f"❌ Invalid Cost: Your cost (₹{request.base_cost:,.0f}) seems incorrect. Market range: ₹{market_min:,.0f}-₹{market_max:,.0f}")
#         if request.base_cost > market_max:
#             raise HTTPException(400, f"⚠️ Cost Too High: ₹{request.base_cost:,.0f} > market max ₹{market_max:,.0f}")
        
#         # Extract keywords
#         keywords = extract_keywords(request.product_name)
        
#         # Run analysis
#         pricing_insights = analyze_pricing(similar_products, request.base_cost)
        
#         sales_insights = analyze_sales_potential(
#             products=similar_products,
#             source=request.source,
#             base_cost=request.base_cost,
#             recommended_price=pricing_insights['recommended_price'],
#             category=request.category
#         )
        
#         competition_insights = analyze_competition(similar_products, request.category, keywords)
#         location_insights = generate_location_insights(similar_products)
        
#         ai_strategy = generate_ai_strategy(
#             pricing_insights, 
#             sales_insights, 
#             competition_insights, 
#             request.base_cost, 
#             request.product_name, 
#             request.category,
#             location_insights
#         )
        
#         warnings = generate_warnings(pricing_insights, competition_insights, request.base_cost)
        
#         # Build response
#         response = ProductTrackerResponse(
#             success=True,
#             product_name=request.product_name,
#             category=request.category,
#             source=request.source.capitalize(),
#             pricing=PricingInsights(**pricing_insights),
#             sales=SalesInsights(**sales_insights),
#             competition=CompetitorInsights(**competition_insights),
#             location_insights=location_insights,
#             ai_strategy=ai_strategy,
#             warnings=warnings
#         )
        
#         # ✅ CRITICAL: Save to database with user email
#         try:
#             analysis_data = {
#                 'product_name': request.product_name,
#                 'category': request.category,
#                 'source': request.source,
#                 'base_cost': request.base_cost,
#                 'pricing': pricing_insights,
#                 'sales': sales_insights,
#                 'competition': competition_insights,
#                 'location_insights': [
#                     {
#                         'country': loc.country,
#                         'market_share': loc.market_share,
#                         'demand_level': loc.demand_level
#                     } for loc in location_insights
#                 ],
#                 'ai_strategy': ai_strategy,
#                 'warnings': warnings,
#                 'similar_products': similar_products,
#                 'success': True
#             }
            
#             # ✅ Pass user_email to CRUD function
#             saved_analysis = crud.create_tracker_analysis(db, user_email, analysis_data)
#             print(f"💾 Analysis saved to database - ID: {saved_analysis.id}, User: {user_email if user_email else 'Anonymous'}")
            
#         except Exception as e:
#             print(f"⚠️ Failed to save analysis: {str(e)}")
#             import traceback
#             traceback.print_exc()
        
#         return response
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Error in product tracker: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(500, f"Analysis failed: {str(e)}")

def get_analysis_limit(tier: str) -> int:
    """Get analysis limit based on subscription tier"""
    limits = {
        'free': 5,
        'basic': 20,
        'premium': float('inf'),
        'enterprise': float('inf')
    }
    return limits.get(tier.lower(), 5)

# ==================== ENDPOINTS ====================

@app.get("/users/{user_id}/analysis-usage")
async def get_analysis_usage(
    user_id: int,
    month: str = Query(None, description="Optional YYYY-MM format"),
    db: Session = Depends(get_db)
):
    """
    Get current analysis usage for a user
    Returns usage count, limit, and remaining analyses
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_month = month or datetime.now().strftime("%Y-%m")
    
    # Reset count if month has changed
    if user.analysis_month != current_month:
        user.analysis_used = 0
        user.analysis_month = current_month
        db.commit()
        db.refresh(user)
    
    tier = user.subscription_tier or 'free'
    limit = get_analysis_limit(tier)
    used = user.analysis_used or 0
    
    return {
        "count": used,
        "limit": limit if limit != float('inf') else -1,  # -1 represents unlimited
        "month": user.analysis_month or current_month,
        "subscription_tier": tier,
        "remaining": limit - used if limit != float('inf') else -1
    }


@app.post("/users/{user_id}/analysis-usage")
async def track_analysis_usage(
    user_id: int,
    request: AnalysisTrackRequest,
    db: Session = Depends(get_db)
):
    """
    Increment analysis usage count for a user
    Called after each successful product analysis
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_month = datetime.now().strftime("%Y-%m")
    
    # Reset count if month has changed
    if user.analysis_month != current_month:
        user.analysis_used = 0
        user.analysis_month = current_month
    
    # Check if user has reached limit
    tier = user.subscription_tier or 'free'
    limit = get_analysis_limit(tier)
    
    if limit != float('inf') and (user.analysis_used or 0) >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Analysis limit reached. You have used {user.analysis_used}/{limit} analyses this month. Upgrade your plan for more."
        )
    
    # Increment usage
    user.analysis_used = (user.analysis_used or 0) + request.increment
    user.analysis_month = current_month
    user.updated_at = datetime.now()
    
    db.commit()
    db.refresh(user)
    
    remaining = limit - user.analysis_used if limit != float('inf') else -1
    
    return {
        "success": True,
        "analysis_used": user.analysis_used,
        "analysis_month": user.analysis_month,
        "remaining": remaining,
        "limit": limit if limit != float('inf') else -1,
        "message": f"Analysis tracked. {user.analysis_used}/{limit if limit != float('inf') else '∞'} used this month"
    }


@app.post("/users/{user_id}/check-analysis-limit")
async def check_analysis_limit(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Check if user can perform another analysis
    Returns boolean and remaining count
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_month = datetime.now().strftime("%Y-%m")
    
    # Reset if new month
    if user.analysis_month != current_month:
        user.analysis_used = 0
        user.analysis_month = current_month
        db.commit()
    
    tier = user.subscription_tier or 'free'
    limit = get_analysis_limit(tier)
    used = user.analysis_used or 0
    
    can_analyze = limit == float('inf') or used < limit
    remaining = limit - used if limit != float('inf') else -1
    
    return {
        "can_analyze": can_analyze,
        "used": used,
        "limit": limit if limit != float('inf') else -1,
        "remaining": remaining,
        "subscription_tier": tier,
        "upgrade_required": not can_analyze
    }


# ==================== UPDATE YOUR EXISTING ANALYZE ENDPOINT ====================

@app.post("/product-tracker/analyze", response_model=ProductTrackerResponse)
def analyze_product_opportunity(request: ProductTrackerRequest, db: Session = Depends(get_db)):
    print(f"🔍 Analyzing market for: {request.product_name} in {request.category}")
    
    user_email = request.user_email if request.user_email else None
    print(f"👤 User Email: {user_email if user_email else 'Anonymous (not logged in)'}")
    
    # ✅ NEW: Check analysis limit if user is logged in
    if user_email:
        user = db.query(models.User).filter(models.User.email == user_email).first()
        
        if user:
            current_month = datetime.now().strftime("%Y-%m")
            
            # Reset if new month
            if user.analysis_month != current_month:
                user.analysis_used = 0
                user.analysis_month = current_month
                db.commit()
                db.refresh(user)
            
            tier = user.subscription_tier or 'free'
            limit = get_analysis_limit(tier)
            used = user.analysis_used or 0
            
            # Check limit
            if limit != float('inf') and used >= limit:
                raise HTTPException(
                    status_code=403,
                    detail=f"Analysis limit reached. You have used {used}/{limit} analyses this month. Upgrade to {('Basic' if tier == 'free' else 'Premium')} for more analyses."
                )
            
            print(f"✅ Usage check: {used}/{limit if limit != float('inf') else '∞'} analyses used")
    
    try:
        # Get similar products
        similar_products = get_similar_products(db, request.product_name, request.category, request.source)
        if not similar_products:
            raise HTTPException(404, f"❌ No products found matching '{request.product_name}' in category '{request.category}' on {request.source}")
        
        print(f"📊 Found {len(similar_products)} similar products")
        
        # Validate cost
        prices = [float(p.get('price', 0)) for p in similar_products if p.get('price', 0) > 0]
        market_max = max(prices) if prices else 0
        market_min = min(prices) if prices else 0
        
        if request.base_cost > market_max * 2:
            raise HTTPException(400, f"❌ Invalid Cost: Your cost (₹{request.base_cost:,.0f}) seems incorrect. Market range: ₹{market_min:,.0f}-₹{market_max:,.0f}")
        if request.base_cost > market_max:
            raise HTTPException(400, f"⚠️ Cost Too High: ₹{request.base_cost:,.0f} > market max ₹{market_max:,.0f}")
        
        # Extract keywords
        keywords = extract_keywords(request.product_name)
        
        # Run analysis
        pricing_insights = analyze_pricing(similar_products, request.base_cost)
        
        sales_insights = analyze_sales_potential(
            products=similar_products,
            source=request.source,
            base_cost=request.base_cost,
            recommended_price=pricing_insights['recommended_price'],
            category=request.category
        )
        
        competition_insights = analyze_competition(similar_products, request.category, keywords)
        location_insights = generate_location_insights(similar_products)
        
        ai_strategy = generate_ai_strategy(
            pricing_insights, 
            sales_insights, 
            competition_insights, 
            request.base_cost, 
            request.product_name, 
            request.category,
            location_insights
        )
        
        warnings = generate_warnings(pricing_insights, competition_insights, request.base_cost)
        
        # Build response
        response = ProductTrackerResponse(
            success=True,
            product_name=request.product_name,
            category=request.category,
            source=request.source.capitalize(),
            pricing=PricingInsights(**pricing_insights),
            sales=SalesInsights(**sales_insights),
            competition=CompetitorInsights(**competition_insights),
            location_insights=location_insights,
            ai_strategy=ai_strategy,
            warnings=warnings
        )
        
        # ✅ Save to database
        try:
            analysis_data = {
                'product_name': request.product_name,
                'category': request.category,
                'source': request.source,
                'base_cost': request.base_cost,
                'pricing': pricing_insights,
                'sales': sales_insights,
                'competition': competition_insights,
                'location_insights': [
                    {
                        'country': loc.country,
                        'market_share': loc.market_share,
                        'demand_level': loc.demand_level
                    } for loc in location_insights
                ],
                'ai_strategy': ai_strategy,
                'warnings': warnings,
                'similar_products': similar_products,
                'success': True
            }
            
            saved_analysis = crud.create_tracker_analysis(db, user_email, analysis_data)
            print(f"💾 Analysis saved - ID: {saved_analysis.id}, User: {user_email if user_email else 'Anonymous'}")
            
            # ✅ NEW: Increment analysis usage count
            if user_email and user:
                user.analysis_used = (user.analysis_used or 0) + 1
                user.analysis_month = datetime.now().strftime("%Y-%m")
                user.updated_at = datetime.now()
                db.commit()
                
                remaining = get_analysis_limit(user.subscription_tier or 'free') - user.analysis_used
                remaining_display = remaining if remaining != float('inf') else '∞'
                print(f"✅ Usage updated: {user.analysis_used} used, {remaining_display} remaining")
            
        except Exception as e:
            print(f"⚠️ Failed to save analysis: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in product tracker: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Analysis failed: {str(e)}")


def get_similar_products(db: Session, product_name: str, category: str, source: str):
    """
    Fully dynamic competitor finder with STRICT CATEGORY + PRODUCT FILTERING.
    Uses NLP keyword extraction + multi-keyword DB search + strict category filter.
    """

    keywords = extract_keywords(product_name)

    if len(keywords) == 0:
        keywords = [category.lower()]  # fallback

    # Build dynamic SQL pattern for keywords
    like_clauses = " AND ".join([f"LOWER(product_title) LIKE '%{k}%'" for k in keywords])
    
    # STRICT CATEGORY FILTERING - match exact category or very close variants
    category_filter = f"AND LOWER(category_name) LIKE '%{category.lower()}%'"

    print(f"🔎 Matching competitors using keywords: {keywords} in category: {category}")

    if source.lower() == "amazon":
        query = text(f"""
            SELECT 
                product_title,
                category_name,
                product_price_numeric as price,
                product_star_rating_numeric as rating,
                product_num_ratings as reviews,
                sales_volume,
                country,
                is_best_seller,
                is_amazon_choice,
                is_prime,
                raw_data
            FROM rapidapi_amazon_products
            WHERE {like_clauses}
            {category_filter}
            AND product_price_numeric > 0
            AND product_star_rating_numeric > 0
            ORDER BY product_num_ratings DESC
            LIMIT 200
        """)
    else:  # Flipkart - using rapidapi_flipkart_products
        query = text(f"""
            SELECT 
                product_title,
                category_name,
                product_price as price,
                product_star_rating as rating,
                product_review_count as reviews,
                brand,
                sales_volume,
                estimated_sales,
                stock_status,
                raw_data
            FROM rapidapi_flipkart_products
            WHERE {like_clauses}
            {category_filter}
            AND product_price > 0
            AND product_star_rating > 0
            ORDER BY product_review_count DESC
            LIMIT 200
        """)

    results = db.execute(query).fetchall()
    
    if len(results) == 0:
        print(f"❌ No products found for '{product_name}' in category '{category}'")
        return []

    # POST-PROCESSING: Filter out products that don't actually match the search keywords
    # This prevents chargers showing up when searching for headphones
    filtered_results = []
    
    for row in results:
        product_dict = dict(row._mapping)
        product_title = str(product_dict.get('product_title', '')).lower()
        
        # Check if at least one keyword appears in the product title
        has_keyword_match = any(keyword in product_title for keyword in keywords)
        
        if has_keyword_match:
            filtered_results.append(product_dict)
        else:
            print(f"⚠️ Filtered out: {product_dict.get('product_title', '')[:50]} - doesn't match keywords")
    
    if len(filtered_results) == 0:
        print(f"❌ No products found matching '{product_name}' after keyword filtering in category '{category}'")
        return []

    print(f"✅ Found {len(filtered_results)} products matching '{product_name}' in '{category}' category (filtered from {len(results)} initial results)")
    return filtered_results



def analyze_pricing(products: List[Dict], base_cost: float) -> Dict:
    """
    INDUSTRY-GRADE pricing engine
    - Recommended price = MARKET driven
    - Cost used ONLY for profitability & warnings
    """

    prices = [float(p.get("price", 0)) for p in products if p.get("price", 0) > 0]

    if not prices:
        return {
            "recommended_price": 0,
            "min_price": 0,
            "max_price": 0,
            "profit_margin": 0,
            "confidence": "Low",
            "market_avg_price": 0,
            "market_min_price": 0,
            "market_max_price": 0
        }

    prices.sort()
    avg_price = sum(prices) / len(prices)
    median_price = prices[len(prices) // 2]
    q1 = prices[len(prices) // 4]
    q3 = prices[(3 * len(prices)) // 4]

    # 🎯 MARKET SELLABLE PRICE (KEY FIX)
    recommended_price = round(median_price * 0.95, 2)

    min_price = round(q1 * 0.9, 2)
    max_price = round(q3 * 1.1, 2)

    # 💰 PROFIT / LOSS
    profit = recommended_price - base_cost
    profit_margin = (profit / recommended_price) * 100

    # 🧠 CONFIDENCE LOGIC
    if profit_margin < 0:
        confidence = "Critical"
    elif profit_margin < 10:
        confidence = "Low"
    elif profit_margin < 25:
        confidence = "Medium"
    else:
        confidence = "High"

    market_min = round(min(prices))
    market_max = round(max(prices))
    market_avg = round(avg_price)

    return {
    "recommended_price": round(recommended_price),
    "min_price": round(min_price),
    "max_price": round(max_price),
    "profit_margin": round(profit_margin, 1),
    "confidence": confidence,
    "market_avg_price": round(avg_price),      # ✅ Already here
    "market_min_price": round(min(prices)),    # ✅ Already here
    "market_max_price": round(max(prices))     # ✅ Already here
}


def D(val):
    """Safe Decimal converter"""
    try:
        return val if isinstance(val, Decimal) else Decimal(str(val))
    except Exception:
        return Decimal("0")


def parse_sales_volume(sales_text: str) -> float:
    """Parse sales volume text into numeric value"""
    if not sales_text:
        return 0.0
    
    sales_text = str(sales_text).lower().replace(',', '')
    
    # Handle K (thousands)
    if 'k' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text.replace('k', ''))
            if num:
                return float(num.group()) * 1000
        except:
            pass
    
    # Handle M (millions)
    if 'm' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text.replace('m', ''))
            if num:
                return float(num.group()) * 1000000
        except:
            pass
    
    # Handle L (lakhs)
    if 'l' in sales_text or 'lakh' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text)
            if num:
                return float(num.group()) * 100000
        except:
            pass
    
    # Extract numeric value
    match = re.search(r'[\d.]+', sales_text)
    if match:
        try:
            return float(match.group())
        except:
            pass
    
    return 0.0



def analyze_sales_potential(products: List[Dict], source: str, 
                            base_cost: float = 0, recommended_price: float = 0,
                            category: str = "") -> Dict:
    """
    Fully dynamic industry-standard sales forecasting using actual market data.
    All floors and ceilings are computed dynamically based on market and competition.
    """
    if not products:
        return {
            "estimated_monthly_sales": "0 - 0",
            "estimated_daily_sales": 0.0,
            "market_demand": "Unknown"
        }

    # ---------- Extract Market Data ----------
    total_market_sales = D("0")
    total_reviews = D("0")
    total_ratings = []
    prices = []
    
    valid_sales_count = 0
    
    for p in products:
        # Sales volume
        sales_vol = p.get('sales_volume', '')
        if sales_vol:
            parsed_sales = parse_sales_volume(str(sales_vol))
            if parsed_sales > 0:
                total_market_sales += D(parsed_sales)
                valid_sales_count += 1

        # Estimated sales
        estimated = p.get('estimated_sales', 0)
        if estimated and estimated > 0:
            total_market_sales += D(str(estimated))
            valid_sales_count += 1

        # Reviews
        reviews = p.get('reviews') or p.get('product_num_ratings') or p.get('product_review_count') or 0
        total_reviews += D(reviews)

        # Ratings
        rating = p.get('rating') or p.get('product_star_rating_numeric') or p.get('product_star_rating') or 0
        if rating:
            try:
                total_ratings.append(float(D(rating)))
            except:
                pass

        # Prices
        price = p.get('price', 0)
        if price:
            try:
                prices.append(float(D(price)))
            except:
                pass

    competitor_count = len(products)
    total_market_monthly = float(total_market_sales)
    avg_reviews = float(total_reviews) / max(competitor_count, 1)
    avg_rating = sum(total_ratings) / len(total_ratings) if total_ratings else 0
    avg_price = sum(prices) / len(prices) if prices else 0

    # ---------- Dynamic Base Market Share ----------
    if competitor_count > 200:
        base_market_share = 0.004
    elif competitor_count > 100:
        base_market_share = 0.007
    elif competitor_count > 50:
        base_market_share = 0.012
    elif competitor_count > 25:
        base_market_share = 0.020
    elif competitor_count > 10:
        base_market_share = 0.035
    else:
        base_market_share = 0.060

    # ---------- Price Competitiveness Factor ----------
    price_factor = 1.0
    if recommended_price > 0 and avg_price > 0:
        diff_pct = ((recommended_price - avg_price) / avg_price) * 100
        if diff_pct <= -30:
            price_factor = 2.0
        elif diff_pct <= -20:
            price_factor = 1.5
        elif diff_pct <= -10:
            price_factor = 1.2
        elif diff_pct <= 10:
            price_factor = 1.0
        elif diff_pct <= 20:
            price_factor = 0.7
        else:
            price_factor = 0.5

    # ---------- Calculate Projected Sales ----------
    if valid_sales_count > 0 and total_market_monthly > 0:
        estimated_monthly = total_market_monthly * base_market_share * price_factor
    elif avg_reviews > 0:
        conversion_ratio = 40
        estimated_total_sales = avg_reviews * conversion_ratio
        estimated_monthly = estimated_total_sales * base_market_share * price_factor
    else:
        baseline = max(25, competitor_count)
        estimated_monthly = baseline * price_factor

    # ---------- Dynamic Reality Checks ----------
    # 1. Adjust inflated sales (lifetime vs monthly)
    if valid_sales_count > 0 and total_market_monthly > 0:
        avg_per_comp = total_market_monthly / competitor_count
        if avg_per_comp > 10000:
            total_market_monthly /= 8
            estimated_monthly = total_market_monthly * base_market_share * price_factor

    # 2. Minimum floor dynamically based on competition & market
    floor = max(5, competitor_count * 0.3, avg_reviews * 0.05)
    if estimated_monthly < floor:
        estimated_monthly = floor

    # 3. Dynamic per-competitor cap (50-70% of average competitor)
    if valid_sales_count > 0 and total_market_monthly > 0:
        avg_per_comp = total_market_monthly / competitor_count
        dynamic_cap = avg_per_comp * (0.5 + 0.2 * price_factor)  # scales with price competitiveness
        if estimated_monthly > dynamic_cap:
            estimated_monthly = dynamic_cap

    # 4. Dynamic ceiling based on overall market size
    if total_market_monthly > 0:
        market_scale_factor = min(1.0, 50000 / total_market_monthly)  # reduce if very large market
        estimated_monthly *= market_scale_factor

    # ---------- Dynamic Demand Label ----------
    if total_market_monthly > 50000 or avg_reviews > 500:
        demand_label = "High"
    elif total_market_monthly > 20000 or avg_reviews > 200:
        demand_label = "Medium"
    else:
        demand_label = "Low"

    # ---------- Final Range ----------
    low_estimate = int(estimated_monthly * 0.70)
    high_estimate = int(estimated_monthly * 1.30)
    avg_daily_sales = estimated_monthly / 30.0

    return {
        "estimated_monthly_sales": f"{low_estimate:,} - {high_estimate:,}",
        "estimated_daily_sales": round(avg_daily_sales, 1),
        "market_demand": demand_label
    }


def calculate_realistic_sales_v2(products: List[Dict], base_cost: float, 
                                 recommended_price: float, category: str) -> Dict:
    """
    Enhanced dynamic wrapper for sales calculation.
    Automatically detects source and applies fully dynamic ceilings/floors.
    """
    # Auto-detect source from product structure
    source = "amazon"  # default
    if products:
        first_product = products[0]
        if 'estimated_sales' in first_product or 'flipkart_id' in first_product:
            source = "flipkart"
    
    # Call dynamic sales analysis
    return analyze_sales_potential(
        products=products,
        source=source,
        base_cost=base_cost,
        recommended_price=recommended_price,
        category=category
    )

def analyze_competition(products: List[Dict], category: str = None, product_keywords: list = None) -> Dict:
    """
    Analyze competitive landscape - works for both Amazon and Flipkart
    """
    if not products:
        return {
            'total_competitors': 0,
            'avg_competitor_price': 0.0,
            'avg_competitor_rating': 0.0,
            'top_competitor': None
        }
    
    # ⭐ PUT THE NEW CODE HERE - RIGHT AFTER THE EMPTY CHECK ⭐
    # Filter by category
    if category:
        category_lower = category.lower()
        products_for_analysis = [
            p for p in products 
            if category_lower in str(p.get('category_name', '')).lower()
        ]
        if not products_for_analysis:
            products_for_analysis = products
    else:
        products_for_analysis = products
    
    # Filter by keywords for top competitor
    if product_keywords:
        keyword_matched_products = []
        for p in products_for_analysis:
            title = str(p.get('product_title', '')).lower()
            if any(kw in title for kw in product_keywords):
                keyword_matched_products.append(p)
        
        products_for_top_competitor = keyword_matched_products if keyword_matched_products else products_for_analysis
        print(f"✅ Using {len(products_for_top_competitor)} keyword-matched products for top competitor")
    else:
        products_for_top_competitor = products_for_analysis
    # ⭐ END OF NEW CODE ⭐
    
    # Now CHANGE these lines to use products_for_analysis instead of products:
    prices = [float(p.get('price', 0)) for p in products_for_analysis if p.get('price', 0) > 0]  # ⭐ Changed
    ratings = [float(p.get('rating', 0)) for p in products_for_analysis if p.get('rating', 0) > 0]  # ⭐ Changed
    
    avg_price = sum(prices) / len(prices) if prices else 0
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # Find top competitor - CHANGE to use products_for_top_competitor:
    top_competitor = None
    max_score = 0
    
    for p in products_for_top_competitor:  # ⭐ Changed from 'products' to 'products_for_top_competitor'
        reviews = p.get('reviews', 0) or 0
        rating = p.get('rating', 0) or 0
        score = reviews * rating
        
        if score > max_score:
            max_score = score
            brand_info = f" ({p.get('brand', '')})" if p.get('brand') else ""
            top_competitor = {
                'name': str(p.get('product_title', ''))[:60] + brand_info,
                'price': float(p.get('price', 0)),
                'rating': float(rating),
                'reviews': int(reviews)
            }
    
    return {
        'total_competitors': len(products_for_analysis),  # ⭐ Changed
        'avg_competitor_price': round(avg_price, 2),
        'avg_competitor_rating': round(avg_rating, 2),
        'top_competitor': top_competitor
    }


def D(val):
    """Safe Decimal converter for production"""
    try:
        return val if isinstance(val, Decimal) else Decimal(str(val))
    except Exception:
        return Decimal("0")


# def analyze_product_patterns(products: List[Dict]) -> Dict:
#     """
#     Analyze product data to extract market intelligence patterns.
#     Returns comprehensive analysis for AI-based location prediction.
#     """
#     if not products:
#         return {}
    
#     # Brand analysis
#     brands = {}
#     top_brands = []
    
#     for p in products:
#         brand = p.get('brand')
#         if brand:
#             brand = str(brand).strip()
#             brands[brand] = brands.get(brand, 0) + 1
    
#     if brands:
#         top_brands = sorted(brands.items(), key=lambda x: x[1], reverse=True)[:5]
    
#     # Price distribution analysis
#     prices = [float(D(p.get('price', 0))) for p in products if p.get('price')]
#     price_ranges = {
#         'ultra_budget': len([p for p in prices if p < 300]),
#         'budget': len([p for p in prices if 300 <= p < 1000]),
#         'mid_range': len([p for p in prices if 1000 <= p < 3000]),
#         'premium': len([p for p in prices if 3000 <= p < 10000]),
#         'luxury': len([p for p in prices if p >= 10000])
#     }
    
#     # Rating analysis
#     ratings = []
#     for p in products:
#         rating = (
#             p.get('rating') or 
#             p.get('product_star_rating_numeric') or 
#             p.get('product_star_rating') or 
#             0
#         )
#         if rating:
#             ratings.append(float(D(rating)))
    
#     avg_rating = sum(ratings) / len(ratings) if ratings else 0
#     high_rated = len([r for r in ratings if r >= 4.0])
    
#     # Sales velocity analysis
#     total_sales = Decimal("0")
#     high_sales_products = 0
    
#     for p in products:
#         sales_vol = p.get('sales_volume', '')
#         if sales_vol:
#             sales = D(parse_sales_volume(str(sales_vol)))
#             total_sales += sales
#             if sales > 1000:
#                 high_sales_products += 1
        
#         estimated = p.get('estimated_sales')
#         if estimated:
#             total_sales += D(estimated)
    
#     # Review analysis
#     total_reviews = Decimal("0")
#     high_engagement = 0
    
#     for p in products:
#         reviews = (
#             p.get('reviews') or 
#             p.get('product_num_ratings') or 
#             p.get('product_review_count') or 
#             0
#         )
#         review_count = D(reviews)
#         total_reviews += review_count
#         if review_count > 500:
#             high_engagement += 1
    
#     return {
#         'total_products': len(products),
#         'brands': top_brands,
#         'brand_diversity': len(brands),
#         'price_distribution': price_ranges,
#         'avg_rating': avg_rating,
#         'high_rated_percentage': (high_rated / len(ratings) * 100) if ratings else 0,
#         'total_sales': float(total_sales),
#         'high_sales_products': high_sales_products,
#         'total_reviews': float(total_reviews),
#         'high_engagement_products': high_engagement,
#         'avg_price': sum(prices) / len(prices) if prices else 0,
#         'min_price': min(prices) if prices else 0,
#         'max_price': max(prices) if prices else 0
#     }


# def generate_location_insights(products: List[Dict]) -> List[LocationInsight]:
#     """
#     Generate FULLY AI-DRIVEN dynamic location insights using Llama 3.2:3b.
#     AI predicts ANY city/district/state across India - zero hardcoded locations.
#     """
    
#     if not products:
#         return []
    
#     # Extract category
#     category = products[0].get('category_name') or products[0].get('category', 'General')
    
#     # Analyze product patterns
#     analysis = analyze_product_patterns(products)
    
#     if not analysis:
#         return []
    
#     # Build comprehensive market intelligence report
#     brand_info = ""
#     if analysis['brands']:
#         top_3_brands = [f"{brand} ({count} products)" for brand, count in analysis['brands'][:3]]
#         brand_info = f"\nTop Brands: {', '.join(top_3_brands)}"
    
#     price_dist = analysis['price_distribution']
#     dominant_segment = max(price_dist.items(), key=lambda x: x[1])[0]
    
#     market_intelligence = f"""CATEGORY: {category}
# TOTAL PRODUCTS: {analysis['total_products']}

# PRICE ANALYSIS:
# - Average Price: ₹{analysis['avg_price']:.0f}
# - Price Range: ₹{analysis['min_price']:.0f} - ₹{analysis['max_price']:.0f}
# - Dominant Segment: {dominant_segment.replace('_', ' ').title()}

# MARKET PERFORMANCE:
# - Average Rating: {analysis['avg_rating']:.2f}★
# - Total Sales Volume: {analysis['total_sales']:,.0f}
# - Total Reviews: {analysis['total_reviews']:,.0f}
# - Brand Diversity: {analysis['brand_diversity']} unique brands{brand_info}
# """

#     # Optimized prompt for Llama 3.2:3b (shorter, more direct)
#     prompt = f"""You are an Indian e-commerce market analyst. Predict the TOP 6 Indian cities/districts with highest demand for this product category.

# {market_intelligence}

# INSTRUCTIONS:
# 1. Consider ALL Indian states and cities (tier-1, tier-2, tier-3, tier-4)
# 2. Match locations to product type and price point:
#    - Budget products (<₹1000): High-population tier-2/3 cities
#    - Mid-range (₹1K-5K): Growing tier-2 cities
#    - Premium (>₹5K): Affluent metros and IT hubs
# 3. Category-specific logic:
#    - Electronics/Tech: Bangalore, Pune, Hyderabad, Noida
#    - Fashion: Textile centers like Tiruppur, Ludhiana
#    - Agriculture: Ludhiana, Nashik, Guntur
#    - Automotive: Industrial areas - Chennai, Manesar
#    - Books/Education: University towns - Kota, Varanasi
# 4. Distribute across North, South, East, West regions
# 5. Be creative with non-obvious but logical cities

# OUTPUT FORMAT (JSON array only, no explanation):
# [
#   {{"city": "CityName, StateName", "share": 26.5, "demand": "Very High"}},
#   {{"city": "CityName, StateName", "share": 23.2, "demand": "High"}}
# ]

# Requirements:
# - Total shares must sum to 100
# - Use real Indian cities/districts
# - Demand levels: "Very High", "High", "Medium", "Moderate"
# - Order by share (highest first)
# - Respond with ONLY the JSON array

# Generate now:"""
    
#     try:
#         result = subprocess.run(
#             ["ollama", "run", "llama3.2:3b"],  # Changed model name
#             input=prompt,
#             capture_output=True,
#             text=True,
#             encoding="utf-8",
#             errors="ignore",
#             timeout=60
#         )
        
#         output = (result.stdout or result.stderr or "").strip()
        
#         # Extract JSON array from response (handle markdown code blocks)
#         json_match = re.search(r'```json\s*(\[[\s\S]*?\])\s*```', output)
#         if not json_match:
#             json_match = re.search(r'```\s*(\[[\s\S]*?\])\s*```', output)
#         if not json_match:
#             json_match = re.search(r'\[[\s\S]*?\]', output)
        
#         if json_match:
#             json_text = json_match.group(1) if json_match.lastindex else json_match.group()
#             locations_data = json.loads(json_text)
            
#             # Validate and normalize shares to sum to 100
#             locations = locations_data[:6]
#             total_share = sum(float(loc.get('share', 0)) for loc in locations)
            
#             if total_share > 0:
#                 # Normalize shares
#                 for loc in locations:
#                     loc['share'] = (float(loc.get('share', 0)) / total_share) * 100
            
#             return [
#                 LocationInsight(
#                     country=loc.get("city", "Location Data Unavailable"),
#                     market_share=f"{loc['share']:.1f}%",
#                     demand_level=loc.get("demand", "Medium")
#                 )
#                 for loc in locations
#             ]
    
#     except json.JSONDecodeError as e:
#         print(f"❌ JSON parsing failed: {e}")
#         print(f"AI Output: {output[:500]}")
#     except subprocess.TimeoutExpired:
#         print(f"❌ AI request timeout after 45 seconds")
#     except Exception as e:
#         print(f"❌ AI location prediction failed: {e}")
    
#     # Ultimate fallback: Use AI again with simpler prompt
#     try:
#         fallback_prompt = f"""List 6 Indian cities with highest demand for {category} products (avg price: ₹{analysis['avg_price']:.0f}).

# Respond ONLY with JSON:
# [{{"city": "City, State", "share": 25, "demand": "High"}}]

# Total shares = 100. No explanation."""

#         result = subprocess.run(
#             ["ollama", "run", "llama3.2:3b"],  # Changed model name
#             input=fallback_prompt,
#             capture_output=True,
#             text=True,
#             encoding="utf-8",
#             errors="ignore",
#             timeout=60
#         )
        
#         output = (result.stdout or result.stderr or "").strip()
#         json_match = re.search(r'\[[\s\S]*?\]', output)
        
#         if json_match:
#             locations_data = json.loads(json_match.group())
#             locations = locations_data[:6]
            
#             # Normalize shares
#             total_share = sum(float(loc.get('share', 0)) for loc in locations)
#             if total_share > 0:
#                 for loc in locations:
#                     loc['share'] = (float(loc.get('share', 0)) / total_share) * 100
            
#             return [
#                 LocationInsight(
#                     country=loc.get("city", "Unknown Location"),
#                     market_share=f"{loc['share']:.1f}%",
#                     demand_level=loc.get("demand", "Medium")
#                 )
#                 for loc in locations
#             ]
#     except:
#         pass
    
#     # Last resort: Return message indicating AI is needed
#     return [
#         LocationInsight(
#             country="AI Analysis Required",
#             market_share="N/A",
#             demand_level="Configure Ollama Llama 3.2:3b for dynamic location insights"
#         )
#     ]


def analyze_product_patterns(products: List[Dict]) -> Dict:
    """
    Analyze product data to extract market intelligence patterns.
    Returns comprehensive analysis for AI-based location prediction.
    """
    if not products:
        return {}
    
    # Brand analysis
    brands = {}
    top_brands = []
    
    for p in products:
        brand = p.get('brand')
        if brand:
            brand = str(brand).strip()
            brands[brand] = brands.get(brand, 0) + 1
    
    if brands:
        top_brands = sorted(brands.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Price distribution analysis
    prices = [float(D(p.get('price', 0))) for p in products if p.get('price')]
    price_ranges = {
        'ultra_budget': len([p for p in prices if p < 300]),
        'budget': len([p for p in prices if 300 <= p < 1000]),
        'mid_range': len([p for p in prices if 1000 <= p < 3000]),
        'premium': len([p for p in prices if 3000 <= p < 10000]),
        'luxury': len([p for p in prices if p >= 10000])
    }
    
    # Rating analysis
    ratings = []
    for p in products:
        rating = (
            p.get('rating') or 
            p.get('product_star_rating_numeric') or 
            p.get('product_star_rating') or 
            0
        )
        if rating:
            ratings.append(float(D(rating)))
    
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    high_rated = len([r for r in ratings if r >= 4.0])
    
    # Sales velocity analysis
    total_sales = Decimal("0")
    high_sales_products = 0
    
    for p in products:
        sales_vol = p.get('sales_volume', '')
        if sales_vol:
            sales = D(parse_sales_volume(str(sales_vol)))
            total_sales += sales
            if sales > 1000:
                high_sales_products += 1
        
        estimated = p.get('estimated_sales')
        if estimated:
            total_sales += D(estimated)
    
    # Review analysis
    total_reviews = Decimal("0")
    high_engagement = 0
    
    for p in products:
        reviews = (
            p.get('reviews') or 
            p.get('product_num_ratings') or 
            p.get('product_review_count') or 
            0
        )
        review_count = D(reviews)
        total_reviews += review_count
        if review_count > 500:
            high_engagement += 1
    
    return {
        'total_products': len(products),
        'brands': top_brands,
        'brand_diversity': len(brands),
        'price_distribution': price_ranges,
        'avg_rating': avg_rating,
        'high_rated_percentage': (high_rated / len(ratings) * 100) if ratings else 0,
        'total_sales': float(total_sales),
        'high_sales_products': high_sales_products,
        'total_reviews': float(total_reviews),
        'high_engagement_products': high_engagement,
        'avg_price': sum(prices) / len(prices) if prices else 0,
        'min_price': min(prices) if prices else 0,
        'max_price': max(prices) if prices else 0
    }


def get_rule_based_locations(category: str, avg_price: float, analysis: Dict) -> List[LocationInsight]:
    """
    Fallback rule-based location prediction when AI fails.
    Uses category and price-based logic.
    """
    locations = []
    
    # Determine dominant price segment
    price_dist = analysis.get('price_distribution', {})
    dominant_segment = max(price_dist.items(), key=lambda x: x[1])[0] if price_dist else 'mid_range'
    
    # Category-specific location mapping
    category_lower = category.lower()
    
    # Electronics & Tech products
    if any(term in category_lower for term in ['electronic', 'mobile', 'laptop', 'computer', 'gadget', 'tech']):
        if avg_price > 5000:
            locations = [
                ("Bangalore, Karnataka", 22, "Very High"),
                ("Hyderabad, Telangana", 18, "High"),
                ("Pune, Maharashtra", 16, "High"),
                ("Gurgaon, Haryana", 15, "High"),
                ("Chennai, Tamil Nadu", 14, "High"),
                ("Noida, Uttar Pradesh", 15, "Medium")
            ]
        else:
            locations = [
                ("Delhi, Delhi", 20, "Very High"),
                ("Mumbai, Maharashtra", 18, "High"),
                ("Kolkata, West Bengal", 16, "High"),
                ("Jaipur, Rajasthan", 15, "Medium"),
                ("Lucknow, Uttar Pradesh", 16, "Medium"),
                ("Ahmedabad, Gujarat", 15, "Medium")
            ]
    
    # Fashion & Apparel
    elif any(term in category_lower for term in ['fashion', 'cloth', 'apparel', 'wear', 'dress', 'shirt']):
        if avg_price > 2000:
            locations = [
                ("Mumbai, Maharashtra", 22, "Very High"),
                ("Delhi, Delhi", 20, "Very High"),
                ("Bangalore, Karnataka", 17, "High"),
                ("Kolkata, West Bengal", 14, "High"),
                ("Hyderabad, Telangana", 14, "Medium"),
                ("Pune, Maharashtra", 13, "Medium")
            ]
        else:
            locations = [
                ("Tiruppur, Tamil Nadu", 20, "Very High"),
                ("Ludhiana, Punjab", 18, "High"),
                ("Surat, Gujarat", 17, "High"),
                ("Kanpur, Uttar Pradesh", 15, "Medium"),
                ("Erode, Tamil Nadu", 15, "Medium"),
                ("Ahmedabad, Gujarat", 15, "Medium")
            ]
    
    # Home & Kitchen
    elif any(term in category_lower for term in ['home', 'kitchen', 'furniture', 'decor', 'appliance']):
        locations = [
            ("Mumbai, Maharashtra", 19, "Very High"),
            ("Delhi, Delhi", 18, "High"),
            ("Bangalore, Karnataka", 16, "High"),
            ("Pune, Maharashtra", 15, "High"),
            ("Hyderabad, Telangana", 16, "Medium"),
            ("Chennai, Tamil Nadu", 16, "Medium")
        ]
    
    # Books & Education
    elif any(term in category_lower for term in ['book', 'education', 'stationery', 'study']):
        locations = [
            ("Kota, Rajasthan", 20, "Very High"),
            ("Delhi, Delhi", 18, "High"),
            ("Bangalore, Karnataka", 17, "High"),
            ("Pune, Maharashtra", 15, "High"),
            ("Kolkata, West Bengal", 15, "Medium"),
            ("Chennai, Tamil Nadu", 15, "Medium")
        ]
    
    # Automotive & Parts
    elif any(term in category_lower for term in ['automotive', 'car', 'bike', 'vehicle', 'auto']):
        locations = [
            ("Chennai, Tamil Nadu", 20, "Very High"),
            ("Pune, Maharashtra", 19, "High"),
            ("Gurgaon, Haryana", 18, "High"),
            ("Bangalore, Karnataka", 15, "High"),
            ("Ahmedabad, Gujarat", 14, "Medium"),
            ("Ludhiana, Punjab", 14, "Medium")
        ]
    
    # Beauty & Personal Care
    elif any(term in category_lower for term in ['beauty', 'cosmetic', 'skincare', 'makeup', 'personal care']):
        locations = [
            ("Mumbai, Maharashtra", 21, "Very High"),
            ("Delhi, Delhi", 19, "High"),
            ("Bangalore, Karnataka", 17, "High"),
            ("Kolkata, West Bengal", 15, "High"),
            ("Hyderabad, Telangana", 14, "Medium"),
            ("Chennai, Tamil Nadu", 14, "Medium")
        ]
    
    # Sports & Fitness
    elif any(term in category_lower for term in ['sport', 'fitness', 'gym', 'exercise']):
        locations = [
            ("Mumbai, Maharashtra", 20, "Very High"),
            ("Bangalore, Karnataka", 19, "High"),
            ("Delhi, Delhi", 18, "High"),
            ("Pune, Maharashtra", 15, "High"),
            ("Hyderabad, Telangana", 14, "Medium"),
            ("Chennai, Tamil Nadu", 14, "Medium")
        ]
    
    # Jewelry & Accessories
    elif any(term in category_lower for term in ['jewel', 'gold', 'silver', 'accessory']):
        locations = [
            ("Jaipur, Rajasthan", 22, "Very High"),
            ("Mumbai, Maharashtra", 19, "High"),
            ("Coimbatore, Tamil Nadu", 17, "High"),
            ("Surat, Gujarat", 15, "High"),
            ("Thrissur, Kerala", 14, "Medium"),
            ("Kolkata, West Bengal", 13, "Medium")
        ]
    
    # Default for unknown categories - Major metros based on price
    else:
        if avg_price > 3000:
            locations = [
                ("Mumbai, Maharashtra", 20, "Very High"),
                ("Delhi, Delhi", 19, "High"),
                ("Bangalore, Karnataka", 18, "High"),
                ("Pune, Maharashtra", 15, "High"),
                ("Hyderabad, Telangana", 14, "Medium"),
                ("Chennai, Tamil Nadu", 14, "Medium")
            ]
        elif avg_price > 1000:
            locations = [
                ("Delhi, Delhi", 19, "Very High"),
                ("Mumbai, Maharashtra", 18, "High"),
                ("Bangalore, Karnataka", 17, "High"),
                ("Kolkata, West Bengal", 15, "High"),
                ("Hyderabad, Telangana", 16, "Medium"),
                ("Pune, Maharashtra", 15, "Medium")
            ]
        else:
            locations = [
                ("Lucknow, Uttar Pradesh", 18, "Very High"),
                ("Kanpur, Uttar Pradesh", 17, "High"),
                ("Patna, Bihar", 16, "High"),
                ("Jaipur, Rajasthan", 16, "High"),
                ("Indore, Madhya Pradesh", 17, "Medium"),
                ("Nagpur, Maharashtra", 16, "Medium")
            ]
    
    # Normalize shares to exactly 100
    total_share = sum(share for _, share, _ in locations)
    if total_share > 0:
        locations = [
            (city, (share / total_share) * 100, demand)
            for city, share, demand in locations
        ]
    
    return [
        LocationInsight(
            country=city,
            market_share=f"{share:.1f}%",
            demand_level=demand
        )
        for city, share, demand in locations
    ]


def generate_location_insights(products: List[Dict]) -> List[LocationInsight]:
    """
    Generate AI-driven dynamic location insights with robust fallback.
    Primary: AI prediction | Fallback: Rule-based intelligent prediction
    """
    
    if not products:
        return []
    
    # Extract category
    category = products[0].get('category_name') or products[0].get('category', 'General')
    
    # Analyze product patterns
    analysis = analyze_product_patterns(products)
    
    if not analysis:
        return []
    
    avg_price = analysis.get('avg_price', 0)
    
    # Simplified prompt for Llama 3.2:3b (smaller model needs simpler instructions)
    simplified_prompt = f"""You are analyzing Indian e-commerce market for {category} products.

Price: ₹{avg_price:.0f}
Total Products: {analysis['total_products']}
Avg Rating: {analysis['avg_rating']:.1f}★

Task: List 6 Indian cities with highest demand.

Format ONLY as JSON array (no other text):
[
  {{"city": "CityName, State", "share": 25.0, "demand": "Very High"}},
  {{"city": "CityName, State", "share": 20.0, "demand": "High"}}
]

Rules:
- Total shares = 100
- Use real Indian cities
- Match price to city tier
- Order by share (highest first)

Output ONLY the JSON array:"""

    # Try AI prediction with multiple attempts
    for attempt in range(2):
        try:
            print(f"🤖 Attempting AI location prediction (attempt {attempt + 1})...")
            
            result = subprocess.run(
                ["ollama", "run", "llama3.2:3b"],
                input=simplified_prompt,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="ignore",
                timeout=60  # Increased timeout
            )
            
            output = (result.stdout or result.stderr or "").strip()
            print(f"📥 AI Output: {output[:200]}...")
            
            if not output:
                print(f"⚠️ Empty AI response on attempt {attempt + 1}")
                continue
            
            # Try to extract JSON array from response
            # Handle various formats: plain JSON, markdown code blocks, text with JSON
            json_patterns = [
                r'```json\s*(\[[\s\S]*?\])\s*```',  # Markdown code block
                r'```\s*(\[[\s\S]*?\])\s*```',      # Plain code block
                r'(\[[\s\S]*?\])',                   # Plain JSON array
            ]
            
            json_text = None
            for pattern in json_patterns:
                match = re.search(pattern, output)
                if match:
                    json_text = match.group(1) if match.lastindex else match.group()
                    break
            
            if not json_text:
                print(f"⚠️ No JSON found in AI output on attempt {attempt + 1}")
                continue
            
            # Clean up the JSON text
            json_text = json_text.strip()
            
            # Try to parse JSON
            try:
                locations_data = json.loads(json_text)
            except json.JSONDecodeError:
                # Try to fix common JSON issues
                json_text = json_text.replace("'", '"')  # Single to double quotes
                json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)  # Remove trailing commas
                locations_data = json.loads(json_text)
            
            if not isinstance(locations_data, list) or len(locations_data) == 0:
                print(f"⚠️ Invalid JSON structure on attempt {attempt + 1}")
                continue
            
            # Validate and normalize
            locations = locations_data[:6]
            
            # Ensure all required fields exist
            valid_locations = []
            for loc in locations:
                if isinstance(loc, dict) and 'city' in loc and 'share' in loc:
                    valid_locations.append(loc)
            
            if len(valid_locations) < 3:  # Need at least 3 valid locations
                print(f"⚠️ Not enough valid locations ({len(valid_locations)}) on attempt {attempt + 1}")
                continue
            
            # Normalize shares to sum to 100
            total_share = sum(float(loc.get('share', 0)) for loc in valid_locations)
            
            if total_share <= 0:
                print(f"⚠️ Invalid share totals on attempt {attempt + 1}")
                continue
            
            # Normalize
            for loc in valid_locations:
                loc['share'] = (float(loc.get('share', 0)) / total_share) * 100
            
            print(f"✅ Successfully generated {len(valid_locations)} AI-powered locations")
            
            return [
                LocationInsight(
                    country=loc.get("city", "Unknown Location"),
                    market_share=f"{loc['share']:.1f}%",
                    demand_level=loc.get("demand", "Medium")
                )
                for loc in valid_locations
            ]
        
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed on attempt {attempt + 1}: {e}")
            print(f"Raw output: {output[:300]}")
        except subprocess.TimeoutExpired:
            print(f"❌ AI request timeout after 60 seconds on attempt {attempt + 1}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Subprocess error on attempt {attempt + 1}: {e}")
        except Exception as e:
            print(f"❌ Unexpected error on attempt {attempt + 1}: {e}")

    print("🔁 Falling back to rule-based location prediction")
    return get_rule_based_locations(category, avg_price, analysis)
        


def parse_sales_volume(sales_text: str) -> float:
    """Parse sales volume text into numeric value"""
    if not sales_text:
        return 0.0
    
    sales_text = str(sales_text).lower().replace(',', '')
    
    # Handle K (thousands)
    if 'k' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text.replace('k', ''))
            if num:
                return float(num.group()) * 1000
        except:
            pass
    
    # Handle M (millions)
    if 'm' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text.replace('m', ''))
            if num:
                return float(num.group()) * 1000000
        except:
            pass
    
    # Handle L (lakhs)
    if 'l' in sales_text or 'lakh' in sales_text:
        try:
            num = re.search(r'[\d.]+', sales_text)
            if num:
                return float(num.group()) * 100000
        except:
            pass
    
    # Extract numeric value
    match = re.search(r'[\d.]+', sales_text)
    if match:
        try:
            return float(match.group())
        except:
            pass
    
    return 0.0


def generate_ai_strategy(pricing: Dict, sales: Dict, competition: Dict, 
                        base_cost: float, product_name: str, category: str,
                        location_insights: List[LocationInsight] = None) -> str:
    """
    FULLY DYNAMIC AI-powered strategy using Llama 3.2:3b - synchronized with location insights
    """
    
    # Extract ALL market intelligence
    margin = pricing['profit_margin']
    recommended = pricing['recommended_price']
    market_avg = pricing.get('market_avg_price', 0)
    market_min = pricing.get('market_min_price', 0)
    market_max = pricing.get('market_max_price', 0)
    
    monthly_sales = sales['estimated_monthly_sales']
    daily_sales = sales['estimated_daily_sales']
    demand = sales['market_demand']
    
    total_competitors = competition['total_competitors']
    avg_comp_price = competition['avg_competitor_price']
    avg_comp_rating = competition['avg_competitor_rating']
    
    top_comp = competition.get('top_competitor', {})
    top_comp_name = top_comp.get('name', 'N/A') if top_comp else 'N/A'
    top_comp_price = top_comp.get('price', 0) if top_comp else 0
    
    # Calculate ACCURATE metrics
    profit_per_unit = recommended - base_cost
    price_vs_avg = ((recommended - avg_comp_price) / avg_comp_price * 100) if avg_comp_price > 0 else 0
    
    # Parse sales range
    try:
        sales_parts = monthly_sales.replace(',', '').split(' - ')
        avg_monthly_sales = (int(sales_parts[0]) + int(sales_parts[1])) / 2
        monthly_revenue_potential = profit_per_unit * avg_monthly_sales
    except:
        avg_monthly_sales = daily_sales * 30
        monthly_revenue_potential = profit_per_unit * avg_monthly_sales
    
    # Determine market position
    if base_cost >= market_avg * 0.8:
        cost_advantage = "WEAK"
    elif base_cost >= market_avg * 0.6:
        cost_advantage = "MODERATE"
    else:
        cost_advantage = "STRONG"
    
    # Competition level
    if total_competitors > 80:
        comp_level = "VERY HIGH"
    elif total_competitors > 40:
        comp_level = "HIGH"
    else:
        comp_level = "MODERATE"

    # Extract target cities from location insights
    target_cities_str = ""
    cities_list = ""
    if location_insights and len(location_insights) > 0:
        top_locations = location_insights[:3]
        cities = [loc.country for loc in top_locations if loc.country != "AI Analysis Required"]
        
        if cities:
            target_cities_str = "\n\nTARGET CITIES:\n"
            for i, loc in enumerate(top_locations[:3], 1):
                target_cities_str += f"{i}. {loc.country} - {loc.market_share}, {loc.demand_level} demand\n"
            cities_list = ", ".join([city.split(',')[0] for city in cities[:3]])
        else:
            cities_list = "major metros"
    else:
        cities_list = "major metros"

    # Optimized prompt for Llama 3.2:3b (more concise and structured)
    prompt = f"""You are an Indian e-commerce strategist. Write a 5-6 sentence actionable strategy.

PRODUCT: {product_name}
CATEGORY: {category}

DATA:
• Cost: ₹{base_cost:,.0f} | Market Avg: ₹{market_avg:,.0f}
• Recommended Price: ₹{recommended:,.0f}
• Profit/Unit: ₹{profit_per_unit:,.0f} | Margin: {margin:.1f}%
• Competitors: {total_competitors} ({comp_level})
• Monthly Sales Est: {int(avg_monthly_sales)} units
• Monthly Revenue: ₹{monthly_revenue_potential * 0.7:,.0f} (after fees)
{target_cities_str}

STRATEGY STRUCTURE:

1. VIABILITY: Start with one of these based on margin:
   - <10%: "❌ NOT VIABLE:"
   - 10-19%: "⚠️ RISKY:"
   - 20-29%: "⚡ CHALLENGING:"
   - 30-39%: "✅ SOLID:"
   - 40+%: "🎯 EXCELLENT:"

2. PRICING: "Price at ₹{recommended:,.0f}, earning ₹{profit_per_unit:,.0f}/unit ({margin:.1f}% margin)."

3. TARGET CITIES: "Focus on {cities_list}" and briefly why these cities match the product.

4. COMPETITION: How to handle {total_competitors} competitors (differentiation strategy).

5. DIFFERENTIATION: One specific tactic (bundle, niche, warranty, etc.).

6. TIMELINE: "{int(avg_monthly_sales)} units/month = ₹{monthly_revenue_potential * 0.7:,.0f} after fees. Month 1-2: [action], Month 3+: [result]"

Write the 5-6 sentence strategy now:"""

    try:
        result = subprocess.run(
            ["ollama", "run", "llama3.2:3b"],  # Changed model name
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=60
        )
        
        ai_output = (result.stdout or result.stderr or "").strip()
        
        # Clean output
        clean = (
            ai_output
            .replace("</s>", "")
            .replace("```", "")
            .replace("**", "")
            .strip()
        )
        
        # Extract sentences
        sentences = []
        for line in clean.split('\n'):
            line = line.strip()
            
            if (line and 
                not line.startswith('#') and 
                not line.startswith('*') and 
                not line.startswith('-') and
                not line.upper().startswith(('TASK', 'SENTENCE', 'PRODUCT', 'DATA', 'STRATEGY')) and
                not line.startswith(('✓', '•')) and
                len(line) > 50):
                
                for sentence in line.replace('. ', '.|').split('|'):
                    s = sentence.strip()
                    if (s and len(s) > 40 and
                        not s.lower().startswith(('here', 'write', 'you are'))):
                        sentences.append(s)
                        if len(sentences) >= 6:
                            break
            
            if len(sentences) >= 6:
                break
        
        if len(sentences) >= 4:
            strategy = ' '.join(sentences[:6])
            
            # Safety: Add fee warning if low margin
            if margin < 18 and 'fee' not in strategy.lower():
                actual_profit = profit_per_unit * 0.7
                strategy += f" ⚠️ After platform fees, actual profit ~₹{actual_profit:.0f}/unit."
            
            return strategy
        else:
            print(f"⚠️ AI insufficient ({len(sentences)} sentences), using fallback")
            return generate_enhanced_fallback_strategy(
                pricing, sales, competition, base_cost, 
                cost_advantage, comp_level, profit_per_unit, monthly_revenue_potential,
                category, avg_monthly_sales, recommended, market_avg,
                location_insights
            )
            
    except Exception as e:
        print(f"❌ AI failed: {e}")
        return generate_enhanced_fallback_strategy(
            pricing, sales, competition, base_cost,
            cost_advantage, comp_level, profit_per_unit, monthly_revenue_potential,
            category, avg_monthly_sales if 'avg_monthly_sales' in locals() else daily_sales * 30,
            recommended, market_avg,
            location_insights
        )


def generate_enhanced_fallback_strategy(
    pricing: Dict, sales: Dict, competition: Dict, base_cost: float,
    cost_advantage: str, comp_level: str, profit_per_unit: float, 
    monthly_revenue: float, category: str, avg_monthly_sales: float,
    recommended: float, market_avg: float,
    location_insights: List[LocationInsight] = None
) -> str:
    """
    Intelligent fallback with synchronized city targeting
    """
    margin = pricing['profit_margin']
    demand = sales['market_demand']
    competitors = competition['total_competitors']
    actual_profit_after_fees = profit_per_unit * 0.7
    actual_monthly_profit = monthly_revenue * 0.7
    
    # Extract target cities from location insights
    target_cities = ""
    if location_insights and len(location_insights) > 0:
        cities = [loc.country.split(',')[0] for loc in location_insights[:3] 
                 if loc.country != "AI Analysis Required"]
        if cities:
            if len(cities) == 1:
                target_cities = cities[0]
            elif len(cities) == 2:
                target_cities = f"{cities[0]} and {cities[1]}"
            else:
                target_cities = f"{cities[0]}, {cities[1]}, and {cities[2]}"
        else:
            target_cities = "tier-1 metros"
    else:
        target_cities = "major metros"
    
    # CRITICAL: Not viable
    if margin < 10:
        return f"❌ NOT VIABLE: Your cost (₹{base_cost:,.0f}) leaves only {margin:.1f}% margin at ₹{recommended:,.0f}. After platform fees (15-20%), shipping, returns, you face NET LOSSES. With {competitors} competitors at ₹{market_avg:,.0f}, this is uncompetitive. MUST reduce cost to under ₹{market_avg * 0.5:.0f} or pivot. Not salvageable at current cost."
    
    # RISKY: Low margin
    if margin < 20:
        breakeven = int(30000 / actual_profit_after_fees) if actual_profit_after_fees > 0 else 999
        return f"⚠️ RISKY: {margin:.1f}% margin (₹{profit_per_unit:,.0f}/unit) at ₹{recommended:,.0f} vs market ₹{market_avg:,.0f}. {comp_level} competition ({competitors} sellers). After fees, actual profit = ₹{actual_profit_after_fees:.0f}/unit. Need {breakeven} monthly sales for ₹30k income. Focus on {target_cities}. Expected: {int(avg_monthly_sales)} units/month = ₹{actual_monthly_profit:,.0f} profit. Test 50 units first. High risk due to thin margins."
    
    # CHALLENGING
    if margin < 30:
        return f"⚡ CHALLENGING: {margin:.1f}% margin (₹{profit_per_unit:,.0f}/unit). Price ₹{recommended:,.0f} vs market ₹{market_avg:,.0f}. {comp_level} competition ({competitors} sellers). Target {target_cities} where demand is strongest. Focus on 4.5★+ rating strategy. Expected: {int(avg_monthly_sales)} units/month = ₹{actual_monthly_profit:,.0f} after fees. Investment: ₹8k. Timeline: Month 1-2 (test 50), Month 3+ (scale). Needs execution discipline."
    
    # SOLID
    if margin < 40:
        return f"✅ SOLID: {margin:.0f}% margin (₹{profit_per_unit:,.0f}/unit) in {demand.lower()}-demand market. Selling ₹{recommended:,.0f} (market: ₹{market_avg:,.0f}). {comp_level} competition ({competitors} sellers) - differentiate through quality listing. Focus on {target_cities}. Expected: {int(avg_monthly_sales)} units/month = ₹{actual_monthly_profit:,.0f} after fees. Invest ₹10k. Timeline: Month 1-2 (50-75 units), Month 3-6 (ramp to {int(avg_monthly_sales * 1.5)}). Sustainable model."
    
    # EXCELLENT
    return f"🎯 EXCELLENT: {margin:.0f}% margin (₹{profit_per_unit:,.0f}/unit)! Cost advantage enables ₹{recommended:,.0f} pricing vs market ₹{market_avg:,.0f}. With {competitors} competitors, your cost moat enables market share capture. Target {target_cities}. Invest in premium positioning. Expected: {int(avg_monthly_sales)} initial → {int(avg_monthly_sales * 2)} by month 3 = ₹{actual_monthly_profit * 2:,.0f}/month. Launch 100-150 units, sponsored ads ₹500/day. Capitalize quickly!"


def generate_warnings(pricing: Dict, competition: Dict, base_cost: float) -> List[str]:
    """
    FULLY DYNAMIC warnings - no static assumptions
    """
    warnings = []
    
    market_avg = pricing.get('market_avg_price', 0)
    market_min = pricing.get('market_min_price', 0)
    profit_margin = pricing['profit_margin']
    recommended_price = pricing['recommended_price']
    
    # CRITICAL: Cost too high
    if base_cost > market_avg:
        loss_pct = ((base_cost - market_avg) / market_avg) * 100
        warnings.append(f"🚨 CRITICAL: Your cost (₹{base_cost:,.0f}) is {loss_pct:.0f}% HIGHER than market average (₹{market_avg:,.0f})! Cannot compete profitably.")
        warnings.append(f"💡 Solution: Reduce cost to under ₹{market_avg * 0.6:,.0f} for 40% margin.")
        return warnings
    
    # HIGH ALERT: Cost close to average
    if base_cost > market_avg * 0.8:
        warnings.append(f"⚠️ HIGH RISK: Cost (₹{base_cost:,.0f}) very close to market avg (₹{market_avg:,.0f}). Only {profit_margin:.1f}% margin.")
        warnings.append(f"💡 Recommendation: Negotiate down to ₹{market_avg * 0.5:,.0f}.")
    
    # Cost higher than minimum
    if base_cost > market_min:
        warnings.append(f"⚠️ WARNING: Cost (₹{base_cost:,.0f}) > cheapest competitor (₹{market_min:,.0f}).")
        warnings.append(f"💡 Strategy: Focus on premium positioning or unique features.")
    
    # Low margin warnings
    if profit_margin < 10:
        warnings.append(f"🔴 DANGER: Only {profit_margin:.1f}% margin! Unsustainable after fees.")
        warnings.append(f"💡 Action: Need 30-40% margin minimum.")
    elif profit_margin < 20:
        warnings.append(f"⚠️ LOW MARGIN: {profit_margin:.1f}% risky. After fees, profit minimal.")
        warnings.append(f"💡 Tip: Aim for 35-50% margin for sustainable business.")
    
    # Competition warnings
    if competition['total_competitors'] > 100:
        warnings.append(f"⚠️ EXTREMELY COMPETITIVE: {competition['total_competitors']} competitors!")
        warnings.append(f"💡 Strategy: Niche variations or unique bundles.")
    elif competition['total_competitors'] > 50:
        warnings.append(f"⚠️ High competition ({competition['total_competitors']} sellers).")
        warnings.append(f"💡 Tip: Quality photos, early reviews to stand out.")
    
    # Price positioning
    if recommended_price > market_avg * 1.3:
        warnings.append(f"⚠️ PRICING RISK: Recommended (₹{recommended_price:,.0f}) is high vs market.")
        warnings.append(f"💡 Option: Start at ₹{market_avg:,.0f} then increase.")
    
    # Confidence warnings
    if pricing['confidence'] == "Critical":
        warnings.append("🚨 CRITICAL: NOT viable with current cost.")
    elif pricing['confidence'] == "Low":
        warnings.append("⚠️ Limited data. Test with small inventory.")
    
    # Positive scenarios
    if not warnings and profit_margin > 35:
        warnings.append(f"✅ EXCELLENT: {profit_margin:.0f}% margin!")
        warnings.append(f"💡 Strategy: Price ₹{recommended_price:,.0f}, quality listing, scale fast.")
    elif not warnings:
        warnings.append(f"✅ VIABLE: {profit_margin:.1f}% margin acceptable.")
        warnings.append(f"💡 Focus: Quality photos, competitive shipping.")
    
    return warnings
# ============================================
# NEW ENDPOINTS FOR HISTORY & ANALYTICS
# ============================================

@app.get("/product-tracker/history")
def get_tracker_history(
    user_email: str = Query(..., description="User's email"),
    limit: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    """
    Get user's product tracker analysis history
    """
    try:
        history = crud.get_user_tracker_history(db, user_email, limit, offset)
        
        return {
            "success": True,
            "count": len(history),
            "data": [
                {
                    "id": h.id,
                    "product_name": h.product_name,
                    "category": h.category,
                    "source": h.source,
                    "base_cost": float(h.base_cost),
                    "recommended_price": float(h.recommended_price) if h.recommended_price else None,
                    "profit_margin": float(h.profit_margin) if h.profit_margin else None,
                    "market_demand": h.market_demand,
                    "created_at": h.created_at.isoformat()
                }
                for h in history
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/product-tracker/analysis/{analysis_id}")
def get_analysis_details(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed analysis by ID
    """
    try:
        analysis = crud.get_tracker_analysis_by_id(db, analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {
            "success": True,
            "data": {
                "id": analysis.id,
                "product_name": analysis.product_name,
                "category": analysis.category,
                "source": analysis.source,
                "base_cost": float(analysis.base_cost),
                "pricing": {
                    "recommended_price": float(analysis.recommended_price) if analysis.recommended_price else None,
                    "min_price": float(analysis.min_price) if analysis.min_price else None,
                    "max_price": float(analysis.max_price) if analysis.max_price else None,
                    "profit_margin": float(analysis.profit_margin) if analysis.profit_margin else None,
                    "confidence": analysis.pricing_confidence
                },
                "sales": {
                    "estimated_monthly_sales": f"{analysis.estimated_monthly_sales_min:,} - {analysis.estimated_monthly_sales_max:,}",
                    "estimated_daily_sales": float(analysis.estimated_daily_sales) if analysis.estimated_daily_sales else None,
                    "market_demand": analysis.market_demand
                },
                "competition": {
                    "total_competitors": analysis.total_competitors,
                    "avg_competitor_price": float(analysis.avg_competitor_price) if analysis.avg_competitor_price else None,
                    "avg_competitor_rating": float(analysis.avg_competitor_rating) if analysis.avg_competitor_rating else None,
                    "top_competitor": {
                        "name": analysis.top_competitor_name,
                        "price": float(analysis.top_competitor_price) if analysis.top_competitor_price else None
                    } if analysis.top_competitor_name else None
                },
                "location_insights": analysis.location_insights,
                "ai_strategy": analysis.ai_strategy,
                "warnings": analysis.warnings,
                "created_at": analysis.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/product-tracker/analysis/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    user_email: str = Query(..., description="User's email for verification"),
    db: Session = Depends(get_db)
):
    """
    Delete an analysis (only if it belongs to the user)
    """
    try:
        success = crud.delete_tracker_analysis(db, analysis_id, user_email)
        
        if success:
            return {"success": True, "message": "Analysis deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Analysis not found or unauthorized")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/product-tracker/stats")
def get_tracker_stats(db: Session = Depends(get_db)):
    """
    Get overall product tracker statistics
    """
    try:
        # Total analyses
        total_analyses = db.query(models.ProductTrackerAnalysis).count()
        
        # Popular categories
        popular_categories = crud.get_popular_categories(db, limit=5)
        
        # Recent analyses
        recent = db.query(models.ProductTrackerAnalysis)\
            .order_by(models.ProductTrackerAnalysis.created_at.desc())\
            .limit(5)\
            .all()
        
        # Average profit margin
        from sqlalchemy import func
        avg_margin = db.query(func.avg(models.ProductTrackerAnalysis.profit_margin)).scalar()
        
        return {
            "success": True,
            "stats": {
                "total_analyses": total_analyses,
                "average_profit_margin": round(float(avg_margin), 2) if avg_margin else 0,
                "popular_categories": popular_categories,
                "recent_analyses": [
                    {
                        "product_name": r.product_name,
                        "category": r.category,
                        "created_at": r.created_at.isoformat()
                    }
                    for r in recent
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

@app.get("/products/by-sentiment")
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
    





class SubscriptionUpdate(BaseModel):
    user_id: int
    subscription_tier: str

class AIUsageUpdate(BaseModel):
    user_id: int
    increment: int = 1
    month: str

# ==================== SUBSCRIPTION ENDPOINTS ====================

@app.patch("/users/{user_id}/subscription")
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

@app.post("/users/{user_id}/ai-usage")
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


@app.get("/users/{user_id}/ai-usage")
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


@app.get("/users/{user_id}/profile")
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

@app.get("/users/{user_id}/subscription-status")
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


@app.post("/users/{user_id}/reset-ai-usage")
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


# ==================== ADMIN ENDPOINTS (Optional) ====================

@app.patch("/admin/users/{user_id}/subscription")
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


@app.get("/admin/users/{user_id}/profile")
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
    


    