import { apiClient } from '../utils/apiClient'

export const mediaService = {
  /**
   * Upload media file
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} Uploaded media data
   */
  async uploadFile(file, onProgress) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        }
      })

      if (response.data.success) {
        return response.data.data.media
      }
      throw new Error(response.data.message || 'Failed to upload file')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get all media with optional filters
   * @param {Object} params - Query parameters (page, limit, mimeType)
   * @returns {Promise<Object>} Media data with pagination
   */
  async getMedia(params = {}) {
    try {
      const queryParams = new URLSearchParams()

      if (params.page) {
        queryParams.append('page', params.page)
      }
      if (params.limit) {
        queryParams.append('limit', params.limit)
      }
      if (params.mimeType) {
        queryParams.append('mimeType', params.mimeType)
      }

      const queryString = queryParams.toString()
      const url = `/media${queryString ? `?${queryString}` : ''}`

      const response = await apiClient.get(url)

      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch media')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get single media by ID
   * @param {string} mediaId - Media ID
   * @returns {Promise<Object>} Media data
   */
  async getMediaById(mediaId) {
    try {
      const response = await apiClient.get(`/media/${mediaId}`)

      if (response.data.success) {
        return response.data.data.media
      }
      throw new Error(response.data.message || 'Failed to fetch media')
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete media
   * @param {string} mediaId - Media ID
   * @returns {Promise<void>}
   */
  async deleteMedia(mediaId) {
    try {
      const response = await apiClient.delete(`/media/${mediaId}`)

      if (response.data.success) {
        return
      }
      throw new Error(response.data.message || 'Failed to delete media')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get full URL for media file
   * @param {string} url - Relative URL from media object
   * @returns {string} Full URL
   */
  getMediaUrl(url) {
    if (!url) return ''
    
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Otherwise, prepend API base URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    const apiBase = baseURL.replace('/api', '')
    return `${apiBase}${url.startsWith('/') ? url : '/' + url}`
  }
}

