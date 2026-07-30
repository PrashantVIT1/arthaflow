"""ETL configuration module."""
import os
from pathlib import Path
from typing import Dict, Any


class ETLConfig:
    """Configuration for ETL pipeline."""
    
    # Input file paths
    DATA_DIR = Path(__file__).resolve().parents[2] / "data"
    ORDERS_CSV = DATA_DIR / "orders.csv"
    CUSTOMERS_CSV = DATA_DIR / "customers.csv"
    PRODUCTS_CSV = DATA_DIR / "products.csv"
    
    # Database configuration
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Validation rules
    REQUIRED_COLUMNS = {
        "orders": ["id", "order_number", "customer_id", "product_id", "quantity", "unit_price"],
        "customers": ["id", "name", "email"],
        "products": ["id", "name", "category", "price"]
    }
    
    # Data type mappings
    DTYPES = {
        "orders": {
            "id": "int64",
            "customer_id": "int64",
            "product_id": "int64",
            "quantity": "int64",
            "unit_price": "float64",
            "total_amount": "float64"
        },
        "customers": {
            "id": "int64"
        },
        "products": {
            "id": "int64",
            "price": "float64",
            "cost": "float64",
            "stock_quantity": "int64"
        }
    }
    
    # Date columns
    DATE_COLUMNS = {
        "orders": ["order_date", "created_at", "updated_at"],
        "customers": ["created_at", "updated_at"],
        "products": ["created_at", "updated_at"]
    }
    
    # Column mappings for database
    COLUMN_MAPPINGS = {
        "orders": {},
        "customers": {},
        "products": {}
    }
