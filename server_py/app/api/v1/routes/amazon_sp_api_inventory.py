from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.db.session import get_db
from app.models.schema_v2 import (
    AmazonSPAPIInventorySummary,
    AmazonSPAPIInventorySettings,
    UserSubscription,
    AmazonSPAPICredential,
    AmazonSPAPIAuditLog
)
from app.api.deps import get_current_user
from datetime import datetime, timedelta
import logging

router = APIRouter(prefix="/amazon-sp-api/inventory", tags=["Amazon SP-API Inventory"])
logger = logging.getLogger(__name__)

def check_premium_access(user_id: int, db: Session):
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()
    if not sub or sub.subscription_tier not in ["premium", "enterprise"]:
        raise HTTPException(status_code=403, detail="Upgrade to Premium required to use this feature.")
    return True

@router.get("/{selling_partner_id}/forecaster")
def get_inventory_forecaster(selling_partner_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all ASIN inventory data and join with user settings to calculate restock dates."""
    check_premium_access(current_user.id, db)
    
    # Ensure they own this store
    cred = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()
    if not cred:
        raise HTTPException(status_code=403, detail="Not authorized for this seller account.")
        
    summaries = db.query(AmazonSPAPIInventorySummary).filter(
        AmazonSPAPIInventorySummary.user_id == current_user.id,
        AmazonSPAPIInventorySummary.selling_partner_id == selling_partner_id
    ).all()
    
    settings_records = db.query(AmazonSPAPIInventorySettings).filter(
        AmazonSPAPIInventorySettings.user_id == current_user.id,
        AmazonSPAPIInventorySettings.selling_partner_id == selling_partner_id
    ).all()
    
    settings_map = {s.asin: s for s in settings_records}
    
    results = []
    now = datetime.utcnow()
    
    for summary in summaries:
        s_config = settings_map.get(summary.asin)
        
        lead_time = s_config.supplier_lead_time_days if s_config else 30
        transit_time = s_config.transit_time_days if s_config else 5
        safety_stock = s_config.safety_stock_days if s_config else 14
        calc_method = s_config.velocity_calculation_method if s_config else "30D"
        manual_vel = float(s_config.manual_daily_velocity) if s_config and s_config.manual_daily_velocity else 0.0
        
        # Calculate daily velocity
        daily_velocity = 0.0
        if calc_method == "MANUAL":
            daily_velocity = manual_vel
        elif calc_method == "7D":
            daily_velocity = summary.units_sold_7d / 7.0
        else: # 30D
            # Adjust for OOS days if applicable
            active_days = max(1, 30 - summary.days_out_of_stock_30d)
            daily_velocity = summary.units_sold_30d / float(active_days)
            
        total_stock = summary.sellable_quantity + summary.inbound_quantity
        
        days_remaining = 0
        if daily_velocity > 0:
            days_remaining = int(total_stock / daily_velocity)
        else:
            days_remaining = 999 # Safe, no velocity
            
        # When do we need the stock to arrive? (Before we hit Safety Stock level)
        # Arrival Date = Today + Days Remaining - Safety Stock
        # Order Date = Arrival Date - Transit Time - Lead Time
        
        total_replenishment_time = lead_time + transit_time
        reorder_days_from_now = days_remaining - safety_stock - total_replenishment_time
        
        reorder_date = now + timedelta(days=reorder_days_from_now)
        
        # Recommend ordering enough to cover the lead time + transit time + safety stock of the NEXT cycle
        # Simplified: Order 30 days worth of stock minimum
        rec_qty = int(daily_velocity * 30)
        
        results.append({
            "asin": summary.asin,
            "product_title": summary.product_title,
            "sellable_quantity": summary.sellable_quantity,
            "inbound_quantity": summary.inbound_quantity,
            "total_stock": total_stock,
            "units_sold_30d": summary.units_sold_30d,
            "units_sold_7d": summary.units_sold_7d,
            "velocity_calculation_method": calc_method,
            "manual_daily_velocity": manual_vel,
            "daily_velocity": round(daily_velocity, 2),
            "supplier_lead_time_days": lead_time,
            "transit_time_days": transit_time,
            "safety_stock_days": safety_stock,
            "days_remaining": days_remaining,
            "reorder_date": reorder_date.isoformat(),
            "recommended_order_quantity": rec_qty,
            "is_critical": days_remaining <= (total_replenishment_time + safety_stock)
        })
        
    return {"data": results}


@router.put("/{selling_partner_id}/settings/{asin}")
def update_inventory_settings(
    selling_partner_id: str, 
    asin: str,
    payload: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Update settings for a specific ASIN and log the change."""
    check_premium_access(current_user.id, db)
    
    settings = db.query(AmazonSPAPIInventorySettings).filter(
        AmazonSPAPIInventorySettings.user_id == current_user.id,
        AmazonSPAPIInventorySettings.selling_partner_id == selling_partner_id,
        AmazonSPAPIInventorySettings.asin == asin
    ).first()
    
    old_state = "None"
    
    if not settings:
        settings = AmazonSPAPIInventorySettings(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            asin=asin
        )
        db.add(settings)
    else:
        old_state = f"Lead:{settings.supplier_lead_time_days}, Transit:{settings.transit_time_days}, Calc:{settings.velocity_calculation_method}"
        
    if "supplier_lead_time_days" in payload:
        settings.supplier_lead_time_days = int(payload["supplier_lead_time_days"])
    if "transit_time_days" in payload:
        settings.transit_time_days = int(payload["transit_time_days"])
    if "safety_stock_days" in payload:
        settings.safety_stock_days = int(payload["safety_stock_days"])
    if "velocity_calculation_method" in payload:
        settings.velocity_calculation_method = str(payload["velocity_calculation_method"])
    if "manual_daily_velocity" in payload:
        settings.manual_daily_velocity = float(payload["manual_daily_velocity"])
        
    db.commit()
    
    new_state = f"Lead:{settings.supplier_lead_time_days}, Transit:{settings.transit_time_days}, Calc:{settings.velocity_calculation_method}"
    
    # Internal Audit Log
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="UPDATE_RESTOCK_SETTINGS",
        asin=asin,
        old_value=old_state,
        new_value=new_state,
        ip_address="internal_api" # In real app, extract from Request
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success"}

@router.put("/{selling_partner_id}/settings/bulk/global")
def apply_global_inventory_settings(
    selling_partner_id: str,
    payload: Dict[str, Any] = Body(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bulk update lead time and transit time for all ASINs (or filtered ASINs if passed)."""
    check_premium_access(current_user.id, db)
    
    target_asins = payload.get("asins", []) # if empty, applies to all known
    lead_time = payload.get("supplier_lead_time_days")
    transit_time = payload.get("transit_time_days")
    
    if lead_time is None and transit_time is None:
        raise HTTPException(status_code=400, detail="Provide lead time or transit time.")
        
    query = db.query(AmazonSPAPIInventorySummary).filter(
        AmazonSPAPIInventorySummary.user_id == current_user.id,
        AmazonSPAPIInventorySummary.selling_partner_id == selling_partner_id
    )
    
    if target_asins:
        query = query.filter(AmazonSPAPIInventorySummary.asin.in_(target_asins))
        
    summaries = query.all()
    asin_list = [s.asin for s in summaries]
    
    # Fetch existing
    existing_settings = db.query(AmazonSPAPIInventorySettings).filter(
        AmazonSPAPIInventorySettings.user_id == current_user.id,
        AmazonSPAPIInventorySettings.selling_partner_id == selling_partner_id,
        AmazonSPAPIInventorySettings.asin.in_(asin_list)
    ).all()
    
    existing_map = {s.asin: s for s in existing_settings}
    
    for asin in asin_list:
        s = existing_map.get(asin)
        old_state = "None"
        if not s:
            s = AmazonSPAPIInventorySettings(
                user_id=current_user.id,
                selling_partner_id=selling_partner_id,
                asin=asin
            )
            db.add(s)
        else:
            old_state = f"Lead:{s.supplier_lead_time_days}, Transit:{s.transit_time_days}"
            
        if lead_time is not None:
            s.supplier_lead_time_days = int(lead_time)
        if transit_time is not None:
            s.transit_time_days = int(transit_time)
            
        new_state = f"Lead:{s.supplier_lead_time_days}, Transit:{s.transit_time_days}"
        
        # Log bulk
        audit = AmazonSPAPIAuditLog(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            action="BULK_UPDATE_RESTOCK_SETTINGS",
            asin=asin,
            old_value=old_state,
            new_value=new_state,
            ip_address="internal_api"
        )
        db.add(audit)
        
    db.commit()
    return {"status": "success", "updated_count": len(asin_list)}
