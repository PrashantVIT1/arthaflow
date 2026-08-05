from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database.config import Base


class Customer(Base):
    """Customer model for retail analytics."""

    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    address = Column(String(500))
    city = Column(String(100))
    country = Column(String(100))
    created_at = Column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return (
            f"<Customer(id={self.id}, name={self.name}, "
            f"email={self.email})>"
        )
