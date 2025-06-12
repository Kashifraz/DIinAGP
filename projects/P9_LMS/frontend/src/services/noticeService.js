import api from './api'

export default {
  // Create a new notice (Coordinator only)
  async createNotice(noticeData) {
    const response = await api.post('/notices', noticeData)
    return response.data
  },

  // Get all published notices (All users)
  async getAllNotices() {
    const response = await api.get('/notices')
    return response.data
  },

  // Get all notices for coordinator (Coordinator only)
  async getAllNoticesForCoordinator() {
    const response = await api.get('/notices/coordinator')
    return response.data
  },

  // Get notice by ID
  async getNoticeById(id) {
    const response = await api.get(`/notices/${id}`)
    return response.data
  },

  // Update notice (Coordinator only)
  async updateNotice(id, noticeData) {
    const response = await api.put(`/notices/${id}`, noticeData)
    return response.data
  },

  // Delete notice (Coordinator only)
  async deleteNotice(id) {
    await api.delete(`/notices/${id}`)
  },

  // Publish notice (Coordinator only)
  async publishNotice(id) {
    const response = await api.put(`/notices/${id}/publish`)
    return response.data
  },

  // Mark notice as read
  async markAsRead(id) {
    await api.post(`/notices/${id}/read`)
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notices/unread/count')
    return response.data
  }
}

