import os
import hmac
import hashlib
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
import razorpay

from app.models.pct_models import PctQuotaUsage, PctWallet, PctWalletTransaction
from app.models.legacy_models import User

logger = logging.getLogger(__name__)

# Quota limits by tier
PCT_TIER_LIMITS: Dict[str, Dict[str, int]] = {
    "free":       {"credits": 0,  "alerts": 0},
    "starter":    {"credits": 2,  "alerts": 2},
    "basic":      {"credits": 5,  "alerts": 5},
    "premium":    {"credits": 10, "alerts": 10},
    "enterprise": {"credits": 20, "alerts": 20},
    "trial":      {"credits": 10, "alerts": 10},
}

PCT_CREDIT_PACKAGES: Dict[str, Dict[str, Any]] = {
    "pack_10":  {"credits": 10,  "price_inr": 490,  "label": "10 Credits (₹49/credit)"},
    "pack_25":  {"credits": 25,  "price_inr": 1225, "label": "25 Credits (₹49/credit)"},
    "pack_50":  {"credits": 50,  "price_inr": 2450, "label": "50 Credits (₹49/credit)"},
    "pack_100": {"credits": 100, "price_inr": 4900, "label": "100 Credits (₹49/credit)"},
}

TIER_RANK: Dict[str, int] = {
    "free": 0,
    "starter": 1,
    "basic": 2,
    "premium": 3,
    "enterprise": 4,
    "trial": 3,
}

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

def get_razorpay_client() -> Optional[razorpay.Client]:
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    return None


def get_tier_limits(tier: Optional[str]) -> Dict[str, int]:
    normalized_tier = (tier or "free").lower()
    return PCT_TIER_LIMITS.get(normalized_tier, PCT_TIER_LIMITS["free"])


def get_or_create_quota(user_id: int, current_tier: Optional[str], db: Session) -> PctQuotaUsage:
    """
    Retrieves or initializes the user's PCT quota record.
    Option B (30-Day Billing Cycle Anchor):
      - Anchored to the user's actual Razorpay payment date (ki_cycle_start / subscription_expires_at).
      - Resets every 30 days based on their subscription renewal.
      - If user upgrades tier (new_rank > old_rank), immediately resets credits_used to 0
        and sets cycle_start to now, granting the full fresh quota of the higher tier.
    """
    now = datetime.now(timezone.utc)
    norm_tier = (current_tier or "free").lower()
    quota = db.query(PctQuotaUsage).filter(PctQuotaUsage.user_id == user_id).first()

    # Look up actual user record to read real payment date
    user_record = db.query(User).filter(User.id == user_id).first()
    real_payment_anchor = now
    if user_record:
        if getattr(user_record, "ki_cycle_start", None):
            anchor = user_record.ki_cycle_start
            real_payment_anchor = anchor.replace(tzinfo=timezone.utc) if anchor.tzinfo is None else anchor
        elif getattr(user_record, "subscription_expires_at", None):
            expires = user_record.subscription_expires_at
            expires_utc = expires.replace(tzinfo=timezone.utc) if expires.tzinfo is None else expires
            real_payment_anchor = expires_utc - timedelta(days=30)

    if not quota:
        quota = PctQuotaUsage(
            user_id=user_id,
            credits_used=0,
            alerts_used=0,
            cycle_start=real_payment_anchor,
            last_tier=norm_tier,
        )
        db.add(quota)
        db.commit()
        db.refresh(quota)
        return quota

    needs_commit = False

    # Check if user made a renewal payment on Razorpay since last check
    if quota.cycle_start:
        current_cycle_start = quota.cycle_start
        if current_cycle_start.tzinfo is None:
            current_cycle_start = current_cycle_start.replace(tzinfo=timezone.utc)

        if real_payment_anchor > current_cycle_start:
            # New renewal payment received via Razorpay
            quota.cycle_start = real_payment_anchor
            quota.credits_used = 0
            quota.alerts_used = 0
            needs_commit = True
        else:
            # Check if 30 days elapsed since cycle_start
            days_elapsed = (now - current_cycle_start).days
            if days_elapsed >= 30:
                cycles_to_advance = days_elapsed // 30
                quota.cycle_start = current_cycle_start + timedelta(days=30 * cycles_to_advance)
                quota.credits_used = 0
                quota.alerts_used = 0
                needs_commit = True

    # 2. Upgrade Detection (e.g. Starter -> Basic/Premium)
    old_rank = TIER_RANK.get(quota.last_tier or "free", 0)
    new_rank = TIER_RANK.get(norm_tier, 0)

    if new_rank > old_rank:
        # User upgraded! Reset credits_used = 0 to grant full fresh allowance of the higher tier immediately
        quota.credits_used = 0
        quota.alerts_used = 0
        quota.cycle_start = now  # Anchor fresh 30-day cycle to the upgrade date
        quota.last_tier = norm_tier
        needs_commit = True
    elif quota.last_tier != norm_tier:
        quota.last_tier = norm_tier
        needs_commit = True

    if needs_commit:
        db.commit()
        db.refresh(quota)

    return quota


