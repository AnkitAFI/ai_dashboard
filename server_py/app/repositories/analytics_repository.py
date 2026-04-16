from sqlalchemy.orm import Session
from sqlalchemy import text

class AnalyticsRepository:
    def get_summary_all(self, db: Session):
        query = """
        SELECT
            SUM(total_products) AS total_products,
            AVG(avg_price) AS avg_price,
            AVG(avg_rating) AS avg_rating,
            SUM(total_reviews) AS total_reviews
        FROM (
            SELECT
                COUNT(*) AS total_products,
                AVG(product_price) AS avg_price,
                AVG(product_star_rating) AS avg_rating,
                SUM(product_review_count) AS total_reviews
            FROM rapidapi_flipkart_products
            UNION ALL
            SELECT
                COUNT(*) AS total_products,
                AVG(product_price_numeric) AS avg_price,
                AVG(product_star_rating_numeric) AS avg_rating,
                SUM(product_num_ratings) AS total_reviews
            FROM rapidapi_amazon_products
        ) combined
        """
        result = db.execute(text(query)).fetchone()
        return dict(result._mapping) if result else {}

    def get_category_analytics(self, db: Session):
        query = """
        SELECT 
            category,
            COUNT(*) AS total_products,
            AVG(price) AS avg_price,
            AVG(rating) AS avg_rating,
            SUM(reviews) AS total_reviews,
            source
        FROM (
            -- Flipkart data
            SELECT 
                category_name AS category, 
                product_price AS price, 
                product_star_rating AS rating, 
                product_review_count AS reviews, 
                'flipkart' AS source
            FROM rapidapi_flipkart_products
            WHERE product_price IS NOT NULL 
              AND product_star_rating IS NOT NULL
              AND category_name IS NOT NULL

            UNION ALL

            -- Amazon data
            SELECT 
                category_name AS category, 
                product_price_numeric AS price, 
                product_star_rating_numeric AS rating, 
                product_num_ratings AS reviews, 
                'amazon' AS source
            FROM rapidapi_amazon_products
            WHERE product_price_numeric IS NOT NULL 
              AND product_star_rating_numeric IS NOT NULL
              AND category_name IS NOT NULL
        ) combined
        GROUP BY category, source
        ORDER BY total_reviews DESC
        """
        result = db.execute(text(query))
        return [dict(row._mapping) for row in result]
