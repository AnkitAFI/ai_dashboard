import os
import sys
import asyncio
import logging
import httpx
import csv
import io
import gzip
from datetime import datetime, timedelta, timezone

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import UserSubscription, AmazonSPAPICredential, AmazonSPAPIReportQueue, AmazonSPAPIOrderReviewLog
from app.core.config import settings
from sqlalchemy.dialects.postgresql import insert

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
SP_API_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com"
MARKETPLACE_ID_IN = "A21TJRUUN4KGV"

async def get_access_token(refresh_token: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        return response.json()["access_token"]

async def request_report(access_token: str, report_type: str, data_start_time: str = None) -> str:
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json"
    }
    payload = {
        "reportType": report_type,
        "marketplaceIds": [MARKETPLACE_ID_IN]
    }
    if data_start_time:
        payload["dataStartTime"] = data_start_time

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SP_API_ENDPOINT}/reports/2021-06-30/reports",
            json=payload,
            headers=headers
        )
        if response.status_code == 429:
            logger.warning(f"Rate limited creating report {report_type}")
            return None
        response.raise_for_status()
        return response.json()["reportId"]

async def check_report_status(access_token: str, report_id: str) -> dict:
    headers = {
        "x-amz-access-token": access_token,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SP_API_ENDPOINT}/reports/2021-06-30/reports/{report_id}",
            headers=headers
        )
        if response.status_code == 429:
            return None
        response.raise_for_status()
        return response.json()

async def download_report(access_token: str, report_document_id: str) -> str:
    headers = {
        "x-amz-access-token": access_token,
    }
    async with httpx.AsyncClient() as client:
        # 1. Get document URL
        doc_res = await client.get(
            f"{SP_API_ENDPOINT}/reports/2021-06-30/documents/{report_document_id}",
            headers=headers
        )
        doc_res.raise_for_status()
        doc_info = doc_res.json()
        
        url = doc_info["url"]
        compression = doc_info.get("compressionAlgorithm")
        
        # 2. Download from S3 URL
        s3_res = await client.get(url)
        s3_res.raise_for_status()
        content = s3_res.content
        
        if compression == "GZIP":
            content = gzip.decompress(content)
            
        return content.decode('utf-8')

def parse_orders_report(csv_content: str) -> list:
    # GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')
    orders = []
    
    for row in reader:
        amazon_order_id = row.get("amazon-order-id")
        asin = row.get("asin")
        purchase_date_str = row.get("purchase-date")
        status = row.get("order-status")
        
        if not amazon_order_id or not asin or not purchase_date_str:
            continue
            
        if status != "Shipped":
            continue
            
        try:
            # Format: 2023-09-15T08:30:00+00:00
            purchase_date = datetime.fromisoformat(purchase_date_str.replace('Z', '+00:00'))
            # We use purchase_date + 2 days as a proxy for shipment_date if exact shipment date isn't available
            shipment_date = purchase_date + timedelta(days=2)
            
            orders.append({
                "amazon_order_id": amazon_order_id,
                "asin": asin,
                "shipment_date": shipment_date
            })
        except ValueError:
            continue
            
    return orders

def parse_returns_report(csv_content: str) -> list:
    # GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')
    returns = []
    for row in reader:
        order_id = row.get("order-id")
        if order_id:
            returns.append(order_id)
    return returns

