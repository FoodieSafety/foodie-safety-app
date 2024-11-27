import os
import boto3
import datetime
from botocore.exceptions import ClientError
from lambda_function.food_recall_processor.fetch_food_recalls import formatFoodRecalls
from typing import List
import time
from lambda_function.utils import setup_logger
from datetime import datetime, timedelta
from uuid import uuid4

# Check if running dynamodb locally
DYNAMODB_ENDPOINT = "http://host.docker.internal:8000" if os.getenv("AWS_SAM_LOCAL") == "true" else None

# Init dynamodb
ddb = boto3.resource("dynamodb",
                     endpoint_url=DYNAMODB_ENDPOINT,
                     region_name="dummy",
                     aws_access_key_id="dummy",
                     aws_secret_access_key="dummy")

# Init Logger
logger = setup_logger(name="lambda_store_data_in_db", to_file=False)


def store_data_in_db(table_name: str, recalls: List) -> None:
    """
    Store formatted recall data into DynamoDB table.
    :return: None
    """
    table = ddb.Table(table_name)
    try:
        with table.batch_writer() as batch:
            for recall in recalls:
                recall_id = str(int(time.time() * 1000)) + recall.get("Recalling Firm", "Unknown Firm")
                recall_id = recall_id.replace(" ", "_")
                recall_id = f"{recall_id}_{uuid4().hex[:6]}"

                # Add identifier to each recall information
                recall["RecallID"] = recall_id

                # Write to DynamoDB
                batch.put_item(Item=recall)

        logger.info(f"Stored {len(recalls)} recall data to DynamoDB")
    except ClientError as e:
        logger.error(e)

def lambda_handler(event, context):
    """
    AWS Lambda handler to fetch, format and store food recall data
    :param event: triggering event (None)
    :param context: triggered context (None)
    :return: response in JSON format
    """
    table_name = os.getenv("DYNAMODB_TABLE")
    start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")

    # test code for local AWS Lambda using SAM
    # start_date = event["startDate"]
    # end_date = event["endDate"]

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