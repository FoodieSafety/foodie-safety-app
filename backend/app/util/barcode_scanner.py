import os
from typing import List, Tuple
import cv2
import numpy as np
from sqlalchemy.orm import Session

from .models import Product
from .schemas import ProductInfo, Barcode, ProductError
from .config import RECALL_DB_DISABLED
from .dynamo_util import DynamoUtil
from .product_api import get_nutritionix_info, get_openfoodfact_info, get_fatsecret_info 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

recall_table_name = os.getenv("DYNAMODB_RECALL_TABLE")

# def decode_image(product_img_bytes: bytes) -> List[Barcode]:
#     np_img = np.frombuffer(product_img_bytes, np.uint8)
#     product_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
#     decoded_products = decode(product_img)
#     barcodes = [Barcode(code=product.data.decode('utf-8')) for product in decoded_products]
#     return barcodes

def get_recall_info(barcode: Barcode, ddb_util: DynamoUtil) -> bool:
    """
    Check if a given product barcode is in the recall database table.
    """
    if RECALL_DB_DISABLED:
        return False
    if ddb_util.scan_table(recall_table_name, "contains", "UPCs", barcode.code):
        return True
    return False

def get_products_info(barcodes: List[Barcode], ddb_util: DynamoUtil, db:Session) -> Tuple[List[ProductInfo], List[ProductError]]:
    
    product_info_list: List[ProductInfo] = []
    invalid_barcodes: List[ProductError] = []
    db_products = check_db_for_upcs(barcodes, db) # Get codes for the list of barcodes if any existed

    for barcode in barcodes:
        is_recalled = get_recall_info(barcode, ddb_util)
        db_present = False # Initialize a flag for db check
        for product in db_products: # Iterate over the list of db fetched products and check if any of the codes exist in the list
            if product.code == barcode.code:
                product_info_list.append(product) # If exists, use the info from db and append it to product_info_listy
                db_present = True # Update flag to true
                break # break the inner loop
        if not db_present: # Check flag and proceed for API calls

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


def check_db_for_upcs(barcodes:List[Barcode], db:Session):
    """
    Function designed to get a list of barcodes from the Product table. Went with the flow since
    get_products_info already gets List[Barcode] as a param. In the future, in case we are multiple barcodes we don't have
    to hit the DB for each code
    """
    codes = [barcode.code for barcode in barcodes]
    products = db.query(Product).filter(Product.code.in_(codes)).all()
    # Ignore IDE warnings in the below line with respect to expected type. Check on this only if you feel this is the issue.
    product_info_list = [ProductInfo(code = product.code, name=product.name, brand=product.brand, recall=False) for product in products]
    return product_info_list
