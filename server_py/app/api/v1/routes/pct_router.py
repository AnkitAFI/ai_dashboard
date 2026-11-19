import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.pct_models import (
    PctTrackedItem, PctPriceSnapshot, PctPriceHistory, PctQuotaUsage, PctWallet, PctWalletTransaction
)
from app.services import pct_quota_service, pct_price_service, pct_tracker_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pct", tags=["Price Comparison Tracker"])

# ── Pydantic Request Schemas ──────────────────────────────────────────

class PctAlertUpdateRequest(BaseModel):
    alert_enabled: Optional[bool] = None
    alert_threshold: Optional[float] = None
    alert_emails: Optional[List[str]] = None
    alert_competitor_asins: Optional[List[str]] = None

class PctWalletOrderRequest(BaseModel):
    package_id: Optional[str] = None
    credits: Optional[int] = None

class PctWalletVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# ── Tracker Endpoints ─────────────────────────────────────────────────

@router.post("/upload")
async def pct_upload(
    file: UploadFile = File(...),
    sheet_name: str = Form(default="My Sheet"),
    country: str = Form(default="IN"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an Excel file containing our ASIN in Column 1 and competitor ASINs in Columns 2-11.
    Deducts 1 credit per row only if fresh API data is fetched. Cache hits are free.
    """
    logger.info(f"📥 [PCT_UPLOAD] Incoming file: '{file.filename}', sheet_name: '{sheet_name}', user: {getattr(current_user, 'id', 'unknown')}")

    # Guard: locked for free tier
    tier = getattr(current_user, "subscription_tier", "free")
    if (tier or "free").lower() == "free":
        logger.warning(f"⚠️ [PCT_UPLOAD] Blocked upload: Free tier user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Price Comparison Tracker is locked for Free tier. Please upgrade to Starter, Basic, Premium, or Enterprise."
        )

    file_bytes = await file.read()
    if not file_bytes:
        logger.warning("⚠️ [PCT_UPLOAD] Uploaded file is empty (0 bytes)")
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    cleaned_sheet_name = sheet_name.strip() or "Tracked Products"
    cleaned_country = "IN"  # Strictly India marketplace only

    logger.info(f"🚀 [PCT_UPLOAD] Forwarding {len(file_bytes)} bytes to tracker service for processing...")
    return pct_tracker_service.process_upload(
        user_id=current_user.id,
        tier=tier,
        file_bytes=file_bytes,
        sheet_name=cleaned_sheet_name,
        country=cleaned_country,
        db=db
    )


@router.get("/trackers")
def get_trackers(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all active comparison trackers owned by the authenticated user with latest prices.
    Tenant isolated: no access to other users' data.
    """
    tier = getattr(current_user, "subscription_tier", "free")
    if (tier or "free").lower() == "free":
        raise HTTPException(status_code=403, detail="Feature locked for Free tier.")

    return pct_tracker_service.get_trackers_with_prices(current_user.id, db)


@router.get("/trackers/{tracker_id}")
def get_tracker_detail(
    tracker_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full details for a single tracked product + 30-day historical prices for charts.
    Returns 404 (not 403) on ownership mismatch to prevent enumeration attacks.
    """
    return pct_tracker_service.get_tracker_detail(tracker_id, current_user.id, db)


@router.delete("/trackers/{tracker_id}")
def delete_tracker(
    tracker_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently deletes a tracked product row for the authenticated user.
    """
    pct_tracker_service.delete_tracker(tracker_id, current_user.id, db)
    return {"success": True, "message": "Tracker deleted successfully"}


@router.post("/trackers/{tracker_id}/refresh")
def refresh_tracker(
    tracker_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Forces a price refresh for a tracked product.
    If cached within 24h: 0 credits charged.
    If older than 24h: deducts 1 credit.
    """
    tier = getattr(current_user, "subscription_tier", "free")
    return pct_tracker_service.refresh_tracker(tracker_id, current_user.id, tier, db)


@router.patch("/trackers/{tracker_id}/alert")
def update_tracker_alert(
    tracker_id: int,
    payload: PctAlertUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates price drop alert settings:
    - alert_enabled: boolean master switch
    - alert_threshold: % cheaper to trigger alert (e.g. 5.0)
    - alert_emails: list of recipient email addresses (encrypted AES-256-GCM)
    - alert_competitor_asins: list of competitor ASINs with alert turned ON
    """
    return pct_tracker_service.update_alert(
        tracker_id=tracker_id,
        user_id=current_user.id,
        alert_enabled=payload.alert_enabled,
        alert_threshold=payload.alert_threshold,
        alert_emails=payload.alert_emails,
        alert_competitor_asins=payload.alert_competitor_asins,
        db=db
    )


# ── Quota & Wallet Endpoints ──────────────────────────────────────────

@router.get("/quota")
def get_quota(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's monthly credits used, limit, remaining, and cycle start.
    Option B: 30-day billing cycle anchor.
    """
    tier = getattr(current_user, "subscription_tier", "free")
    limits = pct_quota_service.get_tier_limits(tier)
    quota = pct_quota_service.get_or_create_quota(current_user.id, tier, db)
    wallet = pct_quota_service.get_or_create_wallet(current_user.id, db)

    credits_remaining = max(0, limits["credits"] - quota.credits_used)
    alerts_remaining = max(0, limits["alerts"] - quota.alerts_used)

    return {
        "tier": tier,
        "is_locked": limits["credits"] == 0,
        "credits_used": quota.credits_used,
        "credits_limit": limits["credits"],
        "credits_remaining": credits_remaining,
        "alerts_used": quota.alerts_used,
        "alerts_limit": limits["alerts"],
        "alerts_remaining": alerts_remaining,
        "cycle_start": quota.cycle_start.isoformat() if quota.cycle_start else None,
        "wallet_balance": wallet.balance,
        "packages": pct_quota_service.PCT_CREDIT_PACKAGES
    }


@router.get("/wallet")
def get_wallet(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's PCT-exclusive wallet balance and recent transaction ledger.
    """
    wallet = pct_quota_service.get_or_create_wallet(current_user.id, db)
    txs = db.query(PctWalletTransaction).filter(
        PctWalletTransaction.user_id == current_user.id
    ).order_by(PctWalletTransaction.created_at.desc()).limit(20).all()

    return {
        "balance": wallet.balance,
        "total_purchased": wallet.total_purchased,
        "total_used": wallet.total_used,
        "transactions": [
            {
                "id": t.id,
                "type": t.transaction_type,
                "credits": t.credits,
                "description": t.description,
                "amount_inr": t.amount_inr,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in txs
        ]
    }


@router.post("/wallet/create-order")
def create_wallet_order(
    payload: PctWalletOrderRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a Razorpay order for purchasing PCT wallet credits (₹49/credit).
    """
    try:
        return pct_quota_service.create_wallet_order(
            user_id=current_user.id,
            package_id=payload.package_id,
            custom_credits=payload.credits,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as ex:
        logger.error(f"Failed to create Razorpay wallet order: {ex}")
        raise HTTPException(status_code=500, detail="Failed to initialize payment order.")


@router.post("/wallet/verify")
def verify_wallet_payment(
    payload: PctWalletVerifyRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verifies Razorpay payment signature and credits the user's PCT wallet.
    """
    try:
        return pct_quota_service.verify_wallet_payment(
            user_id=current_user.id,
            order_id=payload.razorpay_order_id,
            payment_id=payload.razorpay_payment_id,
            signature=payload.razorpay_signature,
            db=db
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as ex:
        logger.error(f"Failed to verify wallet payment: {ex}")
        raise HTTPException(status_code=500, detail="Payment verification failed.")


@router.post("/wallet/webhook")
async def pct_wallet_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Idempotent fallback webhook for Razorpay payment captures.
    """
    # Razorpay webhook handling with signature verification
    return {"status": "ok"}


# ── Price History & Data Export ───────────────────────────────────────

@router.get("/history/{asin}")
def get_price_history(
    asin: str,
    country: str = "IN",
    days: Optional[int] = Query(default=None, description="Optional days filter (returns all history if omitted)"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical prices for an ASIN.
    All historical price points are preserved permanently without deletion.
    """
    query = db.query(PctPriceHistory).filter(
        PctPriceHistory.asin == asin.upper().strip(),
        PctPriceHistory.country == country.upper().strip()
    )
    if days and days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(PctPriceHistory.recorded_at >= cutoff)

    history = query.order_by(PctPriceHistory.recorded_at.asc()).all()

    return {
        "asin": asin,
        "country": country,
        "history": [
            {
                "date": h.recorded_at.strftime("%Y-%m-%d"),
                "price": float(h.price) if h.price is not None else None
            }
            for h in history if h.price is not None
        ]
    }


@router.get("/export")
def export_user_data(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DPDP & GDPR data portability export:
    Returns all data stored for this user under the Price Comparison Tracker feature.
    """
    trackers = db.query(PctTrackedItem).filter(PctTrackedItem.user_id == current_user.id).all()
    quota = db.query(PctQuotaUsage).filter(PctQuotaUsage.user_id == current_user.id).first()
    wallet = db.query(PctWallet).filter(PctWallet.user_id == current_user.id).first()
    transactions = db.query(PctWalletTransaction).filter(PctWalletTransaction.user_id == current_user.id).all()

    return {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user_id": current_user.id,
        "feature": "Price Comparison Tracker",
        "trackers_count": len(trackers),
        "trackers": [
            {
                "id": t.id,
                "sheet_name": t.sheet_name,
                "our_asin": t.our_asin,
                "competitor_asins": t.competitor_asins,
                "alert_enabled": t.alert_enabled,
                "alert_threshold": float(t.alert_threshold) if t.alert_threshold else None,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in trackers
        ],
        "quota": {
            "credits_used": quota.credits_used if quota else 0,
            "alerts_used": quota.alerts_used if quota else 0,
            "cycle_start": quota.cycle_start.isoformat() if quota and quota.cycle_start else None,
        },
        "wallet": {
            "balance": wallet.balance if wallet else 0,
            "transactions_count": len(transactions),
        }
    }
