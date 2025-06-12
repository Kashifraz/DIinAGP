import { defineStore } from 'pinia'
import { ref } from 'vue'
import { majorService } from '@/services/majorService'

export const useMajorStore = defineStore('major', () => {
  const majors = ref([])
  const currentMajor = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMajors() {
    loading.value = true
    error.value = null
    try {
      const data = await majorService.getAllMajors()
      majors.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch majors'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMajorById(id) {
    loading.value = true
    error.value = null
    try {
      const major = await majorService.getMajorById(id)
      currentMajor.value = major
      return major
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch major'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMajor(majorData) {
    loading.value = true
    error.value = null
    try {
      const major = await majorService.createMajor(majorData)
      majors.value.push(major)
      return major
    } catch (err) {
      // Preserve full error object for better error handling
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create major'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMajor(id, majorData) {
    loading.value = true
    error.value = null
    try {
      const updatedMajor = await majorService.updateMajor(id, majorData)
      const index = majors.value.findIndex(m => m.id === id)
      if (index !== -1) {
        majors.value[index] = updatedMajor
      }
      if (currentMajor.value && currentMajor.value.id === id) {
        currentMajor.value = updatedMajor
      }
      return updatedMajor
    } catch (err) {
      // Preserve full error object for better error handling
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update major'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMajor(id) {
    loading.value = true
    error.value = null
    try {
      await majorService.deleteMajor(id)
      majors.value = majors.value.filter(m => m.id !== id)
      if (currentMajor.value && currentMajor.value.id === id) {
        currentMajor.value = null
      }
    } catch (err) {
      // Preserve full error object for better error handling
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete major'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    majors,
    currentMajor,
    loading,
    error,
    fetchMajors,
    fetchMajorById,
    createMajor,
    updateMajor,
    deleteMajor,
    clearError
  }
})

