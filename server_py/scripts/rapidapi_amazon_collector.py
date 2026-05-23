 
# #!/usr/bin/env python3
# """
# RapidAPI Amazon Data Collector with FIXED Analytics
# Now calculates realistic price ranges and sales predictions
# """
 
# import os
# import sys
# import time
# import json
# import csv
# import logging
# import re
# from datetime import datetime
# from typing import Dict, List, Optional, Tuple
# from dotenv import load_dotenv
 
# try:
#     import psycopg2
#     from psycopg2.extras import execute_values, Json
#     DB_AVAILABLE = True
# except Exception:
#     DB_AVAILABLE = False
 
# # Import your RapidAPI client
# try:
#     from rest_client import RapidAPIClient
# except Exception:
#     import http.client
#     class RapidAPIClient:
#         def __init__(self, api_key: str, host: str):
#             self.api_key = api_key
#             self.host = host
#             self.headers = {'x-rapidapi-key': api_key, 'x-rapidapi-host': host}
#         def _make_request(self, endpoint: str, method: str = "GET") -> Optional[Dict]:
#             try:
#                 conn = http.client.HTTPSConnection(self.host, timeout=30)
#                 conn.request(method, endpoint, headers=self.headers)
#                 resp = conn.getresponse()
#                 data = resp.read()
#                 if resp.status == 200:
#                     return json.loads(data.decode("utf-8"))
#                 else:
#                     logging.error(f"RapidAPI HTTP {resp.status}: {data[:500]}")
#                     return None
#             except Exception as e:
#                 logging.error(f"RapidAPI error: {e}")
#                 return None
#             finally:
#                 try:
#                     conn.close()
#                 except:
#                     pass
#         def get_products_by_category(self, category_id: str, page: int = 1, country: str = "IN",
#                                      sort_by: str = "RELEVANCE", product_condition: str = "ALL",
#                                      is_prime: str = "false", deals_and_discounts: str = "NONE"):
#             endpoint = (f"/products-by-category?category_id={category_id}&page={page}"
#                         f"&country={country}&sort_by={sort_by}&product_condition={product_condition}"
#                         f"&is_prime={is_prime}&deals_and_discounts={deals_and_discounts}")
#             return self._make_request(endpoint, method="GET")
 
# logging.basicConfig(level=logging.INFO,
#                     format="%(asctime)s - %(levelname)s - %(message)s",
#                     handlers=[
#                         logging.FileHandler("rapidapi_amazon.log", encoding="utf-8"),
#                         logging.StreamHandler(sys.stdout)
#                     ])
# logger = logging.getLogger(__name__)
 
 
# class ProductAnalytics:
#     """FIXED: Calculate intelligent product analytics"""
   
#     @staticmethod
#     def parse_sales_volume(sales_text: str) -> Optional[float]:
#         """Parse sales volume - FIXED multiplier logic"""
#         if not sales_text:
#             return None
#         try:
#             text = str(sales_text).upper()
#             match = re.search(r'(\d+\.?\d*)', text)
#             if not match:
#                 return None
#             number = float(match.group(1))
#             # FIXED: Check M before K to prevent wrong multiplication
#             if 'M' in text:
#                 number *= 1_000_000
#             elif 'K' in text:
#                 number *= 1_000
#             return number
#         except:
#             return None
   
#     @staticmethod
#     def calculate_price_range(current_price: Optional[float],
#                             original_price: Optional[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
#         """Calculate realistic price range"""
#         if not current_price:
#             return None, None, None
       
#         current = float(current_price)
#         original = float(original_price) if original_price else None
#         discount_margin = 0.15  # 15% typical variance
       
#         if original and original > current:
#             # Discounted product
#             avg_price = (current + original) / 2
#             min_price = max(current * (1 - discount_margin), 1.0)
#             max_price = original
#         else:
#             # No discount info
#             avg_price = current
#             min_price = max(current * (1 - discount_margin), 1.0)
#             max_price = current * (1 + discount_margin)
       
#         return (round(avg_price, 2), round(min_price, 2), round(max_price, 2))
   
#     @staticmethod
#     def estimate_sales_range(current_sales: Optional[float],
#                            is_best_seller: bool = False,
#                            is_prime: bool = False) -> Tuple[Optional[float], Optional[float], Optional[float]]:
#         """Estimate sales range based on product attributes"""
#         if not current_sales:
#             return None, None, None
       
#         sales = float(current_sales)
       
#         # Variance based on product type
#         if is_best_seller:
#             variance = 0.50  # Bestsellers have volatile sales
#         elif is_prime:
#             variance = 0.30  # Prime products are stable
#         else:
#             variance = 0.20  # Regular products
       
#         avg_sales = sales
#         min_sales = sales * (1 - variance)
#         max_sales = sales * (1 + variance)
       
#         return (round(avg_sales, 2), round(min_sales, 2), round(max_sales, 2))
 
 
# class Config:
#     def __init__(self):
#         load_dotenv()
#         self.DATABASE_URL = os.getenv("DATABASE_URL")
#         self.RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
#         self.RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
#         self.COUNTRY = os.getenv("COUNTRY", "IN")
#         self.SORT_BY = os.getenv("SORT_BY", "RELEVANCE")
#         self.PRODUCT_CONDITION = os.getenv("PRODUCT_CONDITION", "ALL")
#         self.IS_PRIME = os.getenv("IS_PRIME", "false")
#         self.DEALS_AND_DISCOUNTS = os.getenv("DEALS_AND_DISCOUNTS", "NONE")
#         self.MAX_PAGES = int(os.getenv("MAX_PAGES", "5"))
#         self.OUTPUT_DIR = os.getenv("OUTPUT_DIR", "data_output")
#         self.DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
#         self.DB_MAX_RETRIES = int(os.getenv("DB_MAX_RETRIES", "3"))
#         self.CATEGORIES = self._load_categories()
#         if not self.RAPIDAPI_KEY:
#             raise ValueError("Missing RAPIDAPI_KEY")
#         logger.info("[CONFIG] ✓ Loaded")
 
#     def _load_categories(self):
#         categories_env = os.getenv("CATEGORIES")
#         if categories_env:
#             categories = {}
#             for cat in categories_env.split(","):
#                 if ":" in cat:
#                     cat_id, cat_name = cat.split(":", 1)
#                     categories[cat_id.strip()] = cat_name.strip()
#             return categories
#         return {
#             "1350380031": "Baby Products",
#             "976419031": "Electronics",
#             "976392031": "Computers & Accessories",
#             "1389401031": "Cell Phones",
#             "1350387031": "Toys & Games",
#             "1350384031": "Health & Personal Care"
#         }
 
 
# class Database:
#     def __init__(self, url: str, timeout: int = 10, max_retries: int = 3):
#         self.url = url
#         self.timeout = timeout
#         self.max_retries = max_retries
#         self.conn = None
#         self.available = False
 
