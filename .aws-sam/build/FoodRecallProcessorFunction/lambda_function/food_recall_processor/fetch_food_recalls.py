import requests

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
    # Fetch the data from food recall
    data = getFoodRecalls(start_date, end_date)
    # If the method did not return none and there are results
    if data and 'results' in data: 
        for event in data['results']: # For each result from the search query
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
                'Code Info': event['code_info']
            }
            # Append recall to all data
            all_recalls.append(recall)
    return all_recalls

def getFoodRecalls(start_date, end_date): 
    """
    Fetches food recall data from the OpenFDA API within a specified date range.

    This function constructs a query URL to fetch food recall data for a given 
    start and end date from the OpenFDA food enforcement database. The data is 
    limited to recalls in the United States and sorted by the most recent report dates.

    Args:
        start_date (str): The start date for the recall search in YYYY-MM-DD format.
        end_date (str): The end date for the recall search in YYYY-MM-DD format.

    Returns:
        dict: The JSON response from the API as a dictionary if the request is successful.
        None: If the request fails (e.g., API not reachable, bad response).
    """
    # URL for all food recalls between given start and end date within the US
    url = ("https://api.fda.gov/food/enforcement.json?search=(report_date:[" 
           + start_date + "+TO+" + end_date 
           + "]+AND+country=United+States)&sort=report_date:desc&limit=1000")
    
    response = requests.get(url)  # Make a GET request to the FDA API
    if response.status_code == 200:  # Check if the request was successful (status code 200)
        return response.json()  # Return the response data as a JSON object
    else:
        return None  # Return None if the request was not successful
    