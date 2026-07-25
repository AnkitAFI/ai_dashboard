from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserOut, OnboardingUpdate
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.api.deps import get_current_user, get_admin_user, log_admin_action
from app.db.models.user_model import User
import pyotp
import bcrypt
from pydantic import BaseModel
from jose import jwt, JWTError
from app.core.config import settings
from app.core.cryptography import EncryptedString

class MFASetupResponse(BaseModel):
    provisioning_uri: str
    secret: str

class MFAVerifyRequest(BaseModel):
    code: str

class MFALoginRequest(BaseModel):
    temp_token: str
    code: str

class MFADisableRequest(BaseModel):
    password: str
    code: str

router = APIRouter(tags=["Auth"])
user_service = UserService()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Create a new user with hashed password and formatted business interests.
    """
    return user_service.register_user(db, user, request=request, background_tasks=background_tasks)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    from app.repositories.user_repository import UserRepository
    from app.core.security import verify_password
    
    user_repo = UserRepository()
    user = user_repo.get_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Block soft-deleted accounts from logging in
    if getattr(user, "is_active", True) is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deleted. Please contact support to restore it."
        )
        
        
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == user.id).first()

    if user_auth and getattr(user_auth, "mfa_enabled", False):
        # Create a temporary token for MFA verification
        temp_expires = timedelta(minutes=10)
        temp_token = create_access_token(
            data={"sub": user.email, "scope": "mfa_pending"}, expires_delta=temp_expires
        )
        return {"status": "mfa_required", "temp_token": temp_token}
    
    # Create standard token
    access_token_expires = timedelta(days=settings.SESSION_EXPIRE_DAYS_NO_REMEMBER)
    access_token = create_access_token(
        data={"sub": user.email, "scope": "full_access"}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/mfa/setup", response_model=MFASetupResponse)
def mfa_setup(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=current_user.email, issuer_name="Insydz")
    return {"provisioning_uri": provisioning_uri, "secret": secret}

class MFAVerifySetupRequest(BaseModel):
    secret: str
    code: str

@router.post("/mfa/verify-setup")
def mfa_verify_setup(req: MFAVerifySetupRequest, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    totp = pyotp.TOTP(req.secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    if not user_auth:
        raise HTTPException(status_code=500, detail="UserAuth record not found")
        
    user_auth.mfa_secret = req.secret
    user_auth.mfa_enabled = True
    
    # Generate 8 backup codes
    import secrets
    import string
    backup_codes_plain = []
    backup_codes_hashed = []
    
    for _ in range(8):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        backup_codes_plain.append(code)
        # Hash code
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(code.encode('utf-8'), salt).decode('utf-8')
        backup_codes_hashed.append(hashed)
        
    user_auth.mfa_backup_codes = backup_codes_hashed
    
    from app.models.schema_v2 import AuditLog
    from app.core.cryptography import HashedString
    
    ip_hash = None
    if request.client and request.client.host:
        hasher = HashedString()
        ip_hash = hasher.process_bind_param(request.client.host, None)
        
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="MFA_ENABLED",
        resource_type="USER_AUTH",
        resource_id=str(current_user.id),
        ip_hash=ip_hash
    )
    db.add(audit)
    db.commit()
    
    return {"message": "MFA enabled successfully", "backup_codes": backup_codes_plain}

@router.post("/mfa/disable")
def mfa_disable(req: MFADisableRequest, request: Request, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.core.security import verify_password
    if not verify_password(req.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    if not user_auth:
        raise HTTPException(status_code=500, detail="UserAuth record not found")
        
    if not user_auth.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA is not enabled")
        
    totp = pyotp.TOTP(user_auth.mfa_secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid MFA code")
        
    user_auth.mfa_enabled = False
    user_auth.mfa_secret = None
    user_auth.mfa_backup_codes = None
    
    from app.models.schema_v2 import AuditLog
    from app.core.cryptography import HashedString
    
    ip_hash = None
    if request.client and request.client.host:
        hasher = HashedString()
        ip_hash = hasher.process_bind_param(request.client.host, None)
        
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="MFA_DISABLED",
        resource_type="USER_AUTH",
        resource_id=str(current_user.id),
        ip_hash=ip_hash
    )
    db.add(audit)
    db.commit()
    return {"message": "MFA disabled successfully"}

@router.get("/mfa/status")
def mfa_status(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == current_user.id).first()
    return {"mfa_enabled": getattr(user_auth, "mfa_enabled", False)}

@router.post("/mfa/verify-login")
def mfa_verify_login(req: MFALoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    from app.core.security import verify_password
    try:
        payload = jwt.decode(req.temp_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("scope") != "mfa_pending":
            raise HTTPException(status_code=401, detail="Invalid token scope")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    from app.repositories.user_repository import UserRepository
    user_repo = UserRepository()
    user = user_repo.get_by_email(db, email=email)
    
    from app.models.schema_v2 import UserAuth
    user_auth = db.query(UserAuth).filter(UserAuth.id == user.id).first()
    
    if not user_auth or not user_auth.mfa_enabled:
        raise HTTPException(status_code=401, detail="User not found or MFA not enabled")
    
    # Helper to finish login
    def finish_login(user_obj):
        from app.api.v1.routes.legacy_router import (
            create_session, delete_all_user_sessions, 
            SESSION_EXPIRE_DAYS_NO_REMEMBER, SESSION_COOKIE_SECURE
        )
        from datetime import datetime
        
        ip_address = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
        if ip_address:
            ip_address = ip_address.split(",")[0].strip()
        else:
            ip_address = request.client.host if request.client else "Unknown IP"
            
        user_agent = request.headers.get("user-agent")

        delete_all_user_sessions(user_obj.id)

        session_token = create_session(
            user_id=user_obj.id,
            remember_me=False,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        max_age = SESSION_EXPIRE_DAYS_NO_REMEMBER * 24 * 60 * 60
        response.set_cookie(
            key="session_id",
            value=session_token,
            httponly=True,
            secure=SESSION_COOKIE_SECURE,
            samesite="lax",
            max_age=max_age,
        )
        
        from app.models.schema_v2 import AuditLog
        audit_log = AuditLog(
            actor_user_id=user_obj.id,
            action="user_logged_in_mfa",
            resource_type="User",
            resource_id=str(user_obj.id),
            ip_hash=ip_address
        )
        db.add(audit_log)
        db.commit()
        
        current_month = datetime.now().strftime("%Y-%m")
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user_obj.id,
                "first_name": user_obj.first_name,
                "last_name": user_obj.last_name,
                "email": user_obj.email,
                "business_name": user_obj.business_name,
                "location": user_obj.location,
                "business_interests": user_obj.business_interests,
                "subscription_tier": user_obj.subscription_tier or 'free',
                "ai_chat_used": user_obj.ai_chat_used or 0,
                "ai_chat_month": user_obj.ai_chat_month or current_month,
                "created_at": str(user_obj.created_at)
            }
        }

    # Check TOTP
    secret = user_auth.mfa_secret
    totp = pyotp.TOTP(secret)
    if totp.verify(req.code, valid_window=1):
        return finish_login(user)
    
    # Check backup codes if TOTP fails
    if user_auth.mfa_backup_codes:
        for idx, hashed_code in enumerate(user_auth.mfa_backup_codes):
            if bcrypt.checkpw(req.code.encode('utf-8'), hashed_code.encode('utf-8')):
                codes = list(user_auth.mfa_backup_codes)
                codes.pop(idx)
                user_auth.mfa_backup_codes = codes
                db.commit()
                return finish_login(user)

    raise HTTPException(status_code=401, detail="Invalid code")

@router.post("/onboarding", response_model=UserOut)
def update_onboarding(
    onboarding: OnboardingUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update onboarding information for the current user.
    Triggers product ingestion in the background if seller_id is provided.
    """
    return user_service.update_onboarding(
        db, 
        current_user.id, 
        onboarding.model_dump(),
        background_tasks
    )

@router.get('/admin/test-access')
def admin_only_access(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="admin_access_test",
        resource_type="system",
        ip_address=request.client.host if request.client else None,
    )
    return {'message': f'Welcome Admin {current_user.first_name}! Access granted.'}

@router.get('/admin/audit-logs')
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
    limit: int = 50,
):
    """
    Returns the most recent admin audit log entries.
    Only accessible by admins.
    """
    from app.models.schema_v2 import AuditLog
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": log.id,
            "admin_id": log.actor_user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]

