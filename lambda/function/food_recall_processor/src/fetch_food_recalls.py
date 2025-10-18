import requests
import re
import food_recall_processor.utils.openfda_api as OpenFDA
import food_recall_processor.utils.usda_api as USDA
from food_recall_processor.utils.logging_util import Logger

def fetch_food_recalls(start_time, end_time, logger):
    """
    Formats food recall data into a list of dictionaries for structured use.

    This function retrieves food recall data using `getFoodRecalls` and structures
    it into a list of dictionaries. Each dictionary contains details such as 
    product description, reason for recall, report date, classification, 
    distribution pattern, and code information.

    Args:
        start_time (str): The start date for the recall search in YYYY-MM-DD format.
        end_time (str): The end date for the recall search in YYYY-MM-DD format.

    Returns:
        list[dict]: A list of dictionaries containing structured recall data. 
                    Returns an empty list if no results are found or API request fails.
    """
    # List to store food recall from json object
    all_recalls = [] 
    # Fetch the recall data from OpenFDA
    openfda_recalls = OpenFDA.get_food_recalls_fda(start_time, end_time, logger)
    usda_recalls = USDA.get_food_recalls_usda(start_time, end_time, logger)
    # This log message will be lost in the sea of messages from DynamoDB. To check, Search "Fetched count" in terminal.
    # Same for other 'info' level messages. Try searching the terminal.
    logger.log(
        "info",
        f"Fetched count -> OpenFDA - {len(openfda_recalls)} | USDA - {len(usda_recalls)} | from {start_time} to {end_time}."
    )

    if openfda_recalls:
        all_recalls += openfda_recalls
    if usda_recalls:
        all_recalls += usda_recalls

    return all_recalls    