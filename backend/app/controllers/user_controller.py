from backend.app.util.schemas import CreateUserResponse, CreateUserRequest


class UserController:
    @staticmethod
    def create_user(user: CreateUserRequest) -> CreateUserResponse:
        pass