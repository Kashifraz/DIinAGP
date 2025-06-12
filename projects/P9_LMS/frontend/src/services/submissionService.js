import api from './api'

export const submissionService = {
  async submitAssignment(assessmentId, formData) {
    const response = await api.post(`/submissions/assessments/${assessmentId}/submit-assignment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async submitQuiz(assessmentId, answers) {
    const response = await api.post(`/submissions/assessments/${assessmentId}/submit-quiz`, { answers })
    return response.data
  },

  async getSubmissionsByAssessment(assessmentId) {
    const response = await api.get(`/submissions/assessments/${assessmentId}/submissions`)
    return response.data
  },

  async getSubmissionById(submissionId) {
    const response = await api.get(`/submissions/${submissionId}`)
    return response.data
  },

  async getSubmissionsByStudent(studentId) {
    const response = await api.get(`/submissions/students/${studentId}/submissions`)
    return response.data
  },

  async downloadSubmission(submissionId) {
    const response = await api.get(`/submissions/${submissionId}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    })
    return {
      data: response.data,
      headers: response.headers,
      type: response.headers['content-type'] || response.data.type || 'application/octet-stream'
    }
  }
}

