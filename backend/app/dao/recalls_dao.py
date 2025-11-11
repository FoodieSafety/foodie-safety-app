import os

from botocore.exceptions import ClientError

from app.util.dynamo_util import DynamoUtil


class RecallDao:
    @staticmethod
    def get_recalls(ddb_util:DynamoUtil):
        try:
            return ddb_util.scan_table_for_items(os.getenv("DYNAMODB_RECALL_TABLE"))
        except ClientError as e:
            return []