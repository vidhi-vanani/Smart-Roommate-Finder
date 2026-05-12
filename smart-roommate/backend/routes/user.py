"""
User
"""
from fastapi import APIRouter, Body
from db.database import SessionLocal
from model.user import User

router = APIRouter()


@router.post("/user")
def create_user(user_data: dict = Body(...)):
    """
    user_data: dict
    """
    db = SessionLocal()

    try:
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=user_data["hashed_password"],
            age=user_data["age"],
            occupation=user_data["occupation"],
            city=user_data["city"]
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
