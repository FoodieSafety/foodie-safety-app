from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.util.config import FRONTEND_URL
from typing import List

def add_cors(app: FastAPI, origins: List[str] = [FRONTEND_URL, "http://foodiesafety.duckdns.org:3000", "http://foodiesafety.duckdns.org", "http://54.183.230.236:3000", "http://3.18.108.177:3000", "http://3.18.108.177"]) -> FastAPI:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )
    return app
