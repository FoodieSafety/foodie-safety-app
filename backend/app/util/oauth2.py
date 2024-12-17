import jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=dotenv_path)

def create_access_token(source_data: dict, expire_delta: timedelta = None):
    """
    Create an access JWT token
    :param source_data: input payload from the client
    :return: encrypted JWT token
    :param expire_delta: time delta for expiration
    :return: encoded JWT token
    """

    # Make a copy of the source data
    to_encode = source_data.copy()

    # Calculate the expiration time
    if expire_delta:
        expire_time = datetime.now() + expire_delta
    else:
        expire_time = datetime.now() + timedelta(minutes=int(os.getenv("EXPIRE_TIME")))

    # Update the payload with the expiration time
    to_encode.update({"exp": expire_time})

    # Create the JWT token
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

    return encoded_jwt



