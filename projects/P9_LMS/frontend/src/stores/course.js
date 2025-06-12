import { defineStore } from 'pinia'
import { ref } from 'vue'
import { courseService } from '@/services/courseService'

export const useCourseStore = defineStore('course', () => {
  const courses = ref([])
  const currentCourse = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchCourses(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await courseService.getAllCourses(params)
      courses.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch courses'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCourseById(id) {
    loading.value = true
    error.value = null
    try {
      const course = await courseService.getCourseById(id)
      currentCourse.value = course
      return course
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch course'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCourse(courseData) {
    loading.value = true
    error.value = null
    try {
      const course = await courseService.createCourse(courseData)
      courses.value.push(course)
      return course
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create course'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCourse(id, courseData) {
    loading.value = true
    error.value = null
    try {
      const updatedCourse = await courseService.updateCourse(id, courseData)
      const index = courses.value.findIndex(c => c.id === id)
      if (index !== -1) {
        courses.value[index] = updatedCourse
      }
      if (currentCourse.value && currentCourse.value.id === id) {
        currentCourse.value = updatedCourse
      }
      return updatedCourse
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update course'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignProfessor(courseId, professorId) {
    loading.value = true
    error.value = null
    try {
      const updatedCourse = await courseService.assignProfessor(courseId, professorId)
      const index = courses.value.findIndex(c => c.id === courseId)
      if (index !== -1) {
        courses.value[index] = updatedCourse
      }
      if (currentCourse.value && currentCourse.value.id === courseId) {
        currentCourse.value = updatedCourse
      }
      return updatedCourse
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to assign professor'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCoursesByMajor(majorId) {
    loading.value = true
    error.value = null
    try {
      const data = await courseService.getCoursesByMajor(majorId)
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch courses by major'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCoursesByProfessor(professorId) {
    loading.value = true
    error.value = null
    try {
      const data = await courseService.getCoursesByProfessor(professorId)
      courses.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch courses by professor'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    courses,
    currentCourse,
    loading,
    error,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    assignProfessor,
    fetchCoursesByMajor,
    fetchCoursesByProfessor,
    clearError
  }
})

