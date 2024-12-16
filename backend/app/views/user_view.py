from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.util.schemas import UserCreate, UserResponse
from backend.app.controllers.user_controller import UserController
from backend.app.util.database import get_db
router = APIRouter(prefix="/users", tags=["users"])


# Create a new user
@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return UserController.create_user(user, db)

# Get users
@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return UserController.get_users(db)

# Get user by ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    return UserController.get_user_by_id(user_id, db)

# Update user by ID
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserCreate, db: Session = Depends(get_db)):
    return UserController.update_user(user_id, user, db)

# Delete user by ID
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return UserController.delete_user(user_id, db)
