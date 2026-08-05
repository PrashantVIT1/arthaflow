"""Pytest configuration and fixtures for ArthaFlow backend tests."""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock

# Set test environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["FRONTEND_URL"] = "http://localhost:5174"

from app.database.config import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def test_engine():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_db_session(test_engine):
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_client(test_db_session):
    """Create a FastAPI test client with a test database session."""

    def override_get_db():
        try:
            yield test_db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


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
