from pydantic import BaseModel
from app.services.system_prompt_service import SystemPromptService

class SystemPromptCheckResponse(BaseModel):
    id: int
    created: bool

async def check_system_prompt() -> SystemPromptCheckResponse:
    svc = SystemPromptService()
    sys_id, created = svc.get_or_create_system_prompt_id()
    return SystemPromptCheckResponse(id=sys_id, created=created)
