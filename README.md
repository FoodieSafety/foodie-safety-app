# foodie-safety-app

- Ensure Python 3.13.0 is installed before cloning the repo

# Backend API Documentation

- The following two links are the API documentation for the backend services (source code is the same)
- Testing can be done within the documentation
- Link 1 (AWS EC2): http://54.176.228.18/docs
- Link 2 (Render): https://demo-7vuv.onrender.com/docs 

# Local Backend Environment Setup

## Setting Up Virtual Environment

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

## Running the Backend Server

Run the following command in the virtual environment to start the server locally

```
uvicorn app.main:app --reload
```

## Deactivating Virtual Environment

```
deactivate
```

## Notable Environment Variables

```
DISABLE_RECALL_DB = true //Used in development to disable recall functionality
```

# Backend (FastAPI) Documentation

UI_ver1
```
<local url with port 8000>/docs
```

UI_ver2
```
<local url with port 8000>/redoc
```


# Local Test Lambda Function

## Prerequisite

1. Docker desktop
2. AWS SAM CLI
3. AWS CLI
4. Related files: event.json, template.yaml

## Steps

1. Install necessary lambda dependencies in the lambda/layer/python directory via the requirements.txt inside of it (this layer will be used for all python dependencies for all lambda functions)
```
> cd lambda/layer/python
> pip install -r requirements.txt -t .
```

2. Ensure desired lambda function is in its own subdirectory in the lambda/function folder (see food_recall_processor for structure)

3. If not already, add the function to the template.yaml file to be assigned for building (see RecallProcessorFunction in Resources)

4. Verify previous steps were completed and build the lambda architecture (you should see confirmation of the layer and function builds if successful)
```
> sam build
// add --debug argument if you want more verbose messaging in the console
```

5. Invoke the desired lambda function (see example with RecallProcessorFunction below). Add environment variables as necessary for testing. Ensure necessary resources (like DynamoDB for recall processing) are running when invoking functions.
```
// Powershell Syntax for environment variable
> $env:DYNAMODB_TABLE = "RecallsTable"; sam local invoke RecallProcessorFunction
```


# Deploying Lambda Function (or Layer)

## Steps

1. Ensure functions and layers that are to be deployed have been successfully built and tested locally

2. In the .aws-sam/build folder zip the functions and layers individually
    * For functions, zip content inside the top-level function folder
    ```
    // Powershell Syntax for zipping
    > cd .aws-sam/build/RecallProcessorFunction
    > Compress-Archive -Path * -DestinationPath RecallProcessorFunction.zip
    ```
    * For layers, zip the \python directory (including the folder itself) inside of the top-level layer folder
    ```
    // Powershell Syntax for zipping
    > cd .aws-sam/build/LambdaDependenciesLayer
    > Compress-Archive -Path ./python -DestinationPath LambdaPythonDependenciesLayer.zip
    ```

3. Upload the zipped folders to their respective lambda service via the AWS management console and connect the function and layer as necessary

4. (Optional) Setup any triggers or destinations for the function and test functionality


# Local Test DynamoDB

## Prerequisite

1. Docker is installed

## Steps

### Pull
```
docker pull amazon/dynamodb-local
```

### Run
```
docker run -p 7000:8000 amazon/dynamodb-local
```

### Check container
```
docker ps
```

### List tables
```
aws dynamodb list-tables --endpoint-url http://localhost:7000 --region dummy
```

### Create Table
```
aws dynamodb create-table \
    --table-name RecallsTable \
    --attribute-definitions AttributeName=RecallID,AttributeType=S \
    --key-schema AttributeName=RecallID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --endpoint-url http://localhost:7000
```

Do not rely on this command for recall db testing. Refer to "Local Test Lambda Function" for running the recall lambda function to create and propogate the DynamoDB Recalls Table.

### Scan Table
```
aws dynamodb scan --table-name RecallsTable --endpoint-url http://localhost:7000 --region dummy
```

### Delete table
```
aws dynamodb delete-table --table-name RecallsTable --endpoint-url http://localhost:8000 --region dummy
```

### Stop docker
```
docker stop <Container ID>
```

### Recall Table
