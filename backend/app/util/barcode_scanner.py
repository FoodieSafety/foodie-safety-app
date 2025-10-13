import os
from typing import List, Tuple
import cv2
from pyzbar.pyzbar import decode
import numpy as np
from .schemas import ProductInfo, Barcode, ProductError
from .config import RECALL_DB_DISABLED
from .dynamo_util import DynamoUtil
from .product_api import get_nutritionix_info, get_openfoodfact_info
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

recall_table_name = os.getenv("DYNAMODB_RECALL_TABLE")

def decode_image(product_img_bytes: bytes) -> List[Barcode]:
    np_img = np.frombuffer(product_img_bytes, np.uint8)
    product_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    decoded_products = decode(product_img)
    barcodes = [Barcode(code=product.data.decode('utf-8')) for product in decoded_products]
    return barcodes

def get_recall_info(barcode: Barcode, ddb_util: DynamoUtil) -> bool:
    if RECALL_DB_DISABLED:
        return False
    if ddb_util.scan_table(recall_table_name, "UPCs", barcode.code):
        return True
    return False

def get_products_info(barcodes: List[Barcode], ddb_util: DynamoUtil) -> Tuple[List[ProductInfo], List[ProductError]]:
    
    product_info_list: List[ProductInfo] = []
    invalid_barcodes: List[ProductError] = []
    for barcode in barcodes:

        is_recalled = get_recall_info(barcode, ddb_util)

        nutritionix_info = get_nutritionix_info(barcode)
        if type(nutritionix_info) is ProductInfo:
            nutritionix_info.recall = is_recalled
            product_info_list.append(nutritionix_info)
            continue

        openfoodfact_info = get_openfoodfact_info(barcode)
        if type(openfoodfact_info) is ProductInfo:
            openfoodfact_info.recall = is_recalled
            product_info_list.append(openfoodfact_info)
            continue
        
        invalid_barcodes.append(openfoodfact_info)
        
    return product_info_list, invalid_barcodes