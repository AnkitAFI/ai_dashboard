import hashlib
import hmac
import io
import json
import os
from datetime import datetime, timedelta

def get_ist_now():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)
from typing import Optional

import razorpay
import sib_api_v3_sdk
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sib_api_v3_sdk.rest import ApiException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models.payment_order_model import PaymentOrder
from app.db.models.user_model import User
from app.models.legacy_models import PromoCode, PromoCodeSchedule, PromoCodeRedemption
from app.schemas.payment_order_schema import BillingInfo, CreateOrderRequest, VerifyPaymentRequest

# ─── Router ───────────────────────────────────────────────────────────────────
router = APIRouter()

# ─── Environment ──────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID         = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET     = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

BREVO_API_KEY           = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL      = os.getenv("BREVO_SENDER_EMAIL", "noreply@insydz.com")
BREVO_SENDER_NAME       = os.getenv("BREVO_SENDER_NAME",  "Insydz")

APP_NAME                = os.getenv("APP_NAME", "Insydz")
APP_URL                 = os.getenv("APP_URL",  "https://insydz.com")

# ─── Razorpay client ──────────────────────────────────────────────────────────
rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# ─── Brevo config — same pattern as your auth.py ─────────────────────────────
_brevo_config = sib_api_v3_sdk.Configuration()
_brevo_config.api_key["api-key"] = BREVO_API_KEY

# Plans ordered lowest → highest. Index = rank.
PLAN_HIERARCHY: list[str] = ["free", "basic", "premium", "enterprise"]
PLAN_PRICES:    dict[str, int] = {"basic": 1999, "premium": 2999, "enterprise": 0}
PLAN_LABELS:    dict[str, str] = {"basic": "Basic", "premium": "Premium", "free": "Free", "enterprise": "Enterprise"}

GST_RATE          = 18   # percent
SUBSCRIPTION_DAYS = 30   # one billing cycle
GRACE_DAYS        = 3    # free re-subscribe window after expiry


# ═════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═════════════════════════════════════════════════════════════════════════════

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
    promo_code: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id:   str
    razorpay_signature:  str
    order_db_id:         int
    user_id:             int
    plan_id:             str


# ═════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def _rank(plan_id: str) -> int:
    try:
        return PLAN_HIERARCHY.index(plan_id)
    except ValueError:
        return -1


def _expiry(from_dt: Optional[datetime] = None) -> datetime:
    return (from_dt or get_ist_now()) + timedelta(days=SUBSCRIPTION_DAYS)


def _invoice_number(order_id: int) -> str:
    now = get_ist_now()
    return f"INV-{now.year}{now.month:02d}-{order_id:05d}"


