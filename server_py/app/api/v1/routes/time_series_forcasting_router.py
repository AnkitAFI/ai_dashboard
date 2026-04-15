from fastapi import APIRouter
from app.services.time_series_forcasting_service import TimeSeriesForcastingService

router = APIRouter(tags=["TimeSeriesForcasting"])
service = TimeSeriesForcastingService()
