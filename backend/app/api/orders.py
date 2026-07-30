"""API routes for order endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from app.database.config import get_db
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("")
def get_orders(db: Session = Depends(get_db)):
    """
    Get all orders.
    
    Returns:
        List of orders with all details
    """
    try:
        orders = db.query(Order).all()
        return [
            {
                "id": order.id,
                "order_number": order.order_number,
                "customer_id": order.customer_id,
                "product_id": order.product_id,
                "quantity": order.quantity,
                "unit_price": order.unit_price,
                "total_amount": order.total_amount,
                "order_date": order.order_date.isoformat() if order.order_date else None,
                "status": order.status,
                "region": order.region,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "updated_at": order.updated_at.isoformat() if order.updated_at else None
            }
            for order in orders
        ]
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
        writer.writerow([
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
            "Updated At"
        ])
        
        # Write data rows
        for order in orders:
            writer.writerow([
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
                order.updated_at.isoformat() if order.updated_at else ""
            ])
        
        output.seek(0)
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="orders.csv"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
