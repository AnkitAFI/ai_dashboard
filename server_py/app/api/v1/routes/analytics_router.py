from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.api.deps import r
import json

router = APIRouter(tags=["Analytics"])
service = AnalyticsService()

@router.get("/analytics-summary")
def analytics_summary(
    source: str = Query("flipkart", enum=["flipkart", "amazon", "all"]),
    db: Session = Depends(get_db)
):
    cache_key = f"analytics:summary:{source}"
    try:
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis error: {e}")

    data = service.get_summary(db, source)
    
    try:
        r.setex(cache_key, 900, json.dumps(data))  # 15 min cache
    except Exception as e:
        print(f"Redis error: {e}")
        
    return data

@router.get("/analytics/category")
def analytics_by_category(db: Session = Depends(get_db)):
    cache_key = "analytics:category"
    try:
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis error: {e}")

    categories = service.get_category_analytics(db)
    result = {"categories": categories}
    
    try:
        r.setex(cache_key, 900, json.dumps(result))  # 15 min cache
    except Exception as e:
        print(f"Redis error: {e}")
        
    return result
