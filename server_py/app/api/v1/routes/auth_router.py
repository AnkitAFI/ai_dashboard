from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserOut, OnboardingUpdate
from app.services.user_service import UserService
from app.core.security import create_access_token
from app.api.deps import get_current_user

router = APIRouter(tags=["Auth"])
user_service = UserService()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user with hashed password and formatted business interests.
    """
    return user_service.register_user(db, user)

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
