import os
from typing import List, Tuple
import cv2
from pyzbar.pyzbar import decode
import numpy as np
from .schemas import ProductInfo, Barcode, ProductError
from .config import RECALL_DB_DISABLED
from .dynamo_util import DynamoUtil
from .product_api import get_nutritionix_info, get_openfoodfact_info, get_fatsecret_info 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

recall_table_name = os.getenv("DYNAMODB_RECALL_TABLE")

def decode_image(product_img_bytes: bytes) -> List[Barcode]:
    """
    Decode barcode(s) from an image.
    Converts image bytes into a list of Barcode objects.
    """
    np_img = np.frombuffer(product_img_bytes, np.uint8)
    product_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    decoded_products = decode(product_img)
    barcodes = [Barcode(code=product.data.decode('utf-8')) for product in decoded_products]
    return barcodes

def get_recall_info(barcode: Barcode, ddb_util: DynamoUtil) -> bool:
    """
    Check if a given product barcode is in the recall database table.
    """
    if RECALL_DB_DISABLED:
        return False
    if ddb_util.scan_table(recall_table_name, "UPCs", barcode.code):
        return True
    return False

def get_products_info(barcodes: List[Barcode], ddb_util: DynamoUtil) -> Tuple[List[ProductInfo], List[ProductError]]:
    """
    Fetch product info from multiple APIs (Nutritionix, OpenFoodFacts, FatSecret)
    and cross-check recall information.
    """
    product_info_list: List[ProductInfo] = []
    invalid_barcodes: List[ProductError] = []

    for barcode in barcodes:
        is_recalled = get_recall_info(barcode, ddb_util)

        # Try Nutritionix API
        nutritionix_info = get_nutritionix_info(barcode)
        if isinstance(nutritionix_info, ProductInfo):
            nutritionix_info.recall = is_recalled
            product_info_list.append(nutritionix_info)
            continue

        # Try OpenFoodFacts API
        openfoodfact_info = get_openfoodfact_info(barcode)
        if isinstance(openfoodfact_info, ProductInfo):
            openfoodfact_info.recall = is_recalled
            product_info_list.append(openfoodfact_info)
            continue

        # Try FatSecret API 
        fatsecret_info = get_fatsecret_info(barcode)
        if isinstance(fatsecret_info, ProductInfo):
            fatsecret_info.recall = is_recalled
            product_info_list.append(fatsecret_info)
            continue

        # If all sources failed, append the last known error
        invalid_barcodes.append(ProductError(code=barcode.code, status_code=404))
        
    return product_info_list, invalid_barcodes


