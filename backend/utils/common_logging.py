import logging
import json
from functools import wraps
from datetime import datetime
from typing import Any
from logging.handlers import RotatingFileHandler

class CommonLogger:
    """Create singleton"""
    _instance = None

    def __new__(cls, service_name: str = None) -> "Logger":
        """
        Constructor
        :param service_name: The name of service where you want to write logs at
        """
        if cls._instance is None:
            cls._instance = super(CommonLogger, cls).__new__(cls)
            cls._instance._setup_logger(service_name or "unknow serivce")

        elif service_name: # Update service name
            cls._instance.service_name = service_name

        return cls._instance

    def _setup_logger(self, service_name: str) -> None:
        """
        Set up logger with basic configuration
        :param service_name: The name of service where you want to write logs at
        :return: None
        """
        self.service_name = service_name
        self.logger = logging.getLogger("app_logger")
        self.logger.setLevel(logging.INFO)
        # Clear any existing handlers
        self.logger.handlers.clear()

        # Add console handler
        console_handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

        # Add file handler (logs written to a file)
        log_date = datetime.now().strftime("%Y%m%d")  # Format: YYYYMMDD
        log_file = f"{log_date}.log"   # Default log file name
        file_handler = RotatingFileHandler(
            filename=log_file,
            maxBytes=5 * 1024 * 1024,  # 5 MB per log file
            backupCount=3  # Keep 3 backup files
        )
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    def _format_message(self, message: Any, extra_info: dict = None) -> str:
        """
        Format log message with service name and extra info if necessary
        :param message: log messages
        :param extra_info: extra information in dict type
        :return: log message in JSON format
        """
        log_data = {
            "service_name": self.service_name,
            "message": message
        }
        if extra_info:
            log_data.update(extra_info)
        return json.dumps(log_data)

    def info(self, message: Any, extra_info: dict = None) -> None:
        """
        Log info level message
        :param message: log message
        :param extra_info: extra information in dict type
        :return: None
        """
        self.logger.info(self._format_message(message, extra_info))

    def error(self, message: Any, extra_info: dict = None) -> None:
        """
        Log error level message
        :param message: log message
        :param extra_info: extra information in dict type
        :return: None
        """
        self.logger.error(self._format_message(message, extra_info))

    def warning(self, message: Any, extra_info: dict = None) -> None:
        """
        Log warning level message
        :param message: log message
        :param extra_info: extra information in dict type
        :return: None
        """
        self.logger.warning(self._format_message(message, extra_info))

    def critical(self, message: Any, extra_info: dict = None) -> None:
        """
        Log critical level message
        :param message: log message
        :param extra_info: extra information in dict type
        :return: None
        """
        self.logger.critical(self._format_message(message, extra_info))

    def debug(self, message: Any, extra_info: dict = None) -> None:
        """
        Log debug level message
        :param message: log message
        :param extra_info: extra information in dict type
        :return: None
        """
        self.logger.debug(self._format_message(message, extra_info))

def log_execution_time(func):
    """
    A decorator to simply log any function's execution time.
    :param func: function to be decorated
    :return: None
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.now()
        logger = CommonLogger()
        try:
            result = func(*args, **kwargs)
            execution_time = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Function {func.__name__} completed",
                {"execution_time_seconds": execution_time}
            )
            return result

        except Exception as e:
            logger.error(f"Error in {func.__name__}", {'error': str(e)})
            raise

    return wrapper