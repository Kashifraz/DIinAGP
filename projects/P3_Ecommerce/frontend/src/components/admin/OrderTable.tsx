import React, { useState } from 'react';
import { AdminOrderResponse, OrderTableColumn } from '../../types/admin';
import { 
  EyeIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface OrderTableProps {
  orders: AdminOrderResponse[];
  selectedOrders: number[];
  onSelectOrder: (orderId: number) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusUpdate: (orderId: number, status: string) => void;
  onPaymentStatusUpdate: (orderId: number, paymentStatus: string) => void;
  onViewOrder: (orderNumber: string) => void;
  isLoading?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

// SortButton component moved outside
const SortButton: React.FC<{ 
  column: string; 
  children: React.ReactNode; 
  sortBy?: string; 
  sortDir?: 'asc' | 'desc'; 
  onSort?: (column: string) => void; 
}> = ({ column, children, sortBy, sortDir, onSort }) => (
  <button
    onClick={() => onSort?.(column)}
    className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700"
  >
    <span>{children}</span>
    {sortBy === column && (
      sortDir === 'asc' ? 
        <ChevronUpIcon className="h-4 w-4" /> : 
        <ChevronDownIcon className="h-4 w-4" />
    )}
  </button>
);

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onViewOrder,
  isLoading = false,
  sortBy,
  sortDir,
  onSort
}) => {
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

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

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    onStatusUpdate(orderId, newStatus);
    setEditingOrder(null);
    setEditingField(null);
  };

  const handlePaymentStatusChange = (orderId: number, newStatus: string) => {
    onPaymentStatusUpdate(orderId, newStatus);
    setEditingOrder(null);
    setEditingField(null);
  };

  const columns: OrderTableColumn[] = [
    { key: 'id', label: 'Select', width: 'w-12' },
    { key: 'orderNumber', label: 'Order #', sortable: true, width: 'w-32' },
    { key: 'userEmail', label: 'Customer', sortable: true, width: 'w-48' },
    { key: 'totalAmount', label: 'Total', sortable: true, width: 'w-24' },
    { key: 'status', label: 'Status', sortable: true, width: 'w-32' },
    { key: 'paymentStatus', label: 'Payment', sortable: true, width: 'w-32' },
    { key: 'createdAt', label: 'Date', sortable: true, width: 'w-40' }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              {columns.slice(1).map((column) => (
                <th key={column.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width}`}>
                  {column.sortable ? (
                    <SortButton 
                      column={column.key}
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={onSort}
                    >
                      {column.label}
                    </SortButton>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => onSelectOrder(order.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.userEmail}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingOrder === order.id && editingField === 'status' ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => {
                          setEditingOrder(order.id);
                          setEditingField('status');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingOrder === order.id && editingField === 'paymentStatus' ? (
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <button
                        onClick={() => {
                          setEditingOrder(order.id);
                          setEditingField('paymentStatus');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewOrder(order.orderNumber)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Order"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
