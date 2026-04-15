from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.flipkart_product_schema import Product
from app.services.flipkart_product_service import FlipkartProductService

router = APIRouter(tags=["Flipkart Products"])
service = FlipkartProductService()

@router.get("/flipkart", response_model=List[Product])
def read_products(
    limit: int = 10, 
    offset: int = 0, 
    category: Optional[str] = None,
    min_price: Optional[float] = None, 
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    return service.get_products(db, limit, offset, category, min_price, max_price)
