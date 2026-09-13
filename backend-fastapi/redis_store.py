import os
import redis.asyncio as redis
import fakeredis.aioredis

_redis_instance = None

async def init_redis():
    global _redis_instance
    if _redis_instance is not None:
        return _redis_instance
        
    url = os.getenv("REDIS_URL", "redis://localhost:6379")
    try:
        real_client = redis.from_url(url, socket_timeout=1.5, socket_connect_timeout=1.5)
        await real_client.ping()
        print(f"[DB] Connected to Redis at {url}")
        _redis_instance = real_client
    except Exception as e:
        print(f"[DB Warning] Redis not reachable at {url} ({e}). Using in-memory FakeRedis.")
        _redis_instance = fakeredis.aioredis.FakeRedis(decode_responses=False)
        
    return _redis_instance

class RedisProxy:
    """Proxy object that defers calls to the active (real or fake) Redis client."""
    def __getattr__(self, name):
        global _redis_instance
        if _redis_instance is None:
            # Synchronously create fallback if not yet initialized
            try:
                real_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), socket_timeout=1.0)
                _redis_instance = real_client
            except Exception:
                _redis_instance = fakeredis.aioredis.FakeRedis(decode_responses=False)
        return getattr(_redis_instance, name)

redis_client = RedisProxy()
