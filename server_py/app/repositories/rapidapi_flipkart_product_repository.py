from sqlalchemy.orm import Session
from sqlalchemy import text

class RapidapiFlipkartProductRepository:
    def get_summary(self, db: Session):
        query = """
        SELECT
            COUNT(*) AS total_products,
            AVG(product_price) AS avg_price,
            AVG(product_star_rating) AS avg_rating,
            SUM(product_review_count) AS total_reviews
        FROM rapidapi_flipkart_products
        """
        result = db.execute(text(query)).fetchone()
        return dict(result._mapping) if result else {}

    def get_flipkart_categories(self, db: Session):
        rows = db.execute(text("SELECT DISTINCT category_name as category FROM rapidapi_flipkart_products")).fetchall()
        return [{"category": row.category} for row in rows]
