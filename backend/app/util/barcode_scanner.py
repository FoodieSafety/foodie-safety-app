from typing import List, Tuple
import cv2
from pyzbar.pyzbar import decode
import requests
import numpy as np
from .schemas import ProductBase, Barcode
from .config import OPENFOOD_API_URL

def decode_image(product_img_bytes: bytes) -> List[Barcode]:
    np_img = np.frombuffer(product_img_bytes, np.uint8)
    product_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    decoded_products = decode(product_img)
    barcodes = [Barcode(type=product.type, code=product.data.decode('utf-8')) for product in decoded_products]
    return barcodes

def get_products_info(barcodes: List[Barcode]) -> Tuple[List[ProductBase], List[Barcode]]:
    product_info_list: List[ProductBase] = []
    invalid_barcodes: List[Barcode] = []
    for barcode in barcodes:
        product_response = requests.get(f"{OPENFOOD_API_URL}{barcode.code}.json")
        # Check if json is valid
        if product_response.status_code == 200:
            product_json = product_response.json()
            product_info_list.append(ProductBase(barcode=barcode, name=product_json['product']['product_name'], brand=product_json['product']['brand_owner']))
        else:
            invalid_barcodes.append(barcode)
        # else:
        #     raise Exception(f"Received status code {product_response.status_code} for {barcode.code}")
    return product_info_list, invalid_barcodes