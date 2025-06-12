<template>
  <div class="timetable-management">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Timetable Management</h1>
        <router-link to="/my-courses" class="btn-back">
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

      <!-- Timetable Management -->
      <div v-if="selectedCourseId" class="section">
        <div class="section-header">
          <h2>Timetable Entries</h2>
          <button
            v-if="!showEntryForm"
            @click="showCreateEntryForm"
            class="btn-create"
          >
            <i class="fas fa-plus"></i> Add Entry
          </button>
        </div>

        <!-- Entry Form -->
        <div v-if="showEntryForm" class="entry-form-section">
          <TimetableEntryForm
            :entry="editingEntry"
            :loading="timetableStore.loading"
            :error="entryFormError || timetableStore.error"
            @submit="handleEntrySubmit"
            @cancel="cancelEntryForm"
          />
        </div>

        <!-- Entries List -->
        <div v-if="timetableStore.loading && !showEntryForm" class="loading">
          Loading timetable entries...
        </div>

        <div v-else-if="timetableStore.entries.length === 0 && !showEntryForm" class="no-entries">
          No timetable entries found for this course. Add your first entry!
        </div>

        <div v-else-if="!showEntryForm" class="entries-list">
          <div
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="entry-card"
          >
            <div class="card-header">
              <div class="entry-info">
                <h3>{{ formatDayOfWeek(entry.dayOfWeek) }}</h3>
                <div class="entry-details">
                  <span class="time-badge">
                    <i class="fas fa-clock"></i>
                    {{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}
                  </span>
                  <span class="duration-badge">
                    {{ formatDuration(entry.durationMinutes) }}
                  </span>
                  <span v-if="entry.location" class="location-badge">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ entry.location }}
                  </span>
                </div>
              </div>
              <div class="entry-actions">
                <button
                  @click="editEntry(entry)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDeleteEntry(entry)"
                  class="btn-icon btn-delete"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="course-info">
              <strong>{{ entry.courseCode }}</strong> - {{ entry.courseName }}
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="entryToDelete" class="modal-overlay" @click.self="cancelDeleteEntry">
        <div class="modal-content">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this timetable entry?</p>
          <div class="modal-actions">
            <button @click="deleteEntry" class="btn-delete-confirm" :disabled="timetableStore.loading">
              {{ timetableStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="cancelDeleteEntry" class="btn-cancel" :disabled="timetableStore.loading">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTimetableStore } from '@/stores/timetable'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import TimetableEntryForm from '@/components/timetable/TimetableEntryForm.vue'

const route = useRoute()
const timetableStore = useTimetableStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedCourseId = ref(null)
const myCourses = ref([])
const showEntryForm = ref(false)
const editingEntry = ref(null)
const entryToDelete = ref(null)
const entryFormError = ref(null)

const sortedEntries = computed(() => {
  const dayOrder = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7
  }
  
  return [...timetableStore.entries].sort((a, b) => {
    const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99)
    if (dayDiff !== 0) return dayDiff
    return a.startTime.localeCompare(b.startTime)
  })
})

onMounted(async () => {
  await loadMyCourses()
  
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadTimetable()
  }
})

const loadMyCourses = async () => {
  try {
    const user = authStore.user
    if (user && user.role === 'PROFESSOR') {
      await courseStore.fetchCoursesByProfessor(user.id)
      myCourses.value = courseStore.courses
    } else {
      toast.error('Access denied. Only professors can manage timetables.')
      myCourses.value = []
    }
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadTimetable()
  } else {
    timetableStore.entries = []
  }
}

const loadTimetable = async () => {
  if (!selectedCourseId.value) return
  
  try {
    await timetableStore.fetchTimetableByCourse(selectedCourseId.value)
  } catch (err) {
    toast.error('Failed to load timetable')
    console.error('Failed to load timetable:', err)
  }
}

const showCreateEntryForm = () => {
  editingEntry.value = null
  showEntryForm.value = true
  timetableStore.clearError()
  entryFormError.value = null
}

const editEntry = (entry) => {
  editingEntry.value = entry
  showEntryForm.value = true
  timetableStore.clearError()
  entryFormError.value = null
}

const cancelEntryForm = () => {
  showEntryForm.value = false
  editingEntry.value = null
  timetableStore.clearError()
  entryFormError.value = null
}

const handleEntrySubmit = async (entryData) => {
  entryFormError.value = null
  timetableStore.clearError()
  try {
    if (editingEntry.value) {
      await timetableStore.updateTimetableEntry(editingEntry.value.id, entryData)
      toast.success('Timetable entry updated successfully!')
    } else {
      await timetableStore.createTimetableEntry(selectedCourseId.value, entryData)
      toast.success('Timetable entry created successfully!')
    }
    cancelEntryForm()
    await loadTimetable()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to save timetable entry'
    entryFormError.value = errorMsg
    toast.error(errorMsg)
  }
}

const confirmDeleteEntry = (entry) => {
  entryToDelete.value = entry
}

const cancelDeleteEntry = () => {
  entryToDelete.value = null
}

const deleteEntry = async () => {
  if (!entryToDelete.value) return
  try {
    await timetableStore.deleteTimetableEntry(entryToDelete.value.id)
    toast.success('Timetable entry deleted successfully!')
    cancelDeleteEntry()
    await loadTimetable()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to delete timetable entry'
    toast.error(errorMsg)
  }
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
</script>

<style scoped>
.timetable-management {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  color: #333;
  margin: 0;
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

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.btn-create {
  background: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-create:hover {
  background: #45a049;
}

.entry-form-section {
  margin-top: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.loading,
.no-entries {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.entries-list {
  display: grid;
  gap: 15px;
}

.entry-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.entry-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.entry-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  font-size: 18px;
}

.entry-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-badge,
.duration-badge,
.location-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.time-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.duration-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.location-badge {
  background: #fff3e0;
  color: #e65100;
}

.entry-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  color: #666;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #f5f5f5;
  color: #333;
}

.btn-delete {
  color: #f44336;
}

.btn-delete:hover {
  background: #ffebee;
  color: #d32f2f;
}

.course-info {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
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
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
}

.modal-content p {
  color: #666;
  margin-bottom: 25px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-delete-confirm,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-delete-confirm {
  background: #f44336;
  color: white;
}

.btn-delete-confirm:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover:not(:disabled) {
  background: #ccc;
}

.btn-delete-confirm:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .page-header,
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .entry-card {
    padding: 15px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

