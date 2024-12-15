from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRequest(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime
