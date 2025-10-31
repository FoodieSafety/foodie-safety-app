import requests
from .config import GEMINI_API_URL, GEMINI_API_HEADERS, CHAT_ERROR_MSG

def get_gemini_response(message: str):
    payload = {
        "contents": [
            {
                "parts": [
                    { "text": message }
                ]
            }
        ]
    }
    response = requests.post(GEMINI_API_URL, headers=GEMINI_API_HEADERS, json=payload)

    candidates = response.json().get("candidates", [])
    if not candidates:
        return [CHAT_ERROR_MSG]
    
    content = candidates[0].get("content", [])
    if not content:
        return [CHAT_ERROR_MSG]
    
    texts = [part["text"] for part in content.get("parts", []) if "text" in part]
    if not texts:
        return [CHAT_ERROR_MSG]
    
    return texts