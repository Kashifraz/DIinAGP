import api from '../config/api';

const adminService = {
  // Get all users with filters
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.role) queryParams.append('role', params.role);
      if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified);
      if (params.verificationBadge !== undefined) queryParams.append('verificationBadge', params.verificationBadge);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Failed to fetch users';
      throw new Error(errorMessage);
    }
  },

  // Toggle user verification
  toggleUserVerification: async (userId) => {
    try {
      const response = await api.put(`/admin/users/${userId}/verify`);
      return response.data;
    } catch (error) {
      console.error('Error toggling user verification:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle verification';
      throw new Error(errorMessage);
    }
  },

  // Update user concern/notes
  updateUserConcern: async (userId, concern) => {
    try {
      const response = await api.put(`/admin/users/${userId}/concern`, { concern });
      return response.data;
    } catch (error) {
      console.error('Error updating user concern:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update concern';
      throw new Error(errorMessage);
    }
  },

  // Get pending users (for backward compatibility)
  getPendingUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/admin/users/pending?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch pending users';
      throw new Error(errorMessage);
    }
  },

  // Get verification stats
  getVerificationStats: async () => {
    try {
      const response = await api.get('/admin/verification-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stats';
      throw new Error(errorMessage);
    }
  },
};

export default adminService;

