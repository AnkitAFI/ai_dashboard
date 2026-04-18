from fastapi import HTTPException, Depends, Cookie
from sqlalchemy.orm import Session
from .database_config import get_db
from . import models
import json
import os
import redis

r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

SESSION_PREFIX = "session:"

def validate_session(session_token: str) -> dict:
    if not session_token:
        return None
    try:
        key = f"{SESSION_PREFIX}{session_token}"
        data = r.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        print(f"❌ Redis validate session error: {e}")
        return None

def get_current_user(session_id: str = Cookie(None), db: Session = Depends(get_db)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = validate_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user = db.query(models.User).filter(models.User.id == session["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
