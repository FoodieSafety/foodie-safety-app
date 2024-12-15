from fastapi import FastAPI
from backend.middlewares.logging_middleware import log_requests
from starlette.middleware.base import BaseHTTPMiddleware

# Create a FastAPI instance
app = FastAPI()

# Add middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

# Include Routers

@app.get("/")
async def index() -> dict:
    return {"message": "Welcome to Foodie-Safety!"}

