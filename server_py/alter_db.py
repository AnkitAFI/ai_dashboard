import asyncio
from sqlalchemy import text
from app.db.session import engine

def main():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE product_listings ADD COLUMN a_plus_content JSON;"))
            print("Successfully added a_plus_content to product_listings")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
