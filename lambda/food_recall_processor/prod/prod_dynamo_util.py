from food_recall_processor.utils.dynamo_util import DynamoUtil
import os

ACCESS_KEY = os.getenv("ACCESS_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")


class ProdDynamoUtil(DynamoUtil):
    """
    DynamoDB utility class for production environment
    """
    def __init__(self):
        super().__init__(region="us-west-1", access_key=ACCESS_KEY, secret_key=SECRET_KEY)