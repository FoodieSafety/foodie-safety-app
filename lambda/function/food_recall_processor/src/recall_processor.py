from datetime import datetime, timedelta
from typing import List, Dict
import hashlib
from botocore.exceptions import ClientError
from food_recall_processor.src.fetch_food_recalls import fetch_food_recalls
from food_recall_processor.utils.logging_util import Logger
from food_recall_processor.utils.dynamo_util import DynamoUtil

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

    def generate_recall_id(self, recall: Dict):
        """
        Generate unique recall ID using recall data
        :param recall: single recall data
        :return: hashed recall ID
        """
        unique_data = (f"{recall.get("Recalling Firm", "")}"
                       f"{recall.get("Product Description", "")}"
                       f"{recall.get("Report Date", "")}")

        return hashlib.sha256(unique_data.encode("utf-8")).hexdigest()



    def get_recall_data(self) -> List[Dict]:
        """
        Fetch food recalls data within a specific time range
        :return: List of formatted recall data
        """
        # Get recalls data
        recalls = fetch_food_recalls(self.start_time, self.end_time, self.logger)
        if recalls:
            self.logger.log(
                "info",
                f"Fetched {len(recalls)} recall data in total (OpenFDA + USDA) for {self.start_time} to {self.end_time}."
            )
        else:
            self.logger.log(
                "info",
                f"No recall data for {self.start_time} to {self.end_time}."
            )

        return recalls

    def store_recall_data(self, table_name: str, recall_data: List[Dict], key_attribute: str = "RecallID") -> None:
        """
        Store recall data into DynamoDB table
        :param table_name: DynamoDB table name
        :param recall_data: List of formatted recall data
        :param key_attribute: Key attribute to check for duplicates
        :return: None
        """
        try:
            self.logger.log("info", f"Storing {len(recall_data)} recall data to table '{table_name}'.")

            for recall in recall_data:
                # Create unique id for each recall
                recall["RecallID"] = self.generate_recall_id(recall)

            # Batch write into table
            self.database.insert_to_table(table_name, recall_data, key_attribute)
            self.logger.log("info", f"Successfully store {len(recall_data)} recall data.")

        except ClientError as e:
            self.logger.log("error", f"Error storing recall data: {e}")
            raise

        except Exception as e:
            self.logger.log("error", f"Error storing recall data: {e}")
            raise