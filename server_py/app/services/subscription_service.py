from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session
from app.models.legacy_models import User

def sync_and_check_subscription_status(user: Any, db: Session) -> Any:
    """
    Central helper function to check subscription expiry and apply usage reset logic:
    
    1. If user is on a PAID plan (tier != 'free') and now > subscription_expires_at:
       -> Downgrade tier to 'free'.
       
    2. If user is on a FREE plan:
       -> Usage limits (AI chat, SOV, product analysis, etc.) reset on CALENDAR MONTH change (YYYY-MM).
       
    3. If user is on a PAID plan:
       -> Usage limits DO NOT reset on calendar month change.
       -> Usage limits reset ONLY on subscription purchase / renewal / upgrade payment.
    """
    if not user:
        return user

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    tier = (user.subscription_tier or "free").lower()
    expires_at = user.subscription_expires_at

    if expires_at and expires_at.tzinfo:
        expires_at = expires_at.replace(tzinfo=None)

    # 1. Check if Paid Subscription has expired
    if tier != "free" and expires_at and now > expires_at:
        print(f"⚠️ Subscription for user {user.id} expired on {expires_at}. Downgrading to free tier.")
        user.subscription_tier = "free"
        tier = "free"
        db.commit()

    # 2. Reset logic based on effective tier
    current_month = now.strftime("%Y-%m")
    modified = False

    if tier == "free":
        # Free users: Calendar month reset
        if user.ai_chat_month != current_month:
            user.ai_chat_used = 0
            user.ai_chat_month = current_month
            modified = True

        if user.sov_month != current_month:
            user.sov_used = 0
            user.sov_month = current_month
            modified = True

        if user.analysis_month != current_month:
            user.analysis_used = 0
            user.analysis_month = current_month
            modified = True

        if user.keyword_tracker_month != current_month:
            user.keyword_tracker_used = 0
            user.keyword_tracker_month = current_month
            modified = True

        if user.ai_listings_month != current_month:
            user.ai_listings_generated = 0
            user.ai_listings_month = current_month
            modified = True
    else:
        # Paid users: Keep month tags updated to current_month so views render correctly,
        # but DO NOT reset counters to 0 on calendar month change.
        if user.ai_chat_month != current_month:
            user.ai_chat_month = current_month
            modified = True

        if user.sov_month != current_month:
            user.sov_month = current_month
            modified = True

        if user.analysis_month != current_month:
            user.analysis_month = current_month
            modified = True

        if user.keyword_tracker_month != current_month:
            user.keyword_tracker_month = current_month
            modified = True

        if user.ai_listings_month != current_month:
            user.ai_listings_month = current_month
            modified = True

    if modified:
        db.commit()
        db.refresh(user)

    return user
