from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Boolean,
    Numeric, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from app.db.session import Base

class PctTrackedItem(Base):
    __tablename__ = "pct_tracked_items"

    id                     = Column(Integer, primary_key=True, autoincrement=True)
    user_id                = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    sheet_name             = Column(Text)
    our_asin               = Column(String(20), nullable=False, index=True)
    competitor_asins       = Column(ARRAY(Text), nullable=False)
    alert_competitor_asins = Column(ARRAY(Text), default=list)  # Competitor ASINs with alert toggled ON
    country                = Column(String(5), default="IN", nullable=False)
    alert_enabled          = Column(Boolean, default=False, nullable=False)
    alert_threshold        = Column(Numeric(5, 2), default=5.0)
    alert_emails           = Column(ARRAY(Text))  # Encrypted strings stored in text[]
    is_active              = Column(Boolean, default=True, nullable=False)
    created_at             = Column(DateTime(timezone=True), server_default=func.now())
    updated_at             = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("user_id", "our_asin", name="uq_pct_user_our_asin"),)


class PctPriceSnapshot(Base):
    __tablename__ = "pct_price_snapshots"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    asin             = Column(String(20), nullable=False, index=True)
    country          = Column(String(5), default="IN", nullable=False)
    product_title    = Column(Text)
    product_price    = Column(Numeric(12, 2))
    currency         = Column(String(10), default="INR")
    product_photo    = Column(Text)
    product_url      = Column(Text)
    is_prime         = Column(Boolean, default=False)
    is_amazon_choice = Column(Boolean, default=False)
    availability     = Column(Text)
    star_rating      = Column(Numeric(3, 1))
    num_ratings      = Column(Integer)
    fetched_at       = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    raw_data         = Column(JSONB)

    __table_args__ = (UniqueConstraint("asin", "country", name="uq_pct_snap_asin_country"),)


class PctPriceHistory(Base):
    __tablename__ = "pct_price_history"

    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    asin        = Column(String(20), nullable=False, index=True)
    country     = Column(String(5), default="IN", nullable=False)
    price       = Column(Numeric(12, 2))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class PctAlertLog(Base):
    __tablename__ = "pct_alert_logs"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    tracker_id    = Column(Integer, ForeignKey("pct_tracked_items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id       = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    trigger_asin  = Column(String(20), nullable=False)
    our_price     = Column(Numeric(12, 2))
    their_price   = Column(Numeric(12, 2))
    diff_pct      = Column(Numeric(5, 2))
    email_sent_to = Column(ARRAY(Text))  # Encrypted strings
    sent_at       = Column(DateTime(timezone=True), server_default=func.now())


class PctQuotaUsage(Base):
    __tablename__ = "pct_quota_usage"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    user_id       = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, unique=True)
    credits_used  = Column(Integer, default=0, nullable=False)
    alerts_used   = Column(Integer, default=0, nullable=False)
    cycle_start   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_tier     = Column(String(50), default="free", nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PctWallet(Base):
    __tablename__ = "pct_wallet"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, unique=True)
    balance         = Column(Integer, default=0, nullable=False)
    total_purchased = Column(Integer, default=0, nullable=False)
    total_used      = Column(Integer, default=0, nullable=False)
    updated_at      = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PctWalletTransaction(Base):
    __tablename__ = "pct_wallet_transactions"

    id                  = Column(Integer, primary_key=True, autoincrement=True)
    user_id             = Column(Integer, ForeignKey("users_auth.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type    = Column(String(20), nullable=False)  # 'PURCHASE' | 'DEBIT'
    credits             = Column(Integer, nullable=False)
    description         = Column(Text)
    razorpay_order_id   = Column(String(100))
    razorpay_payment_id = Column(String(100))
    razorpay_signature  = Column(String(256))
    invoice_number      = Column(String(50))
    amount_inr          = Column(Integer)
    status              = Column(String(20), default="completed", nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
