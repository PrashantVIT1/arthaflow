"""Pytest configuration and fixtures for ArthaFlow backend tests."""

import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create a temporary SQLite database file for testing
_test_db_path = tempfile.mktemp(suffix=".db")

# Set test environment variables to use the temporary database
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db_path}"
os.environ["FRONTEND_URL"] = "http://localhost:5174"

# Import app - it will use the temporary database
from app.database.config import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

# Create test engine with same connection string
_test_engine = create_engine(
    f"sqlite:///{_test_db_path}",
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)
Base.metadata.create_all(bind=_test_engine)


@pytest.fixture(scope="session")
def test_engine():
    """Return the global test engine."""
    return _test_engine


@pytest.fixture
def test_db_session(test_engine):
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_client(test_engine, test_db_session):
    """Create a FastAPI test client with a test database session."""

    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass

    # Override get_db to use test database session
    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app, raise_server_exceptions=False)
    yield client

    app.dependency_overrides.clear()


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db(test_engine):
    """Clean up the temporary test database after all tests."""
    yield
    # Dispose engine to release file locks
    test_engine.dispose()
    # Try to delete the file, ignore errors if still locked
    try:
        if Path(_test_db_path).exists():
            Path(_test_db_path).unlink()
    except (PermissionError, OSError):
        pass  # File will be cleaned up by OS eventually


@pytest.fixture
def mock_db_session():
    """Create a mock database session for unit tests."""
    session = MagicMock()
    return session


@pytest.fixture
def sample_customer_data():
    """Sample customer data for testing."""
    return {
        "id": 1,
        "name": "John Smith",
        "email": "john.smith@example.com",
        "phone": "+1-555-0101",
        "address": "123 Main St",
        "city": "New York",
        "country": "USA",
    }


@pytest.fixture
def sample_order_data():
    """Sample order data for testing."""
    return {
        "id": 1,
        "order_number": "ORD-1000",
        "customer_id": 1,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 99.99,
        "total_amount": 199.98,
        "status": "completed",
        "region": "North",
    }


@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "id": 1,
        "name": "Laptop Pro 15",
        "description": "High-performance laptop with 15-inch display",
        "category": "Electronics",
        "price": 1299.99,
        "cost": 800.00,
        "stock_quantity": 50,
    }
