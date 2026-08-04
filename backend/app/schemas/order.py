"""Schemas for order operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OrderResponse(BaseModel):
    """Order response schema."""

    id: int
    order_number: str
    customer_id: int
    product_id: int
    quantity: int
    unit_price: float
    total_amount: float
    order_date: Optional[datetime] = None
    status: str
    region: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
