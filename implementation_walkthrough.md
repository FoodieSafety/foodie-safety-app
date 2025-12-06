# User Allergy & Food Preferences - Implementation Walkthrough

## Summary
Successfully implemented the backend support for user allergy and food preferences. The changes allow users to store their diet preferences and allergen information directly in the [users](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/dao/user_dao.py#48-56) table.

---

## Files Modified

### 1. [models.py](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/util/models.py) - SQLAlchemy Model

Added three new columns to the [User](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/util/models.py#15-53) model:

```diff:models.py
from sqlalchemy import Column, String, Integer, TIMESTAMP, BigInteger, ForeignKey, Enum, Text, Table, Boolean
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association table
user_product_association = Table(
    'user_product', Base.metadata,
    Column('user_id', BigInteger, ForeignKey('users.user_id')),
    Column('product_id', BigInteger, ForeignKey('products.product_id'))
)

class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    zip_code = Column(String(10), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False
    )

    # Relationship with login_activities table
    login_activities = relationship("LoginActivity", back_populates="user", cascade="all, delete-orphan")

    # Relationship with subscriptions table
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")

    # Relationship with Product Table
    products = relationship(
        "Product",
        secondary=user_product_association,
        back_populates="users"
    )

    def __repr__(self):
        return f"<User(user_id={self.user_id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"

class LoginActivity(Base):
    __tablename__ = "login_activities"

    login_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    login_at = Column(TIMESTAMP, nullable=False)
    login_status = Column(Enum("success", "failed", name="login_status_enum"), nullable=False)
    ip_address = Column(String(50))
    device_info = Column(String(255))

    # Relationship with users table
    user = relationship("User", back_populates="login_activities")

class Newsletter(Base):
    __tablename__ = "newsletters"

    newsletter_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum("food_recall", "expiration_notice", name="newsletter_type_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False
    )


class Subscription(Base):
    __tablename__ = "subscriptions"
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    subscription_id = Column(BigInteger, primary_key=True, autoincrement=True)
    zip_code = Column(String(10), nullable=False)
    email = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    subscription_type = Column(
        Enum("food_recall", "expiration_notice", name="subscription_type_enum"),
        nullable=False
    )
    subscribed_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    status = Column(
        Enum("active", "unsubscribed", name="subscription_status_enum"),
        default="active", nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="subscriptions")

class Product(Base):
    __tablename__ = "products"
    product_id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    recall = Column(Boolean, default=False)

    # Relationship with User Table
    users = relationship(
        "User",
        secondary=user_product_association,
        back_populates="products"
    )

    def __repr__(self):
        return f"<ProductInfo(code={self.code}, name={self.name}, brand={self.brand}, recall={self.recall})>"
===
from sqlalchemy import Column, String, Integer, TIMESTAMP, BigInteger, ForeignKey, Enum, Text, Table, Boolean
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Association table
user_product_association = Table(
    'user_product', Base.metadata,
    Column('user_id', BigInteger, ForeignKey('users.user_id')),
    Column('product_id', BigInteger, ForeignKey('products.product_id'))
)

class User(Base):
    __tablename__ = "users"

    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    zip_code = Column(String(10), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password = Column(String(100), nullable=False)
    
    # Diet and Allergy Preferences
    general_diet = Column(String(50), nullable=True, default="na")
    religious_cultural_diets = Column(String(50), nullable=True, default="na")
    allergens = Column(String(500), nullable=True, default="na")  # Comma-separated
    
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False
    )

    # Relationship with login_activities table
    login_activities = relationship("LoginActivity", back_populates="user", cascade="all, delete-orphan")

    # Relationship with subscriptions table
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")

    # Relationship with Product Table
    products = relationship(
        "Product",
        secondary=user_product_association,
        back_populates="users"
    )

    def __repr__(self):
        return f"<User(user_id={self.user_id}, first_name='{self.first_name}', last_name='{self.last_name}', email='{self.email}')>"

class LoginActivity(Base):
    __tablename__ = "login_activities"

    login_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    login_at = Column(TIMESTAMP, nullable=False)
    login_status = Column(Enum("success", "failed", name="login_status_enum"), nullable=False)
    ip_address = Column(String(50))
    device_info = Column(String(255))

    # Relationship with users table
    user = relationship("User", back_populates="login_activities")

class Newsletter(Base):
    __tablename__ = "newsletters"

    newsletter_id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum("food_recall", "expiration_notice", name="newsletter_type_enum"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
        nullable=False
    )


class Subscription(Base):
    __tablename__ = "subscriptions"
    user_id = Column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    subscription_id = Column(BigInteger, primary_key=True, autoincrement=True)
    zip_code = Column(String(10), nullable=False)
    email = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    subscription_type = Column(
        Enum("food_recall", "expiration_notice", name="subscription_type_enum"),
        nullable=False
    )
    subscribed_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    status = Column(
        Enum("active", "unsubscribed", name="subscription_status_enum"),
        default="active", nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="subscriptions")

class Product(Base):
    __tablename__ = "products"
    product_id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    recall = Column(Boolean, default=False)

    # Relationship with User Table
    users = relationship(
        "User",
        secondary=user_product_association,
        back_populates="products"
    )

    def __repr__(self):
        return f"<ProductInfo(code={self.code}, name={self.name}, brand={self.brand}, recall={self.recall})>"
```

---

### 2. [schemas.py](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/util/schemas.py) - Pydantic Schemas

Added three new Optional fields to [UserBase](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/util/schemas.py#8-17):

```diff:schemas.py
from enum import Enum

from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime
from typing import Optional, List
from fastapi import UploadFile

class UserBase(BaseModel):
    first_name: str
    last_name: str
    zip_code: str
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

class SubscriptionCreate(BaseModel):
    state: str
    subscription_type: str
    status: str
    zip_code: Optional[str] = None
    email: Optional[EmailStr] = None

class SubscriptionResponse(SubscriptionCreate):
    subscription_id: int
    subscribed_at: datetime

# Enum to represent the msg type
class MsgBy(Enum):
    LLM=0
    USER=1
    SYS_PROMPT=2

# Object for individual message
class ChatMsg(BaseModel):
    by:int
    content:str

# For an individual chat session
class ChatSession(BaseModel):
    session_id:str
    msgs: List[ChatMsg]

# List of chat sessions for a user
class UserChats(BaseModel):
    user_id: int
    chats:List[ChatSession]

class ChatResponse(BaseModel):
    session_id: str
    msgs: List[ChatMsg]

# Recall Update Timestamp:
class RecallTimestamp(BaseModel):
    invocation_id: str = Field(alias="InvocationId")
    status_code: int = Field(alias="StatusCode")
    time_ms: float = Field(alias="LogTimestamp")
    time_iso: Optional[str] = None

    @validator("time_iso", pre=True, always=True)
    def convert_ms_to_iso(cls, v, values):
        ms = values.get("time_ms")
        if ms is not None:
            return datetime.fromtimestamp(ms / 1000).isoformat()
        return v

class RecallsResponse(BaseModel):
    """
    Response schema for recalls plus latest update timestamp.
    """
    recalls: List[dict]
    latest_timestamp: Optional[str] = None
    total_count: int

    class Config:
        from_attributes = True
===
from enum import Enum

from pydantic import BaseModel, EmailStr, validator, Field
from datetime import datetime
from typing import Optional, List
from fastapi import UploadFile

class UserBase(BaseModel):
    first_name: str
    last_name: str
    zip_code: str
    email: EmailStr
    # Diet and Allergy Preferences
    general_diet: Optional[str] = "na"
    religious_cultural_diets: Optional[str] = "na"
    allergens: Optional[str] = "na"  # Comma-separated string

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

class SubscriptionCreate(BaseModel):
    state: str
    subscription_type: str
    status: str
    zip_code: Optional[str] = None
    email: Optional[EmailStr] = None

class SubscriptionResponse(SubscriptionCreate):
    subscription_id: int
    subscribed_at: datetime

# Enum to represent the msg type
class MsgBy(Enum):
    LLM=0
    USER=1
    SYS_PROMPT=2

# Object for individual message
class ChatMsg(BaseModel):
    by:int
    content:str

# For an individual chat session
class ChatSession(BaseModel):
    session_id:str
    msgs: List[ChatMsg]

# List of chat sessions for a user
class UserChats(BaseModel):
    user_id: int
    chats:List[ChatSession]

class ChatResponse(BaseModel):
    session_id: str
    msgs: List[ChatMsg]

# Recall Update Timestamp:
class RecallTimestamp(BaseModel):
    invocation_id: str = Field(alias="InvocationId")
    status_code: int = Field(alias="StatusCode")
    time_ms: float = Field(alias="LogTimestamp")
    time_iso: Optional[str] = None

    @validator("time_iso", pre=True, always=True)
    def convert_ms_to_iso(cls, v, values):
        ms = values.get("time_ms")
        if ms is not None:
            return datetime.fromtimestamp(ms / 1000).isoformat()
        return v

class RecallsResponse(BaseModel):
    """
    Response schema for recalls plus latest update timestamp.
    """
    recalls: List[dict]
    latest_timestamp: Optional[str] = None
    total_count: int

    class Config:
        from_attributes = True
```

---

## Files That Required No Changes

| File | Reason |
|------|--------|
| [user_dao.py](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/dao/user_dao.py) | Dynamic field handling via `__dict__.items()` |
| [user_controller.py](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/controllers/user_controller.py) | Passthrough layer, uses updated schemas |
| [user_service.py](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/backend/app/services/user_service.py) | Uses updated schemas automatically |

---

## Database Migration Required

> [!IMPORTANT]
> Run the following SQL on your MySQL database to add the new columns:

```sql
ALTER TABLE users 
ADD COLUMN general_diet VARCHAR(50) DEFAULT 'na',
ADD COLUMN religious_cultural_diets VARCHAR(50) DEFAULT 'na',
ADD COLUMN allergens VARCHAR(500) DEFAULT 'na';
```

---

## New Data Fields

| Field | Type | Values |
|-------|------|--------|
| `general_diet` | Single value | `vegetarian`, `vegan`, `pescatarian`, `flexitarian`, `plant_based`, `raw_food`, `whole_food_diet`, `na` |
| `religious_cultural_diets` | Single value | `halal`, `kosher`, `jain`, `hindu_vegetarian_no_eggs`, `buddhist_vegetarian`, `seventh_day_adventist`, `na` |
| `allergens` | Comma-separated | `peanuts`, `tree_nuts`, `milk`, `eggs`, `wheat`, `soy`, `fish`, `shellfish`, `sesame`, `na` |

---

## Next Steps

1. **Run the SQL migration** on your MySQL database
2. **Update the frontend** [AccountPage.jsx](file:///Users/yuvaraj/Desktop/VT_Work/sem3/cap/foodie-safety-app/frontend/foodie-safety/src/AccountPage.jsx) to include UI controls for selecting preferences (see [Frontend Walkthrough](file:///Users/yuvaraj/.gemini/antigravity/brain/5c704c79-4798-46e9-9ef6-0863b7410b78/frontend_walkthrough.md))
3. **Test the API** by sending a PUT request to `/users` with the new fields
