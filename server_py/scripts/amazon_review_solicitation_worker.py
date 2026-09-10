import os
import sys
import asyncio
import logging
import httpx
from datetime import datetime, timezone, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import UserSubscription, AmazonSPAPICredential, AmazonSPAPIReviewRules, AmazonSPAPIOrderReviewLog
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

async def send_review_request(access_token: str, amazon_order_id: str) -> int:
    """
    Calls the SP-API Solicitations endpoint.
    Returns HTTP Status Code.
    """
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json"
    }
    
    url = f"{SP_API_ENDPOINT}/orders/v1/orders/{amazon_order_id}/solicitations/productReviewsAndSellerFeedback?marketplaceIds={MARKETPLACE_ID_IN}"
    
    async with httpx.AsyncClient() as client:
        # Note: Empty POST body
        response = await client.post(url, headers=headers)
        return response.status_code

async def process_account(db, cred: AmazonSPAPICredential):
    logger.info(f"Checking Review Solicitations for SP_ID: {cred.selling_partner_id}")
    
    # 1. Get GLOBAL rule
    global_rule = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.selling_partner_id == cred.selling_partner_id,
        AmazonSPAPIReviewRules.asin == "GLOBAL"
    ).first()
    
    if not global_rule or not global_rule.is_active:
        logger.info(f"Automation is OFF for SP_ID: {cred.selling_partner_id}. Skipping.")
        return
        
    # Pre-fetch all custom rules for fast lookup
    custom_rules = db.query(AmazonSPAPIReviewRules).filter(
        AmazonSPAPIReviewRules.selling_partner_id == cred.selling_partner_id,
        AmazonSPAPIReviewRules.asin != "GLOBAL"
    ).all()
    rule_map = {r.asin: r.delay_days_after_shipment for r in custom_rules}
    
    # 2. Find eligible PENDING orders
    pending_orders = db.query(AmazonSPAPIOrderReviewLog).filter(
        AmazonSPAPIOrderReviewLog.selling_partner_id == cred.selling_partner_id,
        AmazonSPAPIOrderReviewLog.status == "PENDING",
        AmazonSPAPIOrderReviewLog.is_refunded == False
    ).all()
    
    if not pending_orders:
        return
        
    now = datetime.now(timezone.utc)
    access_token = None
    
    for order in pending_orders:
        # Check rule delay
        delay_days = rule_map.get(order.asin, global_rule.delay_days_after_shipment)
        
        # Enforce Amazon's strict 30 day max policy internally
        if delay_days > 28: delay_days = 28
        if delay_days < 5: delay_days = 5
        
        eligible_date = order.shipment_date + timedelta(days=delay_days)
        
        # If it's been more than 30 days, we missed the window, mark excluded
        max_window = order.shipment_date + timedelta(days=30)
        if now > max_window:
            order.status = "EXCLUDED_AMAZON_RULE"
            db.commit()
            continue
            
        if now >= eligible_date:
            if not access_token:
                access_token = await get_access_token(cred.refresh_token)
                
            try:
                # 3. Fire API
                status_code = await send_review_request(access_token, order.amazon_order_id)
                
                if status_code == 201:
                    order.status = "SOLICITED"
                    order.review_requested_at = func.now()
                elif status_code == 403:
                    order.status = "EXCLUDED_OPT_OUT"
                elif status_code in [400, 404]:
                    order.status = "EXCLUDED_AMAZON_RULE"
                elif status_code == 429:
                    logger.warning("Rate limit hit!")
                    order.status = "FAILED_RETRY"
                else:
                    order.status = "FAILED_RETRY"
                    
                db.commit()
            except Exception as e:
                logger.error(f"Error soliciting {order.amazon_order_id}: {str(e)}")
                order.status = "FAILED_RETRY"
                db.commit()
                
            # 4. STRICT RATE LIMITING: Math mathematically prevents 429
            # Solicitations API allows 1 per second. We wait 1.5s to be absolutely safe.
            await asyncio.sleep(1.5)


async def main():
    logger.info("Starting Amazon Review Solicitor Worker...")
    db = SessionLocal()
    try:
        # EXACT SUBSCRIPTION FALLBACK PROTECTION
        # Join UserSubscription to ensure only Active Premium/Enterprise users are processed
        active_premium_users = db.query(UserSubscription).filter(
            UserSubscription.subscription_tier.in_(["premium", "enterprise"])
        ).all()
        
        valid_user_ids = [u.user_id for u in active_premium_users]
        
        if not valid_user_ids:
            logger.info("No active premium/enterprise users found.")
            return
            
        credentials = db.query(AmazonSPAPICredential).filter(
            AmazonSPAPICredential.user_id.in_(valid_user_ids)
        ).all()
        
        for cred in credentials:
            await process_account(db, cred)
            
    except Exception as e:
        logger.error(f"Worker exception: {str(e)}")
    finally:
        db.close()
        logger.info("Solicitor Worker finished.")

if __name__ == "__main__":
    asyncio.run(main())
