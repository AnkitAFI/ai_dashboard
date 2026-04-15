# server_py/init_db.py - Database Initialization Script
"""
Run this script to create all necessary database tables
Usage: python -m server_py.init_db
"""

import logging
from server_py.database_config import engine, Base
from server_py import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database tables"""
    try:
        logger.info("=" * 70)
        logger.info("🔧 INITIALIZING DATABASE TABLES")
        logger.info("=" * 70)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # List created tables
        logger.info("\n✅ Tables created successfully:")
        for table_name in Base.metadata.tables.keys():
            logger.info(f"  - {table_name}")
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ DATABASE INITIALIZATION COMPLETE")
        logger.info("=" * 70 + "\n")
        
    except Exception as e:
        logger.error(f"\n❌ Database initialization failed: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    init_database()