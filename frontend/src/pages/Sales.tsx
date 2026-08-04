import React, { useState, useEffect } from 'react';
import { analyticsApi, ordersApi, MonthlySales, CategorySales, RegionalSales, Order } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Filter from '../components/ui/Filter';
import DateRangePicker from '../components/ui/DateRangePicker';
import Loading from '../components/ui/Loading';
import HeaderActions from '../components/ui/HeaderActions';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { exportToCSV, exportToExcel, generateFilename, ExportData } from '../utils/export';

const Sales: React.FC = () => {
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [regionalSales, setRegionalSales] = useState<RegionalSales[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
        const [monthly, category, regional, ordersData] = await Promise.all([
          analyticsApi.getMonthlySales(params),
          analyticsApi.getCategorySales({ start_date: params.start_date, end_date: params.end_date, region: params.region }),
          analyticsApi.getRegionalSales({ start_date: params.start_date, end_date: params.end_date, category: params.category }),
          ordersApi.getAll()
        ]);
        setMonthlySales(monthly);
        setCategorySales(category);
        setRegionalSales(regional);
        setOrders(ordersData.items);
      } catch (err) {
        setError('Failed to load sales data. Please try again later.');
        console.error('Error fetching sales data:', err);
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
        const [monthly, category, regional, ordersData] = await Promise.all([
          analyticsApi.getMonthlySales(params),
          analyticsApi.getCategorySales({ start_date: params.start_date, end_date: params.end_date, region: params.region }),
          analyticsApi.getRegionalSales({ start_date: params.start_date, end_date: params.end_date, category: params.category }),
          ordersApi.getAll()
        ]);
        setMonthlySales(monthly);
        setCategorySales(category);
        setRegionalSales(regional);
        setOrders(ordersData.items);
      } catch (err) {
        setError('Failed to load sales data. Please try again later.');
        console.error('Error fetching sales data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    const matchesDateRange = (!dateRange.startDate || new Date(order.order_date) >= new Date(dateRange.startDate)) &&
                              (!dateRange.endDate || new Date(order.order_date) <= new Date(dateRange.endDate));
    const matchesRegion = !regionFilter || order.region === regionFilter;
    return matchesDateRange && matchesRegion;
  });

  const handleExportCSV = () => {
    const exportData: ExportData = {
      headers: ['Order Number', 'Customer', 'Product', 'Quantity', 'Unit Price', 'Revenue', 'Profit', 'Region', 'Status', 'Order Date'],
      rows: filteredOrders.map(order => [
        order.order_number,
        order.customer_id,
        order.product_id,
        order.quantity,
        order.unit_price.toFixed(2),
        order.total_amount.toFixed(2),
        (order.total_amount * 0.2).toFixed(2), // Approximate profit
        order.region || '',
        order.status,
        new Date(order.order_date).toLocaleDateString()
      ])
    };
    const filename = generateFilename('sales', 'csv');
    exportToCSV(exportData, filename);
    alert('Sales exported successfully.');
  };

  const handleExportExcel = () => {
    const exportData: ExportData = {
      headers: ['Order Number', 'Customer', 'Product', 'Quantity', 'Unit Price', 'Revenue', 'Profit', 'Region', 'Status', 'Order Date'],
      rows: filteredOrders.map(order => [
        order.order_number,
        order.customer_id,
        order.product_id,
        order.quantity,
        order.unit_price.toFixed(2),
        order.total_amount.toFixed(2),
        (order.total_amount * 0.2).toFixed(2), // Approximate profit
        order.region || '',
        order.status,
        new Date(order.order_date).toLocaleDateString()
      ])
    };
    const filename = generateFilename('sales', 'excel');
    exportToExcel(exportData, filename);
    alert('Sales exported successfully.');
  };

  const categoryOptions = categorySales.map((c) => ({ label: c.category, value: c.category }));
  const regionOptions = regionalSales.map((r) => ({ label: r.region, value: r.region }));

  const monthlyColumns = [
    { key: 'month_name' as const, label: 'Month', sortable: true },
    { key: 'year' as const, label: 'Year', sortable: true },
    { 
      key: 'revenue' as const, 
      label: 'Revenue', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { 
      key: 'orders' as const, 
      label: 'Orders', 
      sortable: true,
      render: (value: number) => value.toLocaleString('en-US')
    },
    { 
      key: 'profit' as const, 
      label: 'Profit', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
  ];

  const categoryColumns = [
    { key: 'category' as const, label: 'Category', sortable: true },
    { 
      key: 'revenue' as const, 
      label: 'Revenue', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { 
      key: 'orders' as const, 
      label: 'Orders', 
      sortable: true,
      render: (value: number) => value.toLocaleString('en-US')
    },
    { 
      key: 'profit' as const, 
      label: 'Profit', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
  ];

  const regionalColumns = [
    { key: 'region' as const, label: 'Region', sortable: true },
    { 
      key: 'revenue' as const, 
      label: 'Revenue', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { 
      key: 'orders' as const, 
      label: 'Orders', 
      sortable: true,
      render: (value: number) => value.toLocaleString('en-US')
    },
    { 
      key: 'profit' as const, 
      label: 'Profit', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sales Data</h2>
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

  if (loading && monthlySales.length === 0) {
    return <Loading text="Loading sales data..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive sales performance analysis</p>
        </div>
        <HeaderActions
          actions={[
            {
              type: 'export-dropdown',
              label: 'Export',
              onClick: () => {},
              disabled: filteredOrders.length === 0,
              disabledTooltip: 'No data available to export',
              exportFormats: [
                {
                  type: 'csv',
                  label: 'Export as CSV',
                  onClick: handleExportCSV,
                },
                {
                  type: 'excel',
                  label: 'Export as Excel',
                  onClick: handleExportExcel,
                },
              ],
            },
            {
              type: 'refresh',
              icon: <RefreshCw className="w-4 h-4" />,
              label: 'Refresh',
              onClick: handleRefresh,
              loading,
            },
          ]}
          className="w-full sm:w-auto"
        />
      </div>

      <Card>
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${monthlySales.reduce((sum, m) => sum + m.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {monthlySales.reduce((sum, m) => sum + m.orders, 0).toLocaleString('en-US')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${monthlySales.reduce((sum, m) => sum + m.profit, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Monthly Sales Trend" subtitle="Revenue and orders by month">
        <Table
          data={monthlySales}
          columns={monthlyColumns}
          loading={loading}
          searchable
          pagination
          pageSize={12}
          emptyMessage="No monthly sales data available"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales by Category" subtitle="Revenue breakdown by product category">
          <Table
            data={categorySales}
            columns={categoryColumns}
            loading={loading}
            searchable
            pagination
            pageSize={10}
            emptyMessage="No category sales data available"
          />
        </Card>
        <Card title="Sales by Region" subtitle="Revenue breakdown by geographic region">
          <Table
            data={regionalSales}
            columns={regionalColumns}
            loading={loading}
            searchable
            pagination
            pageSize={10}
            emptyMessage="No regional sales data available"
          />
        </Card>
      </div>
    </div>
  );
};

export default Sales;
