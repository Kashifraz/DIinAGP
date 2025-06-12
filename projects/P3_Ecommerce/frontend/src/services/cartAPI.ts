import axios from 'axios';
import { CartItem, CartSummary, AddToCartRequest } from '../types/cart';

const API_BASE_URL = 'http://localhost:8080/api/cart';

// Create axios instance with default config
const cartAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
cartAPI.interceptors.request.use(
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
cartAPI.interceptors.response.use(
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

export const cartService = {
  // Add item to cart
  addToCart: async (request: AddToCartRequest): Promise<CartItem> => {
    const response = await cartAPI.post('/items', request);
    return response.data;
  },

  // Get all cart items
  getCartItems: async (): Promise<CartItem[]> => {
    const response = await cartAPI.get('/items');
    return response.data;
  },

  // Get cart summary
  getCartSummary: async (): Promise<CartSummary> => {
    const response = await cartAPI.get('/summary');
    return response.data;
  },

  // Update cart item quantity
  updateQuantity: async (productId: number, quantity: number): Promise<CartItem> => {
    const response = await cartAPI.put(`/items/${productId}?quantity=${quantity}`);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId: number): Promise<void> => {
    await cartAPI.delete(`/items/${productId}`);
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await cartAPI.delete('/clear');
  },

  // Get cart item count
  getCartItemCount: async (): Promise<number> => {
    const response = await cartAPI.get('/count');
    return response.data;
  },

  // Get cart total quantity
  getCartTotalQuantity: async (): Promise<number> => {
    const response = await cartAPI.get('/total-quantity');
    return response.data;
  },

  // Check if cart is empty
  isCartEmpty: async (): Promise<boolean> => {
    const response = await cartAPI.get('/empty');
    return response.data;
  },

  // Check if product is in cart
  isProductInCart: async (productId: number): Promise<boolean> => {
    const response = await cartAPI.get(`/contains/${productId}`);
    return response.data;
  },

  // Get specific cart item
  getCartItem: async (productId: number): Promise<CartItem | null> => {
    try {
      const response = await cartAPI.get(`/items/${productId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Test endpoint
  testConnection: async (): Promise<string> => {
    const response = await cartAPI.get('/test');
    return response.data;
  },
};

export default cartService;
