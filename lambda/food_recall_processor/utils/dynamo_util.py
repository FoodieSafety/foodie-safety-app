import boto3
from botocore.exceptions import ClientError
from food_recall_processor.utils.logging_util import Logger
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
            billing_mode: str = "PAY_PER_REQUEST",
            provisioned_throughput: Optional[Dict[str, int]] = None,
    ) -> None:
        """
        Create a DynamoDB table if it doesn't exist
        :param table_name: Name of the table
        :param attribute_definitions: List of attributes definitions (name and type)
        :param key_schema: Key schema for the table (partition and sort keys)
        :param billing_mode: Billing mode for the table
        :param provisioned_throughput: Provisioned throughput settings (read and write units)
        :return: None
        """
        try:
            existing_tables = [table.name for table in self.ddb.tables.all()]
            if table_name in existing_tables:
                self.logger.log("info", f"Table '{table_name}' already exists.")
                return

            # Define table creation parameters
            table_params = {
                "TableName": table_name,
                "AttributeDefinitions": attribute_definitions,
                "KeySchema": key_schema,
                "BillingMode": billing_mode,
            }

            # Add provisioned throughput if billing mode is "PROVISIONED"
            if billing_mode == "PROVISIONED":
                if provisioned_throughput is None:
                    raise ValueError("Provisioned throughput must be specified for PROVISIONED billing mode.")
                table_params["ProvisionedThroughput"] = provisioned_throughput

            # Create the table
            table = self.ddb.create_table(**table_params)

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
            self.logger.log("error", f"Failed to delete table '{table_name}': {e}")
            raise

        except Exception as e:
            self.logger.log("error", f"Failed to delete table '{table_name}': {e}")
            raise

    def insert_to_table(self, table_name: str, items: List[Dict], key_attribute: str = None) -> None:
        """
        Batch writing data into table
        :param table_name: Name of the table to write to.
        :param items: List of items to write to the table.
        :param key_attribute: Key attribute to check for duplicates
        :return: None
        """
        table = self.ddb.Table(table_name)
        for item in items:
            # Check if the item already exists
            try:
                response = table.get_item(Key={key_attribute: item[key_attribute]})
                if "Item" in response:
                    self.logger.log("info", f"Duplicate item found: {item[key_attribute]}, skipping.")
                    continue  # Skip duplicate items

                # If no duplicate, write the item
                with table.batch_writer() as batch:
                    batch.put_item(Item=item)

            except ClientError as e:
                self.logger.log("error", f"Error checking or writing item {item[key_attribute]}: {e}")
                raise
