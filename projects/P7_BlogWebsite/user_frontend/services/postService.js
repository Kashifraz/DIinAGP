import { apiClient } from '../utils/apiClient'

export const postService = {
  /**
   * Get all published posts (public endpoint)
   * @param {Object} params - Query parameters (page, limit, category, tag, search)
   * @returns {Promise<Object>} Posts data with pagination
   */
  async getPublishedPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.page) {
        queryParams.append('page', params.page)
      }
      if (params.limit) {
        queryParams.append('limit', params.limit)
      }
      if (params.category) {
        queryParams.append('category', params.category)
      }
      if (params.tag) {
        queryParams.append('tag', params.tag)
      }
      if (params.search) {
        queryParams.append('search', params.search)
      }

      const queryString = queryParams.toString()
      const url = `/posts/public${queryString ? `?${queryString}` : ''}`
      
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
   * Get single published post by slug (public endpoint)
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} Post data
   */
  async getPublishedPostBySlug(slug) {
    try {
      const response = await apiClient.get(`/posts/public/${slug}`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to fetch post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single published post by slug without incrementing view count
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} Post data
   */
  async getPublishedPostBySlugWithoutIncrement(slug) {
    try {
      const response = await apiClient.get(`/posts/public/${slug}?noIncrement=true`)
      
      if (response.data.success) {
        return response.data.data.post
      }
      throw new Error(response.data.message || 'Failed to fetch post')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get featured published posts (public endpoint)
   * @returns {Promise<Object>} Featured posts data
   */
  async getFeaturedPosts() {
    try {
      const response = await apiClient.get('/posts/public/featured')
      
      if (response.data.success) {
        return response.data.data.posts
      }
      throw new Error(response.data.message || 'Failed to fetch featured posts')
    } catch (error) {
      throw error
    }
  },

  /**
   * Search published posts
   * @param {Object} params - Query parameters (q, page, limit, tag, category)
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.q) {
        queryParams.append('q', params.q)
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
      if (params.category) {
        queryParams.append('category', params.category)
      }

      const queryString = queryParams.toString()
      const url = `/posts/search${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get(url)
      
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to search posts')
    } catch (error) {
      throw error
    }
  }
}

export const categoryService = {
  /**
   * Get all categories (public endpoint)
   * @returns {Promise<Array>} Categories array
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/categories/public')
      
      if (response.data.success) {
        return response.data.data.categories
      }
      throw new Error(response.data.message || 'Failed to fetch categories')
    } catch (error) {
      throw error
    }
  }
}

