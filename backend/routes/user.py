"""
User routes
"""
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File
import os
import shutil
from sqlalchemy.exc import IntegrityError

from schemas.user import (
    RoommateRequestCreate,
    RoommateRequestRead,
    UserCreate,
    UserLogin,
    UserPreferencesUpdate,
    UserRead,
    UserResponse,
)
from services.security import verify_password
from services.user_service import (
    create_roommate_request,
    create_user as create_user_service,
    find_all_users,
    find_user_by_email,
    find_user_by_id as find_user_by_id_service,
    get_received_roommate_requests,
    get_roommate_connections,
    get_sent_roommate_requests,
    update_roommate_request_status,
    update_user_preferences as update_user_preferences_service,
)

router = APIRouter()

@router.post("/users", response_model=UserResponse)
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
            diet=user_data.diet,
            allergies=user_data.allergies,
            description=user_data.description,
            street_address=user_data.street_address,
            zip_code=user_data.zip_code,
            state=user_data.state,
            country=user_data.country,
            min_budget=user_data.min_budget,
            max_budget=user_data.max_budget,
            quiet_hours_from=user_data.quiet_hours_from,
            quiet_hours_to=user_data.quiet_hours_to,
            cleanliness=user_data.cleanliness,
            social_interaction=user_data.social_interaction,
            interests=user_data.interests,
            smoking_preference=user_data.smoking_preference,
        )
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="User with this email already exists") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "email": new_user.email,
    }

@router.post("/login", response_model=UserResponse)
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
            diet=user_data.diet,
            allergies=user_data.allergies,
            description=user_data.description,
            street_address=user_data.street_address,
            zip_code=user_data.zip_code,
            state=user_data.state,
            country=user_data.country,
            min_budget=user_data.min_budget,
            max_budget=user_data.max_budget,
            quiet_hours_from=user_data.quiet_hours_from,
            quiet_hours_to=user_data.quiet_hours_to,
            cleanliness=user_data.cleanliness,
            social_interaction=user_data.social_interaction,
            interests=user_data.interests,
            smoking_preference=user_data.smoking_preference,
        )
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="User with this email already exists") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

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

@router.get("/users", response_model=List[UserRead])
def get_users():
    """List all users."""
    return find_all_users()

@router.patch("/user/{user_id}/preferences", response_model=UserRead)
def update_user_preferences(user_id: int, preferences: UserPreferencesUpdate):
    """Update roommate preferences for an existing user."""
    preference_updates = preferences.model_dump(exclude_unset=True)
    user = update_user_preferences_service(user_id, preference_updates)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/requests/", response_model=RoommateRequestRead)
def send_roommate_request(request_data: RoommateRequestCreate):
    """Send a roommate request from one user to another."""
    try:
        request_record = create_roommate_request(
            sender_id=request_data.sender_id,
            receiver_id=request_data.receiver_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return request_record


@router.get("/requests/sent/{user_id}", response_model=List[RoommateRequestRead])
def get_sent_requests(user_id: int):
    """Get requests sent by a user."""
    return get_sent_roommate_requests(user_id)


@router.get("/requests/received/{user_id}", response_model=List[RoommateRequestRead])
def get_received_requests(user_id: int):
    """Get requests received by a user."""
    return get_received_roommate_requests(user_id)


@router.get("/requests/connections/{user_id}", response_model=List[RoommateRequestRead])
def get_connections(user_id: int):
    """Get accepted roommate connections for a user."""
    return get_roommate_connections(user_id)


@router.post("/requests/{request_id}/accept", response_model=RoommateRequestRead)
def accept_request(request_id: int, receiver_id: int):
    """Accept a roommate request."""
    try:
        request_record = update_roommate_request_status(request_id, receiver_id, "accepted")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not request_record:
        raise HTTPException(status_code=404, detail="Request not found")
    return request_record


@router.post("/requests/{request_id}/reject", response_model=RoommateRequestRead)
def reject_request(request_id: int, receiver_id: int):
    """Reject a roommate request."""
    try:
        request_record = update_roommate_request_status(request_id, receiver_id, "rejected")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not request_record:
        raise HTTPException(status_code=404, detail="Request not found")
    return request_record


@router.post("/user/{user_id}/photo", response_model=UserRead)
def upload_user_photo(user_id: int, file: UploadFile = File(...)):
    """Upload a profile photo for the user and save file path to user record."""
    user = find_user_by_id_service(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "static", "uploads")
    uploads_dir = os.path.abspath(uploads_dir)
    os.makedirs(uploads_dir, exist_ok=True)

    filename = f"user_{user_id}_{file.filename}"
    file_path = os.path.join(uploads_dir, filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    # Store the URL path that frontend can fetch (served from /static)
    photo_url = f"/static/uploads/{filename}"
    updated_user = update_user_preferences_service(user_id, {"profile_photo": photo_url})
    if not updated_user:
        raise HTTPException(status_code=500, detail="Unable to save photo")

    return updated_user
