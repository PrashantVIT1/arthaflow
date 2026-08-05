"""Tests for analytics API and service layer."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient


def test_get_dashboard_returns_200(test_client: TestClient):
    """Test that get_dashboard endpoint returns 200 OK."""
    response = test_client.get("/analytics/dashboard")
    assert response.status_code == 200


def test_get_dashboard_returns_json(test_client: TestClient):
    """Test that get_dashboard returns JSON content."""
    response = test_client.get("/analytics/dashboard")
    assert response.headers["content-type"] == "application/json"


def test_get_dashboard_returns_correct_structure(test_client: TestClient):
    """Test that get_dashboard returns correct response structure."""
    response = test_client.get("/analytics/dashboard")
    data = response.json()
    assert "kpis" in data
    assert "monthly_sales" in data
    assert "category_sales" in data
    assert "regional_sales" in data
    assert "top_products" in data


def test_get_dashboard_kpis_structure(test_client: TestClient):
    """Test that dashboard KPIs have correct structure."""
    response = test_client.get("/analytics/dashboard")
    data = response.json()
    kpis = data["kpis"]
    assert "total_revenue" in kpis
    assert "total_orders" in kpis
    assert "total_customers" in kpis
    assert "total_products" in kpis
    assert "total_profit" in kpis
    assert "profit_margin" in kpis


def test_get_dashboard_with_date_filters(test_client: TestClient):
    """Test that get_dashboard accepts date filter parameters."""
    response = test_client.get("/analytics/dashboard?start_date=2024-01-01&end_date=2024-12-31")
    assert response.status_code == 200


def test_get_dashboard_with_category_filter(test_client: TestClient):
    """Test that get_dashboard accepts category filter parameter."""
    response = test_client.get("/analytics/dashboard?category=Electronics")
    assert response.status_code == 200


def test_get_dashboard_with_region_filter(test_client: TestClient):
    """Test that get_dashboard accepts region filter parameter."""
    response = test_client.get("/analytics/dashboard?region=North")
    assert response.status_code == 200


def test_get_monthly_sales_returns_200(test_client: TestClient):
    """Test that get_monthly_sales endpoint returns 200 OK."""
    response = test_client.get("/analytics/sales/monthly")
    assert response.status_code == 200


def test_get_monthly_sales_returns_list(test_client: TestClient):
    """Test that get_monthly_sales returns a list."""
    response = test_client.get("/analytics/sales/monthly")
    data = response.json()
    assert isinstance(data, list)


def test_get_category_sales_returns_200(test_client: TestClient):
    """Test that get_category_sales endpoint returns 200 OK."""
    response = test_client.get("/analytics/sales/category")
    assert response.status_code == 200


def test_get_category_sales_returns_list(test_client: TestClient):
    """Test that get_category_sales returns a list."""
    response = test_client.get("/analytics/sales/category")
    data = response.json()
    assert isinstance(data, list)


def test_get_regional_sales_returns_200(test_client: TestClient):
    """Test that get_regional_sales endpoint returns 200 OK."""
    response = test_client.get("/analytics/sales/region")
    assert response.status_code == 200


def test_get_regional_sales_returns_list(test_client: TestClient):
    """Test that get_regional_sales returns a list."""
    response = test_client.get("/analytics/sales/region")
    data = response.json()
    assert isinstance(data, list)


def test_get_top_products_returns_200(test_client: TestClient):
    """Test that get_top_products endpoint returns 200 OK."""
    response = test_client.get("/analytics/products/top")
    assert response.status_code == 200


def test_get_top_products_returns_list(test_client: TestClient):
    """Test that get_top_products returns a list."""
    response = test_client.get("/analytics/products/top")
    data = response.json()
    assert isinstance(data, list)


def test_get_top_products_with_custom_limit(test_client: TestClient):
    """Test that get_top_products accepts custom limit parameter."""
    response = test_client.get("/analytics/products/top?limit=5")
    assert response.status_code == 200


def test_export_dashboard_csv_returns_200(test_client: TestClient):
    """Test that export_dashboard_csv returns 200 OK."""
    response = test_client.get("/analytics/export/dashboard")
    assert response.status_code == 200


def test_export_dashboard_csv_returns_csv_content_type(test_client: TestClient):
    """Test that export_dashboard_csv returns CSV content type."""
    response = test_client.get("/analytics/export/dashboard")
    assert response.headers["content-type"] == "text/csv; charset=utf-8"


def test_export_dashboard_csv_returns_attachment_header(test_client: TestClient):
    """Test that export_dashboard_csv returns correct attachment header."""
    response = test_client.get("/analytics/export/dashboard")
    assert "content-disposition" in response.headers
    assert "dashboard_summary.csv" in response.headers["content-disposition"]


def test_analytics_service_get_dashboard_calls_repository(mock_db_session):
    """Test that AnalyticsService.get_dashboard calls repository methods."""
    from app.services.analytics import AnalyticsService

    mock_repo = MagicMock()
    mock_repo.get_dashboard_kpis.return_value = {
        "total_revenue": 0.0,
        "total_orders": 0,
        "total_customers": 0,
        "total_products": 0,
        "total_profit": 0.0,
        "profit_margin": 0.0,
    }
    mock_repo.get_monthly_sales.return_value = []
    mock_repo.get_category_sales.return_value = []
    mock_repo.get_regional_sales.return_value = []
    mock_repo.get_top_products.return_value = []

    service = AnalyticsService(mock_db_session)
    service.repository = mock_repo
    service.get_dashboard()

    mock_repo.get_dashboard_kpis.assert_called_once()
    mock_repo.get_monthly_sales.assert_called_once()
    mock_repo.get_category_sales.assert_called_once()
    mock_repo.get_regional_sales.assert_called_once()
    mock_repo.get_top_products.assert_called_once()


def test_analytics_service_get_monthly_sales_calls_repository(mock_db_session):
    """Test that AnalyticsService.get_monthly_sales calls repository."""
    from app.services.analytics import AnalyticsService

    mock_repo = MagicMock()
    mock_repo.get_monthly_sales.return_value = []

    service = AnalyticsService(mock_db_session)
    service.repository = mock_repo
    service.get_monthly_sales()

    mock_repo.get_monthly_sales.assert_called_once()


def test_analytics_repository_get_dashboard_kpis_returns_dict_structure(mock_db_session):
    """Test that AnalyticsRepository returns a dictionary with correct keys."""
    from app.repositories.analytics import AnalyticsRepository

    # Simplified mock - just verify the structure is correct
    mock_query = MagicMock()
    mock_query.filter.return_value = mock_query
    mock_query.join.return_value = mock_query
    mock_query.with_entities.return_value.scalar.return_value = 0
    mock_query.count.return_value = 0

    mock_db_session.query.return_value = mock_query

    repo = AnalyticsRepository(mock_db_session)
    kpis = repo.get_dashboard_kpis()

    # Verify the structure has all required keys
    assert "total_revenue" in kpis
    assert "total_orders" in kpis
    assert "total_customers" in kpis
    assert "total_products" in kpis
    assert "total_profit" in kpis
    assert "profit_margin" in kpis
