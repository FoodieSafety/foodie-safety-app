import os
from food_recall_processor.utils.logging_util import Logger
from food_recall_processor.utils.dynamo_util import DynamoUtil
from food_recall_processor.src.recall_processor import RecallProcessor


def create_table_helper(database: DynamoUtil, table_name: str) -> None:
    """
    Check if table exists, if not, create one
    :param database: database instance of DynamoUtil
    :param table_name: name of table
    :return: None
    """
    attribute_definitions = [{"AttributeName": "RecallID", "AttributeType": "S"}]
    key_schema = [{"AttributeName": "RecallID", "KeyType": "HASH"}]
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
    table_name = os.getenv("DYNAMODB_TABLE")
    is_local = os.getenv("AWS_SAM_LOCAL") == "true"

    # Create db endpoint
    ddb_endpoint = "http://host.docker.internal:8000" if is_local else None
    delta = 30 if is_local else 7 # set testing delta as 30

    # Create related instance
    ddb_util = DynamoUtil(endpoint=ddb_endpoint)
    logger = Logger(name="recall_processor", to_file=False)
    processor = RecallProcessor(ddb_util, logger, delta_days=delta)

    # Create table
    create_table_helper(ddb_util, table_name)

    # Get recalls
    recalls = processor.get_recall_data()
    if recalls:
        processor.store_recall_data(table_name, recalls)
        return {
            "statusCode": 200,
            "body": f"Stored {len(recalls)} recalls successfully.",
        }
    else:
        return {
            "statusCode": 204,
            "body": f"No recall data found.",
        }