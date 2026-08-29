import os
import sys
import logging
from datetime import datetime, timezone

# Fix for imports if running standalone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.models.user_model import User

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
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
    main()
