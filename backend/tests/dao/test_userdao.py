import unittest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.util.schemas import UserCreate, UserResponse
from backend.app.util.models import User
from backend.app.dao.user_dao import UserDao
from datetime import datetime, timezone


class TestUserDao(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock(spec=Session)
        self.user_data = UserCreate(username="testuser", email="test@test.com", password="Test1234!")
        self.mock_user = User(
            user_id=1,
            username="testuser",
            email="test@test.com",
            password="hashedpassword",
            created_at=datetime.now(timezone.utc),  # Add this field
            updated_at=datetime.now(timezone.utc)
        )

    def test_create_user_success(self):
        # Simulate no existing user (no duplication)
        self.db.query().filter().first.return_value = None

        # Simulate the commit and refresh
        self.db.add = MagicMock()
        self.db.commit = MagicMock()
        self.db.refresh = MagicMock()

        # Call create_user
        result = UserDao.create_user(self.user_data, self.db)

        # Assertions
        self.db.add.assert_called_once()
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.username, self.user_data.username)
        self.assertEqual(result.email, self.user_data.email)

    def test_create_user_success(self):
        # Simulate no existing user
        self.db.query().filter().first.return_value = None

        # Simulate user creation
        self.db.add = MagicMock()
        self.db.commit = MagicMock()
        self.db.refresh = MagicMock()

        # Add the necessary fields to new_user
        new_user = User(
            user_id=1,
            username=self.user_data.username,
            email=self.user_data.email,
            password="hashedpassword",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Mock db.refresh
        self.db.refresh.side_effect = lambda obj: obj.__dict__.update(new_user.__dict__)

        # Call create_user
        result = UserDao.create_user(self.user_data, self.db)

        # Assertions
        self.db.add.assert_called_once()
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.username, self.user_data.username)
        self.assertEqual(result.created_at, new_user.created_at)

    def test_get_users(self):
        # Simulate a list of users
        mock_query = MagicMock()
        mock_query.all.return_value = [self.mock_user]

        # Mock db.query to return the mock query
        self.db.query.return_value = mock_query

        # Call get_users
        result = UserDao.get_users(self.db)

        # Assertions
        self.db.query.assert_called_once_with(User)  # Ensure query is called with the User model
        mock_query.all.assert_called_once()  # Ensure all() is called on the query result
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].username, self.mock_user.username)

    def test_get_user_by_id_success(self):
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_filter.first.return_value = self.mock_user

        # Mock db.query to return mock_filter when chained
        mock_query.filter.return_value = mock_filter
        self.db.query.return_value = mock_query

        # Call get_user_by_id
        result = UserDao.get_user_by_id(1, self.db)

        # Assertions
        self.db.query.assert_called_once()
        self.assertEqual(result.username, self.mock_user.username)
        self.assertEqual(result.created_at, self.mock_user.created_at)

    def test_get_user_by_id_not_found(self):
        # Simulate no user found
        self.db.query().filter().first.return_value = None

        with self.assertRaises(HTTPException) as context:
            UserDao.get_user_by_id(1, self.db)

        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(context.exception.detail, "User with id 1 not found")

    def test_update_user_success(self):
        # Simulate existing user
        existing_user = User(user_id=1, username="olduser", email="old@test.com", password="hashedpassword")
        self.db.query().filter().first.side_effect = [existing_user, None]  # First call finds the user, second checks for duplicates

        updated_data = UserCreate(username="newuser", email="new@test.com", password="NewPass123!")

        # Call update_user
        result = UserDao.update_user(updated_data, self.db, 1)

        # Assertions
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.username, updated_data.username)
        self.assertEqual(result.email, updated_data.email)

    def test_update_user_success(self):
        existing_user = User(
            user_id=1,
            username="olduser",
            email="old@test.com",
            password="hashedpassword",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        # Simulate finding the existing user and no duplicate
        self.db.query().filter().first.side_effect = [existing_user, None]

        updated_data = UserCreate(username="newuser", email="new@test.com", password="NewPass123!")

        # Mock refresh
        self.db.refresh.side_effect = lambda obj: obj.__dict__.update(
            username=updated_data.username,
            email=updated_data.email,
            password="new_hashed_password",
            updated_at=datetime.utcnow(),
        )

        # Call update_user
        result = UserDao.update_user(updated_data, self.db, 1)

        # Assertions
        self.db.commit.assert_called_once()
        self.db.refresh.assert_called_once()
        self.assertEqual(result.username, updated_data.username)

    def test_delete_user_success(self):
        # Simulate existing user
        self.db.query().filter().first.return_value = self.mock_user

        # Call delete_user
        UserDao.delete_user(self.db, 1)

        # Assertions
        self.db.delete.assert_called_once_with(self.mock_user)
        self.db.commit.assert_called_once()

    def test_delete_user_not_found(self):
        # Simulate no user found
        self.db.query().filter().first.return_value = None

        with self.assertRaises(HTTPException) as context:
            UserDao.delete_user(self.db, 1)

        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(context.exception.detail, "User with id 1 not found")


if __name__ == "__main__":
    unittest.main()