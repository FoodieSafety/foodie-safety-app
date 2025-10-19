# app/config.py  — shim to re-export everything from app/util/config.py

from .util.config import (
    OPENFOOD_API_URL,
    NUTRITIONIX_API_URL,
    NUTRITIONIX_HEADERS,
    UNKNOWN_PLACEHOLDER,
    FRONTEND_URL,
    RECALL_DB_DISABLED,
    FATSECRET_KEY_OAUTH1,
    FATSECRET_SECRET_OAUTH1,
    FATSECRET_BASE_URL,
)
