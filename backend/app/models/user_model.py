from backend.app.util.database import get_connection
from typing import List


class UserModel:
    @staticmethod
    def get_users() -> List[dict]:
        """
        Get all users from the database
        :return: all users
        """
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users")
                return cur.fetchall()

    @staticmethod
    def get_user_by_id(user_id: int) -> dict:
        """
        Get a user by their ID
        :param user_id: the ID of the user
        :return: the user
        """
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id))
                return cur.fetchone()


