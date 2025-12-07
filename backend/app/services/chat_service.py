import os
from fastapi import APIRouter, status, Form, Depends
from typing import List
from ..controllers.chat_controller import ChatController
from ..util.oauth2 import get_current_user
from ..util.dynamo_util import DynamoUtil, get_ddb_util
from ..util.schemas import ChatResponse, ChatMsg, MsgBy, ChatSession

# Create router object
router = APIRouter(prefix="/chat", tags=["Chat"])

# Create the chat table
get_ddb_util().create_table(
    table_name=f"{os.getenv('DYNAMODB_CHAT_TABLE')}", 
    attribute_definitions=[{"AttributeName": "user_id", "AttributeType": "N"}], 
    key_schema=[{"AttributeName": "user_id", "KeyType": "HASH"}])

@router.post("/message", response_model=ChatResponse, status_code=status.HTTP_202_ACCEPTED)
async def post_message(
        session_id: str = Form(...),
        message: str = Form(...),
        ddb_util: DynamoUtil = Depends(get_ddb_util),
        token_data = Depends(get_current_user)
):
    """
    Post a message
    :param session_id: session to post the message to
    :param message: text message to be sent
    :param ddb_util: dynamodb access for chat storage
    :param token_data: user token
    :return: AI response
    """
    messages = [ChatMsg(by=MsgBy.USER, content=message)]
    return ChatController.post_messages(session_id=session_id, messages=messages, ddb_util=ddb_util, token_data=token_data)

@router.get("/message", response_model=ChatSession)
async def get_messages(
        session_id: str,
        ddb_util: DynamoUtil = Depends(get_ddb_util),
        token_data = Depends(get_current_user)
):
    """
    Get the message history
    :param session_id: session to get the message history from
    :param ddb_util: dynamodb access for chat storage
    :param token_data: user token
    :return: chat session
    """
    return ChatController.get_messages(session_id=session_id, ddb_util=ddb_util, token_data=token_data)

@router.delete("/message", status_code=status.HTTP_202_ACCEPTED)
async def delete_chat_session(
        session_id: str,
        ddb_util: DynamoUtil = Depends(get_ddb_util),
        token_data = Depends(get_current_user)
):
    """
    Delete the chat session
    :param session_id: session to get the message history from
    :param ddb_util: dynamodb access for chat storage
    :param token_data: user token
    :return: nothing
    """
    return ChatController.delete_chat_session(session_id=session_id, ddb_util=ddb_util, token_data=token_data)

@router.get("/sessions", response_model=List[str])
async def get_chat_sessions(
        ddb_util: DynamoUtil = Depends(get_ddb_util),
        token_data = Depends(get_current_user)
):
    """
    Get all chat session IDs for the user.
    :param ddb_util: dynamodb access for chat storage
    :param token_data: user token
    :return: list of session_ids (strings)
    """
    return ChatController.get_chat_sessions(ddb_util=ddb_util, token_data=token_data)
