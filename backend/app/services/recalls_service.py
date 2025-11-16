from fastapi import APIRouter, Depends, status

from ..util.dynamo_util import get_ddb_util, DynamoUtil
from ..controllers.recalls_controller import RecallsController
from ..util.schemas import RecallsWithTimestampResponse

router = APIRouter(prefix="/recalls", tags=["Recalls"])


@router.get(
    "/with-latest-timestamp",
    response_model=RecallsWithTimestampResponse,
    status_code=status.HTTP_200_OK,
)
async def get_recalls_with_latest_timestamp(
    ddb_util: DynamoUtil = Depends(get_ddb_util),
) -> RecallsWithTimestampResponse:
    
    result = RecallsController.get_recalls_with_latest_timestamp(ddb_util)

    return RecallsWithTimestampResponse(
        recalls=result["recalls"],
        latest_timestamp=result["latest_timestamp"],
        total_count=result["total_count"],
    )
