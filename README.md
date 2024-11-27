# foodie-safety-app

- Ensure Python 3.13.0 is installed before cloning the repo

# Local environment setup

1. Navigate to backend directory

```
cd backend
```

2. Create a virtual environment

```
python3 -m venv .venv
```

3. Activate the virtual environment
   macOS/Linux

```
source .venv/bin/activate
```

Windows

```
.\.venv\Scripts\activate
```

4. Install dependencies

```
pip install -r requirements.txt
```

5. Update requirements.txt if new packages are added

```
pip freeze > requirements.txt
```

# Deactivate .venv when done

```
deactivate
```

# FastAPI Tryout

Run the following command and start the server locally

```
uvicorn main:app --reload
```

# Auto documentation
UI_ver1
```
<local url with port 8000>/docs
```

UI_ver2
```
<local url with port 8000>/redoc
```


# Local Test Lambda Function
Prerequisite:
1. Docker desktop
2. AWS SAM CLI
3. AWS CLI
4. Related files: event.json, template.yaml

Some commands:
build
```
sam build
```
test
```
sam local invoke FoodRecallProcessorFunction -e event.json
```

# Local Test DynamoDB
Prerequisite
1. dynamodb-local installed and run via docker-image
Pull
```
docker pull amazon/dynamodb-local
```
Run
```
docker run -p 8000:8000 amazon/dynamodb-local
```
Check container
```
docker ps
```

Some commands (take food recall service for example)
List table
```
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region dummy
```
Create testing table
```
aws dynamodb create-table \
    --table-name RecallsTable \
    --attribute-definitions AttributeName=RecallID,AttributeType=S \
    --key-schema AttributeName=RecallID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url http://localhost:8000
```
Scan entire table
```
aws dynamodb scan --table-name RecallsTable --endpoint-url http://localhost:8000
```
Delete table
```
aws dynamodb delete-table --table-name RecallsTable --endpoint-url http://localhost:8000
```
Stop docker
```
docker stop <Container ID>
```


