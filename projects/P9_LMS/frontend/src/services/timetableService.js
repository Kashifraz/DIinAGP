import api from './api'

export const timetableService = {
  async createTimetableEntry(courseId, entryData) {
    const response = await api.post(`/timetable/courses/${courseId}`, entryData)
    return response.data
  },

  async getTimetableByCourse(courseId) {
    const response = await api.get(`/timetable/courses/${courseId}`)
    return response.data
  },

  async getTimetableByStudent(studentId) {
    const response = await api.get(`/timetable/students/${studentId}`)
    return response.data
  },

  async getTimetableByProfessor(professorId) {
    const response = await api.get(`/timetable/professors/${professorId}`)
    return response.data
  },

  async updateTimetableEntry(entryId, entryData) {
    const response = await api.put(`/timetable/${entryId}`, entryData)
    return response.data
  },

  async deleteTimetableEntry(entryId) {
    const response = await api.delete(`/timetable/${entryId}`)
    return response.data
  }
}

