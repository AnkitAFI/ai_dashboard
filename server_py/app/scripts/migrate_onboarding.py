from sqlalchemy import text
from app.db.session import engine

def migrate():
    # List of SQL statements to add missing onboarding columns
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_goal VARCHAR(100)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_marketplace VARCHAR(100)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_details VARCHAR(500)"
    ]

    with engine.connect() as connection:
        for statement in statements:
            try:
                print(f"Executing: {statement}")
                connection.execute(text(statement))
                connection.commit()
                print("✅ Success")
            except Exception as e:
                # Catching already existing column errors gracefully if needed
                print(f"⚠️  Info: {e}")

    print("\nMigration complete! 🎉")

if __name__ == "__main__":
    migrate()
