from sqlalchemy import Column, String, Integer, Boolean, Numeric, JSON, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base


class LiveCompetitorResult(Base):
    """
    Stores the latest fetched data for each ASIN per user.
    One row per (user_id, asin) — upserted on every fetch.
    Tracks own ASINs and competitor ASINs separately via asin_role.
    """
    __tablename__ = "live_competitor_results"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(Integer, nullable=False, index=True)

    # Which "Our ASIN" row this belongs to (for grouping competitors with their own product)
    own_asin        = Column(String(10), nullable=False, index=True)

    # The actual ASIN fetched
    asin            = Column(String(10), nullable=False, index=True)

    # 'own' = Our ASIN, 'competitor' = Competitor ASIN
    asin_role       = Column(String(12), nullable=False)  # 'own' | 'competitor'

    # Fetched data
    mrp             = Column(Numeric(12, 2), nullable=True)
    price           = Column(Numeric(12, 2), nullable=True)
    buy_box_winner  = Column(String(255), nullable=True)
    seller_name     = Column(String(255), nullable=True)
    is_fba          = Column(Boolean, nullable=True)
    delivery_110011 = Column(String(255), nullable=True)
    coupons         = Column(String(500), nullable=True)
    bank_offers     = Column(JSON, nullable=True)      # list[str]
    fetch_status    = Column(String(10), nullable=False, default="success")  # 'success' | 'error'
    error_msg       = Column(String(500), nullable=True)

    # Timestamps — auto-managed
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        # One latest record per user + ASIN pair
        UniqueConstraint("user_id", "asin", name="uq_live_competitor_result_user_asin"),
    )
