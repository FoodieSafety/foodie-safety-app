from datetime import datetime, timedelta
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
        self.database = database
        self.logger = logger
        self.delta_days = delta_days
        # Init start date and end date
        self.start_time = (datetime.now() - timedelta(days=self.delta_days)).strftime("%Y-%m-%d")
        self.end_time = datetime.now().strftime("%Y-%m-%d")

    def get_recall_data(self) -> List[Dict]:
        """
        Fetch food recalls data within a specific time range
        :return: List of formatted recall data
        """

        # Get recalls data
        recalls = formatFoodRecalls(self.start_time, self.end_time)
        if recalls:
            self.logger.log(
                "info",
                f"Fetched {len(recalls)} recall data for {self.start_time} to {self.end_time}."
            )
        else:
            self.logger.log(
                "info",
                f"No recall data for {self.start_time} to {self.end_time}."
            )

        return recalls

    def store_recall_data(self, table_name: str, recall_data: List[Dict]) -> None:
        """
        Store recall data into DynamoDB table
        :param table_name: DynamoDB table name
        :param recall_data: List of formatted recall data
        :return: None
        """
        try:
            self.logger.log("info", f"Storing {len(recall_data)} recall data to table '{table_name}'.")

            for recall in recall_data:
                # Create unique id
                recall["RecallID"] = uuid4().hex

            # Batch write into table
            self.database.batch_write(table_name, recall_data)
            self.logger.log("info", f"Successfully store {len(recall_data)} recall data.")

        except ClientError as e:
            self.logger.log("error", f"Error storing recall data: {e}")
            raise

        except Exception as e:
            self.logger.log("error", f"Error storing recall data: {e}")
            raise