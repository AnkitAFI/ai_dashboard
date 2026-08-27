from fastapi import HTTPException, Depends, Cookie, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
import json
import os
import redis
from jose import JWTError, jwt
from app.core.config import settings
from app.core.cryptography import HashedString

r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
    db=0,
    decode_responses=True
)

SESSION_PREFIX = "session:"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

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

# Import user model carefully to avoid circular imports.
# In a full flow we'd import the repository or model.
def get_current_user(session_id: str = Cookie(None), db: Session = Depends(get_db)):
    from app.db.models.user_model import User
    
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_data = validate_session(session_id)
    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user = db.query(User).filter(User.id == session_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def get_admin_user(current_user = Depends(get_current_user)):
    if getattr(current_user, 'role', 'user') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Forbidden: Admin access required"
        )
    return current_user

def log_admin_action(
    db: Session,
    admin_id: int,
    action: str,
    resource_type: str = None,
    resource_id: str = None,
    ip_address: str = None,
):
    """
    Silently writes an entry to admin_audit_logs.
    Call this inside any admin endpoint to record the action.
    """
    from app.models.schema_v2 import AuditLog
    from app.core.cryptography import HashedString

    ip_hash = None
    if ip_address:
        hasher = HashedString()
        ip_hash = hasher.process_bind_param(ip_address, None)

    try:
        log_entry = AuditLog(
            actor_user_id=admin_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            ip_hash=ip_hash,
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        # Never let logging failure break the actual request
        db.rollback()
        print(f"⚠️ Audit log write failed (non-critical): {e}")

async def get_current_user_jwt(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from app.db.models.user_model import User
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
        
    hash_type = HashedString()
    user = db.query(User).filter(User.email_hash == hash_type.process_bind_param(email, None)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_id(current_user = Depends(get_current_user)) -> str:
    return str(current_user.id)

def get_optional_user(session_id: str = Cookie(None), db: Session = Depends(get_db)):
    from app.db.models.user_model import User
    
    if not session_id:
        return None
    
    session_data = validate_session(session_id)
    if not session_data:
        return None
    
    return db.query(User).filter(User.id == session_data["user_id"]).first()

def require_premium_tier(current_user = Depends(get_current_user)):
    """
    Enforces that the user has an active premium or enterprise subscription.
    Checks the live database record on every request, so downgrades take effect instantly.
    """
    tier = (getattr(current_user, 'subscription_tier', 'free') or 'free').lower()
    if tier not in ['premium', 'enterprise']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This feature requires a Premium or Enterprise subscription."
        )
    return current_user

def require_enterprise_tier(current_user = Depends(get_current_user)):
    """
    Enforces that the user has an active enterprise subscription.
    """
    tier = (getattr(current_user, 'subscription_tier', 'free') or 'free').lower()
    if tier != 'enterprise':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This feature requires an Enterprise subscription."
        )
    return current_user