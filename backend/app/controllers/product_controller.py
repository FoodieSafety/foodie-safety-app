from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductInfo, Barcode, ProductError, TokenData
from ..util.barcode_scanner import get_products_info
from ..dao.product_dao import ProductDao
from ..util.dynamo_util import DynamoUtil

class ProductController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def upload_products(barcodes: List[Barcode], db: Session, ddb_util: DynamoUtil, token_data: TokenData) -> Tuple[List[ProductInfo], List[ProductError]]:
        products, invalid_barcodes = get_products_info(barcodes=barcodes, ddb_util=ddb_util)
        user_id = token_data.user_id
        return ProductDao.upload_products(products=products, db=db, user_id=user_id), invalid_barcodes
    
    @staticmethod
    def get_products(db: Session, token_data: TokenData) -> List[ProductInfo]:
        user_id = token_data.user_id
        return ProductDao.get_products(db=db, user_id=user_id)
    
    @staticmethod
    def delete_products(barcodes: List[Barcode], db: Session, token_data: TokenData) -> Tuple[List[ProductInfo], List[ProductError]]:
        user_id = token_data.user_id
        return ProductDao.delete_products(barcodes=barcodes, db=db, user_id=user_id)