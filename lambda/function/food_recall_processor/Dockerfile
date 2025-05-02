FROM public.ecr.aws/lambda/python:3.13

# Copy function code and utils
COPY local ${LAMBDA_TASK_ROOT}/food_recall_processor/local
COPY src ${LAMBDA_TASK_ROOT}/food_recall_processor/src
COPY utils ${LAMBDA_TASK_ROOT}/food_recall_processor/utils

# Copy the requirement file for caching
COPY requirements.txt ${LAMBDA_TASK_ROOT}/food_recall_processor/

# Install dependencies into /var/task
RUN pip install -r requirements.txt --target ${LAMBDA_TASK_ROOT}/food_recall_processor/dependencies

RUN chmod +x /lambda-entrypoint.sh

# Command can be overwritten by providing a different command in the template directly.
CMD ["food_recall_processor.local.lambda_function.lambda_handler"]
