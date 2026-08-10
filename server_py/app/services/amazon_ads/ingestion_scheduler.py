import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.db.session import SessionLocal
from app.models.ad_models import AmazonAdProfile
from sqlalchemy import select
from app.services.amazon_ads.ingestion_pipeline import amazon_ads_ingestion

logger = logging.getLogger(__name__)

# Single instance
scheduler = AsyncIOScheduler()

def run_nightly_ingestion_sync():
    """
    Runs every night to fetch data and generate bid recommendations for all active profiles.
    """
    logger.info("Starting nightly APScheduler ingestion sync...")
    db = SessionLocal()
    try:
        profiles = db.execute(select(AmazonAdProfile)).scalars().all()
        for profile in profiles:
            try:
                amazon_ads_ingestion.run_rules_pipeline_for_profile(db, profile.profile_id, profile.user_id)
            except Exception as e:
                logger.error(f"Error running ingestion sync for profile {profile.profile_id}: {e}")
    finally:
        db.close()
    logger.info("Finished nightly APScheduler ingestion sync.")

def start_ingestion_scheduler():
    if not scheduler.running:
        # Run every day at 3:00 AM UTC
        scheduler.add_job(run_nightly_ingestion_sync, 'cron', hour=3, minute=0, id='nightly_ingestion_sync', replace_existing=True)
        scheduler.start()
        logger.info("APScheduler for nightly ingestion started.")

def stop_ingestion_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler for nightly ingestion stopped.")
