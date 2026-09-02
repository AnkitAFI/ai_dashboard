from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.schema_v2 import (
    AmazonSPAPICredential, 
    AmazonSPAPISettings, 
    AmazonSPAPIProductCosts, 
    AmazonSPAPIAuditLog,
    AmazonSPAPIOrder,
    AmazonSPAPIFinancialEvent
)
from app.api.deps import get_current_user
from app.services.rate_limiter import SPAPIRateLimit
from pydantic import BaseModel
from typing import Optional, List
import logging
from datetime import datetime, timedelta

router = APIRouter(prefix="/amazon-sp-api/profitability", tags=["Amazon SP-API Profitability"])
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class UpdateSettingsRequest(BaseModel):
    global_target_margin: float

class UpdateCOGSRequest(BaseModel):
    cogs: float
    inbound_shipping: float
    target_margin_override: Optional[float] = None

# --- Dependency for Tenant Isolation ---
def verify_tenant_access(selling_partner_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Double-Lock Verification: Ensure user owns this selling_partner_id."""
    creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()
    if not creds:
        raise HTTPException(status_code=403, detail="Forbidden: Account access denied or not connected.")
    return selling_partner_id

@router.get("/{selling_partner_id}/summary", dependencies=[Depends(SPAPIRateLimit("default", tokens=2))])
def get_profitability_summary(
    selling_partner_id: str = Depends(verify_tenant_access),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get Top KPI Cards and Pie Chart data. Filtered by INR only."""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Gross Revenue (from Orders)
    revenue = db.query(func.sum(AmazonSPAPIOrder.item_price * AmazonSPAPIOrder.quantity)).filter(
        AmazonSPAPIOrder.user_id == current_user.id,
        AmazonSPAPIOrder.selling_partner_id == selling_partner_id,
        AmazonSPAPIOrder.purchase_date >= start_date,
        AmazonSPAPIOrder.currency == 'INR'
    ).scalar() or 0.0

    # 2. Amazon Fees (from FinancialEvents, typically negative amounts)
    fees = db.query(func.sum(AmazonSPAPIFinancialEvent.amount)).filter(
        AmazonSPAPIFinancialEvent.user_id == current_user.id,
        AmazonSPAPIFinancialEvent.selling_partner_id == selling_partner_id,
        AmazonSPAPIFinancialEvent.posted_date >= start_date,
        AmazonSPAPIFinancialEvent.currency == 'INR'
    ).scalar() or 0.0
    
    # 3. Calculate COGS dynamically based on units sold
    orders = db.query(AmazonSPAPIOrder.asin, func.sum(AmazonSPAPIOrder.quantity).label('qty')).filter(
        AmazonSPAPIOrder.user_id == current_user.id,
        AmazonSPAPIOrder.selling_partner_id == selling_partner_id,
        AmazonSPAPIOrder.purchase_date >= start_date
    ).group_by(AmazonSPAPIOrder.asin).all()
    
    total_cogs = 0.0
    for order in orders:
        cost = db.query(AmazonSPAPIProductCosts).filter(
            AmazonSPAPIProductCosts.user_id == current_user.id,
            AmazonSPAPIProductCosts.selling_partner_id == selling_partner_id,
            AmazonSPAPIProductCosts.asin == order.asin
        ).first()
        if cost:
            total_cogs += float(cost.cogs + cost.inbound_shipping) * int(order.qty)

    # 4. Net Profit
    net_profit = float(revenue) + float(fees) - total_cogs
    
    # 5. Last Synced
    creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id,
        AmazonSPAPICredential.selling_partner_id == selling_partner_id
    ).first()
    
    return {
        "revenue": float(revenue),
        "amazon_fees": float(abs(fees)),
        "total_cogs": total_cogs,
        "net_profit": net_profit,
        "last_synced": creds.updated_at if creds else None
    }


