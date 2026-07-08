import logging
import sys
from sqlalchemy import text
from app.db.session import SessionLocal
from app.core.cryptography import EncryptedString

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_behavior_logs(batch_size=500):
    logger.info("Starting cryptographic migration for User Behavior Logs...")
    
    with SessionLocal() as db:
        try:
            # 1. Fetch count of vulnerable logs (ignoring NULLs and already encrypted logs)
            count_query = text("""
                SELECT COUNT(id) FROM user_behavior_logs 
                WHERE (user_email IS NOT NULL AND user_email NOT LIKE 'v1:%') 
                   OR (ip_address IS NOT NULL AND ip_address NOT LIKE 'v1:%')
            """)
            total_vulnerable = db.execute(count_query).scalar()
            
            if total_vulnerable == 0:
                logger.info("✅ All behavior logs are already encrypted. Nothing to do!")
                return
                
            logger.info(f"Found {total_vulnerable} vulnerable plain-text logs. Beginning encryption in batches of {batch_size}...")
            
            processed = 0
            while True:
                # 2. Fetch a batch of vulnerable logs
                fetch_query = text(f"""
                    SELECT id, user_email, ip_address 
                    FROM user_behavior_logs 
                    WHERE (user_email IS NOT NULL AND user_email NOT LIKE 'v1:%') 
                       OR (ip_address IS NOT NULL AND ip_address NOT LIKE 'v1:%')
                    ORDER BY id ASC
                    LIMIT {batch_size}
                """)
                
                batch = db.execute(fetch_query).mappings().all()
                if not batch:
                    break
                    
                # 3. Process and encrypt the batch
                update_params = []
                for log in batch:
                    # Safely handle NULL values
                    encrypted_email = EncryptedString().process_bind_param(log['user_email'], None) if log['user_email'] else None
                    encrypted_ip = EncryptedString().process_bind_param(log['ip_address'], None) if log['ip_address'] else None
                    
                    update_params.append({
                        "b_id": log['id'],
                        "b_email": encrypted_email,
                        "b_ip": encrypted_ip
                    })
                
                # 4. Bulk update the database for performance
                update_query = text("""
                    UPDATE user_behavior_logs 
                    SET user_email = :b_email, ip_address = :b_ip 
                    WHERE id = :b_id
                """)
                
                db.execute(update_query, update_params)
                db.commit()
                
                processed += len(batch)
                logger.info(f"Successfully encrypted {processed} / {total_vulnerable} logs...")
                
            logger.info("✅ All historical behavior logs are now perfectly encrypted with military-grade AES-256!")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to migrate behavior logs: {e}")
            sys.exit(1)

if __name__ == "__main__":
    migrate_behavior_logs()
