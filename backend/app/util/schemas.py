from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
from fastapi import UploadFile

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    created_at: datetime

class UserUpdate(UserBase):
    updated_at: datetime

class UserLogin(UserBase):
    password: str

# For validating token
class Token(BaseModel):
    access_token: str
    token_type: str

# The data to embed in the token
class TokenData(BaseModel):
    user_id: Optional[int]

# The data to store files
class FileBase(BaseModel):
    filestream: UploadFile


class ImageBase(FileBase):
    @validator('filestream')
    def validate_image(cls, filestream):
        if filestream.content_type not in ["image/png", "image/jpg"]:
            raise ValueError(f"Invalid image type: {filestream.content_type}")
        return filestream

# Barcode Information
class Barcode(BaseModel):
    code: str

# Error details for Product Requests
class ProductError(Barcode):
    status_code: int

# Returned details for successful Product Requests
class ProductInfo(Barcode):
    name: str
    brand: str
    recall: bool = False