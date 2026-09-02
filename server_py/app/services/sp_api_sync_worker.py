import asyncio
import logging
import httpx
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal
import time
from sp_api.api import Orders, Finances
from sp_api.base import SellingApiException, Marketplaces
from app.core.config import settings
from app.models.schema_v2 import (
    AmazonSPAPICredential, 
    AmazonSPAPIOrder, 
    UserSubscription
)

logger = logging.getLogger("SPAPISyncWorker")
logger.setLevel(logging.INFO)

# Strict 1 request per second to protect Amazon keys
RATE_LIMIT_DELAY = 1.0 
MAX_RETRIES = 3

async def fetch_with_backoff(client: httpx.AsyncClient, url: str, headers: dict, params: dict):
    """Executes a request with exponential backoff on 429 Too Many Requests."""
    retries = 0
    backoff = 5.0 # Start with 5 seconds backoff
    
    while retries < MAX_RETRIES:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code == 429:
            logger.warning(f"429 Rate Limit Hit. Backing off for {backoff} seconds...")
            await asyncio.sleep(backoff)
            retries += 1
            backoff *= 2 # Exponential increase
            continue
            
        response.raise_for_status()
        await asyncio.sleep(RATE_LIMIT_DELAY) # Strict 1 req/sec between successful calls
        return response.json()
        
    raise Exception("Max retries exceeded on SP-API rate limits.")

async def sync_orders_for_account(db: Session, cred: AmazonSPAPICredential):
    """Delta syncs orders for a specific seller account."""
    logger.info(f"Starting sync for SP-ID: {cred.selling_partner_id}")
    
    # Delta Pull: only get orders since last sync
    # If first time, pull last 30 days (Data Hoarder protection)
    # Using timezone-naive comparisons as fallback for now
    updated_at_naive = cred.updated_at.replace(tzinfo=None) if cred.updated_at.tzinfo else cred.updated_at
    created_at_naive = cred.created_at.replace(tzinfo=None) if cred.created_at.tzinfo else cred.created_at
    
    if updated_at_naive == created_at_naive: # Assuming first sync
        created_after = datetime.utcnow() - timedelta(days=30)
    else:
        created_after = updated_at_naive
        
    # Fetch Credentials
    credentials = dict(
        refresh_token=cred.refresh_token,
        lwa_app_id=settings.AMAZON_SP_API_LWA_CLIENT_ID,
        lwa_client_secret=settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
        aws_secret_key=settings.AMAZON_SP_API_AWS_SECRET_KEY,
        aws_access_key=settings.AMAZON_SP_API_AWS_ACCESS_KEY,
        role_arn=settings.AMAZON_SP_API_ROLE_ARN,
    )

    try:
        orders_api = Orders(credentials=credentials, marketplace=Marketplaces.IN)
        finances_api = Finances(credentials=credentials, marketplace=Marketplaces.IN)
        
        # 1. Fetch Orders (Max 1 request per min per selling partner based on SP-API burst limits, but we sync every few hours)
        res = orders_api.get_orders(CreatedAfter=created_after.isoformat())
        orders_data = res.payload.get('Orders', [])
        
        for order_data in orders_data:
            amazon_order_id = order_data.get('AmazonOrderId')
            purchase_date = order_data.get('PurchaseDate')
            order_status = order_data.get('OrderStatus')
            order_total = order_data.get('OrderTotal', {})
            amount = float(order_total.get('Amount', 0.0))
            currency = order_total.get('CurrencyCode', 'INR')
            
            # Fetch Order Items for ASIN and Qty
            time.sleep(1.0) # Protect Orders API limits
            items_res = orders_api.get_order_items(amazon_order_id)
            items = items_res.payload.get('OrderItems', [])
            
            for item in items:
                asin = item.get('ASIN')
                qty = item.get('QuantityOrdered', 1)
                
                # UPSERT Order Data
                upsert_order = text("""
                    INSERT INTO amazon_sp_api_orders (user_id, selling_partner_id, amazon_order_id, purchase_date, order_status, asin, quantity, item_price, currency)
                    VALUES (:user_id, :sp_id, :order_id, :p_date, :status, :asin, :qty, :price, :currency)
                    ON CONFLICT (amazon_order_id, asin) 
                    DO UPDATE SET 
                        order_status = EXCLUDED.order_status,
                        updated_at = NOW();
                """)
                db.execute(upsert_order, {
                    "user_id": cred.user_id, "sp_id": cred.selling_partner_id, "order_id": amazon_order_id,
                    "p_date": purchase_date, "status": order_status, "asin": asin, "qty": qty, 
                    "price": amount, "currency": currency
                })
            
            # 2. Fetch Financial Events (Fees)
            time.sleep(2.5) # Protect Finances API (0.5 req/sec limit)
            fin_res = finances_api.list_financial_events_for_order(amazon_order_id)
            fin_events = fin_res.payload.get('FinancialEvents', {})
            
            # Aggregate all fee types for this order
            total_fees = 0.0
            for fee_list in fin_events.values():
                if isinstance(fee_list, list):
                    for fee in fee_list:
                        charge = fee.get('ChargeComponent', {}).get('ChargeAmount', {})
                        total_fees += float(charge.get('CurrencyAmount', 0.0))
            
            if total_fees != 0:
                upsert_finance = text("""
                    INSERT INTO amazon_sp_api_financial_events (user_id, selling_partner_id, amazon_order_id, posted_date, amount, currency)
                    VALUES (:user_id, :sp_id, :order_id, :p_date, :amt, :currency)
                    ON CONFLICT (amazon_order_id, event_type) 
                    DO UPDATE SET amount = EXCLUDED.amount, updated_at = NOW();
                """)
                db.execute(upsert_finance, {
                    "user_id": cred.user_id, "sp_id": cred.selling_partner_id, "order_id": amazon_order_id,
                    "p_date": purchase_date, "amt": total_fees, "currency": currency
                })
                
    except SellingApiException as e:
        logger.error(f"Amazon SP-API Exception for {cred.selling_partner_id}: {e}")
        raise e
    
    # Mark as synced
    cred.sync_status = "COMPLETED"
    cred.updated_at = datetime.utcnow()
    db.commit()
    logger.info(f"Completed sync for SP-ID: {cred.selling_partner_id}")

