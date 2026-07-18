from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, Request
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
        
        
    if getattr(user, "mfa_enabled", False):
        temp_expires = timedelta(minutes=5)
        temp_token = create_access_token(
            data={"sub": user.email, "scope": "mfa_pending"}, expires_delta=temp_expires
        )
        return {"status": "mfa_required", "temp_token": temp_token}

    access_token_expires = timedelta(minutes=30)
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
def mfa_verify_setup(req: MFAVerifySetupRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    totp = pyotp.TOTP(req.secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    current_user.mfa_secret = req.secret
    current_user.mfa_enabled = True
    
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
        
    current_user.mfa_backup_codes = backup_codes_hashed
    db.commit()
    
    return {"message": "MFA enabled successfully", "backup_codes": backup_codes_plain}

@router.post("/mfa/disable")
def mfa_disable(req: MFADisableRequest, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.core.security import verify_password
    if not verify_password(req.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
        
    totp = pyotp.TOTP(current_user.mfa_secret)
    if not totp.verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid MFA code")
        
    current_user.mfa_enabled = False
    current_user.mfa_secret = None
    current_user.mfa_backup_codes = None
    db.commit()
    return {"message": "MFA disabled successfully"}

@router.get("/mfa/status")
def mfa_status(current_user = Depends(get_current_user)):
    return {"mfa_enabled": getattr(current_user, "mfa_enabled", False)}

@router.post("/mfa/verify-login")
def mfa_verify_login(req: MFALoginRequest, db: Session = Depends(get_db)):
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
    
    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=401, detail="User not found or MFA not enabled")
    
    # Check TOTP
    secret = user.mfa_secret
    # In schema_v2, mfa_secret is EncryptedString. Assuming accessing it returns decrypted text.
    totp = pyotp.TOTP(secret)
    if totp.verify(req.code, valid_window=1):
        access_token = create_access_token(
            data={"sub": user.email, "scope": "full_access"}, expires_delta=timedelta(minutes=30)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    # Check backup codes if TOTP fails
    if user.mfa_backup_codes:
        for idx, hashed_code in enumerate(user.mfa_backup_codes):
            if bcrypt.checkpw(req.code.encode('utf-8'), hashed_code.encode('utf-8')):
                # Consume backup code
                codes = list(user.mfa_backup_codes)
                codes.pop(idx)
                user.mfa_backup_codes = codes
                db.commit()
                access_token = create_access_token(
                    data={"sub": user.email, "scope": "full_access"}, expires_delta=timedelta(minutes=30)
                )
                return {"access_token": access_token, "token_type": "bearer"}

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

