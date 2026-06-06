from typing import Dict
from db.database import SessionLocal
from model.message import Message


def _open_session():
    return SessionLocal()


def get_unread_message_counts(user_id: int) -> Dict[int, int]:
    db = _open_session()
    try:
        rows = (
            db.query(Message.sender_id, Message.id)
            .filter(Message.receiver_id == user_id, Message.is_read == False)
            .all()
        )

        counts: Dict[int, int] = {}
        for sender_id, _ in rows:
            counts[sender_id] = counts.get(sender_id, 0) + 1

        return counts
    finally:
        db.close()


def mark_messages_as_read(current_user_id: int, other_user_id: int) -> int:
    db = _open_session()
    try:
        updated_count = (
            db.query(Message)
            .filter(
                Message.sender_id == other_user_id,
                Message.receiver_id == current_user_id,
                Message.is_read == False,
            )
            .update({Message.is_read: True}, synchronize_session=False)
        )
        db.commit()
        return updated_count
    finally:
        db.close()
