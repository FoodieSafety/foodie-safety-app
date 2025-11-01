import requests
from typing import List

from .config import GEMINI_API_URL, GEMINI_API_HEADERS, CHAT_ERROR_MSG
from .schemas import ChatMsg, MsgBy

def get_gemini_response(context: List[ChatMsg]):
    payload = {
        "contents": [
            {
                "role": "user" if msgObj.by else "model",
                "parts": [
                    { "text": msgObj.content } 
                ]
            }
        for msgObj in context]
    }
    response = requests.post(GEMINI_API_URL, headers=GEMINI_API_HEADERS, json=payload)

    candidates = response.json().get("candidates", [])
    if not candidates:
        return [CHAT_ERROR_MSG]
    
    content = candidates[0].get("content", [])
    if not content:
        return [CHAT_ERROR_MSG]
    
    messages = [ChatMsg(by=MsgBy.LLM, content=part["text"]) for part in content.get("parts", []) if "text" in part]
    if not messages:
        return [CHAT_ERROR_MSG]
    
    return messages