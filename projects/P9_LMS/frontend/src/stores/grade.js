import { defineStore } from 'pinia'
import { ref } from 'vue'
import { gradeService } from '@/services/gradeService'

export const useGradeStore = defineStore('grade', () => {
  const grades = ref([])
  const currentGrade = ref(null)
  const courseGrade = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function gradeSubmission(submissionId, gradeData) {
    loading.value = true
    error.value = null
    try {
      const grade = await gradeService.gradeSubmission(submissionId, gradeData)
      const index = grades.value.findIndex(g => g.id === grade.id)
      if (index !== -1) {
        grades.value[index] = grade
      } else {
        grades.value.push(grade)
      }
      return grade
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to grade submission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateGrade(gradeId, gradeData) {
    loading.value = true
    error.value = null
    try {
      const grade = await gradeService.updateGrade(gradeId, gradeData)
      const index = grades.value.findIndex(g => g.id === gradeId)
      if (index !== -1) {
        grades.value[index] = grade
      }
      if (currentGrade.value && currentGrade.value.id === gradeId) {
        currentGrade.value = grade
      }
      return grade
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update grade'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGradesByAssessment(assessmentId) {
    loading.value = true
    error.value = null
    try {
      const data = await gradeService.getGradesByAssessment(assessmentId)
      grades.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch grades'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGradesByCourseAndStudent(courseId, studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await gradeService.getGradesByCourseAndStudent(courseId, studentId)
      grades.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch grades'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGradesByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await gradeService.getGradesByCourse(courseId)
      grades.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch grades'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCourseGrade(courseId, studentId) {
    loading.value = true
    error.value = null
    try {
      const courseGradeData = await gradeService.getCourseGrade(courseId, studentId)
      courseGrade.value = courseGradeData
      return courseGradeData
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch course grade'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function calculateCourseGrade(courseId, studentId) {
    loading.value = true
    error.value = null
    try {
      const courseGradeData = await gradeService.calculateCourseGrade(courseId, studentId)
      courseGrade.value = courseGradeData
      return courseGradeData
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to calculate course grade'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    grades,
    currentGrade,
    courseGrade,
    loading,
    error,
    gradeSubmission,
    updateGrade,
    fetchGradesByAssessment,
    fetchGradesByCourseAndStudent,
    fetchGradesByCourse,
    fetchCourseGrade,
    calculateCourseGrade,
    clearError
  }
})

