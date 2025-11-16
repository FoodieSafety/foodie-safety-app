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

table = dynamodb.Table('RecallsTable')

# Items with correct field names matching DynamoDB schema
# Note: Field names must match exactly as stored in DynamoDB (with spaces and capitals)
items = [
    {
        "RecallID": "51fdd3046a8bd3e73a1280dd07d895f02be1ba0f5620e431401481a0dd9bd349",
        "Product Quantity": "521 units (total of all products)",
        "Report Date": "20251029",
        "Classification": "Class I",
        "Distribution": "VA, MD, NC, D.C.",
        "Code Info": "Item #51474 Sell By 9/24 - 10/01 Purchased between 9/19 and 9/26 UPC Codes: 0-77890-51474-0 OR 051474-XXXXX (Xs are price)",
        "Reason for Recall": "Contains undeclared pecans",
        "Recalling Firm": "Wegmans Food Markets, Inc.",
        "UPCs": ["077890514740"],
        "Product Description": "Wegmans Large Ultimate Strawberry Topped Cheesecake, Net Wt. 58 oz. (3.63 lb) (1.64 kg)",
        "Source": "OpenFDA"
    },
    {
        "RecallID": "461531bb777be516670138378ea1d366e749ee343df86b8295f3f42cd80c7af7",
        "Product Quantity": "20,625 dozen",
        "Report Date": "20251022",
        "Classification": "Class I",
        "Distribution": "Retail and wholesale locations in AR and MO Wholesale and broker locations in MS, TX, CA and IN",
        "Code Info": "Julian Date 190 Best By: 8/22/205 through Julian Date 260 Best By: 10/31/2025",
        "Reason for Recall": "Potential Salmonella contamination.",
        "Recalling Firm": "Black Sheep Egg Company, LLC",
        "UPCs": [],
        "Product Description": "Free Range Grade AA Large Brown Eggs, Loose Pack in Boxes, 15dz per box,  Black Sheep Egg Company  400 S Memorial Drive  Walnut Ridge AR 72476",
        "Source": "OpenFDA"
    },
    {
        "RecallID": "d34ef04aa2727900e66566a6f310fb42a584de8084c6b5e24d29fcb549b617d7",
        "Product Quantity": "46,752 units/bottles (Lot 25100: 8,424 units; Lot 25148: 16,488 units; Lot 25155: 21,840 units)",
        "Report Date": "20251015",
        "Classification": "Class II",
        "Distribution": "AL, AR, AZ, CA, CO, CT, DE, FL, GA, IA, IL, IN, KS, KY, LA, MI, MN, MO, MS, NC, ND, NH, NJ, NY, OH, OR, PA, SC, TN, TX, UT, VA, WI",
        "Code Info": "Lot code: 25100, 25148, 25155 UPC: 679234051814 EXP 04/2027, 05/2027, 06/2027",
        "Reason for Recall": "Potential yeast contamination.",
        "Recalling Firm": "M.O.M Enterprises, LLC.",
        "UPCs": ["679234051814"],
        "Product Description": "Organic BABY bedtime drops; sleep + immunity blend; Promotes restful sleep with natural herbs & supports immunity with elderberry & vitamin C; LIQUID DIETARY SUPPLEMENT; AGE 4 MONTHS+, NET WT. 2 OZ (60 ML)",
        "Source": "OpenFDA"
    }
]

# Insert items
try:
    for item in items:
        table.put_item(Item=item)
        print(f"Inserted RecallID: {item['RecallID']}")
    
    print("All items inserted successfully!")
except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceNotFoundException':
        print("Error: Table 'RecallsTable' does not exist!")
        print("Please run 'python3 create_table.py' first to create the table.")
    else:
        print(f"Error inserting items: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")

