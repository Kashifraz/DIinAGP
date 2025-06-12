import { defineStore } from 'pinia'
import dashboardService from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    coordinatorDashboard: null,
    professorDashboard: null,
    studentDashboard: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchCoordinatorDashboard() {
      this.loading = true
      this.error = null
      try {
        this.coordinatorDashboard = await dashboardService.getCoordinatorDashboard()
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch coordinator dashboard'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProfessorDashboard() {
      this.loading = true
      this.error = null
      try {
        this.professorDashboard = await dashboardService.getProfessorDashboard()
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch professor dashboard'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchStudentDashboard() {
      this.loading = true
      this.error = null
      try {
        this.studentDashboard = await dashboardService.getStudentDashboard()
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch student dashboard'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})

