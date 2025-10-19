import sys
import os
from fastapi.testclient import TestClient

# ✅ Dynamically add backend/app to Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
APP_DIR = os.path.join(BASE_DIR, "app")
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, APP_DIR)

# Now imports will work
from app.main import app  # noqa: E402

client = TestClient(app)

# ----------------------------------------------------
# Test FatSecret endpoint
# ----------------------------------------------------
def test_fatsecret_endpoint():
    """Test the FatSecret API integration by hitting /fatsecret endpoint."""
    params = {"query": "banana"}  # change to barcode if your endpoint expects that
    response = client.get("/fatsecret", params=params)

    print("Status code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception:
        print("Response Text:", response.text)

    # Basic assertions
    assert response.status_code == 200
    assert response.json() is not None




