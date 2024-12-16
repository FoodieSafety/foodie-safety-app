from fastapi import HTTPException, status
from typing import List
from backend.app.util.schemas import UserCreate, UserResponse
from backend.app.models.user_model import UserModel


class UserController:
    @staticmethod
    def get_users() -> List[UserResponse]:
        users = UserModel.get_users()
        return [UserResponse(**user) for user in users]

    @staticmethod
    def get_user_by_id(user_id: int) -> UserResponse:
        user = UserModel.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse(**user)

    # @staticmethod
    # def create_user(user: UserRequest) -> UserResponse:
    #     return UserModel.create_user(user)