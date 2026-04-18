from sqlalchemy.orm import Session
from app.repositories.rapidapi_amazon_product_repository import RapidapiAmazonProductRepository

repo = RapidapiAmazonProductRepository()

class RapidapiAmazonProductService:
    def get_statistics(self, db: Session):
        return repo.get_statistics(db)
        
    def get_summary(self, db: Session):
        return repo.get_summary(db)
        
    def get_amazon_categories(self, db: Session):
        return repo.get_amazon_categories(db)
