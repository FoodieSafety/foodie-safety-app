import os

from botocore.exceptions import ClientError

from app.util.dynamo_util import DynamoUtil


class RecallsDao:
    @staticmethod
    def get_recalls(ddb_util:DynamoUtil):
        try:
            # Sending None as params because not filtering based on condition.
            return ddb_util.scan_table(os.getenv("DYNAMODB_RECALL_TABLE"), None, None, None)
        except ClientError as e:
            return []