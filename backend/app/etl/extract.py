"""Extract module for reading CSV files."""

from pathlib import Path
from typing import Dict

import pandas as pd

from app.etl.config import ETLConfig


class Extractor:
    """Extract data from CSV files."""

    def __init__(self, config: ETLConfig = None):
        """Initialize extractor with configuration."""
        self.config = config or ETLConfig()

    def read_csv(
        self, file_path: Path, dtype: Dict[str, str] = None
    ) -> pd.DataFrame:
        """
        Read CSV file into DataFrame.

        Args:
            file_path: Path to CSV file
            dtype: Dictionary of column names to data types

        Returns:
            DataFrame with CSV data
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        df = pd.read_csv(file_path, dtype=dtype, on_bad_lines="warn")
        print(f"Extracted {len(df)} rows from {file_path.name}")
        return df

    def extract_orders(self) -> pd.DataFrame:
        """Extract orders data from CSV."""
        dtype = self.config.DTYPES.get("orders", {})
        return self.read_csv(self.config.ORDERS_CSV, dtype)

    def extract_customers(self) -> pd.DataFrame:
        """Extract customers data from CSV."""
        dtype = self.config.DTYPES.get("customers", {})
        return self.read_csv(self.config.CUSTOMERS_CSV, dtype)

    def extract_products(self) -> pd.DataFrame:
        """Extract products data from CSV."""
        dtype = self.config.DTYPES.get("products", {})
        return self.read_csv(self.config.PRODUCTS_CSV, dtype)

    def extract_all(self) -> Dict[str, pd.DataFrame]:
        """
        Extract all data sources.

        Returns:
            Dictionary with DataFrames for each data source
        """
        return {
            "orders": self.extract_orders(),
            "customers": self.extract_customers(),
            "products": self.extract_products(),
        }
