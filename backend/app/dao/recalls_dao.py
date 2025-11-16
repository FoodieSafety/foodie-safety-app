import os
from fastapi import HTTPException, status
from botocore.exceptions import ClientError
from decimal import Decimal
from ..util.dynamo_util import DynamoUtil
from ..util.schemas import RecallTimestamp


class RecallsDao:
    @staticmethod
    def get_recalls(ddb_util:DynamoUtil):
        try:
            # Sending None as params because not filtering based on condition.
            return ddb_util.scan_table(os.getenv("DYNAMODB_RECALL_TABLE"), None, None, None)
        except ClientError as e:
            return []
        
    @staticmethod
    def get_update_time(ddb_util: DynamoUtil):
        recall_update_timestamps = ddb_util.scan_table(os.getenv("DYNAMODB_LAMBDA_LOGS_TABLE"), "eq", "StatusCode", Decimal("200"))

        if not recall_update_timestamps:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Last successful recall update not found"
            )
        
        latest_update_timestamp = max(recall_update_timestamps, key=lambda update_timestamp: update_timestamp.get("LogTimestamp"))

        return RecallTimestamp(**latest_update_timestamp)