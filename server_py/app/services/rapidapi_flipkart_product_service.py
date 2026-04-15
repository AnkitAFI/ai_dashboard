from sqlalchemy.orm import Session
from app.repositories.rapidapi_flipkart_product_repository import RapidapiFlipkartProductRepository

repo = RapidapiFlipkartProductRepository()

class RapidapiFlipkartProductService:
    def get_summary(self, db: Session):
        return repo.get_summary(db)
        
    def get_flipkart_categories(self, db: Session):
        return repo.get_flipkart_categories(db)
