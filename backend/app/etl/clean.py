"""Clean module for data cleaning."""

from typing import Dict, Optional

import pandas as pd
from app.etl.config import ETLConfig


class Cleaner:
    """Clean and preprocess data."""

    def __init__(self, config: ETLConfig = None):
        """Initialize cleaner with configuration."""
        self.config = config or ETLConfig()

    def remove_duplicates(
        self, df: pd.DataFrame, subset: Optional[list] = None
    ) -> pd.DataFrame:
        """
        Remove duplicate rows from DataFrame.

        Args:
            df: DataFrame to clean
            subset: Columns to consider for duplicates (default: all columns)

        Returns:
            DataFrame with duplicates removed
        """
        initial_count = len(df)
        df_cleaned = df.drop_duplicates(subset=subset)
        removed = initial_count - len(df_cleaned)

        if removed > 0:
            print(f"Removed {removed} duplicate rows")

        return df_cleaned

    def handle_null_values(
        self, df: pd.DataFrame, table_name: str
    ) -> pd.DataFrame:
        """
        Handle null values in DataFrame.

        Args:
            df: DataFrame to clean
            table_name: Name of the table for column-specific handling

        Returns:
            DataFrame with null values handled
        """
        df_cleaned = df.copy()

        # Drop rows with null values in required columns
        required = self.config.REQUIRED_COLUMNS.get(table_name, [])
        for col in required:
            if col in df_cleaned.columns:
                null_count = df_cleaned[col].isnull().sum()
                if null_count > 0:
                    df_cleaned = df_cleaned.dropna(subset=[col])
                    print(
                        f"Dropped {null_count} rows with null values in {col}"
                    )

        # Fill null values in optional columns with defaults
        if table_name == "orders":
            if "status" in df_cleaned.columns:
                df_cleaned["status"] = df_cleaned["status"].fillna("completed")
            if "region" in df_cleaned.columns:
                df_cleaned["region"] = df_cleaned["region"].fillna("Unknown")

        elif table_name == "customers":
            if "phone" in df_cleaned.columns:
                df_cleaned["phone"] = df_cleaned["phone"].fillna("")
            if "address" in df_cleaned.columns:
                df_cleaned["address"] = df_cleaned["address"].fillna("")
            if "city" in df_cleaned.columns:
                df_cleaned["city"] = df_cleaned["city"].fillna("")
            if "country" in df_cleaned.columns:
                df_cleaned["country"] = df_cleaned["country"].fillna("")

        elif table_name == "products":
            if "description" in df_cleaned.columns:
                df_cleaned["description"] = (
                    df_cleaned["description"].fillna("")
                )
            if "cost" in df_cleaned.columns:
                df_cleaned["cost"] = df_cleaned["cost"].fillna(0.0)
            if "stock_quantity" in df_cleaned.columns:
                df_cleaned["stock_quantity"] = (
                    df_cleaned["stock_quantity"].fillna(0)
                )

        return df_cleaned

    def convert_dates(self, df: pd.DataFrame, table_name: str) -> pd.DataFrame:
        """
        Convert date columns to datetime format.

        Args:
            df: DataFrame to clean
            table_name: Name of the table for date column lookup

        Returns:
            DataFrame with dates converted
        """
        df_cleaned = df.copy()
        date_columns = self.config.DATE_COLUMNS.get(table_name, [])

        for col in date_columns:
            if col in df_cleaned.columns:
                df_cleaned[col] = pd.to_datetime(
                    df_cleaned[col], errors="coerce"
                )
                print(f"Converted {col} to datetime")

        return df_cleaned

    def clean_dataframe(
        self, df: pd.DataFrame, table_name: str
    ) -> pd.DataFrame:
        """
        Apply all cleaning operations to a DataFrame.

        Args:
            df: DataFrame to clean
            table_name: Name of the table

        Returns:
            Cleaned DataFrame
        """
        print(f"\nCleaning {table_name}...")
        initial_count = len(df)

        # Remove duplicates
        df_cleaned = self.remove_duplicates(df, subset=["id"])

        # Handle null values
        df_cleaned = self.handle_null_values(df_cleaned, table_name)

        # Convert dates
        df_cleaned = self.convert_dates(df_cleaned, table_name)

        final_count = len(df_cleaned)
        print(f"Cleaned {table_name}: {initial_count} -> {final_count} rows")

        return df_cleaned

    def clean_all(
        self, data: Dict[str, pd.DataFrame]
    ) -> Dict[str, pd.DataFrame]:
        """
        Clean all DataFrames.

        Args:
            data: Dictionary of table names to DataFrames

        Returns:
            Dictionary with cleaned DataFrames
        """
        cleaned_data = {}

        for table_name, df in data.items():
            cleaned_data[table_name] = self.clean_dataframe(df, table_name)

        return cleaned_data
