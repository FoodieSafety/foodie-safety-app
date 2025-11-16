from typing import List, Dict, Optional

from ..dao.recalls_dao import RecallsDao
from ..util.dynamo_util import DynamoUtil
from ..util.schemas import RecallTimestamp


class RecallsController:
    """
    Controller for recall operations and passing response from model to view.
    """

    @staticmethod
    def get_recalls_with_latest_timestamp(ddb_util: DynamoUtil) -> Dict:
        """
        Retrieve all recalls along with the latest RecallProcessor timestamp.

        """
        recalls = RecallsDao.get_recalls(ddb_util) or []

       
        timestamp_record: Optional[RecallTimestamp] = RecallsDao.get_update_time(ddb_util)

        latest_timestamp_iso: Optional[str] = None
        if timestamp_record:
            latest_timestamp_iso = timestamp_record.time_iso

        return {
            "recalls": recalls,
            "latest_timestamp": latest_timestamp_iso,
            "total_count": len(recalls),
        }
