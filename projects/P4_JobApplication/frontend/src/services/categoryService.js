import api from '../config/api';

const categoryService = {
  // Get all categories with optional filters
  getCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.level !== undefined) queryParams.append('level', params.level);
      if (params.parent !== undefined) queryParams.append('parent', params.parent);
      if (params.hierarchy) queryParams.append('hierarchy', 'true');
      
      const response = await api.get(`/categories?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category by ID
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Get category statistics
  getCategoryStats: async () => {
    try {
      const response = await api.get('/categories/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // Create new category (Admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category (Admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category (Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Reorder categories (Admin only)
  reorderCategories: async (categories) => {
    try {
      const response = await api.put('/categories/reorder', { categories });
      return response.data;
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }
};

export default categoryService;
