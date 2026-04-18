# #!/usr/bin/env python3
# """
# DataForSEO Amazon Product Collector - CSV Version
# Works without database - saves to CSV files
# Perfect for testing India setup
# """

# import os
# import sys
# import time
# import csv
# import logging
# from datetime import datetime
# from typing import Dict, Any, List
# from pathlib import Path
# from dotenv import load_dotenv

# try:
#     from rest_client import RestClient
# except ImportError:
#     print("ERROR: rest_client.py not found!")
#     sys.exit(1)

# # Logging setup
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s",
#     handlers=[
#         logging.FileHandler("dataforseo_cron.log", encoding="utf-8"),
#         logging.StreamHandler(sys.stdout)
#     ]
# )
# logger = logging.getLogger(__name__)

# # Fix Windows console encoding
# if sys.platform == "win32":
#     try:
#         sys.stdout.reconfigure(encoding="utf-8")
#     except:
#         pass


# class Config:
#     """Configuration from environment variables"""
    
#     def __init__(self):
#         load_dotenv()
        
#         # DataForSEO API
#         self.DATAFORSEO_LOGIN = os.getenv("DATAFORSEO_LOGIN")
#         self.DATAFORSEO_PASSWORD = os.getenv("DATAFORSEO_PASSWORD")
        
#         # CRITICAL: Use location_code and language_code for India
#         self.LOCATION_CODE = int(os.getenv("LOCATION_CODE", "2356"))  # 2356 = India
#         self.LANGUAGE_CODE = os.getenv("LANGUAGE_CODE", "en_US")
        
#         # Collection settings
#         self.DEPTH = int(os.getenv("DEPTH", "100"))
#         self.WAIT_TIME = int(os.getenv("WAIT_TIME", "200"))
        
#         # Keywords
#         keywords_str = os.getenv("KEYWORDS", "laptop,smartphone,headphones")
#         self.KEYWORDS = [k.strip() for k in keywords_str.split(",")]
        
#         # Output directory
#         self.OUTPUT_DIR = os.getenv("OUTPUT_DIR", "data_output")
        
#         self.validate()
    
#     def validate(self):
#         """Validate required configuration"""
#         required = ["DATAFORSEO_LOGIN", "DATAFORSEO_PASSWORD"]
#         missing = [var for var in required if not getattr(self, var)]
#         if missing:
#             raise ValueError(f"Missing required variables: {', '.join(missing)}")
        
#         logger.info(f"[CONFIG] Location Code: {self.LOCATION_CODE} (India)")
#         logger.info(f"[CONFIG] Language Code: {self.LANGUAGE_CODE}")
#         logger.info(f"[CONFIG] Output Directory: {self.OUTPUT_DIR}")


# class CSVStorage:
#     """CSV file storage handler"""
    
#     def __init__(self, output_dir: str):
#         self.output_dir = Path(output_dir)
#         self.output_dir.mkdir(exist_ok=True)
#         logger.info(f"[CSV] Output directory: {self.output_dir.absolute()}")
    
#     def save_products(self, products: List[Dict], keyword: str):
#         """Save products to CSV file"""
#         if not products:
#             return 0
        
#         # Create filename with timestamp
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         filename = self.output_dir / f"amazon_india_{keyword}_{timestamp}.csv"
        
#         try:
#             with open(filename, 'w', newline='', encoding='utf-8') as f:
#                 fieldnames = [
#                     'task_id', 'asin', 'keyword', 'title', 'url', 'image_url',
#                     'price_from', 'price_to', 'currency', 'rating_value', 
#                     'rating_votes', 'is_best_seller', 'location_code', 
#                     'language_code', 'collected_at'
#                 ]
                
#                 writer = csv.DictWriter(f, fieldnames=fieldnames)
#                 writer.writeheader()
                
#                 for product in products:
#                     writer.writerow(product)
            
#             logger.info(f"[CSV] ✓ Saved to: {filename.name}")
#             return len(products)
            
#         except Exception as e:
#             logger.error(f"[CSV ERROR] Failed to save: {e}")
#             return 0
    
