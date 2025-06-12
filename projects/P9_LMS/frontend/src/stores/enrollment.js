import { defineStore } from 'pinia'
import { ref } from 'vue'
import { enrollmentService } from '@/services/enrollmentService'

export const useEnrollmentStore = defineStore('enrollment', () => {
  const enrollments = ref([])
  const currentEnrollments = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function enrollStudent(courseId, studentId) {
    loading.value = true
    error.value = null
    try {
      const enrollment = await enrollmentService.enrollStudent(courseId, studentId)
      enrollments.value.push(enrollment)
      return enrollment
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to enroll student'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkEnrollStudents(courseId, studentIds) {
    loading.value = true
    error.value = null
    try {
      const newEnrollments = await enrollmentService.bulkEnrollStudents(courseId, studentIds)
      enrollments.value.push(...newEnrollments)
      return newEnrollments
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to enroll students'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEnrollmentsByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await enrollmentService.getEnrollmentsByCourse(courseId)
      currentEnrollments.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch enrollments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEnrollmentsByStudent(studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await enrollmentService.getEnrollmentsByStudent(studentId)
      enrollments.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch enrollments'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function dropEnrollment(enrollmentId) {
    loading.value = true
    error.value = null
    try {
      await enrollmentService.dropEnrollment(enrollmentId)
      enrollments.value = enrollments.value.filter(e => e.id !== enrollmentId)
      currentEnrollments.value = currentEnrollments.value.filter(e => e.id !== enrollmentId)
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to drop enrollment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkEnrollment(courseId, studentId) {
    try {
      const isEnrolled = await enrollmentService.checkEnrollment(courseId, studentId)
      return isEnrolled
    } catch (err) {
      console.error('Failed to check enrollment:', err)
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    enrollments,
    currentEnrollments,
    loading,
    error,
    enrollStudent,
    bulkEnrollStudents,
    fetchEnrollmentsByCourse,
    fetchEnrollmentsByStudent,
    dropEnrollment,
    checkEnrollment,
    clearError
  }
})

