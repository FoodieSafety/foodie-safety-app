import sys

sys.path.append("/opt/python")  # Ensures Lambda layer dependencies are accessible
import os
from food_recall_processor.utils.logging_util import Logger
from food_recall_processor.utils.dynamo_util import DynamoUtil
from food_recall_processor.src.recall_processor import RecallProcessor
from food_recall_processor.utils.config import DYNAMODB_ENDPOINT, DYNAMODB_REGION, DYNAMODB_LAMBDA_LOGS_TABLE, DYNAMODB_RECALL_TABLE, RECALL_TIMESPAN


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

def init_tables(ddb_util):
    # Create Recalls table
    create_table_helper(ddb_util,
                        DYNAMODB_RECALL_TABLE,
                        key_schema = [{"AttributeName": "RecallID", "KeyType": "HASH"}],
                        attribute_definitions = [{"AttributeName": "RecallID", "AttributeType": "S"}]
                        )

    # Create Lambda logs table
    create_table_helper(ddb_util,
                        DYNAMODB_LAMBDA_LOGS_TABLE,
                        # Using a global partition key for easy sorting.
                        key_schema = [{"AttributeName": "PK", "KeyType": "HASH"},
                                      {"AttributeName": "LogTimestamp", "KeyType": "RANGE"}],
                        attribute_definitions = [{"AttributeName": "PK", "AttributeType": "S"},
                                                 {"AttributeName": "LogTimestamp", "AttributeType": "N"}]
                        )

def lambda_handler(event, context):
    """
    AWS Lambda handler to fetch, format and store food recall data
    :param event: triggering event (None)
    :param context: triggered context (None)
    :return: response in JSON format
    """
    # Create ddb util
    if DYNAMODB_ENDPOINT: # Used in Dev
        ddb_util = DynamoUtil(endpoint=DYNAMODB_ENDPOINT)
    elif DYNAMODB_REGION: # Used in Prod
        ddb_util = DynamoUtil(region=DYNAMODB_REGION)
    else:
        return {
            "statusCode": 400,
            "body": f"Missing required argument to connect to ddb table. No endpoint or region specified.",
        }

    # Create related instances
    logger = Logger(name="recall_processor", to_file=False)
    processor = RecallProcessor(ddb_util, logger, delta_days=RECALL_TIMESPAN)

    # Method to initialize both recalls and the lambda logs table
    init_tables(ddb_util)

    # Get recalls
    recalls = processor.get_recall_data()
    if recalls:
        processor.store_recall_data(DYNAMODB_RECALL_TABLE, recalls)
        processor.store_log(DYNAMODB_LAMBDA_LOGS_TABLE, 200)
        return {
            "statusCode": 200,
            "body": f"Stored {len(recalls)} recalls successfully.",
        }
    else:
        processor.store_log(DYNAMODB_LAMBDA_LOGS_TABLE, 204)
        return {
            "statusCode": 204,
            "body": f"No recall data found.",
        }