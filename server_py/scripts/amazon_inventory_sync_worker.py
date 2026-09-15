import os
import sys
import logging
import asyncio
import httpx
from datetime import datetime, timedelta
import csv
import io
import gzip

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.schema_v2 import (
    AmazonSPAPICredential,
    UserSubscription,
    AmazonSPAPIReportQueue,
    AmazonSPAPIInventorySummary
)
from app.core.config import settings

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
        url = f"{SP_API_ENDPOINT}/reports/2021-06-30/reports"
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code == 429:
            logger.warning(f"Rate limited requesting {report_type}")
            return None
            
        response.raise_for_status()
        return response.json()["reportId"]

async def check_report_status(access_token: str, report_id: str) -> dict:
    headers = {
        "x-amz-access-token": access_token
    }
    async with httpx.AsyncClient() as client:
        url = f"{SP_API_ENDPOINT}/reports/2021-06-30/reports/{report_id}"
        response = await client.get(url, headers=headers)
        
        if response.status_code == 429:
            return {"processingStatus": "RATE_LIMITED"}
            
        response.raise_for_status()
        return response.json()

async def download_report_document(access_token: str, document_id: str) -> str:
    headers = {"x-amz-access-token": access_token}
    async with httpx.AsyncClient() as client:
        url = f"{SP_API_ENDPOINT}/reports/2021-06-30/documents/{document_id}"
        doc_response = await client.get(url, headers=headers)
        doc_response.raise_for_status()
        doc_info = doc_response.json()
        
        download_url = doc_info["url"]
        compression = doc_info.get("compressionAlgorithm")
        
        # Download the actual file
        file_response = await client.get(download_url)
        file_response.raise_for_status()
        
        content = file_response.content
        if compression == "GZIP":
            content = gzip.decompress(content)
            
        return content.decode('utf-8')

def safe_int(val) -> int:
    try:
        if not val:
            return 0
        return int(float(val))
    except (ValueError, TypeError):
        return 0

def parse_inventory_report(csv_content: str) -> dict:
    # TSV format for GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')
    inventory = {}
    for row in reader:
        asin = row.get("asin")
        if asin:
            inventory[asin] = {
                "sellable_quantity": safe_int(row.get("afn-fulfillable-quantity")),
                "inbound_quantity": safe_int(row.get("afn-inbound-working-quantity")) + \
                                    safe_int(row.get("afn-inbound-shipped-quantity")) + \
                                    safe_int(row.get("afn-inbound-receiving-quantity")),
                "product_title": row.get("product-name", "")
            }
    return inventory

def parse_sales_report(csv_content: str) -> dict:
    # TSV format for GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')
    sales = {}
    now = datetime.utcnow()
    
    for row in reader:
        asin = row.get("asin")
        purchase_date_str = row.get("purchase-date")
        status = row.get("order-status")
        qty = safe_int(row.get("quantity"))
        
        if not asin or status == "Cancelled" or not purchase_date_str:
            continue
            
        try:
            # Amazon format varies slightly, typical: 2023-10-01T12:00:00+00:00
            purchase_date = datetime.fromisoformat(purchase_date_str.replace("Z", "+00:00")).replace(tzinfo=None)
        except:
            continue
            
        days_ago = (now - purchase_date).days
        
        if asin not in sales:
            sales[asin] = {"7d": 0, "30d": 0}
            
        if days_ago <= 7:
            sales[asin]["7d"] += qty
        if days_ago <= 30:
            sales[asin]["30d"] += qty
            
    return sales

