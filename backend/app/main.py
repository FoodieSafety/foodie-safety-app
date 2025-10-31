import os

from fastapi import FastAPI

from app.util.dynamo_util import DynamoUtil, get_ddb_util
from middlewares.logging_middleware import log_requests
from app.services.user_service import router as user_router
from app.services.auth import router as auth_router
from app.services.product_service import router as product_router
from app.routes.subscription_routes import router as subscription_router
from middlewares.cors_middleware import add_cors
# Create a FastAPI instance
app = FastAPI()

# Add middleware
app.middleware("http")(log_requests)
app = add_cors(app=app)

get_ddb_util().init_chat_tables(f"{os.getenv('DYNAMODB_CHAT_TABLE')}")

# Include Routers
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(subscription_router)

@app.get("/")
async def index() -> dict:
    return {"message": "Welcome to Foodie-Safety!"}

