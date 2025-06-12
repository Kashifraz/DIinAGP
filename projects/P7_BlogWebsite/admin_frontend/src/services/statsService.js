import { apiClient } from '../utils/apiClient'

export const statsService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getStats() {
    try {
      const response = await apiClient.get('/stats')
      return response.data
    } catch (error) {
      console.error('Get stats error:', error)
      throw error
    }
  }
}

