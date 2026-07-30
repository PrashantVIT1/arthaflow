import React, { useState, useEffect } from 'react';
import { ordersApi, Order } from '../services/api';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { RefreshCw, Download, Package } from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getAll();
      setOrders(data);
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
      await ordersApi.exportOrders();
    } catch (err) {
      console.error('Error exporting orders:', err);
    }
  };

  if (loading && orders.length === 0) {
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
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all orders</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">There are no orders to display. Import data to get started.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
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
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
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
        </Card>
      )}
    </div>
  );
};

export default Orders;
