import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const commentService = {
  // Get comments for a post
  getComments: async (postId, page = 0, size = 20) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.POSTS}/${postId}/comments?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create a comment on a post
  createComment: async (postId, content, parentCommentId = null) => {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.POSTS}/${postId}/comments`,
        {
          content,
          parentCommentId,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create a reply to a comment
  createReply: async (commentId, content) => {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.COMMENTS}/${commentId}/replies`,
        {
          content,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get a single comment by ID
  getCommentById: async (commentId) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.COMMENTS}/${commentId}`,
        {
          content,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add/update reaction on a comment
  addReaction: async (commentId, reactionType) => {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.COMMENTS}/${commentId}/reactions`,
        { reactionType }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove reaction from a comment
  removeReaction: async (commentId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}/reactions`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reaction counts for a comment
  getReactionCounts: async (commentId) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.COMMENTS}/${commentId}/reactions`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default commentService;

