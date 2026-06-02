from typing import Optional, List

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
    diet: Optional[str] = None,
    allergies: Optional[List[str]] = None,
    description: Optional[str] = None,
    street_address: Optional[str] = None,
    zip_code: Optional[int] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    min_budget: Optional[int] = None,
    max_budget: Optional[int] = None,
    quiet_hours_from: Optional[int] = None,
    quiet_hours_to: Optional[int] = None,
    cleanliness: Optional[str] = None,
    social_interaction: Optional[str] = None,
    interests: Optional[str] = None,
    smoking_preference: Optional[bool] = None,
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
            diet=diet,
            allergies=allergies,
            description=description,
            street_address=street_address,
            zip_code=zip_code,
            state=state,
            country=country,
            min_budget=min_budget,
            max_budget=max_budget,
            quiet_hours_from=quiet_hours_from,
            quiet_hours_to=quiet_hours_to,
            cleanliness=cleanliness,
            social_interaction=social_interaction,
            interests=interests,
            smoking_preference=smoking_preference,
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


def update_user_preferences(user_id: int, preferences: dict) -> Optional[User]:
    db = _open_session()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        for field, value in preferences.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()
