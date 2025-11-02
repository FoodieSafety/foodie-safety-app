import os
from fastapi import APIRouter, status, Form, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Tuple

from ..dao.chat_dao import ChatDao
from ..util.schemas import ProductInfo, Barcode, ProductError, UserChats, ChatMsg, MsgBy
from ..controllers.product_controller import ProductController
from ..util.database import get_db
from ..util.oauth2 import get_current_user
from ..util.dynamo_util import DynamoUtil, get_ddb_util

# Create router object
router = APIRouter(prefix="/products", tags=["Products"])



@router.post("", response_model=Tuple[List[ProductInfo], List[ProductError]], status_code=status.HTTP_202_ACCEPTED)
async def upload_products(
        str_barcodes: List[str] = Form(...),
        db: Session = Depends(get_db),
        ddb_util: DynamoUtil = Depends(get_ddb_util),
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
    return ProductController.upload_products(barcodes=barcodes, db=db, ddb_util=ddb_util, token_data=token_data)

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

@router.delete("", response_model=Tuple[List[ProductInfo], List[ProductError]], status_code=status.HTTP_202_ACCEPTED)
async def delete_products(
     str_barcodes: List[str] = Form(...),
     db: Session = Depends(get_db),
     token_data = Depends(get_current_user)
):
     """
     Delete uploaded products
     :param str_barcodes: list of barcode strings
     :param db: session object
     :param token_data: token
     :return: response
     """
     barcodes = [Barcode(code=str_code) for str_code in str_barcodes]
     return ProductController.delete_products(barcodes=barcodes, db=db, token_data=token_data)