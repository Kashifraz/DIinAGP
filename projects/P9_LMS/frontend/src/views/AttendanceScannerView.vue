<template>
  <div class="attendance-scanner-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Scan Attendance QR Code</h1>
      </div>

      <!-- QR Scanner Section -->
      <div class="section">
        <h2>Camera Scanner</h2>
        <QRScanner @scan="handleScan" />
      </div>

      <!-- Manual Entry Section -->
      <div class="section">
        <h2>Manual Entry</h2>
        <div class="manual-entry">
          <div class="form-group">
            <label for="qrCodeInput">Enter QR Code:</label>
            <input
              id="qrCodeInput"
              v-model="manualQRCode"
              type="text"
              placeholder="Paste QR code here"
              class="form-input"
            />
          </div>
          <button @click="handleManualScan" class="btn-scan" :disabled="!manualQRCode || attendanceStore.loading">
            <i class="fas fa-qrcode"></i> Submit QR Code
          </button>
        </div>
      </div>

      <!-- Recent Attendance Records -->
      <div class="section">
        <div class="section-header">
          <h2>My Attendance History</h2>
          <select v-model="selectedCourseFilter" @change="loadAttendanceHistory" class="form-select filter-select">
            <option :value="null">All Courses</option>
            <option v-for="enrollment in myEnrollments" :key="enrollment.courseId" :value="enrollment.courseId">
              {{ enrollment.courseCode }} - {{ enrollment.courseName }}
            </option>
          </select>
        </div>

        <div v-if="attendanceStore.loading" class="loading">
          Loading attendance history...
        </div>

        <div v-else-if="attendanceStore.records.length === 0" class="no-records">
          <i class="fas fa-clipboard-list"></i>
          <p>No attendance records found.</p>
        </div>

        <div v-else class="records-list">
          <div
            v-for="record in attendanceStore.records"
            :key="record.id"
            class="record-card"
          >
            <div class="record-header">
              <div class="record-course">
                <strong>{{ record.courseCode }} - {{ record.courseName }}</strong>
              </div>
              <span class="status-badge" :class="record.status?.toLowerCase()">
                {{ record.status }}
              </span>
            </div>
            <div class="record-details">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(record.scanTimestamp) }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(record.scanTimestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useEnrollmentStore } from '@/stores/enrollment'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import QRScanner from '@/components/attendance/QRScanner.vue'

const attendanceStore = useAttendanceStore()
const enrollmentStore = useEnrollmentStore()
const authStore = useAuthStore()
const toast = useToast()

const manualQRCode = ref('')
const selectedCourseFilter = ref(null)
const myEnrollments = ref([])

const userId = computed(() => authStore.user?.id)

onMounted(async () => {
  if (userId.value) {
    await loadMyEnrollments()
    await loadAttendanceHistory()
  }
})

const loadMyEnrollments = async () => {
  try {
    await enrollmentStore.fetchEnrollmentsByStudent(userId.value)
    myEnrollments.value = enrollmentStore.enrollments.filter(e => e.status === 'ACTIVE')
  } catch (err) {
    toast.error('Failed to load enrollments')
    console.error('Failed to load enrollments:', err)
  }
}

const loadAttendanceHistory = async () => {
  if (!userId.value) return
  
  try {
    if (selectedCourseFilter.value) {
      await attendanceStore.fetchRecordsByCourseAndStudent(selectedCourseFilter.value, userId.value)
    } else {
      await attendanceStore.fetchRecordsByStudent(userId.value)
    }
  } catch (err) {
    toast.error('Failed to load attendance history')
    console.error('Failed to load attendance history:', err)
  }
}

const handleScan = async (qrCode) => {
  await processQRCode(qrCode)
}

const handleManualScan = async () => {
  if (!manualQRCode.value.trim()) {
    toast.error('Please enter a QR code')
    return
  }
  await processQRCode(manualQRCode.value.trim())
  manualQRCode.value = ''
}

const processQRCode = async (qrCode) => {
  try {
    const record = await attendanceStore.scanQRCode(qrCode)
    toast.success(`Attendance marked successfully for ${record.courseName}!`)
    await loadAttendanceHistory()
  } catch (err) {
    toast.error(attendanceStore.error || 'Failed to scan QR code')
  }
}

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleDateString()
}

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.attendance-scanner-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
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

.filter-select {
  max-width: 300px;
}

.manual-entry {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.btn-scan {
  background: #2196f3;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
  white-space: nowrap;
}

.btn-scan:hover:not(:disabled) {
  background: #1976d2;
}

.btn-scan:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-records {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-records i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.records-list {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.record-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-course {
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.present {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.absent {
  background: #ffebee;
  color: #c62828;
}

.record-details {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-item i {
  color: #999;
}

@media (max-width: 768px) {
  .manual-entry {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-scan {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    max-width: 100%;
  }
}
</style>

