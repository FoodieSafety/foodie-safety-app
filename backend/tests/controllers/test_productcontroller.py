import unittest
from sqlalchemy.orm import Session
from backend.app.util.schemas import TokenData
from backend.app.controllers.product_controller import ProductController

class TestProductController(unittest.TestCase):
    def setUp(self):
        self.session = Session
        self.user_token = TokenData(user_id=1)
        self.img_path: str = f"backend/tests/images/greatvaluetrailmix.png"
        with open(file=self.img_path, mode="rb") as img_file:
            self.img_bytes = img_file.read()

    def test_product_upload(self):
        products, bad_barcodes = ProductController.upload_products(product_img_bytes=self.img_bytes)
        print(products)
        self.assertGreater(len(products), 0)

if __name__ == "__main__":
    unittest.main()