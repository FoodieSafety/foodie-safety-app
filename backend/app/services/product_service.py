from fastapi import APIRouter, status, Form
from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductInfo, Barcode, ProductError
from ..controllers.product_controller import ProductController

# Create router object
router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=Tuple[List[ProductInfo], List[ProductError]], status_code=status.HTTP_202_ACCEPTED)
async def upload_products(str_barcodes: List[str] = Form(...)):
    """
    Upload a product
    :param product: input product barcode
    :param db: session object
    :return: response
    """
    barcodes = [Barcode(code=str_code) for str_code in str_barcodes]
    return ProductController.upload_products(barcodes=barcodes)