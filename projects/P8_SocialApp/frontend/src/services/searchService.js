import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const searchService = {
  // Search users by name or email
  searchUsers: async (query, page = 0, size = 20) => {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      const response = await apiService.get(
        `${API_ENDPOINTS.SEARCH_USERS}?query=${encodeURIComponent(query.trim())}&page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default searchService;

