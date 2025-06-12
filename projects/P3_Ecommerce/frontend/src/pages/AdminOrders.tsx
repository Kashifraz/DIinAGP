import React, { useState, useEffect, useCallback } from 'react';
import { AdminOrderFilters, AdminOrderResponse, OrderAnalytics as OrderAnalyticsType, ExportOptions } from '../types/admin';
import adminOrderAPI from '../services/adminOrderAPI';
import OrderFilters from '../components/admin/OrderFilters';
import OrderTable from '../components/admin/OrderTable';
import OrderAnalyticsComponent from '../components/admin/OrderAnalytics';
import { 
  ArrowDownTrayIcon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [analytics, setAnalytics] = useState<OrderAnalyticsType | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [filters, setFilters] = useState<AdminOrderFilters>({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminOrderAPI.getAllOrders(filters);
      setOrders(response.content);
      setPagination({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        size: response.size
      });
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    try {
      setIsAnalyticsLoading(true);
      const analyticsData = await adminOrderAPI.getOrderAnalytics();
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (showAnalytics) {
      loadAnalytics();
    }
  }, [showAnalytics, loadAnalytics]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: AdminOrderFilters) => {
    setFilters(newFilters);
    setSelectedOrders([]);
  };

  // Handle filter reset
  const handleFiltersReset = () => {
    const resetFilters: AdminOrderFilters = {
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };
    setFilters(resetFilters);
    setSelectedOrders([]);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortDir: prev.sortBy === column && prev.sortDir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle order selection
  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle select all orders
  const handleSelectAllOrders = () => {
    setSelectedOrders(orders.map(order => order.id));
  };

  // Handle deselect all orders
  const handleDeselectAllOrders = () => {
    setSelectedOrders([]);
  };

  // Handle select all
  const handleSelectAll = (shouldSelectAll: boolean) => {
    if (shouldSelectAll) {
      handleSelectAllOrders();
    } else {
      handleDeselectAllOrders();
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await adminOrderAPI.updateOrderStatus(orderId, status);
      await loadOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (orderId: number, paymentStatus: string) => {
    try {
      await adminOrderAPI.updatePaymentStatus(orderId, paymentStatus);
      await loadOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      setError(err.response?.data?.error || 'Failed to update payment status');
    }
  };


  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOrders.length === 0) return;

    try {
      await adminOrderAPI.bulkUpdateOrderStatus({
        orderIds: selectedOrders,
        status
      });
      
      setSelectedOrders([]);
      setBulkAction('');
      setShowBulkActions(false);
      await loadOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error performing bulk status update:', err);
      setError(err.response?.data?.error || 'Failed to perform bulk status update');
    }
  };

  // Handle bulk payment status update
  const handleBulkPaymentStatusUpdate = async (paymentStatus: string) => {
    if (selectedOrders.length === 0) return;

    try {
      await adminOrderAPI.bulkUpdatePaymentStatus({
        orderIds: selectedOrders,
        paymentStatus
      });
      
      setSelectedOrders([]);
      setBulkAction('');
      setShowBulkActions(false);
      await loadOrders(); // Refresh orders
    } catch (err: any) {
      console.error('Error performing bulk payment status update:', err);
      setError(err.response?.data?.error || 'Failed to perform bulk payment status update');
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (selectedOrders.length === 0 || !bulkAction) return;

    if (bulkAction.startsWith('status:')) {
      const status = bulkAction.split(':')[1];
      await handleBulkStatusUpdate(status);
    } else if (bulkAction.startsWith('payment:')) {
      const paymentStatus = bulkAction.split(':')[1];
      await handleBulkPaymentStatusUpdate(paymentStatus);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportOptions: ExportOptions = {
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const blob = await adminOrderAPI.exportOrders(exportOptions);
      const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      adminOrderAPI.downloadCSV(blob, filename);
    } catch (err: any) {
      console.error('Error exporting orders:', err);
      setError(err.response?.data?.error || 'Failed to export orders');
    }
  };

  // Handle view order
  const handleViewOrder = (orderNumber: string) => {
    // Navigate to order details page
    window.open(`/orders/${orderNumber}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Analytics */}
      {showAnalytics && analytics && (
        <OrderAnalyticsComponent 
          analytics={analytics} 
          isLoading={isAnalyticsLoading} 
        />
      )}

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
        isLoading={isLoading}
      />

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
              </span>
              {!showBulkActions && (
                <button
                  onClick={() => setShowBulkActions(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Bulk Actions
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Selection
            </button>
          </div>
          
          {showBulkActions && (
            <div className="mt-4 flex items-center space-x-4">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Action</option>
                <optgroup label="Order Status">
                  <option value="status:PENDING">Mark as Pending</option>
                  <option value="status:PROCESSING">Mark as Processing</option>
                  <option value="status:SHIPPED">Mark as Shipped</option>
                  <option value="status:DELIVERED">Mark as Delivered</option>
                  <option value="status:CANCELLED">Mark as Cancelled</option>
                </optgroup>
                <optgroup label="Payment Status">
                  <option value="payment:PAID">Mark as Paid</option>
                  <option value="payment:FAILED">Mark as Failed</option>
                  <option value="payment:REFUNDED">Mark as Refunded</option>
                </optgroup>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                onClick={() => setShowBulkActions(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium rounded-md hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        selectedOrders={selectedOrders}
        onSelectOrder={handleSelectOrder}
        onSelectAll={handleSelectAll}
        onStatusUpdate={handleStatusUpdate}
        onPaymentStatusUpdate={handlePaymentStatusUpdate}
        onViewOrder={handleViewOrder}
        isLoading={isLoading}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        onSort={handleSort}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{pagination.currentPage * pagination.size + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.totalElements}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={`page-${i}`}
                    onClick={() => handlePageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      i === pagination.currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
