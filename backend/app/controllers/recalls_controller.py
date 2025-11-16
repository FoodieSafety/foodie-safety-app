from typing import Optional

from ..dao.recalls_dao import RecallsDao
from ..util.dynamo_util import DynamoUtil
from ..util.schemas import RecallTimestamp, RecallsResponse


class RecallsController:
    """
    Controller for recall operations and passing response from model to view.
    """

    @staticmethod
    def get_recalls(ddb_util: DynamoUtil) -> RecallsResponse:
        """
        Retrieve all recalls along with the latest RecallProcessor timestamp.
        """
        recalls = RecallsDao.get_recalls(ddb_util) or []

        timestamp_record: RecallTimestamp = RecallsDao.get_update_time(ddb_util)
        latest_timestamp_iso: Optional[str] = timestamp_record.time_iso

        return RecallsResponse(
            recalls=recalls,
            latest_timestamp=latest_timestamp_iso,
            total_count=len(recalls),
        )