#     def save_summary(self, summary: Dict):
#         """Save collection summary"""
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         filename = self.output_dir / f"summary_{timestamp}.txt"
        
#         try:
#             with open(filename, 'w', encoding='utf-8') as f:
#                 f.write("="*70 + "\n")
#                 f.write("DataForSEO Collection Summary - India\n")
#                 f.write("="*70 + "\n\n")
                
#                 for key, value in summary.items():
#                     f.write(f"{key}: {value}\n")
            
#             logger.info(f"[CSV] ✓ Summary saved to: {filename.name}")
            
#         except Exception as e:
#             logger.error(f"[CSV ERROR] Failed to save summary: {e}")


# class DataForSEOClient:
#     """DataForSEO API client - Fixed for India"""
    
#     def __init__(self, login: str, password: str):
#         self.client = RestClient(login, password)
#         logger.info("[API] Initialized with 60s timeout")
    
#     def submit_task(self, keyword: str, location_code: int, language_code: str, depth: int):
#         """Submit task to DataForSEO"""
#         try:
#             logger.info(f"[API] Submitting task for keyword='{keyword}'")
#             logger.info(f"[API] Parameters: location_code={location_code}, language_code={language_code}, depth={depth}")
            
#             # Use location_code and language_code (NOT names)
#             post_data = [{
#                 "keyword": keyword,
#                 "location_code": location_code,
#                 "language_code": language_code,
#                 "depth": depth
#             }]
            
#             logger.debug(f"[API] Request payload: {post_data}")
            
#             response = self.client.post(
#                 "/v3/merchant/amazon/products/task_post",
#                 post_data,
#                 timeout=60
#             )
            
#             if not response:
#                 logger.error("[API] No response")
#                 return None
            
#             if response.get("status_code") != 20000:
#                 error = response.get("status_message", "Unknown error")
#                 logger.error(f"[API] Error: {error}")
#                 return None
            
#             tasks = response.get("tasks", [])
#             if not tasks:
#                 logger.error("[API] No tasks in response")
#                 return None
            
#             task = tasks[0]
#             task_id = task.get("id")
            
#             if task_id:
#                 logger.info(f"[API] ✓ Task submitted: {task_id}")
#                 logger.info(f"[API] Cost: ${task.get('cost', 0)}")
#                 return task_id
            
#             return None
            
#         except Exception as e:
#             logger.error(f"[API ERROR] {e}", exc_info=True)
#             return None
    
#     def get_results(self, task_id: str):
#         """Get task results"""
#         try:
#             logger.info(f"[API] Fetching results for {task_id}")
            
#             response = self.client.get(
#                 f"/v3/merchant/amazon/products/task_get/advanced/{task_id}",
#                 timeout=60
#             )
            
#             if not response:
#                 logger.error("[API] No response received")
#                 return None
            
#             status_code = response.get("status_code")
            
#             if status_code != 20000:
#                 logger.warning(f"[API] Request failed (status: {status_code})")
#                 return None
            
#             tasks = response.get("tasks", [])
#             if not tasks:
#                 logger.warning("[API] No tasks in response")
#                 return None
            
#             task = tasks[0]
#             task_status = task.get("status_code")
            
#             if task_status == 20000:
#                 result = task.get("result")
#                 if result:
#                     logger.info(f"[API] ✓ Results retrieved")
#                     return response
#                 else:
#                     logger.warning("[API] Task completed but no results yet")
#                     return None
#             elif task_status == 40401:
#                 logger.warning("[API] Task still processing (40401)")
#                 return None
#             elif task_status == 40602:
#                 logger.warning("[API] Task in queue (40602)")
#                 return None
#             else:
#                 status_msg = task.get("status_message", "Unknown")
#                 logger.warning(f"[API] Task status: {task_status} - {status_msg}")
#                 return None
            
#         except Exception as e:
#             logger.error(f"[API ERROR] {e}", exc_info=True)
#             return None


# class Collector:
#     """Main data collector"""
    
#     def __init__(self, config: Config):
#         self.config = config
#         self.storage = CSVStorage(config.OUTPUT_DIR)
#         self.api = DataForSEOClient(
#             config.DATAFORSEO_LOGIN,
#             config.DATAFORSEO_PASSWORD
#         )
    