def get_or_create_wallet(user_id: int, db: Session) -> PctWallet:
    """Retrieves or initializes the user's PCT-exclusive wallet."""
    wallet = db.query(PctWallet).filter(PctWallet.user_id == user_id).first()
    if not wallet:
        wallet = PctWallet(
            user_id=user_id,
            balance=0,
            total_purchased=0,
            total_used=0
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def can_fetch(user_id: int, tier: Optional[str], db: Session) -> Tuple[bool, Optional[str]]:
    """
    Determines whether a credit can be spent.
    Returns: (can_proceed: bool, source: 'quota' | 'wallet' | None)
    Free tier is completely locked.
    """
    norm_tier = (tier or "free").lower()
    limits = get_tier_limits(norm_tier)
    if limits["credits"] == 0:
        return False, None

    quota = get_or_create_quota(user_id, norm_tier, db)
    if quota.credits_used < limits["credits"]:
        return True, "quota"

    wallet = get_or_create_wallet(user_id, db)
    if wallet.balance > 0:
        return True, "wallet"

    return False, None


def deduct_credit(user_id: int, source: str, db: Session) -> bool:
    """
    Deducts 1 credit from either the monthly quota or the PCT wallet.
    """
    if source == "quota":
        quota = db.query(PctQuotaUsage).filter(PctQuotaUsage.user_id == user_id).first()
        if quota:
            quota.credits_used += 1
            db.commit()
            return True
        return False

    elif source == "wallet":
        wallet = get_or_create_wallet(user_id, db)
        if wallet.balance > 0:
            wallet.balance -= 1
            wallet.total_used += 1

            # Log debit in pct_wallet_transactions
            tx = PctWalletTransaction(
                user_id=user_id,
                transaction_type="DEBIT",
                credits=1,
                description="1 credit used for Price Comparison Tracker product row",
                status="completed"
            )
            db.add(tx)
            db.commit()
            return True
        return False

    return False


def create_wallet_order(
    user_id: int,
    package_id: Optional[str] = None,
    custom_credits: Optional[int] = None,
    db: Session = None
) -> Dict[str, Any]:
    """
    Creates a Razorpay order for purchasing PCT wallet credits (₹49/credit).
    Supports either pre-set package_id or any flexible custom credit amount.
    """
    if custom_credits is not None and custom_credits > 0:
        credits = int(custom_credits)
        price_inr = credits * 49
        label = f"{credits} Credits (₹49/credit)"
        pkg_id = f"custom_{credits}"
    elif package_id and package_id in PCT_CREDIT_PACKAGES:
        package = PCT_CREDIT_PACKAGES[package_id]
        credits = package["credits"]
        price_inr = package["price_inr"]
        label = package["label"]
        pkg_id = package_id
    elif package_id and package_id.startswith("custom_"):
        try:
            credits = int(package_id.replace("custom_", ""))
            price_inr = credits * 49
            label = f"{credits} Credits (₹49/credit)"
            pkg_id = package_id
        except Exception:
            raise ValueError(f"Invalid package_id: {package_id}")
    else:
        raise ValueError("Please specify a valid number of credits to purchase.")

    if credits > 10000:
        raise ValueError("Maximum 10,000 credits per order. You can easily top up another 10,000 credits anytime after completing this payment.")

    rzp = get_razorpay_client()
    if not rzp:
        raise RuntimeError("Razorpay client credentials not configured")

    amount_paise = price_inr * 100
    receipt = f"pct_wal_{user_id}_{int(time.time())}"

    rzp_order = rzp.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "notes": {
            "feature": "pct_wallet",
            "user_id": str(user_id),
            "package_id": pkg_id,
            "credits": str(credits),
        }
    })

    # Log pending transaction
    tx = PctWalletTransaction(
        user_id=user_id,
        transaction_type="PURCHASE",
        credits=credits,
        description=f"PCT Wallet Purchase: {label}",
        razorpay_order_id=rzp_order["id"],
        amount_inr=price_inr,
        status="pending"
    )
    db.add(tx)
    db.commit()

    return {
        "order_id": rzp_order["id"],
        "key_id": RAZORPAY_KEY_ID,
        "amount": price_inr,
        "amount_paise": amount_paise,
        "currency": "INR",
        "credits": credits,
        "package_id": pkg_id,
    }


def verify_wallet_payment(
    user_id: int,
    order_id: str,
    payment_id: str,
    signature: str,
    db: Session
) -> Dict[str, Any]:
    """
    Verifies Razorpay HMAC signature and credits the user's PCT wallet.
    """
    # 1. Verify HMAC-SHA256 signature
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(generated_signature, signature):
        raise ValueError("Invalid Razorpay payment signature")

    # 2. Find pending transaction
    tx = db.query(PctWalletTransaction).filter(
        PctWalletTransaction.user_id == user_id,
        PctWalletTransaction.razorpay_order_id == order_id
    ).first()

    if not tx:
        raise ValueError("Transaction record not found for this order")

    if tx.status == "completed":
        # Idempotent response
        wallet = get_or_create_wallet(user_id, db)
        return {"success": True, "balance": wallet.balance, "already_credited": True}

    # 3. Credit wallet
    wallet = get_or_create_wallet(user_id, db)
    wallet.balance += tx.credits
    wallet.total_purchased += tx.credits

    # 4. Mark transaction completed
    tx.razorpay_payment_id = payment_id
    tx.razorpay_signature = signature
    tx.status = "completed"

    db.commit()
    db.refresh(wallet)

    return {
        "success": True,
        "credits_added": tx.credits,
        "new_balance": wallet.balance
    }
