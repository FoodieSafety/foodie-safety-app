import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Product API variables
OPENFOOD_API_URL = "https://world.openfoodfacts.org/api/v2/product/"
NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/search/item"
NUTRITIONIX_HEADERS = {
            "x-app-id": os.getenv("NUTRITIONIX_ID"),
            "x-app-key": os.getenv("NUTRITIONIX_KEY")
        }
FATSECRET_KEY_OAUTH1 = os.getenv("FATSECRET_KEY_OAUTH1")
FATSECRET_SECRET_OAUTH1 = os.getenv("FATSECRET_SECRET_OAUTH1")
FATSECRET_BASE_URL = os.getenv("FATSECRET_BASE_URL", "https://platform.fatsecret.com/rest")

UNKNOWN_PLACEHOLDER = '-Unknown-'

# Chat API Variables
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
GEMINI_API_HEADERS = {
        "Content-Type": "application/json",
        "X-goog-api-key": os.getenv("GEMINI_KEY")
}

CHAT_ERROR_MSG = "AI Assistant Could Not Respond"

# Local host variables
FRONTEND_URL = "http://localhost:3000"

# Recall Table variables
RECALL_DB_DISABLED = os.getenv("DISABLE_RECALL_DB", "false").lower() == "true"

# Chat Session variables
MAX_CHAT_SESSION_LENGTH = 10