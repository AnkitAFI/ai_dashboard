from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean,
    Numeric, TIMESTAMP, UniqueConstraint, Index,
)
from sqlalchemy.sql import func
from app.db.base import Base


class CompetitorWatchlist(Base):
    __tablename__ = "competitor_watchlist"

    id               = Column(Integer, primary_key=True, index=True)

    # Owner identity
    user_email       = Column(String(255), nullable=False, index=True)
    seller_id        = Column(String(100), nullable=False, index=True)

    # Which of the seller's own ASINs this pin was made from
    source_asin      = Column(String(20),  nullable=False)

    # The rival being tracked
    competitor_asin  = Column(String(20),  nullable=False, index=True)

    # Competitor snapshot (captured at pin time)
    title            = Column(String(500))
    photo            = Column(Text)
    price            = Column(Numeric(12, 2))
    rating           = Column(Numeric(3,  1))
    num_ratings      = Column(Integer)
    threat_score     = Column(Numeric(4,  1))
    threat_reason    = Column(Text)
    is_prime         = Column(Boolean, default=False)
    is_best_seller   = Column(Boolean, default=False)
    is_amazon_choice = Column(Boolean, default=False)
    sales_volume     = Column(String(100))
    price_diff_pct   = Column(Numeric(6,  2))
    currency         = Column(String(10), default="USD")

    pinned_at        = Column(TIMESTAMP, server_default=func.now())

    # ── Constraints & indexes ─────────────────────────────────────────────
    __table_args__ = (
        # One row per (user, seller, rival) — upsert on re-pin
        UniqueConstraint(
            "user_email", "seller_id", "competitor_asin",
            name="uq_watchlist_user_seller_rival",
        ),
        # Fast lookup for GET /watchlist
        Index("idx_watchlist_user_seller", "user_email", "seller_id"),
    )