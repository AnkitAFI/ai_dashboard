from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.db.session import get_db
from app.models.schema_v2 import (
    AmazonSPAPICredential, 
    AmazonSPAPIRefundReconciliation,
    AmazonSPAPIAuditLog
)
from app.api.deps import get_current_user
from app.services.rate_limiter import SPAPIRateLimit
from app.services.profitability_service import require_tier
from pydantic import BaseModel
import logging

router = APIRouter(prefix="/amazon-sp-api/reimbursements", tags=["Amazon SP-API Reimbursements"])
logger = logging.getLogger(__name__)

class UpdateReimbursementStatusRequest(BaseModel):
    status: str # PENDING, CLAIM_FILED, REIMBURSED, IGNORED

def verify_tenant_and_tier(selling_partner_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Double-Lock Verification: Ensure user owns this selling_partner_id and is on a Premium/Enterprise tier."""
    # Enforce strict tier requirement
    require_tier(current_user.id, "premium", db)
    
    user_creds = db.query(AmazonSPAPICredential).filter(
        AmazonSPAPICredential.user_id == current_user.id
    ).all()
    
    if not any(c.selling_partner_id == selling_partner_id for c in user_creds):
        raise HTTPException(status_code=403, detail="Forbidden: Account access denied or not connected.")
    return selling_partner_id

@router.get("/{selling_partner_id}/summary", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def get_reimbursement_summary(
    selling_partner_id: str = Depends(verify_tenant_and_tier),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get the KPI summary for Lost Money."""
    
    # Calculate Total Potential Lost (amount refunded but not returned to FBA)
    # We only count items that are genuinely 'lost' (status = PENDING or CLAIM_FILED)
    total_lost = db.query(func.sum(AmazonSPAPIRefundReconciliation.refunded_amount)).filter(
        AmazonSPAPIRefundReconciliation.user_id == current_user.id,
        AmazonSPAPIRefundReconciliation.selling_partner_id == selling_partner_id,
        AmazonSPAPIRefundReconciliation.is_returned_to_fba == False,
        AmazonSPAPIRefundReconciliation.status.in_(["PENDING", "CLAIM_FILED"])
    ).scalar() or 0.0

    # Calculate Total Successfully Reimbursed
    total_reimbursed = db.query(func.sum(AmazonSPAPIRefundReconciliation.reimbursed_amount)).filter(
        AmazonSPAPIRefundReconciliation.user_id == current_user.id,
        AmazonSPAPIRefundReconciliation.selling_partner_id == selling_partner_id,
        AmazonSPAPIRefundReconciliation.status == "REIMBURSED"
    ).scalar() or 0.0

    # Actionable items (status is still PENDING)
    actionable_count = db.query(func.count(AmazonSPAPIRefundReconciliation.id)).filter(
        AmazonSPAPIRefundReconciliation.user_id == current_user.id,
        AmazonSPAPIRefundReconciliation.selling_partner_id == selling_partner_id,
        AmazonSPAPIRefundReconciliation.is_returned_to_fba == False,
        AmazonSPAPIRefundReconciliation.status == "PENDING"
    ).scalar() or 0

    return {
        "total_potential_lost": float(total_lost),
        "total_successfully_reimbursed": float(total_reimbursed),
        "actionable_cases_count": actionable_count
    }

@router.get("/{selling_partner_id}/discrepancies", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def get_reimbursement_discrepancies(
    selling_partner_id: str = Depends(verify_tenant_and_tier),
    status: Optional[str] = Query(None, description="Filter by status (e.g. PENDING, CLAIM_FILED)"),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """List all discrepancy records where a refund was issued but no return was found."""
    
    query = db.query(AmazonSPAPIRefundReconciliation).filter(
        AmazonSPAPIRefundReconciliation.user_id == current_user.id,
        AmazonSPAPIRefundReconciliation.selling_partner_id == selling_partner_id,
        AmazonSPAPIRefundReconciliation.is_returned_to_fba == False
    )

    if status:
        query = query.filter(AmazonSPAPIRefundReconciliation.status == status)

    # Order by most recent refund
    records = query.order_by(AmazonSPAPIRefundReconciliation.refund_date.desc()).all()
    
    results = []
    for rec in records:
        results.append({
            "id": rec.id,
            "amazon_order_id": rec.amazon_order_id,
            "asin": rec.asin,
            "refunded_amount": float(rec.refunded_amount),
            "refund_date": rec.refund_date.isoformat() if rec.refund_date else None,
            "status": rec.status,
            "reimbursed_amount": float(rec.reimbursed_amount),
            "last_checked_at": rec.last_checked_at.isoformat() if rec.last_checked_at else None
        })
        
    return {"discrepancies": results}

@router.put("/{selling_partner_id}/status/{amazon_order_id}", dependencies=[Depends(SPAPIRateLimit("default", tokens=1))])
def update_reimbursement_status(
    amazon_order_id: str,
    payload: UpdateReimbursementStatusRequest,
    request: Request,
    selling_partner_id: str = Depends(verify_tenant_and_tier),
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Allows the seller to manually update the status of a discrepancy and logs the action."""
    valid_statuses = ["PENDING", "CLAIM_FILED", "REIMBURSED", "IGNORED"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    # Use row-level locking or standard fetch depending on concurrency needs
    # We fetch specifically to update safely
    record = db.query(AmazonSPAPIRefundReconciliation).filter(
        AmazonSPAPIRefundReconciliation.user_id == current_user.id,
        AmazonSPAPIRefundReconciliation.selling_partner_id == selling_partner_id,
        AmazonSPAPIRefundReconciliation.amazon_order_id == amazon_order_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Discrepancy record not found.")

    old_status = record.status
    record.status = payload.status
    
    # Audit Logging (Crucial for accountability)
    ip = request.client.host if request.client else "unknown"
    audit = AmazonSPAPIAuditLog(
        user_id=current_user.id,
        selling_partner_id=selling_partner_id,
        action="UPDATE_REIMBURSEMENT_STATUS",
        asin=record.asin,
        old_value=f"status:{old_status}",
        new_value=f"status:{payload.status}",
        ip_address=ip
    )
    db.add(audit)
    
    db.commit()
    
    return {"status": "success", "message": "Reimbursement status updated and audited successfully."}