#     def extract_products(self, response: Dict, task_id: str, keyword: str, 
#                         location_code: int, language_code: str):
#         """Extract products from API response"""
#         products = []
#         collected_at = datetime.now().isoformat()
        
#         for task in response.get("tasks", []):
#             for result in task.get("result", []):
#                 for item in result.get("items", []):
#                     # Get ASIN
#                     asin = item.get("data_asin") or item.get("asin")
#                     if not asin:
#                         continue
                    
#                     # Get rating safely
#                     rating = item.get("rating") or {}
#                     rating_value = None
#                     rating_votes = None
                    
#                     if isinstance(rating, dict):
#                         rating_value = rating.get("value")
#                         rating_votes = rating.get("votes_count")
                    
#                     products.append({
#                         "task_id": task_id,
#                         "asin": asin,
#                         "keyword": keyword,
#                         "title": item.get("title"),
#                         "url": item.get("url"),
#                         "image_url": item.get("image_url"),
#                         "price_from": item.get("price_from"),
#                         "price_to": item.get("price_to"),
#                         "currency": item.get("currency"),
#                         "rating_value": rating_value,
#                         "rating_votes": rating_votes,
#                         "is_best_seller": item.get("is_best_seller", False),
#                         "location_code": location_code,
#                         "language_code": language_code,
#                         "collected_at": collected_at
#                     })
        
#         return products
    
#     def collect_keyword(self, keyword: str):
#         """Collect data for one keyword"""
#         logger.info("")
#         logger.info("=" * 70)
#         logger.info(f"[COLLECT] Keyword: {keyword}")
#         logger.info("=" * 70)
        
#         # Submit task
#         task_id = self.api.submit_task(
#             keyword=keyword,
#             location_code=self.config.LOCATION_CODE,
#             language_code=self.config.LANGUAGE_CODE,
#             depth=self.config.DEPTH
#         )
        
#         if not task_id:
#             logger.error(f"[FAILED] Could not submit task for '{keyword}'")
#             return {"success": False, "keyword": keyword}
        
#         # Wait for initial processing
#         logger.info(f"[WAIT] Initial wait: {self.config.WAIT_TIME}s...")
#         time.sleep(self.config.WAIT_TIME)
        
#         # Try to get results with retries
#         max_retries = 8
#         retry_wait = 30
        
#         for attempt in range(1, max_retries + 1):
#             logger.info(f"[CHECK] Attempt {attempt}/{max_retries}...")
            
#             response = self.api.get_results(task_id)
            
#             if response:
#                 # Extract and save
#                 products = self.extract_products(
#                     response, task_id, keyword,
#                     self.config.LOCATION_CODE,
#                     self.config.LANGUAGE_CODE
#                 )
                
#                 saved = self.storage.save_products(products, keyword)
                
#                 logger.info(f"[SUCCESS] ✓ Saved {saved} products for '{keyword}'")
                
#                 return {
#                     "success": True,
#                     "keyword": keyword,
#                     "task_id": task_id,
#                     "count": saved
#                 }
            
#             if attempt < max_retries:
#                 logger.info(f"[WAITING] {retry_wait}s before retry...")
#                 time.sleep(retry_wait)
        
#         logger.error(f"[FAILED] Could not retrieve results for '{keyword}'")
#         return {"success": False, "keyword": keyword, "task_id": task_id}
    
#     def collect_all(self, keywords: List[str]):
#         """Collect data for all keywords"""
#         results = []
        
#         logger.info("")
#         logger.info("=" * 70)
#         logger.info("[START] DataForSEO Collection for INDIA")
#         logger.info(f"[INFO] Location: {self.config.LOCATION_CODE} (India)")
#         logger.info(f"[INFO] Language: {self.config.LANGUAGE_CODE}")
#         logger.info(f"[INFO] Keywords: {', '.join(keywords)}")
#         logger.info(f"[INFO] Output: {self.storage.output_dir.absolute()}")
#         logger.info("=" * 70)
        
