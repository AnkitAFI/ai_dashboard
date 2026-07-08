import os
import sys
import logging
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_foreign_keys():
    """
    Finds all foreign keys pointing to 'users_legacy' and redirects them to 'users_auth'.
    """
    logger.info("Starting Foreign Key redirection...")
    
    find_fks_sql = """
    SELECT
        tc.table_name, 
        kcu.column_name, 
        tc.constraint_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users_legacy';
    """
    
    with engine.begin() as conn:
        fks = conn.execute(text(find_fks_sql)).mappings().all()
        
        if not fks:
            logger.info("No foreign keys pointing to users_legacy found.")
            return

        for fk in fks:
            table = fk['table_name']
            column = fk['column_name']
            constraint = fk['constraint_name']
            
            logger.info(f"Fixing FK {constraint} on {table}.{column}...")
            
            # Drop the old constraint
            drop_sql = f"ALTER TABLE {table} DROP CONSTRAINT {constraint};"
            conn.execute(text(drop_sql))
            
            # Add the new constraint pointing to users_auth
            # We'll name it similarly but append _new
            new_constraint = f"{constraint}_v2"
            add_sql = f"ALTER TABLE {table} ADD CONSTRAINT {new_constraint} FOREIGN KEY ({column}) REFERENCES users_auth(id) ON DELETE CASCADE;"
            
            try:
                conn.execute(text(add_sql))
                logger.info(f"Successfully repointed {table}.{column} to users_auth(id).")
            except Exception as e:
                logger.error(f"Failed to add new constraint for {table}: {e}")

    logger.info("Finished fixing foreign keys!")

if __name__ == "__main__":
    fix_foreign_keys()
