FROM public.ecr.aws/lambda/python:3.13

# Copy function code and utils
COPY food_recall_processor/ ${LAMBDA_TASK_ROOT}/food_recall_processor/
COPY utils/ ${LAMBDA_TASK_ROOT}/utils/

# Copy the requirement file for caching
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies into /var/task
RUN pip install -r requirements.txt

# Command can be overwritten by providing a different command in the template directly.
CMD ["food_recall_processor.lambda_function.lambda_handler"]
