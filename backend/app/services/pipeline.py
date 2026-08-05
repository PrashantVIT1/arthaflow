"""Service layer for data pipeline operations."""

import os

from app.schemas.pipeline import SampleDatasetMetadata


class PipelineService:
    """Service for data pipeline business logic."""

    def __init__(self):
        """Initialize pipeline service."""
        self.data_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data"
        )

    def get_sample_dataset_metadata(self) -> SampleDatasetMetadata:
        """
        Get metadata for sample dataset.

        Returns:
            SampleDatasetMetadata with dataset information
        """
        customers_file = os.path.join(self.data_dir, "customers.csv")
        products_file = os.path.join(self.data_dir, "products.csv")
        orders_file = os.path.join(self.data_dir, "orders.csv")

        # Count rows in CSV files (excluding header)
        customers_count = (
            self._count_csv_rows(customers_file)
            if os.path.exists(customers_file)
            else 0
        )
        products_count = (
            self._count_csv_rows(products_file)
            if os.path.exists(products_file)
            else 0
        )
        orders_count = (
            self._count_csv_rows(orders_file)
            if os.path.exists(orders_file)
            else 0
        )

        return SampleDatasetMetadata(
            name="ArthaFlow Sample Dataset",
            customers=customers_count,
            products=products_count,
            orders=orders_count,
            description=(
                "Sample dataset containing customer, product, "
                "and order data for analytics demonstration"
            ),
        )

    def _count_csv_rows(self, file_path: str) -> int:
        """
        Count rows in a CSV file (excluding header).

        Args:
            file_path: Path to CSV file

        Returns:
            Number of data rows
        """
        try:
            with open(file_path, "r") as f:
                return sum(1 for _ in f) - 1  # Subtract header row
        except Exception:
            return 0
