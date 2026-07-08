
# import os
# import requests
# import json
# import re
# from datetime import datetime
# from typing import List, Optional, Tuple, Any
# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from fastapi import HTTPException
# from app.models import legacy_models as models
# from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts, User
# from dotenv import load_dotenv
# from pathlib import Path

# # ─────────────────────────────────────────
# # CONFIG & CONSTANTS
# # ─────────────────────────────────────────
# BASE_DIR = Path(__file__).resolve().parent.parent.parent # server_py/
# load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

# RAPIDAPI_KEY  = os.environ.get("RAPIDAPI_KEY")
# RAPIDAPI_HOST = os.environ.get("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
# AMAZON_API_URL         = "https://real-time-amazon-data.p.rapidapi.com/seller-products"
# AMAZON_REVIEWS_API_URL = "https://real-time-amazon-data.p.rapidapi.com/seller-reviews"

# HEADERS = {
#     "X-RapidAPI-Key":  RAPIDAPI_KEY,
#     "X-RapidAPI-Host": RAPIDAPI_HOST,
# }

# KEYWORD_TRACKER_LIMITS = {
#     "free":       2,
#     "basic":      10,
#     "premium":    -1,
#     "enterprise": -1,
# }

# class SellerInboundService:
#     @staticmethod
#     def extract_numeric(val: Any) -> float:
#         if val is None:
#             return 0.0
#         if isinstance(val, (int, float)):
#             return float(val)
#         num_str = re.sub(r'[^\d.]', '', str(val))
#         try: 
#             return float(num_str) if num_str else 0.0
#         except (ValueError, TypeError): 
#             return 0.0

#     @staticmethod
#     def fetch_seller_reviews(seller_id: str, country: str) -> Tuple[List[str], List[int]]:
#         try:
#             resp = requests.get(
#                 AMAZON_REVIEWS_API_URL,
#                 headers=HEADERS,
#                 params={"seller_id": seller_id, "country": country, "page": 1},
#                 timeout=20,
#             )
#             resp.raise_for_status()
#             data = resp.json()
#             if data.get("status") != "OK":
#                 return [], []
#             reviews = data.get("data", {}).get("seller_reviews", [])
#             comments = [r.get("review_comment", "") for r in reviews]
#             ratings  = [r.get("review_star_rating", 0) for r in reviews]
#             return comments, ratings
#         except Exception as e:
#             print(f"[SellerInboundService][reviews] error: {e}")
#             return [], []

#     @staticmethod
#     def check_keyword_tracker_limit(user_id: int, db: Session) -> dict:
#         row = db.execute(
#             text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid"),
#             {"uid": user_id},
#         ).fetchone()
#         if not row:
#             raise HTTPException(status_code=404, detail="User not found")

#         tier, used, tracked_month = row[0] or "free", row[1], row[2]
#         current_month = datetime.utcnow().strftime("%Y-%m")

#         if tracked_month != current_month:
#             db.execute(
#                 text("UPDATE users SET keyword_tracker_used=0, keyword_tracker_month=:m WHERE id=:uid"),
#                 {"m": current_month, "uid": user_id},
#             )
#             db.commit()
#             used = 0

#         limit     = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
#         remaining = (limit - used) if limit != -1 else -1
#         return {"count": used, "limit": limit, "remaining": remaining, "subscription_tier": tier}

#     @staticmethod
#     def atomic_increment_usage(user_id: int, increment: int, db: Session) -> bool:
#         row = db.execute(
#             text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM users WHERE id=:uid FOR UPDATE"),
#             {"uid": user_id},
#         ).fetchone()
#         if not row:
#             return False

#         tier, used, tracked_month = row[0] or "free", row[1], row[2]
#         current_month = datetime.utcnow().strftime("%Y-%m")
#         if tracked_month != current_month:
#             used = 0

#         limit = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
#         if limit != -1 and (used + increment) > limit:
#             db.rollback()
#             return False

