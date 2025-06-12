import api from './api'

export const contentService = {
  // Module endpoints
  async createModule(courseId, moduleData) {
    const response = await api.post(`/modules/course/${courseId}`, moduleData)
    return response.data
  },

  async getModulesByCourse(courseId) {
    const response = await api.get(`/modules/course/${courseId}`)
    return response.data
  },

  async getModuleById(moduleId) {
    const response = await api.get(`/modules/${moduleId}`)
    return response.data
  },

  async updateModule(moduleId, moduleData) {
    const response = await api.put(`/modules/${moduleId}`, moduleData)
    return response.data
  },

  async deleteModule(moduleId) {
    const response = await api.delete(`/modules/${moduleId}`)
    return response.data
  },

  async reorderModules(courseId, moduleIds) {
    const response = await api.put(`/modules/course/${courseId}/reorder`, { moduleIds })
    return response.data
  },

  // Content endpoints
  async uploadContent(moduleId, formData) {
    const response = await api.post(`/content/module/${moduleId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async addLink(moduleId, linkData) {
    const formData = new FormData()
    formData.append('title', linkData.title)
    formData.append('url', linkData.url)
    if (linkData.description) {
      formData.append('description', linkData.description)
    }
    
    const response = await api.post(`/content/module/${moduleId}/link`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getContentByModule(moduleId) {
    // Validate moduleId before making API call
    if (!moduleId || moduleId === null || moduleId === 'null') {
      throw new Error('Invalid module ID provided')
    }
    const response = await api.get(`/content/module/${moduleId}`)
    return response.data
  },

  async getContentByCourse(courseId) {
    const response = await api.get(`/content/course/${courseId}`)
    return response.data
  },

  async getContentById(contentId) {
    const response = await api.get(`/content/${contentId}`)
    return response.data
  },

  async downloadContent(contentId) {
    const response = await api.get(`/content/${contentId}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    })
    // Return both the blob and response headers for filename extraction
    // Note: response.data is the blob when responseType is 'blob'
    return {
      data: response.data,
      headers: response.headers,
      type: response.headers['content-type'] || response.data.type || 'application/octet-stream'
    }
  },

  async deleteContent(contentId) {
    const response = await api.delete(`/content/${contentId}`)
    return response.data
  },

  async reorderContent(moduleId, contentIds) {
    const response = await api.put(`/content/module/${moduleId}/reorder`, { contentIds })
    return response.data
  }
}

