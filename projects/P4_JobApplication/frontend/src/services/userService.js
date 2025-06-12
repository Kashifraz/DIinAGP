import api from '../config/api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to upload profile picture';
      throw new Error(errorMessage);
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update password';
      throw new Error(errorMessage);
    }
  },
};

export default userService;

