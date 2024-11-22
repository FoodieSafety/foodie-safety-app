import unittest
from unittest.mock import MagicMock, patch
import json
import logging
from backend.utils.common_logging import CommonLogger, log_execution_time

class TestLogger(unittest.TestCase):
    def setUp(self):
        # Reset the singleton instance before each test
        CommonLogger._instance = None

    def test_singleton(self):
        """Test logger follows singleton design pattern"""
        logger1 = CommonLogger("service1")
        logger2 = CommonLogger("service2")
        # Should be the same instance
        self.assertIs(logger1, logger2)
        self.assertEqual(logger2.service_name, "service2")

    def test_different_service_name(self):
        """Test service name updates correctly"""
        logger1 = CommonLogger("service1")
        self.assertEqual(logger1.service_name, "service1")
        logger2 = CommonLogger("service2")
        self.assertEqual(logger2.service_name, "service2")
        # same instance will have same name
        self.assertEqual(logger1.service_name, "service2")

    @patch("logging.Logger.info")
    def test_info_logging(self, mock_info):
        """Test info level logging"""
        logger = CommonLogger("test")
        test_msg = "test message"
        extra_info = {"key": "value"}
        # Create info level log
        logger.info(test_msg, extra_info)

        mock_info.assert_called_once()
        actual_log_message = mock_info.call_args[0][0]
        actual_log = json.loads(actual_log_message)
        self.assertEqual(actual_log["service_name"], "test")
        self.assertEqual(actual_log["message"], test_msg)
        self.assertEqual(actual_log["key"], "value")

    @patch("logging.Logger.error")
    def test_error_logging(self, mock_error):
        """Test info level logging"""
        logger = CommonLogger("test")
        test_msg = "error message"
        extra_info = {"error_code": 500}
        # Create info level log
        logger.error(test_msg, extra_info)

        mock_error.assert_called_once()
        actual_log_message = mock_error.call_args[0][0]
        actual_log = json.loads(actual_log_message)
        self.assertEqual(actual_log["service_name"], "test")
        self.assertEqual(actual_log["message"], test_msg)
        self.assertEqual(actual_log["error_code"], 500)

    @patch("logging.Logger.warning")
    def test_warning_logging(self, mock_warning):
        """Test info level logging"""
        logger = CommonLogger("test")
        test_msg = "warning message"
        # Create info level log
        logger.warning(test_msg)

        mock_warning.assert_called_once()
        actual_log_message = mock_warning.call_args[0][0]
        actual_log = json.loads(actual_log_message)
        self.assertEqual(actual_log["service_name"], "test")
        self.assertEqual(actual_log["message"], test_msg)

    @patch("logging.Logger.info")
    def test_log_execution_time(self, mock_info):
        CommonLogger("test")

        """Test log execution time"""
        @log_execution_time
        def sample_function(a, b):
            return a + b

        result = sample_function(1, 2)
        self.assertEqual(result, 3)

        mock_info.assert_called_once()

        # Verify the log message
        log_message = mock_info.call_args[0][0]
        actual_log = json.loads(log_message)
        self.assertEqual(actual_log["service_name"], "test")
        self.assertEqual(actual_log["message"], "Function sample_function completed")

def run_tests():
    unittest.main()

if __name__ == "__main__":
    run_tests()