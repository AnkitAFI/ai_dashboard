from sqlalchemy.orm import Session
from sqlalchemy import func, or_, text
from app.db.models.amazon_review_model import AmazonReview

class AmazonReviewRepository:
    def get_reviews(self, db: Session, limit: int = 50, offset: int = 0):
        return db.query(AmazonReview).offset(offset).limit(limit).all()

    def get_review_by_id(self, db: Session, review_id: str):
        return db.query(AmazonReview).filter(AmazonReview.review_id == review_id).first()

    def get_product_reviews(self, db: Session, product_id: str, limit: int = 20):
        return db.query(AmazonReview).filter(AmazonReview.product_id == product_id).limit(limit).all()

    def search_reviews(self, db: Session, query: str, limit: int = 50):
        return db.query(AmazonReview).filter(
            or_(
                AmazonReview.product_title.ilike(f"%{query}%"),
                AmazonReview.review_headline.ilike(f"%{query}%"),
                AmazonReview.review_body.ilike(f"%{query}%")
            )
        ).limit(limit).all()

    def get_review_statistics(self, db: Session):
        query = text("""
            SELECT 
                COUNT(*) as total_reviews,
                ROUND(AVG(star_rating), 2) as average_rating,
                COUNT(DISTINCT product_title) as total_products
            FROM "Amazon_Reviews"
        """)
        row = db.execute(query).fetchone()
        return {
            "total_reviews": int(row.total_reviews) if row.total_reviews else 0,
            "average_rating": float(row.average_rating) if row.average_rating else 0.0,
            "total_products": int(row.total_products) if row.total_products else 0
        }

    def get_sentiment_distribution(self, db: Session):
        return db.query(AmazonReview.Sentiment_pc, func.count(AmazonReview.review_id)).group_by(AmazonReview.Sentiment_pc).all()

    def get_ratings_distribution(self, db: Session):
        return db.query(AmazonReview.star_rating, func.count(AmazonReview.review_id)).group_by(AmazonReview.star_rating).all()

    def get_category_statistics(self, db: Session):
        results = db.query(AmazonReview.product_category, func.count(AmazonReview.review_id)).group_by(AmazonReview.product_category).all()
        return [{"category": category, "count": count} for category, count in results]

    def get_trending_products(self, db: Session, limit: int = 10):
        results = (
            db.query(
                AmazonReview.product_id,
                AmazonReview.product_title,
                AmazonReview.product_category,
                func.count(AmazonReview.review_id).label("review_count"),
                func.avg(AmazonReview.star_rating).label("avg_rating")
            )
            .group_by(AmazonReview.product_id, AmazonReview.product_title, AmazonReview.product_category)
            .order_by(func.count(AmazonReview.review_id).desc())
            .limit(limit)
            .all()
        )
        return [{"product_id": pid, "product_title": title, "category": cat, "review_count": rc, "avg_rating": avg} for pid, title, cat, rc, avg in results]

    def get_monthly_trends(self, db: Session, year: int):
        results = (
            db.query(
                AmazonReview.review_month,
                func.count(AmazonReview.review_id).label("review_count"),
                func.avg(AmazonReview.star_rating).label("avg_rating")
            )
            .filter(AmazonReview.review_year == year)
            .group_by(AmazonReview.review_month)
            .order_by(AmazonReview.review_month)
            .all()
        )
        return [{"month": month, "review_count": count, "avg_rating": avg} for month, count, avg in results]

    def get_helpful_reviews(self, db: Session, limit: int = 10):
        return db.query(AmazonReview).order_by(AmazonReview.helpful_votes.desc()).limit(limit).all()

    def get_product_sentiment_breakdown(self, db: Session, product_id: str):
        results = (
            db.query(AmazonReview.Sentiment_pc, func.count(AmazonReview.review_id).label("count"))
            .filter(AmazonReview.product_id == product_id)
            .group_by(AmazonReview.Sentiment_pc)
            .all()
        )
        return [{"sentiment": sentiment, "count": count} for sentiment, count in results]
