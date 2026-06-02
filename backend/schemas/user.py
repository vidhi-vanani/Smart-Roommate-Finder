"""
User schemas"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """
    Pydantic model for user base
    """
    email: EmailStr
    age: Optional[int] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None


class UserCreate(UserBase):
    """
    Pydantic model for user creation
    """
    name: str = Field(..., alias="name")
    password: str

    class Config:
        """
        Pydantic config
        """
        allow_population_by_field_name = True


class UserResponse(BaseModel):
    """
    Pydantic model for user response
    """
    message: str
    user_id: int
    email: EmailStr


class UserLogin(BaseModel):
    """
    Pydantic model for user login
    """
    email: EmailStr
    password: str


class UserRead(BaseModel):
    """
    Pydantic model for user read
    """
    id: int
    username: str
    email: EmailStr
    age: Optional[int]
    occupation: Optional[str]
    city: Optional[str]
    phone_number: Optional[str]
    is_active: bool

    class Config:
        """
        Pydantic config
        """
        orm_mode = True
