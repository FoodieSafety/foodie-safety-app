from fastapi import APIRouter
from app.controllers.system_prompt_controller import check_system_prompt

router = APIRouter(prefix="/api/v1/system-prompt", tags=["system-prompt"])
router.get("/check")(check_system_prompt)
