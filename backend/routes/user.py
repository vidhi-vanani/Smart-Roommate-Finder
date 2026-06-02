"""
User routes
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError

from schemas.user import UserCreate, UserLogin, UserRead, UserResponse
from services.security import verify_password
from services.user_service import (
    create_user as create_user_service,
    find_user_by_email,
    find_user_by_id as find_user_by_id_service,
)

router = APIRouter()


@router.post("/users/", response_model=UserResponse)
def register_user(user_data: UserCreate):
    """Register a new user."""
    existing_user = find_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    try:
        new_user = create_user_service(
            username=user_data.name,
            email=user_data.email,
            password=user_data.password,
            age=user_data.age,
            occupation=user_data.occupation,
            city=user_data.city,
            phone_number=user_data.phone_number,
        )
    except IntegrityError:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "email": new_user.email,
    }


@router.post("/login/", response_model=UserResponse)
def login_user(user_data: UserLogin):
    """Authenticate a user by email and password."""
    user = find_user_by_email(user_data.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/user", response_model=UserResponse)
def create_user(user_data: UserCreate):
    """Create a user record."""
    try:
        new_user = create_user_service(
            username=user_data.name,
            email=user_data.email,
            password=user_data.password,
            age=user_data.age,
            occupation=user_data.occupation,
            city=user_data.city,
            phone_number=user_data.phone_number,
        )
    except IntegrityError:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "email": new_user.email,
    }


@router.get("/user/{user_id}", response_model=UserRead)
def get_user_by_id(user_id: int):
    """Get user by id."""
    user = find_user_by_id_service(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
