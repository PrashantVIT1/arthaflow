"""Load module for loading data into PostgreSQL."""

from typing import Dict, Optional

import pandas as pd
from sqlalchemy import create_engine, text

from app.database.config import get_engine
from app.etl.config import ETLConfig


class Loader:
    """Load data into PostgreSQL database."""

    def __init__(self, config: ETLConfig = None):
        """Initialize loader with configuration."""
        self.config = config or ETLConfig()
        self.engine = get_engine()

    def load_dataframe(
        self,
        df: pd.DataFrame,
        table_name: str,
        if_exists: str = "append",
        index: bool = False,
    ) -> int:
        """
        Load DataFrame into PostgreSQL table.

        Args:
            df: DataFrame to load
            table_name: Target table name
            if_exists: How to behave if table exists ('fail', 'replace', 'append')
            index: Write DataFrame index as a column

        Returns:
            Number of rows loaded
        """
        try:
            rows_loaded = len(df)
            df.to_sql(
                table_name,
                self.engine,
                if_exists=if_exists,
                index=index,
                method="multi",
            )
            print(f"Loaded {rows_loaded} rows into {table_name}")
            return rows_loaded
        except Exception as e:
            print(f"Error loading data into {table_name}: {e}")
            raise

    def truncate_table(self, table_name: str) -> None:
        """
        Truncate table before loading.

        Args:
            table_name: Table name to truncate
        """
        try:
            with self.engine.connect() as conn:
                conn.execute(
                    text(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
                )
                conn.commit()
                print(f"Truncated table {table_name}")
        except Exception as e:
            print(f"Error truncating table {table_name}: {e}")
            raise

    def load_orders(self, df: pd.DataFrame, truncate: bool = False) -> int:
        """
        Load orders data into database.

        Args:
            df: Orders DataFrame
            truncate: Whether to truncate table before loading

        Returns:
            Number of rows loaded
        """
        if truncate:
            self.truncate_table("orders")

        # Select only columns that exist in the database table
        columns_to_load = [
            "id",
            "order_number",
            "customer_id",
            "product_id",
            "quantity",
            "unit_price",
            "total_amount",
            "order_date",
            "status",
            "region",
        ]
        df_to_load = df[[col for col in columns_to_load if col in df.columns]]

        return self.load_dataframe(df_to_load, "orders", if_exists="append")

    def load_customers(self, df: pd.DataFrame, truncate: bool = False) -> int:
        """
        Load customers data into database.

        Args:
            df: Customers DataFrame
            truncate: Whether to truncate table before loading

        Returns:
            Number of rows loaded
        """
        if truncate:
            self.truncate_table("customers")

        # Select only columns that exist in the database table
        columns_to_load = ["id", "name", "email", "phone", "address", "city", "country"]
        df_to_load = df[[col for col in columns_to_load if col in df.columns]]

        return self.load_dataframe(df_to_load, "customers", if_exists="append")

    def load_products(self, df: pd.DataFrame, truncate: bool = False) -> int:
        """
        Load products data into database.

        Args:
            df: Products DataFrame
            truncate: Whether to truncate table before loading

        Returns:
            Number of rows loaded
        """
        if truncate:
            self.truncate_table("products")

        # Select only columns that exist in the database table
        columns_to_load = [
            "id",
            "name",
            "description",
            "category",
            "price",
            "cost",
            "stock_quantity",
        ]
        df_to_load = df[[col for col in columns_to_load if col in df.columns]]

        return self.load_dataframe(df_to_load, "products", if_exists="append")

    def load_all(
        self, data: Dict[str, pd.DataFrame], truncate: bool = False
    ) -> Dict[str, int]:
        """
        Load all data sources into database.

        Args:
            data: Dictionary with orders, customers, and products DataFrames
            truncate: Whether to truncate tables before loading

        Returns:
            Dictionary with row counts loaded for each table
        """
        results = {}

        print("\nLoading data into database...")

        # Load in order to respect foreign key constraints
        # First truncate if needed (all tables to maintain referential integrity)
        if truncate:
            print("Truncating tables...")
            self.truncate_table("orders")
            self.truncate_table("customers")
            self.truncate_table("products")

        # Load customers first (no foreign keys)
        if "customers" in data:
            try:
                results["customers"] = self.load_customers(
                    data["customers"], truncate=False
                )
            except Exception as e:
                print(f"Error loading customers: {e}")
                results["customers"] = 0

        # Load products second (no foreign keys)
        if "products" in data:
            try:
                results["products"] = self.load_products(
                    data["products"], truncate=False
                )
            except Exception as e:
                print(f"Error loading products: {e}")
                results["products"] = 0

        # Load orders last (depends on customers and products)
        if "orders" in data:
            try:
                results["orders"] = self.load_orders(data["orders"], truncate=False)
            except Exception as e:
                print(f"Error loading orders: {e}")
                results["orders"] = 0

        print("\nLoad complete!")
        return results
