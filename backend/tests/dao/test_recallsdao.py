import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from decimal import Decimal
from backend.app.dao.recalls_dao import RecallsDao
from backend.app.util.schemas import RecallTimestamp
from backend.app.util.dynamo_util import DynamoUtil

os.environ["DYNAMODB_LAMBDA_LOGS_TABLE"] = "LambdaLogsTable"

class TestRecallsDao(unittest.TestCase):
    def setUp(self):
        self.ddb_util = MagicMock()
        self.mock_timestamps = [{
            "StatusCode": 200,
            "LogTimestamp": Decimal("1731700000000"),
            "InvocationId": "1",
        }]

    def test_get_update_time_success(self):
        self.ddb_util.scan_table.return_value = self.mock_timestamps

        recall_update_timestamp = RecallsDao.get_update_time(self.ddb_util)

        self.assertIsInstance(recall_update_timestamp, RecallTimestamp)
        self.assertEqual(recall_update_timestamp.invocation_id, "1")
        self.assertEqual(recall_update_timestamp.status_code, 200)
        self.assertEqual(recall_update_timestamp.time_ms, 1731700000000)  # Decimal → int
        self.assertTrue(recall_update_timestamp.time_iso.startswith("2024-11-15"))

    def test_get_update_time_not_found(self):
        self.ddb_util.scan_table.return_value = []

        with self.assertRaises(HTTPException):
            RecallsDao.get_update_time(self.ddb_util)

if __name__ == "__main__":
    unittest.main()
