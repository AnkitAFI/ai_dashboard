import os
import sys
import logging
from sqlalchemy import text
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
print(f"Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)
print(f"HMAC loaded in migration: {os.environ.get('HMAC_SECRET_KEY', 'NOT_FOUND')[:5]}...")

# Add app to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, engine
from app.core.cryptography import EncryptedString, HashedString
from app.models.schema_v2 import UserAuth, UserProfile, UserBusinessInfo, UserSubscription, UserAppState

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_users(dry_run=True):
    logger.info(f"Starting Migration. Dry Run: {dry_run}")
    db = SessionLocal()
    
    # Check if old users table exists
    try:
        result = db.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users_legacy');")).scalar()
        if not result:
            logger.info("Legacy 'users_legacy' table not found. Nothing to migrate.")
            return
    except Exception as e:
        logger.error(f"Error checking for legacy table: {e}")
        return

    # Check if new users_auth table exists (it might not if we haven't created it yet)
    try:
        Base.metadata.create_all(bind=engine) # Create all new tables just in case
    except NameError:
        from app.models.schema_v2 import Base
        Base.metadata.create_all(bind=engine)
        logger.info("Ensured new schema tables exist.")

    try:
        # 1. Fetch all existing users from legacy table
        legacy_users = db.execute(text("SELECT * FROM users_legacy")).mappings().all()
        logger.info(f"Found {len(legacy_users)} legacy users to migrate.")

        if dry_run:
            logger.info("DRY RUN mode. No changes will be committed.")

        hash_type = HashedString()
        enc_type = EncryptedString()

        for old_user in legacy_users:
            old_id = old_user['id'] # This is a varchar (UUID)
            email = old_user['email']
            
            logger.info(f"Processing user: {email}")

            # Check if already migrated using the single hash
            email_hash = hash_type.process_bind_param(email, None)
            existing = db.query(UserAuth).filter(UserAuth.email_hash == email).first() # Query using raw email, SQLAlchemy will hash it
            if existing:
                logger.info(f"User {email} already migrated. Skipping.")
                continue

            # --- Create UserAuth ---
            new_auth = UserAuth(
                id=old_id, # Preserve exact legacy ID to avoid breaking foreign keys
                email_hash=email, # Pass raw email, SQLAlchemy HashedString will hash it
                password_hash=old_user['password_hash'], # Keep exact password hash
                is_active=old_user.get('is_active', True),
                is_verified=old_user.get('is_verified', False),
                created_at=old_user.get('created_at', datetime.utcnow())
            )
            db.add(new_auth)
            # Flush to get the new integer ID if needed, but since we set it explicitly, new_id is old_id
            db.flush() 
            new_id = new_auth.id

            # --- Create UserProfile ---
            new_profile = UserProfile(
                user_id=new_id,
                email=email,
                first_name=old_user.get('first_name'),
                last_name=old_user.get('last_name'),
                location=old_user.get('location'),
                mobile_number=old_user.get('mobile_number'),
                created_at=old_user.get('created_at', datetime.utcnow())
            )
            db.add(new_profile)

            # --- Create UserBusinessInfo ---
            new_business = UserBusinessInfo(
                user_id=new_id,
                business_name=old_user.get('business_name'),
                seller_id=old_user.get('seller_id'),
                seller_id_hash=old_user.get('seller_id'),
                business_interests=old_user.get('business_interests'),
                seller_sync_status=old_user.get('seller_sync_status'),
                onboarding_goal=old_user.get('onboarding_goal'),
                onboarding_marketplace=old_user.get('onboarding_marketplace'),
                onboarding_details=old_user.get('onboarding_details'),
            )
            db.add(new_business)

            # --- Create UserSubscription ---
            new_subscription = UserSubscription(
                user_id=new_id,
                subscription_tier=old_user.get('subscription_tier', 'free'),
                subscription_expires_at=old_user.get('subscription_expires_at'),
                scheduled_downgrade_to=old_user.get('scheduled_downgrade_to'),
                ki_cycle_start=old_user.get('ki_cycle_start'),
                ai_chat_used=old_user.get('ai_chat_used', 0),
                ai_chat_month=old_user.get('ai_chat_month'),
                analysis_used=old_user.get('analysis_used', 0),
                analysis_month=old_user.get('analysis_month'),
                sov_used=old_user.get('sov_used', 0),
                sov_month=old_user.get('sov_month'),
                keyword_tracker_used=old_user.get('keyword_tracker_used', 0),
                keyword_tracker_month=old_user.get('keyword_tracker_month'),
                ki_searches_used=old_user.get('ki_searches_used', 0)
            )
            db.add(new_subscription)

            # --- Create UserAppState ---
            new_app_state = UserAppState(
                user_id=new_id,
                onboarding_completed=old_user.get('onboarding_completed', False),
                explorer_tour_completed=old_user.get('explorer_tour_completed', False),
                seller_tour_completed=old_user.get('seller_tour_completed', False),
                welcome_card_dismissed=old_user.get('welcome_card_dismissed', False)
            )
            db.add(new_app_state)

            # --- Update foreign keys in chat_messages ---
            # We must map the old varchar ID to the new integer ID
            if not dry_run:
                # Assuming chatMessages userId is still pointing to the varchar id before schema is dropped.
                # However, if Drizzle hasn't pushed yet, it's still a varchar in postgres.
                # To be absolutely safe without causing type errors, we just execute raw SQL:
                try:
                    # Check if table exists first to prevent InFailedSqlTransaction
                    has_chat_messages = db.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages');")).scalar()
                    if has_chat_messages:
                        db.execute(text("UPDATE chat_messages SET user_id = :new_id WHERE user_id = :old_id"), 
                                   {"new_id": str(new_id), "old_id": str(old_id)})
                except Exception as e:
                    logger.warning(f"Could not update chat_messages for {email}: {e}")
                    # Use savepoint rollback if we need to continue the transaction
                    # But since we checked table existence, it shouldn't hit UndefinedTable.

            logger.info(f"Successfully staged migration for user {email} (Old ID: {old_id} -> New ID: {new_id})")

        if not dry_run:
            db.commit()
            logger.info("Migration committed successfully!")
        else:
            db.rollback()
            logger.info("Dry run completed. Transaction rolled back.")

    except Exception as e:
        db.rollback()
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--commit", action="store_true", help="Commit the changes to the database")
    args = parser.parse_args()
    
    migrate_users(dry_run=not args.commit)
