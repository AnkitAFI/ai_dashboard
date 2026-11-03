import os
import sys
import asyncio
import logging
import httpx
import csv
import io
import gzip
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Set

# Ensure parent directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import (
    UserSubscription,
    AmazonSPAPICredential,
    AmazonSPAPIListingItem,
    AmazonSPAPIListingSyncQueue
)
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ListingSyncWorker]: %(message)s"
)
logger = logging.getLogger("ListingSyncWorker")

AMAZON_TOKEN_URL = "https://api.amazon.com/auth/o2/token"
SP_API_ENDPOINT = "https://sellingpartnerapi-eu.amazon.com"
MARKETPLACE_ID_IN = "A21TJRUUN4KGV"

# Strict Amazon SP-API Rate Limit Protections (Reports 2021-06-30)
# createReport limit: 0.0167 req/s (1 every 60s) application-wide across all sellers.
REPORT_CREATE_DELAY = 65.0       # Delay between createReport calls
REPORT_POLL_INTERVAL = 60.0      # Safe polling interval
INTER_ACCOUNT_DELAY = 70.0       # Guaranteed inter-account pacing to prevent 429 burst exhaustion
MAX_RETRIES = 3

async def get_access_token(refresh_token: str) -> str:
    """Exchange LWA refresh token for fresh SP-API access token."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            AMAZON_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.AMAZON_SP_API_LWA_CLIENT_ID,
                "client_secret": settings.AMAZON_SP_API_LWA_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        return response.json()["access_token"]

async def request_report(access_token: str, report_type: str) -> Optional[str]:
    """Request an Amazon report adhering to rate limits and exponential backoff."""
    headers = {
        "x-amz-access-token": access_token,
        "Content-Type": "application/json"
    }
    payload = {
        "reportType": report_type,
        "marketplaceIds": [MARKETPLACE_ID_IN]
    }
    
    backoff = REPORT_CREATE_DELAY
    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(MAX_RETRIES):
            response = await client.post(
                f"{SP_API_ENDPOINT}/reports/2021-06-30/reports",
                json=payload,
                headers=headers
            )
            if response.status_code == 202:
                return response.json().get("reportId")
            elif response.status_code == 429:
                jitter = random.uniform(2.0, 10.0)
                wait_time = backoff + jitter
                logger.warning(f"Rate limited (429) creating {report_type}. Backing off {wait_time:.1f}s (attempt {attempt+1}/{MAX_RETRIES}).")
                await asyncio.sleep(wait_time)
                backoff *= 2
            else:
                logger.error(f"Failed to create report {report_type}: {response.status_code} - {response.text}")
                return None
    return None

async def poll_report_document_id(access_token: str, report_id: str) -> Optional[str]:
    """Poll report until status is DONE and return document ID."""
    headers = {"x-amz-access-token": access_token}
    async with httpx.AsyncClient(timeout=30.0) as client:
        for _ in range(15):  # Max 15 mins wait
            await asyncio.sleep(REPORT_POLL_INTERVAL)
            response = await client.get(
                f"{SP_API_ENDPOINT}/reports/2021-06-30/reports/{report_id}",
                headers=headers
            )
            if response.status_code == 429:
                await asyncio.sleep(15.0)
                continue
            if response.status_code != 200:
                continue
                
            data = response.json()
            status = data.get("processingStatus")
            if status == "DONE":
                return data.get("reportDocumentId")
            elif status in ["FATAL", "CANCELLED"]:
                logger.warning(f"Report {report_id} ended with status: {status}")
                return None
    return None

async def download_report_content(access_token: str, report_document_id: str) -> Optional[str]:
    """Download report document from pre-signed S3 URL and decompress if GZIP."""
    headers = {"x-amz-access-token": access_token}
    async with httpx.AsyncClient(timeout=60.0) as client:
        doc_res = await client.get(
            f"{SP_API_ENDPOINT}/reports/2021-06-30/documents/{report_document_id}",
            headers=headers
        )
        if doc_res.status_code != 200:
            return None
        doc_info = doc_res.json()
        
        s3_url = doc_info.get("url")
        compression = doc_info.get("compressionAlgorithm")
        
        s3_res = await client.get(s3_url)
        if s3_res.status_code != 200:
            return None
            
        content_bytes = s3_res.content
        if compression == "GZIP":
            content_bytes = gzip.decompress(content_bytes)
        return content_bytes.decode("utf-8", errors="replace")

def compute_listing_health_score(
    title: str,
    bullets: List[str],
    description: str,
    search_terms: str,
    has_image: bool,
    is_suppressed: bool
) -> int:
    """Deterministic 0-100 Listing Health Score calculation."""
    if is_suppressed:
        # Severe penalty for search-suppressed listings
        score = 25
        return max(0, score)
        
    score = 0
    # Title scoring (max 25 pts)
    title_len = len(title.strip()) if title else 0
    if 100 <= title_len <= 200:
        score += 25
    elif 50 <= title_len < 100 or 200 < title_len <= 250:
        score += 15
    elif title_len > 0:
        score += 5

    # Bullet points scoring (max 25 pts)
    bullets_count = len([b for b in (bullets or []) if b and b.strip()])
    if bullets_count >= 5:
        score += 25
    elif bullets_count >= 3:
        score += 15
    elif bullets_count >= 1:
        score += 5

    # Description scoring (max 15 pts)
    desc_len = len(description.strip()) if description else 0
    if desc_len >= 250:
        score += 15
    elif desc_len > 0:
        score += 8

    # Backend Search Terms byte utilization (max 20 pts)
    byte_count = len(search_terms.encode("utf-8")) if search_terms else 0
    if 180 <= byte_count <= 250:
        score += 20
    elif 80 <= byte_count < 180:
        score += 12
    elif byte_count > 0:
        score += 5

    # Main Image Presence (max 15 pts)
    if has_image:
        score += 15

    return min(100, score)

def detect_keyword_overlap(title: str, search_terms: str) -> tuple[bool, List[str], int]:
    """Detect keywords in backend generic keywords that already appear in Title."""
    if not title or not search_terms:
        byte_len = len(search_terms.encode("utf-8")) if search_terms else 0
        return False, [], byte_len
        
    import re
    title_words = set(re.findall(r'\b[a-zA-Z0-9]{3,}\b', title.lower()))
    search_words = re.findall(r'\b[a-zA-Z0-9]{3,}\b', search_terms.lower())
    
    overlaps = [w for w in search_words if w in title_words]
    unique_overlaps = sorted(list(set(overlaps)))
    byte_len = len(search_terms.encode("utf-8"))
    
    return len(unique_overlaps) > 0, unique_overlaps, byte_len

async def sync_catalog_for_account(db, cred: AmazonSPAPICredential):
    """Pulls listings and defect reports for a single selling partner."""
    logger.info(f"Starting catalog listing sync for SP_ID: {cred.selling_partner_id}")
    
    access_token = await get_access_token(cred.refresh_token)
    
    # 1. Request Active Merchant Listings Report
    all_report_id = await request_report(access_token, "GET_MERCHANT_LISTINGS_ALL_DATA")
    if not all_report_id:
        logger.warning(f"Failed to initiate GET_MERCHANT_LISTINGS_ALL_DATA for {cred.selling_partner_id}")
        return

    # Wait mandatory buffer to prevent bursting Amazon's application limit
    await asyncio.sleep(REPORT_CREATE_DELAY)

    # 2. Request Defects / Suppressed Report
    defect_report_id = await request_report(access_token, "GET_MERCHANT_LISTINGS_DEFECTS_DATA")

    # Poll Document IDs
    all_doc_id = await poll_report_document_id(access_token, all_report_id)
    defect_doc_id = None
    if defect_report_id:
        defect_doc_id = await poll_report_document_id(access_token, defect_report_id)

    if not all_doc_id:
        logger.warning(f"Could not retrieve document for listings of {cred.selling_partner_id}")
        return

    # Parse Defects to map suppressed SKUs
    suppressed_skus: Dict[str, List[str]] = {}
    if defect_doc_id:
        defect_content = await download_report_content(access_token, defect_doc_id)
        if defect_content:
            reader = csv.DictReader(io.StringIO(defect_content), delimiter='\t')
            for row in reader:
                sku = row.get("Seller SKU") or row.get("seller-sku")
                alert_type = row.get("Alert Type") or row.get("alert-type") or "DEFECT"
                if sku:
                    if sku not in suppressed_skus:
                        suppressed_skus[sku] = []
                    suppressed_skus[sku].append(alert_type)

    # Parse Master Catalog Listings
    listings_content = await download_report_content(access_token, all_doc_id)
    if not listings_content:
        logger.warning(f"Empty listings content for {cred.selling_partner_id}")
        return

    reader = csv.DictReader(io.StringIO(listings_content), delimiter='\t')
    count = 0
    now = datetime.now(timezone.utc)

    for row in reader:
        sku = row.get("seller-sku") or row.get("Seller SKU")
        asin = row.get("asin1") or row.get("ASIN") or row.get("asin")
        title = row.get("item-name") or row.get("Item Name") or ""
        description = row.get("item-description") or ""
        image_url = row.get("image-url") or None
        product_type = row.get("product-type") or "PRODUCT"
        
        if not sku or not asin:
            continue

        # Check suppression
        is_supp = sku in suppressed_skus
        supp_reasons = suppressed_skus.get(sku, [])

        # Backend search terms (from report if present, or existing record)
        search_terms = row.get("keywords") or ""
        has_overlap, overlaps, byte_len = detect_keyword_overlap(title, search_terms)

        health_score = compute_listing_health_score(
            title=title,
            bullets=[],
            description=description,
            search_terms=search_terms,
            has_image=bool(image_url),
            is_suppressed=is_supp
        )

        # Upsert into PostgreSQL
        existing = db.query(AmazonSPAPIListingItem).filter(
            AmazonSPAPIListingItem.user_id == cred.user_id,
            AmazonSPAPIListingItem.selling_partner_id == cred.selling_partner_id,
            AmazonSPAPIListingItem.sku == sku
        ).first()

        if not existing:
            existing = AmazonSPAPIListingItem(
                user_id=cred.user_id,
                selling_partner_id=cred.selling_partner_id,
                sku=sku,
                asin=asin
            )
            db.add(existing)

        existing.product_type = product_type
        existing.title = title
        existing.description = description
        existing.main_image_url = image_url
        existing.health_score = health_score
        existing.is_suppressed = is_supp
        existing.suppression_reasons = supp_reasons
        existing.search_term_bytes = byte_len
        existing.has_title_keyword_overlap = has_overlap
        existing.wasted_overlap_words = overlaps
        existing.last_synced_at = now
        count += 1

    db.commit()
    logger.info(f"Successfully synced {count} listings for store {cred.selling_partner_id}.")

async def main():
    """Main worker entry point executed by production crontab (#10 in cron stack)."""
    logger.info("Initializing ListingSyncWorker background loop...")
    db = SessionLocal()
    
    try:
        # STRICT TIER GATING: Filter ONLY Premium, Enterprise, and Trial stores.
        # Free and Basic stores are never queried, preserving 70-80% of SP-API application quota.
        active_creds = (
            db.query(AmazonSPAPICredential)
            .join(UserSubscription, UserSubscription.user_id == AmazonSPAPICredential.user_id)
            .filter(
                UserSubscription.subscription_tier.in_(["premium", "enterprise", "trial"]),
                AmazonSPAPICredential.sync_status.in_(["COMPLETED", "PENDING"])
            )
            .all()
        )

        logger.info(f"Discovered {len(active_creds)} eligible premium seller account(s) for catalog sync.")

        for cred in active_creds:
            try:
                await sync_catalog_for_account(db, cred)
            except Exception as e:
                logger.error(f"Error syncing catalog for {cred.selling_partner_id}: {str(e)}", exc_info=True)
            
            # MANDATORY SCALE PROTECTION: Sleep 70 seconds between stores.
            # Guarantees application stays strictly below Amazon's 0.0167 req/s rate limit.
            logger.info(f"Sleeping {INTER_ACCOUNT_DELAY}s before processing next store...")
            await asyncio.sleep(INTER_ACCOUNT_DELAY)

    finally:
        db.close()
        logger.info("ListingSyncWorker execution completed.")

if __name__ == "__main__":
    asyncio.run(main())

