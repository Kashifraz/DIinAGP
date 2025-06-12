import { apiClient } from '../utils/apiClient'

export const postService = {
  /**
   * Get all posts with optional filters
   * @param {Object} params - Query parameters (status, page, limit, tag, search)
   * @returns {Promise<Object>} Posts data with pagination
   */
  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.status) {
        queryParams.append('status', params.status)
      }
      if (params.page) {
        queryParams.append('page', params.page)
      }
      if (params.limit) {
        queryParams.append('limit', params.limit)
      }
      if (params.tag) {
        queryParams.append('tag', params.tag)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }

      const queryString = queryParams.toString()
      const url = `/posts${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch posts')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  async getPost(postId) {
    try {
      const response = await apiClient.get(`/posts/${postId}`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to fetch post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Create new post
   * @param {Object} postData - Post data (title, content, excerpt, status, tags, categoryId, featuredImage)
   * @returns {Promise<Object>} Created post data
   */
  async createPost(postData) {
    try {
      const response = await apiClient.post('/posts', postData)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to create post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Update post
   * @param {string} postId - Post ID
   * @param {Object} postData - Updated post data
   * @returns {Promise<Object>} Updated post data
   */
  async updatePost(postId, postData) {
    try {
      const response = await apiClient.put(`/posts/${postId}`, postData)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to update post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete post
   * @param {string} postId - Post ID
   * @returns {Promise<void>}
   */
  async deletePost(postId) {
    try {
      const response = await apiClient.delete(`/posts/${postId}`)
      
      if (response.data.success) {
        return
      }
      throw new Error(response.data.message || 'Failed to delete post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Publish a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Updated post data
   */
  async publishPost(postId) {
    try {
      const response = await apiClient.patch(`/posts/${postId}/publish`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to publish post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Unpublish a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Updated post data
   */
  async unpublishPost(postId) {
    try {
      const response = await apiClient.patch(`/posts/${postId}/unpublish`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to unpublish post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Preview a post (for authors, even if draft)
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  async previewPost(postId) {
    try {
      const response = await apiClient.get(`/posts/${postId}/preview`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to fetch post preview')
    } catch (error) {
      throw error
    }
  }
}