#         db.execute(
#             text("UPDATE users SET keyword_tracker_used=COALESCE(keyword_tracker_used,0)+:inc, keyword_tracker_month=:m WHERE id=:uid"),
#             {"inc": increment, "m": current_month, "uid": user_id},
#         )
#         db.commit()
#         return True

#     def ingest_seller_data(
#         self,
#         db: Session,
#         seller_id: str,
#         user_email: str,
#         user_id: Optional[int] = None,
#         country: str = "US",
#         page: int = 1
#     ) -> List[TrackedProduct]:
#         """
#         Full orchestration of fetching seller products, reviews, 
#         checking limits, and migrating data to DB.
#         """
#         log_file = os.path.join(BASE_DIR, "ingestion_debug.log")
#         with open(log_file, "a") as f:
#             f.write(f"\n[{datetime.utcnow()}] [ingest] START: seller_id={seller_id}, user_email={user_email}, country={country}\n")
        
#         # Update user status to SYNCING
#         if user_id:
#             db.query(User).filter(User.id == user_id).update({"seller_sync_status": "SYNCING"})
#             db.commit()
        
#         try:
#             # 1. Fetch products from Amazon API
#             params = {"seller_id": seller_id, "country": country, "page": page, "sort_by": "RELEVANCE"}
            
#             # Debugging info
#             print(f"\n[DEBUG] --- AMAZON API REQUEST ---")
#             print(f"[DEBUG] URL: {AMAZON_API_URL}")
#             print(f"[DEBUG] Params: {params}")
            
#             resp = requests.get(
#                 AMAZON_API_URL, 
#                 headers=HEADERS,
#                 params=params, 
#                 timeout=20
#             )
            
#             print(f"[DEBUG] Status: {resp.status_code}")
#             try:
#                 resp_json = resp.json()
#                 print(f"[DEBUG] Response: {json.dumps(resp_json, indent=2)}")
                
#                 with open(log_file, "a") as f:
#                     f.write(f"[{datetime.utcnow()}] [ingest] API RESPONSE: {json.dumps(resp_json)}\n")
#             except Exception as json_err:
#                 print(f"[DEBUG] Failed to parse JSON: {json_err}")
#                 print(f"[DEBUG] Raw Text: {resp.text}")

#             resp.raise_for_status()
#             seller_products = resp.json().get("data", {}).get("seller_products", [])
#             with open(log_file, "a") as f:
#                 f.write(f"[{datetime.utcnow()}] [ingest] API SUCCESS: Found {len(seller_products)} products\n")

#             if not seller_products:
#                 if user_id:
#                     db.query(User).filter(User.id == user_id).update({"seller_sync_status": "COMPLETED"})
#                     db.commit()
#                 return []

#             # 2. Check which are new to the user
#             new_asins = []
#             for item in seller_products:
#                 existing = db.query(TrackedProduct).filter(
#                     TrackedProduct.seller_id == seller_id,
#                     TrackedProduct.asin == item["asin"],
#                     TrackedProduct.user_email == user_email,
#                 ).first()
#                 if not existing:
#                     new_asins.append(item["asin"])

#             # 3. Handle limits if user_id provided
#             if user_id and new_asins:
#                 ok = self.atomic_increment_usage(user_id, len(new_asins), db)
#                 if not ok:
#                     usage = self.check_keyword_tracker_limit(user_id, db)
#                     # Bypass limit for development/debugging purposes as requested
#                     # if user_id:
#                     #     db.query(User).filter(User.id == user_id).update({"seller_sync_status": "FAILED"})
#                     #     db.commit()
                    
#                     with open(log_file, "a") as f:
#                         f.write(f"[{datetime.utcnow()}] [ingest] LIMIT REACHED (BYPASSED): user_id={user_id}, usage={usage['count']}/{usage['limit']}\n")
#                     # return [] # Bypassed to allow all products to be stored

#             # 4. Fetch Reviews
#             comments, ratings = self.fetch_seller_reviews(seller_id, country)
#             comments_json = json.dumps(comments) if comments else None
#             ratings_json  = json.dumps(ratings)  if ratings  else None

