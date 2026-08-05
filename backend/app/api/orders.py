"""API routes for order endpoints."""

import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.config import get_db
from app.models.order import Order
from app.schemas.order import OrderResponse
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=PaginatedResponse[OrderResponse])
def get_orders(
    page: int = Query(
        1, ge=1, description="Page number (starts from 1)"
    ),
    size: int = Query(
        10, ge=1, le=10000, description="Number of items per page"
    ),
    db: Session = Depends(get_db),
):
    """
    Get orders with server-side pagination.

    Args:
        page: Page number (1-indexed)
        size: Number of items per page (max 100)
        db: Database session

    Returns:
        Paginated response with orders and metadata
    """
    try:
        # Get total count
        total_elements = db.query(Order).count()

        # Calculate pagination metadata
        total_pages = (
            (total_elements + size - 1) // size
            if total_elements > 0
            else 0
        )
        has_next = page < total_pages
        has_previous = page > 1
        first_page = page == 1
        last_page = page == total_pages or total_pages == 0

        # Query with offset and limit (database-level pagination)
        orders = (
            db.query(Order)
            .order_by(Order.id)
            .offset((page - 1) * size)
            .limit(size)
            .all()
        )

        return {
            "items": orders,
            "current_page": page,
            "page_size": size,
            "total_elements": total_elements,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous,
            "first_page": first_page,
            "last_page": last_page,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
def export_orders_csv(db: Session = Depends(get_db)):
    """
    Export orders data as CSV.

    Returns:
        CSV file with all orders data
    """
    try:
        orders = db.query(Order).all()

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(
            [
                "Order ID",
                "Order Number",
                "Customer ID",
                "Product ID",
                "Quantity",
                "Unit Price",
                "Total Amount",
                "Order Date",
                "Status",
                "Region",
                "Created At",
                "Updated At",
            ]
        )

        # Write data rows
        for order in orders:
            writer.writerow(
                [
                    order.id,
                    order.order_number,
                    order.customer_id,
                    order.product_id,
                    order.quantity,
                    order.unit_price,
                    order.total_amount,
                    order.order_date.isoformat() if order.order_date else "",
                    order.status,
                    order.region or "",
                    order.created_at.isoformat() if order.created_at else "",
                    order.updated_at.isoformat() if order.updated_at else "",
                ]
            )

        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="orders.csv"'
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
