import os

import boto3
from boto3 import dynamodb
from botocore.exceptions import ClientError
from typing import Optional, List, Dict


def get_ddb_util():
    ddb_endpoint = os.getenv("DYNAMODB_ENDPOINT")
    return DynamoUtil(endpoint=ddb_endpoint)


class DynamoUtil:

    # Instantiate and get recall ddb connection

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

    def scan_table(self, table_name: str, key_attribute: str, key_value: str):
        """
        Batch writing data into table
        :param table_name: Name of the table to write to.
        :param items: List of items to write to the table.
        :param key_attribute: Key attribute to check for duplicates
        :return: None
        """
        table = self.ddb.Table(table_name)
        # Query using FilterExpression
        scan_response = table.scan(
            FilterExpression=f"contains({key_attribute}, :key_value)",
            ExpressionAttributeValues={":key_value": key_value}
        )

        # Print matching items
        matching_items = scan_response.get("Items", [])
        return matching_items

    def get_item(self, table_name: str, key_attribute: str, key_value: str):
        table = self.ddb.Table(table_name)
        # Query using FilterExpression
        scan_response = table.get_item(
            Key={f'{key_attribute}': key_value},
        )

        item = scan_response.get('Item')
        return item

    def scan_all_items(self, table_name: str) -> List[Dict]:
        """
        Scan all items from a DynamoDB table
        :param table_name: Name of the table to scan
        :return: List of all items in the table
        """
        try:
            table = self.ddb.Table(table_name)
            all_items = []
            
            # DynamoDB scan has a 1MB limit per request, so we need to paginate
            response = table.scan()
            all_items.extend(response.get('Items', []))
            
            # Handle pagination if there are more items
            while 'LastEvaluatedKey' in response:
                response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
                all_items.extend(response.get('Items', []))
            
            return all_items
        except Exception as e:
            print(f"Error scanning table '{table_name}': {e}")
            # Return empty list if DynamoDB is not available
            return []

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
            # Try to list tables to check if DynamoDB is available
            existing_tables = [table.name for table in self.ddb.tables.all()]
            if table_name in existing_tables:
                print(f"Table '{table_name}' already exists.")
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
            print(f"Table '{table_name}' created successfully.")

        except (ClientError, Exception) as e:
            # Don't raise - just log the error and continue
            # This allows the app to start even if DynamoDB is not available
            print(f"Warning: Could not create table '{table_name}': {e}")
            print("The application will continue, but DynamoDB features may not work.")
