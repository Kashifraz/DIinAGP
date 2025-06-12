import { defineStore } from 'pinia'
import { ref } from 'vue'
import { timetableService } from '@/services/timetableService'

export const useTimetableStore = defineStore('timetable', () => {
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function createTimetableEntry(courseId, entryData) {
    loading.value = true
    error.value = null
    try {
      const entry = await timetableService.createTimetableEntry(courseId, entryData)
      entries.value.push(entry)
      return entry
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create timetable entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTimetableByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await timetableService.getTimetableByCourse(courseId)
      entries.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch timetable'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTimetableByStudent(studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await timetableService.getTimetableByStudent(studentId)
      entries.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch student timetable'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTimetableByProfessor(professorId) {
    loading.value = true
    error.value = null
    try {
      const data = await timetableService.getTimetableByProfessor(professorId)
      entries.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch professor timetable'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTimetableEntry(entryId, entryData) {
    loading.value = true
    error.value = null
    try {
      const updatedEntry = await timetableService.updateTimetableEntry(entryId, entryData)
      const index = entries.value.findIndex(e => e.id === entryId)
      if (index !== -1) {
        entries.value[index] = updatedEntry
      }
      return updatedEntry
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to update timetable entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTimetableEntry(entryId) {
    loading.value = true
    error.value = null
    try {
      await timetableService.deleteTimetableEntry(entryId)
      entries.value = entries.value.filter(e => e.id !== entryId)
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to delete timetable entry'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    entries,
    loading,
    error,
    createTimetableEntry,
    fetchTimetableByCourse,
    fetchTimetableByStudent,
    fetchTimetableByProfessor,
    updateTimetableEntry,
    deleteTimetableEntry,
    clearError
  }
})

