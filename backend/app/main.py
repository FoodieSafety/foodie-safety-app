from fastapi import FastAPI
from backend.middlewares.logging_middleware import log_requests
from backend.app.views.user_view import router as user_router
from backend.app.util.models import Base
from backend.app.util.database import engine

# Create a FastAPI instance
app = FastAPI()

# Add middleware
app.middleware("http")(log_requests)

# Include Routers
app.include_router(user_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
async def index() -> dict:
    return {"message": "Welcome to Foodie-Safety!"}

