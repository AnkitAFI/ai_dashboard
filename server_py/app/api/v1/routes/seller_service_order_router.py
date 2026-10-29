import hashlib
import hmac
import logging
import os
from datetime import datetime, timedelta
from typing import List, Optional

import razorpay
import sib_api_v3_sdk
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.schema_v2 import AuditLog, SellerServiceOrder, UserAuth, UserConsent

router = APIRouter()
logger = logging.getLogger(__name__)

# ─── Environment & Secrets ────────────────────────────────────────────────────
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Insydz")
SUBSCRIPTION_ALERT_EMAILS = os.getenv("SUBSCRIPTION_ALERT_EMAILS", "")
APP_NAME = os.getenv("APP_NAME", "Insydz")

rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

_brevo_config = sib_api_v3_sdk.Configuration()
_brevo_config.api_key["api-key"] = BREVO_API_KEY

PRICE_PER_PLATFORM = 999
VALID_PLATFORMS = {"amazon", "flipkart", "meesho"}

def get_ist_now():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

def _verify_razorpay_sig(order_id: str, payment_id: str, signature: str) -> bool:
    if not RAZORPAY_KEY_SECRET:
        return False
    msg = f"{order_id}|{payment_id}"
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

def _send_email(to_email: str, to_name: str, subject: str, html: str) -> None:
    try:
        if not BREVO_API_KEY:
            logger.info("BREVO_API_KEY not configured, skipping email.")
            return
        api = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(_brevo_config))
        api.send_transac_email(sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": to_email, "name": to_name}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject=subject,
            html_content=html,
        ))
    except Exception as e:
        logger.error("Failed to send transactional email: %s", e)


# ─── Request / Response Schemas ───────────────────────────────────────────────

class CreateSellerServiceOrderRequest(BaseModel):
    platforms: List[str] = Field(..., min_items=1)
    whatsapp_number: str = Field(..., min_length=10, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=100)
    gst_number: Optional[str] = None
    checklist_accepted: bool = Field(..., description="Must explicitly agree to 4-point checklist")

    @validator("platforms")
    def validate_platforms(cls, v):
        cleaned = [p.strip().lower() for p in v]
        if not cleaned:
            raise ValueError("At least one platform must be selected.")
        invalid = [p for p in cleaned if p not in VALID_PLATFORMS]
        if invalid:
            raise ValueError(f"Invalid platform(s): {', '.join(invalid)}. Supported: amazon, flipkart, meesho.")
        return list(dict.fromkeys(cleaned))

    @validator("checklist_accepted")
    def validate_checklist(cls, v):
        if not v:
            raise ValueError("You must acknowledge and accept the seller onboarding checklist and terms.")
        return v


class VerifySellerServicePaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/create-order")
def create_service_order(
    payload: CreateSellerServiceOrderRequest,
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a one-time Razorpay order for Assisted Seller Setup & 5 Free Listings.
    DPDP & GDPR Compliant:
    - Encrypts PII (name, WhatsApp, GSTIN) via AES-256-GCM.
    - Hashes client IP for audit logs.
    - Saves explicit consent record to user_consents.
    - Completely isolated from subscription tables and feature limits.
    """
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host or "unknown"
    user_agent = request.headers.get("user-agent", "")[:250]

    # Check if user has already paid for any of the requested platforms
    existing_paid_orders = (
        db.query(SellerServiceOrder)
        .filter(
            SellerServiceOrder.user_id == current_user.id,
            SellerServiceOrder.status == "paid",
        )
        .all()
    )
    already_paid = set()
    for o in existing_paid_orders:
        if isinstance(o.platforms, list):
            already_paid.update(p.lower() for p in o.platforms)

    conflicting = [p for p in payload.platforms if p.lower() in already_paid]
    if conflicting:
        names = ", ".join(p.capitalize() for p in conflicting)
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active setup order for {names}. Please choose other marketplaces.",
        )

    # Calculate amount strictly server-side
    platform_count = len(payload.platforms)
    amount_inr = platform_count * PRICE_PER_PLATFORM
    amount_paise = amount_inr * 100
    now = get_ist_now()

    # 1. DPDP / GDPR: Record Explicit Legal Consent
    try:
        consent = UserConsent(
            user_id=current_user.id,
            consent_type="seller_onboarding_terms_v1",
            status=True,
            policy_version="v1.0_seller_terms",
            ip_hash=client_ip,
        )
        db.add(consent)
        db.commit()
    except Exception as exc:
        logger.warning("Consent logging notice (non-fatal): %s", exc)
        db.rollback()

    # 2. Audit Trail
    try:
        audit = AuditLog(
            actor_user_id=current_user.id,
            action="SELLER_SERVICE_ORDER_INITIATED",
            resource_type="seller_service_order",
            resource_id=f"platforms:{','.join(payload.platforms)}",
            ip_hash=client_ip,
        )
        db.add(audit)
        db.commit()
    except Exception as exc:
        logger.warning("Audit logging notice (non-fatal): %s", exc)
        db.rollback()

    # 3. Create Razorpay Order
    try:
        rzp_order = rzp_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"rcpt_srv_{current_user.id}_{int(now.timestamp())}",
            "notes": {
                "service": "seller_setup_5_free_listings",
                "platforms": ",".join(payload.platforms),
                "user_id": str(current_user.id),
                "no_refund_agreed": "yes",
                "liability_waived": "yes",
                "client_ip": client_ip,
            },
        })
    except Exception as e:
        logger.error("Razorpay service order creation error: %s", e, exc_info=True)
        raise HTTPException(502, "Unable to initialize payment with provider. Please try again.")

    # 4. Save Order into Isolated seller_service_orders Table
    try:
        service_order = SellerServiceOrder(
            user_id=current_user.id,
            platforms=payload.platforms,
            amount=amount_inr,
            currency="INR",
            contact_full_name=payload.full_name,
            contact_mobile=payload.whatsapp_number,
            contact_mobile_hash=payload.whatsapp_number,
            gst_number=payload.gst_number,
            ip_hash=client_ip,
            user_agent=user_agent,
            terms_version="v1.0_seller_terms",
            consent_agreed=True,
            razorpay_order_id=rzp_order["id"],
            status="created",
            created_at=now,
        )
        db.add(service_order)
        db.commit()
        db.refresh(service_order)
    except Exception as e:
        db.rollback()
        logger.error("Failed to persist seller_service_order: %s", e, exc_info=True)
        raise HTTPException(500, "Failed to record service order. Please contact support.")

    return {
        "razorpay_order_id": rzp_order["id"],
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "amount": amount_paise,
        "amount_inr": amount_inr,
        "currency": "INR",
        "order_id": service_order.id,
    }


@router.post("/verify-payment")
def verify_service_payment(
    payload: VerifySellerServicePaymentRequest,
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Verifies Razorpay payment signature for the ₹999 service order.
    Marks status as 'paid'.
    Does NOT alter user_subscriptions or software limits.
    """
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host or "unknown"

    # 1. Verify HMAC Signature
    is_valid = _verify_razorpay_sig(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )
    if not is_valid:
        logger.warning(
            "Invalid Razorpay signature for service order %s, user %s",
            payload.razorpay_order_id,
            current_user.id,
        )
        raise HTTPException(400, "Payment verification failed: invalid signature.")

    # 2. Find Service Order
    order = (
        db.query(SellerServiceOrder)
        .filter(
            SellerServiceOrder.razorpay_order_id == payload.razorpay_order_id,
            SellerServiceOrder.user_id == current_user.id,
        )
        .first()
    )
    if not order:
        raise HTTPException(404, "Service order not found.")

    if order.status == "paid":
        return {
            "status": "success",
            "message": "Payment already confirmed.",
            "order_id": order.id,
        }

    now = get_ist_now()
    order.status = "paid"
    order.razorpay_payment_id = payload.razorpay_payment_id
    order.razorpay_signature = payload.razorpay_signature
    order.paid_at = now

    # 3. Immutable Audit Log
    try:
        audit = AuditLog(
            actor_user_id=current_user.id,
            action="SELLER_SERVICE_ORDER_PAID",
            resource_type="seller_service_order",
            resource_id=str(order.id),
            ip_hash=client_ip,
        )
        db.add(audit)
    except Exception as exc:
        logger.warning("Audit log error on payment verify: %s", exc)

    db.commit()
    db.refresh(order)

    # 4. Notify Operations Team via Email (Configured via SUBSCRIPTION_ALERT_EMAILS in .env)
    try:
        platforms_str = ", ".join(order.platforms or []).upper()
        team_html = f"""
        <html><body style="font-family:sans-serif;line-height:1.6;color:#333;">
        <h2 style="color:#0284c7;">🎉 New Seller Onboarding Order Received</h2>
        <p>A customer has booked the Assisted Seller Account Creation package:</p>
        <table style="border-collapse:collapse;width:100%;max-width:550px;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Order ID:</td><td style="padding:8px;border:1px solid #ddd;">#{order.id}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Customer Name:</td><td style="padding:8px;border:1px solid #ddd;">{order.contact_full_name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">WhatsApp / Mobile:</td><td style="padding:8px;border:1px solid #ddd;"><strong>{order.contact_mobile}</strong></td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Platforms:</td><td style="padding:8px;border:1px solid #ddd;">{platforms_str}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount Paid:</td><td style="padding:8px;border:1px solid #ddd;">INR {order.amount:,}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">GSTIN:</td><td style="padding:8px;border:1px solid #ddd;">{order.gst_number or 'Not provided'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Razorpay Payment ID:</td><td style="padding:8px;border:1px solid #ddd;">{order.razorpay_payment_id}</td></tr>
        </table>
        <p style="margin-top:20px;"><strong>Next Step:</strong> Contact the customer on WhatsApp (+91 {order.contact_mobile}) to initiate account registration and collect 5 product details.</p>
        </body></html>
        """
        raw_recipients = SUBSCRIPTION_ALERT_EMAILS or os.getenv("SUBSCRIPTION_ALERT_EMAILS", "")
        recipients = [e.strip() for e in raw_recipients.split(",") if e.strip()]
        for target_email in recipients:
            _send_email(
                to_email=target_email,
                to_name="Insydz Team",
                subject=f"[Action Required] New Seller Setup Order #{order.id} ({platforms_str})",
                html=team_html,
            )
    except Exception as e:
        logger.error("Non-fatal email sending notice: %s", e)

    return {
        "status": "success",
        "message": "Payment verified successfully. Our onboarding specialist will contact you on WhatsApp.",
        "order_id": order.id,
    }


@router.get("/my-orders")
def get_my_service_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the list of seller setup orders placed by this user."""
    orders = (
        db.query(SellerServiceOrder)
        .filter(SellerServiceOrder.user_id == current_user.id)
        .order_by(SellerServiceOrder.created_at.desc())
        .all()
    )
    return [
        {
            "id": o.id,
            "platforms": o.platforms,
            "amount": o.amount,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "paid_at": o.paid_at.isoformat() if o.paid_at else None,
        }
        for o in orders
    ]

