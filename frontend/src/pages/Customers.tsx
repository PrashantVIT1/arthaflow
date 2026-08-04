import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Loading from '../components/ui/Loading';
import HeaderActions from '../components/ui/HeaderActions';
import { RefreshCw, Users, TrendingUp, MapPin, Download } from 'lucide-react';
import { customersApi, Customer } from '../services/api';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    fetchData();
    
    // Listen for ETL completion event to refresh data
    const handleETLCompleted = () => {
      fetchData();
    };
    
    window.addEventListener('etl-completed', handleETLCompleted);
    
    return () => {
      window.removeEventListener('etl-completed', handleETLCompleted);
    };
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = async () => {
    try {
      await customersApi.exportCustomers();
    } catch (err) {
      console.error('Error exporting customers:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers data. Please try again later.');
      console.error('Error fetching customers data:', err);
    } finally {
      setLoading(false);
    }
  };

  const regionOptions = Array.from(new Set(customers.map((c) => c.city).filter(Boolean))).map((city) => ({
    label: city,
    value: city,
  }));

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = !regionFilter || customer.city === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const columns = [
    { key: 'id' as const, label: 'ID', sortable: true },
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    { key: 'city' as const, label: 'City', sortable: true },
    { 
      key: 'total_orders' as const, 
      label: 'Total Orders', 
      sortable: true,
      render: (value: number) => value.toLocaleString('en-US')
    },
    { 
      key: 'total_spent' as const, 
      label: 'Total Spent', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    { key: 'last_order_date' as const, label: 'Last Order Date', sortable: true },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Customers Data</h2>
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

  if (loading && customers.length === 0) {
    return <Loading text="Loading customers data..." />;
  }

  const totalCustomers = filteredCustomers.length;
  const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.total_spent, 0);
  const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.total_orders, 0);
  const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  // Regional distribution
  const regionalDistribution = regionOptions.map((opt) => ({
    region: opt.label,
    count: filteredCustomers.filter((c) => c.city === opt.label).length,
    percentage: totalCustomers > 0 
      ? ((filteredCustomers.filter((c) => c.city === opt.label).length / totalCustomers) * 100).toFixed(1)
      : '0',
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Customer Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Customer insights and purchase behavior</p>
        </div>
        <HeaderActions
          actions={[
            {
              type: 'export',
              icon: <Download className="w-4 h-4" />,
              label: 'Export CSV',
              onClick: handleExport,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Customers</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Cities</option>
                {regionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCustomers.toLocaleString('en-US')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {totalOrders.toLocaleString('en-US')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Spend/Customer</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${avgSpentPerCustomer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Regional Distribution" subtitle="Customer distribution by city">
          <div className="space-y-4">
            {regionalDistribution.map((item) => (
              <div key={item.region} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{item.region}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Top Customers" subtitle="Customers with highest total spent">
          <Table
            data={[...filteredCustomers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 10)}
            columns={[
              { key: 'name' as const, label: 'Name', sortable: true },
              { key: 'email' as const, label: 'Email', sortable: true },
              { key: 'city' as const, label: 'City', sortable: true },
              { 
                key: 'total_spent' as const, 
                label: 'Total Spent', 
                sortable: true,
                render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              },
            ]}
            loading={loading}
            searchable={false}
            pagination={false}
            emptyMessage="No customers data available"
          />
        </Card>
      </div>

      <Card title="All Customers" subtitle="Complete customer list with purchase statistics">
        <Table
          data={filteredCustomers}
          columns={columns}
          loading={loading}
          searchable={false}
          pagination
          pageSize={15}
          emptyMessage="No customers data available"
        />
      </Card>
    </div>
  );
};

export default Customers;
