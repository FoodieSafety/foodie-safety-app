import unittest
from unittest.mock import MagicMock, patch
from food_recall_processor.lambda_function import lambda_handler, create_table_helper

class TestLambdaFunction(unittest.TestCase):

    @patch("food_recall_processor.lambda_function.RecallProcessor")
    @patch("food_recall_processor.lambda_function.DynamoUtil")
    @patch("food_recall_processor.lambda_function.Logger")
    @patch("os.getenv")
    def test_lambda_handler_with_recalls(
        self, mock_getenv, mock_logger, mock_dynamo_util, mock_recall_processor
    ):
        # Mock environment variables
        mock_getenv.side_effect = lambda key: {
            "DYNAMODB_TABLE": "TestTable",
            "AWS_SAM_LOCAL": "false"
        }.get(key)

        # Mock DynamoUtil and Logger instances
        mock_ddb_util_instance = MagicMock()
        mock_logger_instance = MagicMock()
        mock_dynamo_util.return_value = mock_ddb_util_instance
        mock_logger.return_value = mock_logger_instance

        # Mock RecallProcessor
        mock_recall_processor_instance = MagicMock()
        mock_recall_processor_instance.get_recall_data.return_value = [
            {"RecallID": "1", "Name": "Recall1"},
            {"RecallID": "2", "Name": "Recall2"},
        ]
        mock_recall_processor.return_value = mock_recall_processor_instance

        # Call lambda_handler
        response = lambda_handler({}, {})

        # Assertions
        mock_dynamo_util.assert_called_once_with(endpoint=None)
        mock_logger.assert_called_once_with(name="recall_processor", to_file=False)
        mock_recall_processor.assert_called_once_with(
            mock_ddb_util_instance, mock_logger_instance, delta_days=7
        )
        mock_recall_processor_instance.get_recall_data.assert_called_once()
        mock_recall_processor_instance.store_recall_data.assert_called_once_with(
            "TestTable", mock_recall_processor_instance.get_recall_data.return_value
        )

        self.assertEqual(response["statusCode"], 200)
        self.assertEqual(
            response["body"], "Stored 2 recalls successfully."
        )

    @patch("food_recall_processor.lambda_function.RecallProcessor")
    @patch("food_recall_processor.lambda_function.DynamoUtil")
    @patch("food_recall_processor.lambda_function.Logger")
    @patch("os.getenv")
    def test_lambda_handler_no_recalls(
            self, mock_getenv, mock_logger, mock_dynamo_util, mock_recall_processor
    ):
        # Mock environment variables
        mock_getenv.side_effect = lambda key: {
            "DYNAMODB_TABLE": "TestTable",
            "AWS_SAM_LOCAL": "false"
        }.get(key)

        # Mock DynamoUtil and Logger instances
        mock_ddb_util_instance = MagicMock()
        mock_logger_instance = MagicMock()
        mock_dynamo_util.return_value = mock_ddb_util_instance
        mock_logger.return_value = mock_logger_instance

        # Mock RecallProcessor
        mock_recall_processor_instance = MagicMock()
        mock_recall_processor_instance.get_recall_data.return_value = []
        mock_recall_processor.return_value = mock_recall_processor_instance

        # Call lambda_handler
        response = lambda_handler({}, {})

        # Assertions
        mock_recall_processor_instance.get_recall_data.assert_called_once()
        mock_recall_processor_instance.store_recall_data.assert_not_called()

        self.assertEqual(response["statusCode"], 204)
        self.assertEqual(
            response["body"], "No recall data found."
        )

    @patch("food_recall_processor.lambda_function.DynamoUtil")
    def test_create_table_helper(self, mock_dynamo_util):
        # Mock DynamoUtil instance
        mock_ddb_util_instance = MagicMock()

        # Call create_table_helper
        create_table_helper(mock_ddb_util_instance, "TestTable")

        # Assertions
        mock_ddb_util_instance.create_table.assert_called_once_with(
            "TestTable",
            [{"AttributeName": "RecallID", "AttributeType": "S"}],
            [{"AttributeName": "RecallID", "KeyType": "HASH"}],
            "PAY_PER_REQUEST",
        )