def _verify_razorpay_sig(order_id: str, payment_id: str, signature: str) -> bool:
    msg      = f"{order_id}|{payment_id}"
    expected = hmac.new(RAZORPAY_KEY_SECRET.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _verify_webhook_sig(body: bytes, signature: str) -> bool:
    expected = hmac.new(RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _active_order(user_id: int, db: Session) -> Optional["PaymentOrder"]:
    """Most recent unexpired paid order for this user."""
    return (
        db.query(PaymentOrder)
        .filter(
            PaymentOrder.user_id    == user_id,
            PaymentOrder.status     == "paid",
            PaymentOrder.expires_at >  get_ist_now(),
        )
        .order_by(PaymentOrder.expires_at.desc())
        .first()
    )


def _sync_user(user: "User", order: "PaymentOrder", db: Session) -> None:
    """Single place that writes tier + expiry to users table."""
    user.subscription_tier       = order.plan_id
    user.subscription_expires_at = order.expires_at
    # Anchor KI billing cycle to the exact subscription date
    if order.paid_at:
        user.ki_cycle_start  = order.paid_at
        user.ki_searches_used = 0   # reset counter on new subscription
    user.updated_at              = get_ist_now()
    db.commit()
    db.refresh(user)
    print(f"✅ _sync_user: user {user.id} → {order.plan_id} until {order.expires_at:%Y-%m-%d}")


def _prorated_upgrade_price(current_order: "PaymentOrder", new_plan_id: str) -> tuple[int, str]:
    """
    Upgrade pricing mid-cycle:
      days_used < half cycle  →  full new price  (early, no credit)
      days_used >= half cycle →  new price minus prorated credit for remaining days
    """
    new_price      = PLAN_PRICES.get(new_plan_id, 0)
    old_price      = PLAN_PRICES.get(current_order.plan_id or "", 0)
    paid_at        = current_order.paid_at or current_order.created_at or get_ist_now()
    expires_at     = current_order.expires_at or get_ist_now()
    total_days     = max(1, (expires_at - paid_at).days)
    days_used      = max(0, (get_ist_now() - paid_at).days)
    days_remaining = max(0, (expires_at - get_ist_now()).days)

    if days_used < total_days / 2:
        charge      = new_price
        explanation = (
            f"You are {days_used} of {total_days} days into your cycle "
            f"(less than halfway) — full price applies."
        )
    else:
        credit      = int((old_price / total_days) * days_remaining)
        charge      = max(1, new_price - credit)
        explanation = (
            f"You have {days_remaining} days remaining. "
            f"₹{credit} credit from your current plan — you pay ₹{charge} today."
        )

    print(f"💰 Upgrade {current_order.plan_id}→{new_plan_id}: ₹{charge}")
    return charge, explanation


# ═════════════════════════════════════════════════════════════════════════════
# EMAIL
# ═════════════════════════════════════════════════════════════════════════════

def _send_email(addr: str, name: str, subject: str, html: str) -> None:
    try:
        api = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(_brevo_config))
        api.send_transac_email(sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": addr, "name": name}],
            sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
            subject=subject, html_content=html,
        ))
    except Exception as e:
        print(f"❌ Email failed: {e}")


def _email_payment_confirmed(
    email: str, name: str, plan_name: str, amount: int,
    invoice_number: str, order_id: int, expires_at: datetime,
    gst_number: Optional[str] = None, gst_amount: int = 0, base_amount: int = 0,
) -> None:
    gst_row = (
        f"<tr><td style='padding:10px 16px;color:#64748b;border-bottom:1px solid #f1f5f9;'>"
        f"GST @ {GST_RATE}% (CGST {GST_RATE//2}% + SGST {GST_RATE//2}%)"
        + (f"<br/><small style='color:#0284c7;font-family:monospace'>GSTIN: {gst_number}</small>" if gst_number else "")
        + f"</td><td style='padding:10px 16px;text-align:right;color:#f97316;font-weight:600;"
          f"border-bottom:1px solid #f1f5f9;'>+&#8377;{gst_amount:,}</td></tr>"
    ) if gst_amount else ""

    _send_email(email, name, f"Payment Confirmed – {plan_name} Plan | {APP_NAME}", f"""
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0"
       style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#0284c7,#1d4ed8);padding:36px 40px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">{APP_NAME}</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,.8);">Payment Confirmation</p>
  </td></tr>
  <tr><td style="padding:32px 40px 0;text-align:center;">
    <div style="display:inline-block;background:#dcfce7;border-radius:50px;padding:10px 24px;margin-bottom:16px;">
      <span style="color:#16a34a;font-weight:700;">&#10003;&nbsp; Payment Successful</span>
    </div>
    <h2 style="margin:0;color:#0f172a;">Hi {name}, you're all set!</h2>
    <p style="color:#64748b;margin:8px 0 0;">
      <strong style="color:#0284c7">{plan_name} Plan</strong> active until
      <strong>{expires_at.strftime('%d %B %Y')}</strong>
    </p>
  </td></tr>
  <tr><td style="padding:28px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;overflow:hidden;">
      <tr><td colspan="2" style="padding:12px 16px;background:#0284c7;">
        <span style="color:#fff;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
          Invoice &bull; {invoice_number}
        </span>
      </td></tr>
      <tr><td style="padding:10px 16px;color:#475569;border-bottom:1px solid #f1f5f9;">{plan_name} — Monthly</td>
          <td style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:1px solid #f1f5f9;">&#8377;{base_amount:,}</td></tr>
      {gst_row}
      <tr style="background:#eff6ff;">
        <td style="padding:14px 16px;font-weight:800;font-size:16px;">Total Paid</td>
        <td style="padding:14px 16px;text-align:right;font-weight:800;color:#0284c7;font-size:20px;">&#8377;{amount:,}</td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 40px 36px;text-align:center;">
    <a href="{APP_URL}/api/payments/invoice/{order_id}"
       style="display:inline-block;background:linear-gradient(135deg,#0284c7,#1d4ed8);color:#fff;
              text-decoration:none;font-weight:700;padding:14px 36px;border-radius:10px;">
      &#128196;&nbsp; Download Invoice PDF
    </a>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; {get_ist_now().year} {APP_NAME}.</p>
  </td></tr>
</table></td></tr></table></body></html>""")


