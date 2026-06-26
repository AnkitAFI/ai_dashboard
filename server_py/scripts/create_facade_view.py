import os
import sys
import logging
from sqlalchemy import text

# Add app to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_facade():
    """
    Creates the 'users' view and the INSTEAD OF triggers to map legacy queries
    to the new DPDP/GDPR compliant tables seamlessly.
    """
    logger.info("Starting Database View Facade build...")

    with engine.begin() as conn:
        # 1. Rename old table to get it out of the way safely without data loss
        logger.info("Dropping view if exists to rebuild it...")
        # conn.execute(text("ALTER TABLE IF EXISTS users RENAME TO users_legacy;"))
        # Drop the view if we are rebuilding it
        conn.execute(text("DROP VIEW IF EXISTS users CASCADE;"))

        # 2. Create the unified VIEW
        logger.info("Creating 'users' view...")
        view_sql = """
        CREATE VIEW users AS
        SELECT 
            ua.id, 
            up.first_name, 
            up.last_name, 
            up.email, 
            ua.email_hash,
            ua.password_hash, 
            ub.business_name, 
            up.location, 
            ub.business_interests, 
            ua.created_at, 
            ua.updated_at, 
            us.subscription_tier, 
            us.ai_chat_used, 
            us.ai_chat_month, 
            ua.is_active, 
            us.analysis_used, 
            us.analysis_month, 
            us.sov_used, 
            us.sov_month, 
            us.keyword_tracker_used, 
            us.keyword_tracker_month, 
            us.ki_searches_used, 
            us.ki_cycle_start, 
            us.subscription_expires_at, 
            us.scheduled_downgrade_to, 
            ua.is_verified, 
            uas.onboarding_completed, 
            ub.onboarding_goal, 
            ub.onboarding_marketplace, 
            ub.onboarding_details, 
            ub.seller_id, 
            ub.seller_sync_status, 
            up.mobile_number, 
            uas.explorer_tour_completed, 
            uas.seller_tour_completed, 
            uas.welcome_card_dismissed
        FROM users_auth ua
        LEFT JOIN user_profiles up ON ua.id = up.user_id
        LEFT JOIN user_business_info ub ON ua.id = ub.user_id
        LEFT JOIN user_subscriptions us ON ua.id = us.user_id
        LEFT JOIN user_app_state uas ON ua.id = uas.user_id;
        """
        conn.execute(text(view_sql))

        # 3. Create the Trigger Functions
        logger.info("Creating INSTEAD OF triggers...")

        insert_trigger_sql = """
        CREATE OR REPLACE FUNCTION users_insert_trigger()
        RETURNS TRIGGER AS $$
        DECLARE
            new_user_id INTEGER;
        BEGIN
            -- Insert into users_auth
            -- NOTE: email_hash must be handled by the application logic before hitting DB
            -- If we are relying on TypeDecorator, SQLAlchemy sends the hash.
            -- But legacy_models.User's email is EncryptedString. The legacy email_hash is not present in legacy User.
            -- Wait, if legacy_models.User inserts, it only sends 'email'. It doesn't send 'email_hash'.
            -- We must generate a placeholder or the app must provide it. 
            -- Actually, if we add email_hash to legacy_models.User, the app will auto-generate it!
            
            INSERT INTO users_auth (email_hash, password_hash, is_active, is_verified, created_at)
            VALUES (NEW.email_hash, NEW.password_hash, COALESCE(NEW.is_active, true), COALESCE(NEW.is_verified, false), COALESCE(NEW.created_at, now()))
            RETURNING id INTO new_user_id;

            -- Insert into user_profiles
            INSERT INTO user_profiles (user_id, email, first_name, last_name, location, mobile_number, created_at)
            VALUES (new_user_id, NEW.email, NEW.first_name, NEW.last_name, NEW.location, NEW.mobile_number, COALESCE(NEW.created_at, now()));

            -- Insert into user_business_info
            INSERT INTO user_business_info (user_id, business_name, seller_id, business_interests, seller_sync_status, onboarding_goal, onboarding_marketplace, onboarding_details)
            VALUES (new_user_id, NEW.business_name, NEW.seller_id, NEW.business_interests, NEW.seller_sync_status, NEW.onboarding_goal, NEW.onboarding_marketplace, NEW.onboarding_details);

            -- Insert into user_subscriptions
            INSERT INTO user_subscriptions (user_id, subscription_tier, subscription_expires_at, scheduled_downgrade_to, ki_cycle_start, ai_chat_used, ai_chat_month, analysis_used, analysis_month, sov_used, sov_month, keyword_tracker_used, keyword_tracker_month, ki_searches_used)
            VALUES (new_user_id, COALESCE(NEW.subscription_tier, 'free'), NEW.subscription_expires_at, NEW.scheduled_downgrade_to, NEW.ki_cycle_start, COALESCE(NEW.ai_chat_used, 0), NEW.ai_chat_month, COALESCE(NEW.analysis_used, 0), NEW.analysis_month, COALESCE(NEW.sov_used, 0), NEW.sov_month, COALESCE(NEW.keyword_tracker_used, 0), NEW.keyword_tracker_month, COALESCE(NEW.ki_searches_used, 0));

            -- Insert into user_app_state
            INSERT INTO user_app_state (user_id, onboarding_completed, explorer_tour_completed, seller_tour_completed, welcome_card_dismissed)
            VALUES (new_user_id, COALESCE(NEW.onboarding_completed, false), COALESCE(NEW.explorer_tour_completed, false), COALESCE(NEW.seller_tour_completed, false), COALESCE(NEW.welcome_card_dismissed, false));

            NEW.id = new_user_id;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
        conn.execute(text(insert_trigger_sql))

        conn.execute(text("""
        DROP TRIGGER IF EXISTS users_insert ON users;
        CREATE TRIGGER users_insert
        INSTEAD OF INSERT ON users
        FOR EACH ROW EXECUTE FUNCTION users_insert_trigger();
        """))

        update_trigger_sql = """
        CREATE OR REPLACE FUNCTION users_update_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE users_auth 
            SET password_hash = NEW.password_hash, is_active = NEW.is_active, is_verified = NEW.is_verified, updated_at = now()
            WHERE id = OLD.id;

            UPDATE user_profiles
            SET email = NEW.email, first_name = NEW.first_name, last_name = NEW.last_name, location = NEW.location, mobile_number = NEW.mobile_number, updated_at = now()
            WHERE user_id = OLD.id;

            UPDATE user_business_info
            SET business_name = NEW.business_name, seller_id = NEW.seller_id, business_interests = NEW.business_interests, seller_sync_status = NEW.seller_sync_status, onboarding_goal = NEW.onboarding_goal, onboarding_marketplace = NEW.onboarding_marketplace, onboarding_details = NEW.onboarding_details
            WHERE user_id = OLD.id;

            UPDATE user_subscriptions
            SET subscription_tier = NEW.subscription_tier, subscription_expires_at = NEW.subscription_expires_at, scheduled_downgrade_to = NEW.scheduled_downgrade_to, ki_cycle_start = NEW.ki_cycle_start, ai_chat_used = NEW.ai_chat_used, ai_chat_month = NEW.ai_chat_month, analysis_used = NEW.analysis_used, analysis_month = NEW.analysis_month, sov_used = NEW.sov_used, sov_month = NEW.sov_month, keyword_tracker_used = NEW.keyword_tracker_used, keyword_tracker_month = NEW.keyword_tracker_month, ki_searches_used = NEW.ki_searches_used
            WHERE user_id = OLD.id;

            UPDATE user_app_state
            SET onboarding_completed = NEW.onboarding_completed, explorer_tour_completed = NEW.explorer_tour_completed, seller_tour_completed = NEW.seller_tour_completed, welcome_card_dismissed = NEW.welcome_card_dismissed
            WHERE user_id = OLD.id;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
        conn.execute(text(update_trigger_sql))

        conn.execute(text("""
        DROP TRIGGER IF EXISTS users_update ON users;
        CREATE TRIGGER users_update
        INSTEAD OF UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION users_update_trigger();
        """))

        delete_trigger_sql = """
        CREATE OR REPLACE FUNCTION users_delete_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Because of CASCADE deletes, deleting from users_auth handles the rest
            DELETE FROM users_auth WHERE id = OLD.id;
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;
        """
        conn.execute(text(delete_trigger_sql))

        conn.execute(text("""
        DROP TRIGGER IF EXISTS users_delete ON users;
        CREATE TRIGGER users_delete
        INSTEAD OF DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION users_delete_trigger();
        """))

        logger.info("Database View Facade successfully built.")

if __name__ == "__main__":
    build_facade()
