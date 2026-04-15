from fastapi import APIRouter
from app.services.amazon_product_details_service import AmazonProductDetailsService

router = APIRouter(tags=["AmazonProductDetails"])
service = AmazonProductDetailsService()
