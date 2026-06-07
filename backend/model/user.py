"""
User    
"""
from sqlalchemy import Column, Integer, String, Boolean, ARRAY
from db.database import Base


class User(Base):
    """
    User
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone_number = Column(String, nullable=True)
    age = Column(Integer, index=True, nullable=True)
    gender = Column(String, nullable=True)
    diet = Column(String, nullable=True)
    allergies = Column(ARRAY(String), nullable=True)
    description = Column(String, nullable=True)
    street_address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    zip_code = Column(Integer, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    min_budget = Column(Integer, nullable=True)
    max_budget = Column(Integer, nullable=True)
    quiet_hours_from = Column(Integer, nullable=True)
    quiet_hours_to = Column(Integer, nullable=True)
    cleanliness = Column(String, nullable=True)
    social_interaction = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    smoking_preference = Column(Boolean, nullable=True)
    profile_photo = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    def __str__(self):
        return self.username

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
