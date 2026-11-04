#!/usr/bin/env python3
"""
Amazon Ads Background Sync Worker
Fetches campaign performance for Amazon Ads profiles.
Designed for scalability with Batching and Incremental Sync logic.
Strictly rate limited and compliant with Amazon Ads v3 Reporting API limits.
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
    """Sync a single profile's reports using Amazon Ads v3 native date ranges."""
    logger.info(f"Syncing profile {profile.profile_id} for user {profile.user_id}")
    ads_service = AmazonAdsService(db, profile.user_id)
    
    # 1. Incremental Logic: Find the latest date we have data for
    latest_record = db.query(func.max(AmazonAdsCampaignPerformance.date)).filter(
        AmazonAdsCampaignPerformance.profile_id == profile.profile_id
    ).scalar()
    
    # Subscription Tier check
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == profile.user_id).first()
    tier = sub.subscription_tier.lower() if sub and sub.subscription_tier else "free"
    expected_history_days = 60 if tier in ["premium", "enterprise", "trial"] else 30
    
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Amazon Ads v3 allows up to 31 days per report request with timeUnit: DAILY
    date_ranges = []
    
    if latest_record:
        latest_date = latest_record.date() if hasattr(latest_record, "date") else latest_record
        if latest_date < yesterday:
            days_behind = (today - latest_date).days
            fetch_days = min(days_behind, 30)
            date_ranges.append((today - timedelta(days=fetch_days), yesterday))
        else:
            date_ranges.append((yesterday, yesterday))
            
        # Backfill check if account upgraded
        oldest_record = db.query(func.min(AmazonAdsCampaignPerformance.date)).filter(
            AmazonAdsCampaignPerformance.profile_id == profile.profile_id
        ).scalar()
        if oldest_record:
            oldest_date = oldest_record.date() if hasattr(oldest_record, "date") else oldest_record
            days_have = (today - oldest_date).days
            if days_have < expected_history_days:
                days_short = expected_history_days - days_have
                chunk_days = min(days_short, 30)
                backfill_start = oldest_date - timedelta(days=chunk_days)
                backfill_end = oldest_date - timedelta(days=1)
                date_ranges.append((backfill_start, backfill_end))
    else:
        # Initial sync: Fetch based on subscription tier (max 30 days per chunk)
        logger.info(f"User {profile.user_id} is on {tier} tier. Initial fetch set to {expected_history_days} days.")
        if expected_history_days > 30:
            # Chunk 1: most recent 30 days
            date_ranges.append((today - timedelta(days=30), yesterday))
            # Chunk 2: older 30 days
            date_ranges.append((today - timedelta(days=expected_history_days), today - timedelta(days=31)))
        else:
            date_ranges.append((today - timedelta(days=expected_history_days), yesterday))
            
    logger.info(f"Profile {profile.profile_id} will sync {len(date_ranges)} range chunk(s).")
    
    for start_dt, end_dt in date_ranges:
        start_str = start_dt.strftime("%Y%m%d")
        end_str = end_dt.strftime("%Y%m%d")
        logger.info(f"Syncing range {start_str} to {end_str} for profile {profile.profile_id}")
        
        # 1. Campaign Report
        logger.info(f"Requesting campaign report for {profile.profile_id} ({start_str} - {end_str})")
        report_id = await ads_service.request_campaign_report(profile.profile_id, start_str, end_str)
        if not report_id:
            logger.warning(f"Could not get campaign report ID for {profile.profile_id} ({start_str} - {end_str})")
        else:
            location = await ads_service.poll_report_status(profile.profile_id, report_id)
            if location:
                await ads_service.download_and_parse_report(location, profile.profile_id, start_str)
            else:
                logger.warning(f"Campaign report {report_id} did not finish successfully.")
        await asyncio.sleep(2)  # Protect single-concurrency limit between requests
        
        # 2. Keyword Report
        logger.info(f"Requesting keyword report for {profile.profile_id} ({start_str} - {end_str})")
        kw_report_id = await ads_service.request_keyword_report(profile.profile_id, start_str, end_str)
        if not kw_report_id:
            logger.warning(f"Could not get keyword report ID for {profile.profile_id} ({start_str} - {end_str})")
        else:
            kw_location = await ads_service.poll_report_status(profile.profile_id, kw_report_id)
            if kw_location:
                await ads_service.download_and_parse_keyword_report(kw_location, profile.profile_id, start_str)
            else:
                logger.warning(f"Keyword report {kw_report_id} did not finish successfully.")
        await asyncio.sleep(2)
        
        # 3. Search Term Report
        logger.info(f"Requesting search term report for {profile.profile_id} ({start_str} - {end_str})")
        st_report_id = await ads_service.request_search_term_report(profile.profile_id, start_str, end_str)
        if not st_report_id:
            logger.warning(f"Could not get search term report ID for {profile.profile_id} ({start_str} - {end_str})")
        else:
            st_location = await ads_service.poll_report_status(profile.profile_id, st_report_id)
            if st_location:
                await ads_service.download_and_parse_search_term_report(st_location, profile.profile_id, start_str)
            else:
                logger.warning(f"Search term report {st_report_id} did not finish successfully.")
        await asyncio.sleep(2)
        
        # 4. Placement Report
        logger.info(f"Requesting placement report for {profile.profile_id} ({start_str} - {end_str})")
        pl_report_id = await ads_service.request_placement_report(profile.profile_id, start_str, end_str)
        if not pl_report_id:
            logger.warning(f"Could not get placement report ID for {profile.profile_id} ({start_str} - {end_str})")
        else:
            pl_location = await ads_service.poll_report_status(profile.profile_id, pl_report_id)
            if pl_location:
                await ads_service.download_and_parse_placement_report(pl_location, profile.profile_id, start_str)
            else:
                logger.warning(f"Placement report {pl_report_id} did not finish successfully.")
        await asyncio.sleep(2)
        
    logger.info(f"Completed sync for profile {profile.profile_id}")

async def run_sync_worker(target_user_id=None):
    """Main worker loop with batching."""
    logger.info("Starting Amazon Ads Background Sync Worker")
    db = SessionLocal()
    
    try:
        # 1. Sync profiles from Amazon to catch any upgraded limits or new connections
        if target_user_id:
            logger.info(f"Syncing Amazon profiles for user {target_user_id} before pulling analytics.")
            ads_service = AmazonAdsService(db, target_user_id)
            await ads_service.sync_profiles()
        else:
            logger.info("Nightly run detected. Syncing profiles for ALL connected users to catch limit upgrades.")
            active_creds = db.query(AmazonAdsCredential).filter(AmazonAdsCredential.refresh_token != None).all()
            for cred in active_creds:
                ads_service = AmazonAdsService(db, cred.user_id)
                await ads_service.sync_profiles()
                await asyncio.sleep(2)  # Tiny pause to protect API limits between users
            
        # 2. Pull Analytics for the updated profile list
        query = db.query(AmazonAdsProfile)
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