#     def connect(self) -> bool:
#         if not self.url or not DB_AVAILABLE:
#             logger.warning("[DB] Not available")
#             return False
#         for attempt in range(1, self.max_retries + 1):
#             try:
#                 logger.info(f"[DB] Connecting ({attempt}/{self.max_retries})...")
#                 self.conn = psycopg2.connect(self.url, connect_timeout=self.timeout)
#                 self.conn.autocommit = False
#                 self.available = True
#                 logger.info("[DB] ✓ Connected")
#                 return True
#             except Exception as e:
#                 logger.error(f"[DB] Error: {e}")
#                 if attempt < self.max_retries:
#                     time.sleep(attempt * 2)
#         return False
 
#     def disconnect(self):
#         if self.conn:
#             try:
#                 self.conn.close()
#             except:
#                 pass
#             self.conn = None
#             self.available = False
#             logger.info("[DB] Disconnected")
 
#     def create_tables(self) -> bool:
#         if not self.available:
#             return False
       
#         create_sql = """
#         CREATE TABLE IF NOT EXISTS rapidapi_amazon_products (
#             id SERIAL PRIMARY KEY,
#             asin VARCHAR(50) NOT NULL,
#             category_id VARCHAR(50),
#             category_name VARCHAR(200),
#             product_title TEXT,
#             product_url TEXT,
#             product_photo TEXT,
#             product_price TEXT,
#             product_price_numeric DECIMAL(10,2),
#             product_original_price TEXT,
#             product_original_price_numeric DECIMAL(10,2),
#             product_star_rating TEXT,
#             product_star_rating_numeric DECIMAL(3,2),
#             product_num_ratings INTEGER,
#             is_best_seller BOOLEAN DEFAULT FALSE,
#             is_amazon_choice BOOLEAN DEFAULT FALSE,
#             is_prime BOOLEAN DEFAULT FALSE,
#             sales_volume TEXT,
#             country VARCHAR(10),
#             raw_data JSONB,
           
#             -- Analytics columns
#             avg_price DECIMAL(10,2),
#             min_price DECIMAL(10,2),
#             max_price DECIMAL(10,2),
#             avg_sales_volume DECIMAL(15,2),
#             min_sales_volume DECIMAL(15,2),
#             max_sales_volume DECIMAL(15,2),
           
#             created_at TIMESTAMPTZ DEFAULT now(),
#             updated_at TIMESTAMPTZ DEFAULT now(),
#             UNIQUE (asin, category_id, country)
#         );
       
#         CREATE INDEX IF NOT EXISTS idx_rapidapi_asin ON rapidapi_amazon_products(asin);
#         CREATE INDEX IF NOT EXISTS idx_rapidapi_category ON rapidapi_amazon_products(category_id);
#         """
       
#         alter_sql = """
#         DO $$
#         BEGIN
#             ALTER TABLE rapidapi_amazon_products
#             ADD COLUMN IF NOT EXISTS min_sales_volume DECIMAL(15,2),
#             ADD COLUMN IF NOT EXISTS max_sales_volume DECIMAL(15,2);
#         END $$;
#         """
       
#         try:
#             with self.conn.cursor() as cur:
#                 cur.execute(create_sql)
#                 cur.execute(alter_sql)
#             self.conn.commit()
#             logger.info("[DB] ✓ Tables ready")
#             return True
#         except Exception as e:
#             logger.error(f"[DB] Table error: {e}")
#             if self.conn:
#                 self.conn.rollback()
#             return False
 
#     def save_products(self, products: List[Dict]) -> int:
#         """Save products with FIXED analytics"""
#         if not self.available or not products:
#             return 0
 
#         tuples = []
#         for p in products:
#             try:
#                 # FIXED: Calculate analytics properly
#                 current_price = p.get("product_price_numeric")
#                 original_price = p.get("product_original_price_numeric")
               
#                 # Price analytics
#                 avg_price, min_price, max_price = ProductAnalytics.calculate_price_range(
#                     current_price, original_price
#                 )
               
#                 # Sales analytics - FIXED parsing
#                 current_sales = ProductAnalytics.parse_sales_volume(p.get("sales_volume"))
#                 avg_sales, min_sales, max_sales = ProductAnalytics.estimate_sales_range(
#                     current_sales,
#                     p.get("is_best_seller", False),
#                     p.get("is_prime", False)
#                 )
               
#                 tuples.append((
#                     p.get("asin"),
#                     p.get("category_id"),
#                     p.get("category_name"),
#                     p.get("product_title"),
#                     p.get("product_url"),
#                     p.get("product_photo"),
#                     p.get("product_price"),
#                     p.get("product_price_numeric"),
#                     p.get("product_original_price"),
#                     p.get("product_original_price_numeric"),
#                     p.get("product_star_rating"),
#                     p.get("product_star_rating_numeric"),
#                     int(p.get("product_num_ratings")) if p.get("product_num_ratings") not in (None, "") else None,
#                     bool(p.get("is_best_seller", False)),
#                     bool(p.get("is_amazon_choice", False)),
#                     bool(p.get("is_prime", False)),
#                     p.get("sales_volume"),
#                     p.get("country"),
#                     Json(p.get("raw_data", {})),
#                     avg_price, min_price, max_price,
#                     avg_sales, min_sales, max_sales
#                 ))
#             except Exception as e:
#                 logger.debug(f"[DB] Skip product {p.get('asin')}: {e}")
#                 continue
 
#         if not tuples:
#             return 0
 
#         insert_sql = """
#         INSERT INTO rapidapi_amazon_products (
#             asin, category_id, category_name, product_title, product_url,
#             product_photo, product_price, product_price_numeric,
#             product_original_price, product_original_price_numeric,
#             product_star_rating, product_star_rating_numeric,
#             product_num_ratings, is_best_seller, is_amazon_choice,
#             is_prime, sales_volume, country, raw_data,
#             avg_price, min_price, max_price,
#             avg_sales_volume, min_sales_volume, max_sales_volume
#         )
#         VALUES %s
#         ON CONFLICT (asin, category_id, country) DO UPDATE
#         SET
#             product_price = EXCLUDED.product_price,
#             product_price_numeric = EXCLUDED.product_price_numeric,
#             avg_price = EXCLUDED.avg_price,
#             min_price = EXCLUDED.min_price,
#             max_price = EXCLUDED.max_price,
#             avg_sales_volume = EXCLUDED.avg_sales_volume,
#             min_sales_volume = EXCLUDED.min_sales_volume,
#             max_sales_volume = EXCLUDED.max_sales_volume,
#             updated_at = now()
#         ;
#         """
#         try:
#             with self.conn.cursor() as cur:
#                 execute_values(cur, insert_sql, tuples, page_size=100)
#             self.conn.commit()
#             logger.info(f"[DB] ✓ Saved {len(tuples)} products with analytics")
#             return len(tuples)
#         except Exception as e:
#             logger.error(f"[DB] Save error: {e}")
#             if self.conn:
#                 self.conn.rollback()
#             return 0
 
