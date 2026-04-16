from fastapi import HTTPException, Depends, Cookie, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
import json
import os
import redis
from jose import JWTError, jwt
from app.core.config import settings

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
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
