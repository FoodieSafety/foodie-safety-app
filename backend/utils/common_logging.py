import logging
from functools import wraps
import os
from datetime import datetime

def create_logs(log_to_file=True, log_dir="logs", log_level=logging.DEBUG):
    """
    Decorator to set up logging for a function
    :param log_to_file: Whether to log to file or not.
    :param log_dir: Directory to write logs to
    :param log_level: Logging level.
    Use logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, or logging.CRITICAL.
    :return: None
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get the logger for the module where the function is defined
            logger = logging.getLogger(func.__module__)
            logger.setLevel(log_level)

            # Remove existing handlers
            if logger.hasHandlers():
                logger.handlers.clear()

            # Create console handlers (for stdin stdout)
            console_handler = logging.StreamHandler()
            console_handler.setLevel(log_level)

            # Define formatter
            formatter = logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)

            # Add Filehandler if log_to_file is True
            if log_to_file:
                if not os.path.isdir(log_dir):
                    os.mkdir(log_dir)

                # Create log file name based on current date
                curr_date = datetime.now().strftime("%Y-%m-%d")
                log_path = os.path.join(log_dir, f"{curr_date}.log")

                file_handler = logging.FileHandler(log_path)
                file_handler.setLevel(log_level)
                file_handler.setFormatter(formatter)
                logger.addHandler(file_handler)

            # Inject logger into function's kwargs
            kwargs["logger"] = logger
            return func(*args, **kwargs)
        return wrapper
    return decorator