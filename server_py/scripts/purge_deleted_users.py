import sys
import os
import logging
from datetime import datetime, timedelta

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import UserAuth
from app.services.user_compliance_service import execute_right_to_be_forgotten

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def purge_old_deleted_accounts():
    """
    Finds all accounts that were soft-deleted (is_active=False) more than 30 days ago
    and executes the hard-delete 'Right to be Forgotten' workflow.
    """
    logger.info("Starting Daily DPDP 30-Day Purge Job...")
    
    db = SessionLocal()
    try:
        # Calculate the cutoff date (30 days ago)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Find users who are inactive AND their deleted_at date is older than 30 days
        users_to_purge = db.query(UserAuth).filter(
            UserAuth.is_active == False,
            UserAuth.deleted_at != None,
            UserAuth.deleted_at <= thirty_days_ago
        ).all()
        
        if not users_to_purge:
            logger.info("No accounts found that have been deleted for > 30 days. Exiting.")
            return

        logger.info(f"Found {len(users_to_purge)} accounts scheduled for permanent deletion.")
        
        success_count = 0
        for user in users_to_purge:
            logger.info(f"Executing Right to be Forgotten for User ID: {user.id} (Deleted at: {user.deleted_at})")
            success = execute_right_to_be_forgotten(db, user.id, reason="dpdp_30_day_automated_purge")
            if success:
                success_count += 1
                
        logger.info(f"Purge Job Complete. Successfully hard-deleted {success_count}/{len(users_to_purge)} accounts.")
        
    except Exception as e:
        logger.error(f"Error during purge job: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    purge_old_deleted_accounts()
