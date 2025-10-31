import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENFOOD_API_URL = "https://world.openfoodfacts.org/api/v2/product/"
NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/search/item"
NUTRITIONIX_HEADERS = {
    "x-app-id": os.getenv("NUTRITIONIX_ID"),
    "x-app-key": os.getenv("NUTRITIONIX_KEY"),
}

FATSECRET_KEY_OAUTH1 = os.getenv("FATSECRET_KEY_OAUTH1", "")
FATSECRET_SECRET_OAUTH1 = os.getenv("FATSECRET_SECRET_OAUTH1", "")
FATSECRET_BASE_URL = os.getenv("FATSECRET_BASE_URL", "https://platform.fatsecret.com/rest")

UNKNOWN_PLACEHOLDER = "-Unknown-"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Recall table flag used by product/recall modules
RECALL_DB_DISABLED = os.getenv("DISABLE_RECALL_DB", "false").lower() == "true"



# API key and model
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# Path or inline system prompt
GEMINI_SYSTEM_PROMPT_PATH = os.getenv("GEMINI_SYSTEM_PROMPT_PATH")
GEMINI_SYSTEM_PROMPT = os.getenv("GEMINI_SYSTEM_PROMPT", "")

# Prompt version (increment when changed)
SYSTEM_PROMPT_VERSION = int(os.getenv("SYSTEM_PROMPT_VERSION", "1"))

# TTL for Gemini cache in seconds
GEMINI_CACHE_TTL_SECONDS = int(os.getenv("GEMINI_CACHE_TTL_SECONDS", "86400"))
