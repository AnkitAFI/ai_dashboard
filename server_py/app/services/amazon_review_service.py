from sqlalchemy.orm import Session
from app.repositories.amazon_review_repository import AmazonReviewRepository

review_repo = AmazonReviewRepository()

class AmazonReviewService:
    def get_reviews(self, db: Session, limit: int, offset: int):
        return review_repo.get_reviews(db, limit, offset)

    def get_review_by_id(self, db: Session, review_id: str):
        return review_repo.get_review_by_id(db, review_id)

    def get_product_reviews(self, db: Session, product_id: str, limit: int):
        return review_repo.get_product_reviews(db, product_id, limit)

    def search_reviews(self, db: Session, query: str, limit: int):
        return review_repo.search_reviews(db, query, limit)

    def get_sentiment_distribution(self, db: Session):
        return review_repo.get_sentiment_distribution(db)

    def get_ratings_distribution(self, db: Session):
        return review_repo.get_ratings_distribution(db)

    def get_category_statistics(self, db: Session):
        return review_repo.get_category_statistics(db)

    def get_trending_products(self, db: Session, limit: int):
        return review_repo.get_trending_products(db, limit)

    def get_monthly_trends(self, db: Session, year: int):
        return review_repo.get_monthly_trends(db, year)

    def get_helpful_reviews(self, db: Session, limit: int):
        return review_repo.get_helpful_reviews(db, limit)

    def get_product_sentiment_breakdown(self, db: Session, product_id: str):
        return review_repo.get_product_sentiment_breakdown(db, product_id)