# ═════════════════════════════════════════════════════════════════════════════
# PDF INVOICE
# ═════════════════════════════════════════════════════════════════════════════

def _build_invoice_pdf(order: "PaymentOrder") -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    buf    = io.BytesIO()
    styles = getSampleStyleSheet()
    sky    = colors.HexColor("#0284c7")
    gray   = colors.HexColor("#64748b")
    light  = colors.HexColor("#f0f9ff")
    doc    = SimpleDocTemplate(buf, pagesize=A4,
                               leftMargin=20*mm, rightMargin=20*mm,
                               topMargin=20*mm,  bottomMargin=20*mm)

    def P(text, size=9, bold=False, color=None, align=0):
        return Paragraph(text, ParagraphStyle("_", parent=styles["Normal"],
            fontSize=size, leading=size*1.5,
            textColor=color or colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold" if bold else "Helvetica", alignment=align))

    story = []
    story.append(Table([
        [P(f"<b><font size=22 color='#0284c7'>{APP_NAME}</font></b>"),
         P(f"<b>TAX INVOICE</b><br/><font size=9 color='#64748b'>{order.invoice_number or '—'}</font>",
           align=TA_RIGHT)],
    ], colWidths=[90*mm, 80*mm]))
    story.append(Spacer(1, 3*mm))
    rule = Table([[""]], colWidths=[170*mm], rowHeights=[2])
    rule.setStyle(TableStyle([("BACKGROUND", (0,0), (0,0), sky)]))
    story.append(rule)
    story.append(Spacer(1, 6*mm))

    bill_to = (
        f"<b>Bill To</b><br/>{order.billing_full_name or '—'}<br/>"
        + (f"{order.billing_company}<br/>" if order.billing_company else "")
        + f"{order.billing_address or '—'}<br/>"
        + f"{order.billing_email or '—'}<br/>+91 {order.billing_mobile or '—'}"
        + (f"<br/><b>GSTIN:</b> {order.gst_number}" if order.gst_number else "")
    )
    story.append(Table([
        [P(f"<b>{APP_NAME}</b><br/>Aavapti Technologies Pvt Ltd</br>A-506, 5th Floor, Tower A,</br>Ithum Tower, Sector-62,</br> Noida, UP – 201301<br/>"
           f"billing@insydz.com"),
         P(bill_to)],
    ], colWidths=[85*mm, 85*mm]))
    story.append(Spacer(1, 6*mm))

    paid_str = order.paid_at.strftime("%d %B %Y")    if order.paid_at    else "—"
    exp_str  = order.expires_at.strftime("%d %B %Y") if order.expires_at else "—"
    meta = Table([
        ["Invoice Date:", paid_str,  "Invoice No.:", order.invoice_number or "—"],
        ["Valid Until:",  exp_str,   "Txn ID:",      order.razorpay_payment_id or "—"],
        ["Plan:", (order.plan_id or "").capitalize(), "Status:", "PAID"],
    ], colWidths=[35*mm, 50*mm, 35*mm, 50*mm])
    meta.setStyle(TableStyle([
        ("FONTSIZE",      (0,0),(-1,-1), 9),
        ("TEXTCOLOR",     (0,0),(0,-1),  gray), ("TEXTCOLOR",(2,0),(2,-1),gray),
        ("FONTNAME",      (1,0),(1,-1),  "Helvetica-Bold"), ("FONTNAME",(3,0),(3,-1),"Helvetica-Bold"),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5), ("BACKGROUND",(0,0),(-1,-1),light),
        ("BOX",           (0,0),(-1,-1), 0.5,colors.HexColor("#e2e8f0")),
        ("INNERGRID",     (0,0),(-1,-1), 0.25,colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
    ]))
    story.append(meta)
    story.append(Spacer(1, 8*mm))

    plan_label = PLAN_LABELS.get(order.plan_id or "", (order.plan_id or "").capitalize())
    rows = [
        ["#", "Description", "Amount"],
        ["1", f"{plan_label} Plan — Monthly\nPeriod: {get_ist_now().strftime('%B %Y')}",
         f"₹{order.base_amount:,}"],
    ]
    if order.gst_amount:
        rows.append(["", f"GST @ {GST_RATE}% (CGST {GST_RATE//2}% + SGST {GST_RATE//2}%)",
                     f"₹{order.gst_amount:,}"])
    rows += [["", "", ""],
             ["", P("<b>Total Paid</b>", size=11, bold=True),
                  P(f"<b>₹{order.amount:,}</b>", size=11, bold=True, align=TA_RIGHT)]]

    items = Table(rows, colWidths=[12*mm, 118*mm, 40*mm])
    items.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0),  sky), ("TEXTCOLOR",(0,0),(-1,0),colors.white),
        ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"), ("FONTSIZE",(0,0),(-1,0),10),
        ("ROWBACKGROUNDS",(0,1), (-1,-3), [colors.white,colors.HexColor("#f8fafc")]),
        ("FONTSIZE",      (0,1), (-1,-1), 9),
        ("ALIGN",         (2,0), (2,-1),  "RIGHT"), ("ALIGN",(0,0),(0,-1),"CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 7), ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",   (0,0), (-1,-1), 8), ("RIGHTPADDING",(0,0),(-1,-1),8),
        ("BACKGROUND",    (0,-1),(-1,-1), light), ("LINEABOVE",(0,-1),(-1,-1),1,sky),
        ("BOX",           (0,0), (-1,-1), 0.5,colors.HexColor("#e2e8f0")),
        ("INNERGRID",     (0,0), (-1,-2), 0.25,colors.HexColor("#e2e8f0")),
    ]))
    story.append(items)
    story.append(Spacer(1, 8*mm))

    try:
        from num2words import num2words
        words = num2words(order.amount, lang="en_IN").title()
    except ImportError:
        words = str(order.amount)
    story.append(P(f"<i>Amount in words: <b>{words} Rupees Only</b></i>", color=gray))
    story.append(Spacer(1, 8*mm))
    fr = Table([[""]], colWidths=[170*mm], rowHeights=[1])
    fr.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),colors.HexColor("#e2e8f0"))]))
    story.append(fr)
    story.append(Spacer(1, 3*mm))
    story.append(P("Computer-generated invoice — no signature required. Queries: billing@insydz.com",
                   color=gray, align=TA_CENTER))
    doc.build(story)
    return buf.getvalue()


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 1 — BILLING PREVIEW  (GET)
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/billing-preview/{user_id}/{plan_id}")
def billing_preview(
    user_id:      int,
    plan_id:      str,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    """
    Returns what will be charged.
    Scenarios: already_active | upgrade_full | upgrade_prorated | new_subscription
    """
    if current_user.id != user_id:
        raise HTTPException(403, "Not authorised")
    if plan_id not in PLAN_PRICES:
        raise HTTPException(400, f"Unknown plan: {plan_id}")

    active = _active_order(user_id, db)

    # Same plan already active
    if active and active.plan_id == plan_id:
        return {
            "scenario":         "already_active",
            "charge":           0,
            "full_price":       PLAN_PRICES[plan_id],
            "explanation":      f"You already have an active {PLAN_LABELS[plan_id]} plan.",
            "requires_payment": False,
            "cycle_ends_at":    str(active.expires_at),
        }

    # Upgrade from lower paid plan
    if active and _rank(active.plan_id or "free") < _rank(plan_id):
        charge, explanation = _prorated_upgrade_price(active, plan_id)
        return {
            "scenario":         "upgrade_prorated" if charge < PLAN_PRICES[plan_id] else "upgrade_full",
            "charge":           charge,
            "full_price":       PLAN_PRICES[plan_id],
            "explanation":      explanation,
            "requires_payment": True,
        }

    # New subscription
    full_price = PLAN_PRICES[plan_id]
    return {
        "scenario":         "new_subscription",
        "charge":           full_price,
        "full_price":       full_price,
        "explanation":      f"Start your {PLAN_LABELS[plan_id]} plan for ₹{full_price}/month.",
        "requires_payment": True,
    }


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2 — CREATE ORDER  (POST)
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/create-order")
def create_payment_order(
    data:         CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    if current_user.id != data.user_id:
        raise HTTPException(403, "Not authorised")
    if data.plan_id not in PLAN_PRICES:
        raise HTTPException(400, f"Unknown plan: {data.plan_id}")

    now    = get_ist_now()
    active = _active_order(current_user.id, db)

    # Same plan already active — self-heal if needed
    if active and active.plan_id == data.plan_id:
        if (current_user.subscription_tier       != active.plan_id or
            current_user.subscription_expires_at != active.expires_at):
            try:
                _sync_user(current_user, active, db)
            except Exception as e:
                print(f"⚠️ self-heal: {e}")
        return {
            "already_active":  True,
            "message":         f"{PLAN_LABELS[data.plan_id]} plan is already active.",
            "expires_at":      str(active.expires_at),
            "latest_order_id": active.id,
        }

    # Calculate charge
    if active and _rank(active.plan_id or "free") < _rank(data.plan_id):
        charge, _ = _prorated_upgrade_price(active, data.plan_id)
    else:
        charge = PLAN_PRICES[data.plan_id]

    promo_code_id = None
    if data.promo_code:
        promo = db.query(PromoCode).filter(PromoCode.code == data.promo_code).first()
        if not promo or not promo.is_active:
            raise HTTPException(400, "Invalid or inactive promo code.")
        if promo.valid_from and promo.valid_from > now:
            raise HTTPException(400, "Promo code not active yet.")
        if promo.expires_at and promo.expires_at < now:
            raise HTTPException(400, "Promo code has expired.")
        schedules = db.query(PromoCodeSchedule).filter(PromoCodeSchedule.promo_code_id == promo.id).all()
        if schedules and not any(s.start_date <= now <= s.end_date for s in schedules):
            raise HTTPException(400, "Promo code is not valid during this period.")
        redemptions = db.query(PromoCodeRedemption).filter(
            PromoCodeRedemption.promo_code_id == promo.id,
            PromoCodeRedemption.user_id == current_user.id
        ).count()
        if redemptions >= promo.max_uses_per_user:
            raise HTTPException(400, "You have already used this promo code.")
            
        discount_amount = (charge * float(promo.discount_percentage)) / 100.0
        charge = max(0, charge - int(discount_amount))
        promo_code_id = promo.id

    gst_amount   = round((charge * GST_RATE) / 100) if data.billing.gst_number else 0
    total_inr    = charge + gst_amount
    amount_paise = total_inr * 100

    # Idempotency: reuse a pending order < 30 min old
    existing = (
        db.query(PaymentOrder)
        .filter(PaymentOrder.user_id == current_user.id,
                PaymentOrder.plan_id == data.plan_id,
                PaymentOrder.amount  == total_inr,
                PaymentOrder.status  == "created")
        .order_by(PaymentOrder.created_at.desc())
        .first()
    )
    if existing and (now - existing.created_at).total_seconds() < 1800:
        print(f"♻️  Reusing {existing.razorpay_order_id}")
        return {
            "razorpay_order_id": existing.razorpay_order_id,
            "razorpay_key_id":   RAZORPAY_KEY_ID,
            "amount":            amount_paise,
            "currency":          "INR",
            "order_db_id":       existing.id,
            "prorated_charge":   charge,
        }

    try:
        rzp_order = rzp_client.order.create({
            "amount":   amount_paise,
            "currency": "INR",
            "receipt":  f"rcpt_{current_user.id}_{data.plan_id}_{int(now.timestamp())}",
            "notes":    {"plan_id": data.plan_id, "user_id": str(current_user.id),
                         "gst_number": data.billing.gst_number or ""},
        })
    except Exception as e:
        raise HTTPException(502, f"Razorpay error: {e}")

    try:
        db_order = PaymentOrder(
            user_id           = current_user.id,
            plan_id           = data.plan_id,
            razorpay_order_id = rzp_order["id"],
            amount            = total_inr,
            base_amount       = charge,
            gst_amount        = gst_amount,
            gst_number        = data.billing.gst_number,
            currency          = "INR",
            status            = "created",
            billing_full_name = data.billing.full_name,
            billing_email     = data.billing.email,
            billing_mobile    = data.billing.mobile,
            billing_company   = data.billing.company_name,
            billing_address   = data.billing.billing_address,
            created_at        = now,
            promo_code_id     = promo_code_id,
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"DB error: {e}")

    return {
        "razorpay_order_id": rzp_order["id"],
        "razorpay_key_id":   RAZORPAY_KEY_ID,
        "amount":            amount_paise,
        "currency":          "INR",
        "order_db_id":       db_order.id,
        "prorated_charge":   charge,
    }


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3 — VERIFY PAYMENT  (POST)
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/verify")
def verify_payment(
    data:         VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    if current_user.id != data.user_id:
        raise HTTPException(403, "Not authorised")

    order = (
        db.query(PaymentOrder)
        .filter(PaymentOrder.id      == data.order_db_id,
                PaymentOrder.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(404, "Order not found")

    # Idempotency: already paid (webhook may have activated before verify arrived)
    if order.status == "paid":
        try:
            # Webhook can't store client signature — backfill it now if missing
            if not order.razorpay_signature and data.razorpay_signature:
                order.razorpay_signature  = data.razorpay_signature
                order.razorpay_payment_id = data.razorpay_payment_id
                db.commit()
            # Self-heal users table if stale
            if (current_user.subscription_tier       != order.plan_id or
                current_user.subscription_expires_at != order.expires_at):
                _sync_user(current_user, order, db)
        except Exception as e:
            db.rollback()
            print(f"❌ verify self-heal: {e}")
        return {
            "success":           True,
            "message":           "Already activated",
            "invoice_number":    order.invoice_number,
            "subscription_tier": current_user.subscription_tier,
            "expires_at":        str(order.expires_at) if order.expires_at else None,
        }

    if not _verify_razorpay_sig(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    ):
        order.status = "failed"
        db.commit()
        raise HTTPException(400, "Invalid payment signature")

    try:
        expiry                    = _expiry()
        order.status              = "paid"
        order.razorpay_payment_id = data.razorpay_payment_id
        order.razorpay_signature  = data.razorpay_signature
        order.paid_at             = get_ist_now()
        order.expires_at          = expiry
        order.invoice_number      = _invoice_number(order.id)
        
        if getattr(order, "promo_code_id", None):
            redemption = PromoCodeRedemption(
                promo_code_id=order.promo_code_id,
                user_id=current_user.id,
                source="checkout"
            )
            db.add(redemption)

        db.flush()
        _sync_user(current_user, order, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"DB error activating plan: {e}")

    _email_payment_confirmed(
        email=order.billing_email or current_user.email,
        name=order.billing_full_name or getattr(current_user, "first_name", "") or "",
        plan_name=PLAN_LABELS.get(data.plan_id, data.plan_id.capitalize()),
        amount=order.amount, invoice_number=order.invoice_number,
        order_id=order.id, expires_at=expiry,
        gst_number=order.gst_number, gst_amount=order.gst_amount,
        base_amount=order.base_amount,
    )

    return {
        "success":           True,
        "message":           f"Subscription activated: {data.plan_id}",
        "invoice_number":    order.invoice_number,
        "subscription_tier": current_user.subscription_tier,
        "expires_at":        str(expiry),
    }


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3.5 — AI CREDITS  (POST)
# ═════════════════════════════════════════════════════════════════════════════

class CreateCreditOrderRequest(BaseModel):
    user_id: int
    credits: int
    amount: int
    billing: BillingInfo

class VerifyCreditPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id:   str
    razorpay_signature:  str
    order_db_id:         int
    user_id:             int
    credits:             int

@router.post("/create-credit-order")
def create_credit_order(
    data:         CreateCreditOrderRequest,
    current_user: User = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    if current_user.id != data.user_id:
        raise HTTPException(403, "Not authorised")
        
    gst_amount   = round((data.amount * GST_RATE) / 100) if data.billing.gst_number else 0
    total_inr    = data.amount + gst_amount
    amount_paise = total_inr * 100
    now = get_ist_now()

    try:
        rzp_order = rzp_client.order.create({
            "amount":   amount_paise,
            "currency": "INR",
            "receipt":  f"rcpt_cred_{current_user.id}_{int(now.timestamp())}",
            "notes":    {"type": "ai_credits", "credits": data.credits, "user_id": str(current_user.id)},
        })
    except Exception as e:
        raise HTTPException(502, f"Razorpay error: {e}")

    try:
        db_order = PaymentOrder(
            user_id           = current_user.id,
            plan_id           = f"ai_credits_{data.credits}",
            razorpay_order_id = rzp_order["id"],
            amount            = total_inr,
            base_amount       = data.amount,
            gst_amount        = gst_amount,
            gst_number        = data.billing.gst_number,
            currency          = "INR",
            status            = "created",
            billing_full_name = data.billing.full_name,
            billing_email     = data.billing.email,
            billing_mobile    = data.billing.mobile,
            billing_company   = data.billing.company_name,
            billing_address   = data.billing.billing_address,
            created_at        = now,
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"DB error: {e}")

    return {
        "razorpay_order_id": rzp_order["id"],
        "razorpay_key_id":   RAZORPAY_KEY_ID,
        "amount":            amount_paise,
        "currency":          "INR",
        "order_db_id":       db_order.id,
    }


@router.post("/verify-credit-order")
def verify_credit_order(
    data:         VerifyCreditPaymentRequest,
    current_user: User = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    if current_user.id != data.user_id:
        raise HTTPException(403, "Not authorised")

    order = (
        db.query(PaymentOrder)
        .filter(PaymentOrder.id == data.order_db_id, PaymentOrder.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(404, "Order not found")

    if order.status == "paid":
        return {"success": True, "message": "Already added"}

    if not _verify_razorpay_sig(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature):
        order.status = "failed"
        db.commit()
        raise HTTPException(400, "Invalid payment signature")

    try:
        order.status              = "paid"
        order.razorpay_payment_id = data.razorpay_payment_id
        order.razorpay_signature  = data.razorpay_signature
        order.paid_at             = get_ist_now()
        order.invoice_number      = _invoice_number(order.id)
        
        # Add credits to user
        from app.models.schema_v2 import UserSubscription
        sub = db.query(UserSubscription).filter(UserSubscription.user_id == current_user.id).first()
        if sub:
            sub.ai_credits_balance += data.credits
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"DB error adding credits: {e}")

    return {
        "success": True,
        "message": f"Added {data.credits} credits to your wallet.",
        "invoice_number": order.invoice_number,
    }

# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 4 — INVOICE PDF  (GET)
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/invoice/{order_id}")
def download_invoice(
    order_id:     int,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    order = (
        db.query(PaymentOrder)
        .filter(PaymentOrder.id      == order_id,
                PaymentOrder.user_id == current_user.id,
                PaymentOrder.status  == "paid")
        .first()
    )
    if not order:
        raise HTTPException(404, "Paid order not found")
    pdf = _build_invoice_pdf(order)
    return StreamingResponse(io.BytesIO(pdf), media_type="application/pdf",
        headers={"Content-Disposition":
                 f'attachment; filename="invoice_{order.invoice_number or order_id}.pdf"'})


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 5 — PAYMENT HISTORY  (GET)
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/history/{user_id}")
def payment_history(
    user_id:      int,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(403, "Not authorised")
    orders = (
        db.query(PaymentOrder)
        .filter(PaymentOrder.user_id == user_id)
        .order_by(PaymentOrder.created_at.desc())
        .limit(20).all()
    )
    return [{
        "id": o.id, "plan_id": o.plan_id, "amount": o.amount,
        "base_amount": o.base_amount, "gst_amount": o.gst_amount,
        "gst_number": o.gst_number, "status": o.status,
        "invoice_number": o.invoice_number,
        "razorpay_payment_id": o.razorpay_payment_id,
        "expires_at": str(o.expires_at) if o.expires_at else None,
        "created_at": str(o.created_at),
        "paid_at":    str(o.paid_at)    if o.paid_at    else None,
    } for o in orders]


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 6 — WEBHOOK  (POST)
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/webhook")
async def razorpay_webhook(
    request:              Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db:                   Session       = Depends(get_db),
):
    body = await request.body()
    if not x_razorpay_signature:
        raise HTTPException(400, "Missing X-Razorpay-Signature header")
    if not _verify_webhook_sig(body, x_razorpay_signature):
        raise HTTPException(400, "Invalid webhook signature")

    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(400, "Invalid JSON")

    event   = payload.get("event", "")
    entity  = payload.get("payload", {}).get("payment", {}).get("entity", {})
    rzp_oid = entity.get("order_id")
    if not rzp_oid:
        return {"status": "ignored"}

    order = (db.query(PaymentOrder)
               .filter(PaymentOrder.razorpay_order_id == rzp_oid).first())
    if not order:
        return {"status": "order_not_found"}

    if event == "payment.captured" and order.status != "paid":
        expiry                    = _expiry()
        order.status              = "paid"
        order.razorpay_payment_id = entity.get("id")
        # Store webhook HMAC so razorpay_signature is never NULL
        # Prefixed with "webhook:" to distinguish from client signature
        order.razorpay_signature  = f"webhook:{x_razorpay_signature}"
        order.paid_at             = get_ist_now()
        order.expires_at          = expiry
        order.invoice_number      = _invoice_number(order.id)
        
        if getattr(order, "promo_code_id", None):
            redemption = PromoCodeRedemption(
                promo_code_id=order.promo_code_id,
                user_id=order.user_id,
                source="webhook"
            )
            db.add(redemption)
            
        db.flush()
        user = db.query(User).filter(User.id == order.user_id).first()
        if user:
            _sync_user(user, order, db)
        else:
            db.commit()
        print(f"✅ Webhook: order {order.id} activated")

    elif event == "payment.failed" and order.status != "paid":
        order.status = "failed"
        db.commit()

    return {"status": "ok"}



# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 7 — SUBSCRIPTION STATUS  (GET)
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/subscription-status/{user_id}")
def subscription_status(
    user_id:      int,
    current_user: User = Depends(get_current_user),
    db:           Session     = Depends(get_db),
):
    if current_user.id != user_id:
        raise HTTPException(403, "Not authorised")

    now    = get_ist_now()
    active = _active_order(user_id, db)

    # Self-heal: paid order exists but users table is stale
    if active and current_user.subscription_tier != active.plan_id:
        paid_at    = active.paid_at or active.created_at or datetime.min
        updated_at = getattr(current_user, "updated_at", None) or datetime.min
        if updated_at <= paid_at:
            try:
                _sync_user(current_user, active, db)
                print(f"🔧 self-healed user {user_id} → {active.plan_id}")
            except Exception as e:
                db.rollback()
                print(f"❌ self-heal failed: {e}")

    # Natural expiry
    tier       = current_user.subscription_tier or "free"
    expires_at = getattr(current_user, "subscription_expires_at", None)
    is_expired = False

    if not active and tier != "free" and expires_at and now > expires_at:
        is_expired = True
        try:
            current_user.subscription_tier       = "free"
            current_user.subscription_expires_at = None
            current_user.updated_at              = now
            db.commit()
            db.refresh(current_user)
        except Exception:
            db.rollback()
        tier = "free"
        print(f"⚠️  Expired: user {user_id} → free")

    days_remaining = None
    if expires_at and not is_expired and active:
        days_remaining = max(0, (expires_at - now).days)

    return {
        "user_id":           user_id,
        "subscription_tier": tier,
        "is_active":         tier != "free",
        "is_expired":        is_expired,
        "expires_at":        str(expires_at) if expires_at else None,
        "days_remaining":    days_remaining,
    }
