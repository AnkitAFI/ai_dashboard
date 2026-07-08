"""
db_setup.py — Production-grade database initialization.

Runs automatically every time the server starts. Safe to run repeatedly
(all statements are idempotent using CREATE IF NOT EXISTS / CREATE OR REPLACE).

What this does on every startup:
  1. Creates all real tables from both SQLAlchemy Base instances.
  2. Creates/replaces the `users` compatibility VIEW.
  3. Creates/replaces the INSTEAD OF INSERT trigger (routes inserts to correct tables).
  4. Creates/replaces the INSTEAD OF UPDATE trigger (routes updates to correct tables).
"""

import logging
from sqlalchemy import text
from app.db.session import engine

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Ensure all SQLAlchemy-managed tables exist
# ─────────────────────────────────────────────────────────────────────────────

def _create_all_tables():
    """Create all tables from every Base instance."""
    # Import models so they register themselves with their Base
    from app.models import legacy_models  # noqa: F401 — registers legacy Base tables
    from app.models import schema_v2      # noqa: F401 — registers schema_v2 Base tables
    from app.models import listing_models # noqa: F401 — registers listing_models Base tables
    from app.db.models import user_model  # noqa: F401 — registers user_model Base tables

    from app.models.legacy_models import Base as LegacyBase
    from app.db.session import Base as SessionBase
    from app.db.base import Base as DBBase

    # ── CRITICAL FIX ──
    # We must explicitly exclude the 'users' table from ALL Bases before create_all.
    # Otherwise SQLAlchemy will create a physical empty table named 'users' 
    # instead of letting us create the 'users' VIEW.
    
    session_tables = [t for name, t in SessionBase.metadata.tables.items() if name != "users"]
    legacy_tables = [t for name, t in LegacyBase.metadata.tables.items() if name != "users"]
    db_tables = [t for name, t in DBBase.metadata.tables.items() if name != "users"]

    SessionBase.metadata.create_all(bind=engine, tables=session_tables)
    LegacyBase.metadata.create_all(bind=engine, tables=legacy_tables)
    DBBase.metadata.create_all(bind=engine, tables=db_tables)

    logger.info("✅ [db_setup] All SQLAlchemy tables created/verified.")


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Create the `users` compatibility VIEW
# ─────────────────────────────────────────────────────────────────────────────

_USERS_VIEW_SQL = """
CREATE OR REPLACE VIEW users AS
SELECT
    ua.id,
    up.first_name,
    up.last_name,
    up.email,
    ua.email_hash,
    ua.password_hash,
    ubi.business_name,
    up.location,
    ubi.business_interests,
    ua.created_at,
    ua.updated_at,
    us.subscription_tier,
    us.subscription_expires_at,
    us.scheduled_downgrade_to,
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
    us.ai_listings_generated,
    us.ai_listings_month,
    us.ai_credits_balance,
    ua.is_verified,
    uas.onboarding_completed,
    ubi.onboarding_goal,
    ubi.onboarding_marketplace,
    ubi.onboarding_details,
    ubi.seller_id,
    ubi.seller_sync_status,
    up.mobile_number,
    uas.explorer_tour_completed,
    uas.seller_tour_completed,
    uas.welcome_card_dismissed,
    ua.role,
    ua.deleted_at
FROM users_auth ua
LEFT JOIN user_profiles        up  ON ua.id = up.user_id
LEFT JOIN user_business_info   ubi ON ua.id = ubi.user_id
LEFT JOIN user_subscriptions   us  ON ua.id = us.user_id
LEFT JOIN user_app_state       uas ON ua.id = uas.user_id;
"""


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — INSTEAD OF INSERT trigger
# ─────────────────────────────────────────────────────────────────────────────

