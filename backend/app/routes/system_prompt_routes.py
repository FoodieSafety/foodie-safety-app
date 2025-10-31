from fastapi import APIRouter, HTTPException
from app.controllers.system_prompt_controller import check_system_prompt

# Define router for system prompt endpoints
router = APIRouter(
    prefix="/api/v1/system-prompt",
    tags=["system-prompt"]
)


@router.get("/check", summary="Verify or initialize Gemini system prompt cache")
async def check_system_prompt_route():
    """
    Initializes or verifies the Gemini system prompt cache.

    Returns:
        {
            "id": int,          # stable identifier derived from prompt + version hash
            "created": bool,    # True if a new Gemini cache was created
            "cache_id": str     # Gemini cached content resource ID (e.g., 'cachedContents/abc123...')
        }
    """
    try:
        return await check_system_prompt()
    except HTTPException as e:
        # If controller raised HTTPException, bubble it up as-is
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"System prompt route failed: {e}")
