from fastapi import Request
import logging
import time

async def log_request(request: Request, call_next):
    logger = logging.getLogger("backend_server")
    start_time = time.time()

    # Process the request
    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000 # to milliseconds
    process_time_formatted = f"{process_time:.2f}"
    # Log details as JSON
    logger.info(
        {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time": process_time_formatted,
            "client_host": request.client.host,
            "client_port": request.client.port,
        }
    )

    return response