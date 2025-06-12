import { apiClient } from '../utils/apiClient'

export const commentService = {
  /**
   * Get all comments with optional filters
   * @param {Object} params - Query parameters (status, postId, page, limit)
   * @returns {Promise<Object>} Comments data with pagination
   */
  async getComments(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) {
        queryParams.append('status', params.status)
      }
      if (params.postId) {
        queryParams.append('postId', params.postId)
      }
      if (params.page) {
        queryParams.append('page', params.page)
      }
      if (params.limit) {
        queryParams.append('limit', params.limit)
      }

      const queryString = queryParams.toString()
      const url = `/comments${queryString ? `?${queryString}` : ''}`
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Get comments error:', error)
      throw error
    }
  },

  /**
   * Approve a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Updated comment
   */
  async approveComment(commentId) {
    try {
      const response = await apiClient.put(`/comments/${commentId}/approve`)
      return response.data
    } catch (error) {
      console.error('Approve comment error:', error)
      throw error
    }
  },

  /**
   * Reject a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Updated comment
   */
  async rejectComment(commentId) {
    try {
      const response = await apiClient.put(`/comments/${commentId}/reject`)
      return response.data
    } catch (error) {
      console.error('Reject comment error:', error)
      throw error
    }
  }
}

