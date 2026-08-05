"""API routes for ETL endpoints."""

import os
import uuid
from typing import List

from app.schemas.etl import (ArchiveModeVerifyRequest,
                             ArchiveModeVerifyResponse, ETLLogsResponse,
                             ETLRunRequest, ETLRunResponse, ETLState,
                             ETLStatus)
from app.services.etl import ETLService
from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Upload files for ETL processing.

    Args:
        files: List of files to upload (multipart/form-data)

    Returns:
        Success message with uploaded files
    """
    print("Upload endpoint entered")
    print(f"Received {len(files)} files")

    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"
    )
    os.makedirs(upload_dir, exist_ok=True)

    uploaded_files = []

    for file in files:
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)

        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        uploaded_files.append(
            {
                "originalName": file.filename,
                "savedAs": unique_filename,
                "size": len(content),
            }
        )

    print("Returning response")

    return {"success": True, "uploadedFiles": uploaded_files}


@router.post("/run", response_model=ETLRunResponse)
async def run_pipeline(request: ETLRunRequest):
    """
    Run ETL pipeline.

    Args:
        request: ETL run request with dataset source, import mode, and files

    Returns:
        ETLRunResponse with execution results
    """
    try:
        service = ETLService()
        return service.run_pipeline(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=ETLStatus)
async def get_etl_status():
    """
    Get current ETL pipeline status.

    Returns:
        ETLStatus with current pipeline status
    """
    try:
        service = ETLService()
        return service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs", response_model=ETLLogsResponse)
async def get_etl_logs():
    """
    Get ETL execution logs.

    Returns:
        ETLLogsResponse with execution logs
    """
    try:
        service = ETLService()
        return service.get_logs()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state", response_model=ETLState)
async def get_etl_state():
    """
    Get persistent ETL pipeline state.

    Returns:
        ETLState with current pipeline state including dataset source,
        import mode, uploaded files, and last execution details
    """
    try:
        service = ETLService()
        return service.get_state()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/archive-mode/verify", response_model=ArchiveModeVerifyResponse)
async def verify_archive_mode(request: ArchiveModeVerifyRequest):
    """
    Verify archive mode PIN.

    Args:
        request: Archive mode verification request with PIN

    Returns:
        ArchiveModeVerifyResponse with verification result
    """
    try:
        service = ETLService()
        return service.verify_archive_mode(request.pin)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
