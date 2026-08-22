#!/usr/bin/env python3
"""
Amazon Ads Background Sync Worker
Fetches campaign performance for Amazon Ads profiles.
Designed for scalability with Batching and Incremental Sync logic.
"""

import sys
import os
import asyncio
import logging
from datetime import datetime, timedelta

# Add parent dir to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import AmazonAdsProfile, AmazonAdsCampaignPerformance, UserSubscription, AmazonAdsCredential
from app.services.amazon_ads_service import AmazonAdsService
from sqlalchemy import func

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BATCH_SIZE = 10
BATCH_DELAY_SECONDS = 10

async def sync_profile(db, profile):
    """Sync a single profile's reports."""
    logger.info(f"Syncing profile {profile.profile_id} for user {profile.user_id}")
    ads_service = AmazonAdsService(db, profile.user_id)
    
    # 1. Incremental Logic: Find the latest date we have data for
    latest_record = db.query(func.max(AmazonAdsCampaignPerformance.date)).filter(
        AmazonAdsCampaignPerformance.profile_id == profile.profile_id
    ).scalar()
    # Subscription Tier check
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == profile.user_id).first()
    tier = sub.subscription_tier.lower() if sub and sub.subscription_tier else "free"
    expected_history_days = 60 if tier in ["premium", "enterprise"] else 30
    
    today = datetime.utcnow().date()
    dates_to_sync = []
    
    if latest_record:
        # Forward Sync
        start_date = today - timedelta(days=1)
        if latest_record.date() < start_date:
            days_behind = (today - latest_record.date()).days
            days_to_fetch = min(days_behind, 7)
            for i in range(1, days_to_fetch + 1):
                dates_to_sync.append(today - timedelta(days=i))
        else:
            dates_to_sync.append(today - timedelta(days=1))
            
        # Backfill Logic (Upgrades)
        oldest_record = db.query(func.min(AmazonAdsCampaignPerformance.date)).filter(
            AmazonAdsCampaignPerformance.profile_id == profile.profile_id
        ).scalar()
        
        if oldest_record:
            oldest_date = oldest_record.date()
            days_have = (today - oldest_date).days
            if days_have < expected_history_days:
                days_short = expected_history_days - days_have
                backfill_limit = min(days_short, 7) # Max 7 days per run
                logger.info(f"Backfilling {backfill_limit} older days to meet {expected_history_days} day target.")
                
                creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == profile.user_id).first()
                if creds and creds.sync_status != "BACKFILLING":
                    creds.sync_status = "BACKFILLING"
                    db.commit()
                
                for i in range(1, backfill_limit + 1):
                    backfill_date = oldest_date - timedelta(days=i)
                    if backfill_date not in dates_to_sync:
                        dates_to_sync.append(backfill_date)
            else:
                creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == profile.user_id).first()
                if creds and creds.sync_status == "BACKFILLING":
                    creds.sync_status = "COMPLETED"
                    db.commit()
    else:
        # Initial sync: Fetch based on subscription tier
        logger.info(f"User {profile.user_id} is on {tier} tier. Initial fetch set to {expected_history_days} days.")
        
        for i in range(1, expected_history_days + 1):
            dates_to_sync.append(today - timedelta(days=i))
            
    logger.info(f"Profile {profile.profile_id} needs {len(dates_to_sync)} days of data.")
    
    for sync_date in dates_to_sync:
        date_str = sync_date.strftime("%Y%m%d")
        logger.info(f"Requesting report for {profile.profile_id} on {date_str}")
        
        report_id = await ads_service.request_campaign_report(profile.profile_id, date_str)
        if not report_id:
            logger.warning(f"Could not get campaign report ID for {profile.profile_id} on {date_str}")
        else:
            location = await ads_service.poll_report_status(profile.profile_id, report_id)
            if location:
                await ads_service.download_and_parse_report(location, profile.profile_id, date_str)
            else:
                logger.warning(f"Campaign report {report_id} did not finish successfully.")
                
        # 2. Sync Keyword Data for the same date
        logger.info(f"Requesting keyword report for {profile.profile_id} on {date_str}")
        kw_report_id = await ads_service.request_keyword_report(profile.profile_id, date_str)
        if not kw_report_id:
            logger.warning(f"Could not get keyword report ID for {profile.profile_id} on {date_str}")
        else:
            kw_location = await ads_service.poll_report_status(profile.profile_id, kw_report_id)
            if kw_location:
                await ads_service.download_and_parse_keyword_report(kw_location, profile.profile_id, date_str)
            else:
                logger.warning(f"Keyword report {kw_report_id} did not finish successfully.")
                
        # 3. Sync Search Term Data for the same date
        logger.info(f"Requesting search term report for {profile.profile_id} on {date_str}")
        st_report_id = await ads_service.request_search_term_report(profile.profile_id, date_str)
        if not st_report_id:
            logger.warning(f"Could not get search term report ID for {profile.profile_id} on {date_str}")
        else:
            st_location = await ads_service.poll_report_status(profile.profile_id, st_report_id)
            if st_location:
                await ads_service.download_and_parse_search_term_report(st_location, profile.profile_id, date_str)
            else:
                logger.warning(f"Search term report {st_report_id} did not finish successfully.")
        
    logger.info(f"Completed sync for profile {profile.profile_id}")

async def run_sync_worker(target_user_id=None):
    """Main worker loop with batching."""
    logger.info("Starting Amazon Ads Background Sync Worker")
    db = SessionLocal()
    
    try:
        query = db.query(AmazonAdsProfile).filter(AmazonAdsProfile.is_active == True)
        if target_user_id:
            query = query.filter(AmazonAdsProfile.user_id == target_user_id)
        
        profiles = query.all()
        logger.info(f"Found {len(profiles)} active profiles to sync.")
        
        # Process in batches
        for i in range(0, len(profiles), BATCH_SIZE):
            batch = profiles[i:i + BATCH_SIZE]
            logger.info(f"Processing batch {i//BATCH_SIZE + 1} ({len(batch)} profiles)")
            
            tasks = [sync_profile(db, p) for p in batch]
            await asyncio.gather(*tasks)
            
            if i + BATCH_SIZE < len(profiles):
                logger.info(f"Batch complete. Sleeping for {BATCH_DELAY_SECONDS} seconds to protect API limits.")
                await asyncio.sleep(BATCH_DELAY_SECONDS)
                
        # If we targeted a specific user (e.g. initial sync), update their sync_status
        if target_user_id:
            creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.user_id == target_user_id).first()
            if creds:
                creds.sync_status = "COMPLETED"
                db.commit()
                logger.info(f"Updated sync_status to COMPLETED for user {target_user_id}")
                
    except Exception as e:
        logger.error(f"Error in Sync Worker: {e}", exc_info=True)
    finally:
        db.close()
        logger.info("Sync Worker Finished.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--user_id", type=int, help="Target specific user ID")
    args = parser.parse_args()
    
    asyncio.run(run_sync_worker(target_user_id=args.user_id))
