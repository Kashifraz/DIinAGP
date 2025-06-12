import React from 'react';
import { OrderAnalytics } from '../../types/admin';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface OrderAnalyticsProps {
  analytics: OrderAnalytics;
  isLoading?: boolean;
}

const OrderAnalyticsComponent: React.FC<OrderAnalyticsProps> = ({ analytics, isLoading = false }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: ClockIcon,
      PROCESSING: ChartBarIcon,
      SHIPPED: TruckIcon,
      DELIVERED: HomeIcon,
      CANCELLED: XCircleIcon,
      PAID: CheckCircleIcon,
      FAILED: XCircleIcon,
      REFUNDED: XCircleIcon
    };
    const Icon = icons[status as keyof typeof icons] || ChartBarIcon;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      PROCESSING: 'text-blue-600 bg-blue-100',
      SHIPPED: 'text-purple-600 bg-purple-100',
      DELIVERED: 'text-green-600 bg-green-100',
      CANCELLED: 'text-red-600 bg-red-100',
      PAID: 'text-green-600 bg-green-100',
      FAILED: 'text-red-600 bg-red-100',
      REFUNDED: 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={`skeleton-${item}`} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { label: 'Pending', value: analytics.pendingOrders, status: 'PENDING' },
    { label: 'Processing', value: analytics.processingOrders, status: 'PROCESSING' },
    { label: 'Shipped', value: analytics.shippedOrders, status: 'SHIPPED' },
    { label: 'Delivered', value: analytics.deliveredOrders, status: 'DELIVERED' },
    { label: 'Cancelled', value: analytics.cancelledOrders, status: 'CANCELLED' }
  ];

  const paymentStatusData = [
    { label: 'Paid', value: analytics.paidOrders, status: 'PAID' },
    { label: 'Pending Payment', value: analytics.pendingPaymentOrders, status: 'PENDING' },
    { label: 'Failed', value: analytics.failedPaymentOrders, status: 'FAILED' },
    { label: 'Refunded', value: analytics.refundedOrders, status: 'REFUNDED' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.totalOrders)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(analytics.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(analytics.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Paid Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(analytics.paidOrders)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {orderStatusData.map((item) => (
            <div key={item.status} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(item.status)} mb-2`}>
                {getStatusIcon(item.status)}
              </div>
              <p className="text-sm font-medium text-gray-900">{formatNumber(item.value)}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentStatusData.map((item) => (
            <div key={item.status} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(item.status)} mb-2`}>
                {getStatusIcon(item.status)}
              </div>
              <p className="text-sm font-medium text-gray-900">{formatNumber(item.value)}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{formatPrice(analytics.totalRevenue)}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{formatPrice(analytics.totalTax)}</p>
            <p className="text-sm text-gray-500">Total Tax</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{formatPrice(analytics.totalShipping)}</p>
            <p className="text-sm text-gray-500">Total Shipping</p>
          </div>
        </div>
      </div>

      {/* Period Information */}
      {(analytics.periodStart || analytics.periodEnd) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Period</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {analytics.periodStart && (
              <div>
                <span className="font-medium">From:</span> {new Date(analytics.periodStart).toLocaleDateString()}
              </div>
            )}
            {analytics.periodEnd && (
              <div>
                <span className="font-medium">To:</span> {new Date(analytics.periodEnd).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAnalyticsComponent;
