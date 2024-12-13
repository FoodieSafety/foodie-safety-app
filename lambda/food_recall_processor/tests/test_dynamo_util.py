import unittest
from unittest.mock import MagicMock, patch
from food_recall_processor.utils.dynamo_util import DynamoUtil

class TestDynamoUtil(unittest.TestCase):
    def setUp(self):
        # Mock boto3 resource
        self.mock_ddb = MagicMock()
        self.mock_logger = MagicMock()

        # Patch boto3.resource to return the mock resource
        patcher = patch("boto3.resource", return_value=self.mock_ddb)
        self.addCleanup(patcher.stop)
        self.mock_boto3 = patcher.start()

        # Init DynamoUtil with mocked resources
        self.dynamo_util = DynamoUtil(endpoint="http://localhost:8000", region="dummy")
        # Inject mock resources
        self.dynamo_util.ddb = self.mock_ddb
        self.dynamo_util.logger = self.mock_logger

    def test_create_table_exists(self):
        # Mock one table
        mock_table = MagicMock()
        mock_table.name = "ExistingTable"
        self.mock_ddb.tables.all.return_value = [mock_table]

        # Call create_table with an existing table name
        self.dynamo_util.create_table(
            table_name="ExistingTable",
            attribute_definitions=[{"AttributeName": "ID", "AttributeType": "S"}],
            key_schema=[{"AttributeName": "ID", "KeyType": "HASH"}],
            billing_mode="PAY_PER_REQUEST",
        )

        self.mock_logger.log.assert_called_with("info", "Table 'ExistingTable' already exists.")

    def test_create_table_success(self):
        # Mock no tables
        self.mock_ddb.tables.all.return_value = []
        mock_table = MagicMock()
        self.mock_ddb.create_table.return_value = mock_table

        # Create table

        # Call create_table
        self.dynamo_util.create_table(
            table_name="NewTable",
            attribute_definitions=[{"AttributeName": "ID", "AttributeType": "S"}],
            key_schema=[{"AttributeName": "ID", "KeyType": "HASH"}],
            billing_mode="PAY_PER_REQUEST",
        )

        # Verify table creation
        self.mock_ddb.create_table.assert_called_once_with(
            TableName="NewTable",
            AttributeDefinitions=[{"AttributeName": "ID", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "ID", "KeyType": "HASH"}],
            BillingMode="PAY_PER_REQUEST",
        )
        mock_table.wait_until_exists.assert_called_once()
        self.mock_logger.log.assert_called_with("info", "Table 'NewTable' created successfully.")

    def test_delete_table(self):
        mock_table = MagicMock()
        self.mock_ddb.Table.return_value = mock_table

        # Delete table
        self.dynamo_util.delete_table("SomeTable")

        self.mock_ddb.Table.assert_called_once_with("SomeTable")
        mock_table.delete.assert_called_once()
        mock_table.wait_until_not_exists.assert_called_once()
        self.mock_logger.log.assert_called_with("info", "Table 'SomeTable' deleted successfully.")

    def test_delete_table_failure(self):
        mock_table = MagicMock()
        self.mock_ddb.Table.return_value = mock_table

        # Simulate failure
        mock_table.delete.side_effect = Exception("Failed to delete!")

        with self.assertRaises(Exception) as context:
            self.dynamo_util.delete_table("SomeTable")

        self.mock_logger.log.assert_called_with("error", "Failed to delete table 'SomeTable': Failed to delete!")

    def test_batch_write(self):
        mock_table = MagicMock()
        mock_batch_writer = MagicMock()
        self.mock_ddb.Table.return_value = mock_table
        mock_table.batch_writer.return_value.__enter__.return_value = mock_batch_writer

        # Call batch_write
        items = [{"ID": "1", "Name": "Name1"}, {"ID": "2", "Name": "Name2"}]
        self.dynamo_util.batch_write("TestTable", items)

        # Check result
        self.mock_ddb.Table.assert_called_once_with("TestTable")
        mock_table.batch_writer.assert_called_once()
        mock_batch_writer.put_item.assert_any_call(Item=items[0])
        mock_batch_writer.put_item.assert_any_call(Item=items[1])
