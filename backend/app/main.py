from fastapi import FastAPI
from backend.utils.common_logging import CommonLogger, log_execution_time
# Create main application
app = FastAPI()

# Create logger
logger = CommonLogger("main function")
@app.get("/")
@log_execution_time
async def root():
    logger.error("Error!!!")
    return {"message": "Hello World"}
