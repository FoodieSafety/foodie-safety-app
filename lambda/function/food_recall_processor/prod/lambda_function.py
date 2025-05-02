import sys
sys.path.append("/opt/python")  # Ensures Lambda layer dependencies are accessible
import os
from food_recall_processor.src.recall_processor import RecallProcessor
from food_recall_processor.prod.prod_dynamo_util import ProdDynamoUtil
from food_recall_processor.utils.logging_util import Logger


logger = Logger(name="recall_processor", to_file=False)
DELTA = int(os.getenv("DELTA_DAYS", 7))

def lambda_handler(event, context):
    """
    AWS Lambda handler to fetch, format and store food recall data
    :param event: triggering event (None)
    :param context: triggered context (None)
    :return: response in JSON format
    """
    try:
        recalls_table = os.getenv("DYNAMODB_TABLE")
        if not recalls_table:
            raise ValueError("DYNAMODB_TABLE environment variable is not set")
        
        # Initialize DynamoDB client
        prod_dynamo = ProdDynamoUtil()

                # Initialize recall processor
        recall_processor = RecallProcessor(database=prod_dynamo, logger=logger, delta_days=DELTA)
        
        # Process recalls and store in DynamoDB
        recalls = recall_processor.get_recall_data()
        recall_processor.store_recall_data(table_name=recalls_table, recall_data=recalls, key_attribute="RecallID")
        logger.log("info", f"Successfully processed {len(recalls)} recalls")
        
        return {
            "statusCode": 200,
            "body": f"Successfully processed {len(recalls)} recalls"
        }
        
    except Exception as e:
        logger.log("error", f"Error processing recalls: {str(e)}")
        raise