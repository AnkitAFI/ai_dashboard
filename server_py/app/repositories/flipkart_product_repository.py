from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from app.db.models.flipkart_product_model import Product

class FlipkartProductRepository:
    def get_products(self, db: Session, limit: int, offset: int, category: str = None,
                     min_price: float = None, max_price: float = None) -> List[Dict[str, Any]]:
        query = "SELECT * FROM flipkart WHERE 1=1"
        params = {"limit": limit, "offset": offset}
        
        if category:
            query += " AND category = :category"
            params["category"] = category
        if min_price is not None:
            query += " AND price >= :min_price"
            params["min_price"] = min_price
        if max_price is not None:
            query += " AND price <= :max_price"
            params["max_price"] = max_price
            
        query += " ORDER BY last_updated DESC LIMIT :limit OFFSET :offset"

        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result]

    def get_top_products(self, db: Session, n: int):
        return db.query(Product).order_by(Product.rating.desc()).limit(n).all()
