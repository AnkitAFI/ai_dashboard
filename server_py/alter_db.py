import asyncio
import os
import sys
from sqlalchemy import text
from app.db.session import engine
from scripts.create_facade_view import build_facade

def main():
    with engine.begin() as conn:
        try:
            # Add to user_subscriptions table (this is a real table)
            conn.execute(text("ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS ai_listings_generated INTEGER DEFAULT 0;"))
            conn.execute(text("ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS ai_listings_month VARCHAR(7);"))
            conn.execute(text("ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS ai_credits_balance INTEGER DEFAULT 0;"))
            print("Successfully added AI Listing columns to user_subscriptions table")
        except Exception as e:
            print(f"Error on user_subscriptions table: {e}")

    # Now rebuild the view
    build_facade()

if __name__ == "__main__":
    main()
