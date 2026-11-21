import os
import json
import logging
import asyncio
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple, Optional
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from sqlalchemy.orm import Session

from app.models.pct_models import PctTrackedItem, PctPriceSnapshot, PctPriceHistory

logger = logging.getLogger(__name__)

# Cache parameters (Database Snapshot Cache)
STALE_HOURS = 24        # Hours before DB snapshot is considered stale

# OpenWebNinja / RapidAPI Config
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "real-time-amazon-data.p.rapidapi.com")
API_BASE_URL = f"https://{RAPIDAPI_HOST}/product-details"
SEARCH_BASE_URL = f"https://{RAPIDAPI_HOST}/search"

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


def _extract_carousel_candidates(raw: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extracts compact candidate ASINs, titles, and prices from raw carousel data."""
    carousel_raw = raw.get("carousel_products")
    if not carousel_raw:
        return []

    items_to_check: List[Dict[str, Any]] = []
    if isinstance(carousel_raw, list):
        for entry in carousel_raw:
            if isinstance(entry, dict):
                if entry.get("asin"):
                    items_to_check.append(entry)
                elif isinstance(entry.get("products"), list):
                    items_to_check.extend(entry["products"])
                elif isinstance(entry.get("items"), list):
                    items_to_check.extend(entry["items"])
    elif isinstance(carousel_raw, dict):
        for v in carousel_raw.values():
            if isinstance(v, list):
                items_to_check.extend(v)

    seen = set()
    candidates: List[Dict[str, Any]] = []
    for it in items_to_check:
        if isinstance(it, dict) and it.get("asin"):
            cand_asin = str(it.get("asin")).strip().upper()
            if cand_asin and len(cand_asin) == 10 and cand_asin not in seen:
                seen.add(cand_asin)
                candidates.append({
                    "asin": cand_asin,
                    "title": str(it.get("product_title") or it.get("title") or ""),
                    "price": it.get("product_price_value") or it.get("price_value") or it.get("product_price"),
                    "photo": it.get("product_photo") or it.get("photo")
                })
    return candidates


def sanitize_api_response(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Strips PII and bulky bloat from raw OpenWebNinja response before storage, preserving compact carousel candidates."""
    carousel_cands = _extract_carousel_candidates(raw)
    strip_keys = set(PII_FIELDS_TO_STRIP + UNNECESSARY_FIELDS_TO_STRIP)
    cleaned = {k: v for k, v in raw.items() if k not in strip_keys}
    if carousel_cands:
        cleaned["carousel_candidates"] = carousel_cands[:15]
    return cleaned


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
    params: Dict[str, Any] = {
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
    params: Dict[str, Any] = {
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


def is_price_compatible(cand_price: Optional[float], our_price: Optional[float]) -> bool:
    """Verifies candidate price is in a realistic competitor bracket (35% to 250% of our price)."""
    if not our_price or our_price <= 0 or not cand_price or cand_price <= 0:
        return True
    return (0.35 * our_price) <= cand_price <= (2.5 * our_price)


def _extract_brand(our_title: str, raw_data: Dict[str, Any]) -> str:
    """Extracts normalized brand name (e.g. 'sony', 'boat', 'jbl') to filter out self-brand products."""
    prod_info = raw_data.get("product_information") or {}
    for key in ("Brand Name", "Brand", "Manufacturer", "Brand:"):
        val = prod_info.get(key)
        if val and isinstance(val, str) and len(val.strip()) > 1:
            clean_val = val.strip().lower()
            if clean_val not in {"generic", "unknown", "na", "n/a"}:
                return clean_val

    byline = str(raw_data.get("product_byline") or "").strip()
    if byline:
        match = re.search(r"(?:Brand:\s*|Visit the\s+)([\w\s\-]+?)(?:\s+Store|$)", byline, re.IGNORECASE)
        if match:
            b = match.group(1).strip().lower()
            if len(b) > 1 and b not in {"generic", "unknown", "visit", "store"}:
                return b

    # Fallback to first word of title if alphabetic
    if our_title:
        first_word = our_title.strip().split()[0].lower().strip(".,:;-_'\"")
        if len(first_word) >= 3 and not first_word.isdigit() and first_word not in {"the", "new", "all", "pack"}:
            return first_word

    return ""


def _build_search_query(our_title: str, raw_data: Dict[str, Any], asin: str) -> str:
    """Extracts a precise category or keyword query for Amazon product search."""
    prod_info = raw_data.get("product_information") or {}

    # 1. Check Best Sellers Rank for subcategory (e.g. '#127 in In-Ear Headphones')
    bsr = prod_info.get("Best Sellers Rank") or ""
    if bsr:
        match = re.search(r"#\d+[\d,]*\s+in\s+([A-Za-z\s\-]+?)(?:\s*\(|$)", bsr)
        if match:
            cat = match.group(1).strip()
            broad_cats = {"electronics", "home & kitchen", "sports & outdoors", "clothing & accessories", "computers & accessories"}
            if cat.lower() not in broad_cats and len(cat) > 3:
                return cat

    # 2. Check Item Type Name
    item_type = prod_info.get("Item Type Name") or prod_info.get("Item Type")
    if item_type and len(str(item_type).split()) <= 5:
        return str(item_type).strip()

    # 3. Clean product title to core keywords, removing self-brand
    if our_title:
        clean = re.sub(r"[\(\[\{].*?[\)\]\}]", " ", our_title)
        segments = re.split(r"[,|\-:]", clean)
        first_seg = segments[0].strip() if segments else clean
        brand = _extract_brand(our_title, raw_data)
        if brand and first_seg.lower().startswith(brand.lower()):
            first_seg = first_seg[len(brand):].strip()
        words = [w for w in first_seg.split() if not re.match(r"^(v\d|\d+g|\d+mah|bt\d|ip\d)", w, re.I)]
        if words:
            return " ".join(words[:4]).strip()

    return asin


def search_amazon_competitors(
    search_query: str,
    country: str = "IN",
    our_asin: Optional[str] = None,
    our_price: Optional[float] = None,
    our_brand: Optional[str] = None,
    limit: int = 5
) -> List[str]:
    """
    Queries OpenWebNinja /search sorted by BEST_SELLERS to find top competing ASINs.
    Excludes our_asin and products matching our_brand.
    """
    key = RAPIDAPI_KEY or os.getenv("RAPIDAPI_KEY", "")
    headers = {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }
    params: Dict[str, Any] = {
        "query": search_query,
        "country": country,
        "sort_by": "BEST_SELLERS",
        "page": 1,
        "product_condition": "NEW",
        "language": "en_IN" if country == "IN" else "en_US"
    }

    if our_price and our_price > 0:
        params["min_price"] = round(our_price * 0.35, 2)
        params["max_price"] = round(our_price * 2.5, 2)

    found_asins: List[str] = []
    try:
        with httpx.Client(timeout=25.0) as client:
            resp = client.get(SEARCH_BASE_URL, headers=headers, params=params)
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                products = data.get("products", []) if isinstance(data, dict) else []
                for p in products:
                    p_asin = str(p.get("asin") or "").strip().upper()
                    if not p_asin or len(p_asin) != 10 or p_asin == our_asin:
                        continue
                    p_title = str(p.get("product_title") or "").strip().lower()
                    if our_brand and our_brand in p_title:
                        continue
                    price_val = p.get("product_price_value")
                    if price_val:
                        try:
                            if not is_price_compatible(float(price_val), our_price):
                                continue
                        except (ValueError, TypeError):
                            pass
                    if p_asin not in found_asins:
                        found_asins.append(p_asin)
                    if len(found_asins) >= limit:
                        break
    except Exception as e:
        logger.error(f"Error querying OpenWebNinja search for '{search_query}': {e}")

    return found_asins


def discover_competitors(
    our_asin: str,
    country: str,
    db: Session,
    our_data: Optional[Dict[str, Any]] = None
) -> List[str]:
    """
    Automated high-accuracy competitor discovery:
    1. Filters out same-brand products so only true rival brands are selected.
    2. Checks carousel_candidates ('Customers who viewed this item also viewed')
       from our_asin's product details snapshot.
    3. If carousel provides >= 3 valid rival competitors, returns top 3-4.
    4. If carousel has < 3 valid rival competitors, falls back to OpenWebNinja /search sorted by BEST_SELLERS.
    5. Returns 3-4 clean competitor ASINs.
    """
    clean_asin = our_asin.strip().upper()

    if not our_data:
        our_data, _ = get_or_fetch(clean_asin, country, db)

    our_price = our_data.get("product_price_value")
    our_title = our_data.get("product_title") or ""
    raw_data = our_data.get("raw_data") or {}
    our_brand = _extract_brand(our_title, raw_data)

    # ── Phase 0: Check if ANY existing user already tracks this ASIN with competitors ──
    existing_tracker = db.query(PctTrackedItem).filter(
        PctTrackedItem.our_asin == clean_asin,
        PctTrackedItem.country == country,
        PctTrackedItem.competitor_asins.isnot(None)
    ).first()
    if existing_tracker and len(existing_tracker.competitor_asins or []) >= 2:
        # Verify cached competitors are clean rival brands (not same-brand)
        has_same_brand = False
        if our_brand:
            for c_asin in existing_tracker.competitor_asins:
                c_snap = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == c_asin,
                    PctPriceSnapshot.country == country
                ).first()
                if c_snap and c_snap.product_title and our_brand in c_snap.product_title.lower():
                    has_same_brand = True
                    break
        if not has_same_brand:
            logger.info(f"Reusing cached competitor list from existing tracker for {clean_asin}: {existing_tracker.competitor_asins[:5]}")
            return existing_tracker.competitor_asins[:5]

    discovered_asins: List[str] = []
    same_brand_asins: List[str] = []

    # ── Phase 1: Check Carousel Candidates ────────────────────────────
    carousel_candidates = raw_data.get("carousel_candidates") or []
    for cand in carousel_candidates:
        c_asin = str(cand.get("asin") or "").strip().upper()
        if not c_asin or len(c_asin) != 10 or c_asin == clean_asin:
            continue
        c_title = str(cand.get("title") or "").strip().lower()
        c_price = cand.get("price")
        try:
            c_price_float = float(c_price) if c_price else None
        except (ValueError, TypeError):
            c_price_float = None

        if not is_price_compatible(c_price_float, our_price):
            continue

        if our_brand and our_brand in c_title:
            if c_asin not in same_brand_asins:
                same_brand_asins.append(c_asin)
        else:
            if c_asin not in discovered_asins:
                discovered_asins.append(c_asin)
        if len(discovered_asins) >= 5:
            break

    # If carousel gave us 3 to 5 valid rival competitors, return them!
    if len(discovered_asins) >= 3:
        logger.info(f"Auto-discovered {len(discovered_asins)} rival competitors for {clean_asin} from product carousel.")
        return discovered_asins[:5]

    # ── Phase 2: Best Sellers Search Fallback ─────────────────────────
    search_query = _build_search_query(our_title, raw_data, clean_asin)
    if search_query:
        logger.info(f"Carousel had {len(discovered_asins)} rival items; searching OpenWebNinja with query: '{search_query}'")
        search_asins = search_amazon_competitors(
            search_query=search_query,
            country=country,
            our_asin=clean_asin,
            our_price=our_price,
            our_brand=our_brand,
            limit=6
        )
        for s_asin in search_asins:
            if s_asin not in discovered_asins and s_asin != clean_asin:
                discovered_asins.append(s_asin)
            if len(discovered_asins) >= 5:
                break

    # If still fewer than 2 rival competitors, search using subcategory keywords
    if len(discovered_asins) < 2 and search_query != clean_asin:
        asin_search_asins = search_amazon_competitors(
            search_query=clean_asin,
            country=country,
            our_asin=clean_asin,
            our_price=our_price,
            our_brand=our_brand,
            limit=5
        )
        for s_asin in asin_search_asins:
            if s_asin not in discovered_asins and s_asin != clean_asin:
                discovered_asins.append(s_asin)
            if len(discovered_asins) >= 5:
                break

    # Safety Fallback: Only if extreme edge case where no rivals could be found, top up with same_brand
    if len(discovered_asins) < 2 and same_brand_asins:
        for sb in same_brand_asins:
            if sb not in discovered_asins:
                discovered_asins.append(sb)
            if len(discovered_asins) >= 5:
                break

    logger.info(f"Total auto-discovered competitors for {clean_asin}: {discovered_asins[:5]}")
    return discovered_asins[:5][:4]
