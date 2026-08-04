"""API routes for data pipeline endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from app.services.pipeline import PipelineService
from app.schemas.pipeline import SampleDatasetMetadata

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/sample-dataset", response_model=SampleDatasetMetadata)
def get_sample_dataset_metadata():
    """
    Get metadata for sample dataset.

    Returns:
        SampleDatasetMetadata with dataset information including name, customers, products, and orders count
    """
    try:
        service = PipelineService()
        return service.get_sample_dataset_metadata()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
