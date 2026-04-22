# from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# from typing import List, Dict, Any
# from app.db.session import get_db
# from app.api.deps import get_current_user
# from app.db.models.user_model import User
# from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts
# from app.services.inbound_service import SellerInboundService
# import json
# import random

# router = APIRouter(tags=["Seller Dashboard"])

# @router.get("/dashboard-stats")
# def get_seller_dashboard_stats(
#     seller_id: str = None, 
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Fetch dashboard statistics for a specific seller.
#     Aggregates data from rapidapi_amazon_products table.
#     """
#     s_id = seller_id or current_user.seller_id
#     if not s_id:
#         raise HTTPException(status_code=400, detail="Seller ID is required")

#     # 1. Get ASINs for this seller from tracked_products
#     asins = sorted([r.asin for r in db.query(TrackedProduct).filter(TrackedProduct.seller_id == s_id).all()])
    
#     if not asins:
#         # If no products tracked yet, we might return zeros or trigger a fetch.
#         # For now, let's return zeros so the UI doesn't break.
#         return {
#             "metrics": {
#                 "total_products": 0,
#                 "avg_rating": 0,
#                 "avg_price": 0,
#                 "prime_products_pct": 0,
#                 "total_reviews": 0,
#                 "avg_bsr": 0,
#                 "best_sellers_count": 0,
#                 "fba_rate_pct": 0
#             },
#             "charts": {
#                 "sales_trend": [],
#                 "category_distribution": [],
#                 "review_sentiment": [],
#                 "bsr_trend": []
#             }
#         }

#     # 2. Query rapidapi_amazon_products for these ASINs
#     products = db.query(RapidapiAmazonProducts).filter(RapidapiAmazonProducts.asin.in_(asins)).all()
    
#     total_count = len(products)
#     if total_count == 0:
#         return {
#             "metrics": {
#                 "total_products": 0,
#                 "avg_rating": 0,
#                 "avg_price": 0,
#                 "prime_products_pct": 0,
#                 "total_reviews": 0,
#                 "avg_bsr": 0,
#                 "best_sellers_count": 0,
#                 "fba_rate_pct": 0
#             },
#             "charts": {
#                 "sales_trend": [],
#                 "category_distribution": [],
#                 "review_sentiment": [],
#                 "bsr_trend": []
#             }
#         }

#     # 3. Calculate metrics
#     avg_rating = sum(p.product_star_rating_numeric or 0 for p in products) / total_count
#     avg_price = sum(p.product_price_numeric or 0 for p in products) / total_count
#     prime_count = sum(1 for p in products if p.is_prime)
#     total_reviews = sum(p.product_num_ratings or 0 for p in products)
#     best_sellers_count = sum(1 for p in products if p.is_best_seller)
    
#     # BSR and FBA Rate (usually in raw_data)
#     fba_count = 0
#     bsr_values = []
    
#     for p in products:
#         raw = p.raw_data or {}
#         # FBA check
#         if raw.get("is_amazon_fulfilled") or raw.get("is_fba"):
#             fba_count += 1
#         # BSR check (can vary by category)
#         bsr = raw.get("product_bsr") or raw.get("bsr")
#         if bsr and isinstance(bsr, (int, float)):
#             bsr_values.append(bsr)
            
#     avg_bsr = sum(bsr_values) / len(bsr_values) if bsr_values else 0
    
#     # 4. Format Charts Data (Mocking historical trends for now)
#     # Sales Trend (6 Months)
#     months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
#     sales_trend = []
#     base_sales = total_reviews / 10 # Rough estimate
#     for m in months:
#         sales_trend.append({"name": m, "sales": int(base_sales * (0.8 + 0.5 * random.random()))})

#     # Category Distribution
#     cat_counts = {}
#     for p in products:
#         cat = p.category_name or "Other"
#         cat_counts[cat] = cat_counts.get(cat, 0) + 1
#     category_distribution = [{"name": k, "value": v} for k, v in cat_counts.items()]

#     # Review Sentiment
#     # We can use actual review data if available, or mock for this view.
#     review_sentiment = [
#         {"name": "Positive", "value": 75},
#         {"name": "Neutral", "value": 15},
#         {"name": "Negative", "value": 10}
#     ]

#     # BSR Trend
#     bsr_trend = []
#     for m in months:
#         bsr_trend.append({"name": m, "bsr": int(avg_bsr * (0.9 + 0.2 * random.random())) if avg_bsr else random.randint(100, 500)})

