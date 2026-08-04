import React, { memo } from 'react';
import { DashboardKPI } from '../services/api';
import { DollarSign, Package, Users, Tag, TrendingUp, Percent } from 'lucide-react';

interface KPICardsProps {
  kpis: DashboardKPI;
  loading?: boolean;
}

const KPICards: React.FC<KPICardsProps> = memo(({ kpis, loading = false }) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[120px] sm:min-h-[140px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">{kpi.title}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${kpi.color} rounded-lg flex items-center justify-center text-white ml-2 sm:ml-3 flex-shrink-0`}>
              <kpi.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default KPICards;
