import axios from 'axios';
import { 
  PaymentIntentRequest, 
  PaymentIntentResponse, 
  StripeConfig, 
  CreateCustomerRequest, 
  CreateCustomerResponse 
} from '../types/payment';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const paymentAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
paymentAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Payment API functions
export const paymentAPI = {
  // Get Stripe configuration
  getStripeConfig: async (): Promise<StripeConfig> => {
    const response = await paymentAxios.get('/payments/config');
    return response.data;
  },

  // Create payment intent
  createPaymentIntent: async (request: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
    const response = await paymentAxios.post('/payments/create-payment-intent', request);
    return response.data;
  },

  // Confirm payment intent
  confirmPaymentIntent: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    const response = await paymentAxios.post(`/payments/confirm-payment-intent/${paymentIntentId}`);
    return response.data;
  },

  // Get payment intent
  getPaymentIntent: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    const response = await paymentAxios.get(`/payments/payment-intent/${paymentIntentId}`);
    return response.data;
  },

  // Cancel payment intent
  cancelPaymentIntent: async (paymentIntentId: string): Promise<PaymentIntentResponse> => {
    const response = await paymentAxios.post(`/payments/cancel-payment-intent/${paymentIntentId}`);
    return response.data;
  },

  // Create Stripe customer
  createCustomer: async (request: CreateCustomerRequest): Promise<CreateCustomerResponse> => {
    const response = await paymentAxios.post('/payments/create-customer', request);
    return response.data;
  },

  // Create payment intent for order
  createPaymentIntentForOrder: async (orderNumber: string): Promise<PaymentIntentResponse> => {
    const response = await paymentAxios.post(`/orders/${orderNumber}/payment-intent`);
    return response.data;
  },
};

export default paymentAPI;
