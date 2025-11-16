import os
from fastapi import APIRouter, status, Form, Depends
from sqlalchemy.orm import Session
from ..controllers.chat_controller import ChatController
from ..util.database import get_db
from ..util.oauth2 import get_current_user
from ..util.dynamo_util import DynamoUtil, get_ddb_util
from ..util.schemas import ChatResponse, ChatMsg, MsgBy

# Create router object
router = APIRouter(prefix="/chat", tags=["Chat"])

# Lazy table creation - only create when needed, not at import time
_chat_table_created = False

def ensure_chat_table_exists(ddb_util: DynamoUtil):
    """Ensure chat table exists, create if it doesn't"""
    global _chat_table_created
    if _chat_table_created:
        return
    
    chat_table_name = os.getenv('DYNAMODB_CHAT_TABLE')
    if chat_table_name:
        try:
            ddb_util.create_table(
                table_name=chat_table_name, 
                attribute_definitions=[{"AttributeName": "user_id", "AttributeType": "N"}], 
                key_schema=[{"AttributeName": "user_id", "KeyType": "HASH"}]
            )
            _chat_table_created = True
        except Exception as e:
            print(f"Warning: Could not create chat table: {e}")
            # Continue anyway - table might already exist or DynamoDB might not be available

@router.post("/message", response_model=ChatResponse, status_code=status.HTTP_202_ACCEPTED)
async def post_message(
        session_id: str = Form(...),
        message: str = Form(...),
        db: Session = Depends(get_db),
        ddb_util: DynamoUtil = Depends(get_ddb_util),
        token_data = Depends(get_current_user)
):
    """
    Post a message
    :param session_id: session to post the message to
    :param message: text message to be sent
    :param db: mysql session object
    :param ddb_util: dynamodb access for chat storage
    :param token_data: user token
    :return: AI response
    """
    # Ensure chat table exists before using it
    ensure_chat_table_exists(ddb_util)
    
    messages = [ChatMsg(by=MsgBy.USER, content=message)]
    return ChatController.post_messages(session_id=session_id, messages=messages, db=db, ddb_util=ddb_util, token_data=token_data)