#!/usr/bin/env python3
"""
RapidAPI Amazon Scheduler Service
Runs the Amazon data collection on a schedule using APScheduler
"""
 
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import subprocess
import os
import sys
 
# Fix Windows console encoding issues
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass
 
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)
 
def run_rapidapi_collection():
    """
    Run the rapidapi_amazon_collector.py script
    """
    try:
        logger.info("=" * 70)
        logger.info(f"[SCHEDULER] Starting RapidAPI Amazon collection at {datetime.now()}")
        logger.info("=" * 70)
       
        # Path to the script
        script_path = os.path.join(os.path.dirname(__file__), 'rapidapi_amazon_collector.py')
       
        # Verify script exists
        if not os.path.exists(script_path):
            logger.error(f"[SCHEDULER] X Script not found: {script_path}")
            return
       
        # Run the script
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(__file__),
            timeout=1800  # 30 minute timeout (adjust based on your needs)
        )
       
        # Log output
        if result.stdout:
            logger.info(f"[OUTPUT]\n{result.stdout}")
        if result.stderr:
            logger.error(f"[STDERR]\n{result.stderr}")
       
        if result.returncode == 0:
            logger.info("[SCHEDULER] SUCCESS - Collection completed successfully")
        else:
            logger.error(f"[SCHEDULER] FAILED - Collection failed with code {result.returncode}")
           
    except subprocess.TimeoutExpired:
        logger.error("[SCHEDULER] TIMEOUT - Collection timed out after 30 minutes")
    except Exception as e:
        logger.error(f"[SCHEDULER] ERROR - Error running collection: {e}", exc_info=True)
 
def main():
    """
    Main scheduler function
   
    Schedule options explained:
    - Daily: Runs once per day at specified time
    - Every N hours: Runs at regular intervals
    - Twice daily: Runs at two specific times
    - Weekly: Runs on specific days of the week
    """
    scheduler = BlockingScheduler()
   
    # ============================================================================
    # SCHEDULE CONFIGURATION - TESTING MODE
    # ============================================================================
   
    # **TESTING SCHEDULE**: Daily at 11:30 AM for verification
    scheduler.add_job(
        run_rapidapi_collection,
        CronTrigger(hour=15, minute=00),
        id='test_collection',
        name='TEST: RapidAPI Collection at 13:00 PM'
    )
   
    # ============================================================================
    # OTHER SCHEDULE OPTIONS (commented out - uncomment after testing)
    # ============================================================================
   
    # Option 1: Daily at 2 AM (Recommended for production - low API traffic)
    # scheduler.add_job(
    #     run_rapidapi_collection,
    #     CronTrigger(hour=2, minute=0),
    #     id='daily_collection',
    #     name='Daily RapidAPI Collection at 2 AM IST'
    # )
   
    # Option 2: Every 12 hours (2 AM and 2 PM)
    # scheduler.add_job(
    #     run_rapidapi_collection,
    #     CronTrigger(hour='2,14', minute=0),
    #     id='twice_daily',
    #     name='RapidAPI Collection Every 12 Hours'
    # )
   
    # Option 3: Every 6 hours (4 times daily)
    # scheduler.add_job(
    #     run_rapidapi_collection,
    #     CronTrigger(hour='*/6', minute=0),
    #     id='every_6_hours',
    #     name='RapidAPI Collection Every 6 Hours'
    # )
   
    # Option 4: Weekdays only at 8 AM
    # scheduler.add_job(
    #     run_rapidapi_collection,
    #     CronTrigger(day_of_week='mon-fri', hour=8, minute=0),
    #     id='weekday_collection',
    #     name='RapidAPI Collection Weekdays at 8 AM'
    # )
   
    # ============================================================================
    # SCHEDULER STARTUP
    # ============================================================================
   
    logger.info("")
    logger.info("=" * 70)
    logger.info("  RAPIDAPI AMAZON SCHEDULER - TEST MODE")
    logger.info("  Scheduled for 13:00 PM")
    logger.info("=" * 70)
    logger.info("")
    logger.info("[SCHEDULER] Configuration:")
    logger.info(f"  Script: rapidapi_amazon_collector.py")
    logger.info(f"  Timeout: 30 minutes per run")
    logger.info(f"  Fallback: CSV mode if database unavailable")
    logger.info("")
    logger.info("[SCHEDULER] Scheduled jobs:")
   
    for job in scheduler.get_jobs():
        logger.info(f"  JOB: {job.name}")
        # Get next run time properly
        trigger = job.trigger
        next_run = trigger.get_next_fire_time(None, datetime.now())
        logger.info(f"       Next run: {next_run}")
   
    logger.info("")
    logger.info("=" * 70)
    logger.info("[INFO] Press Ctrl+C to stop the scheduler")
    logger.info("=" * 70)
    logger.info("")
   
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("")
        logger.info("[SCHEDULER] STOP - Shutting down...")
        scheduler.shutdown()
        logger.info("[SCHEDULER] SUCCESS - Stopped cleanly")
 
if __name__ == "__main__":
    # ============================================================================
    # INITIAL RUN ON STARTUP
    # ============================================================================
   
    # Set to False if you don't want to run immediately on startup
    # For testing, you might want to set this to True to verify it works
    RUN_ON_STARTUP = False
   
    if RUN_ON_STARTUP:
        logger.info("[SCHEDULER] RUN - Running initial collection on startup...")
        run_rapidapi_collection()
        logger.info("")
   
    # Start the scheduler
    main()
 
