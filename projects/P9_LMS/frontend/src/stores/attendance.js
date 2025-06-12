import { defineStore } from 'pinia'
import { ref } from 'vue'
import { attendanceService } from '@/services/attendanceService'

export const useAttendanceStore = defineStore('attendance', () => {
  const sessions = ref([])
  const activeSession = ref(null)
  const records = ref([])
  const qrCodeImageUrl = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function createAttendanceSession(courseId, sessionData) {
    loading.value = true
    error.value = null
    try {
      const session = await attendanceService.createAttendanceSession(courseId, sessionData)
      sessions.value.push(session)
      activeSession.value = session
      return session
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to create attendance session'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveSession(courseId) {
    loading.value = true
    error.value = null
    try {
      const session = await attendanceService.getActiveSession(courseId)
      activeSession.value = session
      return session
    } catch (err) {
      if (err.response?.status === 404) {
        activeSession.value = null
        return null
      }
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch active session'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSessionsByCourse(courseId) {
    loading.value = true
    error.value = null
    try {
      const data = await attendanceService.getSessionsByCourse(courseId)
      sessions.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch sessions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchQRCodeImage(sessionId) {
    loading.value = true
    error.value = null
    try {
      const imageUrl = await attendanceService.getQRCodeImage(sessionId)
      qrCodeImageUrl.value = imageUrl
      return imageUrl
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch QR code image'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function scanQRCode(qrCode) {
    loading.value = true
    error.value = null
    try {
      const record = await attendanceService.scanQRCode(qrCode)
      records.value.push(record)
      return record
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to scan QR code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function closeSession(sessionId) {
    loading.value = true
    error.value = null
    try {
      await attendanceService.closeSession(sessionId)
      const session = sessions.value.find(s => s.id === sessionId)
      if (session) {
        session.status = 'CLOSED'
      }
      if (activeSession.value?.id === sessionId) {
        activeSession.value.status = 'CLOSED'
        activeSession.value = null
      }
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to close session'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsBySession(sessionId) {
    loading.value = true
    error.value = null
    try {
      const data = await attendanceService.getRecordsBySession(sessionId)
      records.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch records'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsByStudent(studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await attendanceService.getRecordsByStudent(studentId)
      records.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch records'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordsByCourseAndStudent(courseId, studentId) {
    loading.value = true
    error.value = null
    try {
      const data = await attendanceService.getRecordsByCourseAndStudent(courseId, studentId)
      records.value = data
      return data
    } catch (err) {
      error.value = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to fetch records'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearQRCodeImage() {
    if (qrCodeImageUrl.value) {
      URL.revokeObjectURL(qrCodeImageUrl.value)
      qrCodeImageUrl.value = null
    }
  }

  return {
    sessions,
    activeSession,
    records,
    qrCodeImageUrl,
    loading,
    error,
    createAttendanceSession,
    fetchActiveSession,
    fetchSessionsByCourse,
    fetchQRCodeImage,
    scanQRCode,
    closeSession,
    fetchRecordsBySession,
    fetchRecordsByStudent,
    fetchRecordsByCourseAndStudent,
    clearError,
    clearQRCodeImage
  }
})

