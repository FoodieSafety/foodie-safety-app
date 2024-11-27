from fastapi import FastAPI
from backend.middlewares.logging_middleware import log_requests
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)

@app.get("/index")
async def index() -> dict:
    return {"message": "Hello World"}

