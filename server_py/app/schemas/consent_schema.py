from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ConsentBase(BaseModel):
    consent_type: str
    status: bool

class ConsentUpdate(ConsentBase):
    pass

class ConsentOut(ConsentBase):
    id: int
    user_id: int
    policy_version: Optional[str] = None
    accepted_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConsentBulkUpdate(BaseModel):
    consents: List[ConsentUpdate]
