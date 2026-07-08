from fastapi import APIRouter, Depends, Query, BackgroundTasks, Request, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.api.deps import r, get_optional_user, get_current_user
from app.models.legacy_models import UserBehaviorLog
import json
from datetime import datetime

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


class EventItemSchema(BaseModel):
    id: Optional[str] = None
    session_id: str
    event_type: str
    page_path: str
    properties: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: Optional[str] = None


class BehaviorBatchSchema(BaseModel):
    events: List[EventItemSchema]


def save_behavior_batch_to_db(db: Session, events_data: List[dict]):
    try:
        db_logs = []
        for ev in events_data:
            created_at_dt = None
            if ev.get("created_at"):
                try:
                    ts = ev["created_at"].replace("Z", "+00:00")
                    created_at_dt = datetime.fromisoformat(ts)
                except Exception:
                    created_at_dt = datetime.utcnow()
            else:
                created_at_dt = datetime.utcnow()

            # Only store logs that have a valid user identity (Skip all anonymous/NULL logs)
            if not ev.get("user_email"):
                continue

            db_logs.append(UserBehaviorLog(
                user_id=ev.get("user_id"),
                user_email=ev.get("user_email"),
                session_id=ev["session_id"],
                event_type=ev["event_type"],
                page_path=ev["page_path"],
                properties=ev.get("properties") or {},
                ip_address=ev.get("ip_address"),
                user_agent=ev.get("user_agent"),
                created_at=created_at_dt
            ))
        
        if db_logs:
            db.add_all(db_logs)
            db.commit()

            # (The automated 90-day pruning logic was completely removed at your request to keep logs permanently)
    except Exception as e:
        db.rollback()
        print(f"Error saving behavior logs to database: {e}")


@router.post("/behavior-tracking/batch", status_code=202)
def track_behavior_batch(
    payload: BehaviorBatchSchema,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[Any] = Depends(get_optional_user)
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    user_id = current_user.id if current_user else None
    user_email = current_user.email if current_user else None

    # Skip tracking for the admin account — we don't want to pollute behavior logs with internal usage
    EXCLUDED_FROM_TRACKING = {"syatharthdelhi@gmail.com"}
    if user_email in EXCLUDED_FROM_TRACKING:
        return {"status": "skipped", "count": 0}

    events_data = []
    for ev in payload.events:
        event_dict = ev.dict()
        event_dict["ip_address"] = ip_address
        event_dict["user_agent"] = user_agent
        event_dict["user_id"] = user_id
        event_dict["user_email"] = user_email
        events_data.append(event_dict)


    if events_data:
        background_tasks.add_task(save_behavior_batch_to_db, db, events_data)

    return {"status": "queued", "count": len(events_data)}


@router.get("/admin/behavior-logs")
def get_admin_behavior_logs(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ADMIN_EMAIL = "syatharthdelhi@gmail.com"
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=404, detail="Not found")

    # Limit removed at your request to load all logs
    logs = db.query(UserBehaviorLog).order_by(UserBehaviorLog.created_at.desc()).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "session_id": log.session_id,
            "event_type": log.event_type,
            "page_path": log.page_path,
            "properties": log.properties or {},
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": str(log.created_at),
            "user_email": log.user_email
        }
        for log in logs
    ]

