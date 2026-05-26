
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict
from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models.user_model import User
from app.models.legacy_models import TrackedProduct
from app.services.inbound_service import SellerInboundService
import random
import json
import threading

class _ReviewSentimentAnalyzer:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        try:
            import nltk
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            try:
                self._sia = SentimentIntensityAnalyzer()
            except Exception:
                nltk.download('vader_lexicon', quiet=True)
                self._sia = SentimentIntensityAnalyzer()
            
            # Custom lexicon updates for e-commerce and spelling errors
            self._sia.lexicon.update({
                "soft": 2.0,
                "premium": 2.0,
                "recieved": 1.0,      # "not recieved" -> negated to negative
                "receievd": 1.0,      # "not receievd" -> negated to negative
                "received": 1.0,
                "delivered": 1.0,
                "awsome": 3.0,
                "awesum": 3.0,
                "superb": 3.0,
                "worst": -3.0,
                "waste": -3.0,
                "useless": -3.0,
                "poor": -2.0,
                "cheap": -1.5,
            })
            self._available = True
        except Exception:
            self._sia = None
            self._available = False

    @classmethod
    def get(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def analyze(self, text: str) -> float:
        """Returns compound score, or 0.0 if not available."""
        if not self._available or not self._sia:
            return 0.0
        return self._sia.polarity_scores(text)['compound']

router = APIRouter(tags=["Seller Dashboard"])


def _empty_response(status="IDLE"):
    return {
        "status": status,
        "metrics": {
            "total_products": 0,
            "avg_rating": 0,
            "avg_price": 0,
            "prime_products_pct": 0,
            "total_reviews": 0,
            "avg_seller_rating": 0,
            "best_sellers_count": 0,
            "amazon_choice_pct": 0,
        },
        "charts": {
            "sales_trend": [],
            "category_distribution": [],
            "review_sentiment": [],
            "rating_distribution": [],
        },
    }


def parse_price(price_str) -> float:
    """Strip currency symbols and convert to float."""
    if price_str is None:
        return 0.0
    try:
        return float(str(price_str).replace("$", "").replace("₹", "").replace(",", "").strip())
    except (ValueError, TypeError):
        return 0.0


def safe_int(value) -> int:
    """Safely cast a value (possibly a string or float) to int. Returns 0 on failure."""
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return 0


@router.get("/dashboard-stats")
def get_seller_dashboard_stats(
    seller_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch dashboard statistics for a specific seller.
    Aggregates data directly from the tracked_products table.
    """
    try:
        db.refresh(current_user)
    except Exception:
        pass
    s_id = seller_id or current_user.seller_id
    if not s_id:
        raise HTTPException(status_code=400, detail="Seller ID is required")

    products = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.seller_id == s_id,
            TrackedProduct.user_email == current_user.email,  # FIX 1
        )
        .all()
    )

    if not products:
        return _empty_response(status=current_user.seller_sync_status)

    total_count = len(products)

    # --- Metrics ---
    avg_rating = sum(p.product_star_rating_numeric or 0 for p in products) / total_count
    avg_price = sum(parse_price(p.product_price) for p in products) / total_count
    prime_count = sum(1 for p in products if p.is_prime)
    total_reviews = sum(p.product_num_ratings or 0 for p in products)
    best_sellers_count = sum(1 for p in products if p.is_best_seller)
    amazon_choice_count = sum(1 for p in products if p.is_amazon_choice)

    # seller_rating is stored on the product row (same seller, so take first non-null value)
    seller_rating_values = [p.seller_rating for p in products if p.seller_rating is not None]
    avg_seller_rating = (sum(seller_rating_values) / len(seller_rating_values)) if seller_rating_values else 0

    # --- Charts ---
    import calendar
    from datetime import datetime
    today = datetime.now()
    months = [calendar.month_abbr[(today.month - i - 1) % 12 + 1] for i in range(5, -1, -1)]

    # Sales Trend: review velocity as a rough proxy
    base_sales = total_reviews / 10
    
    # Use a local random instance seeded by the seller ID and current date 
    # so the mock data stays consistent throughout the day, but updates tomorrow
    seed_value = f"{s_id}_{today.strftime('%Y-%m-%d')}"
    local_random = random.Random(seed_value)
    sales_trend = [
        {"name": m, "sales": int(base_sales * (0.8 + 0.5 * local_random.random()))}
        for m in months
    ]

    # Marketplace / Country Distribution
    country_counts: Dict[str, int] = {}
    for p in products:
        key = p.country or "Other"
        country_counts[key] = country_counts.get(key, 0) + 1
    category_distribution = [{"name": k, "value": v} for k, v in country_counts.items()]

    # Review Sentiment: derived from review_comments text.
    # Falls back to review_ratings if comments are not present or empty.
    pos = neu = neg = 0
    analyzer = _ReviewSentimentAnalyzer.get()

    for p in products:
        has_text_sentiment = False
        try:
            comments = json.loads(p.review_comments) if isinstance(p.review_comments, str) else (p.review_comments or [])
        except (json.JSONDecodeError, TypeError):
            comments = []
            
        valid_comments = [c for c in comments if isinstance(c, str) and c.strip()]
        if valid_comments:
            for comment in valid_comments:
                score = analyzer.analyze(comment)
                if score >= 0.05:
                    pos += 1
                elif score <= -0.05:
                    neg += 1
                else:
                    neu += 1
            has_text_sentiment = True

        if not has_text_sentiment:
            try:
                ratings = json.loads(p.review_ratings) if isinstance(p.review_ratings, str) else (p.review_ratings or [])
            except (json.JSONDecodeError, TypeError):
                ratings = []
                
            for r in ratings:
                rating_int = safe_int(r)
                if rating_int >= 4:
                    pos += 1
                elif rating_int == 3:
                    neu += 1
                else:
                    neg += 1

    total_rated = pos + neu + neg
    if total_rated:
        review_sentiment = [
            {"name": "Positive", "value": round(pos / total_rated * 100)},
            {"name": "Neutral",  "value": round(neu / total_rated * 100)},
            {"name": "Negative", "value": round(neg / total_rated * 100)},
        ]
    else:
        review_sentiment = [
            {"name": "Positive", "value": 75},
            {"name": "Neutral",  "value": 15},
            {"name": "Negative", "value": 10},
        ]

    # Rating Distribution: bucket product_star_rating_numeric into 1–5 stars
    star_buckets: Dict[str, int] = {"1★": 0, "2★": 0, "3★": 0, "4★": 0, "5★": 0}
    for p in products:
        rating = p.product_star_rating_numeric
        if rating is not None:
            star = max(1, min(5, round(float(rating))))
            star_buckets[f"{star}★"] += 1
    rating_distribution = [{"name": k, "count": v} for k, v in star_buckets.items()]

    return {
        "status": current_user.seller_sync_status,
        "metrics": {
            "total_products":     total_count,
            "avg_rating":         round(avg_rating, 2),
            "avg_price":          round(avg_price, 2),
            "prime_products_pct": round((prime_count / total_count) * 100, 1),
            "total_reviews":      total_reviews,
            "avg_seller_rating":  round(avg_seller_rating, 1),
            "best_sellers_count": best_sellers_count,
            "amazon_choice_pct":  round((amazon_choice_count / total_count) * 100, 1),
        },
        "charts": {
            "sales_trend":           sales_trend,
            "category_distribution": category_distribution,
            "review_sentiment":      review_sentiment,
            "rating_distribution":   rating_distribution,
        },
    }


@router.post("/update-seller-id")
def update_seller_id(
    data: Dict[str, str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the seller ID and marketplace for the current user and trigger data ingestion.
    """
    seller_id = data.get("seller_id")
    country = data.get("country", "IN")

    # If seller_id is an empty string or null, treat it as a request to disconnect/clear the connected store
    if not seller_id or seller_id.strip() == "":
        current_user.seller_id = None
        db.commit()
        db.refresh(current_user)
        return {"status": "success", "seller_id": None, "country": country}

    current_user.seller_id = seller_id
    current_user.onboarding_marketplace = country

    db.commit()
    db.refresh(current_user)

    service = SellerInboundService()
    background_tasks.add_task(
        service.ingest_seller_data,
        db=db,
        seller_id=seller_id,
        user_email=current_user.email,
        user_id=current_user.id,
        country=country,
    )

    return {"status": "success", "seller_id": seller_id, "country": country}


@router.get("/products")
def get_seller_products(
    seller_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch all products for a seller directly from tracked_products.
    """
    try:
        db.refresh(current_user)
    except Exception:
        pass
    s_id = seller_id or current_user.seller_id
    if not s_id:
        raise HTTPException(status_code=400, detail="Seller ID is required")

    products = (
        db.query(TrackedProduct)
        .filter(
            TrackedProduct.seller_id == s_id,
            TrackedProduct.user_email == current_user.email,  # FIX 2
        )
        .order_by(TrackedProduct.asin)
        .all()
    )

    if not products:
        return {"products": [], "status": current_user.seller_sync_status}

    result = []
    for p in products:
        result.append({
            "asin":           p.asin,
            "title":          p.product_title or "Unknown Product",
            "image":          p.product_photo or "",
            "price":          p.product_price,
            "rating":         p.product_star_rating_numeric or 0,
            "reviews":        p.product_num_ratings or 0,
            "is_prime":       p.is_prime,
            "is_best_seller": p.is_best_seller,
            "bsr":            "N/A",
            "sales":          p.sales_volume or "N/A",
            "is_fba":         False,
            "country":        p.country,
            "delivery":       p.delivery,
        })

    return {"products": result, "status": current_user.seller_sync_status}