@router.get("/{selling_partner_id}/asins", dependencies=[Depends(SPAPIRateLimit("default", tokens=2))])
def get_asin_breakdown(
    selling_partner_id: str = Depends(verify_tenant_access),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get the massive ASIN breakdown table."""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = db.query(
        AmazonSPAPIOrder.asin, 
        func.sum(AmazonSPAPIOrder.quantity).label('qty'),
        func.sum(AmazonSPAPIOrder.item_price * AmazonSPAPIOrder.quantity).label('revenue')
    ).filter(
        AmazonSPAPIOrder.user_id == current_user.id,
        AmazonSPAPIOrder.selling_partner_id == selling_partner_id,
        AmazonSPAPIOrder.purchase_date >= start_date,
        AmazonSPAPIOrder.currency == 'INR'
    ).group_by(AmazonSPAPIOrder.asin).all()
    
    settings = db.query(AmazonSPAPISettings).filter(
        AmazonSPAPISettings.user_id == current_user.id,
        AmazonSPAPISettings.selling_partner_id == selling_partner_id
    ).first()
    global_target = float(settings.global_target_margin) if settings else 5.0
    
    results = []
    for order in orders:
        cost = db.query(AmazonSPAPIProductCosts).filter(
            AmazonSPAPIProductCosts.user_id == current_user.id,
            AmazonSPAPIProductCosts.selling_partner_id == selling_partner_id,
            AmazonSPAPIProductCosts.asin == order.asin
        ).first()
        
        cogs = float(cost.cogs) if cost else 0.0
        shipping = float(cost.inbound_shipping) if cost else 0.0
        target = float(cost.target_margin_override) if (cost and cost.target_margin_override) else global_target
        
        unit_cogs_total = cogs + shipping
        total_cogs_for_asin = unit_cogs_total * int(order.qty)
        
        # Fetch actual Amazon Fees associated with these specific orders
        order_ids_query = db.query(AmazonSPAPIOrder.amazon_order_id).filter(
            AmazonSPAPIOrder.user_id == current_user.id,
            AmazonSPAPIOrder.selling_partner_id == selling_partner_id,
            AmazonSPAPIOrder.asin == order.asin,
            AmazonSPAPIOrder.purchase_date >= start_date
        )
        
        actual_fees = db.query(func.sum(AmazonSPAPIFinancialEvent.amount)).filter(
            AmazonSPAPIFinancialEvent.user_id == current_user.id,
            AmazonSPAPIFinancialEvent.selling_partner_id == selling_partner_id,
            AmazonSPAPIFinancialEvent.amazon_order_id.in_(order_ids_query)
        ).scalar() or 0.0
        
        abs_fees = abs(float(actual_fees))
        net_profit = float(order.revenue) - abs_fees - total_cogs_for_asin
        
        margin_pct = (net_profit / float(order.revenue) * 100) if float(order.revenue) > 0 else 0
        
        results.append({
            "asin": order.asin,
            "units_sold": int(order.qty),
            "revenue": float(order.revenue),
            "fees": abs_fees,
            "cogs": cogs,
            "shipping": shipping,
            "net_profit": net_profit,
            "margin_pct": margin_pct,
            "target_margin": target,
            "is_bleeding": margin_pct < target
        })
        
    return {"asins": results}


@router.put("/{selling_partner_id}/cogs/{asin}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def update_cogs(
    asin: str,
    payload: UpdateCOGSRequest,
    request: Request,
    selling_partner_id: str = Depends(verify_tenant_access),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Update COGS for a specific ASIN and trigger Audit Log."""
    cost = db.query(AmazonSPAPIProductCosts).filter(
        AmazonSPAPIProductCosts.user_id == current_user.id,
        AmazonSPAPIProductCosts.selling_partner_id == selling_partner_id,
        AmazonSPAPIProductCosts.asin == asin
    ).first()
    
    old_cogs_str = f"cogs:{cost.cogs if cost else 0}"
    
    if not cost:
        cost = AmazonSPAPIProductCosts(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id,
            asin=asin
        )
        db.add(cost)
        
    cost.cogs = payload.cogs
    cost.inbound_shipping = payload.inbound_shipping
    cost.target_margin_override = payload.target_margin_override
    
    new_cogs_str = f"cogs:{payload.cogs}"
    ip = request.client.host if request.client else "unknown"
    
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="UPDATE_COGS",
        asin=asin,
        old_value=old_cogs_str,
        new_value=new_cogs_str,
        ip_address=ip
    )
    db.add(audit)
    
    db.commit()
    return {"status": "success", "message": "COGS updated and logged."}
    
@router.put("/{selling_partner_id}/settings", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def update_settings(
    payload: UpdateSettingsRequest,
    request: Request,
    selling_partner_id: str = Depends(verify_tenant_access),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Update Global Settings and trigger Audit Log."""
    settings = db.query(AmazonSPAPISettings).filter(
        AmazonSPAPISettings.user_id == current_user.id,
        AmazonSPAPISettings.selling_partner_id == selling_partner_id
    ).first()
    
    old_val = f"margin:{settings.global_target_margin if settings else 5.0}"
    
    if not settings:
        settings = AmazonSPAPISettings(
            user_id=current_user.id,
            selling_partner_id=selling_partner_id
        )
        db.add(settings)
        
    settings.global_target_margin = payload.global_target_margin
    
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="UPDATE_GLOBAL_MARGIN",
        old_value=old_val,
        new_value=f"margin:{payload.global_target_margin}",
        ip_address=request.client.host if request.client else "unknown"
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success"}
