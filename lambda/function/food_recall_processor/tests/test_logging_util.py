import unittest
import os
import logging
from logging.handlers import RotatingFileHandler
from io import StringIO
from food_recall_processor.utils.logging_util import Logger
import json
from pythonjsonlogger import jsonlogger


class TestLogger(unittest.TestCase):
    LOG_DIR = "test_logs"

    def setUp(self):
        # Cleanup logs from previous tests
        if os.path.exists(self.LOG_DIR):
            for file in os.listdir(self.LOG_DIR):
                os.remove(os.path.join(self.LOG_DIR, file))
        else:
            os.makedirs(self.LOG_DIR)

    def tearDown(self):
        # Cleanup logs after each test
        for file in os.listdir(self.LOG_DIR):
            os.remove(os.path.join(self.LOG_DIR, file))

    def test_singleton_behavior(self):
        logger1 = Logger(name="test-logger", log_dir=self.LOG_DIR)
        logger2 = Logger(name="test-logger", log_dir=self.LOG_DIR)
        self.assertIs(logger1, logger2, "Logger instances should be the same for the same name")

    def test_no_duplicate_handlers(self):
        logger1 = Logger(name="test-logger", log_dir=self.LOG_DIR)
        initial_handler_count = len(logger1.logger.handlers)

        # Re-initialize the same logger
        logger2 = Logger(name="test-logger", log_dir=self.LOG_DIR)
        final_handler_count = len(logger2.logger.handlers)

        self.assertEqual(
            initial_handler_count, final_handler_count, "Handlers should not be duplicated"
        )

    def test_console_logging(self):
        logger = Logger(name="console-test", to_file=False, log_dir=self.LOG_DIR)

        # Attach a custom StringIO stream to capture console output
        console_stream = StringIO()
        for handler in logger.logger.handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.stream = console_stream  # Redirect the handler's stream to StringIO

        # Log a message
        logger.log("info", "Test console message", context="console-test")

        # Retrieve the console output from the StringIO stream
        output = console_stream.getvalue()

        # Assertions
        self.assertIn("Test console message", output, "Console output should contain the logged message")
        self.assertIn("console-test", output, "Console output should include the additional context")

    def test_file_logging(self):
        logger = Logger(name="file-test", to_file=True, log_dir=self.LOG_DIR)
        logger.log("info", "Test file message", context="file-test")

        # Check if a log file was created
        log_files = os.listdir(self.LOG_DIR)
        self.assertTrue(len(log_files) > 0, "A log file should be created")

        # Check log content
        with open(os.path.join(self.LOG_DIR, log_files[0]), "r") as log_file:
            content = log_file.read()
            self.assertIn("Test file message", content, "File log should contain the logged message")
            self.assertIn("file-test", content, "File log should include the additional context")

    def test_log_level(self):
        logger = Logger(name="level-test", log_dir=self.LOG_DIR, level=logging.ERROR)

        # Attach a custom StringIO stream to capture console output
        console_stream = StringIO()
        for handler in logger.logger.handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.stream = console_stream  # Redirect the handler's stream to StringIO

        # Log messages at different levels
        logger.log("info", "This message should not appear")
        logger.log("error", "This message should appear")

        # Retrieve the console output from the StringIO stream
        output = console_stream.getvalue()

        # Assertions
        self.assertNotIn(
            "This message should not appear",
            output,
            "INFO level messages should not be logged"
        )
        self.assertIn(
            "This message should appear",
            output,
            "ERROR level messages should be logged"
        )

    def test_log_format(self):
        logger = Logger(name="format-test", to_file=False, log_dir=self.LOG_DIR)

        # Attach a custom StringIO stream to capture console output
        console_stream = StringIO()
        for handler in logger.logger.handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.stream = console_stream  # Redirect the handler's stream to StringIO

        # Log a message
        logger.log("info", "Check log format", key="value")

        # Retrieve the console output from the StringIO stream
        output = console_stream.getvalue()

        # Parse the JSON log output
        log_json = json.loads(output)

        # Validate the log fields
        self.assertEqual(log_json["message"], "Check log format", "Log message should match")
        self.assertEqual(log_json["levelname"], "INFO", "Log level should be INFO")
        self.assertEqual(log_json["name"], "format-test", "Logger name should match")
        self.assertIn("key", log_json["extra"], "Extra field 'key' should be present")
        self.assertEqual(log_json["extra"]["key"], "value", "Extra field 'key' should have the correct value")

    def test_rotating_file_handler(self):
        # Set a small maxBytes for testing
        max_bytes = 1024  # 1 KB for quick rotation
        logger = Logger(name="rotate-test", log_dir=self.LOG_DIR, to_file=True)

        # Replace the file handler with a custom RotatingFileHandler
        for handler in logger.logger.handlers:
            if isinstance(handler, RotatingFileHandler):
                logger.logger.removeHandler(handler)
                break

        file_path = os.path.join(self.LOG_DIR, "test.log")
        rotating_handler = RotatingFileHandler(
            file_path, maxBytes=max_bytes, backupCount=5
        )
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(name)s %(levelname)s %(message)s"
        )
        rotating_handler.setFormatter(formatter)
        logger.logger.addHandler(rotating_handler)

        # Simulate large logs to trigger rotation
        for _ in range(1000):  # Log enough messages to exceed the size
            logger.log("info", "Filler message")

        log_files = os.listdir(self.LOG_DIR)
        self.assertTrue(len(log_files) > 1, "Log rotation should create multiple log files")

    def test_additional_context(self):
        logger = Logger(name="context-test", to_file=False, log_dir=self.LOG_DIR)

        # Attach a custom StringIO stream to capture console output
        console_stream = StringIO()
        for handler in logger.logger.handlers:
            if isinstance(handler, logging.StreamHandler):
                handler.stream = console_stream  # Redirect the handler's stream to StringIO

        # Log a message with additional context
        logger.log("info", "Message with context", user="test-user", action="test-action")

        # Retrieve the console output from the StringIO stream
        output = console_stream.getvalue()

        # Parse the JSON-formatted output
        log_json = json.loads(output)

        # Validate the log message and additional context
        self.assertEqual(log_json["message"], "Message with context", "Log message should match")
        self.assertIn("user", log_json["extra"], "User field should be present in extra context")
        self.assertEqual(log_json["extra"]["user"], "test-user", "User field should match the expected value")
        self.assertIn("action", log_json["extra"], "Action field should be present in extra context")
        self.assertEqual(log_json["extra"]["action"], "test-action", "Action field should match the expected value")


if __name__ == "__main__":
    unittest.main()