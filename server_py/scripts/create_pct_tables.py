import os
import sys

# Add server_py root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.db.session import engine

DDL = """
-- 1. pct_tracked_items
CREATE TABLE IF NOT EXISTS pct_tracked_items (
    id                     SERIAL PRIMARY KEY,
    user_id                INTEGER      NOT NULL REFERENCES users_auth(id) ON DELETE CASCADE,
    sheet_name             VARCHAR(255),
    our_asin               VARCHAR(20)  NOT NULL,
    competitor_asins       TEXT[]       NOT NULL,
    alert_competitor_asins TEXT[]       DEFAULT '{}',
    country                VARCHAR(5)   NOT NULL DEFAULT 'IN',
    alert_enabled          BOOLEAN      NOT NULL DEFAULT FALSE,
    alert_threshold        NUMERIC(5,2) DEFAULT 5.0,
    alert_emails           TEXT[],
    is_active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pct_user_our_asin UNIQUE (user_id, our_asin)
);
CREATE INDEX IF NOT EXISTS idx_pct_items_user     ON pct_tracked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pct_items_our_asin ON pct_tracked_items(our_asin);

-- 2. pct_price_snapshots
CREATE TABLE IF NOT EXISTS pct_price_snapshots (
    id               SERIAL PRIMARY KEY,
    asin             VARCHAR(20)  NOT NULL,
    country          VARCHAR(5)   NOT NULL DEFAULT 'IN',
    product_title    TEXT,
    product_price    NUMERIC(12,2),
    currency         VARCHAR(10)  DEFAULT 'INR',
    product_photo    TEXT,
    product_url      TEXT,
    is_prime         BOOLEAN      DEFAULT FALSE,
    is_amazon_choice BOOLEAN      DEFAULT FALSE,
    availability     VARCHAR(100),
    star_rating      NUMERIC(3,1),
    num_ratings      INTEGER,
    fetched_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    raw_data         JSONB,
    CONSTRAINT uq_pct_snap_asin_country UNIQUE (asin, country)
);
CREATE INDEX IF NOT EXISTS idx_pct_snap_asin    ON pct_price_snapshots(asin, country);
CREATE INDEX IF NOT EXISTS idx_pct_snap_fetched ON pct_price_snapshots(fetched_at);

-- 3. pct_price_history
CREATE TABLE IF NOT EXISTS pct_price_history (
    id          BIGSERIAL   PRIMARY KEY,
    asin        VARCHAR(20) NOT NULL,
    country     VARCHAR(5)  NOT NULL DEFAULT 'IN',
    price       NUMERIC(12,2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_hist_asin_time ON pct_price_history(asin, recorded_at DESC);

-- 4. pct_alert_logs
CREATE TABLE IF NOT EXISTS pct_alert_logs (
    id            SERIAL      PRIMARY KEY,
    tracker_id    INTEGER     NOT NULL REFERENCES pct_tracked_items(id) ON DELETE CASCADE,
    user_id       INTEGER     NOT NULL REFERENCES users_auth(id) ON DELETE CASCADE,
    trigger_asin  VARCHAR(20) NOT NULL,
    our_price     NUMERIC(12,2),
    their_price   NUMERIC(12,2),
    diff_pct      NUMERIC(5,2),
    email_sent_to TEXT[],
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_alerts_user ON pct_alert_logs(user_id);

-- 5. pct_quota_usage
CREATE TABLE IF NOT EXISTS pct_quota_usage (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL UNIQUE REFERENCES users_auth(id) ON DELETE CASCADE,
    credits_used  INTEGER NOT NULL DEFAULT 0,
    alerts_used   INTEGER NOT NULL DEFAULT 0,
    cycle_start   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_tier     VARCHAR(50) NOT NULL DEFAULT 'free',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_quota_user ON pct_quota_usage(user_id);

-- 6. pct_wallet
CREATE TABLE IF NOT EXISTS pct_wallet (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users_auth(id) ON DELETE CASCADE,
    balance         INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_used      INTEGER NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_wallet_user ON pct_wallet(user_id);

-- 7. pct_wallet_transactions
CREATE TABLE IF NOT EXISTS pct_wallet_transactions (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users_auth(id) ON DELETE CASCADE,
    transaction_type    VARCHAR(20) NOT NULL,
    credits             INTEGER NOT NULL,
    description         TEXT,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  VARCHAR(256),
    invoice_number      VARCHAR(50),
    amount_inr          INTEGER,
    status              VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_tx_user ON pct_wallet_transactions(user_id);
"""

def main():
    print("Running DDL to create 7 PCT tables...")
    with engine.begin() as conn:
        for statement in DDL.split(";"):
            stmt = statement.strip()
            if stmt:
                conn.execute(text(stmt))
    print("All 7 PCT tables successfully created/verified!")

if __name__ == "__main__":
    main()
