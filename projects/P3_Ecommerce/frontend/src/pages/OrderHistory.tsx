import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderAPI';
import { Order, OrderStatus, PaymentStatus, OrderPageResponse } from '../types/order';
import { 
  EyeIcon, 
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const pageSize = 10;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: OrderPageResponse = await orderService.getMyOrders(
        currentPage, 
        pageSize, 
        sortBy, 
        sortDir
      );
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDir]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case OrderStatus.PROCESSING:
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case OrderStatus.SHIPPED:
        return <TruckIcon className="h-4 w-4 text-blue-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case OrderStatus.CANCELLED:
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case OrderStatus.PROCESSING:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.SHIPPED:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.DELIVERED:
        return 'text-green-600 bg-green-100';
      case OrderStatus.CANCELLED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'text-green-600 bg-green-100';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-100';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-100';
      case PaymentStatus.REFUNDED:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewOrder = (orderNumber: string) => {
    navigate(`/orders/${orderNumber}`);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="mt-2 text-gray-600">
            View and track your orders
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">
                  <button
                    onClick={() => handleSort('orderNumber')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Order #
                    {sortBy === 'orderNumber' && (
                      <ArrowPathIcon className={`h-3 w-3 ml-1 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Date
                    {sortBy === 'createdAt' && (
                      <ArrowPathIcon className={`h-3 w-3 ml-1 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Status
                    {sortBy === 'status' && (
                      <ArrowPathIcon className={`h-3 w-3 ml-1 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="col-span-2">Items</div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('totalAmount')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Total
                    {sortBy === 'totalAmount' && (
                      <ArrowPathIcon className={`h-3 w-3 ml-1 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                </div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">
                        {order.totalItems} item{order.totalItems !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => handleViewOrder(order.orderNumber)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View order details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === i
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
