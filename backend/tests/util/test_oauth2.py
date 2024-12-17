import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta, timezone
from backend.app.util.oauth2 import create_access_token, validate_access_token, get_current_user
from backend.app.util.schemas import TokenData
import jwt
from fastapi import HTTPException, status


class TestJWTHandler(unittest.TestCase):
    def setUp(self):
        """
        Set up environment variables and test data
        """
        self.secret_key = "test_secret"
        self.algorithm = "HS256"
        self.expire_time = 15  # minutes
        self.test_user_data = {"user_id": 123}
        self.valid_token = None
        self.invalid_token = "invalid.token.payload"

        # Patch environment variables
        patcher = patch.dict(
            "os.environ",
            {
                "SECRET_KEY": self.secret_key,
                "ALGORITHM": self.algorithm,
                "EXPIRE_TIME": str(self.expire_time),
            },
        )
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_create_access_token(self):
        """
        Test that create_access_token generates a valid JWT token
        """
        expire_delta = timedelta(minutes=30)
        token = create_access_token(self.test_user_data, expire_delta)

        # Decode the token to verify payload
        decoded_payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])

        self.assertEqual(decoded_payload["user_id"], self.test_user_data["user_id"])
        self.assertIn("exp", decoded_payload)

        # Verify expiration time
        expected_exp = (datetime.now(timezone.utc) + expire_delta).timestamp()
        self.assertAlmostEqual(decoded_payload["exp"], expected_exp, delta=5)

    def test_validate_access_token_valid(self):
        """
        Test validate_access_token with a valid token
        """
        # Create a valid token
        token = create_access_token(self.test_user_data)
        exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

        # Validate the token
        token_data = validate_access_token(token, exception)
        self.assertIsInstance(token_data, TokenData)
        self.assertEqual(token_data.user_id, self.test_user_data["user_id"])

    def test_validate_access_token_invalid(self):
        """
        Test validate_access_token raises exception for invalid token
        """
        exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

        with self.assertRaises(HTTPException) as context:
            validate_access_token(self.invalid_token, exception)

        self.assertEqual(context.exception.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(context.exception.detail, "Invalid credentials")

    @patch("backend.app.util.oauth2.oauth2_scheme")
    def test_get_current_user(self, mock_oauth2_scheme):
        """
        Test get_current_user returns TokenData for a valid token
        """
        # Mock the OAuth2PasswordBearer dependency to return a valid token
        token = create_access_token(self.test_user_data)
        mock_oauth2_scheme.return_value = token

        # Call get_current_user
        user = get_current_user(token)
        self.assertIsInstance(user, TokenData)
        self.assertEqual(user.user_id, self.test_user_data["user_id"])

    @patch("backend.app.util.oauth2.oauth2_scheme")
    def test_get_current_user_invalid_token(self, mock_oauth2_scheme):
        """
        Test get_current_user raises exception for an invalid token
        """
        # Mock the OAuth2PasswordBearer dependency to return an invalid token
        mock_oauth2_scheme.return_value = self.invalid_token

        exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

        # Call get_current_user and expect an exception
        with self.assertRaises(HTTPException) as context:
            get_current_user(self.invalid_token)

        self.assertEqual(context.exception.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(context.exception.detail, "Invalid credentials")


if __name__ == "__main__":
    unittest.main()