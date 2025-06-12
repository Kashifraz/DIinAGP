import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const reactionService = {
  // Add or update reaction on a post
  addReaction: async (postId, reactionType) => {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.POSTS}/${postId}/reactions`,
        { reactionType }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove reaction from a post
  removeReaction: async (postId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.POSTS}/${postId}/reactions`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reaction counts for a post
  getReactionCounts: async (postId) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.POSTS}/${postId}/reactions`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default reactionService;

