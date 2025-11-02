import requests
import re
from typing import List, Dict, Optional
from .config import OPENFDA_API_TEMPLATE
from .logging_util import Logger
from food_recall_processor.utils.lambda_utils import parse_upc



def _format_food_recalls(api_response) -> List[Dict]:
    """
    Formats food recall data into a list of dictionaries for structured use.

    This function receives food recall data as an input argument and structures
    it into a list of dictionaries. Each dictionary contains details such as 
    product description, reason for recall, report date, classification, 
    distribution pattern, and code information.

    Args:
        api_response (json): The json response for a recall search.

    Returns:
        list[dict]: A list of dictionaries containing structured recall data. 
                    Returns an empty list if no results are found or API request fails.
    """
    # List to store food recall from json object
    all_recalls = [] 
    # If the method did not return none and there are results
    if api_response and 'results' in api_response: 
        for event in api_response['results']: # For each result from the search query
            # Create a dictionary to house each recall item
            recall = {
                # Grab the recalling firm
                'Recalling Firm': event['recalling_firm'],
                # Grab the product description
                'Product Description': event['product_description'],
                # Grab the reason for recall
                'Reason for Recall': event['reason_for_recall'],
                # Grab the report date
                'Report Date': event['report_date'],
                #Grab classification
                'Classification': event['classification'],
                # Grab the product quantity 
                'Product Quantity': event['product_quantity'],
                # Grab the distribution pattern (which states or nationwide)
                'Distribution': event['distribution_pattern'],
                # Grab the code info
                'Code Info': event['code_info'],
                # Grab UPCS
                'UPCs': list(parse_upc(event['product_description']) | parse_upc(event['code_info'])),
                'Source': "OpenFDA"
            }
            # Append recall to all data
            all_recalls.append(recall)
    return all_recalls

def get_food_recalls_fda(start_date, end_date, logger:Logger) -> Optional[List[Dict]]:
    """
    Fetches food recall data from the OpenFDA API within a specified date range.

    This function constructs a query URL to fetch food recall data for a given 
    start and end date from the OpenFDA food enforcement database. The data is 
    limited to recalls in the United States and sorted by the most recent report dates.

    Args:
        start_date (str): The start date for the recall search in YYYY-MM-DD format.
        end_date (str): The end date for the recall search in YYYY-MM-DD format.

    Returns:
        List[Dict]: The JSON response from the API as a list if the request is successful.
        None: If the request fails (e.g., API not reachable, bad response).
    """
    # URL for food recalls between given start and end date from OpenFDA
    url = OPENFDA_API_TEMPLATE.format(start_date=start_date, end_date=end_date)

    response = requests.get(url)  # Make a GET request to the FDA API
    if response.status_code == 200:  # Check if the request was successful (status code 200)
        return _format_food_recalls(response.json())  # Return the response json as a list of recalls
    else:
        logger.log(
            "error",
            f"Error occurred while fetching recalls from OpenFDA API"
        )
        return []
    