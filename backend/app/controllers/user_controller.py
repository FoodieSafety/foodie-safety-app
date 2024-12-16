from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from backend.app.util.schemas import UserCreate, UserResponse
from backend.app.models.user_model import UserModel


class UserController:

    @staticmethod
    def create_user(user: UserCreate, db: Session) -> UserResponse:
        return UserModel.create_user(user, db)


    @staticmethod
    def get_users(db: Session) -> List[UserResponse]:
        return UserModel.get_users(db)

    @staticmethod
    def get_user_by_id(user_id: int, db: Session) -> UserResponse:
        return UserModel.get_user_by_id(user_id, db)

    @staticmethod
    def update_user(user_id: int, user: UserCreate, db: Session) -> UserResponse:
        pass
