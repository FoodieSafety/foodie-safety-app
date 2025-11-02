import requests
from requests_oauthlib import OAuth1
from .schemas import ProductInfo, Barcode, ProductError
from .config import OPENFOOD_API_URL, NUTRITIONIX_API_URL, NUTRITIONIX_HEADERS, UNKNOWN_PLACEHOLDER, FATSECRET_KEY_OAUTH1, FATSECRET_SECRET_OAUTH1, FATSECRET_BASE_URL

def get_nutritionix_info(barcode: Barcode):

    nutritionix_params = {
        "upc": barcode.code
    }
    product_response = requests.get(url=NUTRITIONIX_API_URL, headers=NUTRITIONIX_HEADERS, params=nutritionix_params)

    if product_response.status_code == 200:
        product_json = product_response.json()
        return ProductInfo(
            code=barcode.code, 
            name=product_json['foods'][0].get('food_name', UNKNOWN_PLACEHOLDER), 
            brand=product_json['foods'][0].get('brand_name', UNKNOWN_PLACEHOLDER), 
            recall=False)
    
    return ProductError(code=barcode.code, status_code=product_response.status_code)

def get_openfoodfact_info(barcode: Barcode):

    product_response = requests.get(f"{OPENFOOD_API_URL}{barcode.code}.json")
    
    if product_response.status_code == 200:
        product_json = product_response.json()
        return ProductInfo(
            code=barcode.code, 
            name=product_json['product'].get('product_name', UNKNOWN_PLACEHOLDER), 
            brand=product_json['product'].get('brands', UNKNOWN_PLACEHOLDER), 
            recall=False)
    
    return ProductError(code=barcode.code, status_code=product_response.status_code)


def get_fatsecret_info(barcode: Barcode):
    """
    Look up a food via FatSecret 'food.search' using the barcode text as the query.
    Mirrors the shape of other helpers: returns ProductInfo | ProductError.
    """
    # Build OAuth1 auth
    auth = OAuth1(FATSECRET_KEY_OAUTH1, FATSECRET_SECRET_OAUTH1)
    url = f"{FATSECRET_BASE_URL}/food.search"
    params = {"search_expression": barcode.code, "format": "json"}

    try:
        resp = requests.get(url, auth=auth, params=params, timeout=10)
    except requests.RequestException:
        # Network or auth failure → treat as backend error
        return ProductError(code=barcode.code, status_code=500)

    if resp.status_code != 200:
        return ProductError(code=barcode.code, status_code=resp.status_code)

    # Parse JSON safely
    try:
        data = resp.json()
        foods = (data.get("foods") or {}).get("food") or []
        if not foods:
            # No match found — align with your existing pattern by returning a 404-ish error
            return ProductError(code=barcode.code, status_code=404)

        food = foods[0]
        return ProductInfo(
            code=barcode.code,
            name=food.get("food_name", UNKNOWN_PLACEHOLDER),
            brand=food.get("brand_name", UNKNOWN_PLACEHOLDER),
            recall=False,
        )
    except Exception:
        # Malformed JSON or structure mismatch
        return ProductError(code=barcode.code, status_code=500)
    


    