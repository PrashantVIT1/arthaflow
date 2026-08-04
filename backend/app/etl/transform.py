"""Transform module for data transformations."""

import pandas as pd
from typing import Dict, Optional
from app.etl.config import ETLConfig


class Transformer:
    """Transform and enrich data."""

    def __init__(self, config: ETLConfig = None):
        """Initialize transformer with configuration."""
        self.config = config or ETLConfig()

    def calculate_revenue(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate revenue for orders.

        Args:
            df: Orders DataFrame

        Returns:
            DataFrame with revenue calculated
        """
        df_transformed = df.copy()

        if (
            "quantity" in df_transformed.columns
            and "unit_price" in df_transformed.columns
        ):
            df_transformed["total_amount"] = (
                df_transformed["quantity"] * df_transformed["unit_price"]
            )
            print("Calculated total_amount (revenue)")

        return df_transformed

    def calculate_profit(
        self, orders_df: pd.DataFrame, products_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate profit for orders by merging with products.

        Args:
            orders_df: Orders DataFrame
            products_df: Products DataFrame

        Returns:
            Orders DataFrame with profit calculated
        """
        # Merge orders with products to get cost
        merged = orders_df.merge(
            products_df[["id", "cost"]],
            left_on="product_id",
            right_on="id",
            how="left",
            suffixes=("", "_product"),
        )

        # Calculate profit: (price - cost) * quantity
        if "cost" in merged.columns:
            merged["profit"] = (merged["unit_price"] - merged["cost"]) * merged[
                "quantity"
            ]
            print("Calculated profit for orders")

        # Remove the duplicate id column from products
        if "id_product" in merged.columns:
            merged = merged.drop(columns=["id_product"])

        return merged

    def merge_datasets(self, data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Merge orders with customers and products.

        Args:
            data: Dictionary with orders, customers, and products DataFrames

        Returns:
            Merged DataFrame with all related data
        """
        orders = data["orders"].copy()
        customers = data["customers"].copy()
        products = data["products"].copy()

        print("\nMerging datasets...")

        # Merge orders with customers
        merged = orders.merge(
            customers[["id", "name", "email", "city", "country"]],
            left_on="customer_id",
            right_on="id",
            how="left",
            suffixes=("", "_customer"),
        )
        print("Merged orders with customers")

        # Merge with products
        merged = merged.merge(
            products[["id", "name", "category", "price", "cost"]],
            left_on="product_id",
            right_on="id",
            how="left",
            suffixes=("", "_product"),
        )
        print("Merged with products")

        # Rename columns for clarity
        column_mapping = {
            "name_customer": "customer_name",
            "name_product": "product_name",
            "price": "product_price",
        }
        merged = merged.rename(columns=column_mapping)

        # Remove duplicate id columns
        for col in ["id_customer", "id_product"]:
            if col in merged.columns:
                merged = merged.drop(columns=[col])

        return merged

    def add_derived_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add derived columns for analytics.

        Args:
            df: Merged DataFrame

        Returns:
            DataFrame with derived columns
        """
        df_transformed = df.copy()

        # Add order year and month for time-based analytics
        if "order_date" in df_transformed.columns:
            df_transformed["order_year"] = df_transformed["order_date"].dt.year
            df_transformed["order_month"] = df_transformed["order_date"].dt.month
            df_transformed["order_month_name"] = df_transformed[
                "order_date"
            ].dt.strftime("%B")
            print("Added order_year, order_month, order_month_name")

        # Add profit margin percentage
        if (
            "profit" in df_transformed.columns
            and "total_amount" in df_transformed.columns
        ):
            df_transformed["profit_margin"] = (
                (df_transformed["profit"] / df_transformed["total_amount"]) * 100
            ).round(2)
            print("Added profit_margin")

        return df_transformed

    def transform_orders(
        self, orders_df: pd.DataFrame, products_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Transform orders data with calculations.

        Args:
            orders_df: Orders DataFrame
            products_df: Products DataFrame

        Returns:
            Transformed orders DataFrame
        """
        print("\nTransforming orders...")

        # Calculate revenue
        orders_transformed = self.calculate_revenue(orders_df)

        # Calculate profit
        orders_transformed = self.calculate_profit(orders_transformed, products_df)

        return orders_transformed

    def transform_all(self, data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Transform all data sources.

        Args:
            data: Dictionary with orders, customers, and products DataFrames

        Returns:
            Dictionary with transformed DataFrames and merged dataset
        """
        transformed_data = {}

        # Transform orders with calculations
        transformed_data["orders"] = self.transform_orders(
            data["orders"], data["products"]
        )

        # Customers and products don't need transformation
        transformed_data["customers"] = data["customers"]
        transformed_data["products"] = data["products"]

        # Create merged dataset for analytics
        transformed_data["merged"] = self.merge_datasets(transformed_data)

        # Add derived columns to merged dataset
        transformed_data["merged"] = self.add_derived_columns(
            transformed_data["merged"]
        )

        return transformed_data
