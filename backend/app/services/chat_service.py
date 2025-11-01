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
    messages = [ChatMsg(by=MsgBy.USER, content=message)]
    return ChatController.post_messages(session_id=session_id, messages=messages, db=db, ddb_util=ddb_util, token_data=token_data)