import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith('"') and DATABASE_URL.endswith('"'):
    DATABASE_URL = DATABASE_URL[1:-1]

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE publish_compliance_logs ADD COLUMN published_images JSON;"))
        conn.commit()
        print("Successfully added published_images column")
    except Exception as e:
        print(f"Error adding published_images (may already exist): {e}")

    try:
        conn.execute(text("ALTER TABLE publish_compliance_logs ADD COLUMN published_data_snapshot JSON;"))
        conn.commit()
        print("Successfully added published_data_snapshot column")
    except Exception as e:
        print(f"Error adding published_data_snapshot (may already exist): {e}")
