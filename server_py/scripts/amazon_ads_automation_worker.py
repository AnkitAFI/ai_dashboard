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
from app.models.schema_v2 import AmazonAdsAutomationRules, AmazonAdsProfile, AmazonAdsCampaignPerformance, AmazonAdsAuditLog, AmazonAdsSearchTermPerformance
from sqlalchemy import func
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

async def execute_budget_scaling(db, rule, ads_service):
    """Executes budget scaling logic by querying local DB to save Amazon API rate limits."""
    from app.models.schema_v2 import AmazonAdsCampaignPerformance, AmazonAdsAuditLog
    from sqlalchemy import func
    
    config = rule.rule_config
    target_acos = float(config.get("target_acos", 15))
    target_roas = float(config.get("target_roas", 5))
    increase_pct = float(config.get("increase_pct", 20)) / 100
    
    logger.info(f"Budget Scaling Rule {rule.id}: Target ACOS < {target_acos}%, ROAS > {target_roas}x")
    
    try:
        # 1. Query LOCAL database to find profitable campaigns (ZERO rate limit cost!)
        # We look at the last 7 days of performance to make a safe budget decision.
        seven_days_ago = datetime.utcnow().date() - timedelta(days=7)
        
        campaign_metrics = db.query(
            AmazonAdsCampaignPerformance.campaign_id,
            func.sum(AmazonAdsCampaignPerformance.spend).label("total_spend"),
            func.sum(AmazonAdsCampaignPerformance.sales).label("total_sales")
        ).filter(
            AmazonAdsCampaignPerformance.profile_id == rule.profile_id,
            func.date(AmazonAdsCampaignPerformance.date) >= seven_days_ago
        ).group_by(
            AmazonAdsCampaignPerformance.campaign_id
        ).all()

        campaigns_to_scale = []
        for metric in campaign_metrics:
            spend = float(metric.total_spend or 0)
            sales = float(metric.total_sales or 0)
            
            if spend > 0 and sales > 0:
                acos = (spend / sales) * 100
                roas = sales / spend
                
                if acos < target_acos and roas > target_roas:
                    campaigns_to_scale.append(metric.campaign_id)
        
        if not campaigns_to_scale:
            logger.info(f"No campaigns met the budget scaling criteria for profile {rule.profile_id}")
            return
            
        # 2. Only hit the Amazon API if we actually have campaigns to scale!
        # Strict Rate Limiter to protect keys during automation!
        await AmazonAdsRateLimiter.acquire(profile_id=rule.profile_id, fail_open=False)
        
        live_campaigns = await ads_service.get_campaigns(rule.profile_id)
        if not live_campaigns:
            return
            
        # 3. Update budgets and write GDPR/DPDP-compliant audit logs
        for campaign in live_campaigns:
            campaign_id = str(campaign.get("campaignId"))
            if campaign_id in campaigns_to_scale:
                current_budget = float(campaign.get("dailyBudget", 0))
                if current_budget > 0:
                    new_budget = round(current_budget * (1 + increase_pct), 2)
                    
                    logger.info(f"Scaling budget for campaign {campaign_id} from {current_budget} to {new_budget}")
                    success = await ads_service.update_campaign_budget(rule.profile_id, campaign_id, new_budget)
                    
                    if success:
                        # Log to AuditLog for liability protection
                        audit_log = AmazonAdsAuditLog(
                            user_id=rule.user_id,
                            profile_id=rule.profile_id,
                            action="AUTOMATION_BUDGET_SCALED",
                            details={
                                "campaign_id": campaign_id,
                                "old_budget": current_budget,
                                "new_budget": new_budget,
                                "rule_id": rule.id
                            }
                        )
                        db.add(audit_log)
        
        db.commit()

    except Exception as e:
        logger.error(f"Error executing budget scaling rule {rule.id}: {e}")
        db.rollback()

