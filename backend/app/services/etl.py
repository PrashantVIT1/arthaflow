"""Service layer for ETL operations."""

import os
import time
from datetime import datetime
from typing import List

import pandas as pd
from sqlalchemy import text

from app.database.config import get_engine
from app.schemas.etl import (
    ArchiveModeVerifyResponse,
    ETLLogEntry,
    ETLLogsResponse,
    ETLRunRequest,
    ETLRunResponse,
    ETLState,
    ETLStatus,
)

# Global state for ETL status and logs (in-memory for simplicity)
etl_status = {
    "status": "idle",
    "current_stage": None,
    "progress": 0.0,
    "records_processed": 0,
    "total_records": 0,
    "error_message": None,
}

etl_logs: List[ETLLogEntry] = []

# Global persistent ETL state
etl_state = {
    "dataset_source": "sample",
    "import_mode": "append",
    "uploaded_files": None,
    "upload_timestamp": None,
    "pipeline_status": "idle",
    "last_execution": None,
    "last_successful_import_timestamp": None,
}

# In-memory archive mode flag (session-based)
archive_mode_enabled = False


class ETLService:
    """Service for ETL business logic."""

    def __init__(self):
        """Initialize ETL service."""
        self.data_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
        )
        self.upload_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "uploads",
        )

    def _add_log(self, level: str, message: str, stage: str = None) -> None:
        """Add a log entry."""
        global etl_logs
        log_entry = ETLLogEntry(timestamp=datetime.now(), level=level, message=message, stage=stage)
        etl_logs.append(log_entry)
        # Keep only last 100 logs
        if len(etl_logs) > 100:
            etl_logs = etl_logs[-100:]

    def _update_status(
        self,
        status: str,
        current_stage: str = None,
        progress: float = None,
        records_processed: int = None,
        total_records: int = None,
        error_message: str = None,
    ) -> None:
        """Update ETL status."""
        global etl_status, etl_state
        etl_status["status"] = status
        etl_state["pipeline_status"] = status
        if current_stage is not None:
            etl_status["current_stage"] = current_stage
        if progress is not None:
            etl_status["progress"] = progress
        if records_processed is not None:
            etl_status["records_processed"] = records_processed
        if total_records is not None:
            etl_status["total_records"] = total_records
        if error_message is not None:
            etl_status["error_message"] = error_message

    def _update_state(
        self,
        dataset_source: str = None,
        import_mode: str = None,
        uploaded_files: List[str] = None,
        upload_timestamp: datetime = None,
        last_execution: dict = None,
        last_successful_import_timestamp: datetime = None,
    ) -> None:
        """Update persistent ETL state."""
        global etl_state
        if dataset_source is not None:
            etl_state["dataset_source"] = dataset_source
        if import_mode is not None:
            etl_state["import_mode"] = import_mode
        if uploaded_files is not None:
            etl_state["uploaded_files"] = uploaded_files
        if upload_timestamp is not None:
            etl_state["upload_timestamp"] = upload_timestamp
        if last_execution is not None:
            etl_state["last_execution"] = last_execution
        if last_successful_import_timestamp is not None:
            etl_state["last_successful_import_timestamp"] = last_successful_import_timestamp

    def get_state(self) -> ETLState:
        """Get current persistent ETL state."""
        global etl_state
        return ETLState(
            dataset_source=etl_state["dataset_source"],
            import_mode=etl_state["import_mode"],
            uploaded_files=etl_state["uploaded_files"],
            upload_timestamp=etl_state["upload_timestamp"],
            pipeline_status=etl_state["pipeline_status"],
            last_execution=etl_state["last_execution"],
            last_successful_import_timestamp=etl_state["last_successful_import_timestamp"],
        )

    def get_status(self) -> ETLStatus:
        """Get current ETL status."""
        global etl_status
        return ETLStatus(**etl_status)

    def get_logs(self) -> ETLLogsResponse:
        """Get ETL logs."""
        global etl_logs
        return ETLLogsResponse(logs=etl_logs)

    def verify_archive_mode(self, pin: str) -> ArchiveModeVerifyResponse:
        """
        Verify archive mode PIN.

        Args:
            pin: PIN to verify

        Returns:
            ArchiveModeVerifyResponse with verification result
        """
        global archive_mode_enabled
        archive_pin = os.getenv("ARCHIVE_UPLOAD_PIN")

        if not archive_pin:
            return ArchiveModeVerifyResponse(
                success=False,
                archiveEnabled=False,
                message="Archive mode not configured on server",
            )

        if pin == archive_pin:
            archive_mode_enabled = True
            return ArchiveModeVerifyResponse(success=True, archiveEnabled=True)
        else:
            return ArchiveModeVerifyResponse(
                success=False, archiveEnabled=False, message="Invalid PIN"
            )

    def is_archive_mode_enabled(self) -> bool:
        """
        Check if archive mode is currently enabled.

        Returns:
            True if archive mode is enabled, False otherwise
        """
        global archive_mode_enabled
        return archive_mode_enabled

    def run_pipeline(self, request: ETLRunRequest) -> ETLRunResponse:
        """
        Run ETL pipeline based on dataset source and import mode.

        Args:
            request: ETL run request with dataset source, import mode,
                and files

        Returns:
            ETLRunResponse with execution results
        """
        global etl_logs
        etl_logs = []  # Clear logs for new run

        # Reset status to idle before starting
        self._update_status("idle")

        # Track execution time

        start_time = time.time()

        # Determine operation name
        operation_name = ""
        if request.import_mode == "clear":
            operation_name = "Clear Dataset"
        elif request.import_mode == "replace":
            dataset_type = "Sample" if request.dataset_source == "sample" else "Custom"
            operation_name = f"Replace {dataset_type} Dataset"
        elif request.import_mode == "append":
            dataset_type = "Sample" if request.dataset_source == "sample" else "Custom"
            operation_name = f"Append {dataset_type} Dataset"

        # Initialize response counters
        response = ETLRunResponse(
            success=False,
            message="",
            mode=request.import_mode,
            operation=operation_name,
            customers_inserted=0,
            customers_skipped=0,
            products_inserted=0,
            products_skipped=0,
            orders_inserted=0,
            orders_skipped=0,
            total_records_processed=0,
        )

        try:
            self._update_status("running", "Initializing", 0.0)
            self._add_log(
                "info",
                f"Starting ETL pipeline in {request.import_mode} mode",
                "initialization",
            )

            engine = get_engine()

            # Handle import modes
            if request.import_mode == "clear":
                self._update_status("running", "Clearing tables", 0.5)
                self._add_log("info", "Clearing all tables", "clear")
                self._clear_tables(engine)

                # Calculate execution time
                execution_time = time.time() - start_time
                response.execution_time = round(execution_time, 2)

                self._update_status("completed", "Completed", 1.0)
                self._add_log(
                    "info",
                    "Tables cleared successfully",
                    "completion",
                )
                response.success = True
                response.message = "All tables cleared successfully"

                # Update persistent state for clear
                self._update_state(
                    dataset_source=request.dataset_source,
                    import_mode=request.import_mode,
                    last_execution={
                        "operation": operation_name,
                        "execution_time": response.execution_time,
                        "customers_imported": 0,
                        "products_imported": 0,
                        "orders_imported": 0,
                        "records_skipped": 0,
                        "completed_at": (datetime.now().isoformat()),
                    },
                )

                return response

            # Sample dataset loading: always clear first, then import
            if request.dataset_source == "sample":
                try:
                    # Step 1: Clear existing data
                    self._update_status(
                        "running",
                        "Clearing existing data...",
                        0.1,
                    )
                    self._add_log(
                        "info",
                        "Clearing existing business data before sample import",
                        "clear",
                    )
                    self._clear_tables(engine)

                    # Step 2: Commit after clearing
                    self._add_log("info", "Committing cleared data", "clear")

                    # Step 3: Import sample dataset
                    self._update_status(
                        "running",
                        "Importing sample dataset...",
                        0.5,
                    )
                    self._add_log("info", "Loading sample dataset", "load")
                    self._load_sample_data(
                        engine,
                        response,
                        "replace",
                    )  # Use replace mode for sample

                    # Step 4: Commit after import
                    self._add_log(
                        "info",
                        "Committing sample dataset import",
                        "load",
                    )

                    # Calculate total and execution time
                    response.total_records_processed = (
                        response.customers_inserted
                        + response.products_inserted
                        + response.orders_inserted
                    )
                    execution_time = time.time() - start_time
                    response.execution_time = round(execution_time, 2)

                    self._update_status("completed", "Completed", 1.0)
                    self._add_log(
                        "info",
                        (
                            "Sample dataset loaded successfully. "
                            f"{response.total_records_processed} "
                            "records processed."
                        ),
                        "completion",
                    )

                    response.success = True
                    response.message = (
                        f"Sample dataset loaded successfully. "
                        f"Inserted: {response.customers_inserted} customers, "
                        f"{response.products_inserted} products, "
                        f"{response.orders_inserted} orders."
                    )

                    # Update persistent state
                    self._update_state(
                        dataset_source=request.dataset_source,
                        import_mode=request.import_mode,
                        last_execution={
                            "operation": operation_name,
                            "execution_time": response.execution_time,
                            "customers_imported": response.customers_inserted,
                            "products_imported": response.products_inserted,
                            "orders_imported": response.orders_inserted,
                            "records_skipped": (
                                response.customers_skipped
                                + response.products_skipped
                                + response.orders_skipped
                            ),
                            "completed_at": (datetime.now().isoformat()),
                        },
                        last_successful_import_timestamp=datetime.now(),
                    )

                    return response
                except Exception as e:
                    # Rollback on failure
                    self._update_status("error", error_message=str(e))
                    self._add_log(
                        "error",
                        f"Sample dataset import failed: {str(e)}",
                        "error",
                    )
                    response.message = f"Sample dataset import failed: {str(e)}"
                    return response

            elif request.import_mode == "replace":
                # Clear tables in transaction, then import custom data
                self._update_status(
                    "running",
                    "Clearing tables for replace",
                    0.1,
                )
                self._add_log(
                    "info",
                    "Clearing tables for replace mode",
                    "clear",
                )
                self._clear_tables(engine)

                # Import custom data only
                if request.dataset_source == "custom":
                    if not request.files:
                        self._update_status(
                            "error",
                            error_message="No files provided",
                        )
                        self._add_log(
                            "error",
                            "No files provided for custom dataset",
                            "load",
                        )
                        response.message = "No files provided for custom dataset"
                        return response
                    self._update_status(
                        "running",
                        "Loading custom data",
                        0.2,
                    )
                    self._add_log(
                        "info",
                        f"Loading {len(request.files)} custom files",
                        "load",
                    )
                    self._load_custom_data(
                        engine,
                        request.files,
                        response,
                        "replace",
                    )
                else:
                    self._update_status(
                        "error",
                        error_message=("Replace mode only supports custom dataset source"),
                    )
                    self._add_log(
                        "error",
                        "Replace mode only supports custom dataset source",
                        "initialization",
                    )
                    response.message = "Replace mode only supports custom dataset source"
                    return response

            elif request.import_mode == "append":
                # Import data without clearing, skip duplicates
                if request.dataset_source == "sample":
                    self._update_status(
                        "running",
                        "Loading sample data",
                        0.2,
                    )
                    self._add_log(
                        "info",
                        "Loading sample dataset in append mode",
                        "load",
                    )
                    self._load_sample_data(engine, response, "append")
                elif request.dataset_source == "custom":
                    if not request.files:
                        self._update_status(
                            "error",
                            error_message="No files provided",
                        )
                        self._add_log(
                            "error",
                            "No files provided for custom dataset",
                            "load",
                        )
                        response.message = "No files provided for custom dataset"
                        return response
                    self._update_status(
                        "running",
                        "Loading custom data",
                        0.2,
                    )
                    self._add_log(
                        "info",
                        (f"Loading {len(request.files)} custom files " "in append mode"),
                        "load",
                    )
                    self._load_custom_data(
                        engine,
                        request.files,
                        response,
                        "append",
                    )
                else:
                    self._update_status(
                        "error",
                        error_message=(f"Invalid dataset source: {request.dataset_source}"),
                    )
                    self._add_log(
                        "error",
                        f"Invalid dataset source: {request.dataset_source}",
                        "initialization",
                    )
                    response.message = f"Invalid dataset source: {request.dataset_source}"
                    return response

            else:
                self._update_status(
                    "error",
                    error_message=(f"Invalid import mode: {request.import_mode}"),
                )
                self._add_log(
                    "error",
                    f"Invalid import mode: {request.import_mode}",
                    "initialization",
                )
                response.message = f"Invalid import mode: {request.import_mode}"
                return response

            # Calculate total
            response.total_records_processed = (
                response.customers_inserted + response.products_inserted + response.orders_inserted
            )

            # Calculate execution time
            execution_time = time.time() - start_time
            response.execution_time = round(execution_time, 2)

            self._update_status("completed", "Completed", 1.0)
            self._add_log(
                "info",
                (
                    "ETL pipeline completed. "
                    f"{response.total_records_processed} records processed."
                ),
                "completion",
            )

            response.success = True
            response.message = (
                f"ETL pipeline completed successfully. "
                f"Inserted: {response.customers_inserted} customers, "
                f"{response.products_inserted} products, "
                f"{response.orders_inserted} orders. "
                f"Skipped: {response.customers_skipped} customers, "
                f"{response.products_skipped} products, "
                f"{response.orders_skipped} orders."
            )

            # Update persistent state for replace/append
            self._update_state(
                dataset_source=request.dataset_source,
                import_mode=request.import_mode,
                uploaded_files=(
                    [f["original_name"] for f in request.files] if request.files else None
                ),
                last_execution={
                    "operation": operation_name,
                    "execution_time": response.execution_time,
                    "customers_imported": response.customers_inserted,
                    "products_imported": response.products_inserted,
                    "orders_imported": response.orders_inserted,
                    "records_skipped": (
                        response.customers_skipped
                        + response.products_skipped
                        + response.orders_skipped
                    ),
                    "completed_at": (datetime.now().isoformat()),
                },
                last_successful_import_timestamp=datetime.now(),
            )

            # Delete uploaded files after successful import if archive mode
            # is not enabled
            if (
                request.dataset_source == "custom"
                and request.files
                and not self.is_archive_mode_enabled()
            ):
                self._delete_uploaded_files(request.files)
                self._add_log(
                    "info",
                    "Uploaded files deleted after successful import",
                    "cleanup",
                )

            return response

        except Exception as e:
            self._update_status("error", error_message=str(e))
            self._add_log("error", f"ETL pipeline failed: {str(e)}", "error")
            response.message = f"ETL pipeline failed: {str(e)}"
            return response

    def _clear_tables(self, engine) -> None:
        """Clear all data tables."""
        tables = ["orders", "products", "customers"]
        with engine.connect() as conn:
            for table in tables:
                conn.execute(text(f"DELETE FROM {table}"))
            conn.commit()

    def _delete_uploaded_files(self, files: list) -> None:
        """
        Delete uploaded files from storage.

        Args:
            files: List of file info dictionaries with 'saved_as' key
        """
        for file_info in files:
            saved_as = file_info.get("saved_as")
            if saved_as:
                file_path = os.path.join(self.upload_dir, saved_as)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        self._add_log(
                            "info",
                            f"Deleted uploaded file: {saved_as}",
                            "cleanup",
                        )
                    except Exception as e:
                        self._add_log(
                            "warning",
                            f"Failed to delete file {saved_as}: {str(e)}",
                            "cleanup",
                        )

    def _load_sample_data(self, engine, response: ETLRunResponse, import_mode: str) -> None:
        """Load sample data from data directory."""
        # Load customers
        customers_file = os.path.join(self.data_dir, "customers.csv")
        if os.path.exists(customers_file):
            self._add_log("info", "Loading customers.csv", "load")
            df = pd.read_csv(customers_file)
            if import_mode == "append":
                inserted, skipped = self._insert_with_duplicate_check(engine, df, "customers", "id")
                response.customers_inserted = inserted
                response.customers_skipped = skipped
            else:
                df.to_sql("customers", engine, if_exists="append", index=False)
                response.customers_inserted = len(df)

        # Load products
        products_file = os.path.join(self.data_dir, "products.csv")
        if os.path.exists(products_file):
            self._add_log("info", "Loading products.csv", "load")
            df = pd.read_csv(products_file)
            if import_mode == "append":
                inserted, skipped = self._insert_with_duplicate_check(engine, df, "products", "id")
                response.products_inserted = inserted
                response.products_skipped = skipped
            else:
                df.to_sql("products", engine, if_exists="append", index=False)
                response.products_inserted = len(df)

        # Load orders
        orders_file = os.path.join(self.data_dir, "orders.csv")
        if os.path.exists(orders_file):
            self._add_log("info", "Loading orders.csv", "load")
            df = pd.read_csv(orders_file)
            # Calculate total_amount if not present
            if (
                "total_amount" not in df.columns
                and "quantity" in df.columns
                and "unit_price" in df.columns
            ):
                df["total_amount"] = df["quantity"] * df["unit_price"]
            if import_mode == "append":
                inserted, skipped = self._insert_with_duplicate_check(engine, df, "orders", "id")
                response.orders_inserted = inserted
                response.orders_skipped = skipped
            else:
                df.to_sql("orders", engine, if_exists="append", index=False)
                response.orders_inserted = len(df)

    def _insert_with_duplicate_check(
        self, engine, df: pd.DataFrame, table_name: str, pk_column: str
    ) -> tuple[int, int]:
        """
        Insert DataFrame into table with duplicate primary key checking.

        Args:
            engine: Database engine
            df: DataFrame to insert
            table_name: Target table name
            pk_column: Primary key column name

        Returns:
            Tuple of (inserted_count, skipped_count)
        """
        inserted = 0
        skipped = 0

        # Get existing primary keys from database
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT {pk_column} FROM {table_name}"))
            existing_keys = set(row[0] for row in result)

        # Filter out rows with existing primary keys
        df_to_insert = df[~df[pk_column].isin(existing_keys)]
        df_to_skip = df[df[pk_column].isin(existing_keys)]

        # Insert only new records
        if len(df_to_insert) > 0:
            df_to_insert.to_sql(
                table_name,
                engine,
                if_exists="append",
                index=False,
            )
            inserted = len(df_to_insert)

        skipped = len(df_to_skip)

        if skipped > 0:
            self._add_log(
                "info",
                f"Skipped {skipped} duplicate records in {table_name}",
                "load",
            )

        return inserted, skipped

    def _load_custom_data(
        self, engine, files: list, response: ETLRunResponse, import_mode: str
    ) -> None:
        """Load custom data from uploaded files."""

        # Sort files by table type to respect foreign key dependencies
        # Order: customers -> products -> orders
        def get_table_priority(file_info):
            original_name = file_info.get("original_name", "")
            if "customer" in original_name.lower():
                return 0
            elif "product" in original_name.lower():
                return 1
            elif "order" in original_name.lower():
                return 2
            return 99

        sorted_files = sorted(files, key=get_table_priority)

        for file_info in sorted_files:
            saved_as = file_info.get("saved_as")
            original_name = file_info.get("original_name", saved_as)

            file_path = os.path.join(self.upload_dir, saved_as)
            if not os.path.exists(file_path):
                self._add_log(
                    "warning",
                    f"File not found: {saved_as}",
                    "load",
                )
                continue

            # Determine table name based on original filename
            if "customer" in original_name.lower():
                table_name = "customers"
            elif "product" in original_name.lower():
                table_name = "products"
            elif "order" in original_name.lower():
                table_name = "orders"
            else:
                self._add_log(
                    "warning",
                    f"Unknown file type: {original_name}",
                    "load",
                )
                continue

            self._add_log(
                "info",
                f"Loading {original_name} into {table_name}",
                "load",
            )
            df = pd.read_csv(file_path)
            # Calculate total_amount for orders if not present
            if (
                table_name == "orders"
                and "total_amount" not in df.columns
                and "quantity" in df.columns
                and "unit_price" in df.columns
            ):
                df["total_amount"] = df["quantity"] * df["unit_price"]

            if import_mode == "append":
                inserted, skipped = self._insert_with_duplicate_check(engine, df, table_name, "id")
                if table_name == "customers":
                    response.customers_inserted += inserted
                    response.customers_skipped += skipped
                elif table_name == "products":
                    response.products_inserted += inserted
                    response.products_skipped += skipped
                elif table_name == "orders":
                    response.orders_inserted += inserted
                    response.orders_skipped += skipped
            else:
                df.to_sql(table_name, engine, if_exists="append", index=False)
                if table_name == "customers":
                    response.customers_inserted += len(df)
                elif table_name == "products":
                    response.products_inserted += len(df)
                elif table_name == "orders":
                    response.orders_inserted += len(df)
