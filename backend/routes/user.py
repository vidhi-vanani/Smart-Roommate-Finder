"""
User
"""
import hashlib
import hmac
import os
import binascii
from fastapi import APIRouter, Body, HTTPException
from db.database import SessionLocal
from model.user import User
from sqlalchemy.exc import IntegrityError

router = APIRouter()


def hash_password(password: str) -> str:
    """Hash a plaintext password using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return f"{binascii.hexlify(salt).decode('utf-8')}:{binascii.hexlify(pwd_hash).decode('utf-8')}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a plaintext password against a stored salt:hash."""
    salt_hex, hash_hex = stored_hash.split(':')
    salt = binascii.unhexlify(salt_hex)
    expected_hash = binascii.unhexlify(hash_hex)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100_000)
    return hmac.compare_digest(pwd_hash, expected_hash)


@router.post("/users/")
def register_user(user_data: dict = Body(...)):
    """
    Register a new user
    Expected fields: name, email, password, phone_number
    """
    db = SessionLocal()

    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.get("email")).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash user password before saving
        raw_password = user_data.get("password")
        if not raw_password:
            raise HTTPException(status_code=400, detail="Password is required")

        new_user = User(
            username=user_data.get("name"),
            email=user_data.get("email"),
            hashed_password=hash_password(raw_password),
            age=user_data.get("age"),
            occupation=user_data.get("occupation"),
            city=user_data.get("city"),
            phone_number=user_data.get("phone_number")
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "email": new_user.email
        }

    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.post("/user")
def create_user(user_data: dict = Body(...)):
    """
    user_data: dict
    """
    db = SessionLocal()

    try:
        raw_password = user_data.get("password")
        stored_password = user_data.get("hashed_password")

        if raw_password:
            password_value = hash_password(raw_password)
        elif stored_password:
            password_value = stored_password
        else:
            raise HTTPException(status_code=400, detail="Password is required")

        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=password_value,
            age=user_data["age"],
            occupation=user_data["occupation"],
            city=user_data["city"],
            phone_number=user_data["phone_number"]
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User created successfully",
            "user_id": new_user.id
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()


@router.get("/user/{user_id}")
def get_user_by_id(user_id: int):
    """
    Get user by id
    """
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"message": "User not found"}

        return user

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()
