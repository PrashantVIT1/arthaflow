"""Service layer for analytics business logic."""
from sqlalchemy.orm import Session
from typing import List
from app.repositories.analytics import AnalyticsRepository
from app.schemas.analytics import (
    DashboardKPI,
    MonthlySales,
    CategorySales,
    RegionalSales,
    TopProduct,
    DashboardResponse
)


class AnalyticsService:
    """Service for analytics business logic."""
    
    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.repository = AnalyticsRepository(db)
    
    def get_dashboard(self, start_date: str = None, end_date: str = None, category: str = None, region: str = None) -> DashboardResponse:
        """
        Get complete dashboard data.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter
            region: Optional region filter
            
        Returns:
            DashboardResponse with KPIs and trends
        """
        kpis_data = self.repository.get_dashboard_kpis(start_date=start_date, end_date=end_date, category=category, region=region)
        monthly_sales_data = self.repository.get_monthly_sales(start_date=start_date, end_date=end_date, category=category, region=region)
        category_sales_data = self.repository.get_category_sales(start_date=start_date, end_date=end_date, region=region)
        regional_sales_data = self.repository.get_regional_sales(start_date=start_date, end_date=end_date, category=category)
        top_products_data = self.repository.get_top_products(limit=10, start_date=start_date, end_date=end_date, category=category, region=region)
        
        return DashboardResponse(
            kpis=DashboardKPI(**kpis_data),
            monthly_sales=[MonthlySales(**data) for data in monthly_sales_data],
            category_sales=[CategorySales(**data) for data in category_sales_data],
            regional_sales=[RegionalSales(**data) for data in regional_sales_data],
            top_products=[TopProduct(**data) for data in top_products_data]
        )
    
    def get_monthly_sales(self, start_date: str = None, end_date: str = None, category: str = None, region: str = None) -> List[MonthlySales]:
        """
        Get monthly sales data.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter
            region: Optional region filter
            
        Returns:
            List of monthly sales records
        """
        data = self.repository.get_monthly_sales(start_date=start_date, end_date=end_date, category=category, region=region)
        return [MonthlySales(**item) for item in data]
    
    def get_category_sales(self, start_date: str = None, end_date: str = None, region: str = None) -> List[CategorySales]:
        """
        Get sales by category.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            region: Optional region filter
            
        Returns:
            List of category sales records
        """
        data = self.repository.get_category_sales(start_date=start_date, end_date=end_date, region=region)
        return [CategorySales(**item) for item in data]
    
    def get_regional_sales(self, start_date: str = None, end_date: str = None, category: str = None) -> List[RegionalSales]:
        """
        Get sales by region.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter
            
        Returns:
            List of regional sales records
        """
        data = self.repository.get_regional_sales(start_date=start_date, end_date=end_date, category=category)
        return [RegionalSales(**item) for item in data]
    
    def get_top_products(self, limit: int = 10, start_date: str = None, end_date: str = None, category: str = None, region: str = None) -> List[TopProduct]:
        """
        Get top selling products.
        
        Args:
            limit: Number of products to return
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter
            region: Optional region filter
            
        Returns:
            List of top product records
        """
        data = self.repository.get_top_products(limit=limit, start_date=start_date, end_date=end_date, category=category, region=region)
        return [TopProduct(**item) for item in data]
