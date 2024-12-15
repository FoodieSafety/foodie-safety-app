from dotenv import load_dotenv
import os
import pymysql.cursors
from dbutils.pooled_db import PooledDB
import logging

# Load environment variables
load_dotenv()

# Connect to the database and create a connection pool
try:
    pool = PooledDB(
        creator=pymysql,
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        cursorclass=pymysql.cursors.DictCursor,
    )
except Exception as e:
    logging.error(f"Error connecting to the database: {e}")
    pool = None

# Get a connection from the pool
def get_connection():
    if not pool:
        raise Exception("Connection pool not created")
    return pool.connection()