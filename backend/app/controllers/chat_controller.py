from sqlalchemy.orm import Session
from typing import List

from ..util.schemas import TokenData
from ..util.chat_api import get_gemini_response
from ..util.dynamo_util import DynamoUtil

class ChatController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def post_message(session_id: str, message: str, db: Session, ddb_util: DynamoUtil, token_data: TokenData) -> List[str]:
        return get_gemini_response(message=message)