import React from 'react';
import { DashboardKPI } from '../services/api';
import { DollarSign, Package, Users, Tag, TrendingUp, Percent } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPI;
  loading?: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ kpis, loading = false }) => {
  const kpiData = [
    {
      title: 'Total Revenue',
      value: kpis.total_revenue,
      format: 'currency',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: kpis.total_orders,
      format: 'number',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Customers',
      value: kpis.total_customers,
      format: 'number',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Products',
      value: kpis.total_products,
      format: 'number',
      icon: Tag,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Profit',
      value: kpis.total_profit,
      format: 'currency',
      icon: TrendingUp,
      color: 'bg-teal-500',
    },
    {
      title: 'Profit Margin',
      value: kpis.profit_margin,
      format: 'percentage',
      icon: Percent,
      color: 'bg-pink-500',
    },
  ] as const;

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
      default:
        return value.toLocaleString('en-US');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
            <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center text-white`}>
              <kpi.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
