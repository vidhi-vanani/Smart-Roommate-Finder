"""
User schemas"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserPreferencesMixin(BaseModel):
    """
    Pydantic model for user roommate preferences.
    """
    min_budget: Optional[int] = None
    max_budget: Optional[int] = None
    quiet_hours_from: Optional[int] = None
    quiet_hours_to: Optional[int] = None
    cleanliness: Optional[str] = None
    social_interaction: Optional[str] = None
    interests: Optional[str] = None
    smoking_preference: Optional[bool] = None

    @model_validator(mode="before")
    @classmethod
    def normalize_preference_keys(cls, values):
        """
        Accept common frontend key variants while storing snake_case fields.
        """
        if not isinstance(values, dict):
            return values

        key_aliases = {
            "quiet_hours_from_": "quiet_hours_from",
            "Cleanliness": "cleanliness",
            "Social_interaction": "social_interaction",
            "SocialInteraction": "social_interaction",
            "Intersets": "interests",
            "Interests": "interests",
            "Smoking_preference": "smoking_preference",
            "SmokingPreference": "smoking_preference",
        }

        for source_key, target_key in key_aliases.items():
            if source_key in values and target_key not in values:
                values[target_key] = values[source_key]

        return values

    @model_validator(mode="after")
    def validate_budget_range(self):
        if (
            self.min_budget is not None
            and self.max_budget is not None
            and self.max_budget - self.min_budget < 100
        ):
            raise ValueError("Maximum budget must be at least $100 greater than minimum budget")

        if (
            self.quiet_hours_from is not None
            and self.quiet_hours_to is not None
            and self.quiet_hours_from == self.quiet_hours_to
        ):
            raise ValueError("Quiet hours from and to cannot be the same")

        return self


class UserBase(UserPreferencesMixin):
    """
    Pydantic model for user base
    """
    email: EmailStr
    age: Optional[int] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    diet: Optional[str] = None
    allergies: Optional[List[str]] = None
    description: Optional[str] = None
    street_address: Optional[str] = None
    zip_code: Optional[int] = None
    state: Optional[str] = None
    country: Optional[str] = None


class UserCreate(UserBase):
    """
    Pydantic model for user creation
    """
    name: str = Field(..., alias="name")
    password: str

    model_config = ConfigDict(validate_by_name=True, validate_by_alias=True)


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
    diet: Optional[str]
    allergies: Optional[List[str]]
    description: Optional[str]
    street_address: Optional[str]
    zip_code: Optional[int]
    state: Optional[str]
    country: Optional[str]
    min_budget: Optional[int]
    max_budget: Optional[int]
    quiet_hours_from: Optional[int]
    quiet_hours_to: Optional[int]
    cleanliness: Optional[str]
    social_interaction: Optional[str]
    interests: Optional[str]
    smoking_preference: Optional[bool]
    profile_photo: Optional[str]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class UserPreferencesUpdate(UserPreferencesMixin):
    """
    Pydantic model for updating user roommate preferences.
    """
    age: Optional[int] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    phone_number: Optional[str] = None
    diet: Optional[str] = None
    allergies: Optional[List[str]] = None
    description: Optional[str] = None
    street_address: Optional[str] = None
    zip_code: Optional[int] = None
    state: Optional[str] = None
    country: Optional[str] = None


class RoommateRequestCreate(BaseModel):
    sender_id: int
    receiver_id: int


class RoommateRequestRead(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
