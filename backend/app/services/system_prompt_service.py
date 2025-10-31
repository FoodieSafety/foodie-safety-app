from __future__ import annotations
import os
from typing import Optional, Tuple

from app.services.cache_service import CacheService
from app.util.config import (
    GEMINI_SYSTEM_PROMPT_PATH,
    GEMINI_SYSTEM_PROMPT,
    SYSTEM_PROMPT_VERSION,
    SYSTEM_PROMPT_TTL_SECONDS,
)

_SYS_PROMPT_CURRENT_ID_KEY = "sys_prompt:current_id"
_SYS_PROMPT_TEXT_KEY_FMT = "sys_prompt:{id}:text"
_SYS_PROMPT_VERSION_KEY_FMT = "sys_prompt:{id}:version"

def _load_system_prompt_text() -> str:
    if GEMINI_SYSTEM_PROMPT_PATH and os.path.exists(GEMINI_SYSTEM_PROMPT_PATH):
        with open(GEMINI_SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read().strip()
    return (GEMINI_SYSTEM_PROMPT or "You are a helpful culinary assistant. Return STRICT JSON.")

class SystemPromptService:
    """
    Manages a single, uniform system prompt for all sessions.
    Returns a stable cache 'id' so upstream services can log/verify usage.
    """

    def __init__(self):
        self.cache = CacheService()

    def get_or_create_system_prompt_id(self) -> Tuple[int, bool]:
        """
        Returns (id, created)
        - If cache has current id -> (id, False)
        - Else create new id (from SYSTEM_PROMPT_VERSION), store text+version -> (id, True)
        """
        current = self.cache.get(_SYS_PROMPT_CURRENT_ID_KEY)
        if isinstance(current, int):
            return current, False

        # create the system prompt in cache
        sys_id = SYSTEM_PROMPT_VERSION  # you can also auto-increment if you prefer
        text = _load_system_prompt_text()

        self.cache.set(_SYS_PROMPT_TEXT_KEY_FMT.format(id=sys_id), text, ttl_seconds=SYSTEM_PROMPT_TTL_SECONDS)
        self.cache.set(_SYS_PROMPT_VERSION_KEY_FMT.format(id=sys_id), SYSTEM_PROMPT_VERSION, ttl_seconds=SYSTEM_PROMPT_TTL_SECONDS)
        self.cache.set(_SYS_PROMPT_CURRENT_ID_KEY, sys_id, ttl_seconds=SYSTEM_PROMPT_TTL_SECONDS)

        return sys_id, True

    def get_system_prompt_text(self, id_override: Optional[int] = None) -> str:
        """
        Fetches the system prompt text by id (or the current id if not given).
        """
        if id_override is None:
            cur = self.cache.get(_SYS_PROMPT_CURRENT_ID_KEY)
            if not isinstance(cur, int):
                # ensure we have one
                cur, _ = self.get_or_create_system_prompt_id()
            id_override = cur

        text = self.cache.get(_SYS_PROMPT_TEXT_KEY_FMT.format(id=id_override))
        if isinstance(text, str) and text:
            return text

        # Fallback: reload from file/env & repopulate
        text = _load_system_prompt_text()
        self.cache.set(_SYS_PROMPT_TEXT_KEY_FMT.format(id=id_override), text, ttl_seconds=SYSTEM_PROMPT_TTL_SECONDS)
        return text
