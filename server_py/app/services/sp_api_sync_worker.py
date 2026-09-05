import asyncio
import logging
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal
from sp_api.api import Orders, Finances, Reports
from sp_api.base import SellingApiException, Marketplaces
from app.core.config import settings
from app.models.schema_v2 import AmazonSPAPICredential, UserSubscription
from aiolimiter import AsyncLimiter
from app.core.queue import enqueue_job

logger = logging.getLogger("SPAPISyncWorker")
logger.setLevel(logging.INFO)

# Strict Token Buckets to protect Amazon Developer Keys
# Orders API limit is theoretically 0.0167 req/sec (1 per minute for steady state) but burst is 20. We limit to 1 req / 2 secs.
orders_rate_limiter = AsyncLimiter(max_rate=1, time_period=2.0)

# Finances API limit is 0.5 req/sec (1 req / 2 secs). We strictly enforce 1 req / 2.5 secs to be extra safe.
finances_rate_limiter = AsyncLimiter(max_rate=1, time_period=2.5)

async def fetch_financials_with_limit(finances_api, amazon_order_id):
    """Fetches financial events while strictly adhering to the Token Bucket rate limit."""
    async with finances_rate_limiter:
        # We run the synchronous sp_api method in a thread to prevent blocking the async event loop
        loop = asyncio.get_running_loop()
        fin_res = await loop.run_in_executor(None, finances_api.list_financial_events_for_order, amazon_order_id)
        return fin_res.payload.get('FinancialEvents', {})

async def sync_orders_for_account(sp_id: str, user_id: str):
    """Delta syncs orders for a specific seller account using queue dispatching."""
    logger.info(f"Starting async queue sync for SP-ID: {sp_id}")
    db = SessionLocal()
    
    try:
        cred = db.query(AmazonSPAPICredential).filter(
            AmazonSPAPICredential.selling_partner_id == sp_id,
            AmazonSPAPICredential.user_id == user_id
        ).first()
        
        if not cred:
            return

        updated_at_naive = cred.updated_at.replace(tzinfo=None) if cred.updated_at.tzinfo else cred.updated_at
        created_at_naive = cred.created_at.replace(tzinfo=None) if cred.created_at.tzinfo else cred.created_at
        
        if updated_at_naive == created_at_naive:
            created_after = datetime.utcnow() - timedelta(days=30)
        else:
            created_after = updated_at_naive
            
        credentials = dict(
            refresh_token=cred.refresh_token,
            lwa_app_id=settings.AMAZON_SP_API_LWA_CLIENT_ID,
            lwa_client_secret=settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
            aws_secret_key=settings.AMAZON_SP_API_AWS_SECRET_KEY,
            aws_access_key=settings.AMAZON_SP_API_AWS_ACCESS_KEY,
            role_arn=settings.AMAZON_SP_API_ROLE_ARN,
        )

        orders_api = Orders(credentials=credentials, marketplace=Marketplaces.IN)
        finances_api = Finances(credentials=credentials, marketplace=Marketplaces.IN)
        
        # Pull Orders (Wrapped in rate limiter)
        async with orders_rate_limiter:
            loop = asyncio.get_running_loop()
            res = await loop.run_in_executor(None, lambda: orders_api.get_orders(CreatedAfter=created_after.isoformat()))
            orders_data = res.payload.get('Orders', [])
            
        for order_data in orders_data:
            amazon_order_id = order_data.get('AmazonOrderId')
            purchase_date = order_data.get('PurchaseDate')
            order_status = order_data.get('OrderStatus')
            order_total = order_data.get('OrderTotal', {})
            amount = float(order_total.get('Amount', 0.0))
            currency = order_total.get('CurrencyCode', 'INR')
            
            # Drop PII - We intentionally do NOT fetch or store BuyerInfo to comply with GDPR/DPDP
            
            # Fetch Items
            async with orders_rate_limiter:
                items_res = await loop.run_in_executor(None, orders_api.get_order_items, amazon_order_id)
                items = items_res.payload.get('OrderItems', [])
            
            for item in items:
                asin = item.get('ASIN')
                qty = item.get('QuantityOrdered', 1)
                
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
            
            # Fetch Financials strictly adhering to aiolimiter
            try:
                fin_events = await fetch_financials_with_limit(finances_api, amazon_order_id)
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
            except Exception as e:
                logger.error(f"Failed to fetch finances for {amazon_order_id}: {e}")

        # Mark as synced
        cred.sync_status = "COMPLETED"
        cred.updated_at = datetime.utcnow()
        db.commit()
        logger.info(f"Completed async queue sync for SP-ID: {sp_id}")

    except SellingApiException as e:
        logger.error(f"Amazon SP-API Exception for {sp_id}: {e}")
        db.rollback()
    except Exception as e:
        logger.error(f"General Exception for {sp_id}: {e}")
        db.rollback()
    finally:
        db.close()

def get_tier_sync_interval(tier: str) -> timedelta:
    tier = tier.lower()
    if tier == "enterprise":
        return timedelta(hours=2)
    elif tier == "premium":
        return timedelta(hours=12)
    else:
        return timedelta(hours=24)

def run_sync_dispatcher():
    """Main cron job that ONLY dispatches jobs to Redis, rather than processing them inline."""
    logger.info("Starting SP-API Redis Dispatcher...")
    db = SessionLocal()
    
    try:
        credentials = db.query(AmazonSPAPICredential).all()
        
        for cred in credentials:
            sub = db.query(UserSubscription).filter(UserSubscription.user_id == cred.user_id).first()
            tier = sub.subscription_tier if sub else "free"
            
            sync_interval = get_tier_sync_interval(tier)
            updated_at_naive = cred.updated_at.replace(tzinfo=None) if cred.updated_at.tzinfo else cred.updated_at
            time_since_last_sync = datetime.utcnow() - updated_at_naive
            
            if time_since_last_sync >= sync_interval or cred.sync_status == "PENDING":
                # DISPATCH TO REDIS QUEUE instead of blocking here
                logger.info(f"Dispatching SP-ID {cred.selling_partner_id} to Redis default queue.")
                enqueue_job(sync_orders_for_account, cred.selling_partner_id, cred.user_id)
                
                # Mark as pending so we don't dispatch it again next minute
                cred.sync_status = "PENDING"
                db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    run_sync_dispatcher()
