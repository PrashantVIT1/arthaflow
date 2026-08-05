"""Validate module for data validation."""

from typing import Dict, List, Tuple

import pandas as pd

from app.etl.config import ETLConfig


class Validator:
    """Validate data quality and structure."""

    def __init__(self, config: ETLConfig = None):
        """Initialize validator with configuration."""
        self.config = config or ETLConfig()
        self.validation_errors = []

    def check_required_columns(self, df: pd.DataFrame, table_name: str) -> bool:
        """
        Check if DataFrame has all required columns.

        Args:
            df: DataFrame to validate
            table_name: Name of the table for required columns lookup

        Returns:
            True if all required columns present, False otherwise
        """
        required = self.config.REQUIRED_COLUMNS.get(table_name, [])
        missing = [col for col in required if col not in df.columns]

        if missing:
            self.validation_errors.append(f"{table_name}: Missing required columns: {missing}")
            return False

        return True

    def check_data_types(self, df: pd.DataFrame, table_name: str) -> bool:
        """
        Check if DataFrame columns have correct data types.

        Args:
            df: DataFrame to validate
            table_name: Name of the table for dtype lookup

        Returns:
            True if data types are correct, False otherwise
        """
        expected_dtypes = self.config.DTYPES.get(table_name, {})
        type_errors = []

        for col, expected_type in expected_dtypes.items():
            if col in df.columns:
                actual_type = str(df[col].dtype)
                if expected_type not in actual_type:
                    type_errors.append(
                        f"{table_name}.{col}: Expected {expected_type}, " f"got {actual_type}"
                    )

        if type_errors:
            self.validation_errors.extend(type_errors)
            return False

        return True

    def check_null_values(self, df: pd.DataFrame, table_name: str) -> Dict[str, int]:
        """
        Check for null values in required columns.

        Args:
            df: DataFrame to validate
            table_name: Name of the table

        Returns:
            Dictionary with column names and null counts
        """
        required = self.config.REQUIRED_COLUMNS.get(table_name, [])
        null_counts = {}

        for col in required:
            if col in df.columns:
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    null_counts[col] = null_count
                    self.validation_errors.append(
                        f"{table_name}.{col}: {null_count} null values found"
                    )

        return null_counts

    def check_duplicates(self, df: pd.DataFrame, table_name: str, id_column: str = "id") -> int:
        """
        Check for duplicate rows based on ID column.

        Args:
            df: DataFrame to validate
            table_name: Name of the table
            id_column: Column to check for duplicates

        Returns:
            Number of duplicate rows
        """
        if id_column not in df.columns:
            return 0

        duplicate_count = df[id_column].duplicated().sum()

        if duplicate_count > 0:
            self.validation_errors.append(
                f"{table_name}: {duplicate_count} duplicate " f"{id_column} values found"
            )

        return duplicate_count

    def validate_dataframe(self, df: pd.DataFrame, table_name: str) -> Tuple[bool, List[str]]:
        """
        Run all validation checks on a DataFrame.

        Args:
            df: DataFrame to validate
            table_name: Name of the table

        Returns:
            Tuple of (is_valid, error_messages)
        """
        self.validation_errors = []

        # Run all checks
        self.check_required_columns(df, table_name)
        self.check_data_types(df, table_name)
        self.check_null_values(df, table_name)
        self.check_duplicates(df, table_name)

        is_valid = len(self.validation_errors) == 0
        return is_valid, self.validation_errors

    def validate_all(self, data: Dict[str, pd.DataFrame]) -> Dict[str, Tuple[bool, List[str]]]:
        """
        Validate all DataFrames.

        Args:
            data: Dictionary of table names to DataFrames

        Returns:
            Dictionary with validation results for each table
        """
        results = {}

        for table_name, df in data.items():
            results[table_name] = self.validate_dataframe(df, table_name)

        return results
