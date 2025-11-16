from sqlalchemy.orm import Session
from typing import List
from ..util.schemas import RecallInfo
from ..util.dynamo_util import DynamoUtil
import os

class RecallController:
    """
    Controller for CRUD operations on Recall Object
    and passing response from model to view
    """
    @staticmethod
    def get_all_recalls(ddb_util: DynamoUtil) -> List[RecallInfo]:
        """
        Get all recalls from DynamoDB table
        :param ddb_util: DynamoDB utility instance
        :return: List of recall information
        """
        recall_table_name = os.getenv("DYNAMODB_RECALL_TABLE")
        if not recall_table_name:
            return []
        
        # Get all items from DynamoDB
        items = ddb_util.scan_all_items(recall_table_name)
        
        # Convert DynamoDB items to RecallInfo schema
        # boto3 resource returns deserialized items, but we handle both formats
        recalls = []
        for item in items:
            # Helper function to extract value from DynamoDB format or return as-is
            def get_value(key):
                value = item.get(key)
                if value is None:
                    return None
                # If it's a dict with 'S' key (DynamoDB string format)
                if isinstance(value, dict) and 'S' in value:
                    return value['S']
                # If it's already a string or other type
                return value
            
            # Extract UPCs from DynamoDB list format
            upcs = []
            upcs_raw = item.get('UPCs')
            if upcs_raw:
                if isinstance(upcs_raw, list):
                    for upc in upcs_raw:
                        if isinstance(upc, dict) and 'S' in upc:
                            upcs.append(upc['S'])
                        else:
                            upcs.append(str(upc))
                elif isinstance(upcs_raw, str):
                    upcs = [upcs_raw]
            
            recall = RecallInfo(
                recall_id=get_value('RecallID') or '',
                recalling_firm=get_value('Recalling Firm'),
                product_description=get_value('Product Description'),
                reason_for_recall=get_value('Reason for Recall'),
                report_date=get_value('Report Date'),
                classification=get_value('Classification'),
                distribution=get_value('Distribution'),
                product_quantity=get_value('Product Quantity'),
                code_info=get_value('Code Info'),
                upcs=upcs,
                source=get_value('Source')
            )
            recalls.append(recall)
        
        return recalls

