from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.rapidapi_amazon_product_service import RapidapiAmazonProductService

router = APIRouter(tags=["RapidAPI Amazon Products"])
service = RapidapiAmazonProductService()

@router.get("/rapidapi_amazon_products/statistics")
def get_statistics(db: Session = Depends(get_db)):
    """
    Return summary statistics for RapidAPI Amazon Products table
    including total products, average rating, and total reviews count.
    """
    return service.get_statistics(db)

@router.get("/rapidapi_amazon_products/summary")
def get_summary(db: Session = Depends(get_db)):
    return service.get_summary(db)

@router.get("/rapidapi_amazon_products/categories")
def get_amazon_categories(db: Session = Depends(get_db)):
    return service.get_amazon_categories(db)