async def process_account(db, cred: AmazonSPAPICredential):
    logger.info(f"Processing inventory sync for {cred.selling_partner_id}")
    
    try:
        access_token = await get_access_token(cred.refresh_token)
    except Exception as e:
        logger.error(f"Failed to get access token for {cred.selling_partner_id}: {e}")
        return

    # Check pending reports in Queue
    pending_reports = db.query(AmazonSPAPIReportQueue).filter(
        AmazonSPAPIReportQueue.user_id == cred.user_id,
        AmazonSPAPIReportQueue.selling_partner_id == cred.selling_partner_id,
        AmazonSPAPIReportQueue.status == "PROCESSING"
    ).all()

    if not pending_reports:
        logger.info(f"Phase 1: Requesting new reports for {cred.selling_partner_id}")
        
        # Request Inventory
        inv_report_id = await request_report(access_token, "GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA")
        
        # Request Sales (Last 30 Days)
        start_time = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        sales_report_id = await request_report(access_token, "GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL", start_time)
        
        if inv_report_id:
            db.add(AmazonSPAPIReportQueue(user_id=cred.user_id, selling_partner_id=cred.selling_partner_id, report_type="INVENTORY", report_id=inv_report_id))
        if sales_report_id:
            db.add(AmazonSPAPIReportQueue(user_id=cred.user_id, selling_partner_id=cred.selling_partner_id, report_type="SALES", report_id=sales_report_id))
            
        db.commit()
        logger.info("Reports requested. Exiting to wait.")
        return

    logger.info(f"Phase 2: Checking pending reports for {cred.selling_partner_id}")
    all_done = True
    report_data = {"INVENTORY": None, "SALES": None}
    
    for queue_item in pending_reports:
        status_data = await check_report_status(access_token, queue_item.report_id)
        status = status_data.get("processingStatus")
        
        if status == "DONE":
            logger.info(f"Report {queue_item.report_type} is DONE. Downloading...")
            doc_id = status_data.get("reportDocumentId")
            if doc_id:
                content = await download_report_document(access_token, doc_id)
                report_data[queue_item.report_type] = content
                
            queue_item.status = "DONE"
        elif status in ["FATAL", "CANCELLED"]:
            logger.error(f"Report {queue_item.report_type} failed: {status}")
            queue_item.status = "FATAL"
        else:
            all_done = False
            logger.info(f"Report {queue_item.report_type} still {status}")
            
    db.commit()

    # If both are downloaded, process and update DB
    if report_data["INVENTORY"] and report_data["SALES"]:
        logger.info("Parsing report data to update InventorySummary...")
        inv_parsed = parse_inventory_report(report_data["INVENTORY"])
        sales_parsed = parse_sales_report(report_data["SALES"])
        
        # Get all ASINs
        all_asins = set(inv_parsed.keys()).union(set(sales_parsed.keys()))
        
        # Fetch existing summaries
        existing_summaries = db.query(AmazonSPAPIInventorySummary).filter(
            AmazonSPAPIInventorySummary.user_id == cred.user_id,
            AmazonSPAPIInventorySummary.selling_partner_id == cred.selling_partner_id
        ).all()
        summary_map = {s.asin: s for s in existing_summaries}
        
        for asin in all_asins:
            s = summary_map.get(asin)
            if not s:
                s = AmazonSPAPIInventorySummary(
                    user_id=cred.user_id,
                    selling_partner_id=cred.selling_partner_id,
                    asin=asin
                )
                db.add(s)
                
            inv_info = inv_parsed.get(asin, {})
            sales_info = sales_parsed.get(asin, {})
            
            s.sellable_quantity = inv_info.get("sellable_quantity", 0)
            s.inbound_quantity = inv_info.get("inbound_quantity", 0)
            if "product_title" in inv_info:
                s.product_title = inv_info["product_title"]
                
            s.units_sold_7d = sales_info.get("7d", 0)
            s.units_sold_30d = sales_info.get("30d", 0)
            
            # Simple heuristic: if stock is 0 now, they might have been OOS.
            # In a real heavy system, you query the FBA Inventory Ledger API for daily historical OOS logic.
            if s.sellable_quantity == 0 and s.inbound_quantity == 0:
                s.days_out_of_stock_30d = min(30, s.days_out_of_stock_30d + 1)
            else:
                s.days_out_of_stock_30d = 0 # reset if back in stock
                
        db.commit()
        logger.info(f"Successfully synced inventory for {cred.selling_partner_id}")


async def main():
    logger.info("Starting Amazon Inventory Sync Worker (Rate Limit Safe Batch)...")
    db = SessionLocal()
    try:
        # Get all Premium/Enterprise users
        premium_users = db.query(UserSubscription).filter(
            UserSubscription.subscription_tier.in_(["premium", "enterprise"])
        ).all()
        
        premium_user_ids = [u.user_id for u in premium_users]
        
        if not premium_user_ids:
            logger.info("No premium users found.")
            return

        # We need to process users who haven't been synced recently.
        # Since we run every 15 minutes, we'll process a small batch of 20 users per run 
        # to ensure we never hit the 1 request/sec rate limit of the Reports API.
        BATCH_SIZE = 20
        
        # We find users with pending PROCESSING reports first (Phase 2), 
        # as checking status is cheaper and needs to finish quickly.
        pending_creds_query = db.query(AmazonSPAPICredential).join(
            AmazonSPAPIReportQueue,
            (AmazonSPAPIReportQueue.user_id == AmazonSPAPICredential.user_id) &
            (AmazonSPAPIReportQueue.selling_partner_id == AmazonSPAPICredential.selling_partner_id)
        ).filter(
            AmazonSPAPICredential.user_id.in_(premium_user_ids),
            AmazonSPAPIReportQueue.status == "PROCESSING"
        ).distinct().limit(BATCH_SIZE)
        
        pending_creds = pending_creds_query.all()
        
        # If we have capacity left in our batch, fetch users who need a new sync (Phase 1)
        new_creds = []
        if len(pending_creds) < BATCH_SIZE:
            # For a production system, you'd ideally track `last_sync_time` on the Credential.
            # Here we just grab a random subset of users that aren't currently processing.
            # A more robust query would join InventorySummary and sort by last_updated_at ASC.
            exclude_ids = [c.user_id for c in pending_creds]
            available_user_ids = [uid for uid in premium_user_ids if uid not in exclude_ids]
            
            if available_user_ids:
                new_creds = db.query(AmazonSPAPICredential).filter(
                    AmazonSPAPICredential.user_id.in_(available_user_ids)
                ).limit(BATCH_SIZE - len(pending_creds)).all()
                
        process_batch = pending_creds + new_creds
        
        logger.info(f"Selected {len(process_batch)} accounts for this cron execution.")
        
        for cred in process_batch:
            await process_account(db, cred)
            # CRITICAL: Amazon Reports API rate limit token bucket refills at 0.0167 / sec.
            # To prevent 429 Too Many Requests when scaling to thousands of users, 
            # we force a hard 3-second delay between every single user account processed.
            await asyncio.sleep(3.0)
            
    except Exception as e:
        logger.error(f"Worker failed: {e}")
    finally:
        db.close()
        logger.info("Worker finished.")

if __name__ == "__main__":
    asyncio.run(main())