async def execute_search_term_negation(db, rule, ads_service):
    """
    Finds search terms that have exceeded the spend threshold with 0 sales over the last 7 days.
    Calls the Amazon API to negate them, and logs the action securely.
    """
    config = rule.rule_config
    max_spend = float(config.get("max_spend", 2000.0))
    
    logger.info(f"Checking for bleeding search terms for rule {rule.id} (Threshold: {max_spend})")
    
    try:
        # Calculate trailing 7 days
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=7)
        
        # 1. Zero API limits: We query the local DB for aggregated search term performance
        search_terms = db.query(
            AmazonAdsSearchTermPerformance.search_term,
            func.max(AmazonAdsSearchTermPerformance.campaign_id).label("campaign_id"),
            func.max(AmazonAdsSearchTermPerformance.ad_group_id).label("ad_group_id"),
            func.sum(AmazonAdsSearchTermPerformance.spend).label("total_spend"),
            func.sum(AmazonAdsSearchTermPerformance.sales).label("total_sales")
        ).filter(
            AmazonAdsSearchTermPerformance.profile_id == rule.profile_id,
            AmazonAdsSearchTermPerformance.date >= start_date,
            AmazonAdsSearchTermPerformance.date <= end_date
        ).group_by(
            AmazonAdsSearchTermPerformance.search_term
        ).all()

        terms_to_negate = []
        for st in search_terms:
            spend = float(st.total_spend or 0)
            sales = float(st.total_sales or 0)
            
            # If spend exceeds the threshold and there are 0 sales, it's a bleeder.
            if spend > max_spend and sales == 0:
                terms_to_negate.append({
                    "search_term": st.search_term,
                    "campaign_id": st.campaign_id,
                    "ad_group_id": st.ad_group_id,
                    "spend": spend
                })
        
        if not terms_to_negate:
            logger.info(f"No bleeding search terms found for rule {rule.id}")
            return
            
        # 2. Only hit the Amazon API for the bleeding terms, using Rate Limiter
        await AmazonAdsRateLimiter.acquire(profile_id=rule.profile_id, fail_open=False)
        
        for term_data in terms_to_negate:
            logger.info(f"Auto-negating search term '{term_data['search_term']}' (Spend: {term_data['spend']}, Sales: 0)")
            
            success = await ads_service.add_negative_keyword(
                rule.profile_id, 
                term_data["campaign_id"], 
                term_data["ad_group_id"], 
                term_data["search_term"]
            )
            
            if success:
                # Log to AuditLog for liability protection
                audit_log = AmazonAdsAuditLog(
                    user_id=rule.user_id,
                    profile_id=rule.profile_id,
                    action="AUTOMATED_SEARCH_TERM_NEGATED",
                    details={
                        "campaign_id": term_data["campaign_id"],
                        "ad_group_id": term_data["ad_group_id"],
                        "search_term": term_data["search_term"],
                        "spend": term_data["spend"],
                        "rule_id": rule.id
                    }
                )
                db.add(audit_log)
        
        db.commit()

    except Exception as e:
        logger.error(f"Error executing search term negation rule {rule.id}: {e}")
        db.rollback()

