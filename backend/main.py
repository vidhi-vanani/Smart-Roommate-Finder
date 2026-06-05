
""" 
Main file
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from db.schema_sync import sync_user_preference_columns
import importlib
importlib.import_module("model.request")
from routes.user import router as user_router
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://10.0.0.132:3000",
        "http://10.0.0.16:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
sync_user_preference_columns()

# Serve uploaded static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(user_router)
