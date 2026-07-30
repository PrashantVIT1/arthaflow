import React, { useState, useEffect } from 'react';
import { analyticsApi, DashboardResponse } from '../services/api';
import KPICards from '../components/KPICards';
import MonthlySalesChart from '../charts/MonthlySalesChart';
import CategorySalesChart from '../charts/CategorySalesChart';
import RegionalSalesChart from '../charts/RegionalSalesChart';
import ProductDistributionPieChart from '../charts/ProductDistributionPieChart';
import TopProductsChart from '../charts/TopProductsChart';
import Card from '../components/ui/Card';
import Filter from '../components/ui/Filter';
import DateRangePicker from '../components/ui/DateRangePicker';
import EmptyState from '../components/ui/EmptyState';
import Loading from '../components/ui/Loading';
import { RefreshCw, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: any = {};
        if (dateRange.startDate) params.start_date = dateRange.startDate;
        if (dateRange.endDate) params.end_date = dateRange.endDate;
        if (categoryFilter) params.category = categoryFilter;
        if (regionFilter) params.region = regionFilter;
        const dashboardData = await analyticsApi.getDashboard(params);
        setData(dashboardData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Listen for ETL completion event to refresh data
    const handleETLCompleted = () => {
      fetchData();
    };
    
    window.addEventListener('etl-completed', handleETLCompleted);
    
    return () => {
      window.removeEventListener('etl-completed', handleETLCompleted);
    };
  }, [dateRange.startDate, dateRange.endDate, categoryFilter, regionFilter]);

  const handleRefresh = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: any = {};
        if (dateRange.startDate) params.start_date = dateRange.startDate;
        if (dateRange.endDate) params.end_date = dateRange.endDate;
        if (categoryFilter) params.category = categoryFilter;
        if (regionFilter) params.region = regionFilter;
        const dashboardData = await analyticsApi.getDashboard(params);
        setData(dashboardData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (dateRange.startDate) params.start_date = dateRange.startDate;
      if (dateRange.endDate) params.end_date = dateRange.endDate;
      if (categoryFilter) params.category = categoryFilter;
      if (regionFilter) params.region = regionFilter;
      await analyticsApi.exportDashboard(params);
    } catch (err) {
      console.error('Error exporting dashboard:', err);
    }
  };

  const categoryOptions = data?.category_sales.map((c) => ({ label: c.category, value: c.category })) || [];
  const regionOptions = data?.regional_sales.map((r) => ({ label: r.region, value: r.region })) || [];

  // Transform top_products data for pie chart
  const pieChartData = data?.top_products.map((product) => ({
    label: product.product_name,
    value: product.revenue
  })) || [];

  if (loading && !data) {
    return <Loading text="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data. Please try refreshing.</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Key performance metrics and analytics</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Filters</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(date) => setDateRange({ ...dateRange, startDate: date })}
              onEndDateChange={(date) => setDateRange({ ...dateRange, endDate: date })}
            />
            <Filter
              label="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              onClear={() => setCategoryFilter('')}
            />
            <Filter
              label="Region"
              options={regionOptions}
              value={regionFilter}
              onChange={setRegionFilter}
              onClear={() => setRegionFilter('')}
            />
          </div>
        </div>
      </Card>

      <KPICards kpis={data?.kpis || {} as any} loading={loading} />

      {!data || data.monthly_sales.length === 0 ? (
        <Card>
          <EmptyState
            title="No Data Available"
            description="There is no data to display for the selected filters."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlySalesChart data={data.monthly_sales} loading={loading} />
            <CategorySalesChart data={data.category_sales} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RegionalSalesChart data={data.regional_sales} loading={loading} />
            <ProductDistributionPieChart data={pieChartData} loading={loading} />
          </div>

          <TopProductsChart data={data.top_products} loading={loading} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
