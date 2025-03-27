from typing import List, Tuple
import cv2
from pyzbar.pyzbar import decode
import requests
import numpy as np
from .schemas import ProductInfo, Barcode, ProductError
from .config import OPENFOOD_API_URL

def decode_image(product_img_bytes: bytes) -> List[Barcode]:
    np_img = np.frombuffer(product_img_bytes, np.uint8)
    product_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    decoded_products = decode(product_img)
    barcodes = [Barcode(code=product.data.decode('utf-8')) for product in decoded_products]
    return barcodes

def get_products_info(barcodes: List[Barcode]) -> Tuple[List[ProductInfo], List[ProductError]]:
    product_info_list: List[ProductInfo] = []
    invalid_barcodes: List[ProductError] = []
    for barcode in barcodes:
        product_response = requests.get(f"{OPENFOOD_API_URL}{barcode.code}.json")
        if product_response.status_code == 200:
            product_json = product_response.json()
            product_info_list.append(ProductInfo(code=barcode.code, name=product_json['product'].get('product_name'), brand=product_json['product'].get('brand_owner')))
        else:
            invalid_barcodes.append(ProductError(code=barcode.code, status_code=product_response.status_code))
    return product_info_list, invalid_barcodes