_INSERT_TRIGGER_FN_SQL = """
CREATE OR REPLACE FUNCTION users_insert_trigger_fn()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id   INTEGER;
    new_created_at TIMESTAMPTZ;
BEGIN
    INSERT INTO users_auth (email_hash, password_hash, is_active, is_verified, role)
    VALUES (
        NEW.email_hash,
        NEW.password_hash,
        COALESCE(NEW.is_active,   TRUE),
        COALESCE(NEW.is_verified, FALSE),
        COALESCE(NEW.role,        'user')
    )
    RETURNING id, created_at INTO new_user_id, new_created_at;

    NEW.id         := new_user_id;
    NEW.created_at := new_created_at;

    INSERT INTO user_profiles (user_id, first_name, last_name, email, location, mobile_number, key_version)
    VALUES (new_user_id, NEW.first_name, NEW.last_name, NEW.email, NEW.location, NEW.mobile_number, 1);

    INSERT INTO user_business_info (
        user_id, business_name, business_interests,
        seller_id, seller_sync_status,
        onboarding_goal, onboarding_marketplace, onboarding_details
    ) VALUES (
        new_user_id,
        NEW.business_name,
        NEW.business_interests,
        NEW.seller_id,
        COALESCE(NEW.seller_sync_status, 'IDLE'),
        NEW.onboarding_goal,
        NEW.onboarding_marketplace,
        NEW.onboarding_details
    );

    INSERT INTO user_subscriptions (
        user_id, subscription_tier, subscription_expires_at, scheduled_downgrade_to,
        ai_chat_used, ai_chat_month,
        analysis_used, analysis_month,
        sov_used, sov_month,
        keyword_tracker_used, keyword_tracker_month,
        ki_searches_used, ki_cycle_start,
        ai_listings_generated, ai_listings_month, ai_credits_balance
    ) VALUES (
        new_user_id,
        COALESCE(NEW.subscription_tier, 'free'),
        NEW.subscription_expires_at,
        NEW.scheduled_downgrade_to,
        COALESCE(NEW.ai_chat_used,         0),
        NEW.ai_chat_month,
        COALESCE(NEW.analysis_used,        0),
        NEW.analysis_month,
        COALESCE(NEW.sov_used,             0),
        NEW.sov_month,
        COALESCE(NEW.keyword_tracker_used, 0),
        NEW.keyword_tracker_month,
        COALESCE(NEW.ki_searches_used,     0),
        NEW.ki_cycle_start,
        COALESCE(NEW.ai_listings_generated, 0),
        NEW.ai_listings_month,
        COALESCE(NEW.ai_credits_balance,    0)
    );

    INSERT INTO user_app_state (
        user_id,
        onboarding_completed,
        explorer_tour_completed,
        seller_tour_completed,
        welcome_card_dismissed
    ) VALUES (
        new_user_id,
        COALESCE(NEW.onboarding_completed,    FALSE),
        COALESCE(NEW.explorer_tour_completed, FALSE),
        COALESCE(NEW.seller_tour_completed,   FALSE),
        COALESCE(NEW.welcome_card_dismissed,  FALSE)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
"""

_INSERT_TRIGGER_SQL = """
DROP TRIGGER IF EXISTS users_insert_trigger ON users;
CREATE TRIGGER users_insert_trigger
INSTEAD OF INSERT ON users
FOR EACH ROW EXECUTE FUNCTION users_insert_trigger_fn();
"""


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — INSTEAD OF UPDATE trigger
# ─────────────────────────────────────────────────────────────────────────────

_UPDATE_TRIGGER_FN_SQL = """
CREATE OR REPLACE FUNCTION users_update_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users_auth SET
        password_hash       = COALESCE(NEW.password_hash,       OLD.password_hash),
        is_active           = COALESCE(NEW.is_active,           OLD.is_active),
        is_verified         = COALESCE(NEW.is_verified,         OLD.is_verified),
        role                = COALESCE(NEW.role,                OLD.role),
        updated_at          = NOW()
    WHERE id = OLD.id;

    UPDATE user_profiles SET
        first_name          = COALESCE(NEW.first_name,    OLD.first_name),
        last_name           = COALESCE(NEW.last_name,     OLD.last_name),
        email               = COALESCE(NEW.email,         OLD.email),
        location            = COALESCE(NEW.location,      OLD.location),
        mobile_number       = COALESCE(NEW.mobile_number, OLD.mobile_number),
        updated_at          = NOW()
    WHERE user_id = OLD.id;

    UPDATE user_business_info SET
        business_name           = COALESCE(NEW.business_name,          OLD.business_name),
        business_interests      = COALESCE(NEW.business_interests,     OLD.business_interests),
        seller_id               = COALESCE(NEW.seller_id,              OLD.seller_id),
        seller_sync_status      = COALESCE(NEW.seller_sync_status,     OLD.seller_sync_status),
        onboarding_goal         = COALESCE(NEW.onboarding_goal,        OLD.onboarding_goal),
        onboarding_marketplace  = COALESCE(NEW.onboarding_marketplace, OLD.onboarding_marketplace),
        onboarding_details      = COALESCE(NEW.onboarding_details,     OLD.onboarding_details)
    WHERE user_id = OLD.id;

    UPDATE user_subscriptions SET
        subscription_tier       = COALESCE(NEW.subscription_tier,       OLD.subscription_tier),
        subscription_expires_at = COALESCE(NEW.subscription_expires_at, OLD.subscription_expires_at),
        scheduled_downgrade_to  = COALESCE(NEW.scheduled_downgrade_to,  OLD.scheduled_downgrade_to),
        ai_chat_used            = COALESCE(NEW.ai_chat_used,            OLD.ai_chat_used),
        ai_chat_month           = COALESCE(NEW.ai_chat_month,           OLD.ai_chat_month),
        analysis_used           = COALESCE(NEW.analysis_used,           OLD.analysis_used),
        analysis_month          = COALESCE(NEW.analysis_month,          OLD.analysis_month),
        sov_used                = COALESCE(NEW.sov_used,                OLD.sov_used),
        sov_month               = COALESCE(NEW.sov_month,               OLD.sov_month),
        keyword_tracker_used    = COALESCE(NEW.keyword_tracker_used,    OLD.keyword_tracker_used),
        keyword_tracker_month   = COALESCE(NEW.keyword_tracker_month,   OLD.keyword_tracker_month),
        ki_searches_used        = COALESCE(NEW.ki_searches_used,        OLD.ki_searches_used),
        ki_cycle_start          = COALESCE(NEW.ki_cycle_start,          OLD.ki_cycle_start),
        ai_listings_generated   = COALESCE(NEW.ai_listings_generated,   OLD.ai_listings_generated),
        ai_listings_month       = COALESCE(NEW.ai_listings_month,       OLD.ai_listings_month),
        ai_credits_balance      = COALESCE(NEW.ai_credits_balance,      OLD.ai_credits_balance)
    WHERE user_id = OLD.id;

    UPDATE user_app_state SET
        onboarding_completed    = COALESCE(NEW.onboarding_completed,    OLD.onboarding_completed),
        explorer_tour_completed = COALESCE(NEW.explorer_tour_completed, OLD.explorer_tour_completed),
        seller_tour_completed   = COALESCE(NEW.seller_tour_completed,   OLD.seller_tour_completed),
        welcome_card_dismissed  = COALESCE(NEW.welcome_card_dismissed,  OLD.welcome_card_dismissed)
    WHERE user_id = OLD.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
"""

