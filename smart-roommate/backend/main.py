
""" 
Main
"""
from fastapi import FastAPI
from db.database import engine, Base
from routes.user import router as user_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
