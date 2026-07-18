import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import engine

def main():
    with engine.begin() as conn:
        try:
            print("Adding MFA columns to users_auth...")
            conn.execute(text("ALTER TABLE users_auth ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE users_auth ADD COLUMN IF NOT EXISTS mfa_secret TEXT;"))
            conn.execute(text("ALTER TABLE users_auth ADD COLUMN IF NOT EXISTS mfa_backup_codes TEXT[];"))
            print("Successfully added MFA columns to users_auth.")
        except Exception as e:
            print(f"Error altering table users_auth: {e}")

if __name__ == "__main__":
    main()
