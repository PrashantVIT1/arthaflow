import React, { useState, useEffect } from 'react';
import { ordersApi, PaginatedOrdersResponse } from '../services/api';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import HeaderActions from '../components/ui/HeaderActions';
import Pagination from '../components/ui/Pagination';
import { RefreshCw, Download, Package } from 'lucide-react';
import { exportToCSV, generateFilename } from '../utils/export';

const Orders: React.FC = () => {
  const [paginatedData, setPaginatedData] = useState<PaginatedOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async (page: number = currentPage, size: number = rowsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getAll(page, size);
      setPaginatedData(data);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen for ETL completion event to refresh data
    const handleETLCompleted = () => {
      fetchOrders();
    };

    window.addEventListener('etl-completed', handleETLCompleted);

    return () => {
      window.removeEventListener('etl-completed', handleETLCompleted);
    };
  }, []);

  const handleExport = async () => {
    try {
      // Fetch all orders for export (not just current page)
      const allData = await ordersApi.getAll(1, 10000);
      const headers = ['S.No.', 'Order Number', 'Customer ID', 'Product ID', 'Quantity', 'Unit Price', 'Total Amount', 'Order Date', 'Status', 'Region'];
      const rows = allData.items.map((order, index) => [
        index + 1,
        order.order_number,
        order.customer_id,
        order.product_id,
        order.quantity,
        order.unit_price.toFixed(2),
        order.total_amount.toFixed(2),
        new Date(order.order_date).toLocaleDateString(),
        order.status,
        order.region || '-'
      ]);

      const filename = generateFilename('orders', 'csv');
      exportToCSV({ headers, rows }, filename);
    } catch (err) {
      console.error('Error exporting orders:', err);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, rowsPerPage);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
    fetchOrders(1, rows);
  };

  if (loading && !paginatedData) {
    return <Loading text="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage imported customer orders</p>
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
              onClick: () => fetchOrders(currentPage, rowsPerPage),
              loading,
            },
          ]}
          className="w-full sm:w-auto"
        />
      </div>

      {!paginatedData || paginatedData.items.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-sm sm:text-base text-gray-600">There are no orders to display. Import data to get started.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">S.No.</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Number</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product ID</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Total Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Region</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.items.map((order, index) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.customer_id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.product_id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">{order.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">${order.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right">${order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{order.region || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.total_pages}
            totalItems={paginatedData.total_elements}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            itemName="Orders"
          />
        </Card>
      )}
    </div>
  );
};

export default Orders;
