"""
Message routes
"""
from typing import List
from fastapi import APIRouter, HTTPException

from schemas.message import MessageCreate, MessageRead, UnreadMessageCount
from services.message_notification_service import (
    get_unread_message_counts,
    mark_messages_as_read,
)
from services.message_service import create_message, get_messages_between_users

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/unread/{user_id}", response_model=List[UnreadMessageCount])
def get_unread_counts(user_id: int):
    counts = get_unread_message_counts(user_id)
    return [
        {"user_id": sender_id, "unread_count": unread_count}
        for sender_id, unread_count in counts.items()
    ]


@router.get("/{current_user_id}/{other_user_id}", response_model=List[MessageRead])
def get_conversation(current_user_id: int, other_user_id: int):
    try:
        return get_messages_between_users(current_user_id, other_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/", response_model=MessageRead)
def send_message(message_data: MessageCreate):
    try:
        return create_message(
            sender_id=message_data.sender_id,
            receiver_id=message_data.receiver_id,
            content=message_data.content,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/read/{current_user_id}/{other_user_id}")
def mark_conversation_read(current_user_id: int, other_user_id: int):
    return {"updated_count": mark_messages_as_read(current_user_id, other_user_id)}