#         start_time = time.time()
        
#         for i, keyword in enumerate(keywords, 1):
#             logger.info(f"\n[PROGRESS] Keyword {i}/{len(keywords)}")
#             result = self.collect_keyword(keyword.strip())
#             results.append(result)
        
#         elapsed = time.time() - start_time
        
#         # Summary
#         successful = sum(1 for r in results if r.get("success"))
#         total_products = sum(r.get("count", 0) for r in results)
        
#         summary = {
#             "Collection Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
#             "Location": f"{self.config.LOCATION_CODE} (India)",
#             "Language": self.config.LANGUAGE_CODE,
#             "Keywords": ", ".join(keywords),
#             "Successful": f"{successful}/{len(results)}",
#             "Total Products": total_products,
#             "Estimated Cost": f"${total_products * 0.001:.3f}",
#             "Time Taken": f"{int(elapsed // 60)}m {int(elapsed % 60)}s",
#             "Output Directory": str(self.storage.output_dir.absolute())
#         }
        
#         self.storage.save_summary(summary)
        
#         return results, summary


# def main():
#     """Main entry point"""
#     try:
#         logger.info("\n" + "="*70)
#         logger.info("DataForSEO Amazon Collector - CSV Version")
#         logger.info("No database required - saves to CSV files")
#         logger.info("="*70)
        
#         # Load config
#         config = Config()
        
#         # Create collector
#         collector = Collector(config)
        
#         # Collect data
#         results, summary = collector.collect_all(config.KEYWORDS)
        
#         # Display summary
#         logger.info("")
#         logger.info("=" * 70)
#         logger.info("[COMPLETE] Collection Finished!")
#         logger.info("=" * 70)
#         for key, value in summary.items():
#             logger.info(f"{key}: {value}")
#         logger.info("=" * 70)
        
#     except KeyboardInterrupt:
#         logger.info("\n[STOP] Stopped by user")
#         sys.exit(0)
#     except Exception as e:
#         logger.error(f"[ERROR] {e}", exc_info=True)
#         sys.exit(1)


# if __name__ == "__main__":
#     main()

# #Do not delete this above code this is working for india

#!/usr/bin/env python3
"""
DataForSEO Amazon Product Collector - Memory Optimized with Batching
====================================================================
Processes keywords in batches to prevent memory overflow in n8n
"""

import os
import sys
import time
import logging
import argparse
from datetime import datetime
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Import DataForSEO REST client
try:
    from rest_client import RestClient
except ImportError:
    print("ERROR: rest_client.py not found!")
    print("Download it from: https://github.com/dataforseo/PythonClient")
    sys.exit(1)

# ==================== LOGGING SETUP ====================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("dataforseo_cron.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except:
        pass


# ==================== CONFIGURATION ====================

