from sqlalchemy import Column, DateTime, Float, Index, Integer, String
from sqlalchemy.sql import func

from app.database.config import Base


class Product(Base):
    """Product model for retail analytics."""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    category = Column(String(100), nullable=False, index=True)
    price = Column(Float, nullable=False)
    cost = Column(Float)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, category={self.category}, price={self.price})>"
