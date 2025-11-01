import hashlib
from typing import Optional
from pydantic import BaseModel
from fastapi import HTTPException
from app.services.system_prompt_service import SystemPromptService

class SystemPromptResolvedResponse(BaseModel):
    system_instruction: Optional[str] = None
    version: int

class SystemPromptCheckResponse(BaseModel):
    id: int
    created: bool

def _hash_prompt(text: str, version: int) -> int:
    h = hashlib.sha256()
    h.update(text.encode("utf-8"))
    h.update(str(version).encode("utf-8"))
    return int(h.hexdigest()[:8], 16)

async def resolve_system_prompt() -> SystemPromptResolvedResponse:
    try:
        svc = SystemPromptService()
        payload = svc.get_prompt_for_request()
        return SystemPromptResolvedResponse(**payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve system prompt: {e}")

async def check_system_prompt() -> SystemPromptCheckResponse:
    
    try:
        svc = SystemPromptService()
        text = svc.get_system_prompt_text()
        version = svc.get_prompt_for_request()["version"]
        pid = _hash_prompt(text, version)
        return SystemPromptCheckResponse(id=pid, created=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System prompt check failed: {e}")
