import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
from food_recall_processor.src.recall_processor import RecallProcessor

class TestRecallProcessor(unittest.TestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.mock_logger = MagicMock()

        # Init RecallProcessor
        self.processor = RecallProcessor(self.mock_db, self.mock_logger, 7)

    @patch("food_recall_processor.recall_processor.formatFoodRecalls")
    def test_get_recall_data_with_data(self, mock_formatFoodRecalls):
        mock_recalls = [{"RecallID": "1", "Name": "Recall1"}, {"RecallID": "2", "Name": "Recall2"}]
        mock_formatFoodRecalls.return_value = mock_recalls
        recalls = self.processor.get_recall_data()

        start_time = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_time = datetime.now().strftime("%Y-%m-%d")
        mock_formatFoodRecalls.assert_called_once_with(start_time, end_time)

        # Assert logger logs the fetched data
        self.mock_logger.log.assert_called_with(
            "info", f"Fetched 2 recall data for {start_time} to {end_time}."
        )

        # Assert the returned data matches the mock data
        self.assertEqual(recalls, mock_recalls)

    @patch("food_recall_processor.recall_processor.formatFoodRecalls")
    def test_get_recall_data_with_no_data(self, mock_formatFoodRecalls):
        mock_formatFoodRecalls.return_value = []
        recalls = self.processor.get_recall_data()

        start_time = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_time = datetime.now().strftime("%Y-%m-%d")
        mock_formatFoodRecalls.assert_called_once_with(start_time, end_time)

        # Assert logger logs the fetched data
        self.mock_logger.log.assert_called_with(
            "info", f"No recall data for {start_time} to {end_time}."
        )

        self.assertEqual(recalls, [])

    def test_store_recall_data(self):
        mock_recalls = [{"RecallID": "1", "Name": "Recall1"}, {"RecallID": "2", "Name": "Recall2"}]
        self.processor.store_recall_data("Test", mock_recalls)

        # Assert logger logs the storing process
        self.mock_logger.log.assert_any_call("info", f"Storing 2 recall data to table 'Test'.")
        self.mock_logger.log.assert_any_call("info", "Successfully store 2 recall data.")

        for recall in mock_recalls:
            self.assertIn("RecallID", recall)

        # Assert batch_write is called with the correct arguments
        self.mock_db.batch_write.assert_called_once_with("Test", mock_recalls)

    def test_store_recall_data_failure(self):
        mock_recalls = [{"RecallID": "1", "Name": "Recall1"}, {"RecallID": "2", "Name": "Recall2"}]

        # Simulate failure in batch_write
        self.mock_db.batch_write.side_effect = Exception("Batch write failed")

        # Call store_recall_data and expect an exception
        with self.assertRaises(Exception):
            self.processor.store_recall_data("Test", mock_recalls)

        # Assert logger logs the error
        self.mock_logger.log.assert_any_call("info", "Storing 2 recall data to table 'Test'.")
        self.mock_logger.log.assert_any_call("error", "Error storing recall data: Batch write failed")
