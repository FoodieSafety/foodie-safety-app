import requests
from .schemas import ProductInfo, Barcode, ProductError
from .config import OPENFOOD_API_URL, NUTRITIONIX_API_URL, NUTRITIONIX_HEADERS, UNKNOWN_PLACEHOLDER


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