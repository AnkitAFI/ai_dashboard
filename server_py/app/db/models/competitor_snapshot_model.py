from sqlalchemy import Column, String, Integer, JSON, Date, UniqueConstraint
from app.db.base import Base

class CompetitorSnapshot(Base):
    __tablename__ = "competitor_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seller_id = Column(String(255), index=True)
    user_email = Column(String(255), index=True)
    asin = Column(String(20), index=True)
    snapshot_date = Column(Date, index=True)
    snapshot_data = Column(JSON, nullable=True)

    __table_args__ = (
        UniqueConstraint('asin', 'snapshot_date', 'user_email', name='uq_competitor_snapshot'),
    )
