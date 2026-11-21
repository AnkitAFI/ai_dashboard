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
        for sub in active_subscriptions:
            # Check user is active and not soft-deleted
            auth = db.query(UserAuth).filter(UserAuth.id == sub.user_id, UserAuth.is_active == True).first()
            if not auth:
                continue

            if not sub.subscription_expires_at or sub.subscription_expires_at > now:
                valid_user_ids.add(sub.user_id)

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

        unique_asins_by_country: dict[str, set[str]] = {}
        for item in active_items:
            c = item.country or "IN"
            unique_asins_by_country.setdefault(c, set()).add(item.our_asin)
            for comp in (item.competitor_asins or [])[:5]:
                unique_asins_by_country[c].add(comp)

        # 3. IDENTIFY STALE ASINs (> 24 hours old)
        cutoff = now - timedelta(hours=24)
        stale_batches: dict[str, list[list[str]]] = {}

        for country, asins in unique_asins_by_country.items():
            stale_for_country = []
            for asin in asins:
                snap = db.query(PctPriceSnapshot).filter(
                    PctPriceSnapshot.asin == asin,
                    PctPriceSnapshot.country == country,
                    PctPriceSnapshot.fetched_at > cutoff
                ).first()
                if not snap:
                    stale_for_country.append(asin)

            # Batch up to 10 ASINs per OpenWebNinja API request
            batches = [stale_for_country[i:i + 10] for i in range(0, len(stale_for_country), 10)]
            if batches:
                stale_batches[country] = batches

        # 4. REFRESH STALE ASINs (Respecting 20 req/s rate limit)
        for country, batches in stale_batches.items():
            for batch in batches:
                try:
                    logger.info(f"Fetching batch of {len(batch)} ASINs for country {country}...")
                    api_data = await call_openwebninja_batch(batch, country)
                    for asin in batch:
                        raw_product = api_data.get(asin)
                        if raw_product:
                            clean = sanitize_api_response(raw_product)
                            _store_snapshot_in_db(clean, country, db)

                    # Sleep 100ms between calls to stay safely below 20 requests/second
                    await asyncio.sleep(0.1)

                except Exception as ex:
                    logger.error(f"Error refreshing batch {batch}: {str(ex)}")

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
                            f"Alert triggered for Tracker {item.id} (ASIN: {comp_asin} is {diff_pct:.1f}% cheaper)"
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
