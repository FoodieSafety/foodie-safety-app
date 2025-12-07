from typing import List

from ..util.schemas import TokenData, ChatResponse, ChatMsg, ChatSession
from ..util.chat_api import get_gemini_response
from ..util.chat_util import enforce_session_limit
from ..util.dynamo_util import DynamoUtil
from ..dao.chat_dao import ChatDao

class ChatController:
    """
    Controller for CRUD operations on Product Object
    and passing response from model to view
    """
    @staticmethod
    def post_messages(session_id: str, messages: List[ChatMsg], ddb_util: DynamoUtil, token_data: TokenData) -> ChatResponse:
        user_id = token_data.user_id
        enforce_session_limit(user_id=user_id, session_id=session_id, ddb_util=ddb_util)
        enqueue_response = ChatDao.enqueue_msgs(user_id=user_id, session_id=session_id, msgs=messages, ddb_util=ddb_util)
        session_id = enqueue_response.session_id
        chat_session = ChatDao.get_chat_session(user_id=user_id, session_id=session_id, ddb_util=ddb_util)
        gemini_response = get_gemini_response(context=chat_session.msgs)
        return ChatDao.enqueue_msgs(user_id=user_id, session_id=session_id, msgs=gemini_response, ddb_util=ddb_util)
    
    @staticmethod
    def get_messages(session_id: str, ddb_util: DynamoUtil, token_data: TokenData) -> ChatSession:
        user_id = token_data.user_id
        return ChatDao.get_chat_session(user_id=user_id, session_id=session_id, ddb_util=ddb_util)
    
    @staticmethod
    def delete_chat_session(session_id: str, ddb_util: DynamoUtil, token_data: TokenData) -> None:
        user_id = token_data.user_id
        return ChatDao.delete_chat_session(user_id=user_id, session_id=session_id, ddb_util=ddb_util)

    @staticmethod
    def get_chat_sessions(ddb_util: DynamoUtil, token_data: TokenData) -> List[str]:
        """
        Return a list of session_ids for the current user.
        """
        user_id = token_data.user_id
        return ChatDao.get_chat_sessions(user_id=user_id, ddb_util=ddb_util)