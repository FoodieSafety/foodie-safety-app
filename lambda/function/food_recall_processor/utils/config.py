# Recall API Variables
OPENFDA_API_TEMPLATE = "https://api.fda.gov/food/enforcement.json?search=(report_date:[{start_date}+TO+{end_date}]+AND+country=United+States)&sort=report_date:desc&limit=1000"