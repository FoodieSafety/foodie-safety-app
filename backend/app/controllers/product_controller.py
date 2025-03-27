from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductInfo, Barcode, ProductError, TokenData
from ..util.barcode_scanner import get_products_info
from ..dao.product_dao import ProductDao

class ProductController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def upload_products(barcodes: List[Barcode], db: Session, token_data: TokenData) -> Tuple[List[ProductInfo], List[ProductError]]:
        products, invalid_barcodes = get_products_info(barcodes=barcodes)
        user_id = token_data.user_id
        return ProductDao.upload_products(products=products, db=db, user_id=user_id), invalid_barcodes
    
    @staticmethod
    def get_products(db: Session, token_data: TokenData) -> List[ProductInfo]:
        user_id = token_data.user_id
        return ProductDao.get_products(db=db, user_id=user_id)