import { defineStore } from 'pinia'
import resultsheetService from '@/services/resultsheetService'

export const useResultsheetStore = defineStore('resultsheet', {
  state: () => ({
    currentResultsheet: null,
    studentResultsheets: [],
    courseResultsheets: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchResultsheetByCourseAndStudent(courseId, studentId) {
      this.loading = true
      this.error = null
      try {
        this.currentResultsheet = await resultsheetService.getResultsheetByCourseAndStudent(courseId, studentId)
        return this.currentResultsheet
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch resultsheet'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchResultsheetsByStudent(studentId) {
      this.loading = true
      this.error = null
      try {
        this.studentResultsheets = await resultsheetService.getResultsheetsByStudent(studentId)
        return this.studentResultsheets
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch resultsheets'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchResultsheetsByCourse(courseId) {
      this.loading = true
      this.error = null
      try {
        this.courseResultsheets = await resultsheetService.getResultsheetsByCourse(courseId)
        return this.courseResultsheets
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch resultsheets'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})

