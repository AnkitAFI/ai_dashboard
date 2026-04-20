import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def migrate():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("Starting database migration for onboarding fields...")
        
        # Add columns if they don't exist
        queries = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_goal VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_marketplace VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_details VARCHAR(500)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_id VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS seller_sync_status VARCHAR(20) DEFAULT 'IDLE'"
        ]
        
        for query in queries:
            cur.execute(query)
            print(f"Executed: {query}")
        
        conn.commit()
        cur.close()
        conn.close()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")

if __name__ == "__main__":
    migrate()