class Config:
    """Configuration manager for DataForSEO collector"""
    
    LOCATION_CODES = {
        2356: "India",
        2840: "United States", 
        2826: "United Kingdom",
        2036: "Australia",
        2124: "Canada",
        2276: "Germany",
        2250: "France",
        2380: "Italy",
        2724: "Spain",
        2392: "Japan"
    }
    
    def __init__(self):
        load_dotenv()

        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.DATAFORSEO_LOGIN = os.getenv("DATAFORSEO_LOGIN")
        self.DATAFORSEO_PASSWORD = os.getenv("DATAFORSEO_PASSWORD")
        
        self.LOCATION_CODE = int(os.getenv("LOCATION_CODE", "2356"))
        self.LANGUAGE_CODE = os.getenv("LANGUAGE_CODE", "en")
        
        self.DEPTH = int(os.getenv("DEPTH", "100"))
        self.WAIT_TIME = int(os.getenv("WAIT_TIME", "200"))
        self.USE_PRIORITY_QUEUE = os.getenv("USE_PRIORITY_QUEUE", "false").lower() == "true"
        self.MAX_RETRIES = int(os.getenv("MAX_RETRIES", "8"))
        self.RETRY_INTERVAL = int(os.getenv("RETRY_INTERVAL", "30"))
        
        # BATCH PROCESSING SETTINGS (NEW)
        self.BATCH_SIZE = int(os.getenv("BATCH_SIZE", "5"))  # Process 5 keywords at a time
        self.BATCH_DELAY = int(os.getenv("BATCH_DELAY", "60"))  # Wait 60s between batches
        
        self.DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
        self.DB_MAX_RETRIES = int(os.getenv("DB_MAX_RETRIES", "3"))
        
        keywords_str = os.getenv("KEYWORDS", "laptop,smartphone,headphones")
        self.DEFAULT_KEYWORDS = [k.strip() for k in keywords_str.split(",")]

        self.validate()
        self.log_config()

    def validate(self):
        """Validate required environment variables"""
        missing = []
        
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.DATAFORSEO_LOGIN:
            missing.append("DATAFORSEO_LOGIN")
        if not self.DATAFORSEO_PASSWORD:
            missing.append("DATAFORSEO_PASSWORD")
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

    def log_config(self):
        """Log current configuration"""
        location_name = self.LOCATION_CODES.get(
            self.LOCATION_CODE, 
            f"Unknown (Code: {self.LOCATION_CODE})"
        )
        
        logger.info("=" * 70)
        logger.info("[CONFIG] DataForSEO Amazon Collector - Configuration")
        logger.info("=" * 70)
        logger.info(f"[CONFIG] Location: {location_name} (Code: {self.LOCATION_CODE})")
        logger.info(f"[CONFIG] Language: {self.LANGUAGE_CODE}")
        logger.info(f"[CONFIG] Depth: {self.DEPTH} products per keyword")
        logger.info(f"[CONFIG] Batch Size: {self.BATCH_SIZE} keywords per batch")
        logger.info(f"[CONFIG] Batch Delay: {self.BATCH_DELAY}s between batches")
        logger.info(f"[CONFIG] Queue: {'Priority ($0.002/product)' if self.USE_PRIORITY_QUEUE else 'Standard ($0.001/product)'}")
        logger.info(f"[CONFIG] Initial Wait: {self.WAIT_TIME}s")
        logger.info(f"[CONFIG] Max Retries: {self.MAX_RETRIES}")
        logger.info(f"[CONFIG] Keywords: {', '.join(self.DEFAULT_KEYWORDS)}")
        logger.info("=" * 70)


# ==================== DATABASE HANDLER ====================

