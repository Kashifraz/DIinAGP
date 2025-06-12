import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const testService = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.TEST_HEALTH);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Database check
  checkDatabase: async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.TEST_DATABASE);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default testService;

