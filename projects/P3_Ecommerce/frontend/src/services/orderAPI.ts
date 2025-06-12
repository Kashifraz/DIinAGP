import axios from 'axios';
import { CheckoutRequest, Order, OrderPageResponse, OrderStatistics } from '../types/order';

const API_BASE_URL = 'http://localhost:8080/api/orders';

// Create axios instance with default config
const orderAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
orderAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
orderAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const orderService = {
  // Create order (checkout)
  createOrder: async (checkoutRequest: CheckoutRequest): Promise<Order> => {
    const response = await orderAPI.post('/checkout', checkoutRequest);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: number): Promise<Order> => {
    const response = await orderAPI.get(`/${id}`);
    return response.data;
  },

  // Get order by order number
  getOrderByOrderNumber: async (orderNumber: string): Promise<Order> => {
    const response = await orderAPI.get(`/number/${orderNumber}`);
    return response.data;
  },

  // Get user's orders with pagination
  getMyOrders: async (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc'): Promise<OrderPageResponse> => {
    const response = await orderAPI.get('/my-orders', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Get all orders (admin only)
  getAllOrders: async (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc'): Promise<OrderPageResponse> => {
    const response = await orderAPI.get('/admin/all', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await orderAPI.put(`/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Update payment status (admin only)
  updatePaymentStatus: async (id: number, paymentStatus: string): Promise<Order> => {
    const response = await orderAPI.put(`/${id}/payment-status`, null, {
      params: { paymentStatus }
    });
    return response.data;
  },

  // Update payment intent ID
  updatePaymentIntentId: async (id: number, paymentIntentId: string): Promise<Order> => {
    const response = await orderAPI.put(`/${id}/payment-intent`, null, {
      params: { paymentIntentId }
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: number): Promise<Order> => {
    const response = await orderAPI.put(`/${id}/cancel`);
    return response.data;
  },

  // Get order statistics (admin only)
  getOrderStatistics: async (): Promise<OrderStatistics> => {
    const response = await orderAPI.get('/admin/statistics');
    return response.data;
  },

  // Get total sales (admin only)
  getTotalSales: async (): Promise<{ totalSales: number }> => {
    const response = await orderAPI.get('/admin/total-sales');
    return response.data;
  },

  // Get user's total sales
  getMyTotalSales: async (): Promise<{ totalSales: number }> => {
    const response = await orderAPI.get('/my-total-sales');
    return response.data;
  },
};

export default orderService;
