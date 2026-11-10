#!/usr/bin/env python3
"""
Amazon Scheduled Listing Background Worker
Processes staged product listings scheduled by sellers for future launch.
Strictly meters API calls to 2.0 RPS and employs Fair-Share Round-Robin
to guarantee developer API keys are never throttled (429) or suspended.
"""

import os
import sys
import asyncio
import logging
import json
from datetime import datetime, timezone
from decimal import Decimal
import httpx

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import (
    AmazonSPAPIScheduledListing,
    AmazonSPAPICredential,
    UserSubscription,
    AmazonSPAPIListingItem,
    AmazonSPAPIListingWalletTransaction,
    AmazonSPAPIAuditLog
)
from app.api.v1.routes.amazon_sp_api_listing_optimizer import (
    get_user_quota_and_wallet,
    get_sp_api_access_token,
    compute_health_score,
    detect_keyword_overlap,
    MARKETPLACE_ID_IN,
    SP_API_ENDPOINT
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ScheduledListingWorker]: %(message)s"
)
logger = logging.getLogger("ScheduledListingWorker")


async def process_due_scheduled_listings():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        due_items = db.query(AmazonSPAPIScheduledListing).filter(
            AmazonSPAPIScheduledListing.status == "SCHEDULED",
            AmazonSPAPIScheduledListing.scheduled_time <= now
        ).order_by(AmazonSPAPIScheduledListing.scheduled_time.asc()).limit(50).all()

        if not due_items:
            logger.info("No scheduled listings due for publishing.")
            return

        logger.info(f"Found {len(due_items)} scheduled listing(s) due for launch.")

        # Fair-Share Round-Robin grouping by selling_partner_id
        from collections import defaultdict
        store_groups = defaultdict(list)
        for it in due_items:
            store_groups[it.selling_partner_id].append(it)

        round_robin_queue = []
        max_len = max(len(items) for items in store_groups.values())
        for idx in range(max_len):
            for sp_id, items in store_groups.items():
                if idx < len(items):
                    round_robin_queue.append(items[idx])

        processed_count = 0
        errors_count = 0

        for item in round_robin_queue:
            item.status = "PUBLISHING"
            db.commit()

            # Strict Rate Limiter sleep: 500ms pause = 2.0 requests per second max (comfortably below Amazon's 5.0 RPS limit)
            await asyncio.sleep(0.5)

            try:
                # 1. Fetch store credentials
                cred = db.query(AmazonSPAPICredential).filter(
                    AmazonSPAPICredential.user_id == item.user_id,
                    AmazonSPAPICredential.selling_partner_id == item.selling_partner_id
                ).first()

                if not cred:
                    item.status = "FAILED"
                    item.error_message = "Store credential disconnected or invalid. Please reconnect your Amazon account."
                    db.commit()
                    errors_count += 1
                    continue

                # 2. Check Quota / Wallet
                user_sub = db.query(UserSubscription).filter(UserSubscription.user_id == item.user_id).first()
                wallet, quota_limit, _, remaining_free, balance = get_user_quota_and_wallet(db, item.user_id, user_sub)

                is_paid_via_wallet = False
                fee_deducted = 0.0

                # Strict tier gate: quota_limit == 0 means plan expired or free tier.
                # Scheduled Launch is a Premium-only feature. No active plan = no publish.
                if quota_limit == 0:
                    item.status = "FAILED"
                    item.error_message = (
                        "Your plan has expired. The Scheduled Launch feature requires an active "
                        "Premium or Enterprise plan. Please reactivate your plan to publish this listing."
                    )
                    db.commit()
                    errors_count += 1
                    logger.warning(
                        f"Skipping scheduled listing {item.id} (SKU: {item.sku}) — "
                        f"user {item.user_id} plan expired. Marked FAILED."
                    )
                    continue

                if remaining_free > 0:
                    # Covered under monthly free allowance
                    wallet.free_listings_used += 1
                else:
                    # Free quota exhausted — charge wallet
                    if balance < 50.0:
                        item.status = "FAILED"
                        item.error_message = (
                            f"Your free monthly listing allowance is used up and your wallet balance "
                            f"is ₹{balance:.2f}. Please add ₹50 to your wallet to publish this listing."
                        )
                        db.commit()
                        errors_count += 1
                        continue
                    wallet.wallet_balance_inr = Decimal(str(wallet.wallet_balance_inr)) - Decimal("50.00")
                    is_paid_via_wallet = True
                    fee_deducted = 50.0

                # 3. Call Amazon SP-API
                access_token = await get_sp_api_access_token(cred.refresh_token)
                p_data = item.payload or {}

                attributes = {
                    "item_name": [{"value": p_data.get("title", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                    "brand": [{"value": p_data.get("brand", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                    "bullet_point": [{"value": b, "marketplace_id": MARKETPLACE_ID_IN} for b in p_data.get("bullets", []) if b.strip()],
                    "description": [{"value": p_data.get("description", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                    "generic_keyword": [{"value": p_data.get("backend_search_terms", ""), "marketplace_id": MARKETPLACE_ID_IN}],
                    "purchasable_offer": [{
                        "currency": "INR",
                        "our_price": [{"schedule": [{"value_with_tax": float(p_data.get("price", 0.0))}]}],
                        "marketplace_id": MARKETPLACE_ID_IN
                    }],
                    "fulfillment_availability": [{
                        "fulfillment_channel_code": "DEFAULT",
                        "quantity": int(p_data.get("initial_quantity", 1))
                    }]
                }

                if p_data.get("barcode_value") and p_data.get("barcode_type") != "exemption":
                    attributes["externally_assigned_product_identifier"] = [{
                        "type": str(p_data.get("barcode_type")).lower(),
                        "value": str(p_data.get("barcode_value")),
                        "marketplace_id": MARKETPLACE_ID_IN
                    }]

                if p_data.get("main_image_url"):
                    attributes["main_product_image_locator"] = [{
                        "media_location": p_data.get("main_image_url"),
                        "marketplace_id": MARKETPLACE_ID_IN
                    }]

                if p_data.get("category_attributes"):
                    for k, v in p_data.get("category_attributes", {}).items():
                        if k not in attributes and v is not None:
                            attributes[k] = [{"value": v, "marketplace_id": MARKETPLACE_ID_IN}]

                put_body = {
                    "productType": item.product_type,
                    "requirements": "LISTING",
                    "attributes": attributes
                }

                put_url = f"{SP_API_ENDPOINT}/listings/2021-08-01/items/{cred.selling_partner_id}/{item.sku}?marketplaceIds={MARKETPLACE_ID_IN}"
                headers = {"x-amz-access-token": access_token, "Content-Type": "application/json"}

                amazon_data = {}
                async with httpx.AsyncClient(timeout=40.0) as client:
                    res = await client.put(put_url, json=put_body, headers=headers)
                    if res.status_code not in [200, 202]:
                        if res.status_code == 429:
                            logger.warning(f"Amazon 429 rate limit reached for SKU {item.sku}. Backing off 5 seconds...")
                            await asyncio.sleep(5.0)
                        raise Exception(f"Amazon rejection ({res.status_code}): {res.text}")
                    amazon_data = res.json()

                # Record Wallet Transaction if applicable
                if is_paid_via_wallet:
                    tx = AmazonSPAPIListingWalletTransaction(
                        user_id=item.user_id,
                        transaction_type="LISTING_CREATION_FEE",
                        amount=Decimal("-50.00"),
                        balance_after=wallet.wallet_balance_inr,
                        sku=item.sku,
                        description=f"Scheduled launch fee for SKU: {item.sku}"
                    )
                    db.add(tx)

                # Update Scheduled item
                item.status = "PUBLISHED"
                item.published_at = datetime.now(timezone.utc)
                item.amazon_submission_id = str(amazon_data.get("submissionId") or "ACCEPTED")
                item.fee_charged = Decimal(str(fee_deducted))
                item.error_message = None

                # Upsert into catalog listing item
                has_ov, ovs, b_len = detect_keyword_overlap(p_data.get("title", ""), p_data.get("backend_search_terms", ""))
                cat_item = db.query(AmazonSPAPIListingItem).filter(
                    AmazonSPAPIListingItem.user_id == item.user_id,
                    AmazonSPAPIListingItem.selling_partner_id == item.selling_partner_id,
                    AmazonSPAPIListingItem.sku == item.sku
                ).first()
                if not cat_item:
                    cat_item = AmazonSPAPIListingItem(
                        user_id=item.user_id,
                        selling_partner_id=item.selling_partner_id,
                        sku=item.sku,
                        asin=p_data.get("barcode_value") or item.sku
                    )
                    db.add(cat_item)
                cat_item.product_type = item.product_type
                cat_item.title = p_data.get("title", "")
                cat_item.bullets = p_data.get("bullets", [])
                cat_item.description = p_data.get("description", "")
                cat_item.backend_search_terms = p_data.get("backend_search_terms", "")
                cat_item.main_image_url = p_data.get("main_image_url")
                cat_item.health_score = compute_health_score(
                    cat_item.title,
                    cat_item.bullets,
                    cat_item.description,
                    cat_item.backend_search_terms,
                    bool(cat_item.main_image_url),
                    False
                )
                cat_item.search_term_bytes = b_len
                cat_item.has_title_keyword_overlap = has_ov
                cat_item.wasted_overlap_words = ovs
                cat_item.last_synced_at = datetime.now(timezone.utc)

                # Audit log
                audit = AmazonSPAPIAuditLog(
                    user_id=item.user_id,
                    selling_partner_id=item.selling_partner_id,
                    action="SCHEDULED_LISTING_AUTO_PUBLISHED",
                    asin=item.sku,
                    new_value=json.dumps({"amazon_response": amazon_data}),
                    ip_address="cron_worker"
                )
                db.add(audit)
                db.commit()
                processed_count += 1
                logger.info(f"Successfully published scheduled SKU {item.sku} for store {item.selling_partner_id}")

            except Exception as e:
                logger.error(f"Error publishing scheduled listing {item.id} for SKU {item.sku}: {e}")
                item.status = "FAILED"
                item.error_message = str(e)[:400]
                db.commit()
                errors_count += 1

        logger.info(f"Done. Processed: {processed_count}, Errors: {errors_count}, Total due: {len(due_items)}")

    except Exception as e:
        logger.error(f"Fatal error in ScheduledListingWorker: {e}", exc_info=True)
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(process_due_scheduled_listings())

