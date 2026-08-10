import asyncio
import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.models.ad_models import CampaignBuilderJob
from app.services.amazon_ads.api_client import AmazonAdsAPIClient

logger = logging.getLogger(__name__)

async def campaign_builder_worker_loop():
    """
    Background worker loop that runs continuously.
    Pulls QUEUED jobs from CampaignBuilderJob table using FOR UPDATE SKIP LOCKED
    to ensure exactly-once processing even if multiple workers are running.
    """
    logger.info("Starting Campaign Builder PostgreSQL Worker Loop...")
    
    while True:
        try:
            await process_next_job()
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
        
        # Sleep to prevent high CPU usage when queue is empty
        await asyncio.sleep(2)


async def process_next_job():
    # Use a fresh session for each loop iteration
    db: Session = SessionLocal()
    try:
        # PostgreSQL specific query for atomic queue polling
        # We claim jobs that are QUEUED, or RUNNING but haven't heartbeat in 5 mins
        claim_query = text("""
            UPDATE campaign_builder_jobs
            SET status = 'RUNNING', 
                lease_until = NOW() + INTERVAL '5 minutes',
                started_at = COALESCE(started_at, NOW()),
                last_heartbeat = NOW()
            WHERE id = (
                SELECT id FROM campaign_builder_jobs
                WHERE (status = 'QUEUED') OR 
                      (status = 'RUNNING' AND lease_until < NOW())
                ORDER BY 
                    CASE priority 
                        WHEN 'HIGH' THEN 1 
                        WHEN 'NORMAL' THEN 2 
                        WHEN 'LOW' THEN 3 
                        ELSE 4 
                    END ASC, 
                    created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING id;
        """)
        
        result = db.execute(claim_query).fetchone()
        db.commit()

        if not result:
            return # Queue empty

        job_id = result[0]
        logger.info(f"Worker claimed CampaignBuilderJob #{job_id}")

        # Fetch the fully mapped SQLAlchemy object
        job = db.query(CampaignBuilderJob).filter(CampaignBuilderJob.id == job_id).first()
        if not job:
            return

        try:
            # Execute the job state machine
            await execute_job(db, job)
            
            job.status = "COMPLETED"
            job.completed_at = datetime.now(timezone.utc)
            job.lease_until = None
            db.commit()
            logger.info(f"CampaignBuilderJob #{job_id} COMPLETED successfully.")
            
        except Exception as e:
            logger.error(f"Failed to execute job #{job_id}: {e}")
            job.retry_count += 1
            if job.retry_count >= job.max_retries:
                job.status = "FAILED"
                job.error_message = str(e)
                job.lease_until = None
            else:
                job.status = "QUEUED" # Retry
                job.lease_until = None
            db.commit()

    finally:
        db.close()


async def execute_job(db: Session, job: CampaignBuilderJob):
    """
    Executes the campaign builder job steps.
    Resumes deterministically from current_step.
    """
    
    # 1. Parse template (In real life we'd load CampaignTemplate.definition)
    # For now, hardcode the "proven_pipeline" logic.
    payload = job.input_payload
    sku = payload.get("sku")
    base_bid = payload.get("base_bid", 1.0)
    
    # We pretend to make API calls here and update state
    
    steps_order = [
        "CREATE_AUTO_CAMPAIGN",
        "CREATE_BROAD_CAMPAIGN",
        "CREATE_EXACT_CAMPAIGN",
        "CREATE_PROMOTION_PIPELINE"
    ]
    
    job.total_steps = len(steps_order)
    if job.current_step == "":
        job.current_step = steps_order[0]
    
    # Determine where to start based on current_step
    start_index = 0
    if job.current_step in steps_order:
        start_index = steps_order.index(job.current_step)
        
    for i in range(start_index, len(steps_order)):
        step_name = steps_order[i]
        job.current_step = step_name
        
        # Simulate work
        start_time = datetime.now()
        await asyncio.sleep(1) # Simulate Amazon API latency
        
        if step_name == "CREATE_AUTO_CAMPAIGN":
            job.auto_campaign_id = f"auto_camp_{sku}_{job.id}"
            job.auto_ad_group_id = f"auto_ag_{sku}_{job.id}"
        elif step_name == "CREATE_BROAD_CAMPAIGN":
            job.broad_campaign_id = f"broad_camp_{sku}_{job.id}"
            job.broad_ad_group_id = f"broad_ag_{sku}_{job.id}"
        elif step_name == "CREATE_EXACT_CAMPAIGN":
            job.exact_campaign_id = f"exact_camp_{sku}_{job.id}"
            job.exact_ad_group_id = f"exact_ag_{sku}_{job.id}"
        elif step_name == "CREATE_PROMOTION_PIPELINE":
            job.pipeline_id = job.id + 1000
            
        end_time = datetime.now()
        job.execution_time_ms += int((end_time - start_time).total_seconds() * 1000)
        job.amazon_api_calls += 2 # Camp + AdGroup
        
        job.completed_steps = i + 1
        job.last_heartbeat = datetime.now(timezone.utc)
        job.lease_until = datetime.now(timezone.utc) + timedelta(minutes=5)
        
        # Commit progress instantly
        db.commit()
