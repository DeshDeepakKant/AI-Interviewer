import os
import redis.asyncio as redis
try:
    import fakeredis.aioredis as fakeredis_aioredis
except ImportError:
    fakeredis_aioredis = None


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
        if fakeredis_aioredis:
            _redis_instance = fakeredis_aioredis.FakeRedis(decode_responses=False)
        else:
            class MockRedis:
                def __init__(self):
                    self._data = {}
                async def get(self, k):
                    return self._data.get(k)
                async def set(self, k, v, *args, **kwargs):
                    self._data[k] = v
                async def delete(self, *keys):
                    for k in keys:
                        self._data.pop(k, None)
                async def exists(self, *keys):
                    return sum(1 for k in keys if k in self._data)
                async def ping(self):
                    return True
                async def close(self):
                    pass
            _redis_instance = MockRedis()
        
    return _redis_instance

class RedisProxy:
    """Proxy object that defers calls to the active (real or fake) Redis client."""
    def __getattr__(self, name):
        global _redis_instance
        if _redis_instance is None:
            try:
                real_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), socket_timeout=1.0)
                _redis_instance = real_client
            except Exception:
                if fakeredis_aioredis:
                    _redis_instance = fakeredis_aioredis.FakeRedis(decode_responses=False)
                else:
                    _redis_instance = dict()
        return getattr(_redis_instance, name)

redis_client = RedisProxy()

