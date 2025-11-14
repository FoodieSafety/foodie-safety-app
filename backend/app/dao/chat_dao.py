import os
import uuid
from typing import List
from fastapi import HTTPException, status

from app.util.config import RECIPE_GEN_SYS_PROMPT
from app.util.dynamo_util import DynamoUtil
from app.util.schemas import ChatResponse, UserChats, ChatSession, ChatMsg, MsgBy


class ChatDao:
    @staticmethod
    def get_chat_session(user_id, session_id, ddb_util:DynamoUtil):
        """
        Returns the entire chat session for a given user_id and session_id
        """
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} has no chat sessions"
            )
        sessions = item.get('chats', [])
        for session in sessions:
            if session.get('session_id') == session_id:
                return ChatSession(**session)  # Found the session
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} has no chat session with id {session_id}"
        )

    @staticmethod
    def enqueue_msgs(user_id, session_id, msgs: List[ChatMsg], ddb_util:DynamoUtil) -> ChatResponse:
        """
        Enqueues multiple messages in a chat session for a given user_id and session_id
        """
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)

        if not item:
            session_uuid = str(uuid.uuid4())
            # New chat session is created above. Hence, append sys prompt as the 0th msg
            msgs.insert(0, ChatMsg(by=MsgBy.SYS_PROMPT.value, content=RECIPE_GEN_SYS_PROMPT))
            ddb_util.ddb.Table(table_name).put_item(Item=UserChats(user_id=user_id, chats=[
                ChatSession(session_id=session_uuid, msgs=msgs)
            ]).model_dump())
            return ChatResponse(session_id=session_uuid, msgs=msgs)

        sessions = item.get('chats', [])

        if session_id:
            for session in sessions:
                if session.get('session_id') == session_id:
                    # convert msgs list to json and append to session["msg"]
                    for msg in msgs:
                        session['msgs'].append(msg.model_dump())
                    item["chats"] = sessions
                    ddb_util.ddb.Table(table_name).put_item(Item=item)
                    return ChatResponse(session_id=session_id, msgs=msgs)

        # Code reaches this point it means that the user exists but the session does not exist
        session_uuid = str(uuid.uuid4())
        # New chat session is created above. Hence, append sys prompt as the 0th msg
        msgs.insert(0, ChatMsg(by=MsgBy.SYS_PROMPT.value, content=RECIPE_GEN_SYS_PROMPT))
        item["chats"].append(ChatSession(session_id=session_uuid, msgs=msgs).model_dump())
        ddb_util.ddb.Table(table_name).put_item(Item=item)

        return ChatResponse(session_id=session_uuid, msgs=msgs)

    @staticmethod
    def get_chat_sessions(user_id, ddb_util:DynamoUtil) -> List[ChatSession]:
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)
        if not item:
            return []
        sessions = item.get('chats', [])

        return [ChatSession(**session) for session in sessions]