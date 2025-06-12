import { apiClient } from '../utils/apiClient'

export const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      })
      
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Login failed')
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on server, clear local state
      throw error
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      
      if (response.data.success) {
        return response.data.data.user
      }
      throw new Error(response.data.message || 'Failed to get user')
    } catch (error) {
      throw error
    }
  },

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @param {string} role - User role (author/admin)
   * @returns {Promise<Object>} User data and token
   */
  async register(email, password, name, role = 'author') {
    try {
      const response = await apiClient.post('/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role
      })
      
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Registration failed')
    } catch (error) {
      throw error
    }
  }
}

