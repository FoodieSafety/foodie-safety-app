from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.util.config import FRONTEND_URL
from typing import List

def add_cors(app: FastAPI, origins: List[str] = [FRONTEND_URL]) -> FastAPI:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    return app