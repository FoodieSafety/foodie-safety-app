from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str

class CreateUserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    updated_at: datetime
