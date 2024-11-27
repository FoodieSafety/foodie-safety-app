import unittest
import logging
import os
import json

from lambda_function.utils import setup_logger
from pythonjsonlogger import jsonlogger

class TestCommonLogging(unittest.TestCase):

    def setUp(self):
        """
        Set up testing environment
        :return: None
        """
        # Set up the log directory for testing
        self.log_dir = "test_logs"
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)

        # Remove existing log files in the test logs
        for filename in os.listdir(self.log_dir):
            file_path = os.path.join(self.log_dir, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)

    def tearDown(self):
        """
        Remove the test log directory after tests
        :return: None
        """
        for filename in os.listdir(self.log_dir):
            file_path = os.path.join(self.log_dir, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
        os.rmdir(self.log_dir)

    def test_setup_logger(self):
        """
        Test setting up looger
        :return: Logger instance
        """
        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        self.assertTrue(logger is not None)
        self.assertIsInstance(logger, logging.Logger)

    def test_logger_has_correct_handlers(self):
        """
        Test logger has correct handlers
        :return: None
        """
        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        handlers = logger.handlers
        self.assertTrue(len(handlers) > 0)
        self.assertEqual(len(handlers), 2) # streamhandler and filehandler

        handler_types = [type(handler) for handler in handlers]
        self.assertIn(logging.StreamHandler, handler_types)
        self.assertIn(logging.FileHandler, handler_types)

    def test_handlers_use_json_formatter(self):
        """
        Test logger has correct handlers
        :return: None
        """
        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        for handler in logger.handlers:
            self.assertIsInstance(handler.formatter, jsonlogger.JsonFormatter)

    def test_logging_output_is_json(self):
        """
        Test logging output is JSON format
        :return: None
        """
        # Get the logger and clear its handlers
        logger = logging.getLogger("test_logger")
        logger.handlers.clear()

        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        test_message = "This is a test message for test log"
        logger.info(test_message)

        # Check log file
        from datetime import datetime
        curr_date = datetime.now().strftime("%Y-%m-%d")
        file_path = os.path.join(self.log_dir, f"{curr_date}.log")
        # Check exist
        self.assertTrue(os.path.exists(file_path))

        with open(file_path, "r") as f:
            contents = f.read()
            entry = json.loads(contents.strip())
            self.assertEqual(entry["message"], test_message)
            self.assertEqual(entry["levelname"], "INFO")
            self.assertEqual(entry["name"], "test_logger")

    def test_prevent_duplicate_handler(self):
        """
        Test logger has correct handlers
        :return: None
        """
        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        before_count = len(logger.handlers)

        logger = setup_logger(name="test_logger", to_file=True, log_dir=self.log_dir)
        after_count = len(logger.handlers)
        self.assertEqual(before_count, after_count)
        self.assertEqual(after_count, 2)

    def test_log_to_console(self):
        """
        Test logging to console
        :return: None
        """
        logger = setup_logger(name="test_logger_console", to_file=False)
        handlers = logger.handlers
        self.assertEqual(len(handlers), 1)
        self.assertIsInstance(handlers[0], logging.StreamHandler)


def run_tests():
    unittest.main()

if __name__ == "__main__":
    run_tests()