import requests
import re
import food_recall_processor.utils.openfda_api as OpenFDA


def formatFoodRecalls(start_date, end_date):
    """
    Formats food recall data into a list of dictionaries for structured use.

    This function retrieves food recall data using `getFoodRecalls` and structures
    it into a list of dictionaries. Each dictionary contains details such as 
    product description, reason for recall, report date, classification, 
    distribution pattern, and code information.

    Args:
        start_date (str): The start date for the recall search in YYYY-MM-DD format.
        end_date (str): The end date for the recall search in YYYY-MM-DD format.

    Returns:
        list[dict]: A list of dictionaries containing structured recall data. 
                    Returns an empty list if no results are found or API request fails.
    """
    # List to store food recall from json object
    all_recalls = [] 
    # Fetch the recall data from OpenFDA
    openfda_recalls = OpenFDA.getFoodRecalls(start_date, end_date)
    if openfda_recalls:
        all_recalls += openfda_recalls

    return all_recalls    