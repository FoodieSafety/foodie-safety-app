import requests
from typing import List
from fastapi import HTTPException, status
from .config import GEMINI_API_URL, GEMINI_API_HEADERS
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
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini could not provide response candidates"
        )
    
    content = candidates[0].get("content", [])
    if not content:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini could not provide response content"
        )
    
    messages = [ChatMsg(by=MsgBy.LLM, content=part["text"]) for part in content.get("parts", []) if "text" in part]
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini could not provide response text"
        )
    
    return messages