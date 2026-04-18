from pydantic import BaseModel
from typing import Optional

class BillingInfo(BaseModel):
    full_name:       str
    email:           str
    mobile:          str
    company_name:    Optional[str] = None
    billing_address: str
    gst_number:      Optional[str] = None
    gst_amount:      int = 0
    base_amount:     int = 0

class CreateOrderRequest(BaseModel):
    user_id: int
    plan_id: str
    amount:  int          # ignored — always recalculated server-side
    billing: BillingInfo

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id:   str
    razorpay_signature:  str
    order_db_id:         int
    user_id:             int
    plan_id:             str
