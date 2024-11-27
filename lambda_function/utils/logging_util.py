import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger

class Logger:
    _instance = {}

    def __new__(cls, name=None, *args, **kwargs):
        # Implement Singleton: reuse existing instance for the same name
        if name not in cls._instance:
            cls._instance[name] = super(Logger, cls).__new__(cls)
        return cls._instance[name]

    def __init__(self, name=None, log_dir="logs", level=logging.INFO, to_file=True):
        """
        Initialize a Logger instance
        :param name: Name of the Logger. If none, the root logger is used
        :param log_dir: Directory to save log files
        :param level: logging level
        :param to_file: Whether to save logs to a file
        """
        if hasattr(self, "_initialized") and self._initialized:
            # Prevent re-initialization
            return

        self._initialized = True
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # Prevent duplicates handlers
        if not self.logger.handlers:
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
            self.logger.addHandler(console_handler)

            # File handler
            if to_file:
                # Create directory if not exists
                if not os.path.exists(log_dir):
                    os.makedirs(log_dir)
                # Get current date
                curr_date = datetime.now().strftime("%Y-%m-%d")
                file_path = os.path.join(log_dir, f"{curr_date}.log")
                file_handler = RotatingFileHandler(
                    file_path, maxBytes=10 * 1024 * 1024, backupCount=5
                ) # 10MB per file, 5 backups
                file_handler.setLevel(level)
                file_handler.setFormatter(formatter)
                self.logger.addHandler(file_handler)

    def log(self, level, message, **kwargs):
        """
        Log a message with the given level and optional context
        :param level: Logging level (e.g. "info", "error")
        :param message: Message to log
        :param kwargs: Additional context to include in the log
        :return: None
        """
        log_method = getattr(self.logger, level.lower(), self.logger.info)
        log_method(message, extra={"extra": kwargs})