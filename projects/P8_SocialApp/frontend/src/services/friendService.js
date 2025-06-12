import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const friendService = {
  // Send friend request
  sendFriendRequest: async (receiverId) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.FRIEND_REQUESTS, {
        receiverId: receiverId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (requestId) => {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.FRIEND_REQUESTS}/${requestId}/accept`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (requestId) => {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.FRIEND_REQUESTS}/${requestId}/reject`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel friend request
  cancelFriendRequest: async (requestId) => {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.FRIEND_REQUESTS}/${requestId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get received friend requests
  getReceivedRequests: async (page = 0, size = 20) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FRIEND_REQUESTS}/received?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get sent friend requests
  getSentRequests: async (page = 0, size = 20) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FRIEND_REQUESTS}/sent?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get friends list
  getFriends: async (page = 0, size = 20) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FRIENDS}?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if two users are friends
  checkFriendship: async (userId) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.FRIENDS}/check/${userId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Unfriend a user
  unfriend: async (friendId) => {
    try {
      console.log('friendService.unfriend called with friendId:', friendId);
      const url = `${API_ENDPOINTS.FRIENDS}/${friendId}`;
      console.log('Making DELETE request to:', url);
      const response = await apiService.delete(url);
      console.log('Unfriend API response received:', response);
      return response;
    } catch (error) {
      console.error('Unfriend API error:', error);
      throw error;
    }
  },
};

export default friendService;

