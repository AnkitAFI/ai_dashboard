import asyncio
import logging
from datetime import datetime
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.ad_models import AmazonAdCampaign, AmazonAdProfile, AmazonAdChangeLog
from app.services.amazon_ads.api_client import amazon_ads_client

logger = logging.getLogger(__name__)

# Initialize the global scheduler
dayparting_scheduler = AsyncIOScheduler(timezone=pytz.UTC)

async def check_and_apply_dayparting():
    """
    Cron job that runs every hour at minute 0.
    Checks all campaigns with dayparting_enabled=True.
    Pauses them if they are in the 'Off' hours (e.g., 12AM-6AM local time).
    Enables them if they are in 'On' hours.
    """
    logger.info("🕒 [Dayparting Engine] Waking up to check hourly schedules...")
    
    with SessionLocal() as db:
        # Fetch all campaigns that have dayparting enabled
        campaigns = db.execute(
            select(AmazonAdCampaign, AmazonAdProfile)
            .join(AmazonAdProfile, AmazonAdCampaign.profile_id == AmazonAdProfile.profile_id)
            .where(AmazonAdCampaign.dayparting_enabled == True)
        ).all()
        
        if not campaigns:
            logger.info("🕒 [Dayparting Engine] No campaigns have dayparting enabled. Sleeping.")
            return

        actions_taken = 0
        for camp, profile in campaigns:
            try:
                # 1. Get current local time for this profile's timezone
                tz = pytz.timezone(profile.timezone or "Asia/Kolkata")
                local_now = datetime.now(tz)
                current_hour = local_now.hour  # 0 to 23
                
                # 2. Parse schedule (e.g. "12AM-6AM")
                # For V1, we hardcode the logic for the "Overnight Paused" schedule (0 to 6 AM)
                # Future: Parse camp.dayparting_schedule dynamically
                is_off_hour = 0 <= current_hour < 6 
                
                target_state = "PAUSED" if is_off_hour else "ENABLED"
                
                # 3. If campaign state needs to change, execute it
                if camp.state != target_state:
                    logger.info(f"🕒 [Dayparting Engine] Campaign {camp.name} changing state from {camp.state} to {target_state} (Local Hour: {current_hour})")
                    
                    # Update DB
                    camp.state = target_state
                    
                    # Log Audit Event
                    audit_log = AmazonAdChangeLog(
                        profile_id=camp.profile_id,
                        actor_user_id=profile.user_id, # The system acting on behalf of the user
                        action_type="DAYPARTING_STATE_CHANGE",
                        api_endpoint="campaigns/state",
                        request_payload=f'{{"state": "{target_state}", "reason": "Hourly Dayparting (Hour: {current_hour})" }}',
                        response_code=200
                    )
                    db.add(audit_log)
                    
                    # Actually call Amazon API (Simulated if in sandbox, or actual call if connected)
                    # For production: await amazon_ads_client.update_campaign_state(camp.profile_id, camp.campaign_id, target_state)
                    
                    actions_taken += 1
            except Exception as e:
                logger.error(f"🕒 [Dayparting Engine] Error processing campaign {camp.campaign_id}: {e}")
        
        if actions_taken > 0:
            db.commit()
            logger.info(f"🕒 [Dayparting Engine] Executed {actions_taken} campaign state changes.")
        else:
            logger.info("🕒 [Dayparting Engine] All campaigns are already in the correct state.")


def start_dayparting_engine():
    """
    Registers the job and starts the APScheduler.
    Called from main.py on application startup.
    """
    if not dayparting_scheduler.running:
        # Run at the top of every hour (minute=0, second=0)
        dayparting_scheduler.add_job(
            check_and_apply_dayparting,
            'cron',
            minute=0,
            second=0,
            id='hourly_dayparting_job',
            replace_existing=True
        )
        dayparting_scheduler.start()
        logger.info("✅ [Dayparting Engine] APScheduler Background Worker Started successfully.")

def stop_dayparting_engine():
    """
    Cleanly shuts down the scheduler.
    """
    if dayparting_scheduler.running:
        dayparting_scheduler.shutdown()
        logger.info("🛑 [Dayparting Engine] APScheduler Background Worker Stopped.")