_UPDATE_TRIGGER_SQL = """
DROP TRIGGER IF EXISTS users_update_trigger ON users;
CREATE TRIGGER users_update_trigger
INSTEAD OF UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION users_update_trigger_fn();
"""

_DELETE_TRIGGER_FN_SQL = """
CREATE OR REPLACE FUNCTION users_delete_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    -- Soft-delete: deactivate the auth record.
    -- The nightly retention job handles the final hard-purge after 30 days.
    UPDATE users_auth SET
        is_active  = FALSE,
        deleted_at = NOW()
    WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
"""

_DELETE_TRIGGER_SQL = """
DROP TRIGGER IF EXISTS users_delete_trigger ON users;
CREATE TRIGGER users_delete_trigger
INSTEAD OF DELETE ON users
FOR EACH ROW EXECUTE FUNCTION users_delete_trigger_fn();
"""

_ADD_DELETED_AT_SQL = """
ALTER TABLE users_auth
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
"""


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point — called from main.py on startup
# ─────────────────────────────────────────────────────────────────────────────

def run_startup_setup():
    """
    Master setup function. Call once at application startup.
    Safe to call on every restart — all operations are idempotent.
    """
    logger.info("=" * 60)
    logger.info("🔧 Running database startup setup...")
    logger.info("=" * 60)

    # 1. Create all SQLAlchemy tables
    try:
        _create_all_tables()
    except Exception as e:
        logger.critical(f"❌ [db_setup] FATAL: Table creation failed: {e}")
        raise  # This is unrecoverable — crash loudly

    # 2. Create view and triggers — each step is independent
    steps = [
        ("ALTER TABLE: deleted_at",  _ADD_DELETED_AT_SQL),
        ("users VIEW",               _USERS_VIEW_SQL),
        ("INSERT trigger fn",        _INSERT_TRIGGER_FN_SQL),
        ("INSERT trigger",           _INSERT_TRIGGER_SQL),
        ("UPDATE trigger fn",        _UPDATE_TRIGGER_FN_SQL),
        ("UPDATE trigger",           _UPDATE_TRIGGER_SQL),
        ("DELETE trigger fn",        _DELETE_TRIGGER_FN_SQL),
        ("DELETE trigger",           _DELETE_TRIGGER_SQL),
    ]

    for name, sql in steps:
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
            logger.info(f"  ✅ {name} — OK")
        except Exception as e:
            # Log the warning but don't crash — the server can still run
            # if these were already created in a previous start.
            logger.warning(f"  ⚠️  {name} — skipped ({e})")

    logger.info("=" * 60)
    logger.info("✅ Database startup setup complete.")
    logger.info("=" * 60)
