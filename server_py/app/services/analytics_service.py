from sqlalchemy.orm import Session
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.rapidapi_amazon_product_repository import RapidapiAmazonProductRepository
from app.repositories.rapidapi_flipkart_product_repository import RapidapiFlipkartProductRepository

repo = AnalyticsRepository()
amazon_repo = RapidapiAmazonProductRepository()
flipkart_repo = RapidapiFlipkartProductRepository()

class AnalyticsService:
    def get_summary(self, db: Session, source: str):
        if source == "flipkart":
            return flipkart_repo.get_summary(db)
        elif source == "amazon":
            return amazon_repo.get_summary(db)
        elif source == "all":
            return repo.get_summary_all(db)
        else:
            raise ValueError("Invalid source. Must be 'flipkart', 'amazon', or 'all'.")

    def get_category_analytics(self, db: Session):
        return repo.get_category_analytics(db)