async def process_account(db, cred: AmazonSPAPICredential):
    try:
        logger.info(f"Processing Review Harvester for SP_ID: {cred.selling_partner_id}")
        access_token = await get_access_token(cred.refresh_token)
        
        # We will track 2 queues per account: "REVIEW_ORDERS" and "REVIEW_RETURNS"
        orders_queue = db.query(AmazonSPAPIReportQueue).filter(
            AmazonSPAPIReportQueue.selling_partner_id == cred.selling_partner_id,
            AmazonSPAPIReportQueue.report_type == "REVIEW_ORDERS"
        ).first()
        
        returns_queue = db.query(AmazonSPAPIReportQueue).filter(
            AmazonSPAPIReportQueue.selling_partner_id == cred.selling_partner_id,
            AmazonSPAPIReportQueue.report_type == "REVIEW_RETURNS"
        ).first()
        
        # --- PHASE 1: Create Reports if none exist ---
        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)
        data_start_time = thirty_days_ago.strftime("%Y-%m-%dT%H:%M:%SZ")

        if not orders_queue:
            report_id = await request_report(access_token, "GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL", data_start_time)
            if report_id:
                orders_queue = AmazonSPAPIReportQueue(
                    user_id=cred.user_id,
                    selling_partner_id=cred.selling_partner_id,
                    report_type="REVIEW_ORDERS",
                    report_id=report_id,
                    status="PROCESSING"
                )
                db.add(orders_queue)
                db.commit()
                
        if not returns_queue:
            report_id = await request_report(access_token, "GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE", data_start_time)
            if report_id:
                returns_queue = AmazonSPAPIReportQueue(
                    user_id=cred.user_id,
                    selling_partner_id=cred.selling_partner_id,
                    report_type="REVIEW_RETURNS",
                    report_id=report_id,
                    status="PROCESSING"
                )
                db.add(returns_queue)
                db.commit()

        # --- PHASE 2: Check Status and Download ---
        report_data = {}
        
        for q in [orders_queue, returns_queue]:
            if q and q.status == "PROCESSING":
                status_res = await check_report_status(access_token, q.report_id)
                if status_res:
                    processing_status = status_res.get("processingStatus")
                    if processing_status == "DONE":
                        doc_id = status_res.get("reportDocumentId")
                        if doc_id:
                            csv_data = await download_report(access_token, doc_id)
                            report_data[q.report_type] = csv_data
                        
                        db.delete(q) # Clear the queue
                        db.commit()
                    elif processing_status in ["FATAL", "CANCELLED"]:
                        db.delete(q)
                        db.commit()
                        
        # --- PHASE 3: Save to DB ---
        if "REVIEW_ORDERS" in report_data:
            orders = parse_orders_report(report_data["REVIEW_ORDERS"])
            logger.info(f"Parsed {len(orders)} shipped orders for {cred.selling_partner_id}")
            
            for o in orders:
                # Upsert into log
                stmt = insert(AmazonSPAPIOrderReviewLog).values(
                    user_id=cred.user_id,
                    selling_partner_id=cred.selling_partner_id,
                    amazon_order_id=o["amazon_order_id"],
                    asin=o["asin"],
                    shipment_date=o["shipment_date"]
                )
                stmt = stmt.on_conflict_do_nothing(index_elements=['selling_partner_id', 'amazon_order_id'])
                db.execute(stmt)
            db.commit()
            
        if "REVIEW_RETURNS" in report_data:
            returns = parse_returns_report(report_data["REVIEW_RETURNS"])
            logger.info(f"Parsed {len(returns)} returns for {cred.selling_partner_id}")
            
            if returns:
                # Update existing orders to is_refunded=True
                db.query(AmazonSPAPIOrderReviewLog).filter(
                    AmazonSPAPIOrderReviewLog.selling_partner_id == cred.selling_partner_id,
                    AmazonSPAPIOrderReviewLog.amazon_order_id.in_(returns)
                ).update({"is_refunded": True}, synchronize_session=False)
                db.commit()
                
    except Exception as e:
        logger.error(f"Error processing {cred.selling_partner_id}: {str(e)}")


async def main():
    logger.info("Starting Amazon Orders Data Harvester...")
    db = SessionLocal()
    try:
        # Get Premium/Enterprise users
        premium_users = db.query(UserSubscription).filter(
            UserSubscription.subscription_tier.in_(["premium", "enterprise"])
        ).all()
        
        premium_user_ids = [u.user_id for u in premium_users]
        if not premium_user_ids:
            return

        BATCH_SIZE = 20
        
        pending_creds_query = db.query(AmazonSPAPICredential).join(
            AmazonSPAPIReportQueue,
            (AmazonSPAPIReportQueue.user_id == AmazonSPAPICredential.user_id) &
            (AmazonSPAPIReportQueue.selling_partner_id == AmazonSPAPICredential.selling_partner_id)
        ).filter(
            AmazonSPAPICredential.user_id.in_(premium_user_ids),
            AmazonSPAPIReportQueue.report_type.in_(["REVIEW_ORDERS", "REVIEW_RETURNS"]),
            AmazonSPAPIReportQueue.status == "PROCESSING"
        ).distinct().limit(BATCH_SIZE)
        
        pending_creds = pending_creds_query.all()
        
        new_creds = []
        if len(pending_creds) < BATCH_SIZE:
            exclude_ids = [c.user_id for c in pending_creds]
            available_user_ids = [uid for uid in premium_user_ids if uid not in exclude_ids]
            if available_user_ids:
                new_creds = db.query(AmazonSPAPICredential).filter(
                    AmazonSPAPICredential.user_id.in_(available_user_ids)
                ).limit(BATCH_SIZE - len(pending_creds)).all()
                
        process_batch = pending_creds + new_creds
        
        for cred in process_batch:
            await process_account(db, cred)
            await asyncio.sleep(3.0) # Rate limit safety
            
    finally:
        db.close()
        logger.info("Harvester finished.")

if __name__ == "__main__":
    asyncio.run(main())
