"""
Message schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    content: str


class MessageRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UnreadMessageCount(BaseModel):
    user_id: int
    unread_count: int
