from fastapi import FastAPI
from backend.middlewares.logging_middleware import log_requests
from lambda_function.utils.common_logging import setup_logger
from starlette.middleware.base import BaseHTTPMiddleware

logger = setup_logger(name="backend_server", to_file=False)

app = FastAPI()
app.add_middleware(BaseHTTPMiddleware, dispatch=log_requests)
logger.info("Starting FastAPI app")

@app.get("/index")
async def index() -> dict:
    return {"message": "Hello World"}

