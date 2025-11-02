import re

def parse_upc(description: str) -> set:
    upc_pattern = r"UPC\s*#?\s*[A-Za-z]*\s*:?\s*([\d\s-]{10,})"
    upc_matches = re.findall(upc_pattern, description)  # Find all UPC occurrences

    upc_codes = [re.sub(r"[\s-]+", "", upc_match) for upc_match in upc_matches]  # Remove spaces from UPCs
    return set(upc_codes)  # Remove duplicates