import api from './api'

export const courseService = {
  async getAllCourses(params = {}) {
    const response = await api.get('/courses', { params })
    return response.data
  },

  async getCourseById(id) {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  async createCourse(courseData) {
    const response = await api.post('/courses', courseData)
    return response.data
  },

  async updateCourse(id, courseData) {
    const response = await api.put(`/courses/${id}`, courseData)
    return response.data
  },

  async assignProfessor(courseId, professorId) {
    const response = await api.put(`/courses/${courseId}/assign-professor`, null, {
      params: { professorId }
    })
    return response.data
  },

  async getCoursesByMajor(majorId) {
    const response = await api.get(`/courses/major/${majorId}`)
    return response.data
  },

  async getCoursesByProfessor(professorId) {
    const response = await api.get(`/courses/professor/${professorId}`)
    return response.data
  }
}

