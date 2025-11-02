from datetime import datetime

import requests
import re
from typing import List, Dict, Optional

from .config import USDA_API_URL
from .logging_util import Logger


def _parseUPC(description: str) -> set:
    upc_pattern = r"UPC\s*#?\s*[A-Za-z]*\s*:?\s*([\d\s-]{10,})"
    upc_matches = re.findall(upc_pattern, description)  # Find all UPC occurrences

    upc_codes = [re.sub(r"[\s-]+", "", upc_match) for upc_match in upc_matches]  # Remove spaces from UPCs
    return set(upc_codes)  # Remove duplicates

"""
Unable to filter based on the start end date at the API itself.
Hence added start, end as params for manual filtering
"""
def _format_food_recalls_usda(api_response, start, end):
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
    recalls = []
    for event in api_response:
        field_date_str = event["field_recall_date"]
        format_code = "%Y-%m-%d"
        parsed_date = datetime.strptime(field_date_str, format_code)
        start_date_parsed = datetime.strptime("2025-10-06", format_code)
        # Check if the field date (parsed_date) is after start_date
        if parsed_date >= start_date_parsed:
            #Proceed and parse the data
            recall = {
                # Grab the recalling firm
                'Recalling Firm': event['field_establishment'],
                # Product description not present. Just fetching the next best thing. field_summary seems like a blog post of the recall.
                'Product Description': event['field_product_items'],
                'Reason for Recall': event['field_recall_reason'],
                'Report Date': event['field_recall_date'],
                'Classification': event['field_recall_classification'],
                # 'Product Quantity': event['product_quantity'], # Product qty not available in USDA
                # Grab the distribution pattern (which states or nationwide)
                'Distribution': event['field_states'], # Has list of state codes or 'Nationwide' if shipped countrywide
                # Lot codes are not given explicitly. May occur in field_product_items or field_summary
                # 'Code Info': event['code_info'],
                'UPCs': list(_parseUPC(event['field_product_items']) | _parseUPC(event['field_summary'])),
                'Source': "USDA"
            }
            recalls.append(recall)
        else:
            # Stop if the field_date (parsed_date) is before start_date
            break

    return recalls

def get_food_recalls_usda(start_date, end_date, logger:Logger) -> Optional[List[Dict]]:
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

    # NOTE: Keep the header to spoof your request as coming from a browser. For some reason the endpoint works only if it is done.
    # Play around with commented or other headers in case the api call is stuck without a response.
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
        # "Accept": "application/json, */*",
        # "Referer": "https://www.fsis.usda.gov/"
    }

    response = requests.get(USDA_API_URL, headers=headers)  # Make a GET request to the FDA API
    if response.status_code == 200:  # Check if the request was successful (status code 200)
        return _format_food_recalls_usda(response.json(), start_date, end_date)  # Return the response json as a list of recalls
    else:
        logger.log(
            "error",
            f"Error occurred while fetching recalls from USDA API"
        )
        return []