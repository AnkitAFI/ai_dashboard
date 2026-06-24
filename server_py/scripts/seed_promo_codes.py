import os
import sys
from datetime import datetime, timedelta

# Add parent directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.session import SessionLocal, engine
from app.models.legacy_models import PromoCode, Base

def seed_promo_codes():
    # Create the new tables in the database if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding Promo Codes...")

        codes_to_add = [
            {
                "code": "INSYDZ-WELCOME",
                "discount_percentage": 20.00,
                "marketing_channel": "Welcome Email",
                "max_uses_per_user": 1,
            },
            {
                "code": "INSYDZ-YOUTUBE",
                "discount_percentage": 20.00,
                "marketing_channel": "YouTube",
                "max_uses_per_user": 1,
            },
            {
                "code": "INSYDZ-X",
                "discount_percentage": 20.00,
                "marketing_channel": "Twitter/X",
                "max_uses_per_user": 1,
            },
            {
                "code": "INSYDZ-LINKEDIN",
                "discount_percentage": 20.00,
                "marketing_channel": "LinkedIn",
                "max_uses_per_user": 1,
            },
            {
                "code": "INSYDZ-FLASH-2H",
                "discount_percentage": 20.00,
                "marketing_channel": "Flash Sale",
                "max_uses_per_user": 1,
                # Example of a code that will expire 2 hours after running this script (in IST)
                "expires_at": datetime.utcnow() + timedelta(hours=7, minutes=30) # UTC + 5:30 + 2 hours
            }
        ]

        for promo_data in codes_to_add:
            # Check if code already exists
            existing = db.query(PromoCode).filter(PromoCode.code == promo_data["code"]).first()
            if not existing:
                new_promo = PromoCode(**promo_data)
                db.add(new_promo)
                print(f"Added: {promo_data['code']}")
            else:
                print(f"Skipped (already exists): {promo_data['code']}")
        
        db.commit()
        print("\nSuccessfully seeded all promo codes!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_promo_codes()