async def execute_placement_bid_modifier(db, rule, ads_service):
    """
    Finds campaigns where a specific placement (e.g., Top of Search) has an ACOS below the target.
    Automatically increases the bid modifier by the configured percentage, up to a max limit.
    """
    from app.models.schema_v2 import AmazonAdsPlacementPerformance
    
    config = rule.rule_config
    target_acos = float(config.get("target_acos", 20.0))
    increase_pct = float(config.get("increase_pct", 5.0))
    max_modifier = float(config.get("max_modifier", 50.0))
    placement_type = config.get("placement_type", "placementTop")
    
    logger.info(f"Checking placement {placement_type} for rule {rule.id} (Target ACOS < {target_acos}%)")
    
    try:
        fourteen_days_ago = datetime.utcnow().date() - timedelta(days=14)
        
        # 1. Find profitable placements using LOCAL DB (0 API cost)
        placement_metrics = db.query(
            AmazonAdsPlacementPerformance.campaign_id,
            func.sum(AmazonAdsPlacementPerformance.spend).label("total_spend"),
            func.sum(AmazonAdsPlacementPerformance.sales).label("total_sales")
        ).filter(
            AmazonAdsPlacementPerformance.profile_id == rule.profile_id,
            AmazonAdsPlacementPerformance.placement == placement_type,
            func.date(AmazonAdsPlacementPerformance.date) >= fourteen_days_ago
        ).group_by(
            AmazonAdsPlacementPerformance.campaign_id
        ).all()
        
        campaigns_to_boost = []
        for metric in placement_metrics:
            spend = float(metric.total_spend or 0)
            sales = float(metric.total_sales or 0)
            
            if spend > 0 and sales > 0:
                acos = (spend / sales) * 100
                if acos < target_acos:
                    campaigns_to_boost.append(metric.campaign_id)
                    
        if not campaigns_to_boost:
            logger.info(f"No campaigns met the placement modifier criteria for rule {rule.id}")
            return
            
        # 2. Get current campaign configurations from Amazon (Rate Limited)
        from app.services.rate_limiter import AmazonAdsRateLimiter
        await AmazonAdsRateLimiter.acquire(profile_id=rule.profile_id, fail_open=False)
        
        live_campaigns = await ads_service.get_campaigns(rule.profile_id)
        if not live_campaigns:
            return
            
        # 3. Process each winning campaign
        for campaign in live_campaigns:
            campaign_id = str(campaign.get("campaignId"))
            if campaign_id in campaigns_to_boost:
                bidding = campaign.get("bidding", {})
                adjustments = bidding.get("adjustments", [])
                
                # Find current modifier for this placement
                current_modifier = 0
                for adj in adjustments:
                    if adj.get("predicate") == placement_type:
                        current_modifier = int(adj.get("percentage", 0))
                        break
                        
                # Calculate new modifier capped at max_modifier
                new_modifier = min(current_modifier + int(increase_pct), int(max_modifier))
                
                if new_modifier > current_modifier:
                    logger.info(f"Boosting {placement_type} for campaign {campaign_id} from {current_modifier}% to {new_modifier}%")
                    success = await ads_service.update_campaign_bidding_placement(
                        profile_id=rule.profile_id,
                        campaign_id=campaign_id,
                        placement=placement_type,
                        percentage=new_modifier
                    )
                    
                    if success:
                        # Secure Audit Log for GDPR/DPDP
                        audit_log = AmazonAdsAuditLog(
                            user_id=rule.user_id,
                            profile_id=rule.profile_id,
                            action="AUTOMATED_BID_MODIFIER_INCREASED",
                            details={
                                "campaign_id": campaign_id,
                                "placement": placement_type,
                                "old_modifier_pct": current_modifier,
                                "new_modifier_pct": new_modifier,
                                "rule_id": rule.id
                            }
                        )
                        db.add(audit_log)
        
        db.commit()

    except Exception as e:
        logger.error(f"Error executing placement bid modifier rule {rule.id}: {e}")
        db.rollback()


async def process_automations():
    """Main function to run all active automations."""
    logger.info("Starting Automation Rule Execution...")
    db = SessionLocal()
    try:
        from app.db.models.user_model import User
        
        active_rules = db.query(AmazonAdsAutomationRules).join(
            User, AmazonAdsAutomationRules.user_id == User.id
        ).filter(
            AmazonAdsAutomationRules.is_active == True,
            User.subscription_tier.in_(["premium", "enterprise"])
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
            elif rule.rule_type == "BUDGET_SCALING":
                await execute_budget_scaling(db, rule, ads_service)
            elif rule.rule_type == "SEARCH_TERM_NEGATION":
                await execute_search_term_negation(db, rule, ads_service)
            elif rule.rule_type == "PLACEMENT_BID_MODIFIER":
                await execute_placement_bid_modifier(db, rule, ads_service)

    except Exception as e:
        logger.error(f"Critical error in automation worker: {e}")
    finally:
        db.close()
        logger.info("Automation Rule Execution completed.")

if __name__ == "__main__":
    asyncio.run(process_automations())
