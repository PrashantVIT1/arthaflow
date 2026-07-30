"""Pydantic schemas for analytics DTOs."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardKPI(BaseModel):
    """Key Performance Indicators for dashboard."""
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    total_profit: float
    profit_margin: float


class MonthlySales(BaseModel):
    """Monthly sales data."""
    year: int
    month: int
    month_name: str
    revenue: float
    orders: int
    profit: float


class CategorySales(BaseModel):
    """Sales by category."""
    category: str
    revenue: float
    orders: int
    profit: float


class RegionalSales(BaseModel):
    """Sales by region."""
    region: str
    revenue: float
    orders: int
    profit: float


class TopProduct(BaseModel):
    """Top selling product."""
    product_id: int
    product_name: str
    category: str
    quantity_sold: int
    revenue: float
    profit: float


class DashboardResponse(BaseModel):
    """Dashboard response with KPIs and trends."""
    kpis: DashboardKPI
    monthly_sales: List[MonthlySales]
    category_sales: List[CategorySales]
    regional_sales: List[RegionalSales]
    top_products: List[TopProduct]
