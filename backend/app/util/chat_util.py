from fastapi import HTTPException, status

from .dynamo_util import DynamoUtil
from ..dao.chat_dao import ChatDao
from .config import MAX_CHAT_SESSION_LENGTH

def get_session_length(user_id: int, session_id: str, ddb_util: DynamoUtil) -> int:
    chat_session = ChatDao.get_chat_session(user_id=user_id, session_id=session_id, ddb_util=ddb_util)
    return len(chat_session.msgs)

def enforce_session_limit(user_id: int, session_id: str, ddb_util: DynamoUtil) -> None:
    if not session_id:
        return

    if get_session_length(user_id=user_id, session_id=session_id, ddb_util=ddb_util) < MAX_CHAT_SESSION_LENGTH:
        return
    
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Message limits have been exceeded for this session"
    )