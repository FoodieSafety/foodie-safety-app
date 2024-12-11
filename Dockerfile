FROM public.ecr.aws/lambda/python:3.13

# Copy the requirement file for caching
COPY requirements.txt .

# Install dependencies into /var/task
RUN python3.13 -m pip install -r requirements.txt -t /var/task

# Copy the lambda function and its dependencies
COPY lambda/ /var/task/lambda/

# Command can be overwritten by providing a different command in the template directly.
CMD ["food_recall_processor.lambda_function.lambda_handler"]
