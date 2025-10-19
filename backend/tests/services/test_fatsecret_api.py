# tests/services/test_fatsecret_api.py

import sys
import os

# Ensure "backend/app" is on sys.path when running pytest from repo root or from backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # -> backend
APP_DIR = os.path.join(BASE_DIR, "app")
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from app.util.product_api import get_fatsecret_info  # util-level function (no API route)
from app.util.schemas import Barcode, ProductInfo, ProductError


# ----------------------------------------------------
# FatSecret util tests (no real network; monkeypatched)
# ----------------------------------------------------
def test_fatsecret_info_success(monkeypatch):
    """FatSecret returns a matching food → should produce ProductInfo."""
    class FakeResp:
        status_code = 200
        def raise_for_status(self): pass
        def json(self):
            return {
                "foods": {
                    "food": [{
                        "food_name": "Mocked Banana",
                        "brand_name": "MockBrand",
                        "food_description": "Mock desc",
                    }]
                }
            }

    import requests
    monkeypatch.setattr(requests, "get", lambda *a, **k: FakeResp())

    out = get_fatsecret_info(Barcode(code="012345"))
    assert isinstance(out, ProductInfo)
    assert out.name == "Mocked Banana"
    assert out.brand == "MockBrand"
    # util functions set recall=False; barcode_scanner applies recall later
    assert out.recall is False


def test_fatsecret_info_no_match(monkeypatch):
    """FatSecret returns 200 but no foods → should produce ProductError(404)."""
    class FakeResp:
        status_code = 200
        def raise_for_status(self): pass
        def json(self):
            return {"foods": {"food": []}}

    import requests
    monkeypatch.setattr(requests, "get", lambda *a, **k: FakeResp())

    out = get_fatsecret_info(Barcode(code="000"))
    assert isinstance(out, ProductError)
    assert out.status_code == 404


def test_fatsecret_info_http_error(monkeypatch):
    """FatSecret returns non-200 → should produce ProductError(status_code)."""
    class FakeResp:
        status_code = 401
        def raise_for_status(self): pass
        def json(self): return {}

    import requests
    monkeypatch.setattr(requests, "get", lambda *a, **k: FakeResp())

    out = get_fatsecret_info(Barcode(code="bad-auth"))
    assert isinstance(out, ProductError)
    assert out.status_code == 401
