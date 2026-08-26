"""API routes for data pipeline endpoints."""

import io
from pathlib import Path
from typing import Literal

import pandas as pd
from app.schemas.pipeline import SampleDatasetMetadata
from app.services.pipeline import PipelineService
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/sample-dataset", response_model=SampleDatasetMetadata)
def get_sample_dataset_metadata():
    """
    Get metadata for sample dataset.

    Returns:
        SampleDatasetMetadata with dataset information including name,
        customers, products, and orders count
    """
    try:
        service = PipelineService()
        return service.get_sample_dataset_metadata()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/sample-data/{table_name}/{format}")
def download_sample_data(
    table_name: Literal["customers", "products", "orders"],
    format: Literal["csv", "json"],
):
    """
    Download sample data for a specific table in the specified format.

    Args:
        table_name: One of 'customers', 'products', or 'orders'
        format: Either 'csv' or 'json'

    Returns:
        StreamingResponse with the file data and appropriate headers
    """
    try:
        # Get the data directory path
        data_dir = Path(__file__).resolve().parents[2] / "data"

        # Map table names to file names
        file_map = {
            "customers": "customers.csv",
            "products": "products.csv",
            "orders": "orders.csv",
        }

        csv_file = data_dir / file_map[table_name]

        if not csv_file.exists():
            raise HTTPException(
                status_code=404, detail=f"Sample data file not found: {csv_file}"
            )

        # Read the CSV file
        df = pd.read_csv(csv_file)

        # Convert to requested format
        if format == "csv":
            output = io.StringIO()
            df.to_csv(output, index=False)
            output.seek(0)
            media_type = "text/csv"
            filename = f"sample_{table_name}.csv"
        elif format == "json":
            output = io.StringIO()
            df.to_json(output, orient="records", indent=2)
            output.seek(0)
            media_type = "application/json"
            filename = f"sample_{table_name}.json"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

        # Return as streaming response with download headers
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