#             saved_products = []
#             for item in seller_products:
#                 asin = item.get("asin")
#                 # A. Update/Create TrackedProduct
#                 existing = db.query(TrackedProduct).filter(
#                     TrackedProduct.seller_id == seller_id,
#                     TrackedProduct.asin == asin,
#                     TrackedProduct.user_email == user_email,
#                 ).first()
                
#                 if existing:
#                     existing.review_comments = comments_json
#                     existing.review_ratings  = ratings_json
#                     existing.product_price = item.get("product_price", "")
#                     existing.product_star_rating = item.get("product_star_rating", "")
#                     existing.product_star_rating_numeric = self.extract_numeric(item.get("product_star_rating", ""))
#                     existing.product_num_ratings = item.get("product_num_ratings", 0)
#                     existing.is_prime = item.get("is_prime", False)
#                     existing.is_best_seller = item.get("is_best_seller", False)
#                     existing.sales_volume = item.get("sales_volume", "")
#                     db.commit()
#                     db.refresh(existing)
#                     saved_products.append(existing)
#                 else:
#                     new_tp = TrackedProduct(
#         seller_id=seller_id, asin=asin,
#         product_title=item.get("product_title", "Unknown"),
#         product_photo=item.get("product_photo", ""),
#         product_url=item.get("product_url", ""),
#         product_price=item.get("product_price", ""),
#         product_original_price=item.get("product_original_price", ""),
#         currency=item.get("currency", ""),
#         product_star_rating=item.get("product_star_rating", ""),
#         product_star_rating_numeric=self.extract_numeric(item.get("product_star_rating", "")),
#         product_num_ratings=item.get("product_num_ratings", 0),
#         product_num_offers=item.get("product_num_offers", 0),
#         product_minimum_offer_price=item.get("product_minimum_offer_price", ""),
#         is_best_seller=item.get("is_best_seller", False),
#         is_amazon_choice=item.get("is_amazon_choice", False),
#         is_prime=item.get("is_prime", False),
#         climate_pledge_friendly=item.get("climate_pledge_friendly", False),
#         sales_volume=item.get("sales_volume", ""),
#         delivery=item.get("delivery", ""),
#         has_variations=item.get("has_variations", False),
#         unit_price=item.get("unit_price", ""),
#         country=country, user_email=user_email,
#         review_comments=comments_json, review_ratings=ratings_json,
#     )
#                     print(f"[DEBUG] Storing new TrackedProduct: {asin}")
#                     db.add(new_tp)
#                     db.commit()
#                     db.refresh(new_tp)
#                     saved_products.append(new_tp)

#                 # B. Update RapidapiAmazonProducts (Marketplace stats)
#                 if asin:
#                     r_prod = db.query(RapidapiAmazonProducts).filter(RapidapiAmazonProducts.asin == asin).first()
                    
#                     price_str = item.get("product_price", "")
#                     star_str = item.get("product_star_rating", "")
#                     num_ratings = item.get("product_num_ratings", 0)
#                     if isinstance(num_ratings, str):
#                         num_ratings = int(re.sub(r'[^\d]', '', num_ratings) or 0)

#                     data_dict = {
#                         "product_title": item.get("product_title", ""),
#                         "product_photo": item.get("product_photo", ""),
#                         "product_url": item.get("product_url", ""),
#                         "product_price": price_str,
#                         "product_price_numeric": self.extract_numeric(price_str),
#                         "product_star_rating": star_str,
#                         "product_star_rating_numeric": self.extract_numeric(star_str),
#                         "product_num_ratings": num_ratings,
#                         "is_prime": item.get("is_prime", False),
#                         "is_best_seller": item.get("is_best_seller", False),
#                     }

#                     if r_prod:
#                         for key, value in data_dict.items():
#                             setattr(r_prod, key, value)
#                     else:
#                         new_r_prod = RapidapiAmazonProducts(asin=asin, **data_dict)
#                         db.add(new_r_prod)
                    
#                     db.commit()

#             # Final status update
#             if user_id:
#                 db.query(User).filter(User.id == user_id).update({"seller_sync_status": "COMPLETED"})
#                 db.commit()

