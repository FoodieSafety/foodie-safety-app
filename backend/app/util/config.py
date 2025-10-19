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

UNKNOWN_PLACEHOLDER = '-Unknown-'

# Local host variables
FRONTEND_URL = "http://localhost:3000"

# Recall Table variables
RECALL_DB_DISABLED = os.getenv("DISABLE_RECALL_DB", "false").lower() == "true"

# FatSecret API variables
FATSECRET_KEY_OAUTH1 = os.getenv("FATSECRET_KEY_OAUTH1")
FATSECRET_SECRET_OAUTH1 = os.getenv("FATSECRET_SECRET_OAUTH1")

# REST API endpoint
FATSECRET_BASE_URL = os.getenv("FATSECRET_BASE_URL", "https://platform.fatsecret.com/rest")


