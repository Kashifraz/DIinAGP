import api from './api'

export const userService = {
  async getAllUsers(params = {}) {
    const response = await api.get('/users', { params })
    return response.data
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  async searchUsers(query, params = {}) {
    const response = await api.get('/users', {
      params: { search: query, ...params }
    })
    return response.data
  },

  async getUsersByRole(role, params = {}) {
    const response = await api.get('/users', {
      params: { role, ...params }
    })
    return response.data
  }
}