#             return saved_products

#         except Exception as e:
#             with open(log_file, "a") as f:
#                 f.write(f"[{datetime.utcnow()}] [ingest] CRITICAL ERROR: {str(e)}\n")
#             if user_id:
#                 db.query(User).filter(User.id == user_id).update({"seller_sync_status": "FAILED"})
#                 db.commit()
#             # Do not re-raise in background tasks to avoid console tracebacks



import os
import requests
import json
import re
from datetime import datetime
from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from app.models import legacy_models as models
from app.models.legacy_models import TrackedProduct, RapidapiAmazonProducts, User
from app.models.schema_v2 import UserProfile, UserBusinessInfo
from dotenv import load_dotenv
from pathlib import Path

# ─────────────────────────────────────────
# CONFIG & CONSTANTS
# ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=True)

RAPIDAPI_KEY  = os.environ.get("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.environ.get("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
AMAZON_API_URL         = "https://real-time-amazon-data.p.rapidapi.com/seller-products"
AMAZON_REVIEWS_API_URL = "https://real-time-amazon-data.p.rapidapi.com/seller-reviews"
AMAZON_PROFILE_API_URL = "https://real-time-amazon-data.p.rapidapi.com/seller-profile"  # ← NEW

HEADERS = {
    "X-RapidAPI-Key":  RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
}

KEYWORD_TRACKER_LIMITS = {
    "free":       2,
    "basic":      10,
    "premium":    -1,
    "enterprise": -1,
}

class SellerInboundService:
    @staticmethod
    def extract_numeric(val: Any) -> float:
        if val is None:
            return 0.0
        if isinstance(val, (int, float)):
            return float(val)
        num_str = re.sub(r'[^\d.]', '', str(val))
        try:
            return float(num_str) if num_str else 0.0
        except (ValueError, TypeError):
            return 0.0

    @staticmethod
    def fetch_seller_reviews(seller_id: str, country: str):
        """
        Returns comments, ratings, authors, dates, has_response lists.
        """
        try:
            resp = requests.get(
                AMAZON_REVIEWS_API_URL,
                headers=HEADERS,
                params={"seller_id": seller_id, "country": country, "page": 1, "star_rating": "ALL"},
                timeout=20,
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") != "OK":
                return [], [], [], [], []
            reviews = data.get("data", {}).get("seller_reviews", [])
            comments     = [r.get("review_comment", "")      for r in reviews]
            ratings      = [r.get("review_star_rating", 0)   for r in reviews]
            authors      = [r.get("review_author", "")       for r in reviews]  # ← NEW
            dates        = [r.get("review_date", "")         for r in reviews]  # ← NEW
            has_response = [r.get("has_response", False)     for r in reviews]  # ← NEW
            return comments, ratings, authors, dates, has_response
        except Exception as e:
            print(f"[SellerInboundService][reviews] error: {e}")
            return [], [], [], [], []

    @staticmethod
    def fetch_seller_profile(seller_id: str, country: str) -> dict:
        """
        Fetches seller name, logo, links, phone, business info, rating.
        Returns empty dict on failure.
        """
        try:
            resp = requests.get(
                AMAZON_PROFILE_API_URL,
                headers=HEADERS,
                params={"seller_id": seller_id, "country": country},
                timeout=20,
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("status") != "OK":
                print(f"[SellerInboundService][profile] non-OK status: {data.get('status')}")
                return {}
            profile = data.get("data", {})
            return {
                "seller_name":          profile.get("name"),
                "seller_logo":          profile.get("logo"),
                "seller_link":          profile.get("seller_link"),
                "store_link":           profile.get("store_link"),
                "seller_phone":         profile.get("phone"),
                "business_name":        profile.get("business_name"),
                "business_address":     profile.get("business_address"),
                "seller_rating":        profile.get("rating"),
                "seller_ratings_total": profile.get("ratings_total"),
            }
        except Exception as e:
            print(f"[SellerInboundService][profile] error: {e}")
            return {}

    @staticmethod
    def check_keyword_tracker_limit(user_id: int, db: Session) -> dict:
        row = db.execute(
            text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM user_subscriptions WHERE user_id=:uid"),
            {"uid": user_id},
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        tier, used, tracked_month = row[0] or "free", row[1], row[2]
        current_month = datetime.utcnow().strftime("%Y-%m")

        if tracked_month != current_month:
            db.execute(
                text("UPDATE user_subscriptions SET keyword_tracker_used=0, keyword_tracker_month=:m WHERE user_id=:uid"),
                {"m": current_month, "uid": user_id},
            )
            db.commit()
            used = 0

        limit     = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
        remaining = (limit - used) if limit != -1 else -1
        return {"count": used, "limit": limit, "remaining": remaining, "subscription_tier": tier}

    @staticmethod
    def atomic_increment_usage(user_id: int, increment: int, db: Session) -> bool:
        row = db.execute(
            text("SELECT subscription_tier, COALESCE(keyword_tracker_used,0), keyword_tracker_month FROM user_subscriptions WHERE user_id=:uid FOR UPDATE"),
            {"uid": user_id},
        ).fetchone()
        if not row:
            return False

        tier, used, tracked_month = row[0] or "free", row[1], row[2]
        current_month = datetime.utcnow().strftime("%Y-%m")
        if tracked_month != current_month:
            used = 0

        limit = KEYWORD_TRACKER_LIMITS.get(tier.lower(), KEYWORD_TRACKER_LIMITS["free"])
        if limit != -1 and (used + increment) > limit:
            db.rollback()
            return False

        db.execute(
            text("UPDATE user_subscriptions SET keyword_tracker_used=COALESCE(keyword_tracker_used,0)+:inc, keyword_tracker_month=:m WHERE user_id=:uid"),
            {"inc": increment, "m": current_month, "uid": user_id},
        )
        db.commit()
        return True

    def ingest_seller_data(
        self,
        db: Session,
        seller_id: str,
        user_email: str,
        user_id: Optional[int] = None,
        country: str = "US",
        page: int = 1
    ) -> List[TrackedProduct]:
        """
        Full orchestration: fetches seller products + profile + reviews,
        then saves everything to DB.
        """
        log_file = os.path.join(BASE_DIR, "ingestion_debug.log")
        with open(log_file, "a") as f:
            f.write(f"\n[{datetime.utcnow()}] [ingest] START: seller_id={seller_id}, user_email={user_email}, country={country}\n")

        # Update user status to SYNCING
        if user_id:
            db.query(User).filter(User.id == user_id).update({"seller_sync_status": "SYNCING"})
            db.commit()

        try:
            # ── 1. Fetch Products (Paginated & Dynamic) ────────────────────────
            import time
            seller_products = []
            seen_asins = set()
            current_page = page
            
            while current_page <= 100:  # Safety guardrail to prevent infinite runs
                # Apply a small delay between calls to respect API rate limits
                if current_page > page:
                    time.sleep(1)

                params = {"seller_id": seller_id, "country": country, "page": current_page, "sort_by": "RELEVANCE"}
                print(f"\n[DEBUG] --- AMAZON PRODUCTS REQUEST (PAGE {current_page}) ---")
                print(f"[DEBUG] URL: {AMAZON_API_URL} | Params: {params}")

                resp = requests.get(AMAZON_API_URL, headers=HEADERS, params=params, timeout=20)
                print(f"[DEBUG] Products status (Page {current_page}): {resp.status_code}")

                try:
                    resp_json = resp.json()
                    with open(log_file, "a") as f:
                        f.write(f"[{datetime.utcnow()}] [ingest] PRODUCTS RESPONSE (PAGE {current_page}): {json.dumps(resp_json)}\n")
                except Exception as json_err:
                    print(f"[DEBUG] Failed to parse JSON on page {current_page}: {json_err} | Raw: {resp.text}")
                    break

                if not resp.ok:
                    print(f"[DEBUG] Products request failed on page {current_page} with status {resp.status_code}")
                    break

                page_products = resp_json.get("data", {}).get("seller_products", [])
                if not page_products:
                    print(f"[DEBUG] No products found on page {current_page}. Stopping pagination.")
                    break

                # Filter duplicates to prevent infinite loops (in case the API keeps returning the same page)
                new_products_found = False
                for item in page_products:
                    asin = item.get("asin")
                    if asin and asin not in seen_asins:
                        seen_asins.add(asin)
                        seller_products.append(item)
                        new_products_found = True

                print(f"[DEBUG] Fetched {len(page_products)} products from page {current_page}. Unique new: {new_products_found}")

                if not new_products_found:
                    print(f"[DEBUG] No new products found on page {current_page}. Stopping pagination.")
                    break

                if len(page_products) < 10:
                    print(f"[DEBUG] Page {current_page} returned {len(page_products)} products (< 10). Assuming last page.")
                    break

                current_page += 1

            with open(log_file, "a") as f:
                f.write(f"[{datetime.utcnow()}] [ingest] Found total {len(seller_products)} products across pages\n")

            if not seller_products:
                if user_id:
                    db.query(User).filter(User.id == user_id).update({"seller_sync_status": "COMPLETED"})
                    db.commit()
                return []

            # ── 2. Fetch Seller Profile (NEW) ──────────────────────────────────
            print(f"\n[DEBUG] --- AMAZON PROFILE REQUEST ---")
            profile_data = self.fetch_seller_profile(seller_id, country)
            print(f"[DEBUG] Profile data: {profile_data}")
            with open(log_file, "a") as f:
                f.write(f"[{datetime.utcnow()}] [ingest] PROFILE DATA: {json.dumps(profile_data)}\n")

            # ── 3. Fetch Reviews ───────────────────────────────────────────────
            print(f"\n[DEBUG] --- AMAZON REVIEWS REQUEST ---")
            comments, ratings, authors, dates, has_response = self.fetch_seller_reviews(seller_id, country)
            print(f"[DEBUG] Fetched {len(comments)} reviews")

            comments_json     = json.dumps(comments)     if comments     else None
            ratings_json      = json.dumps(ratings)      if ratings      else None
            authors_json      = json.dumps(authors)      if authors      else None      # ← NEW
            dates_json        = json.dumps(dates)        if dates        else None      # ← NEW
            has_response_json = json.dumps(has_response) if has_response else None     # ← NEW

            # ── 4. Check new ASINs & limits ───────────────────────────────────
            new_asins = []
            for item in seller_products:
                existing = db.query(TrackedProduct).filter(
                    TrackedProduct.seller_id == seller_id,
                    TrackedProduct.asin == item["asin"],
                    TrackedProduct.user_email == user_email,
                ).first()
                if not existing:
                    new_asins.append(item["asin"])

            if user_id and new_asins:
                ok = self.atomic_increment_usage(user_id, len(new_asins), db)
                if not ok:
                    usage = self.check_keyword_tracker_limit(user_id, db)
                    with open(log_file, "a") as f:
                        f.write(f"[{datetime.utcnow()}] [ingest] LIMIT REACHED (BYPASSED): user_id={user_id}, usage={usage['count']}/{usage['limit']}\n")

            # ── 5. Save to DB ──────────────────────────────────────────────────
            saved_products = []
            for item in seller_products:
                asin = item.get("asin")

                existing = db.query(TrackedProduct).filter(
                    TrackedProduct.seller_id == seller_id,
                    TrackedProduct.asin == asin,
                    TrackedProduct.user_email == user_email,
                ).first()

                if existing:
                    # Update product fields
                    existing.product_price                = item.get("product_price", "")
                    existing.product_star_rating          = item.get("product_star_rating", "")
                    existing.product_star_rating_numeric  = self.extract_numeric(item.get("product_star_rating", ""))
                    existing.product_num_ratings          = item.get("product_num_ratings", 0)
                    existing.is_prime                     = item.get("is_prime", False)
                    existing.is_best_seller               = item.get("is_best_seller", False)
                    existing.sales_volume                 = item.get("sales_volume", "")
                    # Update review fields
                    existing.review_comments              = comments_json
                    existing.review_ratings               = ratings_json
                    existing.review_authors               = authors_json       # ← NEW
                    existing.review_dates                 = dates_json         # ← NEW
                    existing.review_has_response          = has_response_json  # ← NEW
                    # Update seller profile fields (NEW)
                    existing.seller_name                  = profile_data.get("seller_name")
                    existing.seller_logo                  = profile_data.get("seller_logo")
                    existing.seller_link                  = profile_data.get("seller_link")
                    existing.store_link                   = profile_data.get("store_link")
                    existing.seller_phone                 = profile_data.get("seller_phone")
                    existing.business_name                = profile_data.get("business_name")
                    existing.business_address             = profile_data.get("business_address")
                    existing.seller_rating                = profile_data.get("seller_rating")
                    existing.seller_ratings_total         = profile_data.get("seller_ratings_total")

                    db.commit()
                    db.refresh(existing)
                    saved_products.append(existing)

                else:
                    new_tp = TrackedProduct(
                        seller_id=seller_id,
                        asin=asin,
                        product_title=item.get("product_title", "Unknown"),
                        product_photo=item.get("product_photo", ""),
                        product_url=item.get("product_url", ""),
                        product_price=item.get("product_price", ""),
                        product_original_price=item.get("product_original_price", ""),
                        currency=item.get("currency", ""),
                        product_star_rating=item.get("product_star_rating", ""),
                        product_star_rating_numeric=self.extract_numeric(item.get("product_star_rating", "")),
                        product_num_ratings=item.get("product_num_ratings", 0),
                        product_num_offers=item.get("product_num_offers", 0),
                        product_minimum_offer_price=item.get("product_minimum_offer_price", ""),
                        is_best_seller=item.get("is_best_seller", False),
                        is_amazon_choice=item.get("is_amazon_choice", False),
                        is_prime=item.get("is_prime", False),
                        climate_pledge_friendly=item.get("climate_pledge_friendly", False),
                        sales_volume=item.get("sales_volume", ""),
                        delivery=item.get("delivery", ""),
                        has_variations=item.get("has_variations", False),
                        unit_price=item.get("unit_price", ""),
                        country=country,
                        user_email=user_email,
                        # Review fields
                        review_comments=comments_json,
                        review_ratings=ratings_json,
                        review_authors=authors_json,           # ← NEW
                        review_dates=dates_json,               # ← NEW
                        review_has_response=has_response_json, # ← NEW
                        # Seller profile fields (NEW)
                        seller_name=profile_data.get("seller_name"),
                        seller_logo=profile_data.get("seller_logo"),
                        seller_link=profile_data.get("seller_link"),
                        store_link=profile_data.get("store_link"),
                        seller_phone=profile_data.get("seller_phone"),
                        business_name=profile_data.get("business_name"),
                        business_address=profile_data.get("business_address"),
                        seller_rating=profile_data.get("seller_rating"),
                        seller_ratings_total=profile_data.get("seller_ratings_total"),
                    )
                    print(f"[DEBUG] Storing new TrackedProduct: {asin}")
                    db.add(new_tp)
                    db.commit()
                    db.refresh(new_tp)
                    saved_products.append(new_tp)

                # RapidapiAmazonProducts intentionally NOT written here.
                # Seller-fetched products belong only in TrackedProduct (user-scoped).
                # Explorer/market catalogue writes happen through separate Explorer flows.

            # ── Done ───────────────────────────────────────────────────────────
            if user_id:
                db.query(UserBusinessInfo).filter(UserBusinessInfo.user_id == user_id).update({"seller_sync_status": "COMPLETED"})
                db.commit()

            return saved_products

        except Exception as e:
            db.rollback()
            with open(log_file, "a") as f:
                f.write(f"[{datetime.utcnow()}] [ingest] CRITICAL ERROR: {str(e)}\n")
            if user_id:
                db.query(UserBusinessInfo).filter(UserBusinessInfo.user_id == user_id).update({"seller_sync_status": "FAILED"})
                db.commit()