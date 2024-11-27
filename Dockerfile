FROM public.ecr.aws/lambda/python:3.13

# Copy the requirement file for caching
COPY requirements.txt .

# Install dependencies into /var/task
RUN python3.13 -m pip install -r requirements.txt -t /var/task

# Copy the lambda function
COPY lambda_function/food_recall_processor /var/task/food_recall_processor

# Copy the utils
COPY backend/utils /var/task/backend/utils

# Command can be overwritten by providing a different command in the template directly.
CMD ["food_recall_processor.lambda_function.lambda_handler"]
