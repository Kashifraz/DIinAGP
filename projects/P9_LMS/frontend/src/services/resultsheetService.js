import api from './api'

const resultsheetService = {
  // Get resultsheet for a specific student in a specific course
  async getResultsheetByCourseAndStudent(courseId, studentId) {
    const response = await api.get(`/resultsheets/courses/${courseId}/resultsheet/student/${studentId}`)
    return response.data
  },

  // Get all resultsheets for a student (across all enrolled courses)
  async getResultsheetsByStudent(studentId) {
    const response = await api.get(`/resultsheets/students/${studentId}`)
    return response.data
  },

  // Get all resultsheets for a course (all students enrolled in the course) - Professor only
  async getResultsheetsByCourse(courseId) {
    const response = await api.get(`/resultsheets/courses/${courseId}`)
    return response.data
  }
}

export default resultsheetService

