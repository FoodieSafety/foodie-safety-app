import hashlib
import os
from pathlib import Path
from typing import Tuple, Optional

from app.util.config import (
    GEMINI_SYSTEM_PROMPT_PATH,
    GEMINI_SYSTEM_PROMPT,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    SYSTEM_PROMPT_VERSION,
    GEMINI_CACHE_TTL_SECONDS,
)

from google import genai
from google.genai import types

# in-process cache
_CACHE_ID: Optional[str] = None
_CACHE_HASH: Optional[str] = None


def _load_system_prompt_text() -> str:
    if GEMINI_SYSTEM_PROMPT and GEMINI_SYSTEM_PROMPT.strip():
        return GEMINI_SYSTEM_PROMPT.strip()
    if not GEMINI_SYSTEM_PROMPT_PATH:
        raise RuntimeError("System prompt not found. Set GEMINI_SYSTEM_PROMPT or GEMINI_SYSTEM_PROMPT_PATH.")
    candidates = [Path(GEMINI_SYSTEM_PROMPT_PATH), Path.cwd() / GEMINI_SYSTEM_PROMPT_PATH]
    for p in candidates:
        if p.exists():
            return p.read_text(encoding="utf-8").strip()
    raise RuntimeError(f"System prompt path not found at: {GEMINI_SYSTEM_PROMPT_PATH}")


def _compute_hash(text: str) -> str:
    h = hashlib.sha256()
    h.update(text.encode("utf-8"))
    h.update(str(SYSTEM_PROMPT_VERSION).encode("utf-8"))
    return h.hexdigest()


class SystemPromptService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def get_or_create_system_prompt_id(self) -> Tuple[int, bool]:
        global _CACHE_ID, _CACHE_HASH

        text = _load_system_prompt_text()
        h = _compute_hash(text)

        if _CACHE_ID and _CACHE_HASH == h:
            short_id = int(h[:8], 16) % 1_000_000_000
            return short_id, False

        cache_id = self._create_gemini_cached_content(text)
        _CACHE_ID, _CACHE_HASH = cache_id, h
        short_id = int(h[:8], 16) % 1_000_000_000
        return short_id, True

    def get_gemini_cache_id(self) -> str:
        self.get_or_create_system_prompt_id()
        assert _CACHE_ID
        return _CACHE_ID

    def _create_gemini_cached_content(self, system_prompt: str) -> str:
        # Docs: client.caches.create(model=..., config=types.CreateCachedContentConfig(...))
        # Model must use an explicit version suffix (“-001”) for caching.
        try:
            # Accept either bare name or fully-qualified; normalize to docs’ style.
            model = GEMINI_MODEL if GEMINI_MODEL.startswith("models/") else f"models/{GEMINI_MODEL}"
            config = types.CreateCachedContentConfig(
                system_instruction=system_prompt,
                ttl=f"{int(GEMINI_CACHE_TTL_SECONDS)}s",  # optional; defaults to 1h if omitted
            )
            created = self.client.caches.create(model=model, config=config)
            if not getattr(created, "name", None):
                raise RuntimeError("Gemini returned a cache object without 'name'.")
            return created.name  # e.g., "cachedContents/abc123"
        except Exception as e:
            raise RuntimeError(f"Failed to create Gemini cached content: {e}") from e
