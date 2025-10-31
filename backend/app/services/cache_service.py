from __future__ import annotations
import json
import time
from typing import Any, Optional

try:
    import redis  # type: ignore
except Exception:
    redis = None  # fallback later

from app.util.config import REDIS_URL

class CacheService:
    """
    Redis-backed cache with an in-memory fallback.
    Keys are strings; values are JSON-serialized.
    """
    _mem: dict[str, tuple[float, str]] = {}

    def __init__(self):
        self.client = None
        if REDIS_URL and redis is not None:
            try:
                self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
                # quick check
                self.client.ping()
            except Exception:
                self.client = None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        data = json.dumps(value)
        if self.client:
            if ttl_seconds:
                self.client.setex(key, ttl_seconds, data)
            else:
                self.client.set(key, data)
            return
        # fallback
        expires_at = time.time() + ttl_seconds if ttl_seconds else float("inf")
        self._mem[key] = (expires_at, data)

    def get(self, key: str) -> Optional[Any]:
        if self.client:
            raw = self.client.get(key)
            return json.loads(raw) if raw else None
        tup = self._mem.get(key)
        if not tup:
            return None
        exp, data = tup
        if time.time() > exp:
            self._mem.pop(key, None)
            return None
        return json.loads(data)

    def exists(self, key: str) -> bool:
        if self.client:
            return bool(self.client.exists(key))
        v = self.get(key)
        return v is not None

    def incr(self, key: str) -> int:
        if self.client:
            return int(self.client.incr(key))
        val = self.get(key)
        n = int(val) if isinstance(val, int) else 0
        n += 1
        self.set(key, n, ttl_seconds=None)
        return n
