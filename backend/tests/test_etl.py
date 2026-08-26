"""Tests for ETL layer functions."""

from pathlib import Path

import pandas as pd
import pytest


def test_extractor_read_csv_raises_file_not_found():
    """Test that Extractor.read_csv raises FileNotFoundError for missing file."""
    from app.etl.extract import Extractor

    extractor = Extractor()
    with pytest.raises(FileNotFoundError):
        extractor.read_csv(Path("/nonexistent/file.csv"))


def test_extractor_read_csv_returns_dataframe(tmp_path):
    """Test that Extractor.read_csv returns a DataFrame."""
    from app.etl.extract import Extractor

    # Create a temporary CSV file
    csv_file = tmp_path / "test.csv"
    csv_file.write_text("id,name\n1,Test\n")

    extractor = Extractor()
    df = extractor.read_csv(csv_file)
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 1
    assert "id" in df.columns


def test_cleaner_remove_duplicates_removes_duplicate_rows():
    """Test that Cleaner.remove_duplicates removes duplicate rows."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1, 1, 2], "name": ["A", "A", "B"]})
    result = cleaner.remove_duplicates(df)
    assert len(result) == 2
    assert list(result["id"]) == [1, 2]


def test_cleaner_remove_duplicates_with_subset():
    """Test that Cleaner.remove_duplicates respects subset parameter."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1, 2, 3], "name": ["A", "A", "B"]})
    result = cleaner.remove_duplicates(df, subset=["name"])
    assert len(result) == 2


def test_cleaner_handle_null_values_drops_required_nulls():
    """Test that Cleaner.handle_null_values drops rows with nulls in required columns."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1, None], "name": ["A", "B"]})
    result = cleaner.handle_null_values(df, "orders")
    assert len(result) == 1


def test_cleaner_handle_null_values_fills_optional_nulls():
    """Test that Cleaner.handle_null_values fills nulls in optional columns."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1], "description": [None]})
    result = cleaner.handle_null_values(df, "products")
    assert result["description"].iloc[0] == ""


def test_cleaner_convert_date_columns_converts_dates():
    """Test that Cleaner.convert_date_columns converts string dates to datetime."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1], "order_date": ["2024-01-01"]})
    result = cleaner.clean_dataframe(df, "orders")
    assert pd.api.types.is_datetime64_any_dtype(result["order_date"])


def test_cleaner_clean_dataframe_applies_all_cleaning_steps():
    """Test that Cleaner.clean_dataframe applies all cleaning operations."""
    from app.etl.clean import Cleaner

    cleaner = Cleaner()
    df = pd.DataFrame({"id": [1, 1], "name": ["A", "A"]})
    result = cleaner.clean_dataframe(df, "customers")
    assert len(result) == 1  # Duplicates removed


def test_transformer_calculate_revenue_adds_total_amount():
    """Test that Transformer.calculate_revenue adds total_amount column."""
    from app.etl.transform import Transformer

    transformer = Transformer()
    df = pd.DataFrame({"quantity": [2], "unit_price": [10.0]})
    result = transformer.calculate_revenue(df)
    assert "total_amount" in result.columns
    assert result["total_amount"].iloc[0] == 20.0


def test_transformer_calculate_revenue_without_columns():
    """Test that Transformer.calculate_revenue handles missing columns."""
    from app.etl.transform import Transformer

    transformer = Transformer()
    df = pd.DataFrame({"id": [1]})
    result = transformer.calculate_revenue(df)
    assert "total_amount" not in result.columns


def test_transformer_calculate_profit_adds_profit_column():
    """Test that Transformer.calculate_profit adds profit column."""
    from app.etl.transform import Transformer

    transformer = Transformer()
    orders_df = pd.DataFrame(
        {"id": [1], "product_id": [1], "quantity": [2], "unit_price": [10.0]}
    )
    products_df = pd.DataFrame({"id": [1], "cost": [5.0]})
    result = transformer.calculate_profit(orders_df, products_df)
    assert "profit" in result.columns
    assert result["profit"].iloc[0] == 10.0  # (10-5)*2


def test_transformer_add_derived_columns_adds_year_month():
    """Test that Transformer.add_derived_columns adds year and month columns."""
    from app.etl.transform import Transformer

    transformer = Transformer()
    df = pd.DataFrame({"order_date": pd.to_datetime(["2024-01-15"])})
    result = transformer.add_derived_columns(df)
    assert "order_year" in result.columns
    assert "order_month" in result.columns
    assert result["order_year"].iloc[0] == 2024
    assert result["order_month"].iloc[0] == 1


def test_transformer_add_derived_columns_adds_profit_margin():
    """Test that Transformer.add_derived_columns adds profit_margin column."""
    from app.etl.transform import Transformer

    transformer = Transformer()
    df = pd.DataFrame({"profit": [10.0], "total_amount": [100.0]})
    result = transformer.add_derived_columns(df)
    assert "profit_margin" in result.columns
    assert result["profit_margin"].iloc[0] == 10.0


def test_validator_check_required_columns_passes_with_valid_columns():
    """Test that Validator.check_required_columns passes with valid columns."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1], "name": ["Test"], "email": ["test@example.com"]})
    result = validator.check_required_columns(df, "customers")
    assert result is True


