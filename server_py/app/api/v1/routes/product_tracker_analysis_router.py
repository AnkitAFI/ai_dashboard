from fastapi import APIRouter
from app.services.product_tracker_analysis_service import ProductTrackerAnalysisService

router = APIRouter(tags=["ProductTrackerAnalysis"])
service = ProductTrackerAnalysisService()
