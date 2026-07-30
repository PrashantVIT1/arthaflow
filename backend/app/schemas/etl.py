"""Schemas for ETL operations."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ETLRunRequest(BaseModel):
    """Request for running ETL pipeline."""
    dataset_source: str  # 'sample' or 'custom'
    import_mode: str  # 'append', 'replace', or 'clear'
    files: Optional[List[dict]] = None  # List of {saved_as: str, original_name: str} for custom source


class ETLRunResponse(BaseModel):
    """Response for ETL pipeline execution."""
    success: bool
    message: str
    mode: str
    operation: Optional[str] = None
    execution_time: Optional[float] = None  # in seconds
    customers_inserted: int = 0
    customers_skipped: int = 0
    products_inserted: int = 0
    products_skipped: int = 0
    orders_inserted: int = 0
    orders_skipped: int = 0
    total_records_processed: int = 0


class ETLStatus(BaseModel):
    """ETL pipeline status."""
    status: str  # 'idle', 'running', 'completed', 'error'
    current_stage: Optional[str] = None
    progress: Optional[float] = None  # 0.0 to 1.0
    records_processed: Optional[int] = None
    total_records: Optional[int] = None
    error_message: Optional[str] = None


class ETLLogEntry(BaseModel):
    """ETL log entry."""
    timestamp: datetime
    level: str  # 'info', 'warning', 'error'
    message: str
    stage: Optional[str] = None


class ETLLogsResponse(BaseModel):
    """Response for ETL logs."""
    logs: List[ETLLogEntry]


class ETLState(BaseModel):
    """Persistent ETL pipeline state."""
    dataset_source: str  # 'sample' or 'custom'
    import_mode: str  # 'append', 'replace', or 'clear'
    uploaded_files: Optional[List[str]] = None  # List of uploaded filenames
    upload_timestamp: Optional[datetime] = None
    pipeline_status: str  # 'idle', 'running', 'completed', 'error'
    last_execution: Optional[dict] = None  # Last execution details
    last_successful_import_timestamp: Optional[datetime] = None

