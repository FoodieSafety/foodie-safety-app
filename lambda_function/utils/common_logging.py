import logging
import os
from datetime import datetime
from pythonjsonlogger import jsonlogger

def setup_logger(name=None, to_file=True, log_dir="logs", level=logging.DEBUG):
    """
    Set up and return a logger instance
    :param name: (str) Name of the logger. If None, use the root logger
    :param to_file: (bool) Whether to log to a file
    :param dir: (str) The directory to save logs to
    :param level: (int) Logging level
    :return: Configured logger instance
    """
    # Create logger and set logging level
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Prevent adding multiple handlers to the logger
    if not logger.handlers:
        # Define log format
        log_format = (
            "%(asctime)s %(name)s %(levelname)s %(message)s %(filename)s"
            "%(funcName)s %(lineno)d %(threadName)s"
        )
        formatter = jsonlogger.JsonFormatter(log_format)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # If log to file, add file handler
        if to_file:
            # Create directory if not exists
            if not os.path.exists(log_dir):
                os.makedirs(log_dir)
            # Get current date
            curr_date = datetime.now().strftime("%Y-%m-%d")
            file_path = os.path.join(log_dir, f"{curr_date}.log")
            file_handler = logging.FileHandler(file_path)
            file_handler.setLevel(level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

    return logger
