# server_py/database_config.py - AUTO-FIX VERSION
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool, QueuePool
import logging
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Optional
from sqlalchemy import create_engine, text 

load_dotenv()
logger = logging.getLogger(__name__)

# Database URL - get directly from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://seller-db:Seller!db@122.176.108.253:5432/db1")

# Remove quotes if present in DATABASE_URL
if DATABASE_URL.startswith('"') and DATABASE_URL.endswith('"'):
    DATABASE_URL = DATABASE_URL[1:-1]

# Create engine with better connection pooling and error handling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=False,
    connect_args={
        "connect_timeout": 30,
        "options": "-c statement_timeout=60000"  # 30 second statement timeout
    }
)

# Create SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auto_fix_schema():
    """Automatically fix missing columns in database"""
    try:
        inspector = inspect(engine)
        
        # Check if products table exists
        if 'products' not in inspector.get_table_names():
            logger.info("Products table doesn't exist, will be created automatically")
            return
        
        # Get existing columns
        existing_columns = [col['name'] for col in inspector.get_columns('products')]
        
        # Define required columns that might be missing
        required_columns = {
            'source': "VARCHAR(50)",
            'product_id': "VARCHAR(100)",
            'asin': "VARCHAR(20)",
            'original_price': "FLOAT",
            'discount': "FLOAT",
            'reviews_count': "INTEGER",
            'is_bestseller': "BOOLEAN DEFAULT FALSE",
            'is_deal': "BOOLEAN DEFAULT FALSE",
            'variation': "JSONB",
            'product_url': "VARCHAR(500)",
            'description': "TEXT",
            'features': "JSONB",
            'specifications': "JSONB"
        }
        
        # Add missing columns
        with engine.connect() as conn:
            for column_name, column_type in required_columns.items():
                if column_name not in existing_columns:
                    try:
                        logger.info(f"Adding missing column: {column_name}")
                        conn.execute(text(f"""
                            ALTER TABLE products 
                            ADD COLUMN IF NOT EXISTS {column_name} {column_type}
                        """))
                        conn.commit()
                        logger.info(f"✅ Added column: {column_name}")
                    except Exception as e:
                        logger.warning(f"Could not add column {column_name}: {e}")
        
        logger.info("✅ Schema auto-fix completed")
        
    except Exception as e:
        logger.warning(f"Schema auto-fix skipped: {e}")

class DatabaseService:
    """Service for database operations"""
    
    def __init__(self):
        self.db = None
        self._connect()
    
    def _connect(self):
        """Connect to database with retry logic"""
        try:
            self.db = SessionLocal()
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def _ensure_connection(self):
        """Ensure database connection is active"""
        if self.db is None:
            self._connect()
    
    def close(self):
        """Close database connection safely"""
        if self.db:
            try:
                self.db.close()
            except Exception as e:
                logger.error(f"Error closing database: {e}")
            finally:
                self.db = None
    
    def save_product(self, product_data: dict):
        """Save or update product"""
        from server_py.models import Product
        
        self._ensure_connection()
        try:
            existing = self.db.query(Product).filter(
                Product.product_id == product_data['product_id']
            ).first()
            
            if existing:
                for key, value in product_data.items():
                    setattr(existing, key, value)
                existing.last_updated = datetime.utcnow()
                product = existing
            else:
                product = Product(**product_data)
                self.db.add(product)
            
            self.db.commit()
            self.db.refresh(product)
            logger.info(f"Saved product: {product.product_id}")
            return product
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving product: {str(e)}")
            raise
    
    def save_reviews(self, reviews_data: List[dict]) -> int:
        """Save multiple reviews"""
        from server_py.models import Review
        
        self._ensure_connection()
        try:
            count = 0
            for review_data in reviews_data:
                review = Review(**review_data)
                self.db.add(review)
                count += 1
            
            self.db.commit()
            logger.info(f"Saved {count} reviews")
            return count
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving reviews: {str(e)}")
            raise
    
    def save_deal(self, deal_data: dict):
        """Save deal"""
        from server_py.models import Deal
        
        self._ensure_connection()
        try:
            deal = Deal(**deal_data)
            self.db.add(deal)
            self.db.commit()
            self.db.refresh(deal)
            logger.info(f"Saved deal: {deal.product_id}")
            return deal
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error saving deal: {str(e)}")
            raise
    
    def get_all_products(self, limit: int = 100):
        """Get all products"""
        from server_py.models import Product
        
        self._ensure_connection()
        return self.db.query(Product).limit(limit).all()
    
    def get_product_by_id(self, product_id: str):
        """Get product by ID"""
        from server_py.models import Product
        
        self._ensure_connection()
        return self.db.query(Product).filter(
            Product.product_id == product_id
        ).first()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

# Run connection test and auto-fix
if test_connection():
    auto_fix_schema()
