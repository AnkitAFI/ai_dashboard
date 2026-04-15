from fastapi import APIRouter
from app.services.indian_product_service import IndianProductService

router = APIRouter(tags=["IndianProduct"])
service = IndianProductService()