#     def get_stats(self):
#         if not self.available:
#             return None
#         try:
#             with self.conn.cursor() as cur:
#                 cur.execute("""
#                     SELECT COUNT(*) as total,
#                            COUNT(DISTINCT asin) as unique_asins,
#                            COUNT(DISTINCT category_id) as categories,
#                            AVG(avg_price) as overall_avg_price,
#                            AVG(avg_sales_volume) as overall_avg_sales
#                     FROM rapidapi_amazon_products
#                     WHERE country = %s
#                 """, ('IN',))
#                 r = cur.fetchone()
#             return {
#                 "total": r[0],
#                 "unique_asins": r[1],
#                 "categories": r[2],
#                 "avg_price": float(r[3]) if r[3] else None,
#                 "avg_sales": float(r[4]) if r[4] else None
#             }
#         except:
#             return None
 
 
# class AmazonDataCollector:
#     def __init__(self, config: Config):
#         self.config = config
#         self.api = RapidAPIClient(config.RAPIDAPI_KEY, config.RAPIDAPI_HOST)
#         self.db = Database(config.DATABASE_URL, config.DB_CONNECT_TIMEOUT, config.DB_MAX_RETRIES)
 
#     def _parse_price(self, price_str) -> Optional[float]:
#         if not price_str:
#             return None
#         try:
#             return float(re.sub(r'[^\d.]', '', str(price_str)))
#         except:
#             return None
 
#     def _parse_rating(self, rating_str) -> Optional[float]:
#         if not rating_str:
#             return None
#         try:
#             match = re.search(r'(\d+(\.\d+)?)', str(rating_str))
#             return float(match.group(1)) if match else None
#         except:
#             return None
 
#     def extract_products(self, response: Dict, category_id: str, category_name: str) -> List[Dict]:
#         products = []
#         if not response or response.get("status") != "OK":
#             return products
       
#         for item in response.get("data", {}).get("products", []):
#             if not item.get("asin"):
#                 continue
#             products.append({
#                 "asin": item.get("asin"),
#                 "category_id": category_id,
#                 "category_name": category_name,
#                 "product_title": item.get("product_title"),
#                 "product_url": item.get("product_url"),
#                 "product_photo": item.get("product_photo"),
#                 "product_price": item.get("product_price"),
#                 "product_price_numeric": self._parse_price(item.get("product_price")),
#                 "product_original_price": item.get("product_original_price"),
#                 "product_original_price_numeric": self._parse_price(item.get("product_original_price")),
#                 "product_star_rating": item.get("product_star_rating"),
#                 "product_star_rating_numeric": self._parse_rating(item.get("product_star_rating")),
#                 "product_num_ratings": item.get("product_num_ratings", 0),
#                 "is_best_seller": item.get("is_best_seller", False),
#                 "is_amazon_choice": item.get("is_amazon_choice", False),
#                 "is_prime": item.get("is_prime", False),
#                 "sales_volume": item.get("sales_volume"),
#                 "country": self.config.COUNTRY,
#                 "raw_data": item
#             })
#         return products
 
#     def collect_category(self, category_id: str, category_name: str):
#         logger.info(f"\n{'='*70}\n[COLLECT] {category_name}")
#         total = 0
#         for page in range(1, self.config.MAX_PAGES + 1):
#             logger.info(f"[PAGE] {page}/{self.config.MAX_PAGES}...")
#             response = self.api.get_products_by_category(
#                 category_id=category_id, page=page, country=self.config.COUNTRY
#             )
#             if not response:
#                 break
#             products = self.extract_products(response, category_id, category_name)
#             if not products:
#                 break
#             saved = self.db.save_products(products)
#             total += saved
#             if saved > 0:
#                 logger.info(f"[SAVED] ✓ {saved} products")
#             if page < self.config.MAX_PAGES:
#                 time.sleep(2)
#         logger.info(f"[RESULT] {total} products saved")
#         return {"success": total > 0, "count": total}
 
#     def collect_all(self):
#         results = []
#         logger.info("[START] Collection starting")
#         if self.db.connect() and self.db.create_tables():
#             logger.info("[MODE] Using DATABASE")
#         else:
#             logger.error("[FATAL] Database required")
#             return results
 
#         for i, (cat_id, cat_name) in enumerate(self.config.CATEGORIES.items(), 1):
#             logger.info(f"\n[PROGRESS] Category {i}/{len(self.config.CATEGORIES)}")
#             res = self.collect_category(cat_id, cat_name)
#             results.append(res)
#             if i < len(self.config.CATEGORIES):
#                 time.sleep(3)
#         return results
 
 
# def main():
#     try:
#         cfg = Config()
#         collector = AmazonDataCollector(cfg)
#         results = collector.collect_all()
 
#         stats = collector.db.get_stats()
#         if stats:
#             logger.info(f"\n[STATS] Products: {stats['total']}, ASINs: {stats['unique_asins']}")
#             if stats.get('avg_price'):
#                 logger.info(f"[ANALYTICS] Avg Price: ₹{stats['avg_price']:.2f}")
#             if stats.get('avg_sales'):
#                 logger.info(f"[ANALYTICS] Avg Sales: {stats['avg_sales']:,.0f}")
 
#         total = sum(r.get("count", 0) for r in results)
#         logger.info(f"[COMPLETE] {total} products collected")
 
#     except KeyboardInterrupt:
#         logger.info("\n[STOP] Interrupted")
#     except Exception as e:
#         logger.error(f"[ERROR] {e}", exc_info=True)
#     finally:
#         try:
#             collector.db.disconnect()
#         except:
#             pass
 
 
# if __name__ == "__main__":
#     main()
 
import os
import sys
import time
import json
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
 
try:
    import psycopg2
    from psycopg2.extras import execute_values, Json
    DB_AVAILABLE = True
except Exception:
    DB_AVAILABLE = False
 
try:
    import http.client
   
    class RapidAPIClient:
        def __init__(self, api_key: str, host: str):
            self.api_key = api_key
            self.host = host
            self.headers = {'x-rapidapi-key': api_key, 'x-rapidapi-host': host}
       
        def _make_request(self, endpoint: str, method: str = "GET") -> Optional[Dict]:
            try:
                conn = http.client.HTTPSConnection(self.host, timeout=30)
                conn.request(method, endpoint, headers=self.headers)
                resp = conn.getresponse()
                data = resp.read()
                if resp.status == 200:
                    return json.loads(data.decode("utf-8"))
                else:
                    logging.error(f"RapidAPI HTTP {resp.status}: {data[:500]}")
                    return None
            except Exception as e:
                logging.error(f"RapidAPI error: {e}")
                return None
            finally:
                try:
                    conn.close()
                except:
                    pass
       
        # Amazon methods
        def get_amazon_products_by_category(self, category_id: str, page: int = 1, country: str = "IN",
                                           sort_by: str = "RELEVANCE", product_condition: str = "ALL",
                                           is_prime: str = "false", deals_and_discounts: str = "NONE"):
            endpoint = (f"/products-by-category?category_id={category_id}&page={page}"
                       f"&country={country}&sort_by={sort_by}&product_condition={product_condition}"
                       f"&is_prime={is_prime}&deals_and_discounts={deals_and_discounts}")
            return self._make_request(endpoint, method="GET")
       
        # Flipkart methods
        def get_flipkart_products_by_category(self, category_id: str, page: int = 1, sort_by: str = "POPULARITY"):
            """Fetch Flipkart products by category ID (BASIC plan compatible)"""
            from urllib.parse import quote
            # URL encode the category ID (handles commas and special chars)
            encoded_cat = quote(category_id, safe='')
            endpoint = f"/products-by-category?categoryId={encoded_cat}&page={page}&sortBy={sort_by}"
            return self._make_request(endpoint, method="GET")
       
        def get_flipkart_subcategories(self, category_id: str):
            """Fetch Flipkart subcategories to discover more category IDs"""
            endpoint = f"/sub-categories?categoryId={category_id}"
            return self._make_request(endpoint, method="GET")
       
        def get_flipkart_product_details(self, pid: str, pincode: str = "400001"):
            """Fetch single Flipkart product details (optional - for enrichment)"""
            endpoint = f"/product-details?pid={pid}&pincode={pincode}"
            return self._make_request(endpoint, method="GET")
       
