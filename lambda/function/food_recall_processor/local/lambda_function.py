import sys
import time
import uuid
from decimal import Decimal

sys.path.append("/opt/python")  # Ensures Lambda layer dependencies are accessible
import os
from food_recall_processor.utils.logging_util import Logger
from food_recall_processor.utils.dynamo_util import DynamoUtil
from food_recall_processor.src.recall_processor import RecallProcessor


def create_table_helper(database: DynamoUtil, table_name: str, key_schema:list, attribute_definitions:list) -> None:
    """
    Check if table exists, if not, create one
    :param database: database instance of DynamoUtil
    :param table_name: name of table
    :param key_schema: list of key attributes
    :param attribute_definitions: list of attribute definitions of the table
    :return: None
    """
    database.create_table(
        table_name,
        attribute_definitions,
        key_schema,
    "PAY_PER_REQUEST"
    )

def lambda_handler(event, context):
    """
    AWS Lambda handler to fetch, format and store food recall data
    :param event: triggering event (None)
    :param context: triggered context (None)
    :return: response in JSON format
    """
    recalls_table_name = os.getenv("DYNAMODB_TABLE")
    lambda_logs_table = os.getenv("LAMBDA_LOGS_TABLE")
    is_local = os.getenv("AWS_SAM_LOCAL") == "true"

    # Create db endpoint
    ddb_endpoint = "http://host.docker.internal:7000" if is_local else None
    delta = 30 if is_local else 7 # set testing delta as 30

    # Create related instance
    ddb_util = DynamoUtil(endpoint=ddb_endpoint)
    logger = Logger(name="recall_processor", to_file=False)
    processor = RecallProcessor(ddb_util, logger, delta_days=delta)

    # Create Recalls table
    create_table_helper(ddb_util,
                        recalls_table_name,
                        key_schema = [{"AttributeName": "RecallID", "KeyType": "HASH"}],
                        attribute_definitions = [{"AttributeName": "RecallID", "AttributeType": "S"}]
                        )

    # Create Lambda logs table
    create_table_helper(ddb_util,
                        lambda_logs_table,
                        # Using a global partition key for easy sorting.
                        key_schema = [{"AttributeName": "PK", "KeyType": "HASH"},
                                      {"AttributeName": "LogTimestamp", "KeyType": "SORT"}],
                        attribute_definitions = [{"AttributeName": "PK", "AttributeType": "S"},
                                                 {"AttributeName": "LogTimestamp", "AttributeType": "N"}]
                        )

    # Generate a unique id for this lambda invocation
    invocation_id = str(uuid.uuid4())
    # Get recalls
    recalls = processor.get_recall_data()
    if recalls:
        processor.store_recall_data(recalls_table_name, recalls)
        processor.store_log(lambda_logs_table, 200)
        return {
            "statusCode": 200,
            "body": f"Stored {len(recalls)} recalls successfully.",
        }
    else:
        processor.store_recall_data(recalls_table_name, recalls)
        processor.store_log(lambda_logs_table, 204)
        return {
            "statusCode": 204,
            "body": f"No recall data found.",
        }