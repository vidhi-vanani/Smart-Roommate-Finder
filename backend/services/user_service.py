from typing import Optional

from sqlalchemy.exc import IntegrityError

from db.database import SessionLocal
from model.user import User
from services.security import hash_password


def _open_session():
    return SessionLocal()


def find_user_by_email(email: str) -> Optional[User]:
    db = _open_session()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def find_user_by_id(user_id: int) -> Optional[User]:
    db = _open_session()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()


def create_user(
    username: str,
    email: str,
    password: Optional[str] = None,
    hashed_password: Optional[str] = None,
    age: Optional[int] = None,
    occupation: Optional[str] = None,
    city: Optional[str] = None,
    phone_number: Optional[str] = None,
) -> User:
    if password:
        password_value = hash_password(password)
    elif hashed_password:
        password_value = hashed_password
    else:
        raise ValueError("Password is required")

    db = _open_session()
    try:
        new_user = User(
            username=username,
            email=email,
            hashed_password=password_value,
            age=age,
            occupation=occupation,
            city=city,
            phone_number=phone_number,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise
    finally:
        db.close()
