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
        
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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

