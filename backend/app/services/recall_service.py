from fastapi import APIRouter, status, Depends
from typing import List
from ..controllers.recall_controller import RecallController
from ..util.dynamo_util import DynamoUtil, get_ddb_util
from ..util.schemas import RecallInfo

# Create router object
router = APIRouter(prefix="/recalls", tags=["Recalls"])

@router.get("", response_model=List[RecallInfo], status_code=status.HTTP_200_OK)
async def get_all_recalls(
    ddb_util: DynamoUtil = Depends(get_ddb_util)
):
    """
    Get all food recalls from DynamoDB
    :param ddb_util: DynamoDB utility instance
    :return: List of all recalls
    """
    try:
        return RecallController.get_all_recalls(ddb_util=ddb_util)
    except Exception as e:
        # Return empty list if DynamoDB is not available
        print(f"Error fetching recalls: {e}")
        return []

