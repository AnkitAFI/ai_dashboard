from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.rapidapi_flipkart_product_service import RapidapiFlipkartProductService

router = APIRouter(tags=["RapidAPI Flipkart Products"])
service = RapidapiFlipkartProductService()

@router.get("/rapidapi_flipkart_products/summary")
def get_summary(db: Session = Depends(get_db)):
    return service.get_summary(db)

@router.get("/rapidapi_flipkart_products/categories")
def get_flipkart_categories(db: Session = Depends(get_db)):
    return service.get_flipkart_categories(db)
