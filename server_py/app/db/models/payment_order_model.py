from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id             = Column(Integer, ForeignKey("users_auth.id"), nullable=False, index=True)

    plan_id             = Column(String(50),  nullable=False)
    amount              = Column(Integer,     nullable=False)
    base_amount         = Column(Integer,     nullable=False, default=0)
    gst_amount          = Column(Integer,     nullable=False, default=0)
    gst_number          = Column(String(20),  nullable=True)
    currency            = Column(String(10),  default="INR")

    razorpay_order_id   = Column(String(100), unique=True, index=True, nullable=False)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature  = Column(String(256), nullable=True)
    refund_id           = Column(String(100), nullable=True)

    status              = Column(String(20),  default="created", nullable=False)
    invoice_number      = Column(String(50),  nullable=True)
    promo_code_id       = Column(Integer, nullable=True)

    billing_full_name   = Column(String(200), nullable=True)
    billing_email       = Column(String(200), nullable=True)
    billing_mobile      = Column(String(20),  nullable=True)
    billing_company     = Column(String(200), nullable=True)
    billing_address     = Column(Text,        nullable=True)

    created_at          = Column(DateTime, nullable=False)
    paid_at             = Column(DateTime, nullable=True)
    expires_at          = Column(DateTime, nullable=True)
    refunded_at         = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="payment_orders", primaryjoin="User.id == foreign(PaymentOrder.user_id)")
