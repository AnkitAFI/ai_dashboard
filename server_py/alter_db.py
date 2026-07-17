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
            
            # Add draft edit columns to product_listings table
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_amazon_title VARCHAR(500);"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_amazon_bullets JSON;"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_amazon_description TEXT;"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_amazon_search_terms VARCHAR(1000);"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_flipkart_title VARCHAR(500);"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_flipkart_description TEXT;"))
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN IF NOT EXISTS user_edited_a_plus_content JSON;"))
            
            print("Successfully added AI Listing columns")
        except Exception as e:
            print(f"Error altering tables: {e}")

    # Now rebuild the view
    build_facade()

if __name__ == "__main__":
    main()
