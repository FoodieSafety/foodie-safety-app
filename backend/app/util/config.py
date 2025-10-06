import os

# Product API variables
OPENFOOD_API_URL = "https://world.openfoodfacts.org/api/v2/product/"
NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/search/item"
NUTRITIONIX_HEADERS = {
            "x-app-id": os.getenv("NUTRITIONIX_ID"),
            "x-app-key": os.getenv("NUTRITIONIX_KEY")
        }

# Local host variables
FRONTEND_URL = "http://localhost:3000"