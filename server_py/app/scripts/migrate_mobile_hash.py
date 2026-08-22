import os
import sys

# Add the server_py directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.session import SessionLocal
from app.models.schema_v2 import UserProfile
from app.core.cryptography import HashedString

def run_migration():
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # First, ensure the column exists in the database
        db.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mobile_number_hash VARCHAR(255)"))
        try:
            db.execute(text("ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_mobile_number_hash_key"))
            db.execute(text("DROP INDEX IF EXISTS ix_user_profiles_mobile_number_hash"))
        except Exception:
            pass
        db.execute(text("CREATE INDEX IF NOT EXISTS ix_user_profiles_mobile_number_hash ON user_profiles (mobile_number_hash)"))
        db.commit()

        users = db.query(UserProfile).filter(UserProfile.mobile_number.isnot(None), UserProfile.mobile_number_hash.is_(None)).all()
        print(f"Found {len(users)} user profiles needing mobile_number_hash backfill.")
        
        hasher = HashedString()
        count = 0
        for user in users:
            if user.mobile_number:
                user.mobile_number_hash = hasher.process_bind_param(user.mobile_number, None)
                count += 1
                
        db.commit()
        print(f"Successfully backfilled mobile_number_hash for {count} user profiles.")
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
