import { Platform } from 'react-native';
import apiService from './apiService';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const postService = {
  // Create a new post
  createPost: async (content) => {
    try {
      const response = await apiService.post(API_ENDPOINTS.POSTS, { content });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get posts feed (posts from friends)
  getPostsFeed: async (page = 0, size = 20) => {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.POSTS}?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get post by ID
  getPostById: async (postId) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.POSTS}/${postId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update post
  updatePost: async (postId, content) => {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.POSTS}/${postId}`, { content });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete post
  deletePost: async (postId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.POSTS}/${postId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload images for a post
  uploadPostImages: async (postId, imageFiles) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      
      // Handle both single file and array of files
      const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        
        // Handle different file formats (web vs mobile)
        if (Platform.OS === 'web') {
          // Web: file might be a File object or data URL
          if (file instanceof File) {
            formData.append('images', file);
          } else if (typeof file === 'string' && file.startsWith('data:')) {
            // Convert data URL to Blob
            const response = await fetch(file);
            const blob = await response.blob();
            formData.append('images', blob, `image_${index}.jpg`);
          } else if (file.uri) {
            // Handle expo-image-picker result on web
            const response = await fetch(file.uri);
            const blob = await response.blob();
            formData.append('images', blob, file.filename || `image_${index}.jpg`);
          }
        } else {
          // Mobile: file is a URI string (expo-image-picker result)
          const uri = file.uri || file;
          const filename = file.filename || `image_${index}.jpg`;
          const type = file.type || 'image/jpeg';
          
          formData.append('images', {
            uri: uri,
            type: type,
            name: filename,
          });
        }
      }

      // Use API_BASE_URL directly - it already includes /api
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.POSTS}/${postId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a post image
  deletePostImage: async (imageId) => {
    try {
      const response = await apiService.delete(`${API_ENDPOINTS.POSTS}/images/${imageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get post image URL
  getPostImageUrl: (imageUrl) => {
    if (!imageUrl) return null;
    
    // Extract filename (handle both full path and filename)
    let filename = imageUrl.trim();
    if (filename.includes('/')) {
      filename = filename.split('/').pop();
    }
    if (filename.includes('\\')) {
      filename = filename.split('\\').pop();
    }
    
    const encodedFilename = encodeURIComponent(filename);
    // API_BASE_URL already includes /api, so just append the media path
    return `${API_BASE_URL}/media/post-image/${encodedFilename}`;
  },
};

export default postService;

