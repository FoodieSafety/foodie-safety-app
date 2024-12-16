from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import BIGINT


class UserBase(BaseModel):
    username: str
    email: str
    created_at: datetime

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    pass
