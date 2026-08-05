"""API routes for analytics endpoints."""

import csv
import io
from typing import List, Optional

from app.database.config import get_db
from app.schemas.analytics import (
    CategorySales,
    DashboardResponse,
    MonthlySales,
    RegionalSales,
    TopProduct,
)
from app.services.analytics import AnalyticsService
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    db: Session = Depends(get_db),
):
    """
    Get complete dashboard data with KPIs and trends.

    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        category: Optional category filter
        region: Optional region filter

    Returns:
        DashboardResponse with KPIs, monthly sales, category sales,
        regional sales, and top products
    """
    try:
        service = AnalyticsService(db)
        return service.get_dashboard(
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/monthly", response_model=List[MonthlySales])
def get_monthly_sales(
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    db: Session = Depends(get_db),
):
    """
    Get monthly sales data.

    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        category: Optional category filter
        region: Optional region filter

    Returns:
        List of monthly sales records with year, month, revenue,
        orders, and profit
    """
    try:
        service = AnalyticsService(db)
        return service.get_monthly_sales(
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/category", response_model=List[CategorySales])
def get_category_sales(
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    region: Optional[str] = Query(None, description="Region filter"),
    db: Session = Depends(get_db),
):
    """
    Get sales by category.

    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        region: Optional region filter

    Returns:
        List of category sales records with category, revenue,
        orders, and profit
    """
    try:
        service = AnalyticsService(db)
        return service.get_category_sales(
            start_date=start_date,
            end_date=end_date,
            region=region,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sales/region", response_model=List[RegionalSales])
def get_regional_sales(
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    category: Optional[str] = Query(None, description="Category filter"),
    db: Session = Depends(get_db),
):
    """
    Get sales by region.

    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        category: Optional category filter

    Returns:
        List of regional sales records with region, revenue, orders, and profit
    """
    try:
        service = AnalyticsService(db)
        return service.get_regional_sales(
            start_date=start_date,
            end_date=end_date,
            category=category,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/top", response_model=List[TopProduct])
def get_top_products(
    limit: int = 10,
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    db: Session = Depends(get_db),
):
    """
    Get top selling products.

    Args:
        limit: Number of products to return (default: 10)
        start_date: Optional start date filter
        end_date: Optional end date filter
        category: Optional category filter
        region: Optional region filter

    Returns:
        List of top product records with product details,
        quantity sold, revenue, and profit
    """
    try:
        service = AnalyticsService(db)
        return service.get_top_products(
            limit=limit,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/dashboard")
def export_dashboard_csv(
    start_date: Optional[str] = Query(
        None,
        description="Start date filter (YYYY-MM-DD)",
    ),
    end_date: Optional[str] = Query(
        None,
        description="End date filter (YYYY-MM-DD)",
    ),
    category: Optional[str] = Query(None, description="Category filter"),
    region: Optional[str] = Query(None, description="Region filter"),
    db: Session = Depends(get_db),
):
    """
    Export dashboard data as.

    Args:
        start_date: Optional start date filter
        end_date: Optional end date filter
        category: Optional category filter
        region: Optional region filter

    Returns:
        CSV file with dashboard summary data
    """
    try:
        service = AnalyticsService(db)
        dashboard_data = service.get_dashboard(
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
        )

        output = io.StringIO()
        writer = csv.writer(output)

        # Write KPIs
        writer.writerow(["Dashboard Summary"])
        writer.writerow([])
        writer.writerow(["Metric", "Value"])
        writer.writerow(
            ["Total Revenue", dashboard_data.kpis.total_revenue]
        )
        writer.writerow(["Total Orders", dashboard_data.kpis.total_orders])
        writer.writerow(
            ["Total Customers", dashboard_data.kpis.total_customers]
        )
        writer.writerow(["Total Profit", dashboard_data.kpis.total_profit])
        writer.writerow([])

        # Write Monthly Sales
        writer.writerow(["Monthly Sales"])
        writer.writerow([])
        writer.writerow(["Month", "Year", "Revenue", "Orders", "Profit"])
        for item in dashboard_data.monthly_sales:
            writer.writerow(
                [
                    item.month_name,
                    item.year,
                    item.revenue,
                    item.orders,
                    item.profit,
                ]
            )
        writer.writerow([])

        # Write Category Sales
        writer.writerow(["Category Sales"])
        writer.writerow([])
        writer.writerow(["Category", "Revenue", "Orders", "Profit"])
        for item in dashboard_data.category_sales:
            writer.writerow(
                [item.category, item.revenue, item.orders, item.profit]
            )
        writer.writerow([])

        # Write Regional Sales
        writer.writerow(["Regional Sales"])
        writer.writerow([])
        writer.writerow(["Region", "Revenue", "Orders", "Profit"])
        for item in dashboard_data.regional_sales:
            writer.writerow(
                [item.region, item.revenue, item.orders, item.profit]
            )
        writer.writerow([])

        # Write Top Products
        writer.writerow(["Top Products"])
        writer.writerow([])
        writer.writerow(
            [
                "Product ID",
                "Product Name",
                "Category",
                "Quantity Sold",
                "Revenue",
                "Profit",
            ]
        )
        for item in dashboard_data.top_products:
            writer.writerow(
                [
                    item.product_id,
                    item.product_name,
                    item.category,
                    item.quantity_sold,
                    item.revenue,
                    item.profit,
                ]
            )

        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={
                "Content-Disposition": (
                    'attachment; filename="dashboard_summary.csv"'
                )
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
