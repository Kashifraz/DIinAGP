import api from './api'

export const gradeService = {
  async gradeSubmission(submissionId, gradeData) {
    const response = await api.post(`/grades/submissions/${submissionId}/grade`, gradeData)
    return response.data
  },

  async updateGrade(gradeId, gradeData) {
    const response = await api.put(`/grades/${gradeId}`, gradeData)
    return response.data
  },

  async getGradesByAssessment(assessmentId) {
    const response = await api.get(`/grades/assessments/${assessmentId}/grades`)
    return response.data
  },

  async getGradesByCourseAndStudent(courseId, studentId) {
    const response = await api.get(`/grades/courses/${courseId}/grades/student/${studentId}`)
    return response.data
  },

  async getGradesByCourse(courseId) {
    const response = await api.get(`/grades/courses/${courseId}/grades`)
    return response.data
  },

  async getCourseGrade(courseId, studentId) {
    const response = await api.get(`/grades/courses/${courseId}/course-grade/student/${studentId}`)
    return response.data
  },

  async calculateCourseGrade(courseId, studentId) {
    const response = await api.post(`/grades/courses/${courseId}/calculate-grade/student/${studentId}`)
    return response.data
  }
}

