from fastapi import APIRouter, status, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Tuple
from ..util.schemas import ProductBase, ImageBase, Barcode
from ..controllers.product_controller import ProductController

# Create router object
router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=Tuple[List[ProductBase], List[Barcode]], status_code=status.HTTP_202_ACCEPTED)
async def upload_products(product_file: UploadFile = File(...)):
    """
    Upload a product
    :param product: input product barcode
    :param db: session object
    :return: response
    """
    try:
        product_img_wrapper = ImageBase(filestream=product_file)
        product_img_stream = product_img_wrapper.filestream
        product_img_bytes = await product_img_stream.read()
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid image type")
    return ProductController.upload_products(product_img_bytes=product_img_bytes)