from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    first_name: str = Field(..., example="John")
    last_name: str = Field(..., example="Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., min_length=6, example="password123")
    business_name: Optional[str] = Field(None, example="My Business")
    location: str = Field(..., example="mumbai")
    mobile_number: str
    business_interests: List[str] = []

class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    business_name: Optional[str]
    location: str
    business_interests: List[str]
    created_at: datetime
    updated_at: datetime
    onboarding_completed: bool = False
    onboarding_goal: Optional[str] = None
    onboarding_marketplace: Optional[str] = None
    onboarding_details: Optional[str] = None
    seller_id: Optional[str] = None
    explorer_tour_completed: bool = False
    seller_tour_completed: bool = False
    welcome_card_dismissed: bool = False

    model_config = ConfigDict(from_attributes=True)

class OnboardingUpdate(BaseModel):
    onboarding_goal: str
    onboarding_marketplace: str
    onboarding_details: Optional[str] = None
    seller_id: Optional[str] = None

    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
