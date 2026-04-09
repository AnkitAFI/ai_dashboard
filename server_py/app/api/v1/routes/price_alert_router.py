from fastapi import APIRouter
from app.services.price_alert_service import PriceAlertService

router = APIRouter(tags=["PriceAlert"])
service = PriceAlertService()