class Database:
    """PostgreSQL database handler with connection pooling"""
    
    def __init__(self, database_url: str, connect_timeout: int = 10, max_retries: int = 3):
        self.database_url = database_url
        self.connect_timeout = connect_timeout
        self.max_retries = max_retries
        self.conn = None

    def connect(self):
        """Connect to database with retry logic"""
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"[DB] Connecting to database (attempt {attempt}/{self.max_retries})...")
                
                conn_url = self.database_url
                if 'connect_timeout' not in conn_url:
                    separator = '&' if '?' in conn_url else '?'
                    conn_url = f"{conn_url}{separator}connect_timeout={self.connect_timeout}"
                
                self.conn = psycopg2.connect(conn_url)
                self.conn.autocommit = False
                
                cursor = self.conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
                
                logger.info("[DB] ✓ Connection successful")
                return True
                
            except psycopg2.OperationalError as e:
                logger.error(f"[DB ERROR] Connection failed: {e}")
                if attempt < self.max_retries:
                    wait_time = attempt * 2
                    logger.info(f"[DB] Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error("[DB] ✗ All connection attempts failed")
                    return False
                    
            except Exception as e:
                logger.error(f"[DB ERROR] Unexpected error: {e}", exc_info=True)
                return False
        
        return False

    def disconnect(self):
        """Close database connection"""
        if self.conn:
            try:
                self.conn.close()
                logger.info("[DB] Connection closed")
            except Exception as e:
                logger.error(f"[DB ERROR] Error closing connection: {e}")

    def create_tables(self):
        """Create necessary database tables with migration support"""
        try:
            cursor = self.conn.cursor()
            
            # Create table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS amazon_products (
                    id SERIAL PRIMARY KEY,
                    task_id VARCHAR(100),
                    asin VARCHAR(50),
                    keyword VARCHAR(200),
                    title TEXT,
                    url TEXT,
                    image_url TEXT,
                    price_from FLOAT,
                    price_to FLOAT,
                    currency VARCHAR(10),
                    rating_value FLOAT,
                    rating_votes INTEGER,
                    is_best_seller BOOLEAN DEFAULT FALSE,
                    location_code INTEGER,
                    language_code VARCHAR(10),
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(task_id, asin)
                )
            """)
            
            # Check if location_code column exists (migration for old tables)
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='amazon_products' AND column_name='location_code'
            """)
            
            if not cursor.fetchone():
                logger.info("[DB] Migrating table: Adding location_code column...")
                cursor.execute("""
                    ALTER TABLE amazon_products 
                    ADD COLUMN location_code INTEGER
                """)
            
            # Check if language_code column exists
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='amazon_products' AND column_name='language_code'
            """)
            
            if not cursor.fetchone():
                logger.info("[DB] Migrating table: Adding language_code column...")
                cursor.execute("""
                    ALTER TABLE amazon_products 
                    ADD COLUMN language_code VARCHAR(10)
                """)
            
            # Create indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_amazon_products_keyword 
                ON amazon_products(keyword)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_amazon_products_asin 
                ON amazon_products(asin)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_amazon_products_created_at 
                ON amazon_products(created_at DESC)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_amazon_products_location 
                ON amazon_products(location_code)
            """)
            
            self.conn.commit()
            logger.info("[DB] ✓ Tables and indexes verified")
            
        except Exception as e:
            logger.error(f"[DB ERROR] Failed to create tables: {e}")
            self.conn.rollback()
            raise

    def save_products(self, products: List[Dict]) -> int:
        """Save products to database in batches"""
        if not products:
            logger.warning("[DB] No products to save")
            return 0
        
        cursor = self.conn.cursor()
        
        try:
            # Save in smaller chunks to avoid memory issues
            chunk_size = 100
            total_saved = 0
            
            for i in range(0, len(products), chunk_size):
                chunk = products[i:i+chunk_size]
                
                execute_values(cursor, """
                    INSERT INTO amazon_products 
                    (task_id, asin, keyword, title, url, image_url, price_from, price_to, 
                     currency, rating_value, rating_votes, is_best_seller, location_code, 
                     language_code)
                    VALUES %s 
                    ON CONFLICT (task_id, asin) DO NOTHING
                """, [
                    (
                        p.get("task_id"),
                        p.get("asin"),
                        p.get("keyword"),
                        p.get("title"),
                        p.get("url"),
                        p.get("image_url"),
                        p.get("price_from"),
                        p.get("price_to"),
                        p.get("currency"),
                        p.get("rating_value"),
                        p.get("rating_votes"),
                        p.get("is_best_seller", False),
                        p.get("location_code"),
                        p.get("language_code")
                    )
                    for p in chunk
                ])
                
                total_saved += len(chunk)
                logger.debug(f"[DB] Saved chunk {i//chunk_size + 1}: {len(chunk)} products")
            
            self.conn.commit()
            logger.info(f"[DB] ✓ Saved {total_saved} products total")
            return total_saved
            
        except Exception as e:
            logger.error(f"[DB ERROR] Failed to save products: {e}", exc_info=True)
            self.conn.rollback()
            return 0


# ==================== DATAFORSEO API CLIENT ====================

