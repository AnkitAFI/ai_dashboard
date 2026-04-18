from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.amazon_review_schema import (
    AmazonReview, SentimentOut, RatingOut, CategoryOut, TrendingProductOut, MonthlyTrendOut
)
from app.services.amazon_review_service import AmazonReviewService

router = APIRouter(tags=["Amazon Reviews"])
service = AmazonReviewService()

@router.get("/reviews", response_model=List[AmazonReview])
def get_reviews(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    return service.get_reviews(db, limit=limit, offset=offset)

@router.get("/reviews/{review_id}", response_model=AmazonReview)
def get_review(review_id: str, db: Session = Depends(get_db)):
    return service.get_review_by_id(db, review_id)

@router.get("/product/{product_id}", response_model=List[AmazonReview])
def get_product_reviews(product_id: str, limit: int = 20, db: Session = Depends(get_db)):
    return service.get_product_reviews(db, product_id, limit)

@router.get("/search/{query}", response_model=List[AmazonReview])
def search_reviews(query: str, limit: int = 50, db: Session = Depends(get_db)):
    return service.search_reviews(db, query, limit)

@router.get("/sentiment", response_model=List[SentimentOut])
def get_sentiment(db: Session = Depends(get_db)):
    results = service.get_sentiment_distribution(db)
    return [SentimentOut(sentiment=sentiment, count=count) for sentiment, count in results]

@router.get("/ratings", response_model=List[RatingOut])
def get_ratings(db: Session = Depends(get_db)):
    results = service.get_ratings_distribution(db)
    return [RatingOut(rating=rating, count=count) for rating, count in results]

@router.get("/categories", response_model=List[CategoryOut])
def get_category_stats(db: Session = Depends(get_db)):
    return service.get_category_statistics(db)

@router.get("/trending", response_model=List[TrendingProductOut])
def get_trending(limit: int = 10, db: Session = Depends(get_db)):
    return service.get_trending_products(db, limit)

@router.get("/trends/monthly", response_model=List[MonthlyTrendOut])
def monthly_trends(year: int, db: Session = Depends(get_db)):
    return service.get_monthly_trends(db, year)

@router.get("/helpful")
def get_helpful(limit: int = 10, db: Session = Depends(get_db)):
    return service.get_helpful_reviews(db, limit)

@router.get("/sentiment/{product_id}", response_model=List[SentimentOut])
def get_product_sentiment(product_id: str, db: Session = Depends(get_db)):
    return service.get_product_sentiment_breakdown(db, product_id)
