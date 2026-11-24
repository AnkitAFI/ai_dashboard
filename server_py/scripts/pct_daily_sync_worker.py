import os
import sys
import asyncio
import logging
from datetime import datetime, timezone, timedelta

# Ensure server_py root is on sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import UserSubscription, UserAuth
from app.models.pct_models import PctTrackedItem, PctPriceSnapshot, PctPriceHistory, PctAlertLog
from app.services.pct_price_service import call_openwebninja_batch, sanitize_api_response, _store_snapshot_in_db
from app.services.pct_alert_service import check_and_send_alerts
from app.services import pct_quota_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [PCT_WORKER]: %(message)s"
)
logger = logging.getLogger(__name__)

async def process_daily_sync():
    logger.info("Starting Price Comparison Tracker daily sync...")
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # 1. SUBSCRIPTION GUARD: Process only active paid/trial users
        active_subscriptions = db.query(UserSubscription).filter(
            UserSubscription.subscription_tier.in_(["starter", "basic", "premium", "enterprise", "trial"])
        ).all()

        valid_user_ids = set()
        user_tiers = {}
        for sub in active_subscriptions:
            # Check user is active and not soft-deleted
            auth = db.query(UserAuth).filter(UserAuth.id == sub.user_id, UserAuth.is_active == True).first()
            if not auth:
                continue

            if not sub.subscription_expires_at or sub.subscription_expires_at > now:
                valid_user_ids.add(sub.user_id)
                user_tiers[sub.user_id] = (sub.subscription_tier or "starter").lower()

        if not valid_user_ids:
            logger.info("No active paid users with Price Comparison Tracker enabled. Exiting.")
            return

        logger.info(f"Found {len(valid_user_ids)} eligible active user(s).")

        # 2. COLLECT ACTIVE ASINs FOR ELIGIBLE USERS
        active_items = db.query(PctTrackedItem).filter(
            PctTrackedItem.user_id.in_(list(valid_user_ids)),
            PctTrackedItem.is_active == True
        ).all()

        if not active_items:
            logger.info("No active tracked items found. Exiting.")
            return

        # 3. REFRESH STALE ROWS & DEDUCT 1 CREDIT PER ROW REFRESHED (> 24 hours old)
        cutoff = now - timedelta(hours=24)
        logger.info(f"Checking {len(active_items)} active tracked product row(s) for 24h refresh...")

        refreshed_rows_count = 0
        skipped_rows_count = 0

        for item in active_items:
            country = item.country or "IN"
            tier = user_tiers.get(item.user_id, "starter")
            row_asins = [item.our_asin] + (item.competitor_asins or [])[:5]

            # Find which ASINs in this row are older than 24 hours (or not cached)
            stale_asins = []
            for asin in row_asins:
                snap = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == asin,
                    PctPriceSnapshot.country == country,
                    PctPriceSnapshot.fetched_at > cutoff,
                    PctPriceSnapshot.product_title.isnot(None),
                    ~PctPriceSnapshot.product_title.startswith("ASIN ")
                ).first()
                if not snap:
                    stale_asins.append(asin)

            if not stale_asins:
                # Row is completely fresh (< 24h), no API call needed, 0 credits
                continue

            # Row requires API call: Verify user has available credits
            can_proceed, credit_source = pct_quota_service.can_fetch(item.user_id, tier, db)
            if not can_proceed:
                logger.warning(
                    f"⚠️ [DAILY_SYNC] User {item.user_id} tracking credits exhausted. "
                    f"Skipping API call for Tracker {item.id} (ASIN {item.our_asin})."
                )
                skipped_rows_count += 1
                continue

            # Fetch fresh data for stale ASINs in this row
            try:
                logger.info(f"🔄 [DAILY_SYNC] Refreshing {len(stale_asins)} stale ASINs for Tracker {item.id} (User {item.user_id})...")
                api_data = await call_openwebninja_batch(stale_asins, country)
                any_fetched = False
                for asin in stale_asins:
                    raw_product = api_data.get(asin)
                    if raw_product:
                        clean = sanitize_api_response(raw_product)
                        _store_snapshot_in_db(clean, country, db)
                        any_fetched = True

                # Deduct 1 credit for this row refresh
                if any_fetched and credit_source:
                    pct_quota_service.deduct_credit(
                        item.user_id,
                        credit_source,
                        db,
                        description=f"1 credit used for daily tracking refresh of ASIN {item.our_asin}"
                    )
                    refreshed_rows_count += 1
                    logger.info(f"✅ [DAILY_SYNC] Deducted 1 credit from User {item.user_id} ({credit_source}) for Tracker {item.id}")

                await asyncio.sleep(0.1)  # rate limit safety

            except Exception as ex:
                logger.error(f"❌ [DAILY_SYNC] Error refreshing Tracker {item.id}: {str(ex)}")

        logger.info(
            f"Daily sync refresh complete: {refreshed_rows_count} row(s) refreshed & credits deducted, "
            f"{skipped_rows_count} row(s) skipped due to zero credits."
        )

        # 5. EVALUATE ALERTS FOR ACTIVE TRACKERS
        logger.info("Evaluating alert thresholds...")
        for item in active_items:
            if not item.alert_enabled:
                continue

            our_snap = db.query(PctPriceSnapshot).filter(
                PctPriceSnapshot.asin == item.our_asin,
                PctPriceSnapshot.country == item.country
            ).first()

            if not our_snap or not our_snap.product_price:
                continue

            # Respect per-competitor alert toggles (up to 5 competitors)
            allowed_comps = set((item.competitor_asins or [])[:5])
            active_alert_comps = item.alert_competitor_asins if item.alert_competitor_asins is not None else []
            if not active_alert_comps:
                continue

            for comp_asin in active_alert_comps:
                if comp_asin not in allowed_comps:
                    continue
                comp_snap = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == comp_asin,
                    PctPriceSnapshot.country == item.country
                ).first()

                if not comp_snap or not comp_snap.product_price:
                    continue

                our_price = float(our_snap.product_price)
                comp_price = float(comp_snap.product_price)
                if comp_price < our_price:
                    diff_pct = ((our_price - comp_price) / our_price) * 100.0
                    threshold = float(item.alert_threshold or 5.0)

                    if diff_pct >= threshold:
                        logger.info(
                            f"Evaluating alert threshold for Tracker {item.id} (Competitor ASIN: {comp_asin} is {diff_pct:.1f}% cheaper)..."
                        )
                        await check_and_send_alerts(item, our_snap, comp_snap, diff_pct, db)

        # 6. PERMANENT DATA RETENTION
        # Note: Both price history (PctPriceHistory) and alert logs (PctAlertLog) are preserved permanently (never deleted).
        logger.info("Daily sync cycle complete. All price history and alert logs preserved permanently.")

    except Exception as e:
        logger.error(f"Worker encountered unhandled exception: {str(e)}", exc_info=True)
    finally:
        db.close()
        logger.info("Price Comparison Tracker daily sync finished.")

if __name__ == "__main__":
    asyncio.run(process_daily_sync())
