import os
import json
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple, Optional
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy.orm import Session

from app.models.pct_models import PctPriceSnapshot, PctPriceHistory

logger = logging.getLogger(__name__)

# Cache parameters (Database Snapshot Cache)
STALE_HOURS = 24        # Hours before DB snapshot is considered stale

# OpenWebNinja / RapidAPI Config
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
API_BASE_URL = f"https://{RAPIDAPI_HOST}/product-details"

# Rate Limiter: Ultra plan has a 20 req/s limit; limit concurrency to 10
API_SEMAPHORE = asyncio.Semaphore(10)

# Privacy & Minimization: Fields stripped to comply with DPDP/GDPR
PII_FIELDS_TO_STRIP = [
    "top_reviews", "top_reviews_global", "customer_review_media",
    "customer_reviews_count", "reviewer_name", "reviewer_id", "reviewer_avatar"
]

# Bandwidth Minimization: Heavy fields stripped to stay within 10,240MB platform fee quota
UNNECESSARY_FIELDS_TO_STRIP = [
    "product_variations", "all_product_variations", "product_variations_dimensions",
    "sponsored_products", "carousel_products", "frequently_bought_together",
    "delivery_location", "delivery_zipcode", "aplus_images", "aplus_text",
    "product_byline_links", "brand_store_id"
]


