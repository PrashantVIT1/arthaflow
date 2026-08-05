"""Tests for orders API and pagination."""

from fastapi.testclient import TestClient


def test_get_orders_returns_200(test_client: TestClient):
    """Test that get_orders endpoint returns 200 OK."""
    response = test_client.get("/orders")
    assert response.status_code == 200


def test_get_orders_returns_json(test_client: TestClient):
    """Test that get_orders returns JSON content."""
    response = test_client.get("/orders")
    assert response.headers["content-type"] == "application/json"


def test_get_orders_returns_paginated_response_structure(test_client: TestClient):
    """Test that get_orders returns correct paginated response structure."""
    response = test_client.get("/orders")
    data = response.json()
    assert "items" in data
    assert "current_page" in data
    assert "page_size" in data
    assert "total_elements" in data
    assert "total_pages" in data
    assert "has_next" in data
    assert "has_previous" in data
    assert "first_page" in data
    assert "last_page" in data


def test_get_orders_with_default_pagination(test_client: TestClient):
    """Test that get_orders uses default pagination parameters."""
    response = test_client.get("/orders")
    data = response.json()
    assert data["current_page"] == 1
    assert data["page_size"] == 10


def test_get_orders_with_custom_page(test_client: TestClient):
    """Test that get_orders respects custom page parameter."""
    response = test_client.get("/orders?page=2")
    data = response.json()
    assert data["current_page"] == 2


def test_get_orders_with_custom_size(test_client: TestClient):
    """Test that get_orders respects custom size parameter."""
    response = test_client.get("/orders?size=5")
    data = response.json()
    assert data["page_size"] == 5


def test_get_orders_with_invalid_page_returns_422(test_client: TestClient):
    """Test that get_orders validates page parameter."""
    response = test_client.get("/orders?page=0")
    assert response.status_code == 422


def test_get_orders_with_invalid_size_returns_422(test_client: TestClient):
    """Test that get_orders validates size parameter."""
    response = test_client.get("/orders?size=0")
    assert response.status_code == 422


def test_get_orders_with_size_exceeding_max_returns_422(test_client: TestClient):
    """Test that get_orders validates maximum size parameter."""
    response = test_client.get("/orders?size=10001")
    assert response.status_code == 422


def test_get_orders_returns_empty_items_when_no_data(test_client: TestClient):
    """Test that get_orders returns empty items list when database is empty."""
    response = test_client.get("/orders")
    data = response.json()
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 0


def test_get_orders_pagination_metadata_for_empty_database(test_client: TestClient):
    """Test that pagination metadata is correct for empty database."""
    response = test_client.get("/orders")
    data = response.json()
    assert data["total_elements"] == 0
    assert data["total_pages"] == 0
    assert data["has_next"] is False
    assert data["has_previous"] is False
    assert data["first_page"] is True
    assert data["last_page"] is True


def test_export_orders_csv_returns_200(test_client: TestClient):
    """Test that export_orders_csv returns 200 OK."""
    response = test_client.get("/orders/export")
    assert response.status_code == 200


def test_export_orders_csv_returns_csv_content_type(test_client: TestClient):
    """Test that export_orders_csv returns CSV content type."""
    response = test_client.get("/orders/export")
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_export_orders_csv_returns_attachment_header(test_client: TestClient):
    """Test that export_orders_csv returns correct attachment header."""
    response = test_client.get("/orders/export")
    assert "content-disposition" in response.headers
    assert "orders.csv" in response.headers["content-disposition"]


def test_export_orders_csv_contains_header(test_client: TestClient):
    """Test that export_orders_csv CSV contains header row."""
    response = test_client.get("/orders/export")
    content = response.content.decode("utf-8")
    lines = content.split("\n")
    assert "Order ID" in lines[0]
    assert "Order Number" in lines[0]
