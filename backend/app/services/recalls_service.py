from fastapi import APIRouter, Depends, status

from ..util.dynamo_util import get_ddb_util, DynamoUtil
from ..controllers.recalls_controller import RecallsController
from ..util.schemas import RecallsResponse

router = APIRouter(prefix="/recalls", tags=["Recalls"])


@router.get(
    "",
    response_model=RecallsResponse,
    status_code=status.HTTP_200_OK,
)
async def get_recalls(
    ddb_util: DynamoUtil = Depends(get_ddb_util),
) -> RecallsResponse:
    """
    Return recalls plus the latest recall update timestamp.
    """
    return RecallsController.get_recalls(ddb_util)
