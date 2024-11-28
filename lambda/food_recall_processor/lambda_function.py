import os
import boto3
import datetime
from botocore.exceptions import ClientError
from food_recall_processor.fetch_food_recalls import formatFoodRecalls
from typing import List
from utils.logging_util import Logger
from datetime import datetime, timedelta
from uuid import uuid4

# Check if running dynamodb locally
DYNAMODB_ENDPOINT = "http://host.docker.internal:8000" if os.getenv("AWS_SAM_LOCAL") == "true" else None

# Init Logger
recall_logger = Logger(name="food_recall_processor", to_file=False)

# time delta
DELTA = 30

# Init


def store_data_in_db(table_name: str, recalls: List) -> None:
    """
    Store formatted recall data into DynamoDB table.
    :return: None
    """
    table = ddb.Table(table_name)
    try:
        with table.batch_writer() as batch:
            for recall in recalls:
                # Create unique id
                recall_id = uuid4().hex
                # Add identifier to each recall information
                recall["RecallID"] = recall_id

                # Write to DynamoDB
                batch.put_item(Item=recall)

        recall_logger.log("info", f"Stored {len(recalls)} recall data to DynamoDB")
    except ClientError as e:
        recall_logger.log("error", e)

def lambda_handler(event, context):
    """
    AWS Lambda handler to fetch, format and store food recall data
    :param event: triggering event (None)
    :param context: triggered context (None)
    :return: response in JSON format
    """
    table_name = os.getenv("DYNAMODB_TABLE")
    start_date = (datetime.now() - timedelta(days=DELTA)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")

    recalls = formatFoodRecalls(start_date, end_date)

    if recalls:
        store_data_in_db(table_name, recalls)
        return {
            "statusCode": 200,
            "body": f"Stored {len(recalls)} recalls from {start_date} to {end_date}.",
        }
    else:
        return {
            "statusCode": 400,
            "body": f"No recall data found from {start_date} to {end_date}.",
        }