class DataForSEOClient:
    """DataForSEO API client"""
    
    def __init__(self, login: str, password: str):
        self.client = RestClient(login, password)
        logger.info("[API] Client initialized")

    def submit_task(self, keyword: str, location_code: int, language_code: str, 
                   depth: int = 100, priority: bool = False) -> Optional[str]:
        """Submit a task to DataForSEO API"""
        try:
            if priority:
                endpoint = "/v3/merchant/amazon/products/priority/task_post"
            else:
                endpoint = "/v3/merchant/amazon/products/task_post"
            
            post_data = [{
                "keyword": keyword,
                "location_code": location_code,
                "language_code": language_code,
                "depth": depth
            }]
            
            logger.info(f"[API] Submitting task for '{keyword}'")
            
            response = self.client.post(endpoint, post_data)
            
            if not response or response.get("status_code") != 20000:
                logger.error(f"[API] Error: {response.get('status_message', 'Unknown error')}")
                return None
            
            tasks = response.get("tasks", [])
            if not tasks:
                return None
            
            task_id = tasks[0].get("id")
            if task_id:
                logger.info(f"[API] ✓ Task submitted: {task_id}")
            
            return task_id
            
        except Exception as e:
            logger.error(f"[API ERROR] {e}", exc_info=True)
            return None

    def get_results(self, task_id: str) -> Optional[Dict]:
        """Get results for a submitted task"""
        try:
            response = self.client.get(
                f"/v3/merchant/amazon/products/task_get/advanced/{task_id}"
            )
            
            if not response or response.get("status_code") != 20000:
                return None
            
            tasks = response.get("tasks", [])
            if not tasks:
                return None
            
            task = tasks[0]
            task_status = task.get("status_code")
            
            if task_status == 20000:
                result = task.get("result")
                if result:
                    logger.info(f"[API] ✓ Results retrieved for {task_id}")
                    return response
            
            return None
            
        except Exception as e:
            logger.error(f"[API ERROR] {e}", exc_info=True)
            return None


# ==================== DATA COLLECTOR ====================

