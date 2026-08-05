"""Repository layer for analytics queries."""

from typing import Any, Dict, List

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models import Order, Product


class AnalyticsRepository:
    """Repository for analytics data access."""

    def __init__(self, db: Session):
        """Initialize repository with database session."""
        self.db = db

    def get_dashboard_kpis(
        self,
        start_date: str = None,
        end_date: str = None,
        category: str = None,
        region: str = None,
    ) -> Dict[str, Any]:
        """
        Get key performance indicators for dashboard.

        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter
            region: Optional region filter

        Returns:
            Dictionary with KPIs
        """
        query = self.db.query(Order)

        # Apply date filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)

        # Apply category filter
        if category:
            query = query.join(Product, Order.product_id == Product.id).filter(
                Product.category == category
            )

        # Apply region filter
        if region:
            query = query.filter(Order.region == region)

        # Total revenue
        total_revenue = query.with_entities(func.sum(Order.total_amount)).scalar() or 0

        # Total orders
        total_orders = query.with_entities(func.count(Order.id)).scalar() or 0

        # Total customers (unique customers from filtered orders)
        total_customers = (
            query.with_entities(func.count(func.distinct(Order.customer_id))).scalar()
            or 0
        )

        # Total products (unique products from filtered orders)
        total_products = (
            query.with_entities(func.count(func.distinct(Order.product_id))).scalar()
            or 0
        )

        # Calculate profit (need to join with products)
        profit_query = self.db.query(
            func.sum(
                (Order.unit_price - func.coalesce(Product.cost, 0)) * Order.quantity
            )
        ).join(Product, Order.product_id == Product.id)

        if start_date:
            profit_query = profit_query.filter(Order.order_date >= start_date)
        if end_date:
            profit_query = profit_query.filter(Order.order_date <= end_date)
        if category:
            profit_query = profit_query.filter(Product.category == category)
        if region:
            profit_query = profit_query.filter(Order.region == region)

        total_profit = profit_query.scalar() or 0

        # Profit margin
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_products": total_products,
            "total_profit": float(total_profit),
            "profit_margin": round(profit_margin, 2),
        }

    def get_monthly_sales(
        self,
        start_date: str = None,
        end_date: str = None,
        category: str = None,
        region: str = None,
    ) -> List[Dict[str, Any]]:
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
        query = self.db.query(
            extract("year", Order.order_date).label("year"),
            extract("month", Order.order_date).label("month"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
            func.sum(
                (Order.unit_price - func.coalesce(Product.cost, 0)) * Order.quantity
            ).label("profit"),
        ).join(Product, Order.product_id == Product.id)

        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if category:
            query = query.filter(Product.category == category)
        if region:
            query = query.filter(Order.region == region)

        query = query.group_by(
            extract("year", Order.order_date), extract("month", Order.order_date)
        ).order_by(
            extract("year", Order.order_date), extract("month", Order.order_date)
        )

        results = query.all()

        month_names = {
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December",
        }

        return [
            {
                "year": int(r.year),
                "month": int(r.month),
                "month_name": month_names.get(int(r.month), ""),
                "revenue": float(r.revenue or 0),
                "orders": r.orders,
                "profit": float(r.profit or 0),
            }
            for r in results
        ]

    def get_category_sales(
        self, start_date: str = None, end_date: str = None, region: str = None
    ) -> List[Dict[str, Any]]:
        """
        Get sales by category.

        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            region: Optional region filter

        Returns:
            List of category sales records
        """
        query = self.db.query(
            Product.category,
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
            func.sum(
                (Order.unit_price - func.coalesce(Product.cost, 0)) * Order.quantity
            ).label("profit"),
        ).join(Product, Order.product_id == Product.id)

        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if region:
            query = query.filter(Order.region == region)

        query = query.group_by(Product.category).order_by(
            func.sum(Order.total_amount).desc()
        )

        results = query.all()

        return [
            {
                "category": r.category,
                "revenue": float(r.revenue or 0),
                "orders": r.orders,
                "profit": float(r.profit or 0),
            }
            for r in results
        ]

    def get_regional_sales(
        self, start_date: str = None, end_date: str = None, category: str = None
    ) -> List[Dict[str, Any]]:
        """
        Get sales by region.

        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            category: Optional category filter

        Returns:
            List of regional sales records
        """
        query = self.db.query(
            Order.region,
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
            func.sum(
                (Order.unit_price - func.coalesce(Product.cost, 0)) * Order.quantity
            ).label("profit"),
        ).join(Product, Order.product_id == Product.id)

        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if category:
            query = query.filter(Product.category == category)

        query = query.group_by(Order.region).order_by(
            func.sum(Order.total_amount).desc()
        )

        results = query.all()

        return [
            {
                "region": r.region,
                "revenue": float(r.revenue or 0),
                "orders": r.orders,
                "profit": float(r.profit or 0),
            }
            for r in results
        ]

    def get_top_products(
        self,
        limit: int = 10,
        start_date: str = None,
        end_date: str = None,
        category: str = None,
        region: str = None,
    ) -> List[Dict[str, Any]]:
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
        query = self.db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            Product.category,
            func.sum(Order.quantity).label("quantity_sold"),
            func.sum(Order.total_amount).label("revenue"),
            func.sum(
                (Order.unit_price - func.coalesce(Product.cost, 0)) * Order.quantity
            ).label("profit"),
        ).join(Order, Order.product_id == Product.id)

        # Apply filters
        if start_date:
            query = query.filter(Order.order_date >= start_date)
        if end_date:
            query = query.filter(Order.order_date <= end_date)
        if category:
            query = query.filter(Product.category == category)
        if region:
            query = query.filter(Order.region == region)

        query = (
            query.group_by(Product.id, Product.name, Product.category)
            .order_by(func.sum(Order.quantity).desc())
            .limit(limit)
        )

        results = query.all()

        return [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "category": r.category,
                "quantity_sold": r.quantity_sold,
                "revenue": float(r.revenue or 0),
                "profit": float(r.profit or 0),
            }
            for r in results
        ]
