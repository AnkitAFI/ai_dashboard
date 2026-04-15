from fastapi import APIRouter
from app.services.tracked_product_service import TrackedProductService

router = APIRouter(tags=["TrackedProduct"])
service = TrackedProductService()
