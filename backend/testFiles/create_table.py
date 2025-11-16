import boto3
from botocore.exceptions import ClientError

# Connect to local DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    region_name='dummy',
    aws_access_key_id='dummy',
    aws_secret_access_key='dummy',
    endpoint_url='http://localhost:7000'
)

table_name = 'RecallsTable'

try:
    # Check if table already exists
    table = dynamodb.Table(table_name)
    table.load()
    print(f"Table '{table_name}' already exists.")
except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceNotFoundException':
        # Table doesn't exist, create it
        print(f"Creating table '{table_name}'...")
        
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'RecallID',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'RecallID',
                    'AttributeType': 'S'  # String
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        # Wait for table to be created
        print("Waiting for table to be created...")
        table.wait_until_exists()
        print(f"Table '{table_name}' created successfully!")
    else:
        print(f"Error: {e}")

