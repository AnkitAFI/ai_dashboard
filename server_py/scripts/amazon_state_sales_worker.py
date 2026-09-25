import os
import sys
import logging
import asyncio
import httpx
from datetime import datetime, timedelta
import csv
import io
import gzip
from sqlalchemy import text

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.schema_v2 import (
    AmazonSPAPICredential,
    UserSubscription,
    AmazonSPAPIReportQueue,
    AmazonSPAPIStateSales
)
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AmazonStateSalesWorker")

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
    headers = {"x-amz-access-token": access_token}
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
        
        file_response = await client.get(download_url)
        file_response.raise_for_status()
        
        content = file_response.content
        if compression == "GZIP":
            content = gzip.decompress(content)
            
        return content.decode('utf-8')

def parse_state_sales_report(csv_content: str) -> dict:
    # TSV format for GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL or GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL
    # DPDP / GDPR Compliance: Explicitly do NOT extract buyer-name, ship-address-1, ship-address-2
    reader = csv.DictReader(io.StringIO(csv_content), delimiter='\t')
    state_sales = {}
    
    for row in reader:
        asin = row.get("asin")
        state = row.get("ship-state")
        city = row.get("ship-city", "")
        qty_str = row.get("quantity", "0")
        price_str = row.get("item-price", "0.0")
        
        if not asin or not state:
            continue
            
        try:
            qty = int(float(qty_str))
            price = float(price_str)
        except (ValueError, TypeError):
            continue
            
        state_clean = state.strip().upper()
        city_clean = city.strip().upper()
        key = (asin, state_clean, city_clean)
        
        if key not in state_sales:
            state_sales[key] = {"units": 0, "revenue": 0.0}
            
        state_sales[key]["units"] += qty
        state_sales[key]["revenue"] += (price * qty)
            
    return state_sales

async def process_account(db, cred: AmazonSPAPICredential):
    logger.info(f"Processing state sales sync for {cred.selling_partner_id}")
    
    try:
        access_token = await get_access_token(cred.refresh_token)
    except Exception as e:
        logger.error(f"Failed to get access token for {cred.selling_partner_id}: {e}")
        return

    # Check pending reports
    pending_reports = db.query(AmazonSPAPIReportQueue).filter(
        AmazonSPAPIReportQueue.user_id == cred.user_id,
        AmazonSPAPIReportQueue.selling_partner_id == cred.selling_partner_id,
        AmazonSPAPIReportQueue.report_type == "STATE_SALES",
        AmazonSPAPIReportQueue.status == "PROCESSING"
    ).all()

    if not pending_reports:
        # Request Sales (Last 30 Days)
        start_time = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
        # We use GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL which contains ship-state
        sales_report_id = await request_report(access_token, "GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL", start_time)
        
        if sales_report_id:
            db.add(AmazonSPAPIReportQueue(
                user_id=cred.user_id, 
                selling_partner_id=cred.selling_partner_id, 
                report_type="STATE_SALES", 
                report_id=sales_report_id
            ))
            db.commit()
            logger.info(f"Phase 1: Requested state sales report for {cred.selling_partner_id}")
        return

    for queue_item in pending_reports:
        status_data = await check_report_status(access_token, queue_item.report_id)
        status = status_data.get("processingStatus")
        
        if status == "DONE":
            logger.info("Report DONE. Downloading and Parsing...")
            doc_id = status_data.get("reportDocumentId")
            if doc_id:
                content = await download_report_document(access_token, doc_id)
                parsed_data = parse_state_sales_report(content)
                
                # Upsert Data securely
                for (asin, state, city), data in parsed_data.items():
                    upsert_query = text("""
                        INSERT INTO amazon_sp_api_state_sales 
                        (user_id, selling_partner_id, asin, state, city, units_sold, revenue, date_recorded)
                        VALUES (:user_id, :sp_id, :asin, :state, :city, :units, :revenue, :date_recorded)
                        ON CONFLICT (user_id, selling_partner_id, asin, state) 
                        DO UPDATE SET 
                            units_sold = amazon_sp_api_state_sales.units_sold + EXCLUDED.units_sold,
                            revenue = amazon_sp_api_state_sales.revenue + EXCLUDED.revenue,
                            updated_at = NOW();
                    """)
                    db.execute(upsert_query, {
                        "user_id": cred.user_id,
                        "sp_id": cred.selling_partner_id,
                        "asin": asin,
                        "state": state,
                        "city": city,
                        "units": data["units"],
                        "revenue": data["revenue"],
                        "date_recorded": datetime.utcnow().date()
                    })
                
            queue_item.status = "DONE"
            db.commit()
            logger.info(f"Phase 2: Completed state sales sync for {cred.selling_partner_id}")
        elif status in ["FATAL", "CANCELLED"]:
            logger.error(f"Report failed: {status}")
            queue_item.status = "FATAL"
            db.commit()
        else:
            logger.info(f"Report still {status}")

async def main():
    logger.info("Starting Amazon State Sales Worker (Rate Limit Safe Batch)...")
    db = SessionLocal()
    try:
        # Get all Premium/Enterprise users
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
            AmazonSPAPIReportQueue.report_type == "STATE_SALES",
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
            await asyncio.sleep(3.0) # Rate limit protection
            
    except Exception as e:
        logger.error(f"Worker failed: {e}")
    finally:
        db.close()
        logger.info("Worker finished.")

if __name__ == "__main__":
    asyncio.run(main())
