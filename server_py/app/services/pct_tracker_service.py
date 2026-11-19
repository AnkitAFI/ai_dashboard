import io
import re
import csv
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.pct_models import (
    PctTrackedItem, PctPriceSnapshot, PctPriceHistory, PctQuotaUsage, PctWallet
)
from app.services import pct_quota_service, pct_price_service
from app.core.cryptography import EncryptedString

logger = logging.getLogger(__name__)
_crypto = EncryptedString()

ASIN_REGEX = re.compile(r"^[A-Z0-9]{10}$", re.IGNORECASE)

def _clean_asin(val: Any) -> Optional[str]:
    if val is None:
        return None
    s = str(val).strip().upper()
    if ASIN_REGEX.match(s):
        return s
    return None


def parse_excel(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Parses an uploaded Excel (.xlsx, .xls) or CSV sheet.
    Column 1: Our ASIN
    Columns 2..11: Competitor ASINs (up to 10)
    """
    rows = []
    # If file is a zip/xlsx archive (magic bytes PK\x03\x04)
    if file_bytes.startswith(b"PK\x03\x04"):
        try:
            import openpyxl
        except ImportError:
            logger.error("openpyxl is not installed in the python environment.")
            raise HTTPException(
                status_code=500,
                detail="Excel parsing library (openpyxl) is not installed on the server. Please install it."
            )
        try:
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
            sheet = wb.active
            rows = list(sheet.iter_rows(values_only=True))
        except Exception as e:
            logger.error(f"Error reading Excel workbook: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to read Excel workbook: {str(e)}")
    else:
        # File is CSV / plain text
        text = ""
        for encoding in ("utf-8-sig", "utf-8", "latin-1"):
            try:
                text = file_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if text:
            reader = csv.reader(io.StringIO(text))
            rows = list(reader)

    if not rows:
        return []

    # Check if first row is a header (e.g. contains words like 'asin' or 'our')
    start_idx = 0
    first_row_str = " ".join([str(c or "").lower() for c in rows[0]])
    if "asin" in first_row_str or "competitor" in first_row_str or "our" in first_row_str:
        start_idx = 1

    parsed_rows = []
    for r_idx in range(start_idx, len(rows)):
        row_vals = rows[r_idx]
        if not row_vals or all(v is None or str(v).strip() == "" for v in row_vals):
            continue

        our_asin = _clean_asin(row_vals[0])
        if not our_asin:
            continue

        comp_asins = []
        for c in row_vals[1:11]:  # up to 10 competitors
            clean_c = _clean_asin(c)
            if clean_c and clean_c != our_asin and clean_c not in comp_asins:
                comp_asins.append(clean_c)

        if comp_asins:
            parsed_rows.append({
                "row_num": r_idx + 1,
                "our_asin": our_asin,
                "competitor_asins": comp_asins
            })

    return parsed_rows


def process_upload(
    user_id: int,
    tier: Optional[str],
    file_bytes: bytes,
    sheet_name: str,
    country: str,
    db: Session
) -> Dict[str, Any]:
    """
    Processes an uploaded Excel sheet:
    - 1 credit charged per row (not per ASIN) only if fresh API fetch needed.
    - Cache hit < 24h = 0 credits charged.
    """
    norm_tier = (tier or "free").lower()
    limits = pct_quota_service.get_tier_limits(norm_tier)
    if limits["credits"] == 0:
        raise HTTPException(
            status_code=403,
            detail="Price Comparison Tracker is locked for Free tier. Please upgrade to a paid plan."
        )

    parsed_rows = parse_excel(file_bytes)
    if not parsed_rows:
        raise HTTPException(
            status_code=400,
            detail="No valid ASIN rows found. Ensure Column 1 has your 10-character ASIN and Columns 2-11 have competitor ASINs."
        )

    created_count = 0
    updated_count = 0
    failed_rows = []

    for r in parsed_rows:
        try:
            our_asin = r["our_asin"]
            comp_asins = r["competitor_asins"]
            all_row_asins = [our_asin] + comp_asins

            # 1. Fetch data for all ASINs in this row (cached vs miss)
            # First check if any ASIN is uncached
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(hours=24)
            
            has_uncached = False
            for a in all_row_asins:
                snap = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == a,
                    PctPriceSnapshot.country == country,
                    PctPriceSnapshot.fetched_at > cutoff,
                    PctPriceSnapshot.product_title.isnot(None),
                    ~PctPriceSnapshot.product_title.startswith("ASIN ")
                ).first()
                if not snap:
                    has_uncached = True
                    break

            # 2. If API call is needed, verify user has quota or wallet credit
            if has_uncached:
                can_proceed, credit_source = pct_quota_service.can_fetch(user_id, norm_tier, db)
                if not can_proceed:
                    failed_rows.append({
                        "row_num": r["row_num"],
                        "our_asin": our_asin,
                        "reason": "Credits exhausted. Purchase additional credits to continue."
                    })
                    continue

                # Fetch fresh data via batch API
                results, api_called = pct_price_service.fetch_batch_and_cache(all_row_asins, country, db)
                if api_called:
                    pct_quota_service.deduct_credit(user_id, credit_source, db)
            else:
                # All cached! Free of charge
                pct_price_service.fetch_batch_and_cache(all_row_asins, country, db)

            # 3. Insert or update tracker item
            existing_item = db.query(PctTrackedItem).filter(
                PctTrackedItem.user_id == user_id,
                PctTrackedItem.our_asin == our_asin
            ).first()

            if existing_item:
                existing_item.competitor_asins = comp_asins
                existing_item.sheet_name = sheet_name
                existing_item.country = country
                existing_item.is_active = True
                existing_item.updated_at = now
                if existing_item.alert_competitor_asins is None:
                    existing_item.alert_competitor_asins = []
                updated_count += 1
            else:
                new_item = PctTrackedItem(
                    user_id=user_id,
                    sheet_name=sheet_name,
                    our_asin=our_asin,
                    competitor_asins=comp_asins,
                    alert_competitor_asins=[],  # Default empty: all alerts OFF/muted on upload
                    country=country,
                    alert_enabled=False,        # Master alert OFF by default
                    alert_threshold=5.0,
                    is_active=True
                )
                db.add(new_item)
                created_count += 1

            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing row {r.get('row_num')}: {e}")
            failed_rows.append({
                "row_num": r.get("row_num", 0),
                "our_asin": r.get("our_asin", "Unknown"),
                "reason": "Unable to sync product information from Amazon."
            })

    quota = pct_quota_service.get_or_create_quota(user_id, norm_tier, db)
    wallet = pct_quota_service.get_or_create_wallet(user_id, db)
    credits_remaining = max(0, limits["credits"] - quota.credits_used)

    return {
        "success": True,
        "total_rows_parsed": len(parsed_rows),
        "created_count": created_count,
        "updated_count": updated_count,
        "failed_count": len(failed_rows),
        "failed_rows": failed_rows,
        "credits_remaining": credits_remaining,
        "wallet_balance": wallet.balance
    }


def get_trackers_with_prices(user_id: int, db: Session) -> List[Dict[str, Any]]:
    """
    Returns all active tracked items for the authenticated user with latest prices.
    Strictly tenant isolated (WHERE user_id = :user_id).
    """
    items = db.query(PctTrackedItem).filter(
        PctTrackedItem.user_id == user_id,
        PctTrackedItem.is_active == True
    ).order_by(PctTrackedItem.created_at.desc()).all()

    output = []
    for item in items:
        # Get our product snapshot
        our_snap = db.query(PctPriceSnapshot).filter(
            PctPriceSnapshot.asin == item.our_asin,
            PctPriceSnapshot.country == item.country
        ).first()

        our_price = float(our_snap.product_price) if (our_snap and our_snap.product_price is not None) else None

        competitors_data = []
        min_comp_price = None
        min_comp_asin = None

        alert_comps = item.alert_competitor_asins if item.alert_competitor_asins is not None else []
        alert_comps_set = set(alert_comps)

        for c_asin in (item.competitor_asins or []):
            c_snap = db.query(PctPriceSnapshot).filter(
                PctPriceSnapshot.asin == c_asin,
                PctPriceSnapshot.country == item.country
            ).first()

            c_price = float(c_snap.product_price) if (c_snap and c_snap.product_price is not None) else None
            
            diff_pct = None
            if our_price and c_price and our_price > 0:
                diff_pct = round(((our_price - c_price) / our_price) * 100.0, 1)

            if c_price is not None:
                if min_comp_price is None or c_price < min_comp_price:
                    min_comp_price = c_price
                    min_comp_asin = c_asin

            c_raw = c_snap.raw_data or {} if c_snap else {}
            competitors_data.append({
                "asin": c_asin,
                "title": c_snap.product_title if c_snap else f"ASIN {c_asin}",
                "photo": c_snap.product_photo if c_snap else None,
                "url": c_snap.product_url if c_snap else f"https://www.amazon.in/dp/{c_asin}",
                "price": c_price,
                "original_price": c_raw.get("product_original_price"),
                "currency": c_snap.currency if c_snap else (our_snap.currency if our_snap else "INR"),
                "is_prime": c_snap.is_prime if c_snap else False,
                "is_amazon_choice": c_snap.is_amazon_choice if c_snap else False,
                "availability": (c_snap.availability if c_snap else None) or c_raw.get("product_availability"),
                "buy_box_seller": (c_raw.get("main_buy_box") or {}).get("seller"),
                "offers_count": c_raw.get("product_num_offers"),
                "star_rating": float(c_snap.star_rating) if (c_snap and c_snap.star_rating is not None) else None,
                "num_ratings": c_snap.num_ratings if c_snap else None,
                "diff_pct": diff_pct,
                "alert_active": bool(item.alert_enabled and (c_asin in alert_comps_set)),
            })

        cheapest_diff_pct = None
        if our_price and min_comp_price and our_price > 0:
            cheapest_diff_pct = round(((our_price - min_comp_price) / our_price) * 100.0, 1)

        # Decrypt alert emails for response
        dec_emails = []
        if item.alert_emails:
            for enc in item.alert_emails:
                try:
                    dec = _crypto.process_result_value(enc, None)
                    if dec:
                        dec_emails.append(dec)
                except Exception:
                    dec_emails.append(enc)

        output.append({
            "id": item.id,
            "sheet_name": item.sheet_name,
            "our_asin": item.our_asin,
            "our_product": {
                "title": our_snap.product_title if our_snap else f"ASIN {item.our_asin}",
                "photo": our_snap.product_photo if our_snap else None,
                "url": our_snap.product_url if our_snap else f"https://www.amazon.in/dp/{item.our_asin}",
                "price": our_price,
                "original_price": (our_snap.raw_data or {}).get("product_original_price") if our_snap else None,
                "currency": our_snap.currency if our_snap else "INR",
                "is_prime": our_snap.is_prime if our_snap else False,
                "is_amazon_choice": our_snap.is_amazon_choice if our_snap else False,
                "availability": (our_snap.availability if our_snap else None) or ((our_snap.raw_data or {}).get("product_availability") if our_snap else None),
                "buy_box_seller": ((our_snap.raw_data or {}).get("main_buy_box") or {}).get("seller") if our_snap else None,
                "offers_count": (our_snap.raw_data or {}).get("product_num_offers") if our_snap else None,
                "star_rating": float(our_snap.star_rating) if (our_snap and our_snap.star_rating is not None) else None,
                "num_ratings": our_snap.num_ratings if our_snap else None,
                "last_fetched": our_snap.fetched_at.isoformat() if (our_snap and our_snap.fetched_at) else None,
            },
            "competitors_count": len(item.competitor_asins or []),
            "competitors": competitors_data,
            "cheapest_competitor": {
                "asin": min_comp_asin,
                "price": min_comp_price,
                "diff_pct": cheapest_diff_pct
            },
            "country": item.country,
            "alert_enabled": item.alert_enabled,
            "alert_threshold": float(item.alert_threshold) if item.alert_threshold is not None else 5.0,
            "alert_emails": dec_emails,
            "alert_competitor_asins": alert_comps,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        })

    return output


def get_tracker_detail(tracker_id: int, user_id: int, db: Session) -> Dict[str, Any]:
    """
    Returns complete details of a single tracked item + 30-day price history for charts.
    Returns 404 (not 403) on ownership mismatch to prevent enumeration attacks.
    """
    item = db.query(PctTrackedItem).filter(
        PctTrackedItem.id == tracker_id,
        PctTrackedItem.user_id == user_id,
        PctTrackedItem.is_active == True
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")

    # Get our snapshot
    our_snap = db.query(PctPriceSnapshot).filter(
        PctPriceSnapshot.asin == item.our_asin,
        PctPriceSnapshot.country == item.country
    ).first()

    our_price = float(our_snap.product_price) if (our_snap and our_snap.product_price is not None) else None

    # Get price history for our ASIN (preserved permanently)
    our_history = db.query(PctPriceHistory).filter(
        PctPriceHistory.asin == item.our_asin,
        PctPriceHistory.country == item.country
    ).order_by(PctPriceHistory.recorded_at.asc()).all()

    alert_comps = item.alert_competitor_asins if item.alert_competitor_asins is not None else []
    alert_comps_set = set(alert_comps)
    competitors = []

    for c_asin in (item.competitor_asins or []):
        c_snap = db.query(PctPriceSnapshot).filter(
            PctPriceSnapshot.asin == c_asin,
            PctPriceSnapshot.country == item.country
        ).first()

        c_price = float(c_snap.product_price) if (c_snap and c_snap.product_price is not None) else None
        
        diff_pct = None
        if our_price and c_price and our_price > 0:
            diff_pct = round(((our_price - c_price) / our_price) * 100.0, 1)

        # Price history for competitor (preserved permanently)
        c_history = db.query(PctPriceHistory).filter(
            PctPriceHistory.asin == c_asin,
            PctPriceHistory.country == item.country
        ).order_by(PctPriceHistory.recorded_at.asc()).all()

        c_raw = c_snap.raw_data or {} if c_snap else {}
        competitors.append({
            "asin": c_asin,
            "title": c_snap.product_title if c_snap else f"ASIN {c_asin}",
            "photo": c_snap.product_photo if c_snap else None,
            "url": c_snap.product_url if c_snap else f"https://www.amazon.in/dp/{c_asin}",
            "price": c_price,
            "original_price": c_raw.get("product_original_price"),
            "currency": c_snap.currency if c_snap else (our_snap.currency if our_snap else "INR"),
            "is_prime": c_snap.is_prime if c_snap else False,
            "is_amazon_choice": c_snap.is_amazon_choice if c_snap else False,
            "availability": (c_snap.availability if c_snap else None) or c_raw.get("product_availability"),
            "buy_box_seller": (c_raw.get("main_buy_box") or {}).get("seller"),
            "offers_count": c_raw.get("product_num_offers"),
            "star_rating": float(c_snap.star_rating) if (c_snap and c_snap.star_rating is not None) else None,
            "num_ratings": c_snap.num_ratings if c_snap else None,
            "diff_pct": diff_pct,
            "alert_active": bool(item.alert_enabled and (c_asin in alert_comps_set)),
            "history": [
                {"date": h.recorded_at.strftime("%Y-%m-%d"), "price": float(h.price)}
                for h in c_history if h.price is not None
            ]
        })

    dec_emails = []
    if item.alert_emails:
        for enc in item.alert_emails:
            try:
                dec = _crypto.process_result_value(enc, None)
                if dec:
                    dec_emails.append(dec)
            except Exception:
                dec_emails.append(enc)

    return {
        "id": item.id,
        "sheet_name": item.sheet_name,
        "our_asin": item.our_asin,
        "our_product": {
            "title": our_snap.product_title if our_snap else f"ASIN {item.our_asin}",
            "photo": our_snap.product_photo if our_snap else None,
            "url": our_snap.product_url if our_snap else f"https://www.amazon.in/dp/{item.our_asin}",
            "price": our_price,
            "original_price": (our_snap.raw_data or {}).get("product_original_price") if our_snap else None,
            "currency": our_snap.currency if our_snap else "INR",
            "is_prime": our_snap.is_prime if our_snap else False,
            "is_amazon_choice": our_snap.is_amazon_choice if our_snap else False,
            "availability": (our_snap.availability if our_snap else None) or ((our_snap.raw_data or {}).get("product_availability") if our_snap else None),
            "buy_box_seller": ((our_snap.raw_data or {}).get("main_buy_box") or {}).get("seller") if our_snap else None,
            "offers_count": (our_snap.raw_data or {}).get("product_num_offers") if our_snap else None,
            "star_rating": float(our_snap.star_rating) if (our_snap and our_snap.star_rating is not None) else None,
            "num_ratings": our_snap.num_ratings if our_snap else None,
            "last_fetched": our_snap.fetched_at.isoformat() if (our_snap and our_snap.fetched_at) else None,
            "history": [
                {"date": h.recorded_at.strftime("%Y-%m-%d"), "price": float(h.price)}
                for h in our_history if h.price is not None
            ]
        },
        "competitors": competitors,
        "country": item.country,
        "alert_enabled": item.alert_enabled,
        "alert_threshold": float(item.alert_threshold) if item.alert_threshold is not None else 5.0,
        "alert_emails": dec_emails,
        "alert_competitor_asins": alert_comps,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


def delete_tracker(tracker_id: int, user_id: int, db: Session) -> bool:
    """Soft deletes the tracked product row for this user."""
    item = db.query(PctTrackedItem).filter(
        PctTrackedItem.id == tracker_id,
        PctTrackedItem.user_id == user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")

    item.is_active = False
    db.commit()
    return True


def refresh_tracker(tracker_id: int, user_id: int, tier: Optional[str], db: Session) -> Dict[str, Any]:
    """
    Manually refreshes prices for a tracked product.
    If cached < 24h: returns cached data with 0 credits charged.
    If stale > 24h: checks quota/wallet and deducts 1 credit.
    """
    item = db.query(PctTrackedItem).filter(
        PctTrackedItem.id == tracker_id,
        PctTrackedItem.user_id == user_id,
        PctTrackedItem.is_active == True
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")

    norm_tier = (tier or "free").lower()
    all_asins = [item.our_asin] + (item.competitor_asins or [])

    # Check if any ASIN is stale (> 24 hours)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    needs_api = False
    for a in all_asins:
        snap = db.query(PctPriceSnapshot).filter(
            PctPriceSnapshot.asin == a,
            PctPriceSnapshot.country == item.country,
            PctPriceSnapshot.fetched_at > cutoff
        ).first()
        if not snap:
            needs_api = True
            break

    if needs_api:
        can_proceed, credit_source = pct_quota_service.can_fetch(user_id, norm_tier, db)
        if not can_proceed:
            raise HTTPException(
                status_code=402,
                detail="Monthly credits and wallet balance exhausted. Please top up your PCT wallet to refresh."
            )

        results, api_called = pct_price_service.fetch_batch_and_cache(all_asins, item.country, db)
        if api_called:
            pct_quota_service.deduct_credit(user_id, credit_source, db)
    else:
        # Cache hit — 0 credits
        pct_price_service.fetch_batch_and_cache(all_asins, item.country, db)

    item.updated_at = now
    db.commit()

    return get_tracker_detail(tracker_id, user_id, db)


def update_alert(
    tracker_id: int,
    user_id: int,
    alert_enabled: Optional[bool],
    alert_threshold: Optional[float],
    alert_emails: Optional[List[str]],
    alert_competitor_asins: Optional[List[str]],
    db: Session
) -> Dict[str, Any]:
    """
    Updates alert settings for a tracked product.
    Supports individual competitor ON/OFF toggles via alert_competitor_asins.
    """
    item = db.query(PctTrackedItem).filter(
        PctTrackedItem.id == tracker_id,
        PctTrackedItem.user_id == user_id,
        PctTrackedItem.is_active == True
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Tracker item not found")

    if alert_enabled is not None:
        item.alert_enabled = alert_enabled
        if not alert_enabled and alert_competitor_asins is None:
            item.alert_competitor_asins = []

    if alert_threshold is not None:
        item.alert_threshold = alert_threshold

    if alert_emails is not None:
        # Encrypt each email with AES-256-GCM
        enc_list = [_crypto.process_bind_param(e.strip(), None) for e in alert_emails if e.strip()]
        item.alert_emails = enc_list

    if alert_competitor_asins is not None:
        # Filter to only valid competitor ASINs for this item
        valid_set = set(item.competitor_asins or [])
        clean_comps = [c for c in alert_competitor_asins if c in valid_set]
        item.alert_competitor_asins = clean_comps
        if alert_enabled is None:
            item.alert_enabled = len(clean_comps) > 0

    item.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"success": True, "message": "Alert configuration updated successfully"}
