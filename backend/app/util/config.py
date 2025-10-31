import os
from dotenv import load_dotenv

load_dotenv()

# System prompt source (file or inline)
GEMINI_SYSTEM_PROMPT_PATH = os.getenv("GEMINI_SYSTEM_PROMPT_PATH")
GEMINI_SYSTEM_PROMPT = os.getenv("GEMINI_SYSTEM_PROMPT", "")

# Versioning & cache
SYSTEM_PROMPT_VERSION = int(os.getenv("SYSTEM_PROMPT_VERSION", "1"))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
SYSTEM_PROMPT_TTL_SECONDS = int(os.getenv("SYSTEM_PROMPT_TTL_SECONDS", "86400"))
