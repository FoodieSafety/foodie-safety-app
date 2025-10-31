import os

from app.util.dynamo_util import DynamoUtil
from app.util.schemas import ChatError


class CharDao:
    @staticmethod
    def get_chat_session(user_id, session_id, ddb:DynamoUtil):
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb.get_item(table_name, "user_id", user_id)
        if not item:
            return ChatError(status_code = 404)
        sessions = item.get('sessions', [])
        for session in sessions:
            if session.get('sessionId') == session_id:
                return session  # Found the session
        return ChatError(status_code = 404)
