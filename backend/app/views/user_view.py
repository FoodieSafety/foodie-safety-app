from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.app.util.schemas import UserCreate, UserResponse
from backend.app.controllers.user_controller import UserController

router = APIRouter(prefix="/users", tags=["users"])

# Get users
@router.get("", response_model=List[UserResponse])
def get_users():
    return UserController.get_users()

# Get user by ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int):
    return UserController.get_user_by_id(user_id)


# Create a new user
# @router.post("", response_model=UserRequest, status_code=status.HTTP_201_CREATED)
# def create_user(user: UserRequest):
#     return UserController.create_user(user)