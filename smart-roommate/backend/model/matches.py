"""
Match
"""
from sqlalchemy import Column, Integer, ForeignKey
from db.database import Base

class Match(Base):
    """
    Match
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    matched_user_id = Column(Integer, ForeignKey("users.id"))
