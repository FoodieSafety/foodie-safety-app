from typing import List


class UserModel:
    @staticmethod
    def get_users() -> List[dict]:
        """
        Get all users from the database
        :return: all users
        """
        pass

    @staticmethod
    def get_user_by_id(user_id: int) -> dict:
        """
        Get a user by their ID
        :param user_id: the ID of the user
        :return: the user
        """
        pass