except Exception as e:
    logging.error(f"Failed to load API client: {e}")
 
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(levelname)s - %(message)s",
                    handlers=[
                        logging.FileHandler("multi_platform_collector.log", encoding="utf-8"),
                        logging.StreamHandler(sys.stdout)
                    ])
logger = logging.getLogger(__name__)
 
 
class ProductAnalytics:
    """Calculate intelligent product analytics"""
   
    @staticmethod
    def parse_sales_volume(sales_text: str) -> Optional[float]:
        """Parse sales volume - FIXED multiplier logic"""
        if not sales_text:
            return None
        try:
            text = str(sales_text).upper()
            match = re.search(r'(\d+\.?\d*)', text)
            if not match:
                return None
            number = float(match.group(1))
            if 'M' in text:
                number *= 1_000_000
            elif 'K' in text:
                number *= 1_000
            return number
        except:
            return None
   
    @staticmethod
    def calculate_price_range(current_price: Optional[float],
                            original_price: Optional[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """Calculate realistic price range"""
        if not current_price:
            return None, None, None
       
        current = float(current_price)
        original = float(original_price) if original_price else None
        discount_margin = 0.15
       
        if original and original > current:
            avg_price = (current + original) / 2
            min_price = max(current * (1 - discount_margin), 1.0)
            max_price = original
        else:
            avg_price = current
            min_price = max(current * (1 - discount_margin), 1.0)
            max_price = current * (1 + discount_margin)
       
        return (round(avg_price, 2), round(min_price, 2), round(max_price, 2))
   
    @staticmethod
    def estimate_sales_range(current_sales: Optional[float],
                           is_best_seller: bool = False,
                           is_prime: bool = False) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """Estimate sales range based on product attributes"""
        if not current_sales:
            return None, None, None
       
        sales = float(current_sales)
       
        if is_best_seller:
            variance = 0.50
        elif is_prime:
            variance = 0.30
        else:
            variance = 0.20
       
        avg_sales = sales
        min_sales = sales * (1 - variance)
        max_sales = sales * (1 + variance)
       
        return (round(avg_sales, 2), round(min_sales, 2), round(max_sales, 2))
   
    @staticmethod
    def estimate_flipkart_sales(rating_count: Optional[int],
                               review_count: Optional[int],
                               star_rating: Optional[float],
                               price: Optional[float]) -> Optional[float]:
        """
        Estimate Flipkart sales using industry-standard conversion metrics
       
        Industry benchmarks:
        - Review Rate: 1-5% of buyers leave reviews
        - Rating Rate: 10-20% of buyers leave ratings
        - Conversion multiplier varies by price range and rating quality
        """
        if not rating_count and not review_count:
            return None
       
        # Base conversion rates (conservative estimates)
        RATING_TO_SALES_RATE = 0.15  # 15% of buyers rate (industry avg: 10-20%)
        REVIEW_TO_SALES_RATE = 0.03  # 3% of buyers review (industry avg: 1-5%)
       
        estimated_sales = 0
       
        # Method 1: Estimate from rating count (more reliable)
        if rating_count:
            base_from_ratings = rating_count / RATING_TO_SALES_RATE
           
            # Adjustment factor based on product rating quality
            rating_multiplier = 1.0
            if star_rating:
                if star_rating >= 4.5:
                    rating_multiplier = 1.3  # High-rated products sell more
                elif star_rating >= 4.0:
                    rating_multiplier = 1.15
                elif star_rating >= 3.5:
                    rating_multiplier = 1.0
                elif star_rating >= 3.0:
                    rating_multiplier = 0.85
                else:
                    rating_multiplier = 0.6  # Low-rated products sell less
           
            estimated_sales = base_from_ratings * rating_multiplier
       
        # Method 2: Cross-validate with review count if available
        if review_count and review_count > 0:
            base_from_reviews = review_count / REVIEW_TO_SALES_RATE
           
            # If both metrics available, use weighted average
            if estimated_sales > 0:
                # Ratings are generally more reliable (70% weight)
                estimated_sales = (estimated_sales * 0.7) + (base_from_reviews * 0.3)
            else:
                estimated_sales = base_from_reviews
       
        # Price-based adjustment (optional but adds accuracy)
        if price and estimated_sales > 0:
            if price < 500:  # Budget products
                estimated_sales *= 1.2  # Higher volume
            elif price < 2000:  # Mid-range
                estimated_sales *= 1.0
            elif price < 10000:  # Premium
                estimated_sales *= 0.8
            else:  # Luxury
                estimated_sales *= 0.6  # Lower volume, higher value
       
        return round(estimated_sales, 2) if estimated_sales > 0 else None
 
 
class Config:
    def __init__(self):
        load_dotenv()
        self.DATABASE_URL = os.getenv("DATABASE_URL")
       
        # Amazon API configuration (using your existing variable names)
        self.RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
        self.RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
       
        # Flipkart API configuration
        self.FLIPKART_RAPIDAPI_KEY = os.getenv("FLIPKART_RAPIDAPI_KEY")
        self.FLIPKART_RAPIDAPI_HOST = os.getenv("FLIPKART_RAPIDAPI_HOST", "real-time-flipkart-data2.p.rapidapi.com")
       
        self.COUNTRY = os.getenv("COUNTRY", "IN")
        self.SORT_BY = os.getenv("SORT_BY", "RELEVANCE")
        self.PRODUCT_CONDITION = os.getenv("PRODUCT_CONDITION", "ALL")
        self.IS_PRIME = os.getenv("IS_PRIME", "false")
        self.DEALS_AND_DISCOUNTS = os.getenv("DEALS_AND_DISCOUNTS", "NONE")
        self.MAX_PAGES = int(os.getenv("MAX_PAGES", "32"))
        self.FLIPKART_MAX_PAGES = int(os.getenv("FLIPKART_MAX_PAGES", "110"))
        self.OUTPUT_DIR = os.getenv("OUTPUT_DIR", "data_output")
        self.DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
        self.DB_MAX_RETRIES = int(os.getenv("DB_MAX_RETRIES", "3"))
       
        # Platform selection
        self.ENABLE_AMAZON = os.getenv("ENABLE_AMAZON", "true").lower() == "true"
        self.ENABLE_FLIPKART = os.getenv("ENABLE_FLIPKART", "true").lower() == "true"
       
        # Categories (using your existing variable name for Amazon)
        self.CATEGORIES = self._load_amazon_categories()
        self.FLIPKART_CATEGORIES = self._load_flipkart_categories()
       
        if not self.RAPIDAPI_KEY and self.ENABLE_AMAZON:
            logger.warning("Amazon API key missing - Amazon collection will be disabled")
            self.ENABLE_AMAZON = False
        if not self.FLIPKART_RAPIDAPI_KEY and self.ENABLE_FLIPKART:
            logger.warning("Flipkart API key missing - Flipkart collection will be disabled")
            self.ENABLE_FLIPKART = False
           
        logger.info(f"[CONFIG] Loaded - Amazon: {self.ENABLE_AMAZON}, Flipkart: {self.ENABLE_FLIPKART}")
 
    def _load_amazon_categories(self):
        categories_env = os.getenv("CATEGORIES")  # Using your existing variable name
        if categories_env:
            categories = {}
            for cat in categories_env.split(","):
                if ":" in cat:
                    cat_id, cat_name = cat.split(":", 1)
                    categories[cat_id.strip()] = cat_name.strip()
            return categories
        return {
            "1350380031": "Baby Products",
            "976419031": "Electronics",
            "976392031": "Computers & Accessories",
            "1389401031": "Cell Phones",
            "1350387031": "Toys & Games",
            "1350384031": "Health & Personal Care",
            "976460031": "Video Games",
            "4771345031": "Pet Supplies",
            "1355016031": "Beauty"
        }   
    def _load_flipkart_categories(self):
        categories_env = os.getenv("FLIPKART_CATEGORIES")
        if categories_env:
            categories = {}
            for cat in categories_env.split(","):
                if ":" in cat:
                    cat_id, cat_name = cat.split(":", 1)
                    categories[cat_id.strip()] = cat_name.strip()
            return categories
        # Default Flipkart category IDs (from Flipkart URL 'sid' parameter)
        # Find more: Browse Flipkart -> Check URL for sid=xxx,yyy
        return {
            "tyy,4io": "Mobiles & Accessories",
            "6bo,b5g": "Electronics",
            "clo": "Clothing & Accessories",
            "arb": "Home Decor",
            "j9e": "Home Appliances",
            "eat": "Food and Nutrition",
            "tng": "Toys and Games",
            "zlw": "Health & Personal Care Appliances"
        }
 
 
class Database:
    def __init__(self, url: str, timeout: int = 10, max_retries: int = 3):
        self.url = url
        self.timeout = timeout
        self.max_retries = max_retries
        self.conn = None
        self.available = False
 
    def connect(self) -> bool:
        if not self.url or not DB_AVAILABLE:
            logger.warning("[DB] Not available")
            return False
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"[DB] Connecting (attempt {attempt}/{self.max_retries})...")
                self.conn = psycopg2.connect(self.url, connect_timeout=self.timeout)
                self.conn.autocommit = False
                self.available = True
                logger.info("[DB] Connected successfully")
                return True
            except Exception as e:
                logger.error(f"[DB] Connection error: {e}")
                if attempt < self.max_retries:
                    time.sleep(attempt * 2)
        return False
 
    def disconnect(self):
        if self.conn:
            try:
                if not self.conn.closed:
                    self.conn.commit()
                self.conn.close()
            except Exception as e:
                logger.error(f"[DB] Disconnect error: {e}")
            self.conn = None
            self.available = False
            logger.info("[DB] Disconnected")
 
    def create_tables(self) -> bool:
        if not self.available:
            return False
       
        # Keep your existing Amazon table structure
        create_amazon_table = """
        CREATE TABLE IF NOT EXISTS rapidapi_amazon_products (
            id SERIAL PRIMARY KEY,
            asin VARCHAR(50) NOT NULL,
            category_id VARCHAR(50),
            category_name VARCHAR(200),
            product_title TEXT,
            product_url TEXT,
            product_photo TEXT,
            product_price TEXT,
            product_price_numeric DECIMAL(10,2),
            product_original_price TEXT,
            product_original_price_numeric DECIMAL(10,2),
            product_star_rating TEXT,
            product_star_rating_numeric DECIMAL(3,2),
            product_num_ratings INTEGER,
            is_best_seller BOOLEAN DEFAULT FALSE,
            is_amazon_choice BOOLEAN DEFAULT FALSE,
            is_prime BOOLEAN DEFAULT FALSE,
            sales_volume TEXT,
            country VARCHAR(10),
            raw_data JSONB,
            avg_price DECIMAL(10,2),
            min_price DECIMAL(10,2),
            max_price DECIMAL(10,2),
            avg_sales_volume DECIMAL(15,2),
            min_sales_volume DECIMAL(15,2),
            max_sales_volume DECIMAL(15,2),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (asin, category_id, country)
        );
       
        CREATE INDEX IF NOT EXISTS idx_rapidapi_asin ON rapidapi_amazon_products(asin);
        CREATE INDEX IF NOT EXISTS idx_rapidapi_category ON rapidapi_amazon_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_rapidapi_updated ON rapidapi_amazon_products(updated_at);
        """
       
        # Create separate Flipkart table
        create_flipkart_table = """
        CREATE TABLE IF NOT EXISTS rapidapi_flipkart_products (
            id SERIAL PRIMARY KEY,
            pid VARCHAR(100) NOT NULL,
            item_id VARCHAR(100),
            listing_id VARCHAR(100),
            category_id VARCHAR(100),
            category_name VARCHAR(200),
            brand VARCHAR(200),
            product_title TEXT,
            product_subtitle TEXT,
            product_url TEXT,
            product_photo TEXT,
            product_price DECIMAL(10,2),
            product_mrp DECIMAL(10,2),
            product_star_rating DECIMAL(3,2),
            product_rating_count INTEGER,
            product_review_count INTEGER,
            is_sponsored BOOLEAN DEFAULT FALSE,
            stock_status VARCHAR(50),
            highlights JSONB,
            rating_breakup JSONB,
            sales_volume TEXT,
            estimated_sales DECIMAL(15,2),
            country VARCHAR(10),
            raw_data JSONB,
            avg_price DECIMAL(10,2),
            min_price DECIMAL(10,2),
            max_price DECIMAL(10,2),
            avg_sales_volume DECIMAL(15,2),
            min_sales_volume DECIMAL(15,2),
            max_sales_volume DECIMAL(15,2),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (pid, category_id, country)
        );
       
        CREATE INDEX IF NOT EXISTS idx_flipkart_pid ON rapidapi_flipkart_products(pid);
        CREATE INDEX IF NOT EXISTS idx_flipkart_category ON rapidapi_flipkart_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_flipkart_brand ON rapidapi_flipkart_products(brand);
        CREATE INDEX IF NOT EXISTS idx_flipkart_updated ON rapidapi_flipkart_products(updated_at);
        """
       
        try:
            with self.conn.cursor() as cur:
                cur.execute(create_amazon_table)
                cur.execute(create_flipkart_table)
            self.conn.commit()
            logger.info("[DB] Tables created successfully (rapidapi_amazon_products & rapidapi_flipkart_products)")
            return True
        except Exception as e:
            logger.error(f"[DB] Table creation error: {e}")
            if self.conn:
                self.conn.rollback()
            return False
 
    def save_amazon_products(self, products: List[Dict]) -> int:
        """Save Amazon products to rapidapi_amazon_products table"""
        if not self.available or not products:
            return 0

        seen_keys = set()
        tuples = []
        for p in products:
            asin = p.get("asin")
            category_id = p.get("category_id")
            country = p.get("country")
            key = (asin, category_id, country)
            if not asin or key in seen_keys:
                continue
            seen_keys.add(key)
            try:
                current_price = p.get("product_price_numeric")
                original_price = p.get("product_original_price_numeric")
                avg_price, min_price, max_price = ProductAnalytics.calculate_price_range(
                    current_price, original_price
                )
                current_sales = ProductAnalytics.parse_sales_volume(p.get("sales_volume"))
                avg_sales, min_sales, max_sales = ProductAnalytics.estimate_sales_range(
                    current_sales,
                    p.get("is_best_seller", False),
                    p.get("is_prime", False)
                )
                tuples.append((
                    p.get("asin"),
                    p.get("category_id"),
                    p.get("category_name"),
                    p.get("product_title"),
                    p.get("product_url"),
                    p.get("product_photo"),
                    p.get("product_price"),
                    p.get("product_price_numeric"),
                    p.get("product_original_price"),
                    p.get("product_original_price_numeric"),
                    p.get("product_star_rating"),
                    p.get("product_star_rating_numeric"),
                    int(p.get("product_num_ratings")) if p.get("product_num_ratings") not in (None, "") else None,
                    bool(p.get("is_best_seller", False)),
                    bool(p.get("is_amazon_choice", False)),
                    bool(p.get("is_prime", False)),
                    p.get("sales_volume"),
                    p.get("country"),
                    Json(p.get("raw_data", {})),
                    avg_price, min_price, max_price,
                    avg_sales, min_sales, max_sales
                ))
            except Exception as e:
                logger.debug(f"[DB] Skip Amazon product {p.get('asin')}: {e}")
                continue

        if not tuples:
            return 0

        insert_sql = """
        INSERT INTO rapidapi_amazon_products (
            asin, category_id, category_name, product_title, product_url,
            product_photo, product_price, product_price_numeric,
            product_original_price, product_original_price_numeric,
            product_star_rating, product_star_rating_numeric,
            product_num_ratings, is_best_seller, is_amazon_choice,
            is_prime, sales_volume, country, raw_data,
            avg_price, min_price, max_price,
            avg_sales_volume, min_sales_volume, max_sales_volume
        )
        VALUES %s
        ON CONFLICT (asin, category_id, country) DO UPDATE
        SET
            product_price = EXCLUDED.product_price,
            product_price_numeric = EXCLUDED.product_price_numeric,
            avg_price = EXCLUDED.avg_price,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            avg_sales_volume = EXCLUDED.avg_sales_volume,
            min_sales_volume = EXCLUDED.min_sales_volume,
            max_sales_volume = EXCLUDED.max_sales_volume,
            updated_at = now()
        ;
        """
        try:
            with self.conn.cursor() as cur:
                execute_values(cur, insert_sql, tuples, page_size=100)

            self.conn.commit()
            logger.info(f"[DB] COMMITTED {len(tuples)} Amazon products")

            with self.conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM rapidapi_amazon_products WHERE updated_at > NOW() - INTERVAL '1 minute';")
                recent_count = cur.fetchone()[0]
                logger.info(f"[DB] VERIFIED: {recent_count} Amazon records updated")

            return len(tuples)
        except Exception as e:
            logger.error(f"[DB] Amazon save error: {e}")
            if self.conn:
                self.conn.rollback()
            return 0
 
    def save_flipkart_products(self, products: List[Dict]) -> int:
        """Save Flipkart products to rapidapi_flipkart_products table"""
        if not self.available or not products:
            return 0

        seen_keys = set()
        tuples = []
        for p in products:
            pid = p.get("pid")
            category_id = p.get("category_id")
            country = p.get("country")
            key = (pid, category_id, country)
            if not pid or key in seen_keys:
                continue
            seen_keys.add(key)
            try:
                current_price = p.get("product_price")
                original_price = p.get("product_mrp")
                avg_price, min_price, max_price = ProductAnalytics.calculate_price_range(
                    current_price, original_price
                )
                current_sales = ProductAnalytics.parse_sales_volume(p.get("sales_volume"))
                avg_sales, min_sales, max_sales = ProductAnalytics.estimate_sales_range(
                    current_sales, False, False
                )
                tuples.append((
                    p.get("pid"),
                    p.get("item_id"),
                    p.get("listing_id"),
                    p.get("category_id"),
                    p.get("category_name"),
                    p.get("brand"),
                    p.get("product_title"),
                    p.get("product_subtitle"),
                    p.get("product_url"),
                    p.get("product_photo"),
                    p.get("product_price"),
                    p.get("product_mrp"),
                    p.get("product_star_rating"),
                    int(p.get("product_rating_count")) if p.get("product_rating_count") not in (None, "") else None,
                    int(p.get("product_review_count")) if p.get("product_review_count") not in (None, "") else None,
                    bool(p.get("is_sponsored", False)),
                    p.get("stock_status"),
                    Json(p.get("highlights", [])),
                    Json(p.get("rating_breakup", {})),
                    p.get("sales_volume"),
                    p.get("estimated_sales"),
                    p.get("country"),
                    Json(p.get("raw_data", {})),
                    avg_price, min_price, max_price,
                    avg_sales, min_sales, max_sales
                ))
            except Exception as e:
                logger.debug(f"[DB] Skip Flipkart product {p.get('pid')}: {e}")
                continue

        if not tuples:
            return 0

        insert_sql = """
        INSERT INTO rapidapi_flipkart_products (
            pid, item_id, listing_id, category_id, category_name, brand,
            product_title, product_subtitle, product_url, product_photo,
            product_price, product_mrp, product_star_rating,
            product_rating_count, product_review_count, is_sponsored,
            stock_status, highlights, rating_breakup, sales_volume,
            estimated_sales, country, raw_data,
            avg_price, min_price, max_price,
            avg_sales_volume, min_sales_volume, max_sales_volume
        )
        VALUES %s
        ON CONFLICT (pid, category_id, country) DO UPDATE
        SET
            product_price = EXCLUDED.product_price,
            product_mrp = EXCLUDED.product_mrp,
            avg_price = EXCLUDED.avg_price,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            sales_volume = EXCLUDED.sales_volume,
            estimated_sales = EXCLUDED.estimated_sales,
            avg_sales_volume = EXCLUDED.avg_sales_volume,
            min_sales_volume = EXCLUDED.min_sales_volume,
            max_sales_volume = EXCLUDED.max_sales_volume,
            updated_at = now()
        ;
        """
        try:
            with self.conn.cursor() as cur:
                execute_values(cur, insert_sql, tuples, page_size=100)

            self.conn.commit()
            logger.info(f"[DB] COMMITTED {len(tuples)} Flipkart products")

            with self.conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM rapidapi_flipkart_products WHERE updated_at > NOW() - INTERVAL '1 minute';")
                recent_count = cur.fetchone()[0]
                logger.info(f"[DB] VERIFIED: {recent_count} Flipkart records updated")

            return len(tuples)
        except Exception as e:
            logger.error(f"[DB] Flipkart save error: {e}")
            if self.conn:
                self.conn.rollback()
            return 0
 
    def get_amazon_stats(self):
        if not self.available:
            return None
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) as total,
                           COUNT(DISTINCT asin) as unique_asins,
                           COUNT(DISTINCT category_id) as categories,
                           AVG(avg_price) as overall_avg_price,
                           AVG(avg_sales_volume) as overall_avg_sales,
                           MAX(updated_at) as last_updated
                    FROM rapidapi_amazon_products
                    WHERE country = %s
                """, ('IN',))
                r = cur.fetchone()
            return {
                "total": r[0],
                "unique_products": r[1],
                "categories": r[2],
                "avg_price": float(r[3]) if r[3] else None,
                "avg_sales": float(r[4]) if r[4] else None,
                "last_updated": r[5]
            }
        except Exception as e:
            logger.error(f"[DB] Amazon stats error: {e}")
            return None
   
    def get_flipkart_stats(self):
        if not self.available:
            return None
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) as total,
                           COUNT(DISTINCT pid) as unique_pids,
                           COUNT(DISTINCT category_id) as categories,
                           AVG(avg_price) as overall_avg_price,
                           AVG(estimated_sales) as overall_avg_sales,
                           MAX(updated_at) as last_updated
                    FROM rapidapi_flipkart_products
                    WHERE country = %s
                """, ('IN',))
                r = cur.fetchone()
            return {
                "total": r[0],
                "unique_products": r[1],
                "categories": r[2],
                "avg_price": float(r[3]) if r[3] else None,
                "avg_sales": float(r[4]) if r[4] else None,
                "last_updated": r[5]
            }
        except Exception as e:
            logger.error(f"[DB] Flipkart stats error: {e}")
            return None
 
 
