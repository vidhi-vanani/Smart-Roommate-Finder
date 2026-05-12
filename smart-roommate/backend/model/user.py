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
    age = Column(Integer, index=True)
    diet = Column(String)
    allergies = Column(ARRAY(String))
    description = Column(String)
    street_address = Column(String)
    city = Column(String)
    zip_code = Column(Integer)
    state = Column(String)
    country = Column(String)
    occupation = Column(String)
    is_active = Column(Boolean, default=True)

    def __str__(self):
        return self.username

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
