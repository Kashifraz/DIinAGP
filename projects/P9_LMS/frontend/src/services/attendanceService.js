import api from './api'

export const attendanceService = {
  async createAttendanceSession(courseId, sessionData) {
    const response = await api.post(`/attendance/courses/${courseId}/sessions`, sessionData)
    return response.data
  },

  async getActiveSession(courseId) {
    const response = await api.get(`/attendance/courses/${courseId}/sessions/active`)
    return response.data
  },

  async getSessionsByCourse(courseId) {
    const response = await api.get(`/attendance/courses/${courseId}/sessions`)
    return response.data
  },

  async getQRCodeImage(sessionId) {
    const response = await api.get(`/attendance/sessions/${sessionId}/qr-code`, {
      responseType: 'blob'
    })
    return URL.createObjectURL(response.data)
  },

  async scanQRCode(qrCode) {
    const response = await api.post('/attendance/scan', { qrCode })
    return response.data
  },

  async closeSession(sessionId) {
    const response = await api.put(`/attendance/sessions/${sessionId}/close`)
    return response.data
  },

  async getRecordsBySession(sessionId) {
    const response = await api.get(`/attendance/sessions/${sessionId}/records`)
    return response.data
  },

  async getRecordsByStudent(studentId) {
    const response = await api.get(`/attendance/students/${studentId}/records`)
    return response.data
  },

  async getRecordsByCourseAndStudent(courseId, studentId) {
    const response = await api.get(`/attendance/courses/${courseId}/students/${studentId}/records`)
    return response.data
  }
}

