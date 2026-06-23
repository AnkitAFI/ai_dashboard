from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.legacy_models import PromoCode, PromoCodeSchedule, PromoCodeRedemption, User

router = APIRouter()

@router.get("/validate")
def validate_promo_code(code: str, user_id: int, db: Session = Depends(get_db)):
    """
    Validates a promo code for a specific user.
    Returns the discount percentage if valid.
    """
    # Use IST (UTC + 5:30) for all checks
    now = datetime.utcnow() + timedelta(hours=5, minutes=30)

    # 1. Check if code exists and is active
    promo = db.query(PromoCode).filter(PromoCode.code == code).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid promo code.")
    if not promo.is_active:
        raise HTTPException(status_code=400, detail="This promo code is no longer active.")

    # 2. Check global valid_from / expires_at
    if promo.valid_from and promo.valid_from > now:
        raise HTTPException(status_code=400, detail="This promo code is not active yet.")
    if promo.expires_at and promo.expires_at < now:
        raise HTTPException(status_code=400, detail="This promo code has expired.")

    # 3. Check schedules (Festival dates)
    # If the code has schedules, the current date must fall within at least one schedule window.
    schedules = db.query(PromoCodeSchedule).filter(PromoCodeSchedule.promo_code_id == promo.id).all()
    if schedules:
        is_in_schedule = any(s.start_date <= now <= s.end_date for s in schedules)
        if not is_in_schedule:
            raise HTTPException(status_code=400, detail="This promo code is only valid during specific promotional periods.")

    # 4. Check if user has already redeemed it
    redemptions_count = db.query(PromoCodeRedemption).filter(
        PromoCodeRedemption.promo_code_id == promo.id,
        PromoCodeRedemption.user_id == user_id
    ).count()

    if redemptions_count >= promo.max_uses_per_user:
        raise HTTPException(status_code=400, detail="You have already used this promo code.")

    return {
        "valid": True,
        "discount_percentage": float(promo.discount_percentage),
        "code": promo.code,
        "message": f"{float(promo.discount_percentage):g}% discount applied successfully!"
    }
