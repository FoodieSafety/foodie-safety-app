from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    created_at: datetime

class UserUpdate(UserBase):
    updated_at: datetime