def test_validator_check_required_columns_fails_with_missing_columns():
    """Test that Validator.check_required_columns fails with missing columns."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1]})
    result = validator.check_required_columns(df, "customers")
    assert result is False
    assert len(validator.validation_errors) > 0


def test_validator_check_data_types_passes_with_correct_types():
    """Test that Validator.check_data_types passes with correct types."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1]})
    result = validator.check_data_types(df, "customers")
    assert result is True


def test_validator_check_null_values_counts_nulls():
    """Test that Validator.check_null_values counts null values."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1, None]})
    result = validator.check_null_values(df, "customers")
    assert "id" in result
    assert result["id"] == 1


def test_validator_check_duplicates_counts_duplicates():
    """Test that Validator.check_duplicates counts duplicate IDs."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1, 1, 2]})
    count = validator.check_duplicates(df, "customers", "id")
    assert count == 1


def test_validator_validate_dataframe_returns_tuple():
    """Test that Validator.validate_dataframe returns a tuple."""
    from app.etl.validate import Validator

    validator = Validator()
    df = pd.DataFrame({"id": [1]})
    result = validator.validate_dataframe(df, "customers")
    assert isinstance(result, tuple)
    assert len(result) == 2


def test_validator_validate_all_returns_dict():
    """Test that Validator.validate_all returns a dictionary."""
    from app.etl.validate import Validator

    validator = Validator()
    data = {"customers": pd.DataFrame({"id": [1]})}
    result = validator.validate_all(data)
    assert isinstance(result, dict)
    assert "customers" in result


def test_etl_pipeline_initializes_components():
    """Test that ETLPipeline initializes all components."""
    from app.etl.pipeline import ETLPipeline

    pipeline = ETLPipeline()
    assert pipeline.extractor is not None
    assert pipeline.cleaner is not None
    assert pipeline.transformer is not None
    assert pipeline.validator is not None
    assert pipeline.loader is not None


def test_etl_config_has_required_columns():
    """Test that ETLConfig has required columns defined."""
    from app.etl.config import ETLConfig

    config = ETLConfig()
    assert "orders" in config.REQUIRED_COLUMNS
    assert "customers" in config.REQUIRED_COLUMNS
    assert "products" in config.REQUIRED_COLUMNS


def test_etl_config_has_dtypes():
    """Test that ETLConfig has data types defined."""
    from app.etl.config import ETLConfig

    config = ETLConfig()
    assert "orders" in config.DTYPES
    assert "customers" in config.DTYPES
    assert "products" in config.DTYPES


def test_etl_config_has_date_columns():
    """Test that ETLConfig has date columns defined."""
    from app.etl.config import ETLConfig

    config = ETLConfig()
    assert "orders" in config.DATE_COLUMNS
    assert "customers" in config.DATE_COLUMNS
    assert "products" in config.DATE_COLUMNS
