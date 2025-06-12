import { apiClient } from '../utils/apiClient'

export const categoryService = {
  /**
   * Get all categories with optional filters
   * @param {Object} params - Query parameters (page, limit, search)
   * @returns {Promise<Object>} Categories data with pagination
   */
  async getCategories(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) {
        queryParams.append('page', params.page)
      }
      if (params.limit) {
        queryParams.append('limit', params.limit)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }

      const queryString = queryParams.toString()
      const url = `/categories${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch categories')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Category data
   */
  async getCategory(categoryId) {
    try {
      const response = await apiClient.get(`/categories/${categoryId}`)
      
      if (response.data.success) {
        return response.data.data.category
      }
      throw new Error(response.data.message || 'Failed to fetch category')
    } catch (error) {
      throw error
    }
  },

  /**
   * Create new category
   * @param {Object} categoryData - Category data (name, description, slug)
   * @returns {Promise<Object>} Created category data
   */
  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData)
      
      if (response.data.success) {
        return response.data.data.category
      }
      throw new Error(response.data.message || 'Failed to create category')
    } catch (error) {
      throw error
    }
  },

  /**
   * Update category
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category data
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${categoryId}`, categoryData)
      
      if (response.data.success) {
        return response.data.data.category
      }
      throw new Error(response.data.message || 'Failed to update category')
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete category
   * @param {string} categoryId - Category ID
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId) {
    try {
      const response = await apiClient.delete(`/categories/${categoryId}`)
      
      if (response.data.success) {
        return
      }
      throw new Error(response.data.message || 'Failed to delete category')
    } catch (error) {
      throw error
    }
  }
}

