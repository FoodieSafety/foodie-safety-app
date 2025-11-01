from sqlalchemy.orm import Session
from typing import List

from ..util.schemas import TokenData, ChatResponse, ChatMsg
from ..util.chat_api import get_gemini_response
from ..util.dynamo_util import DynamoUtil
from ..dao.chat_dao import ChatDao

class ChatController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def post_messages(session_id: str, messages: List[ChatMsg], db: Session, ddb_util: DynamoUtil, token_data: TokenData) -> ChatResponse:
        user_id = token_data.user_id
        enqueue_response = ChatDao.enqueue_msgs(user_id=user_id, session_id=session_id, msgs=messages, ddb_util=ddb_util)
        session_id = enqueue_response.session_id
        chat_session = ChatDao.get_chat_session(user_id=user_id, session_id=session_id, ddb_util=ddb_util)
        gemini_response = get_gemini_response(context=chat_session.msgs)
        return ChatDao.enqueue_msgs(user_id=user_id, session_id=session_id, msgs=gemini_response, ddb_util=ddb_util)