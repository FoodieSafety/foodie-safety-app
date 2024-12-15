from fastapi import APIRouter
from backend.app.util.schemas import CreateUserRequest
from backend.app.controllers.user_controller import UserController

router = APIRouter(prefix="/users", tags=["users"])

# Create a new user
@router.post("", response_model=CreateUserRequest)
def create_user(user: CreateUserRequest):
    return UserController.create_user(user)