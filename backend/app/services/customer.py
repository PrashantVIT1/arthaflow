"""Service for customer operations."""

from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.customer import CustomerResponse


class CustomerService:
    """Service for customer business logic."""

    def __init__(self, db: Session):
        """Initialize customer service with database session."""
        self.db = db

    def get_all_customers(self) -> List[CustomerResponse]:
        """
        Get all customers with aggregated order data.

        Returns:
            List of CustomerResponse with order statistics
        """
        # Query customers with order aggregations
        query = text(
            """
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.address,
                c.city,
                c.country,
                c.created_at,
                c.updated_at,
                COALESCE(COUNT(o.id), 0) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as total_spent,
                MAX(o.order_date) as last_order_date
            FROM customers c
            LEFT JOIN orders o ON c.id = o.customer_id
            GROUP BY c.id, c.name, c.email, c.phone, c.address, c.city, c.country, c.created_at, c.updated_at
            ORDER BY c.id
        """
        )

        result = self.db.execute(query)
        customers = []

        for row in result:
            customers.append(
                CustomerResponse(
                    id=row.id,
                    name=row.name,
                    email=row.email,
                    phone=row.phone,
                    address=row.address,
                    city=row.city,
                    country=row.country,
                    total_orders=row.total_orders,
                    total_spent=float(row.total_spent) if row.total_spent else 0.0,
                    last_order_date=row.last_order_date,
                    created_at=row.created_at,
                    updated_at=row.updated_at,
                )
            )

        return customers
