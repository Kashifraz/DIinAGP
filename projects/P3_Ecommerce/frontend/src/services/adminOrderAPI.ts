import axios from 'axios';
import { 
  AdminOrderFilters, 
  AdminOrderPageResponse, 
  AdminOrderResponse,
  BulkStatusUpdateRequest,
  BulkPaymentStatusUpdateRequest,
  BulkUpdateResponse,
  OrderAnalytics,
  ExportOptions
} from '../types/admin';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const adminOrderAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminOrderAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Order API functions
const adminOrderAPI = {
  // Get all orders with advanced filtering
  getAllOrders: async (filters: AdminOrderFilters = {}): Promise<AdminOrderPageResponse> => {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await adminOrderAxios.get(`/orders/admin/all?${params.toString()}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: number): Promise<AdminOrderResponse> => {
    const response = await adminOrderAxios.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string): Promise<AdminOrderResponse> => {
    const response = await adminOrderAxios.put(`/orders/${orderId}/status?status=${status}`);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (orderId: number, paymentStatus: string): Promise<AdminOrderResponse> => {
    const response = await adminOrderAxios.put(`/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);
    return response.data;
  },

  // Bulk update order status
  bulkUpdateOrderStatus: async (request: BulkStatusUpdateRequest): Promise<BulkUpdateResponse> => {
    const response = await adminOrderAxios.put('/orders/admin/bulk-status', request);
    return response.data;
  },

  // Bulk update payment status
  bulkUpdatePaymentStatus: async (request: BulkPaymentStatusUpdateRequest): Promise<BulkUpdateResponse> => {
    const response = await adminOrderAxios.put('/orders/admin/bulk-payment-status', request);
    return response.data;
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string, page: number = 0, size: number = 10): Promise<AdminOrderPageResponse> => {
    const response = await adminOrderAxios.get(`/orders/admin/by-date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
    return response.data;
  },

  // Get orders by customer
  getOrdersByCustomer: async (customerId: number, page: number = 0, size: number = 10): Promise<AdminOrderPageResponse> => {
    const response = await adminOrderAxios.get(`/orders/admin/by-customer/${customerId}?page=${page}&size=${size}`);
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async (startDate?: string, endDate?: string): Promise<OrderAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await adminOrderAxios.get(`/orders/admin/analytics?${params.toString()}`);
    return response.data;
  },

  // Get order statistics
  getOrderStatistics: async (): Promise<any> => {
    const response = await adminOrderAxios.get('/orders/admin/statistics');
    return response.data;
  },

  // Get total sales
  getTotalSales: async (): Promise<{ totalSales: number }> => {
    const response = await adminOrderAxios.get('/orders/admin/total-sales');
    return response.data;
  },

  // Export orders to CSV
  exportOrders: async (options: ExportOptions = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await adminOrderAxios.get(`/orders/admin/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download CSV file
  downloadCSV: async (blob: Blob, filename: string = 'orders.csv') => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default adminOrderAPI;
