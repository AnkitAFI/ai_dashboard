from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, List
from pydantic import BaseModel, Field
import json

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.schema_v2 import UserAuth, UserSubscription, AmazonSPAPICredential
from app.models.schema_v2 import AmazonSPAPIReviewRules, AmazonSPAPIOrderReviewLog, AmazonSPAPIAuditLog

router = APIRouter()

# --- Pydantic Schemas ---

class ReviewRuleUpdate(BaseModel):
    delay_days_after_shipment: int = Field(..., ge=5, le=28, description="Amazon requires between 5 and 30 days after delivery. We limit to 5-28 days after shipment.")
    exclude_refunded: bool = True

class GlobalRuleUpdate(ReviewRuleUpdate):
    is_active: bool = False

def check_premium_tier(user: UserAuth, db: Session):
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == user.id).first()
    if not sub or sub.subscription_tier not in ["premium", "enterprise"]:
        raise HTTPException(status_code=403, detail="Review Automation requires Premium or Enterprise tier.")

@router.get("/{sp_id}/rules")
def get_review_rules(
    sp_id: str,
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user),
) -> Any:
    """
    Get the global rule and all ASIN overrides for the current user's SP account.
    """
    check_premium_tier(current_user, db)
    
    # Ensure they own this sp_id
    cred = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == sp_id
    ).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Amazon Seller account not found or not linked.")

    rules = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.user_id == current_user.id,
        AmazonSPAPIReviewRules.selling_partner_id == sp_id
    ).all()
    
    global_rule = None
    custom_rules = []
    
    for rule in rules:
        if rule.asin == "GLOBAL":
            global_rule = rule
        else:
            custom_rules.append(rule)
            
    # Create default global rule if it doesn't exist
    if not global_rule:
        global_rule = AmazonSPAPIReviewRules(
            user_id=current_user.id,
            selling_partner_id=sp_id,
            asin="GLOBAL",
            delay_days_after_shipment=7,
            exclude_refunded=True,
            is_active=False
        )
        db.add(global_rule)
        db.commit()
        db.refresh(global_rule)
        
    return {
        "global_rule": global_rule,
        "custom_rules": custom_rules
    }

@router.put("/{sp_id}/rules/global")
def update_global_rule(
    sp_id: str,
    payload: GlobalRuleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user),
) -> Any:
    """
    Update the global review rule and Master Automation Toggle.
    """
    check_premium_tier(current_user, db)
    
    rule = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.user_id == current_user.id,
        AmazonSPAPIReviewRules.selling_partner_id == sp_id,
        AmazonSPAPIReviewRules.asin == "GLOBAL"
    ).first()
    
    old_val = {}
    if not rule:
        rule = AmazonSPAPIReviewRules(
            user_id=current_user.id,
            selling_partner_id=sp_id,
            asin="GLOBAL"
        )
        db.add(rule)
    else:
        old_val = {
            "delay_days_after_shipment": rule.delay_days_after_shipment,
            "exclude_refunded": rule.exclude_refunded,
            "is_active": rule.is_active
        }
        
    rule.delay_days_after_shipment = payload.delay_days_after_shipment
    rule.exclude_refunded = payload.exclude_refunded
    rule.is_active = payload.is_active
    
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=sp_id,
        action="UPDATE_GLOBAL_REVIEW_RULE",
        asin="GLOBAL",
        old_value=json.dumps(old_val),
        new_value=json.dumps(payload.dict()),
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    
    db.commit()
    db.refresh(rule)
    return rule

@router.put("/{sp_id}/rules/asin/{asin}")
def update_asin_rule(
    sp_id: str,
    asin: str,
    payload: ReviewRuleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user),
) -> Any:
    """
    Set a custom wait time override for a specific ASIN.
    """
    check_premium_tier(current_user, db)
    
    rule = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.user_id == current_user.id,
        AmazonSPAPIReviewRules.selling_partner_id == sp_id,
        AmazonSPAPIReviewRules.asin == asin
    ).first()
    
    old_val = {}
    if rule:
        old_val = {
            "delay_days_after_shipment": rule.delay_days_after_shipment,
            "exclude_refunded": rule.exclude_refunded
        }
    else:
        rule = AmazonSPAPIReviewRules(
            user_id=current_user.id,
            selling_partner_id=sp_id,
            asin=asin
        )
        db.add(rule)
        
    rule.delay_days_after_shipment = payload.delay_days_after_shipment
    rule.exclude_refunded = payload.exclude_refunded
    
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=sp_id,
        action="UPDATE_ASIN_REVIEW_RULE",
        asin=asin,
        old_value=json.dumps(old_val),
        new_value=json.dumps(payload.dict()),
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{sp_id}/rules/asin/{asin}")
def delete_asin_rule(
    sp_id: str,
    asin: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user),
) -> Any:
    """
    Remove a custom rule override, reverting the ASIN to the global rule.
    """
    check_premium_tier(current_user, db)
    
    rule = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.user_id == current_user.id,
        AmazonSPAPIReviewRules.selling_partner_id == sp_id,
        AmazonSPAPIReviewRules.asin == asin
    ).first()
    
    if rule:
        old_val = {
            "delay_days_after_shipment": rule.delay_days_after_shipment,
            "exclude_refunded": rule.exclude_refunded
        }
        audit = AmazonSPAPIAuditLog(
            user_id=current_user.id,
            selling_partner_id=sp_id,
            action="DELETE_ASIN_REVIEW_RULE",
            asin=asin,
            old_value=json.dumps(old_val),
            new_value="DELETED",
            ip_address=request.client.host if request.client else None
        )
        db.add(audit)
        db.delete(rule)
        db.commit()
        
    return {"message": "Override removed"}

@router.get("/{sp_id}/stats")
def get_review_stats(
    sp_id: str,
    db: Session = Depends(get_db),
    current_user: UserAuth = Depends(get_current_user),
) -> Any:
    """
    Get 30-day KPIs for the Review Automator Dashboard.
    """
    check_premium_tier(current_user, db)
    
    # 1. Total Sent (SOLICITED)
    solicited = db.query(func.count(AmazonSPAPIOrderReviewLog.id)).filter(
        AmazonSPAPIOrderReviewLog.user_id == current_user.id,
        AmazonSPAPIOrderReviewLog.selling_partner_id == sp_id,
        AmazonSPAPIOrderReviewLog.status == "SOLICITED"
    ).scalar() or 0
    
    # 2. Pending Queue (PENDING)
    pending = db.query(func.count(AmazonSPAPIOrderReviewLog.id)).filter(
        AmazonSPAPIOrderReviewLog.user_id == current_user.id,
        AmazonSPAPIOrderReviewLog.selling_partner_id == sp_id,
        AmazonSPAPIOrderReviewLog.status == "PENDING"
    ).scalar() or 0
    
    # 3. Excluded Orders (EXCLUDED_REFUND + EXCLUDED_OPT_OUT + EXCLUDED_AMAZON_RULE)
    excluded = db.query(func.count(AmazonSPAPIOrderReviewLog.id)).filter(
        AmazonSPAPIOrderReviewLog.user_id == current_user.id,
        AmazonSPAPIOrderReviewLog.selling_partner_id == sp_id,
        AmazonSPAPIOrderReviewLog.status.like("EXCLUDED_%")
    ).scalar() or 0
    
    return {
        "requests_sent": solicited,
        "pending_queue": pending,
        "orders_excluded": excluded
    }