class AmazonDataCollector:
    """Main collector class with batch processing"""
    
    def __init__(self, config: Config):
        self.config = config
        self.db = Database(
            config.DATABASE_URL,
            config.DB_CONNECT_TIMEOUT,
            config.DB_MAX_RETRIES
        )
        self.api = DataForSEOClient(
            config.DATAFORSEO_LOGIN,
            config.DATAFORSEO_PASSWORD
        )

    def extract_products(self, response: Dict, task_id: str, keyword: str, 
                        location_code: int, language_code: str) -> List[Dict]:
        """Extract products from API response"""
        products = []
        
        for task in response.get("tasks", []):
            for result in task.get("result", []):
                for item in result.get("items", []):
                    asin = item.get("data_asin") or item.get("asin")
                    if not asin:
                        continue
                    
                    rating = item.get("rating") or {}
                    rating_value = None
                    rating_votes = None
                    
                    if isinstance(rating, dict):
                        rating_value = rating.get("value")
                        rating_votes = rating.get("votes_count")
                    
                    products.append({
                        "task_id": task_id,
                        "asin": asin,
                        "keyword": keyword,
                        "title": item.get("title"),
                        "url": item.get("url"),
                        "image_url": item.get("image_url"),
                        "price_from": item.get("price_from"),
                        "price_to": item.get("price_to"),
                        "currency": item.get("currency"),
                        "rating_value": rating_value,
                        "rating_votes": rating_votes,
                        "is_best_seller": item.get("is_best_seller", False),
                        "location_code": location_code,
                        "language_code": language_code
                    })
        
        logger.info(f"[EXTRACT] Found {len(products)} products")
        return products

    def collect_keyword(self, keyword: str) -> Dict[str, Any]:
        """Collect data for a single keyword"""
        logger.info(f"[COLLECT] Processing: {keyword}")
        
        task_id = self.api.submit_task(
            keyword=keyword,
            location_code=self.config.LOCATION_CODE,
            language_code=self.config.LANGUAGE_CODE,
            depth=self.config.DEPTH,
            priority=self.config.USE_PRIORITY_QUEUE
        )
        
        if not task_id:
            logger.error(f"[FAILED] Could not submit task for '{keyword}'")
            return {"success": False, "keyword": keyword}
        
        logger.info(f"[WAIT] Waiting {self.config.WAIT_TIME}s...")
        time.sleep(self.config.WAIT_TIME)
        
        for attempt in range(1, self.config.MAX_RETRIES + 1):
            logger.info(f"[CHECK] Attempt {attempt}/{self.config.MAX_RETRIES}...")
            
            response = self.api.get_results(task_id)
            
            if response:
                products = self.extract_products(
                    response, task_id, keyword,
                    self.config.LOCATION_CODE,
                    self.config.LANGUAGE_CODE
                )
                
                saved = self.db.save_products(products)
                
                logger.info(f"[SUCCESS] ✓ Saved {saved} products for '{keyword}'")
                
                # Clear memory
                del products
                del response
                
                return {
                    "success": True,
                    "keyword": keyword,
                    "task_id": task_id,
                    "count": saved
                }
            
            if attempt < self.config.MAX_RETRIES:
                logger.info(f"[WAITING] {self.config.RETRY_INTERVAL}s before retry...")
                time.sleep(self.config.RETRY_INTERVAL)
        
        logger.error(f"[FAILED] Could not retrieve results for '{keyword}'")
        return {"success": False, "keyword": keyword, "task_id": task_id}

    def collect_batch(self, keywords: List[str], batch_num: int, total_batches: int) -> List[Dict[str, Any]]:
        """Collect data for a batch of keywords"""
        logger.info("")
        logger.info("=" * 70)
        logger.info(f"[BATCH {batch_num}/{total_batches}] Processing {len(keywords)} keywords")
        logger.info("=" * 70)
        
        results = []
        for i, keyword in enumerate(keywords, 1):
            logger.info(f"\n[BATCH {batch_num}] Keyword {i}/{len(keywords)}")
            result = self.collect_keyword(keyword.strip())
            results.append(result)
        
        return results

    def collect_all(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Collect data for all keywords using batch processing"""
        all_results = []
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("[START] Starting Batch Collection")
        logger.info("=" * 70)
        
        # Split keywords into batches
        batch_size = self.config.BATCH_SIZE
        total_keywords = len(keywords)
        total_batches = (total_keywords + batch_size - 1) // batch_size
        
        logger.info(f"[INFO] Total keywords: {total_keywords}")
        logger.info(f"[INFO] Batch size: {batch_size}")
        logger.info(f"[INFO] Total batches: {total_batches}")
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, total_keywords)
            batch_keywords = keywords[start_idx:end_idx]
            
            batch_results = self.collect_batch(batch_keywords, batch_num + 1, total_batches)
            all_results.extend(batch_results)
            
            # Wait between batches (except for last batch)
            if batch_num < total_batches - 1:
                logger.info(f"\n[DELAY] Waiting {self.config.BATCH_DELAY}s before next batch...")
                time.sleep(self.config.BATCH_DELAY)
        
        return all_results


# ==================== MAIN ENTRY POINT ====================

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="DataForSEO Amazon Product Collector")
    parser.add_argument("--run-once", action="store_true", help="Run once and exit")
    args = parser.parse_args()

    try:
        logger.info("\n" + "="*70)
        logger.info("DataForSEO Amazon Collector - Batch Processing Version")
        logger.info("="*70)
        
        config = Config()
        collector = AmazonDataCollector(config)
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("[DATABASE] Connecting...")
        logger.info("=" * 70)
        
        if not collector.db.connect():
            logger.error("[EXIT] Database connection failed")
            sys.exit(1)
        
        collector.db.create_tables()
        
        start_time = time.time()
        results = collector.collect_all(config.DEFAULT_KEYWORDS)
        elapsed = time.time() - start_time
        
        collector.db.disconnect()
        
        successful = sum(1 for r in results if r.get("success"))
        total_products = sum(r.get("count", 0) for r in results)
        cost_per_product = 0.002 if config.USE_PRIORITY_QUEUE else 0.001
        estimated_cost = total_products * cost_per_product
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("[COMPLETE] Collection Finished!")
        logger.info("=" * 70)
        logger.info(f"Collection Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Location: {Config.LOCATION_CODES.get(config.LOCATION_CODE, config.LOCATION_CODE)}")
        logger.info(f"Successful: {successful}/{len(results)}")
        logger.info(f"Total Products: {total_products}")
        logger.info(f"Estimated Cost: ${estimated_cost:.3f}")
        logger.info(f"Time Taken: {int(elapsed // 60)}m {int(elapsed % 60)}s")
        logger.info("=" * 70)
        
    except KeyboardInterrupt:
        logger.info("\n[STOP] Stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"[ERROR] {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()