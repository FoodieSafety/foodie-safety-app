import unittest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from backend.app.util.schemas import TokenData
from backend.app.services.product_service import router

class TestProductService(unittest.TestCase):
    def setUp(self):
        self.session = Session
        self.user_token = TokenData(user_id=1)
        self.img_path: str = f"backend/tests/images/greatvaluetrailmix.png"
        self.client = TestClient(router)

    def test_product_upload(self):
        with open(file=self.img_path, mode="rb") as img_file:
            img_stream = {"product_file": (self.img_path, img_file, "image/png")}
            data = {"db": None, "token_data": None}
            response = self.client.post("/products", files=img_stream)
        self.assertEqual(response.status_code, 202)
        products, bad_barcodes = response.json()
        print(products)
        self.assertGreater(len(products), 0)

if __name__ == "__main__":
    unittest.main()