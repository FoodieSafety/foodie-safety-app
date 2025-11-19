import os

# Recall API Variables
OPENFDA_API_TEMPLATE = "https://api.fda.gov/food/enforcement.json?search=(report_date:[{start_date}+TO+{end_date}]+AND+country=United+States)&sort=report_date:desc&limit=1000"
USDA_API_URL= "https://www.fsis.usda.gov/fsis/api/recall/v/1/"

# Recall Processor Variables
RECALL_TIMESPAN = int(os.getenv("RECALL_TIMESPAN"))

# DynamoDB Endpoint
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")
DYNAMODB_REGION = os.getenv("DYNAMODB_REGION")

# DynamoDB Table Names
DYNAMODB_RECALL_TABLE = os.getenv("DYNAMODB_RECALL_TABLE")
DYNAMODB_LAMBDA_LOGS_TABLE = os.getenv("DYNAMODB_LAMBDA_LOGS_TABLE")