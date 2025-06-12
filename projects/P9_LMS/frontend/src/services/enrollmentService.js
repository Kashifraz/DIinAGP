import api from './api'

export const enrollmentService = {
  async enrollStudent(courseId, studentId) {
    const response = await api.post('/enrollments', null, {
      params: { courseId, studentId }
    })
    return response.data
  },

  async bulkEnrollStudents(courseId, studentIds) {
    const response = await api.post('/enrollments/bulk', {
      courseId,
      studentIds
    })
    return response.data
  },

  async getEnrollmentsByCourse(courseId) {
    const response = await api.get(`/enrollments/course/${courseId}`)
    return response.data
  },

  async getEnrollmentsByStudent(studentId) {
    const response = await api.get(`/enrollments/student/${studentId}`)
    return response.data
  },

  async dropEnrollment(enrollmentId) {
    const response = await api.delete(`/enrollments/${enrollmentId}`)
    return response.data
  },

  async checkEnrollment(courseId, studentId) {
    const response = await api.get('/enrollments/check', {
      params: { courseId, studentId }
    })
    return response.data
  }
}

