"""
Roommate request model
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, UniqueConstraint
from db.database import Base


class RoommateRequest(Base):
    """
    Roommate request
    """
    __tablename__ = "roommate_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("sender_id", "receiver_id", name="uq_request_sender_receiver"),
    )
