from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductBase, Barcode
from ..util.barcode_scanner import decode_image, get_products_info

class ProductController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def upload_products(product_img_bytes: bytes) -> Tuple[List[ProductBase], List[Barcode]]:
        barcodes = decode_image(product_img_bytes=product_img_bytes)
        products, invalid_barcodes = get_products_info(barcodes=barcodes)
        return products, invalid_barcodes