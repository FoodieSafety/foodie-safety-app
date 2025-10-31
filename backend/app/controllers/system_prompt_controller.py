from fastapi import HTTPException
from pydantic import BaseModel
from app.services.system_prompt_service import SystemPromptService


class SystemPromptCheckResponse(BaseModel):
    id: int
    created: bool
    cache_id: str


async def check_system_prompt() -> SystemPromptCheckResponse:
    """
    Ensures the Gemini system prompt is cached and returns:
      - id: stable int derived from prompt+version hash
      - created: True if a new Gemini cache was created in this process
      - cache_id: Gemini cached content resource name (e.g., 'cachedContents/abc123...')
    """
    try:
        svc = SystemPromptService()
        sys_id, created = svc.get_or_create_system_prompt_id()
        cache_id = svc.get_gemini_cache_id()
        return SystemPromptCheckResponse(id=sys_id, created=created, cache_id=cache_id)
    except Exception as e:
        # Bubble up a clear 500 so callers know initialization failed
        raise HTTPException(status_code=500, detail=f"System prompt check failed: {e}")
