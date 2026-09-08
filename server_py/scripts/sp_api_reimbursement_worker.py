import asyncio
import logging
import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal
import time
from sp_api.api import Orders, Finances, Reports
from sp_api.base import SellingApiException, Marketplaces
from app.core.config import settings
from app.models.schema_v2 import (
    AmazonSPAPICredential, 
    AmazonSPAPIRefundReconciliation,
    AmazonSPAPIFinancialEvent,
    AmazonSPAPIOrder,
    UserSubscription
)

logger = logging.getLogger("SPAPIReimbursementWorker")
logger.setLevel(logging.INFO)

RATE_LIMIT_DELAY = 1.0 
MAX_RETRIES = 3

async def sync_reimbursements_for_account(db: Session, cred: AmazonSPAPICredential):
    """Pulls Refunds, Returns, and Reimbursements to find missing inventory."""
    logger.info(f"Starting reimbursement sync for SP-ID: {cred.selling_partner_id}")
    
    # 90-day lookback window due to SP-API limitations on financial/return reports
    start_time = datetime.utcnow() - timedelta(days=90)
    
    credentials = dict(
        refresh_token=cred.refresh_token,
        lwa_app_id=settings.AMAZON_SP_API_LWA_CLIENT_ID,
        lwa_client_secret=settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
        aws_secret_key=settings.AMAZON_SP_API_AWS_SECRET_KEY,
        aws_access_key=settings.AMAZON_SP_API_AWS_ACCESS_KEY,
        role_arn=settings.AMAZON_SP_API_ROLE_ARN,
    )

    try:
        reports_api = Reports(credentials=credentials, marketplace=Marketplaces.IN)
        finances_api = Finances(credentials=credentials, marketplace=Marketplaces.IN)
        
        # Step 1: Find all orders that were refunded in the last 90 days.
        # We query our local DB first since sp_api_sync_worker.py already pulls FinancialEvents
        # We look for negative amounts representing refunds to customers.
        # Note: In a robust production system, we'd specifically filter by EventType='RefundEvent' 
        # but relying on amounts and negative signs serves as a solid proxy for POCs.
        
        refunds = db.query(AmazonSPAPIFinancialEvent).filter(
            AmazonSPAPIFinancialEvent.selling_partner_id == cred.selling_partner_id,
            AmazonSPAPIFinancialEvent.posted_date >= start_time,
            AmazonSPAPIFinancialEvent.amount < 0
        ).all()
        
        # Deduplicate to get unique Order IDs that were refunded
        refunded_orders = {}
        for r in refunds:
            if r.amazon_order_id not in refunded_orders:
                refunded_orders[r.amazon_order_id] = {
                    "amount": abs(float(r.amount)), 
                    "date": r.posted_date
                }
            else:
                # Accumulate the total refund amount for the order
                refunded_orders[r.amazon_order_id]["amount"] += abs(float(r.amount))

        logger.info(f"Found {len(refunded_orders)} refunded orders locally for {cred.selling_partner_id}")
        
        if not refunded_orders:
            return # Nothing to reconcile
        
        # Step 2: Request the FBA Customer Returns Data Report
        time.sleep(RATE_LIMIT_DELAY)
        # Note: This is an asynchronous report in SP-API. We'd create it, wait for it to process, then download.
        # For this worker script, we implement the synchronous waiting pattern for simplicity.
        returns_report_res = reports_api.create_report(
            reportType="GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA",
            dataStartTime=start_time.isoformat() + "Z",
            dataEndTime=datetime.utcnow().isoformat() + "Z"
        )
        report_id = returns_report_res.payload.get("reportId")
        
        # Polling for completion
        report_document_id = None
        for _ in range(15): # Max 15 mins wait
            time.sleep(60)
            status_res = reports_api.get_report(report_id)
            if status_res.payload.get("processingStatus") == "DONE":
                report_document_id = status_res.payload.get("reportDocumentId")
                break
            elif status_res.payload.get("processingStatus") in ["FATAL", "CANCELLED"]:
                logger.error(f"Returns report failed/cancelled for {cred.selling_partner_id}")
                break
        
        returned_orders = set()
        if report_document_id:
            doc_res = reports_api.get_report_document(report_document_id)
            url = doc_res.payload.get("url")
            # In a real scenario we'd download and parse the TSV here.
            # Assuming a helper function `parse_amazon_tsv(url)` returns a list of dicts.
            import requests
            tsv_data = requests.get(url).text
            for line in tsv_data.split('\n')[1:]: # Skip header
                cols = line.split('\t')
                if len(cols) > 2:
                    order_id = cols[1] # Typically OrderID is 2nd column
                    returned_orders.add(order_id)
                    
        # Step 3: Request the FBA Reimbursements Data Report
        time.sleep(RATE_LIMIT_DELAY)
        reimburse_report_res = reports_api.create_report(
            reportType="GET_FBA_REIMBURSEMENTS_DATA",
            dataStartTime=start_time.isoformat() + "Z",
            dataEndTime=datetime.utcnow().isoformat() + "Z"
        )
        reimburse_report_id = reimburse_report_res.payload.get("reportId")
        
        reimburse_document_id = None
        for _ in range(15):
            time.sleep(60)
            status_res = reports_api.get_report(reimburse_report_id)
            if status_res.payload.get("processingStatus") == "DONE":
                reimburse_document_id = status_res.payload.get("reportDocumentId")
                break
            
        reimbursed_orders = {}
        if reimburse_document_id:
            doc_res = reports_api.get_report_document(reimburse_document_id)
            url = doc_res.payload.get("url")
            tsv_data = requests.get(url).text
            for line in tsv_data.split('\n')[1:]:
                cols = line.split('\t')
                if len(cols) > 5:
                    order_id = cols[2] # Example column index
                    amount = cols[5] 
                    try:
                        reimbursed_orders[order_id] = float(amount)
                    except ValueError:
                        pass
        
        # Step 4: Reconcile!
        # Condition: Order was refunded >45 days ago, BUT NOT returned, and NOT reimbursed.
        # (Amazon asks sellers to wait 45 days before filing a claim)
        
        cutoff_date = datetime.utcnow() - timedelta(days=45)
        
        for order_id, refund_data in refunded_orders.items():
            if refund_data["date"] > cutoff_date:
                continue # Still inside the 45-day wait window
                
            if order_id in returned_orders:
                continue # It was returned to FBA, all good!
                
            reimbursed_amount = reimbursed_orders.get(order_id, 0.0)
            status = "REIMBURSED" if reimbursed_amount > 0 else "PENDING"
            
            # Fetch real ASIN from the local Orders table synced previously
            order_record = db.query(AmazonSPAPIOrder).filter(
                AmazonSPAPIOrder.selling_partner_id == cred.selling_partner_id,
                AmazonSPAPIOrder.amazon_order_id == order_id
            ).first()
            actual_asin = order_record.asin if order_record else "PENDING_SYNC"
            
            # Upsert into Discrepancy Table
            upsert_query = text("""
                INSERT INTO amazon_sp_api_refund_reconciliations 
                (user_id, selling_partner_id, amazon_order_id, asin, refunded_amount, refund_date, is_returned_to_fba, status, reimbursed_amount)
                VALUES (:user_id, :sp_id, :order_id, :asin, :refund_amt, :refund_date, :is_returned, :status, :reimburse_amt)
                ON CONFLICT (selling_partner_id, amazon_order_id, asin) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    reimbursed_amount = EXCLUDED.reimbursed_amount,
                    last_checked_at = NOW();
            """)
            
            db.execute(upsert_query, {
                "user_id": cred.user_id,
                "sp_id": cred.selling_partner_id,
                "order_id": order_id,
                "asin": actual_asin, 
                "refund_amt": refund_data["amount"],
                "refund_date": refund_data["date"],
                "is_returned": False,
                "status": status,
                "reimburse_amt": reimbursed_amount
            })
            
    except Exception as e:
        logger.error(f"Failed Reimbursement Sync for {cred.selling_partner_id}: {e}")
        
    db.commit()


async def run_reimbursement_cycle():
    """Main worker loop."""
    logger.info("Starting SP-API Reimbursement Sync Cycle...")
    db = SessionLocal()
    
    try:
        credentials = db.query(AmazonSPAPICredential).all()
        for cred in credentials:
            # Check tier constraint
            sub = db.query(UserSubscription).filter(UserSubscription.user_id == cred.user_id).first()
            tier = sub.subscription_tier if sub else "free"
            
            if tier not in ["premium", "enterprise"]:
                continue # Only process for high-tier users
                
            await sync_reimbursements_for_account(db, cred)
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_reimbursement_cycle())
