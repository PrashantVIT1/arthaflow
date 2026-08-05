"""Tests for customer API and service layer."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient


def test_get_customers_returns_empty_list_when_no_data(test_client: TestClient):
    """Test that get_customers returns empty list when database is empty."""
    response = test_client.get("/customers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_get_customers_returns_200(test_client: TestClient):
    """Test that get_customers endpoint returns 200 OK."""
    response = test_client.get("/customers")
    assert response.status_code == 200


def test_get_customers_returns_json(test_client: TestClient):
    """Test that get_customers returns JSON content."""
    response = test_client.get("/customers")
    assert response.headers["content-type"] == "application/json"


def test_export_customers_csv_returns_200(test_client: TestClient):
    """Test that export_customers_csv returns 200 OK."""
    response = test_client.get("/customers/export")
    assert response.status_code == 200


def test_export_customers_csv_returns_csv_content_type(test_client: TestClient):
    """Test that export_customers_csv returns CSV content type."""
    response = test_client.get("/customers/export")
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_export_customers_csv_returns_attachment_header(test_client: TestClient):
    """Test that export_customers_csv returns correct attachment header."""
    response = test_client.get("/customers/export")
    assert "content-disposition" in response.headers
    assert "customers.csv" in response.headers["content-disposition"]


def test_customer_service_get_all_customers_handles_empty_database(mock_db_session):
    """Test that CustomerService handles empty database gracefully."""
    from app.services.customer import CustomerService

    mock_db_session.execute.return_value = []
    service = CustomerService(mock_db_session)
    result = service.get_all_customers()
    assert isinstance(result, list)
    assert len(result) == 0


def test_customer_service_get_all_customers_executes_query(mock_db_session):
    """Test that CustomerService executes the correct SQL query."""
    from app.services.customer import CustomerService

    service = CustomerService(mock_db_session)
    service.get_all_customers()
    mock_db_session.execute.assert_called_once()


def test_customer_service_get_all_customers_returns_customer_responses(mock_db_session):
    """Test that CustomerService returns CustomerResponse objects."""
    from app.schemas.customer import CustomerResponse
    from app.services.customer import CustomerService

    mock_row = MagicMock()
    mock_row.id = 1
    mock_row.name = "John Smith"
    mock_row.email = "john@example.com"
    mock_row.phone = None
    mock_row.address = None
    mock_row.city = None
    mock_row.country = None
    mock_row.total_orders = 0
    mock_row.total_spent = 0
    mock_row.last_order_date = None
    mock_row.created_at = None
    mock_row.updated_at = None

    mock_db_session.execute.return_value = [mock_row]
    service = CustomerService(mock_db_session)
    result = service.get_all_customers()
    assert len(result) == 1
    assert isinstance(result[0], CustomerResponse)
    assert result[0].name == "John Smith"
