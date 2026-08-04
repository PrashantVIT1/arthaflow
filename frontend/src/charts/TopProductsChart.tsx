import React from 'react';
import { TopProduct } from '../services/api';
import Card from '../components/ui/Card';

interface TopProductsChartProps {
  data: TopProduct[];
  loading?: boolean;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, loading = false }) => {
  // Sort by quantity_sold descending and take top 10
  const sortedData = [...data].sort((a, b) => b.quantity_sold - a.quantity_sold).slice(0, 10);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 sm:h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <Card title="Top 10 Products Sold" subtitle="Best-selling products by quantity">
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-sm sm:text-base">No product sales available.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Top 10 Products Sold" subtitle="Best-selling products by quantity">
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">Category</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Qty</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">Revenue</th>
              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">Profit</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((product, index) => (
              <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-2 sm:mr-3 text-xs sm:text-sm">
                      #{index + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{product.product_name}</span>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{product.category}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 text-right">{product.quantity_sold.toLocaleString()}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 text-right">
                  ${product.revenue.toLocaleString()}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-green-600 text-right hidden sm:table-cell">
                  ${product.profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TopProductsChart;