#     return {
#         "status": current_user.seller_sync_status,
#         "metrics": {
#             "total_products": total_count,
#             "avg_rating": round(avg_rating, 2),
#             "avg_price": round(avg_price, 2),
#             "prime_products_pct": round((prime_count / total_count) * 100, 1),
#             "total_reviews": total_reviews,
#             "avg_bsr": int(avg_bsr),
#             "best_sellers_count": best_sellers_count,
#             "fba_rate_pct": round((fba_count / total_count) * 100, 1) if total_count > 0 else 0
#         },
#         "charts": {
#             "sales_trend": sales_trend,
#             "category_distribution": category_distribution,
#             "review_sentiment": review_sentiment,
#             "bsr_trend": bsr_trend
#         }
#     }

# @router.post("/update-seller-id")
# def update_seller_id(
#     data: Dict[str, str], 
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Update the seller ID and marketplace for the current user and trigger data ingestion.
#     """
#     seller_id = data.get("seller_id")
#     country = data.get("country", "IN") # Default to India as per user requirements
    
#     if not seller_id:
#         raise HTTPException(status_code=400, detail="Seller ID is required")
    
#     current_user.seller_id = seller_id
#     current_user.onboarding_marketplace = country
    
#     db.commit()
#     db.refresh(current_user)

#     # Trigger background ingestion
#     service = SellerInboundService()
#     background_tasks.add_task(
#         service.ingest_seller_data,
#         db=db,
#         seller_id=seller_id,
#         user_email=current_user.email,
#         user_id=current_user.id,
#         country=country
#     )

#     return {"status": "success", "seller_id": seller_id, "country": country}

# @router.get("/products")
# def get_seller_products(
#     seller_id: str = None, 
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Fetch all products matching the seller_id.
#     """
#     s_id = seller_id or current_user.seller_id
#     if not s_id:
#         raise HTTPException(status_code=400, detail="Seller ID is required")

#     # 1. Get ASINs for this seller from tracked_products
#     asins = sorted([r.asin for r in db.query(TrackedProduct).filter(TrackedProduct.seller_id == s_id).all()])
    
#     if not asins:
#         return {"products": []}

#     # 2. Query rapidapi_amazon_products for these ASINs
#     products = db.query(RapidapiAmazonProducts).filter(RapidapiAmazonProducts.asin.in_(asins)).all()
    
#     result = []
#     for p in products:
#         raw = p.raw_data or {}
#         bsr = raw.get("product_bsr") or raw.get("bsr") or "N/A"
#         if isinstance(bsr, (int, float)):
#             bsr = f"#{int(bsr)}"
        
#         # Estimate sales volume for demo purposes if not present
#         sales_vol = raw.get("sales_volume", f"{random.randint(1, 10)}K+")
        
#         # FBA / Prime status
#         is_fba = bool(raw.get("is_amazon_fulfilled") or raw.get("is_fba"))
        
#         result.append({
#             "asin": p.asin,
#             "title": p.product_title or "Unknown Product",
#             "image": p.product_photo or "",
#             "price": p.product_price,
#             "rating": p.product_star_rating_numeric or 0,
#             "reviews": p.product_num_ratings or 0,
#             "is_prime": p.is_prime,
#             "is_best_seller": p.is_best_seller,
#             "bsr": bsr,
#             "sales": sales_vol,
#             "is_fba": is_fba
#         })
        
#     return {"products": result}


from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict
from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models.user_model import User
from app.models.legacy_models import TrackedProduct
from app.services.inbound_service import SellerInboundService
import random

router = APIRouter(tags=["Seller Dashboard"])


def _empty_response():
    return {
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
    s_id = seller_id or current_user.seller_id
    if not s_id:
        raise HTTPException(status_code=400, detail="Seller ID is required")

    products = (
        db.query(TrackedProduct)
        .filter(TrackedProduct.seller_id == s_id)
        .all()
    )

    if not products:
        return _empty_response()

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
    months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]

    # Sales Trend: review velocity as a rough proxy
    base_sales = total_reviews / 10
    sales_trend = [
        {"name": m, "sales": int(base_sales * (0.8 + 0.5 * random.random()))}
        for m in months
    ]

    # Marketplace / Country Distribution
    country_counts: Dict[str, int] = {}
    for p in products:
        key = p.country or "Other"
        country_counts[key] = country_counts.get(key, 0) + 1
    category_distribution = [{"name": k, "value": v} for k, v in country_counts.items()]

    # Review Sentiment: derived from review_ratings column.
    # review_ratings may be stored as a list of ints OR strings — safe_int handles both.
    pos = neu = neg = 0
    for p in products:
        ratings = p.review_ratings or []
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

    if not seller_id:
        raise HTTPException(status_code=400, detail="Seller ID is required")

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
    s_id = seller_id or current_user.seller_id
    if not s_id:
        raise HTTPException(status_code=400, detail="Seller ID is required")

    products = (
        db.query(TrackedProduct)
        .filter(TrackedProduct.seller_id == s_id)
        .order_by(TrackedProduct.asin)
        .all()
    )

    if not products:
        return {"products": []}

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

    return {"products": result}