class MultiPlatformCollector:
    def __init__(self, config: Config):
        self.config = config
        self.db = Database(config.DATABASE_URL, config.DB_CONNECT_TIMEOUT, config.DB_MAX_RETRIES)
       
        # Initialize API clients
        self.amazon_api = None
        self.flipkart_api = None
       
        if config.ENABLE_AMAZON:
            self.amazon_api = RapidAPIClient(config.RAPIDAPI_KEY, config.RAPIDAPI_HOST)
            logger.info("[INIT] Amazon API client initialized")
           
        if config.ENABLE_FLIPKART:
            self.flipkart_api = RapidAPIClient(config.FLIPKART_RAPIDAPI_KEY, config.FLIPKART_RAPIDAPI_HOST)
            logger.info("[INIT] Flipkart API client initialized")
 
    def _parse_price(self, price_value) -> Optional[float]:
        if not price_value:
            return None
        try:
            if isinstance(price_value, (int, float)):
                return float(price_value)
            return float(re.sub(r'[^\d.]', '', str(price_value)))
        except:
            return None
 
    def _parse_rating(self, rating_value) -> Optional[float]:
        if not rating_value:
            return None
        try:
            if isinstance(rating_value, (int, float)):
                return float(rating_value)
            match = re.search(r'(\d+(\.\d+)?)', str(rating_value))
            return float(match.group(1)) if match else None
        except:
            return None
 
    # ==================== AMAZON METHODS ====================
   
    def extract_amazon_products(self, response: Dict, category_id: str, category_name: str) -> List[Dict]:
        products = []
        if not response or response.get("status") != "OK":
            return products
       
        for item in response.get("data", {}).get("products", []):
            if not item.get("asin"):
                continue
            products.append({
                "asin": item.get("asin"),
                "category_id": category_id,
                "category_name": category_name,
                "product_title": item.get("product_title"),
                "product_url": item.get("product_url"),
                "product_photo": item.get("product_photo"),
                "product_price": item.get("product_price"),
                "product_price_numeric": self._parse_price(item.get("product_price")),
                "product_original_price": item.get("product_original_price"),
                "product_original_price_numeric": self._parse_price(item.get("product_original_price")),
                "product_star_rating": item.get("product_star_rating"),
                "product_star_rating_numeric": self._parse_rating(item.get("product_star_rating")),
                "product_num_ratings": item.get("product_num_ratings", 0),
                "is_best_seller": item.get("is_best_seller", False),
                "is_amazon_choice": item.get("is_amazon_choice", False),
                "is_prime": item.get("is_prime", False),
                "sales_volume": item.get("sales_volume"),
                "country": self.config.COUNTRY,
                "raw_data": item
            })
        return products
 
    def collect_amazon_category(self, category_id: str, category_name: str):
        logger.info(f"\n{'='*70}\n[AMAZON] Collecting {category_name}")
        total = 0
        for page in range(1, self.config.MAX_PAGES + 1):
            logger.info(f"[AMAZON] Page {page}/{self.config.MAX_PAGES}...")
            response = self.amazon_api.get_amazon_products_by_category(
                category_id=category_id, page=page, country=self.config.COUNTRY
            )
            if not response:
                break
            products = self.extract_amazon_products(response, category_id, category_name)
            if not products:
                break
            saved = self.db.save_amazon_products(products)
            total += saved
            if saved > 0:
                logger.info(f"[AMAZON] Saved {saved} products")
            if page < self.config.MAX_PAGES:
                time.sleep(2)
        logger.info(f"[AMAZON] Total: {total} products saved for {category_name}")
        return {"success": total > 0, "count": total}
   
    # ==================== FLIPKART METHODS ====================
   
    def extract_flipkart_products(self, response: Dict, category_query: str, category_name: str) -> List[Dict]:
        products = []
        if not response or not response.get("success"):
            return products
       
        data_items = response.get("data", [])
        if not isinstance(data_items, list):
            return products
           
        for item in data_items:
            if not item.get("pid"):
                continue
           
            # Extract rating information
            rating_info = item.get("rating", {})
            avg_rating = rating_info.get("average") if isinstance(rating_info, dict) else None
            rating_count = rating_info.get("count", 0) if isinstance(rating_info, dict) else 0
            review_count = rating_info.get("reviewCount", 0) if isinstance(rating_info, dict) else 0
            rating_breakup = rating_info.get("breakup", []) if isinstance(rating_info, dict) else []
           
            # Get images and highlights
            images = item.get("images", [])
            first_image = images[0] if images and len(images) > 0 else None
            highlights = item.get("highlights", [])
           
            # Get prices
            current_price = self._parse_price(item.get("price"))
            mrp = self._parse_price(item.get("mrp"))
           
            # ESTIMATE SALES for Flipkart
            estimated_sales = ProductAnalytics.estimate_flipkart_sales(
                rating_count=rating_count,
                review_count=review_count,
                star_rating=self._parse_rating(avg_rating),
                price=current_price
            )
           
            # Format sales volume text
            sales_volume_text = None
            if estimated_sales:
                if estimated_sales >= 1_000_000:
                    sales_volume_text = f"{estimated_sales / 1_000_000:.1f}M+ bought"
                elif estimated_sales >= 1_000:
                    sales_volume_text = f"{estimated_sales / 1_000:.1f}K+ bought"
                else:
                    sales_volume_text = f"{int(estimated_sales)}+ bought"
           
            products.append({
                "pid": item.get("pid"),
                "item_id": item.get("itemId"),
                "listing_id": item.get("listingId"),
                "category_id": category_query,
                "category_name": category_name,
                "brand": item.get("brand"),
                "product_title": item.get("title"),
                "product_subtitle": item.get("subTitle"),
                "product_url": item.get("url"),
                "product_photo": first_image,
                "product_price": current_price,
                "product_mrp": mrp,
                "product_star_rating": self._parse_rating(avg_rating),
                "product_rating_count": rating_count,
                "product_review_count": review_count,
                "is_sponsored": item.get("isSponsored", False),
                "stock_status": item.get("stock"),
                "highlights": highlights,
                "rating_breakup": rating_breakup,
                "sales_volume": sales_volume_text,
                "estimated_sales": estimated_sales,
                "country": "IN",
                "raw_data": item
            })
        return products
 
    def collect_flipkart_category(self, category_id: str, category_name: str):
        logger.info(f"\n{'='*70}\n[FLIPKART] Collecting {category_name}")
        total = 0
       
        # Use category-based endpoint (BASIC plan compatible)
        for page in range(1, self.config.FLIPKART_MAX_PAGES + 1):
            logger.info(f"[FLIPKART] Page {page}/{self.config.FLIPKART_MAX_PAGES}...")
           
            # Call the category endpoint
            response = self.flipkart_api.get_flipkart_products_by_category(
                category_id=category_id, page=page
            )
           
            if not response:
                logger.warning(f"[FLIPKART] No response for page {page}, stopping collection")
                break
               
            products = self.extract_flipkart_products(response, category_id, category_name)
            if not products:
                logger.warning(f"[FLIPKART] No products found on page {page}, stopping collection")
                break
               
            saved = self.db.save_flipkart_products(products)
            total += saved
            if saved > 0:
                logger.info(f"[FLIPKART] Saved {saved} products")
            if page < self.config.MAX_PAGES:
                time.sleep(2)
               
        logger.info(f"[FLIPKART] Total: {total} products saved for {category_name}")
        return {"success": total > 0, "count": total}
   
    # ==================== MAIN COLLECTION LOGIC ====================
   
    def collect_all(self):
        results = {"amazon": [], "flipkart": []}
        logger.info("[START] Multi-platform collection starting")
       
        if not self.db.connect() or not self.db.create_tables():
            logger.error("[FATAL] Database required")
            return results
 
        # Collect Amazon data
        if self.config.ENABLE_AMAZON and self.amazon_api:
            logger.info(f"\n{'#'*70}\n[AMAZON] Starting Amazon collection\n{'#'*70}")
            for i, (cat_id, cat_name) in enumerate(self.config.CATEGORIES.items(), 1):
                logger.info(f"\n[AMAZON] Category {i}/{len(self.config.CATEGORIES)}")
                res = self.collect_amazon_category(cat_id, cat_name)
                results["amazon"].append(res)
                if i < len(self.config.CATEGORIES):
                    time.sleep(3)
       
        # Collect Flipkart data
        if self.config.ENABLE_FLIPKART and self.flipkart_api:
            logger.info(f"\n{'#'*70}\n[FLIPKART] Starting Flipkart collection\n{'#'*70}")
            for i, (cat_query, cat_name) in enumerate(self.config.FLIPKART_CATEGORIES.items(), 1):
                logger.info(f"\n[FLIPKART] Category {i}/{len(self.config.FLIPKART_CATEGORIES)}")
                res = self.collect_flipkart_category(cat_query, cat_name)
                results["flipkart"].append(res)
                if i < len(self.config.FLIPKART_CATEGORIES):
                    time.sleep(3)
       
        # Final commit
        if self.db.conn and not self.db.conn.closed:
            self.db.conn.commit()
            logger.info("[DB] Final commit completed")
       
        return results
 
 
