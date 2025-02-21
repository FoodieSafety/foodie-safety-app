import unittest
from backend.app.util.barcode_scanner import decode_image, get_products_info

class TestBarcodeScanner(unittest.TestCase):
    def setUp(self):
        self.img_path: str = f"backend/tests/images/greatvaluetrailmix.png"
        with open(file=self.img_path, mode="rb") as img_file:
            self.img_bytes = img_file.read()

    # Test reading of barcode from images
    def test_decode_image(self):
        barcodes = decode_image(product_img_bytes=self.img_bytes)
        print(barcodes)
        self.assertGreater(len(barcodes), 0)

    # Test getting product information
    def test_get_product_info(self):
        barcodes = decode_image(product_img_bytes=self.img_bytes)
        products, bad_barcodes = get_products_info(barcodes=barcodes)
        print(products)
        self.assertGreater(len(products), 0)

if __name__ == "__main__":
    unittest.main()