def sanitize_api_response(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Strips PII and bulky bloat from raw OpenWebNinja response before storage."""
    strip_keys = set(PII_FIELDS_TO_STRIP + UNNECESSARY_FIELDS_TO_STRIP)
    return {k: v for k, v in raw.items() if k not in strip_keys}


def _snapshot_to_dict(snap: PctPriceSnapshot) -> Dict[str, Any]:
    return {
        "asin": snap.asin,
        "country": snap.country,
        "product_title": snap.product_title,
        "product_price": str(snap.product_price) if snap.product_price is not None else None,
        "product_price_value": float(snap.product_price) if snap.product_price is not None else None,
        "currency": snap.currency,
        "product_photo": snap.product_photo,
        "product_url": snap.product_url,
        "is_prime": snap.is_prime,
        "is_amazon_choice": snap.is_amazon_choice,
        "availability": snap.availability,
        "star_rating": float(snap.star_rating) if snap.star_rating is not None else None,
        "num_ratings": snap.num_ratings,
        "fetched_at": snap.fetched_at.isoformat() if snap.fetched_at else None,
        "raw_data": snap.raw_data or {},
    }


def _store_snapshot_in_db(clean_data: Dict[str, Any], country: str, db: Session) -> PctPriceSnapshot:
    asin = clean_data.get("asin")
    if not asin:
        return None

    now = datetime.now(timezone.utc)
    snap = db.query(PctPriceSnapshot).filter(
        PctPriceSnapshot.asin == asin,
        PctPriceSnapshot.country == country
    ).first()

    price_val = clean_data.get("product_price_value")
    if price_val is None:
        raw_price = clean_data.get("product_price")
        if raw_price:
            import re
            cleaned_num = re.sub(r"[^\d.]", "", str(raw_price))
            price_val = float(cleaned_num) if cleaned_num else None

    if not snap:
        snap = PctPriceSnapshot(asin=asin, country=country)
        db.add(snap)

    new_title = clean_data.get("product_title")
    if new_title:
        snap.product_title = new_title

    snap.product_price = price_val
    snap.currency = clean_data.get("currency", "INR")

    new_photo = clean_data.get("product_photo")
    if new_photo:
        snap.product_photo = new_photo

    new_url = clean_data.get("product_url")
    if new_url:
        snap.product_url = new_url
    snap.is_prime = bool(clean_data.get("is_prime", False))
    snap.is_amazon_choice = bool(clean_data.get("is_amazon_choice", False))
    raw_avail = clean_data.get("product_availability")
    snap.availability = " ".join(str(raw_avail).split()) if raw_avail else None
    
    star_raw = clean_data.get("product_star_rating")
    try:
        snap.star_rating = float(star_raw) if star_raw is not None else None
    except (ValueError, TypeError):
        snap.star_rating = None

    snap.num_ratings = clean_data.get("product_num_ratings")
    snap.fetched_at = now
    snap.raw_data = clean_data

    # Append to history
    if price_val is not None:
        db.add(PctPriceHistory(
            asin=asin,
            country=country,
            price=price_val,
            recorded_at=now
        ))

    db.commit()
    db.refresh(snap)
    return snap


def _fetch_single_asin_sync(asin: str, country: str = "IN") -> Tuple[str, Optional[Dict[str, Any]]]:
    key = RAPIDAPI_KEY or os.getenv("RAPIDAPI_KEY", "")
    headers = {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }
    params = {
        "asin": asin,
        "country": country,
        "autoselect_variant": "true",
        "include_offers": "true",
        "language": "en_IN" if country == "IN" else "en_US"
    }
    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.get(API_BASE_URL, headers=headers, params=params)
            if resp.status_code == 200:
                body = resp.json().get("data")
                if isinstance(body, dict):
                    return asin, sanitize_api_response(body)
    except Exception as e:
        logger.error(f"Error fetching ASIN {asin} from OpenWebNinja: {e}")
    return asin, None


def call_openwebninja_sync(asins: List[str], country: str = "IN") -> Dict[str, Dict[str, Any]]:
    """
    Fetches details for multiple ASINs in parallel using ThreadPoolExecutor.
    OpenWebNinja /product-details requires individual ASIN queries.
    """
    if not asins:
        return {}

    unique_asins = list(dict.fromkeys(asins[:15]))
    results = {}
    max_workers = min(len(unique_asins), 10)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_fetch_single_asin_sync, a, country): a for a in unique_asins}
        for future in as_completed(futures):
            try:
                asin, data = future.result()
                if data:
                    results[asin] = data
            except Exception as e:
                logger.error(f"Thread error fetching ASIN: {e}")

    return results


async def _fetch_single_asin_async(asin: str, country: str, client: httpx.AsyncClient) -> Tuple[str, Optional[Dict[str, Any]]]:
    key = RAPIDAPI_KEY or os.getenv("RAPIDAPI_KEY", "")
    headers = {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }
    params = {
        "asin": asin,
        "country": country,
        "autoselect_variant": "true",
        "include_offers": "true",
        "language": "en_IN" if country == "IN" else "en_US"
    }
    async with API_SEMAPHORE:
        try:
            resp = await client.get(API_BASE_URL, headers=headers, params=params)
            if resp.status_code == 200:
                body = resp.json().get("data")
                if isinstance(body, dict):
                    return asin, sanitize_api_response(body)
        except Exception as e:
            logger.error(f"Async error fetching ASIN {asin} from OpenWebNinja: {e}")
    return asin, None


async def call_openwebninja_batch(asins: List[str], country: str = "IN") -> Dict[str, Dict[str, Any]]:
    """
    Asynchronous call to OpenWebNinja API with Semaphore rate limiting.
    Fetches each ASIN individually in parallel.
    """
    if not asins:
        return {}

    unique_asins = list(dict.fromkeys(asins[:15]))
    results = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = [_fetch_single_asin_async(a, country, client) for a in unique_asins]
        fetched = await asyncio.gather(*tasks)
        for asin, data in fetched:
            if data:
                results[asin] = data

    return results


def get_or_fetch(asin: str, country: str, db: Session) -> Tuple[Dict[str, Any], bool]:
    """
    Database persistent cache + OpenWebNinja API fallback.
    Returns: (product_dict, is_cache_hit)
    If is_cache_hit is True, 0 credits are charged.
    """
    clean_asin = asin.strip().upper()

    # ── Database Cache (pct_price_snapshots) ─────────────────────────
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=STALE_HOURS)
    snap = db.query(PctPriceSnapshot).filter(
        PctPriceSnapshot.asin == clean_asin,
        PctPriceSnapshot.country == country,
        PctPriceSnapshot.fetched_at > cutoff,
        PctPriceSnapshot.product_title.isnot(None),
        ~PctPriceSnapshot.product_title.startswith("ASIN ")
    ).first()

    if snap:
        return _snapshot_to_dict(snap), True

    # ── OpenWebNinja API Fetch ───────────────────────────────────────
    api_results = call_openwebninja_sync([clean_asin], country)
    clean_data = api_results.get(clean_asin)

    if clean_data:
        saved_snap = _store_snapshot_in_db(clean_data, country, db)
        if saved_snap:
            return _snapshot_to_dict(saved_snap), False

    # Fallback to stale DB snapshot if API fails or empty
    stale_snap = db.query(PctPriceSnapshot).filter(
        PctPriceSnapshot.asin == clean_asin,
        PctPriceSnapshot.country == country
    ).first()

    if stale_snap:
        stale_dict = _snapshot_to_dict(stale_snap)
        stale_dict["is_stale"] = True
        return stale_dict, True  # Stale data returned for free

    # No data available
    return {
        "asin": clean_asin,
        "country": country,
        "product_title": f"ASIN {clean_asin}",
        "product_price": None,
        "product_price_value": None,
        "availability": "Data unavailable",
        "is_stale": True,
    }, True


def fetch_batch_and_cache(
    asins: List[str],
    country: str,
    db: Session
) -> Tuple[Dict[str, Dict[str, Any]], bool]:
    """
    Processes a list of ASINs for a single tracker row relying exclusively on PostgreSQL pct_price_snapshots.
    Returns: (results_by_asin, any_api_call_made: bool)
    If any_api_call_made is False, 0 credits are charged!
    """
    results: Dict[str, Dict[str, Any]] = {}
    misses: List[str] = []

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=STALE_HOURS)

    # 1. Check PostgreSQL Database Cache (pct_price_snapshots)
    for raw_asin in asins:
        asin = raw_asin.strip().upper()
        snap = db.query(PctPriceSnapshot).filter(
            PctPriceSnapshot.asin == asin,
            PctPriceSnapshot.country == country,
            PctPriceSnapshot.fetched_at > cutoff,
            PctPriceSnapshot.product_title.isnot(None),
            ~PctPriceSnapshot.product_title.startswith("ASIN ")
        ).first()

        if snap:
            results[asin] = _snapshot_to_dict(snap)
        else:
            misses.append(asin)

    if not misses:
        # All ASINs were found in database cache! Zero API requests made!
        return results, False

    # 2. Batch fetch misses via OpenWebNinja (up to 10 per call)
    api_called = False
    for i in range(0, len(misses), 10):
        batch = misses[i:i + 10]
        api_data = call_openwebninja_sync(batch, country)
        api_called = True

        for asin in batch:
            clean = api_data.get(asin)
            if clean:
                snap = _store_snapshot_in_db(clean, country, db)
                if snap:
                    results[asin] = _snapshot_to_dict(snap)
            else:
                # Fallback to stale DB if exists
                stale = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == asin,
                    PctPriceSnapshot.country == country
                ).first()
                if stale:
                    d = _snapshot_to_dict(stale)
                    d["is_stale"] = True
                    results[asin] = d
                else:
                    results[asin] = {
                        "asin": asin,
                        "country": country,
                        "product_title": f"ASIN {asin}",
                        "product_price": None,
                        "product_price_value": None,
                        "availability": "Unavailable",
                        "is_stale": True,
                    }

    return results, api_called
