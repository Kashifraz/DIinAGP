<template>
  <div class="timetable-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>{{ courseId ? 'Course Timetable' : 'My Timetable' }}</h1>
        <router-link v-if="courseId" to="/student-courses" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Courses
        </router-link>
      </div>

      <div v-if="timetableStore.loading" class="loading">
        Loading timetable...
      </div>

      <div v-else-if="timetableStore.entries.length === 0" class="no-timetable">
        <p>No timetable entries found.</p>
        <p v-if="userRole === 'STUDENT'">You need to be enrolled in courses to see your timetable.</p>
        <p v-else-if="userRole === 'PROFESSOR'">You need to create timetable entries for your courses.</p>
      </div>

      <div v-else class="timetable-container">
        <WeeklyCalendar
          :entries="timetableStore.entries"
          :attendance-records="attendanceRecords"
          :user-role="userRole"
          :course-date-range="courseDateRange"
          @slot-click="handleSlotClick"
        />
      </div>

      <!-- Entry Details Modal -->
      <div v-if="selectedEntry" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>Timetable Entry Details</h3>
          <div class="entry-details">
            <div class="detail-item">
              <strong>Course:</strong>
              <span>{{ selectedEntry.courseCode }} - {{ selectedEntry.courseName }}</span>
            </div>
            <div class="detail-item">
              <strong>Day:</strong>
              <span>{{ formatDayOfWeek(selectedEntry.dayOfWeek) }}</span>
            </div>
            <div class="detail-item">
              <strong>Time:</strong>
              <span>{{ formatTime(selectedEntry.startTime) }} - {{ formatTime(selectedEntry.endTime) }}</span>
            </div>
            <div class="detail-item">
              <strong>Duration:</strong>
              <span>{{ formatDuration(selectedEntry.durationMinutes) }}</span>
            </div>
            <div v-if="selectedEntry.location" class="detail-item">
              <strong>Location:</strong>
              <span>{{ selectedEntry.location }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="closeModal" class="btn-close">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTimetableStore } from '@/stores/timetable'
import { useAttendanceStore } from '@/stores/attendance'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import WeeklyCalendar from '@/components/timetable/WeeklyCalendar.vue'

const timetableStore = useTimetableStore()
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedEntry = ref(null)
const route = useRoute()
const attendanceRecords = ref([])

const userRole = computed(() => authStore.user?.role)
const courseId = computed(() => {
  const id = route.query.courseId
  return id ? parseInt(id) : null
})

// Calculate course date range from timetable entries
const courseDateRange = computed(() => {
  if (timetableStore.entries.length === 0) return null
  
  // Get unique course date ranges from entries
  const dateRanges = timetableStore.entries
    .filter(entry => entry.courseStartDate && entry.courseEndDate)
    .map(entry => ({
      startDate: entry.courseStartDate,
      endDate: entry.courseEndDate
    }))
  
  if (dateRanges.length === 0) return null
  
  // If viewing a specific course, use that course's date range
  if (courseId.value) {
    const courseEntry = timetableStore.entries.find(e => e.courseId === courseId.value)
    if (courseEntry && courseEntry.courseStartDate && courseEntry.courseEndDate) {
      return {
        startDate: courseEntry.courseStartDate,
        endDate: courseEntry.courseEndDate
      }
    }
  }
  
  // For multiple courses, use the earliest start and latest end
  const startDates = dateRanges.map(r => new Date(r.startDate))
  const endDates = dateRanges.map(r => new Date(r.endDate))
  const earliestStart = new Date(Math.min(...startDates))
  const latestEnd = new Date(Math.max(...endDates))
  
  return {
    startDate: earliestStart.toISOString().split('T')[0],
    endDate: latestEnd.toISOString().split('T')[0]
  }
})

// Attendance status calculation is now done in WeeklyCalendar component

onMounted(async () => {
  await loadTimetable()
  if (userRole.value === 'STUDENT') {
    await loadAttendanceRecords()
  }
})

// Watch for timetable changes to reload attendance
watch(() => timetableStore.entries, async () => {
  if (userRole.value === 'STUDENT') {
    await loadAttendanceRecords()
  }
})

const loadTimetable = async () => {
  try {
    const user = authStore.user
    if (!user) {
      toast.error('User not found')
      return
    }

    const courseIdValue = courseId.value

    if (user.role === 'STUDENT') {
      if (courseIdValue) {
        // Load timetable for specific course
        await timetableStore.fetchTimetableByCourse(courseIdValue)
      } else {
        // Load all student timetable
        await timetableStore.fetchTimetableByStudent(user.id)
      }
    } else if (user.role === 'PROFESSOR') {
      if (courseIdValue) {
        // Load timetable for specific course
        await timetableStore.fetchTimetableByCourse(courseIdValue)
      } else {
        // Load all professor timetable
        await timetableStore.fetchTimetableByProfessor(user.id)
      }
    } else {
      toast.error('Access denied')
    }
  } catch (err) {
    toast.error('Failed to load timetable')
    console.error('Failed to load timetable:', err)
  }
}

const handleSlotClick = (entry) => {
  selectedEntry.value = entry
}

const closeModal = () => {
  selectedEntry.value = null
}

const formatDayOfWeek = (day) => {
  const days = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
  }
  return days[day] || day
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const loadAttendanceRecords = async () => {
  if (userRole.value !== 'STUDENT' || !authStore.user?.id) return
  
  try {
    if (courseId.value) {
      await attendanceStore.fetchRecordsByCourseAndStudent(courseId.value, authStore.user.id)
    } else {
      await attendanceStore.fetchRecordsByStudent(authStore.user.id)
    }
    attendanceRecords.value = attendanceStore.records
  } catch (err) {
    console.error('Failed to load attendance records:', err)
  }
}

// Attendance status calculation is now done in WeeklyCalendar component
</script>

<style scoped>
.timetable-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1400px;
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

.loading,
.no-timetable {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}

.no-timetable p {
  margin: 10px 0;
}

.timetable-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
}

.entry-details {
  margin-bottom: 25px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: #555;
  min-width: 100px;
}

.detail-item span {
  color: #333;
  text-align: right;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-close:hover {
  background: #1976d2;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }
}
</style>

