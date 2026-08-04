"""Schemas for customer operations."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CustomerResponse(BaseModel):
    """Customer response with aggregated order data."""

    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    total_orders: int = 0
    total_spent: float = 0.0
    last_order_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
