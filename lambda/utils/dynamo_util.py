import boto3
from botocore.exceptions import ClientError
from utils.logging_util import Logger
from typing import Optional, List, Dict

class DynamoUtil:
    def __init__(self, endpoint: Optional[str] = None, region: str = "dummy", access_key="dummy", secret_key="dummy"):
        """
        Initialize DynamoDB utility instance and Logger instance
        :param endpoint: endpoint url
        :param region: AWS region
        :param access_key: AWS access key
        :param secret_key: AWS secret key
        """
        # DynamoDB instance
        self.ddb = boto3.resource(
            "dynamodb",
            endpoint_url=endpoint,
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )

        # Logger instance
        self.logger = Logger("DynamoUtil", to_file=False)


    def create_table(
            self,
            table_name: str,
            attribute_definitions: List[Dict[str, str]],
            key_schema: List[Dict[str, str]],
            provisioned_throughput: Dict[str, int] = None,
    ) -> None:
        """
        Create a DynamoDB table if it doesn't exist
        :param table_name: Name of the table
        :param attribute_definitions: List of attributes definitions (name and type)
        :param key_schema: Key schema for the table (partition and sort keys)
        :param provisioned_throughput: Provisioned throughput settings (read and write units)
        :return: None
        """
        try:
            existing_tables = [table.name for table in self.ddb.tables.all()]
            if table_name not in existing_tables:
                self.logger.log("info", f"Table '{table_name}' already exists.")

            # Create table
            table = self.ddb.create_table(
                TableName=table_name,
                AttributeDefinitions=attribute_definitions,
                KeySchema=key_schema,
                ProvisionedThroughput=provisioned_throughput,
            )

            # Wait until the table is created
            table.wait_until_exists()
            self.logger.log("info", f"Table '{table_name}' created successfully.")

        except ClientError as e:
            self.logger.log("error", f"Failed to create table {table_name}: {e}")
            raise


    def delete_table(self, table_name: str) -> None:
        """
        Delete a DynamoDB table
        :param table_name: name of the table to delete
        :return: None
        """
        try:
            table = self.ddb.Table(table_name)
            table.delete()
            table.wait_until_not_exists()
            self.logger.log("info", f"Table '{table_name}' deleted successfully.")

        except ClientError as e:
            self.logger.log("error", f"Failed to delete table {table_name}: {e}")
            raise


