from typing import Dict, List

from db.database import SessionLocal
from model.message import Message
from model.request import RoommateRequest


def _open_session():
    return SessionLocal()


def are_users_connected(first_user_id: int, second_user_id: int) -> bool:
    db = _open_session()
    try:
        return (
            db.query(RoommateRequest)
            .filter(
                RoommateRequest.status == "accepted",
                (
                    (RoommateRequest.sender_id == first_user_id)
                    & (RoommateRequest.receiver_id == second_user_id)
                )
                | (
                    (RoommateRequest.sender_id == second_user_id)
                    & (RoommateRequest.receiver_id == first_user_id)
                ),
            )
            .first()
            is not None
        )
    finally:
        db.close()


def create_message(sender_id: int, receiver_id: int, content: str) -> Message:
    clean_content = content.strip()
    if not clean_content:
        raise ValueError("Message cannot be empty")
    if sender_id == receiver_id:
        raise ValueError("Cannot send a message to yourself")
    if not are_users_connected(sender_id, receiver_id):
        raise ValueError("Users must be connected before messaging")

    db = _open_session()
    try:
        message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=clean_content,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    finally:
        db.close()


def get_messages_between_users(first_user_id: int, second_user_id: int) -> List[Message]:
    if not are_users_connected(first_user_id, second_user_id):
        raise ValueError("Users must be connected before viewing messages")

    db = _open_session()
    try:
        return (
            db.query(Message)
            .filter(
                (
                    (Message.sender_id == first_user_id)
                    & (Message.receiver_id == second_user_id)
                )
                | (
                    (Message.sender_id == second_user_id)
                    & (Message.receiver_id == first_user_id)
                )
            )
            .order_by(Message.created_at.asc(), Message.id.asc())
            .all()
        )
    finally:
        db.close()
