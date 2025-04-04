from fastapi import APIRouter, status
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import List
from ..util.schemas import UserCreate, UserResponse
from ..controllers.user_controller import UserController
from ..util.database import get_db
from ..util.oauth2 import get_current_user
# Create a router object
router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user
    :param user: input user JSON
    :param db: session object
    :return: response
    """
    return UserController.create_user(user, db)

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """
    Get all users
    :param db: session object
    :return: response
    """
    return UserController.get_users(db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """
    Get user by ID
    :param user_id: input user id
    :param db: session object
    :return: response
    """
    return UserController.get_user_by_id(user_id, db)

@router.put("", response_model=UserResponse)
def update_user(
        user: UserCreate,
        db: Session = Depends(get_db),
        token_data = Depends(get_current_user)
):
    """
    Update user by id
    :param user: input user JSON
    :param db: session object
    :param token_data: token
    :return: response
    """
    return UserController.update_user(user, db, token_data)

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
        db: Session = Depends(get_db),
        token_data = Depends(get_current_user)
):
    """
    Delete user by id
    :param db: session object
    :param token_data: token
    :return: response
    """
    return UserController.delete_user(db, token_data)
