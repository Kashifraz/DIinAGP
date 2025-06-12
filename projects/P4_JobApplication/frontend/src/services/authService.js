import apiClient from '../config/api';

// Authentication service functions
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Extract meaningful error message from server response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Registration failed';
      throw new Error(errorMessage);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Extract meaningful error message from server response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Login failed';
      throw new Error(errorMessage);
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;

