import api from './api'

export const assessmentService = {
  // Assessment endpoints
  async createAssessment(courseId, assessmentData) {
    const response = await api.post(`/assessments/course/${courseId}`, assessmentData)
    return response.data
  },

  async getAssessmentsByCourse(courseId) {
    const response = await api.get(`/assessments/course/${courseId}`)
    return response.data
  },

  async getAssessmentById(assessmentId) {
    const response = await api.get(`/assessments/${assessmentId}`)
    return response.data
  },

  async updateAssessment(assessmentId, assessmentData) {
    const response = await api.put(`/assessments/${assessmentId}`, assessmentData)
    return response.data
  },

  async deleteAssessment(assessmentId) {
    const response = await api.delete(`/assessments/${assessmentId}`)
    return response.data
  },

  async publishAssessment(assessmentId) {
    const response = await api.put(`/assessments/${assessmentId}/publish`)
    return response.data
  },

  async closeAssessment(assessmentId) {
    const response = await api.put(`/assessments/${assessmentId}/close`)
    return response.data
  },

  async validateWeights(courseId) {
    const response = await api.get(`/assessments/course/${courseId}/validate-weights`)
    return response.data
  },

  // Question endpoints
  async addQuestion(assessmentId, questionData) {
    const response = await api.post(`/questions/assessment/${assessmentId}`, questionData)
    return response.data
  },

  async getQuestionsByAssessment(assessmentId) {
    const response = await api.get(`/questions/assessment/${assessmentId}`)
    return response.data
  },

  async getQuestionById(questionId) {
    const response = await api.get(`/questions/${questionId}`)
    return response.data
  },

  async updateQuestion(questionId, questionData) {
    const response = await api.put(`/questions/${questionId}`, questionData)
    return response.data
  },

  async deleteQuestion(questionId) {
    const response = await api.delete(`/questions/${questionId}`)
    return response.data
  },

  async reorderQuestions(assessmentId, questionIds) {
    const response = await api.put(`/questions/assessment/${assessmentId}/reorder`, { questionIds })
    return response.data
  }
}

