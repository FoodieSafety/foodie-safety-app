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

    def init_chat_tables(self, table_name:str):
        try:
            table = self.ddb.Table(table_name)
            table.load()  # check if table exists
            print(f"DynamoDB table '{table_name}' already exists.")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                print(f"Creating DynamoDB table '{table_name}'...")

                table = self.ddb.create_table(
                    TableName=table_name,
                    KeySchema=[
                        {"AttributeName": "user_id", "KeyType": "HASH"},
                    ],
                    AttributeDefinitions=[
                        {"AttributeName": "user_id", "AttributeType": "N"},
                    ],
                    BillingMode="PAY_PER_REQUEST",  # on-demand billing
                )
                table.wait_until_exists()
                print(f"DynamoDB table '{table_name}' created successfully.")
            else:
                raise
