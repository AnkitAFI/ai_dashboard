import os
import redis
from rq import Queue

# Fetch Redis configuration matching the existing rate_limiter.py pattern
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)

# Global Redis Connection
redis_conn = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)

# High Priority Queue (e.g. On-Demand Recalculations, Store Initial Sync)
high_priority_queue = Queue('high', connection=redis_conn)

# Default Queue (e.g. Nightly Cron Jobs, Bulk Report Processing)
default_queue = Queue('default', connection=redis_conn)

# Inventory Background Jobs
inventory_queue = Queue('inventory', connection=redis_conn)

def enqueue_job(func, *args, queue_name='default', **kwargs):
    """
    Helper function to safely dispatch jobs to the Redis Queue.
    Ensures that background tasks are handled seamlessly by worker instances.
    """
    if queue_name == 'high':
        q = high_priority_queue
    elif queue_name == 'inventory':
        q = inventory_queue
    else:
        q = default_queue
        
    return q.enqueue(func, *args, **kwargs)