def get_tier_sync_interval(tier: str) -> timedelta:
    """Returns the sync frequency based on subscription tier."""
    tier = tier.lower()
    if tier == "enterprise":
        return timedelta(hours=2)
    elif tier == "premium":
        return timedelta(hours=12)
    else:
        # Basic, Free, or Expired Fallback
        return timedelta(hours=24)

async def run_sync_cycle():
    """Main worker loop that queries accounts needing sync and processes them."""
    logger.info("Starting SP-API Sync Cycle...")
    db = SessionLocal()
    
    try:
        # Get all connected accounts
        credentials = db.query(AmazonSPAPICredential).all()
        
        for cred in credentials:
            # Check user tier
            sub = db.query(UserSubscription).filter(UserSubscription.user_id == cred.user_id).first()
            tier = sub.subscription_tier if sub else "free"
            
            sync_interval = get_tier_sync_interval(tier)
            updated_at_naive = cred.updated_at.replace(tzinfo=None) if cred.updated_at.tzinfo else cred.updated_at
            time_since_last_sync = datetime.utcnow() - updated_at_naive
            
            if time_since_last_sync >= sync_interval or cred.sync_status == "PENDING":
                try:
                    await sync_orders_for_account(db, cred)
                except Exception as e:
                    logger.error(f"Failed to sync SP-ID {cred.selling_partner_id}: {e}")
                    cred.sync_status = "FAILED"
                    db.commit()
            else:
                logger.debug(f"SP-ID {cred.selling_partner_id} is up to date (Tier: {tier})")
                
    finally:
        db.close()

if __name__ == "__main__":
    # If run standalone, execute one cycle
    asyncio.run(run_sync_cycle())
