 
#!/usr/bin/env python3
"""
RapidAPI REST Client
Handles HTTP connections to RapidAPI services
"""
 
import http.client
import json
import logging
from typing import Dict, Optional
 
logger = logging.getLogger(__name__)
 
 
class RapidAPIClient:
    """
    REST client for RapidAPI Amazon Data service
   
    Usage:
        client = RapidAPIClient(api_key, host)
        response = client.get_products_by_category(category_id="281407", page=1)
    """
   
    def __init__(self, api_key: str, host: str):
        """
        Initialize RapidAPI client
       
        Args:
            api_key: Your RapidAPI key (x-rapidapi-key header)
            host: RapidAPI host (e.g., 'real-time-amazon-data.p.rapidapi.com')
        """
        self.api_key = api_key
        self.host = host
        self.headers = {
            'x-rapidapi-key': api_key,
            'x-rapidapi-host': host
        }
        logger.info(f"[RapidAPI] Client initialized for host: {host}")
   
    def _make_request(self, endpoint: str, method: str = "GET") -> Optional[Dict]:
        """
        Make HTTP request to RapidAPI
       
        Args:
            endpoint: API endpoint with query parameters
            method: HTTP method (GET or POST)
           
        Returns:
            Parsed JSON response or None if request failed
        """
        conn = None
        try:
            logger.debug(f"[RapidAPI] {method} {endpoint}")
           
            # Create HTTPS connection
            conn = http.client.HTTPSConnection(self.host, timeout=30)
           
            # Make request
            conn.request(method, endpoint, headers=self.headers)
           
            # Get response
            response = conn.getresponse()
            data = response.read()
           
            # Check status code
            if response.status == 200:
                result = json.loads(data.decode("utf-8"))
                logger.debug(f"[RapidAPI] ✓ Response status: {response.status}")
                return result
            else:
                logger.error(f"[RapidAPI] HTTP {response.status}: {response.reason}")
                logger.error(f"[RapidAPI] Response: {data.decode('utf-8')[:500]}")
                return None
               
        except http.client.HTTPException as e:
            logger.error(f"[RapidAPI] HTTP error: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"[RapidAPI] JSON decode error: {e}")
            return None
        except Exception as e:
            logger.error(f"[RapidAPI] Request error: {e}")
            return None
        finally:
            if conn:
                conn.close()
   
    def get_products_by_category(
        self,
        category_id: str,
        page: int = 1,
        country: str = "US",
        sort_by: str = "RELEVANCE",
        product_condition: str = "ALL",
        is_prime: str = "false",
        deals_and_discounts: str = "NONE"
    ) -> Optional[Dict]:
        """
        Get products by category from Amazon
       
        Args:
            category_id: Amazon category ID (e.g., "281407" for Baby Products)
            page: Page number (default: 1)
            country: Country code (US, UK, IN, etc.)
            sort_by: Sort option (RELEVANCE, PRICE_LOW_TO_HIGH, etc.)
            product_condition: ALL, NEW, USED, REFURBISHED
            is_prime: "true" or "false"
            deals_and_discounts: NONE, TODAYS_DEALS, LIGHTNING_DEALS
           
        Returns:
            API response as dictionary or None if failed
        """
        endpoint = (
            f"/products-by-category?"
            f"category_id={category_id}"
            f"&page={page}"
            f"&country={country}"
            f"&sort_by={sort_by}"
            f"&product_condition={product_condition}"
            f"&is_prime={is_prime}"
            f"&deals_and_discounts={deals_and_discounts}"
        )
       
        logger.info(f"[RapidAPI] Fetching products: category={category_id}, page={page}, country={country}")
       
        response = self._make_request(endpoint, method="GET")
       
        if response:
            # Log summary
            status = response.get("status", "UNKNOWN")
            if status == "OK":
                data = response.get("data", {})
                total = data.get("total_products", 0)
                products_count = len(data.get("products", []))
                logger.info(f"[RapidAPI] ✓ Success: {products_count} products (total available: {total})")
            else:
                logger.warning(f"[RapidAPI] Response status: {status}")
       
        return response
   
    def search_products(
        self,
        query: str,
        page: int = 1,
        country: str = "US",
        sort_by: str = "RELEVANCE",
        product_condition: str = "ALL",
        is_prime: str = "false"
    ) -> Optional[Dict]:
        """
        Search products by query
       
        Args:
            query: Search query string
            page: Page number
            country: Country code
            sort_by: Sort option
            product_condition: Product condition filter
            is_prime: Prime filter
           
        Returns:
            API response as dictionary or None if failed
        """
        # URL encode the query
        import urllib.parse
        encoded_query = urllib.parse.quote(query)
       
        endpoint = (
            f"/search?"
            f"query={encoded_query}"
            f"&page={page}"
            f"&country={country}"
            f"&sort_by={sort_by}"
            f"&product_condition={product_condition}"
            f"&is_prime={is_prime}"
        )
       
        logger.info(f"[RapidAPI] Searching products: query='{query}', page={page}")
        return self._make_request(endpoint, method="GET")
   
    def get_product_details(self, asin: str, country: str = "US") -> Optional[Dict]:
        """
        Get detailed information for a specific product
       
        Args:
            asin: Amazon Standard Identification Number
            country: Country code
           
        Returns:
            Product details as dictionary or None if failed
        """
        endpoint = f"/product-details?asin={asin}&country={country}"
       
        logger.info(f"[RapidAPI] Fetching product details: asin={asin}")
        return self._make_request(endpoint, method="GET")
   
    def test_connection(self) -> bool:
        """
        Test the API connection
       
        Returns:
            True if connection successful, False otherwise
        """
        logger.info("[RapidAPI] Testing connection...")
       
        # Try a simple request with a known category
        response = self.get_products_by_category(
            category_id="281407",  # Baby Products
            page=1
        )
       
        if response and response.get("status") == "OK":
            logger.info("[RapidAPI] ✓ Connection test successful")
            return True
        else:
            logger.error("[RapidAPI] ✗ Connection test failed")
            return False
 
 
# Example usage
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
   
    # Setup logging
    logging.basicConfig(level=logging.INFO)
   
    # Load environment variables
    load_dotenv()
   
    api_key = os.getenv("RAPIDAPI_KEY")
    host = "real-time-amazon-data.p.rapidapi.com"
   
    if not api_key:
        print("ERROR: RAPIDAPI_KEY not found in environment variables")
        exit(1)
   
    # Create client
    client = RapidAPIClient(api_key, host)
   
    # Test connection
    if client.test_connection():
        print("\n✓ RapidAPI client working correctly!")
       
        # Get some products
        print("\nFetching Baby Products...")
        response = client.get_products_by_category(
            category_id="281407",
            page=1,
            country="US"
        )
       
        if response:
            data = response.get("data", {})
            products = data.get("products", [])
            print(f"\nFound {len(products)} products:")
            for i, product in enumerate(products[:3], 1):
                print(f"\n{i}. {product.get('product_title')}")
                print(f"   Price: {product.get('product_price')}")
                print(f"   Rating: {product.get('product_star_rating')}")
                print(f"   Prime: {product.get('is_prime')}")
    else:
        print("\n✗ RapidAPI client connection failed!")
        print("Check your RAPIDAPI_KEY and network connection")
 
