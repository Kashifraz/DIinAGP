import api from './api'

const dashboardService = {
  // Coordinator Dashboard
  async getCoordinatorDashboard() {
    const response = await api.get('/dashboard/coordinator')
    return response.data
  },

  // Professor Dashboard
  async getProfessorDashboard() {
    const response = await api.get('/dashboard/professor')
    return response.data
  },

  // Student Dashboard
  async getStudentDashboard() {
    const response = await api.get('/dashboard/student')
    return response.data
  }
}

export default dashboardService

