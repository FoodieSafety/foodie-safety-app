import unittest
from passlib.context import CryptContext
from backend.app.util.hash import hash_password, verify_password

class TestPasswordUtils(unittest.TestCase):
    def setUp(self):
        """
        Set up CryptContext for testing
        """
        self.plain_password = "TestPassword123"
        self.wrong_password = "WrongPassword123"

    def test_hash_password(self):
        """
        Test hashing a password
        """
        hashed_password = hash_password(self.plain_password)
        # Ensure the hashed password is not equal to the plain password
        self.assertNotEqual(self.plain_password, hashed_password)
        # Check that the hashed password is a non-empty string
        self.assertIsInstance(hashed_password, str)
        self.assertTrue(len(hashed_password) > 0)

    def test_verify_password_success(self):
        """
        Test password verification (valid password)
        """
        hashed_password = hash_password(self.plain_password)
        # Verify the correct password matches the hash
        result = verify_password(self.plain_password, hashed_password)
        self.assertTrue(result)

    def test_verify_password_failure(self):
        """
        Test password verification (invalid password)
        """
        hashed_password = hash_password(self.plain_password)
        # Verify that a wrong password does not match the hash
        result = verify_password(self.wrong_password, hashed_password)
        self.assertFalse(result)

if __name__ == "__main__":
    unittest.main()