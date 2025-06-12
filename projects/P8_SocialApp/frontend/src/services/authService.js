import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Register new user
  register: async (email, password, fullName) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH_REGISTER, {
        email,
        password,
        fullName,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH_LOGIN, {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      // Even if logout fails on server, we still clear local storage
      console.error('Logout error:', error);
    }
  },
};

export default authService;

