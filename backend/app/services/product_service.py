from fastapi import APIRouter, status, Form, Depends
from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductInfo, Barcode, ProductError
from ..controllers.product_controller import ProductController
from ..util.database import get_db
from ..util.oauth2 import get_current_user

# Create router object
router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=Tuple[List[ProductInfo], List[ProductError]], status_code=status.HTTP_202_ACCEPTED)
async def upload_products(
        str_barcodes: List[str] = Form(...),
        db: Session = Depends(get_db),
        token_data = Depends(get_current_user)
):
    """
    Upload a product
    :param product: input product barcode
    :param db: session object
    :param token_data: token
    :return: response
    """
    barcodes = [Barcode(code=str_code) for str_code in str_barcodes]
    return ProductController.upload_products(barcodes=barcodes, db=db, token_data=token_data)

@router.get("", response_model=List[ProductInfo])
async def get_products(
        db: Session = Depends(get_db),
        token_data = Depends(get_current_user)
):
    """
    Get uploaded products
    :param db: session object
    :param token_data: token
    :return: response
    """
    return ProductController.get_products(db=db, token_data=token_data)