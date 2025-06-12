import { apiClient } from '../utils/apiClient'

export const commentService = {
  /**
   * Get approved comments for a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Comments data
   */
  async getPostComments(postId) {
    try {
      const response = await apiClient.get(`/comments/post/${postId}`)
      return response.data
    } catch (error) {
      console.error('Get post comments error:', error)
      throw error
    }
  },

  /**
   * Submit a new comment
   * @param {Object} commentData - Comment data (postId, authorName, authorEmail, content)
   * @returns {Promise<Object>} Created comment
   */
  async submitComment(commentData) {
    try {
      const response = await apiClient.post('/comments', commentData)
      return response.data
    } catch (error) {
      console.error('Submit comment error:', error)
      throw error
    }
  }
}

