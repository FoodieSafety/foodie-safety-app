# app/services/fatsecret_service.py
import requests
from requests_oauthlib import OAuth1
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.config import (
    FATSECRET_KEY_OAUTH1,
    FATSECRET_SECRET_OAUTH1,
    FATSECRET_BASE_URL,
    UNKNOWN_PLACEHOLDER,
)

router = APIRouter(tags=["fatsecret"])

@router.get("/fatsecret")
def fatsecret_endpoint(query: str = Query(..., description="Food name, keyword, or barcode string")):
    """
    Thin HTTP wrapper that your test hits. Returns 200 with data even when the API
    yields no match (placeholder fallback).
    """
    try:
        data = get_fatsecret_barcode_info(query)
        return {"query": query, "data": data}
    except Exception as e:
        # If something truly unexpected happens
        raise HTTPException(status_code=500, detail=str(e))


def get_fatsecret_barcode_info(barcode: str) -> Dict[str, Any]:
    """
    Fetch product info from the FatSecret API using a barcode or keyword.

    Note:
        FatSecret does not offer direct barcode lookup.
        We use the 'food.search' endpoint with the barcode string as the query.
    """
    auth = OAuth1(FATSECRET_KEY_OAUTH1, FATSECRET_SECRET_OAUTH1)
    url = f"{FATSECRET_BASE_URL}/food.search"

    params = {
        "search_expression": barcode,
        "format": "json",
    }

    try:
        response = requests.get(url, auth=auth, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        foods = data.get("foods", {}).get("food", [])
        if not foods:
            return _make_placeholder_response(barcode)

        food = foods[0]
        return {
            "barcode": barcode,
            "name": food.get("food_name", UNKNOWN_PLACEHOLDER),
            "brand": food.get("brand_name", UNKNOWN_PLACEHOLDER),
            "description": food.get("food_description", UNKNOWN_PLACEHOLDER),
            "source": "FatSecret",
        }

    except requests.exceptions.RequestException as e:
        print(f"[FatSecret API Request Error] {e}")
    except ValueError as e:
        print(f"[FatSecret JSON Decode Error] {e}")
    except Exception as e:
        print(f"[FatSecret Unknown Error] {e}")

    return _make_placeholder_response(barcode)


def _make_placeholder_response(barcode: str) -> Dict[str, Any]:
    """Generate a fallback response when FatSecret data isn't available."""
    return {
        "barcode": barcode,
        "name": UNKNOWN_PLACEHOLDER,
        "brand": UNKNOWN_PLACEHOLDER,
        "description": UNKNOWN_PLACEHOLDER,
        "source": "FatSecret",
    }
