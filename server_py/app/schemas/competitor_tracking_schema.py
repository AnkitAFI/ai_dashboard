from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class CompetitorInput(BaseModel):
    ownAsin: str
    competitorAsins: List[str]

class CompetitorTrackingListCreate(BaseModel):
    user_id: int
    list_name: Optional[str] = "Default List"
    asin_data: List[CompetitorInput]

class CompetitorTrackingListResponse(BaseModel):
    id: int
    user_id: int
    list_name: str
    asin_data: List[CompetitorInput]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
