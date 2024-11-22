import unittest
import logging
import os
from unittest.mock import patch
from io import StringIO
from backend.utils.common_logging import create_logs

class TestLogger(unittest.TestCase):

    def test_logger_injection(self):
        @create_logs(log_to_file=False)
        def test_function(logger=None):
            self.assertIsNotNone(logger)
            self.assertIsInstance(logger, logging.Logger)
        test_function()

    def test_logger_config(self):
        @create_logs(log_to_file=True, log_dir="test_logs", log_level=logging.INFO)
        def test_function(logger=None):
            pass
        test_function()

        logger = logging.getLogger(test_function.__module__)
        # Assert Level
        self.assertEqual(logger.level, logging.INFO)

        # Check handler
        handlers = logger.handlers
        self.assertEqual(len(handlers), 2)
        logger.handlers.clear()

    def test_logging_output(self):
        @create_logs(log_to_file=True, log_dir="test_logs", log_level=logging.WARNING)
        def test_function(logger=None):
            logger.debug("debug message")
            logger.info("info message")
            logger.warning("warning message")
            logger.error("error message")

        with self.assertLogs(level="WARNING") as log_capture:
            test_function()
        # Check output
        self.assertEqual(len(log_capture.output), 2)
        self.assertIn("WARNING", log_capture.output[0])
        self.assertIn("warning message", log_capture.output[0])
        self.assertIn("ERROR", log_capture.output[1])
        self.assertIn("error message", log_capture.output[1])

    def test_log_file_creation(self):
        log_dir = "test_logs"
        @create_logs(log_to_file=True, log_dir=log_dir, log_level=logging.INFO)
        def test_function(logger=None):
            logger.info("test info message")
        test_function()

        from datetime import datetime
        curr_date = datetime.now().strftime("%Y-%m-%d")
        log_file = os.path.join(log_dir, f"{curr_date}.log")

        # Check file exists
        self.assertTrue(os.path.exists(log_file))

        with open(log_file, "r") as f:
            content = f.read()
            self.assertIn("INFO", content)
            self.assertIn("test info message", content)

        # Clean up resource
        os.remove(log_file)
        os.rmdir(log_dir)
        logger = logging.getLogger(test_function.__module__)
        logger.handlers.clear()

    def test_handlers_not_duplicate(self):
        @create_logs(log_to_file=False)
        def test_function(logger=None):
            pass
        test_function()
        logger = logging.getLogger(test_function.__module__)
        count_before = len(logger.handlers)
        # Invoke again
        test_function()
        count_after = len(logger.handlers)
        self.assertEqual(count_before, count_after)
        logger.handlers.clear()

def run_tests():
    unittest.main()

if __name__ == "__main__":
    run_tests()