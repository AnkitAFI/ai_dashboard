import os
import sys
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, null
from sqlalchemy.orm import sessionmaker

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables (ensure this is run in the server_py directory)
load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if not db_url:
    logger.error("DATABASE_URL is missing from .env")
    sys.exit(1)

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
# Use psycopg2 for synchronous ORM operations
db_url = db_url.replace("asyncpg", "psycopg2")

engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import our new ORM models so SQLAlchemy applies the EncryptedString and HashedString logic
from app.models.schema_v2 import (
    UserAuth,
    UserProfile,
    UserBusinessInfo,
    UserSubscription,
    UserAppState,
    UserConsent
)

def run_migration():
    logger.info("Starting cryptographic database migration...")
    
    with SessionLocal() as session:
        # 1. Fetch all raw rows from the old renamed table
        try:
            legacy_users = session.execute(text("SELECT * FROM users_legacy")).mappings().all()
        except Exception as e:
            logger.error(f"Failed to read from users_legacy. Did you rename it? Error: {e}")
            sys.exit(1)
            
        if not legacy_users:
            logger.info("No users found in users_legacy to migrate.")
            return

        logger.info(f"Found {len(legacy_users)} users in users_legacy. Migrating and encrypting...")

        for row in legacy_users:
            # 2. Extract values (handling missing columns if old schema was slightly different)
            uid = row.get("id")
            
            # --- UserAuth ---
            # email is passed to email_hash so HashedString auto-hashes it!
            auth = UserAuth(
                id=uid,
                email_hash=row.get("email"), 
                password_hash=row.get("password_hash"),
                is_active=row.get("is_active", True),
                is_verified=row.get("is_verified", False),
                role=row.get("role", "user"),
                created_at=row.get("created_at"),
                updated_at=row.get("updated_at")
            )
            session.add(auth)

            # --- UserProfile ---
            # EncryptedString automatically encrypts these fields
            profile = UserProfile(
                user_id=uid,
                email=row.get("email"),
                first_name=row.get("first_name"),
                last_name=row.get("last_name"),
                mobile_number=row.get("mobile_number"),
                location=row.get("location"),
                created_at=row.get("created_at"),
                updated_at=row.get("updated_at")
            )
            session.add(profile)

            # --- UserBusinessInfo ---
            # seller_id_hash auto-hashes, seller_id auto-encrypts
            biz = UserBusinessInfo(
                user_id=uid,
                seller_id=row.get("seller_id"),
                seller_id_hash=row.get("seller_id"),
                business_name=row.get("business_name"),
                business_interests=row.get("business_interests"),
                seller_sync_status=row.get("seller_sync_status", "IDLE"),
                onboarding_goal=row.get("onboarding_goal"),
                onboarding_marketplace=row.get("onboarding_marketplace"),
                onboarding_details=row.get("onboarding_details")
            )
            session.add(biz)

            # --- UserSubscription ---
            sub = UserSubscription(
                user_id=uid,
                subscription_tier=row.get("subscription_tier", "free"),
                subscription_expires_at=row.get("subscription_expires_at"),
                scheduled_downgrade_to=row.get("scheduled_downgrade_to"),
                ki_cycle_start=row.get("ki_cycle_start"),
                ai_chat_used=row.get("ai_chat_used", 0),
                ai_chat_month=row.get("ai_chat_month"),
                analysis_used=row.get("analysis_used", 0),
                analysis_month=row.get("analysis_month"),
                sov_used=row.get("sov_used", 0),
                sov_month=row.get("sov_month"),
                keyword_tracker_used=row.get("keyword_tracker_used", 0),
                keyword_tracker_month=row.get("keyword_tracker_month"),
                ki_searches_used=row.get("ki_searches_used", 0)
            )
            session.add(sub)

            # --- UserAppState ---
            app_state = UserAppState(
                user_id=uid,
                onboarding_completed=row.get("onboarding_completed", False),
                explorer_tour_completed=row.get("explorer_tour_completed", False),
                seller_tour_completed=row.get("seller_tour_completed", False),
                welcome_card_dismissed=row.get("welcome_card_dismissed", False)
            )
            session.add(app_state)
            
            # --- UserConsent (Compliance) ---
            # Explicitly record the consents they accepted at signup time
            reg_date = row.get("created_at")
            consents = [
                UserConsent(user_id=uid, consent_type="terms_of_service", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
                UserConsent(user_id=uid, consent_type="privacy_policy", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
                UserConsent(user_id=uid, consent_type="data_processing", status=True, ip_hash="legacy_user", created_at=reg_date, accepted_at=reg_date, policy_version="v1.0"),
                UserConsent(user_id=uid, consent_type="marketing_emails", status=False, ip_hash="legacy_user", created_at=reg_date, accepted_at=null(), policy_version="v1.0"),
            ]
            session.add_all(consents)
            
            logger.info(f"Processed user ID {uid}")

        # 3. Commit the transaction (this fires all the cryptography)
        try:
            session.commit()
            logger.info("✅ All users successfully committed with military-grade encryption!")
        except Exception as e:
            session.rollback()
            logger.error(f"❌ Failed to commit migration: {e}")
            sys.exit(1)

        # 4. Fix the PostgreSQL Sequence so new signups don't crash with duplicate ID errors
        try:
            session.execute(text("SELECT setval('users_auth_id_seq', (SELECT MAX(id) FROM users_auth))"))
            session.commit()
            logger.info("✅ PostgreSQL ID sequence synchronized.")
        except Exception as e:
            logger.warning(f"⚠️ Could not update ID sequence (maybe sequence name is different?): {e}")

if __name__ == "__main__":
    run_migration()
