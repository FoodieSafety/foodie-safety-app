import os
import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.util.config import RECIPE_GEN_SYS_PROMPT
from app.util.dynamo_util import DynamoUtil
from app.util.schemas import ChatResponse, UserChats, ChatSession, ChatMsg, MsgBy
from app.dao.user_dao import UserDao


def _build_personalized_prompt(user_id: int, db: Session) -> str:
    """
    Builds a personalized system prompt by appending user dietary preferences.
    """
    try:
        user = UserDao.get_user(user_id, db)
        preferences = []
        
        if user.general_diet and user.general_diet != "na":
            preferences.append(f"General Diet: {user.general_diet}")
        if user.religious_cultural_diets and user.religious_cultural_diets != "na":
            preferences.append(f"Religious/Cultural Diet: {user.religious_cultural_diets}")
        if user.allergens and user.allergens != "na":
            allergen_list = [a.strip() for a in user.allergens.split(",")]
            preferences.append(f"Allergens: {', '.join(allergen_list)}")
        
        if preferences:
            preference_text = "\n\nUser's Dietary Preferences:\n" + "\n".join(preferences)
            return RECIPE_GEN_SYS_PROMPT + preference_text
    except HTTPException:
        # User not found, use default prompt
        pass
    return RECIPE_GEN_SYS_PROMPT


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
                sesh = ChatSession(**session)  # Found the session
                sesh.msgs.pop(0)
                return sesh
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} has no chat session with id {session_id}"
        )

    @staticmethod
    def enqueue_msgs(user_id, session_id, msgs: List[ChatMsg], ddb_util:DynamoUtil, db: Session) -> ChatResponse:
        """
        Enqueues multiple messages in a chat session for a given user_id and session_id
        """
        table_name = os.getenv('DYNAMODB_CHAT_TABLE')
        item = ddb_util.get_item(table_name, "user_id", user_id)

        if not item:
            session_uuid = str(uuid.uuid4())
            # New chat session is created above. Hence, append sys prompt as the 0th msg
            personalized_prompt = _build_personalized_prompt(user_id, db)
            msgs.insert(0, ChatMsg(by=MsgBy.SYS_PROMPT.value, content=personalized_prompt))
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
        personalized_prompt = _build_personalized_prompt(user_id, db)
        msgs.insert(0, ChatMsg(by=MsgBy.SYS_PROMPT.value, content=personalized_prompt))
        item["chats"].append(ChatSession(session_id=session_uuid, msgs=msgs).model_dump())
        ddb_util.ddb.Table(table_name).put_item(Item=item)

        return ChatResponse(session_id=session_uuid, msgs=msgs)

    @staticmethod
    def get_chat_sessions(user_id, ddb_util: DynamoUtil) -> List[str]:
        """
        Return a list of session_ids for the given user.
        """
        table_name = os.getenv("DYNAMODB_CHAT_TABLE")
        item = ddb_util.get_item(table_name, "user_id", user_id)

        if not item:
            # No record for this user yet -> no sessions
            return []

        sessions = item.get("chats", [])

        # Return only the session_id from each stored session
        return [
            session.get("session_id")
            for session in sessions
            if isinstance(session, dict) and "session_id" in session
        ]