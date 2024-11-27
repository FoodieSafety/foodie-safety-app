import os
import boto3
import datetime
from botocore.exceptions import ClientError
from fetch_food_recalls import getFoodRecalls, formatFoodRecalls
from typing import List
import time
from backend.utils.common_logging import setup_logger
from datetime import datetime

# Init dynamodb
db = boto3.resource("dynamodb")
# Init Logger
logger = setup_logger(name="lambda_store_data_in_db", to_file=False)

def store_data_in_db(table_name: str, recalls: List) -> None:
    """
    Store formatted recall data into DynamoDB table.
    :return: None
    """
    table = db.Table(table_name)
    try:
        with table.batch_writer() as batch:
            for recall in recalls:
                recall_id = str(int(time.time() * 1000)) + recall["Recalling Firm"]
                recall["Recall ID"] = recall_id
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
    # start_date = (datetime.now() - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    # end_date = (datetime.now()).strftime("%Y-%m-%d")

    # test code
    start_date = event["startDate"]
    end_date = event["endDate"]
    recalls = formatFoodRecalls(start_date, end_date)

    if recalls:
        # store_data_in_db(table_name, recalls)
        return {
            "statusCode": 200,
            "body": f"Stored {len(recalls)} recalls from {start_date} to {end_date}.",
        }
    else:
        return {
            "statusCode": 400,
            "body": f"No recall data found from {start_date} to {end_date}.",
        }