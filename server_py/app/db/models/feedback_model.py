from sqlalchemy import Column, Integer, SmallInteger, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.db.base import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users_auth.id", ondelete="SET NULL"), index=True, nullable=True)
    rating = Column(SmallInteger)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    __table_args__ = (
        Index('idx_feedback_created_at_desc', created_at.desc()),
    )
