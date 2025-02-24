from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductInfo, Barcode, ProductError
from ..util.barcode_scanner import get_products_info

class ProductController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def upload_products(barcodes: List[Barcode]) -> Tuple[List[ProductInfo], List[ProductError]]:
        products, invalid_barcodes = get_products_info(barcodes=barcodes)
        return products, invalid_barcodes