import api from './api'

export const majorService = {
  async getAllMajors() {
    const response = await api.get('/majors')
    return response.data
  },

  async getMajorById(id) {
    const response = await api.get(`/majors/${id}`)
    return response.data
  },

  async createMajor(majorData) {
    const response = await api.post('/majors', majorData)
    return response.data
  },

  async updateMajor(id, majorData) {
    const response = await api.put(`/majors/${id}`, majorData)
    return response.data
  },

  async deleteMajor(id) {
    const response = await api.delete(`/majors/${id}`)
    return response.data
  }
}

