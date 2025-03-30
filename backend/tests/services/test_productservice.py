import unittest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from backend.app.util.schemas import TokenData
from backend.app.services.product_service import router as product_router
from backend.app.services.user_service import router as user_router
from backend.app.services.auth import router as login_router

class TestProductService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup DB and routers
        cls.session = Session
        # self.img_path: str = f"backend/tests/images/greatvaluetrailmix.png"
        cls.product_client = TestClient(product_router)
        cls.user_client = TestClient(user_router)
        cls.login_client = TestClient(login_router)
        # Create test user if not present
        create_user_form = {'username': "test", 'email': "test@test.com", 'password': "test"}
        cls.user_client.post("/users", json=create_user_form)
        # Login to test user
        credentials = {'username': 'test', 'password': 'test'}
        login_response = cls.login_client.post("/login", data=credentials)
        cls.access_token = login_response.json()["access_token"]

    @classmethod
    def tearDownClass(cls):
        headers = {
            "Authorization": f"Bearer {cls.access_token}"
        }
        cls.user_client.delete("/users", headers=headers)

    def test_product_upload(self):
        # with open(file=self.img_path, mode="rb") as img_file:
        #     img_stream = {"product_file": (self.img_path, img_file, "image/png")}
        #     data = {"db": None, "token_data": None}
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        upload_form = {'str_barcodes': ["0078742237145", "044000034207"]} 
        response = self.product_client.post("/products", data=upload_form, headers=headers)
        self.assertEqual(response.status_code, 202)
        products, bad_barcodes = response.json()
        print(products)
        self.assertGreater(len(products), 0)

    def test_get_products(self):
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        response = self.product_client.get("/products", headers=headers)
        self.assertEqual(response.status_code, 200)
        products = response.json()
        print(products)
        self.assertGreater(len(products), 0)

def suite():
    suite = unittest.TestSuite()
    suite.addTest(TestProductService("test_product_upload"))
    suite.addTest(TestProductService("test_get_products"))
    return suite

if __name__ == "__main__":
    unittest.TextTestRunner().run(suite())