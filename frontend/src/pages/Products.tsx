import React, { useState, useEffect } from 'react';
import { analyticsApi, TopProduct } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Filter from '../components/ui/Filter';
import Loading from '../components/ui/Loading';
import HeaderActions from '../components/ui/HeaderActions';
import { RefreshCw, Package, TrendingUp, Download } from 'lucide-react';
import { exportToCSV, generateFilename, ExportData } from '../utils/export';

const Products: React.FC = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await analyticsApi.getTopProducts(50);
        setProducts(productsData);
      } catch (err) {
        setError('Failed to load products data. Please try again later.');
        console.error('Error fetching products data:', err);
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
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await analyticsApi.getTopProducts(50);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load products data. Please try again later.');
      console.error('Error fetching products data:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
    label: cat,
    value: cat,
  }));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const exportData: ExportData = {
      headers: ['ID', 'Name', 'Description', 'Category', 'Price', 'Cost', 'Stock Quantity'],
      rows: filteredProducts.map(p => [
        p.product_id,
        p.product_name,
        '', // Description not available in TopProduct
        p.category,
        (p.revenue / p.quantity_sold).toFixed(2), // Calculate price
        ((p.revenue - p.profit) / p.quantity_sold).toFixed(2), // Calculate cost
        p.quantity_sold
      ])
    };
    const filename = generateFilename('products', 'csv');
    exportToCSV(exportData, filename);
    alert('Products exported successfully.');
  };

  const columns = [
    { key: 'product_id' as const, label: 'ID', sortable: true },
    { key: 'product_name' as const, label: 'Product Name', sortable: true },
    { key: 'category' as const, label: 'Category', sortable: true },
    { 
      key: 'quantity_sold' as const, 
      label: 'Quantity Sold', 
      sortable: true,
      render: (value: number) => value.toLocaleString('en-US')
    },
    { 
      key: 'revenue' as const, 
      label: 'Revenue', 
      sortable: true,
      render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products Data</h2>
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

  if (loading && products.length === 0) {
    return <Loading text="Loading products data..." />;
  }

  const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.revenue, 0);
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity_sold, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Product Analytics</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Product performance and inventory insights</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Search Products</label>
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Filter
              label="Category"
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              onClear={() => setCategoryFilter('')}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredProducts.length.toLocaleString('en-US')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-gray-600">Total Quantity Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalQuantity.toLocaleString('en-US')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Product Performance" subtitle="Detailed product metrics and sales data">
        <Table
          data={filteredProducts}
          columns={columns}
          loading={loading}
          searchable={false}
          pagination
          pageSize={15}
          emptyMessage="No products data available"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Selling Products" subtitle="Products with highest quantity sold">
          <Table
            data={[...filteredProducts].sort((a, b) => b.quantity_sold - a.quantity_sold).slice(0, 10)}
            columns={[
              { key: 'product_name' as const, label: 'Product Name', sortable: true },
              { key: 'category' as const, label: 'Category', sortable: true },
              { 
                key: 'quantity_sold' as const, 
                label: 'Quantity Sold', 
                sortable: true,
                render: (value: number) => value.toLocaleString('en-US')
              },
            ]}
            loading={loading}
            searchable={false}
            pagination={false}
            emptyMessage="No products data available"
          />
        </Card>
        <Card title="Revenue by Product" subtitle="Products with highest revenue">
          <Table
            data={[...filteredProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 10)}
            columns={[
              { key: 'product_name' as const, label: 'Product Name', sortable: true },
              { key: 'category' as const, label: 'Category', sortable: true },
              { 
                key: 'revenue' as const, 
                label: 'Revenue', 
                sortable: true,
                render: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              },
            ]}
            loading={loading}
            searchable={false}
            pagination={false}
            emptyMessage="No products data available"
          />
        </Card>
      </div>
    </div>
  );
};

export default Products;
