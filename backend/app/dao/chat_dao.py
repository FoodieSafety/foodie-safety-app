import os
import uuid
from typing import List
from uuid import uuid5

from app.util.dynamo_util import DynamoUtil, get_ddb_util
from app.util.schemas import ChatDaoResponse, UserChats, ChatSession, ChatMsg, MsgBy


class ChatDao:
    @staticmethod
    def get_chat_session(user_id, session_id, ddb_util:DynamoUtil):
        """
        Returns the entire chat session for a given user_id and session_id
        """
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)
        if not item:
            return ChatDaoResponse(status_code = 404, msg="User not found")
        sessions = item.get('chats', [])
        for session in sessions:
            if session.get('session_id') == session_id:
                return session  # Found the session
        return ChatDaoResponse(status_code = 404, msg="Session not found")

    @staticmethod
    def enqueue_msgs(user_id, session_id, msgs: List[ChatMsg], ddb_util:DynamoUtil):
        """
        Enqueues multiple messages in a chat session for a given user_id and session_id
        """
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)
        if not item:
            return ChatDaoResponse(status_code = 404, msg="User not found")
        sessions = item.get('chats', [])
        for session in sessions:
            if session.get('session_id') == session_id:
                for msg in msgs:
                    session['msgs'].append(msg.model_dump())
                item["chats"] = sessions
                ddb_util.ddb.Table(table_name).put_item(Item=item)
                return ChatDaoResponse(status_code = 200, msg="Chat session enqueued")
        return ChatDaoResponse(status_code = 404, msg="Unable to enqueue chat messages")
