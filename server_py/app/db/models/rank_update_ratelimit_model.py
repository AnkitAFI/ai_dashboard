from sqlalchemy import Column, String, Integer, Date
from app.db.base import Base

class RankUpdateRatelimit(Base):
    __tablename__ = "rank_update_ratelimit"

    user_email = Column(String(255), primary_key=True)
    update_date = Column(Date, primary_key=True)
    call_count = Column(Integer, server_default="0", nullable=True)
