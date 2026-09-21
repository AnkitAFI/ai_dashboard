import os
import sys
import asyncio
import logging
import httpx
from datetime import datetime, timezone

# Fix for imports if running standalone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models.user_model import User
from app.models.schema_v2 import AmazonSPAPICredential
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
SP_API_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com"


async def _delete_sqs_subscription(refresh_token: str, selling_partner_id: str):
    """
    Fires SP-API DeleteSubscription for ANY_OFFER_CHANGED.
    Called when a user's subscription expires — stops Amazon from sending
    SQS notifications for their ASINs immediately.
    Fire-and-forget: errors are logged but never block the downgrade.
    """
    try:
        # Exchange refresh token for short-lived access token
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                AMAZON_TOKEN_URL,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                    "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if token_response.status_code != 200:
                logger.warning(f"[DOWNGRADE] Could not get access token for seller {selling_partner_id}. Skipping SQS unsubscribe.")
                return

            access_token = token_response.json()["access_token"]

        # Delete the ANY_OFFER_CHANGED subscription
        async with httpx.AsyncClient(timeout=10.0) as client:
            del_response = await client.delete(
                f"{SP_API_ENDPOINT}/notifications/v1/subscriptions/ANY_OFFER_CHANGED",
                headers={"x-amz-access-token": access_token},
            )
            if del_response.status_code in (200, 204, 404):
                logger.info(f"[DOWNGRADE] SQS subscription deleted for seller {selling_partner_id}")
            else:
                logger.warning(f"[DOWNGRADE] DeleteSubscription returned {del_response.status_code} for seller {selling_partner_id}")

    except Exception as exc:
        logger.error(f"[DOWNGRADE] Non-fatal: Could not delete SQS subscription for seller {selling_partner_id}: {exc}")


async def main():
    logger.info("[CRON] Starting subscription downgrade sweep...")
    
    with SessionLocal() as db:
        try:
            # 1. Fetch everyone who isn't free and has an expiration date
            active_users = db.query(User).filter(
                User.subscription_tier != 'free',
                User.subscription_expires_at.isnot(None)
            ).all()

            now_utc = datetime.now(timezone.utc)
            downgrade_count = 0

            for user in active_users:
                expires_at = user.subscription_expires_at

                # Make it timezone aware
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)

                # If expired, downgrade!
                if expires_at <= now_utc:
                    logger.info(f"[CRON] Downgrading user {user.email} (ID: {user.id}) to Free tier.")

                    # ── Hijacker Feature: Stop SQS subscriptions before downgrading ──
                    # Find all connected Amazon stores for this user
                    if user.subscription_tier in ("premium", "enterprise"):
                        creds = db.query(AmazonSPAPICredential).filter(
                            AmazonSPAPICredential.user_id == user.id
                        ).all()
                        for cred in creds:
                            # Fire-and-forget: delete Amazon SQS subscription
                            await _delete_sqs_subscription(
                                cred.refresh_token,
                                cred.selling_partner_id
                            )

                    user.subscription_tier = 'free'
                    user.subscription_expires_at = None
                    downgrade_count += 1
            
            # Save all downgrades to the database
            if downgrade_count > 0:
                db.commit()
                logger.info(f"[CRON] Successfully downgraded {downgrade_count} expired users.")
            else:
                logger.info("[CRON] No expired subscriptions found today.")

        except Exception as e:
            db.rollback()
            logger.error(f"[CRON] ERROR running downgrade sweep: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())
