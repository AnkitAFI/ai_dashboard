import time
import logging
import asyncio
from typing import Optional
from app.core.config import settings
import redis.asyncio as redis

logger = logging.getLogger(__name__)

import os

# Global Circuit Breaker State
CIRCUIT_BREAKER_TRIPPED_UNTIL = 0
CIRCUIT_BREAKER_DURATION = 300  # 5 minutes

# In-Memory Fallback State (Layer 2)
_local_buckets = {}

# Enterprise Connection Pool (Layer 1 Protection)
redis_pool = redis.ConnectionPool(
    host=os.environ.get("REDIS_HOST", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6379)),
    password=os.environ.get("REDIS_PASSWORD", None),
    decode_responses=True,
    protocol=2,
    max_connections=5000
)

# Initialize async redis client
redis_client = redis.Redis(connection_pool=redis_pool)

class AmazonAdsCircuitBreakerException(Exception):
    """Raised when the Amazon Ads API Circuit Breaker is tripped."""
    pass

class AmazonAdsRateLimiter:
    """
    Multi-Layered Token Bucket rate limiter specifically tuned for Amazon Ads API limits.
    """
    
    LIMITS = {
        "profiles": {"rate": 10, "capacity": 10},
        "reports": {"rate": 2, "capacity": 2}, 
        "default": {"rate": 5, "capacity": 5}
    }

    @staticmethod
    def trip_circuit_breaker():
        """Trips the circuit breaker, blocking all outbound Amazon requests globally for 5 minutes."""
        global CIRCUIT_BREAKER_TRIPPED_UNTIL
        CIRCUIT_BREAKER_TRIPPED_UNTIL = time.time() + CIRCUIT_BREAKER_DURATION
        logger.critical(f"AMAZON ADS API CIRCUIT BREAKER TRIPPED! All requests blocked until {CIRCUIT_BREAKER_TRIPPED_UNTIL}")

    @staticmethod
    def is_circuit_breaker_tripped() -> bool:
        return time.time() < CIRCUIT_BREAKER_TRIPPED_UNTIL

    @staticmethod
    def _local_fallback_acquire(bucket_key: str, rate: int, capacity: int, tokens: int, now: float) -> bool:
        """Layer 2: Local In-Memory Token Bucket if Redis fails."""
        if bucket_key not in _local_buckets:
            _local_buckets[bucket_key] = {"tokens": capacity, "last_update": now}
            
        bucket = _local_buckets[bucket_key]
        elapsed = max(0, now - bucket["last_update"])
        
        current_tokens = min(capacity, bucket["tokens"] + (elapsed * rate))
        
        if current_tokens >= tokens:
            _local_buckets[bucket_key] = {"tokens": current_tokens - tokens, "last_update": now}
            return True
            
        _local_buckets[bucket_key] = {"tokens": current_tokens, "last_update": now}
        return False

    @staticmethod
    async def acquire(endpoint_type: str = "default", tokens: int = 1, user_id: Optional[int] = None, fail_open: bool = False) -> bool:
        """
        Attempt to acquire tokens. Layer 1: Redis. Layer 2: In-Memory. Layer 3: Circuit Breaker.
        `fail_open=True` is used for frontend routes. `fail_open=False` (default) is strict for background workers.
        """
        if AmazonAdsRateLimiter.is_circuit_breaker_tripped():
            if fail_open:
                return False # Just reject frontend user gracefully
            raise AmazonAdsCircuitBreakerException("Amazon Ads Circuit Breaker is active. Request aborted.")

        limit_config = AmazonAdsRateLimiter.LIMITS.get(endpoint_type, AmazonAdsRateLimiter.LIMITS["default"])
        rate = limit_config["rate"]
        capacity = limit_config["capacity"]
        
        bucket_key = f"amazon_ads_rate_limit:{endpoint_type}"
        if user_id:
            bucket_key += f":{user_id}"
            
        now = time.time()
        
        lua_script = """
        local bucket_key = KEYS[1]
        local rate = tonumber(ARGV[1])
        local capacity = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local tokens_requested = tonumber(ARGV[4])

        local bucket = redis.call('HMGET', bucket_key, 'tokens', 'last_update')
        local current_tokens = tonumber(bucket[1])
        local last_update = tonumber(bucket[2])

        if not current_tokens then
            current_tokens = capacity
            last_update = now
        end

        local elapsed = math.max(0, now - last_update)
        current_tokens = math.min(capacity, current_tokens + (elapsed * rate))

        if current_tokens >= tokens_requested then
            current_tokens = current_tokens - tokens_requested
            redis.call('HMSET', bucket_key, 'tokens', current_tokens, 'last_update', now)
            redis.call('EXPIRE', bucket_key, math.ceil(capacity / rate))
            return 1
        else
            redis.call('HMSET', bucket_key, 'tokens', current_tokens, 'last_update', now)
            redis.call('EXPIRE', bucket_key, math.ceil(capacity / rate))
            return 0
        end
        """
        
        try:
            result = await redis_client.eval(lua_script, 1, bucket_key, rate, capacity, now, tokens)
            return bool(result)
        except Exception as e:
            logger.error(f"Rate limiter Redis error: {e}. Falling back to In-Memory Token Bucket.")
            # Layer 2: In-Memory Fallback
            return AmazonAdsRateLimiter._local_fallback_acquire(bucket_key, rate, capacity, tokens, now)
            
    @staticmethod
    async def wait_for_token(endpoint_type: str = "default", user_id: Optional[int] = None):
        """Block until a token is available."""
        while not await AmazonAdsRateLimiter.acquire(endpoint_type, 1, user_id):
            await asyncio.sleep(0.5)

rate_limiter = AmazonAdsRateLimiter()

# FastAPI Dependency
from fastapi import HTTPException, Request, Depends
from app.api.deps import get_current_user

class RateLimit:
    def __init__(self, endpoint_type: str = "default", tokens: int = 1):
        self.endpoint_type = endpoint_type
        self.tokens = tokens

    async def __call__(self, request: Request, current_user = Depends(get_current_user)):
        if not await rate_limiter.acquire(self.endpoint_type, self.tokens, user_id=current_user.id, fail_open=True):
            raise HTTPException(status_code=429, detail="Too many requests to Amazon Ads integration. Please slow down.")
        return True
