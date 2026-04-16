from sqlalchemy.orm import Session
from app.repositories.flipkart_product_repository import FlipkartProductRepository

flipkart_repo = FlipkartProductRepository()

class FlipkartProductService:
    def get_products(self, db: Session, limit: int, offset: int, category: str, min_price: float, max_price: float):
        return flipkart_repo.get_products(db, limit, offset, category, min_price, max_price)

    def get_top_products(self, db: Session, n: int):
        return flipkart_repo.get_top_products(db, n)
