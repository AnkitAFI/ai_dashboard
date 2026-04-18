from sqlalchemy.orm import Session
from sqlalchemy import text

class RapidapiAmazonProductRepository:
    def get_summary(self, db: Session):
        query = """
        SELECT
            COUNT(*) AS total_products,
            AVG(product_price_numeric) AS avg_price,
            AVG(product_star_rating_numeric) AS avg_rating,
            SUM(product_num_ratings) AS total_reviews
        FROM rapidapi_amazon_products
        """
        result = db.execute(text(query)).fetchone()
        return dict(result._mapping) if result else {}

    def get_statistics(self, db: Session):
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

    def get_amazon_categories(self, db: Session):
        rows = db.execute(text("SELECT DISTINCT category_name AS category FROM rapidapi_amazon_products")).fetchall()
        return [{"category": row.category} for row in rows]
