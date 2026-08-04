"""Schemas for data pipeline operations."""

from pydantic import BaseModel
from typing import Optional


class SampleDatasetMetadata(BaseModel):
    """Metadata for sample dataset."""

    name: str
    customers: int
    products: int
    orders: int
    description: Optional[str] = None


class PipelineStatus(BaseModel):
    """Status of pipeline execution."""

    status: str
    message: str
    progress: Optional[float] = None
