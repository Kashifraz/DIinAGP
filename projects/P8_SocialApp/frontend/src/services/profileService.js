import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './apiService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export const profileService = {
  // Get current user profile
  getCurrentProfile: async () => {
    try {
      const response = await apiService.get(API_ENDPOINTS.USER_ME);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USER_PROFILE}/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (bio, fullName, occupation, relationshipStatus, hobbies) => {
    try {
      const data = {};
      // Only include fields that are explicitly provided (not undefined)
      // null values are allowed to clear fields
      if (bio !== undefined) data.bio = bio;
      if (fullName !== undefined) data.fullName = fullName;
      if (occupation !== undefined) data.occupation = occupation;
      if (relationshipStatus !== undefined) data.relationshipStatus = relationshipStatus;
      if (hobbies !== undefined) data.hobbies = hobbies;
      
      console.log('Sending profile update data:', data);
      
      const response = await apiService.put(API_ENDPOINTS.USER_ME, data);
      
      console.log('Profile update API response:', response);
      
      return response;
    } catch (error) {
      console.error('Profile update API error:', error);
      throw error;
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (imageUri) => {
    try {
      const formData = new FormData();
      
      // Handle web vs mobile differently
      if (Platform.OS === 'web') {
        // For web, imageUri is a data URL (data:image/...)
        // Convert data URL to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        // Determine file extension from blob type
        const extension = blob.type.includes('png') ? 'png' : 'jpg';
        const filename = `profile_${Date.now()}.${extension}`;
        
        // Append blob to FormData
        formData.append('file', blob, filename);
      } else {
        // For mobile platforms
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const extension = match ? match[1].toLowerCase() : 'jpg';
        const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

        // Handle URI for different platforms
        let uri = imageUri;
        if (Platform.OS === 'ios') {
          // iOS needs file:// prefix removed
          uri = imageUri.replace('file://', '');
        } else if (Platform.OS === 'android') {
          // Android keeps the file:// prefix
          uri = imageUri;
        }

        // Append file to FormData
        formData.append('file', {
          uri: uri,
          name: `profile_${Date.now()}.${extension}`,
          type: mimeType,
        });
      }

      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Make the request
      // Note: Don't set Content-Type header - let axios set it automatically with boundary
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.USER_ME}/profile-photo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Let axios set Content-Type with boundary automatically
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to upload photo');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to upload photo');
      }
    }
  },
};

export default profileService;