def main():
    try:
        cfg = Config()
        collector = MultiPlatformCollector(cfg)
        results = collector.collect_all()
 
        # Display statistics
        logger.info(f"\n{'='*70}\n[FINAL STATISTICS]\n{'='*70}")
       
        if cfg.ENABLE_AMAZON:
            amazon_stats = collector.db.get_amazon_stats()
            if amazon_stats:
                logger.info(f"\n[AMAZON STATS]")
                logger.info(f"  Products: {amazon_stats['total']}")
                logger.info(f"  Unique ASINs: {amazon_stats['unique_products']}")
                logger.info(f"  Categories: {amazon_stats['categories']}")
                if amazon_stats.get('avg_price'):
                    logger.info(f"  Avg Price: Rs {amazon_stats['avg_price']:.2f}")
                if amazon_stats.get('avg_sales'):
                    logger.info(f"  Avg Sales: {amazon_stats['avg_sales']:,.0f}")
                if amazon_stats.get('last_updated'):
                    logger.info(f"  Last Updated: {amazon_stats['last_updated']}")
       
        if cfg.ENABLE_FLIPKART:
            flipkart_stats = collector.db.get_flipkart_stats()
            if flipkart_stats:
                logger.info(f"\n[FLIPKART STATS]")
                logger.info(f"  Products: {flipkart_stats['total']}")
                logger.info(f"  Unique PIDs: {flipkart_stats['unique_products']}")
                logger.info(f"  Categories: {flipkart_stats['categories']}")
                if flipkart_stats.get('avg_price'):
                    logger.info(f"  Avg Price: Rs {flipkart_stats['avg_price']:.2f}")
                if flipkart_stats.get('avg_sales'):
                    logger.info(f"  Avg Estimated Sales: {flipkart_stats['avg_sales']:,.0f}")
                if flipkart_stats.get('last_updated'):
                    logger.info(f"  Last Updated: {flipkart_stats['last_updated']}")
       
        amazon_total = sum(r.get("count", 0) for r in results.get("amazon", []))
        flipkart_total = sum(r.get("count", 0) for r in results.get("flipkart", []))
        logger.info(f"\n[COMPLETE] Amazon: {amazon_total} | Flipkart: {flipkart_total} | Total: {amazon_total + flipkart_total}")
 
    except KeyboardInterrupt:
        logger.info("\n[STOP] Interrupted")
    except Exception as e:
        logger.error(f"[ERROR] {e}", exc_info=True)
    finally:
        try:
            collector.db.disconnect()
        except:
            pass
 
 
if __name__ == "__main__":
    main()
