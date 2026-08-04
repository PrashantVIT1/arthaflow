"""API routes for customer endpoints."""

import csv
import io
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.config import get_db
from app.schemas.customer import CustomerResponse
from app.services.customer import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    """
    Get all customers with aggregated order data.

    Returns:
        List of CustomerResponse with customer details and order statistics
    """
    try:
        service = CustomerService(db)
        return service.get_all_customers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
def export_customers_csv(db: Session = Depends(get_db)):
    """
    Export customers data as CSV.

    Returns:
        CSV file with all customers data
    """
    try:
        service = CustomerService(db)
        customers = service.get_all_customers()

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(
            [
                "Customer ID",
                "Name",
                "Email",
                "Phone",
                "Address",
                "City",
                "Country",
                "Total Orders",
                "Total Spent",
                "Last Order Date",
                "Created At",
                "Updated At",
            ]
        )

        # Write data rows
        for customer in customers:
            writer.writerow(
                [
                    customer.id,
                    customer.name,
                    customer.email,
                    customer.phone or "",
                    customer.address or "",
                    customer.city or "",
                    customer.country or "",
                    customer.total_orders,
                    customer.total_spent,
                    (
                        customer.last_order_date.isoformat()
                        if customer.last_order_date
                        else ""
                    ),
                    customer.created_at.isoformat() if customer.created_at else "",
                    customer.updated_at.isoformat() if customer.updated_at else "",
                ]
            )

        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="customers.csv"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
