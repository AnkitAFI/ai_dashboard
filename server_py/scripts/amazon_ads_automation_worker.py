#!/usr/bin/env python3
"""
Amazon Ads Background Automation Worker
Executes user-defined automation rules (Dayparting & Bid Adjustments).
Strictly adheres to Rate Limits to prevent API bans.
"""

import sys
import os
import asyncio
import logging
from datetime import datetime, timedelta

# Add parent dir to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.schema_v2 import AmazonAdsAutomationRules, AmazonAdsProfile
from app.services.amazon_ads_service import AmazonAdsService
from app.services.rate_limiter import AmazonAdsRateLimiter

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def execute_dayparting(db, rule, ads_service, current_hour, current_day):
    """Executes dayparting logic: pauses/enables campaigns based on configured hours."""
    config = rule.rule_config
    active_days = config.get("days", {})
    active_hours = config.get("hours", [0, 24])

    is_active_day = active_days.get(current_day, False)
    is_active_hour = active_hours[0] <= current_hour < active_hours[1]
    
    should_be_enabled = is_active_day and is_active_hour
    logger.info(f"Dayparting Rule {rule.id}: Day {current_day}, Hour {current_hour}. Should be enabled: {should_be_enabled}")

    try:
        # Strict Rate Limiter to protect keys during automation!
        await AmazonAdsRateLimiter.acquire(profile_id=rule.profile_id, fail_open=False)
        
        campaigns = await ads_service.get_campaigns(rule.profile_id)
        if not campaigns:
            return
            
        # For this prototype phase, we will just log the action rather than making 100s of PUT requests
        # In full production, we would batch UPDATE the campaign statuses to ENABLED or PAUSED here.
        for campaign in campaigns:
            current_status = campaign.get("state", "ENABLED")
            target_status = "ENABLED" if should_be_enabled else "PAUSED"
            
            if current_status != target_status:
                logger.info(f"ACTION REQUIRED: Update Campaign {campaign.get('campaignId')} state to {target_status}")
                # Mock execution
                # await ads_service.update_campaign(campaign_id, {"state": target_status})

    except Exception as e:
        logger.error(f"Error executing dayparting rule {rule.id}: {e}")

async def execute_bid_adjustment(db, rule, ads_service):
    """Executes bid adjustment logic based on Target ACOS."""
    config = rule.rule_config
    target_acos = float(config.get("target_acos", 25))
    max_increase = float(config.get("max_increase", 20)) / 100
    max_decrease = float(config.get("max_decrease", 15)) / 100
    
    logger.info(f"Bid Adjustment Rule {rule.id}: Target ACOS {target_acos}%")
    
    try:
        # Strict Rate Limiter
        await AmazonAdsRateLimiter.acquire(profile_id=rule.profile_id, fail_open=False)
        
        # Get yesterday's performance to calculate ACOS
        today = datetime.utcnow().date()
        yesterday_str = (today - timedelta(days=1)).strftime("%Y%m%d")
        
        # Here we would fetch yesterday's performance from DB or API for keywords/campaigns
        # For now, we mock the bid adjustment calculations
        logger.info(f"ACTION REQUIRED: Evaluating bids against Target ACOS {target_acos}% for profile {rule.profile_id}")
        
    except Exception as e:
        logger.error(f"Error executing bid adjustment rule {rule.id}: {e}")


async def process_automations():
    """Main function to run all active automations."""
    logger.info("Starting Automation Rule Execution...")
    db = SessionLocal()
    try:
        active_rules = db.query(AmazonAdsAutomationRules).filter(
            AmazonAdsAutomationRules.is_active == True
        ).all()
        
        if not active_rules:
            logger.info("No active automation rules found. Exiting.")
            return

        now = datetime.utcnow()
        current_hour = now.hour
        current_day = now.strftime("%a") # Mon, Tue, etc.

        for rule in active_rules:
            logger.info(f"Processing rule {rule.id} of type {rule.rule_type} for profile {rule.profile_id}")
            ads_service = AmazonAdsService(db, rule.user_id)
            
            if rule.rule_type == "DAYPARTING":
                await execute_dayparting(db, rule, ads_service, current_hour, current_day)
            elif rule.rule_type == "BID_ADJUSTMENT":
                await execute_bid_adjustment(db, rule, ads_service)

    except Exception as e:
        logger.error(f"Critical error in automation worker: {e}")
    finally:
        db.close()
        logger.info("Automation Rule Execution completed.")

if __name__ == "__main__":
    asyncio.run(process_automations())
