from pathlib import Path
from app.util.config import (
    GEMINI_SYSTEM_PROMPT,
    GEMINI_SYSTEM_PROMPT_PATH,
    SYSTEM_PROMPT_VERSION,
)

def _load_system_prompt_text() -> str:
    if GEMINI_SYSTEM_PROMPT:
        return GEMINI_SYSTEM_PROMPT
    p = Path(GEMINI_SYSTEM_PROMPT_PATH)
    if p.exists():
        return p.read_text(encoding="utf-8").strip()
    raise RuntimeError("System prompt not found. Set GEMINI_SYSTEM_PROMPT or GEMINI_SYSTEM_PROMPT_PATH.")

class SystemPromptService:
    def get_system_prompt_text(self) -> str:
        return _load_system_prompt_text()

    def get_prompt_for_request(self) -> dict:
        return {
            "system_instruction": self.get_system_prompt_text(),
            "version": int(SYSTEM_PROMPT_VERSION),
        }
