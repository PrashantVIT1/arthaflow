"""Health check tests for ArthaFlow API."""

from fastapi.testclient import TestClient


def test_root_endpoint_returns_200(test_client: TestClient):
    """Test that the root endpoint returns 200 OK."""
    response = test_client.get("/")
    assert response.status_code == 200


def test_root_endpoint_returns_correct_message(test_client: TestClient):
    """Test that the root endpoint returns the expected message."""
    response = test_client.get("/")
    data = response.json()
    assert "message" in data
    assert data["message"] == "ArthaFlow API is running"


def test_root_endpoint_returns_json(test_client: TestClient):
    """Test that the root endpoint returns JSON content."""
    response = test_client.get("/")
    assert response.headers["content-type"] == "application/json"


def test_nonexistent_endpoint_returns_404(test_client: TestClient):
    """Test that a nonexistent endpoint returns 404."""
    response = test_client.get("/nonexistent")
    assert response.status_code == 404
