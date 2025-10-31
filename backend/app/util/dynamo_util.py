import boto3
from botocore.exceptions import ClientError
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
        """
        Batch writing data into table
        :param table_name: Name of the table to write to.
        :param items: List of items to write to the table.
        :param key_attribute: Key attribute to check for duplicates
        :return: None
        """
        table = self.ddb.Table(table_name)
        # Query using FilterExpression
        scan_response = table.get_item(
            Key={f'{key_attribute}': key_value},
        )

        item = scan_response.get('Item')
        return item

