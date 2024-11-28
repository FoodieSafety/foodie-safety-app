import os
from datetime import datetime
from typing import List, Dict
from uuid import uuid4
from botocore.exceptions import ClientError
from food_recall_processor.fetch_food_recalls import formatFoodRecalls
from utils.logging_util import Logger
from utils.dynamo_util import DynamoUtil

class RecallProcessor:
    def __init__(self, database: DynamoUtil, logger: Logger, delta_days: int = 7):
        """
        Initialize RecallProcessor instance with its dependencies.
        :param database: DynamoDB utility instance
        :param logger: Logger instance
        :param delta_days: Time delta in days for fetching recalls
        """