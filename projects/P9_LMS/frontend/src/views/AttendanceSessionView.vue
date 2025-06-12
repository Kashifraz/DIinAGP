<template>
  <div class="attendance-session-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Attendance Management</h1>
        <router-link :to="`/my-courses`" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Courses
        </router-link>
      </div>

      <!-- Course Selection -->
      <div class="section">
        <h2>Select Course</h2>
        <div class="form-group">
          <label for="courseSelect">Course:</label>
          <select
            id="courseSelect"
            v-model="selectedCourseId"
            @change="handleCourseChange"
            class="form-select"
          >
            <option :value="null">Select a course</option>
            <option v-for="course in myCourses" :key="course.id" :value="course.id">
              {{ course.code }} - {{ course.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Active Session Section -->
      <div v-if="selectedCourseId" class="section">
        <div class="section-header">
          <h2>Active Session</h2>
          <button
            v-if="!attendanceStore.activeSession"
            @click="showCreateSessionModal = true"
            class="btn-create"
            :disabled="attendanceStore.loading"
          >
            <i class="fas fa-plus"></i> Start Session
          </button>
          <button
            v-else
            @click="handleCloseSession"
            class="btn-close"
            :disabled="attendanceStore.loading"
          >
            <i class="fas fa-times"></i> Close Session
          </button>
        </div>

        <div v-if="attendanceStore.loading && !attendanceStore.activeSession" class="loading">
          Loading...
        </div>

        <div v-else-if="attendanceStore.activeSession" class="active-session">
          <div class="session-info">
            <div class="info-item">
              <strong>Session Date:</strong> {{ formatDate(attendanceStore.activeSession.sessionDate) }}
            </div>
            <div class="info-item">
              <strong>Status:</strong>
              <span class="status-badge" :class="attendanceStore.activeSession.status?.toLowerCase()">
                {{ attendanceStore.activeSession.status }}
              </span>
            </div>
            <div v-if="attendanceStore.activeSession.totalStudents !== undefined" class="info-item">
              <strong>Attendance:</strong>
              {{ attendanceStore.activeSession.presentCount || 0 }} / {{ attendanceStore.activeSession.totalStudents || 0 }} students
            </div>
          </div>

          <QRCodeDisplay
            v-if="attendanceStore.activeSession.qrCode"
            :qr-code="attendanceStore.activeSession.qrCode"
            :expires-at="attendanceStore.activeSession.qrCodeExpiresAt"
            :session-id="attendanceStore.activeSession.id"
            :loading="qrCodeLoading"
            @refresh="handleRefreshQRCode"
          />
        </div>

        <div v-else class="no-active-session">
          <i class="fas fa-calendar-times"></i>
          <p>No active session. Click "Start Session" to begin.</p>
        </div>
      </div>

      <!-- Session History -->
      <div v-if="selectedCourseId && attendanceStore.sessions.length > 0" class="section">
        <h2>Session History</h2>
        <div class="sessions-list">
          <div
            v-for="session in attendanceStore.sessions"
            :key="session.id"
            class="session-card"
            @click="handleViewSession(session.id)"
          >
            <div class="session-header">
              <h3>{{ formatDate(session.sessionDate) }}</h3>
              <span class="status-badge" :class="session.status?.toLowerCase()">
                {{ session.status }}
              </span>
            </div>
            <div class="session-stats">
              <div class="stat">
                <i class="fas fa-users"></i>
                <span>{{ session.presentCount || 0 }} / {{ session.totalStudents || 0 }} present</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Records Modal -->
      <div v-if="showRecordsModal && selectedSessionId" class="modal-overlay" @click.self="closeRecordsModal">
        <div class="modal-content records-modal">
          <div class="modal-header">
            <h3>Attendance Records</h3>
            <button @click="closeRecordsModal" class="btn-close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="attendanceStore.loading" class="loading">Loading records...</div>
            <div v-else-if="attendanceStore.records.length === 0" class="no-records">
              No attendance records found.
            </div>
            <div v-else class="records-list">
              <div
                v-for="record in attendanceStore.records"
                :key="record.id"
                class="record-item"
              >
                <div class="record-info">
                  <strong>{{ record.studentName }}</strong>
                  <span class="record-email">{{ record.studentEmail }}</span>
                </div>
                <div class="record-details">
                  <span class="status-badge" :class="record.status?.toLowerCase()">
                    {{ record.status }}
                  </span>
                  <span class="scan-time">{{ formatDateTime(record.scanTimestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Session Modal -->
      <div v-if="showCreateSessionModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create Attendance Session</h3>
            <button @click="closeCreateModal" class="btn-close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCreateSession">
              <div class="form-group">
                <label for="sessionDate">Session Date:</label>
                <input
                  id="sessionDate"
                  v-model="sessionForm.sessionDate"
                  type="date"
                  required
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="durationMinutes">Duration (minutes):</label>
                <input
                  id="durationMinutes"
                  v-model.number="sessionForm.durationMinutes"
                  type="number"
                  min="5"
                  max="60"
                  :placeholder="15"
                  class="form-input"
                />
                <small>Default: 15 minutes</small>
              </div>
              <div class="form-actions">
                <button type="button" @click="closeCreateModal" class="btn-cancel">
                  Cancel
                </button>
                <button type="submit" class="btn-submit" :disabled="attendanceStore.loading">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAttendanceStore } from '@/stores/attendance'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import QRCodeDisplay from '@/components/attendance/QRCodeDisplay.vue'

const route = useRoute()
const attendanceStore = useAttendanceStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedCourseId = ref(null)
const myCourses = ref([])
const showCreateSessionModal = ref(false)
const showRecordsModal = ref(false)
const selectedSessionId = ref(null)
const qrCodeLoading = ref(false)

const sessionForm = ref({
  sessionDate: new Date().toISOString().split('T')[0],
  durationMinutes: 15
})

onMounted(async () => {
  await loadMyCourses()
  
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadActiveSession()
  }
})

watch(() => route.params.courseId, async (newCourseId) => {
  if (newCourseId) {
    selectedCourseId.value = parseInt(newCourseId)
    await loadActiveSession()
  }
})

const loadMyCourses = async () => {
  try {
    const userId = authStore.user?.id
    if (userId) {
      await courseStore.fetchCoursesByProfessor(userId)
      myCourses.value = courseStore.courses
    }
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadActiveSession()
    await loadSessions()
  } else {
    attendanceStore.activeSession = null
    attendanceStore.sessions = []
  }
}

const loadActiveSession = async () => {
  if (!selectedCourseId.value) return
  try {
    await attendanceStore.fetchActiveSession(selectedCourseId.value)
    if (attendanceStore.activeSession && attendanceStore.activeSession.id) {
      await loadQRCodeImage()
    }
  } catch (err) {
    // 404 is expected when there's no active session, so we don't show error
    if (err.response?.status !== 404) {
      toast.error('Failed to load active session')
    }
    attendanceStore.activeSession = null
  }
}

const loadSessions = async () => {
  if (!selectedCourseId.value) return
  try {
    await attendanceStore.fetchSessionsByCourse(selectedCourseId.value)
  } catch (err) {
    toast.error('Failed to load sessions')
  }
}

const loadQRCodeImage = async () => {
  if (!attendanceStore.activeSession?.id) return
  qrCodeLoading.value = true
  try {
    await attendanceStore.fetchQRCodeImage(attendanceStore.activeSession.id)
  } catch (err) {
    toast.error('Failed to load QR code image')
  } finally {
    qrCodeLoading.value = false
  }
}

const handleCreateSession = async () => {
  if (!selectedCourseId.value) {
    toast.error('Please select a course')
    return
  }
  
  try {
    const session = await attendanceStore.createAttendanceSession(selectedCourseId.value, {
      sessionDate: sessionForm.value.sessionDate,
      durationMinutes: sessionForm.value.durationMinutes || 15
    })
    toast.success('Attendance session created successfully!')
    showCreateSessionModal.value = false
    // The session is already set as activeSession in the store
    // Now load the QR code image for the newly created session
    if (attendanceStore.activeSession && attendanceStore.activeSession.id) {
      qrCodeLoading.value = true
      try {
        await attendanceStore.fetchQRCodeImage(attendanceStore.activeSession.id)
      } catch (err) {
        toast.error('Failed to load QR code image')
      } finally {
        qrCodeLoading.value = false
      }
    }
    await loadSessions()
  } catch (err) {
    toast.error(attendanceStore.error || 'Failed to create session')
  }
}

const handleCloseSession = async () => {
  if (!attendanceStore.activeSession?.id) return
  
  if (!confirm('Are you sure you want to close this session?')) {
    return
  }
  
  try {
    await attendanceStore.closeSession(attendanceStore.activeSession.id)
    toast.success('Session closed successfully')
    await loadActiveSession()
  } catch (err) {
    toast.error(attendanceStore.error || 'Failed to close session')
  }
}

const handleRefreshQRCode = async () => {
  await loadQRCodeImage()
}

const handleViewSession = async (sessionId) => {
  selectedSessionId.value = sessionId
  showRecordsModal.value = true
  try {
    await attendanceStore.fetchRecordsBySession(sessionId)
  } catch (err) {
    toast.error('Failed to load records')
  }
}

const closeCreateModal = () => {
  showCreateSessionModal.value = false
  sessionForm.value = {
    sessionDate: new Date().toISOString().split('T')[0],
    durationMinutes: 15
  }
}

const closeRecordsModal = () => {
  showRecordsModal.value = false
  selectedSessionId.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}
</script>

<style scoped>
.attendance-session-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.btn-back {
  background: #6c757d;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #5a6268;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.btn-create,
.btn-close {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-create {
  background: #4caf50;
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: #45a049;
}

.btn-close {
  background: #f44336;
  color: white;
}

.btn-close:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-create:disabled,
.btn-close:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.active-session {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.session-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.expired {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.closed {
  background: #f5f5f5;
  color: #757575;
}

.status-badge.present {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.absent {
  background: #ffebee;
  color: #c62828;
}

.no-active-session {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-active-session i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.sessions-list {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.session-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.session-stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.records-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s;
}

.btn-close-modal:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cancel {
  background: #ccc;
  color: #333;
}

.btn-cancel:hover {
  background: #bbb;
}

.btn-submit {
  background: #2196f3;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #1976d2;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-email {
  font-size: 12px;
  color: #666;
}

.record-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.scan-time {
  font-size: 12px;
  color: #999;
}

.no-records {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

