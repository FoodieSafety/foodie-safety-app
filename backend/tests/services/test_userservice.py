import unittest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from backend.app.util.schemas import TokenData
from backend.app.services.user_service import router as user_router
from backend.app.services.auth import router as login_router

class TestUserService(unittest.TestCase):
    def setUp(self):
        self.session = Session
        self.user_token = TokenData(user_id=1)
        self.user_client = TestClient(user_router)
        self.login_client = TestClient(login_router)

    def test_create_user(self):
        create_user_form = {'username': "test", 'email': "test@test.com", 'password': "test"}
        response = self.user_client.post("/users", json=create_user_form)
        self.assertEqual(response.status_code, 201)
        user_response = response.json()
        self.assertEqual(user_response.get('username'), "test")

    def test_get_user(self):
        response = self.user_client.get("/users/1")
        self.assertEqual(response.status_code, 200)
        user_response = response.json()
        self.assertIsNotNone(user_response)
        print(user_response)

    def test_update_user(self):
        credentials = {'username': 'test', 'password': 'test'}
        login_response = self.login_client.post("/login", data=credentials)
        self.assertEqual(login_response.status_code, 200)
        access_token = login_response.json()["access_token"]
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        create_user_form = {'username': "test2", 'email': "test2@test2.com", 'password': "test2"}
        response = self.user_client.put("/users", json=create_user_form, headers=headers)
        user_response = response.json()
        self.assertEqual(user_response.get('username'), "test2")

    def test_delete_user(self):
        credentials = {'username': 'test2', 'password': 'test2'}
        login_response = self.login_client.post("/login", data=credentials)
        self.assertEqual(login_response.status_code, 200)
        access_token = login_response.json()["access_token"]
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        response = self.user_client.delete("/users", headers=headers)
        self.assertEqual(response.status_code, 204)

def suite():
    suite = unittest.TestSuite()
    suite.addTest(TestUserService("test_create_user"))
    suite.addTest(TestUserService("test_update_user"))
    suite.addTest(TestUserService("test_delete_user"))
    return suite

if __name__ == "__main__":
    unittest.TextTestRunner().run(suite())