from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Analytics"])
service = AnalyticsService()

@router.get("/analytics-summary")
def analytics_summary(
    source: str = Query("flipkart", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db)
):
    return service.get_summary(db, source)

@router.get("/analytics/category")
def analytics_by_category(db: Session = Depends(get_db)):
    categories = service.get_category_analytics(db)
    return {"categories": categories}
