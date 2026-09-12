"""
live_competitor_worker.py

Cron job to process pending ASINs in the live_competitor_results table.
Runs via cron (e.g., every 5 minutes).
Processes a batch of ASINs sequentially to respect Rainforest API limits.
"""

import sys
import os
import logging
import time
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

# Ensure we can import from the main app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.db.models.live_competitor_result_model import LiveCompetitorResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("live_competitor_worker")

RAINFOREST_API_KEY = os.getenv("RAINFOREST_API_KEY")

def fetch_asin_data(asin: str) -> dict:
    """Synchronous fetch from Rainforest API, parsing bank offers."""
    if not RAINFOREST_API_KEY:
        raise Exception("RAINFOREST_API_KEY not set")

    url = (
        f"https://api.rainforestapi.com/request"
        f"?api_key={RAINFOREST_API_KEY}&type=product&amazon_domain=amazon.in"
        f"&asin={asin}&customer_zipcode=110011&include_html=true"
    )
    
    with httpx.Client(timeout=30.0) as client:
        res = client.get(url)
        
    if res.status_code != 200:
        raise Exception(f"Rainforest API error: {res.status_code} {res.text[:200]}")
        
    data = res.json()
    product = data.get("product")
    if not product:
        raise Exception("No product data found")

    buybox = product.get("buybox_winner") or {}
    fulfillment = buybox.get("fulfillment") or {}
    seller = buybox.get("third_party_seller") or fulfillment.get("third_party_seller") or {}

    mrp = (buybox.get("rrp") or {}).get("value") or (buybox.get("price") or {}).get("value")
    price = (buybox.get("price") or {}).get("value")
    coupons = product.get("coupon_text")
    is_fba = fulfillment.get("is_fulfilled_by_amazon", False)

    is_sold_by_amazon = fulfillment.get("is_sold_by_amazon", False)
    seller_name = seller.get("name")
    if is_sold_by_amazon:
        buy_box_winner = "Amazon"
    elif seller_name:
        buy_box_winner = seller_name
    else:
        buy_box_winner = "Unknown"

    delivery_110011 = (fulfillment.get("standard_delivery") or {}).get("date")

    bank_offers = None
    html_content = data.get("html")
    if html_content:
        try:
            soup = BeautifulSoup(html_content, "html.parser")
            collected = []
            for header in soup.find_all("h6", class_="offers-items-title"):
                if header.get_text(strip=True).lower() == "bank offer":
                    parent = header.find_parent(class_="offers-items")
                    if parent:
                        for offer_el in parent.select(".offers-items-content .a-truncate-full"):
                            text = offer_el.get_text(strip=True)
                            if text:
                                collected.append(text)
                        if not collected:
                            for offer_el in parent.select(".offers-items-content span.a-truncate-cut"):
                                text = offer_el.get_text(strip=True)
                                if text:
                                    collected.append(text)
                    break
            if collected:
                bank_offers = collected
        except Exception as e:
            logger.warning(f"Bank offer parsing failed for {asin}: {e}")

    return {
        "mrp": mrp,
        "price": price,
        "buyBoxWinner": buy_box_winner,
        "sellerName": seller_name,
        "isFba": is_fba,
        "delivery110011": delivery_110011,
        "coupons": coupons,
        "bankOffers": bank_offers,
    }

def run_worker():
    logger.info("Starting live competitor worker...")
    db: Session = SessionLocal()
    
    try:
        # Get up to 100 pending ASINs
        pending_records = db.query(LiveCompetitorResult).filter(
            LiveCompetitorResult.fetch_status == "pending"
        ).limit(100).all()
        
        if not pending_records:
            logger.info("No pending ASINs found. Exiting.")
            return

        logger.info(f"Found {len(pending_records)} pending ASINs. Processing...")
        
        for record in pending_records:
            logger.info(f"Fetching ASIN: {record.asin} (User: {record.user_id})")
            
            try:
                # Fetch data
                data = fetch_asin_data(record.asin)
                
                # Update record
                record.mrp = data["mrp"]
                record.price = data["price"]
                record.buy_box_winner = data["buyBoxWinner"]
                record.seller_name = data["sellerName"]
                record.is_fba = data["isFba"]
                record.delivery_110011 = data["delivery110011"]
                record.coupons = data["coupons"]
                record.bank_offers = data["bankOffers"]
                record.fetch_status = "success"
                record.error_msg = None
                
                logger.info(f"Success: {record.asin}")
                
            except Exception as e:
                logger.error(f"Failed to fetch {record.asin}: {e}")
                record.fetch_status = "error"
                record.error_msg = str(e)[:499]
                
            # Commit after each one so progress is saved
            db.commit()
            
            # Sleep 1 second to respect Rainforest API rate limits (Free tier)
            time.sleep(1)
            
    except Exception as e:
        logger.error(f"Worker crashed: {e}")
    finally:
        db.close()
        logger.info("Worker finished.")

if __name__ == "__main__":
    run_worker()
