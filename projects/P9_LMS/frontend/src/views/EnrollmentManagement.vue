<template>
  <div class="enrollment-management">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Course Enrollment Management</h1>
        <router-link to="/courses" class="btn-back">
          ← Back to Courses
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
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.code }} - {{ course.name }} ({{ course.majorName }})
            </option>
          </select>
        </div>
      </div>

      <!-- Enrollment Form -->
      <div v-if="selectedCourseId" class="section">
        <h2>Enroll Students</h2>
        <div class="enrollment-form">
          <StudentSelector
            v-model="selectedStudentIds"
            :disabled="enrollmentStore.loading"
            :exclude-ids="enrolledStudentIds"
          />
          
          <div class="form-actions">
            <button
              @click="handleBulkEnroll"
              :disabled="enrollmentStore.loading || selectedStudentIds.length === 0"
              class="btn-enroll"
            >
              {{ enrollmentStore.loading ? 'Enrolling...' : `Enroll ${selectedStudentIds.length} Student(s)` }}
            </button>
            <button
              @click="clearSelection"
              class="btn-clear"
              :disabled="enrollmentStore.loading || selectedStudentIds.length === 0"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <!-- Enrolled Students List -->
      <div v-if="selectedCourseId" class="section">
        <h2>Enrolled Students</h2>
        <EnrolledStudentsList
          :enrollments="enrollmentStore.currentEnrollments"
          :loading="enrollmentStore.loading"
          @drop="handleDropEnrollment"
        />
      </div>

      <!-- Error Messages -->
      <div v-if="enrollmentStore.error" class="error-message">
        {{ enrollmentStore.error }}
      </div>
    </div>

    <!-- Drop Confirmation Modal -->
    <div v-if="enrollmentToDrop" class="modal-overlay" @click="cancelDrop">
      <div class="modal-content" @click.stop>
        <h3>Confirm Drop Enrollment</h3>
        <p>
          Are you sure you want to drop 
          <strong>{{ enrollmentToDrop.studentFirstName }} {{ enrollmentToDrop.studentLastName }}</strong>
          from <strong>{{ enrollmentToDrop.courseName }}</strong>?
        </p>
        <div class="modal-actions">
          <button
            @click="confirmDrop"
            :disabled="enrollmentStore.loading"
            class="btn-confirm"
          >
            {{ enrollmentStore.loading ? 'Dropping...' : 'Drop Enrollment' }}
          </button>
          <button @click="cancelDrop" class="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEnrollmentStore } from '@/stores/enrollment'
import { useCourseStore } from '@/stores/course'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import StudentSelector from '@/components/enrollment/StudentSelector.vue'
import EnrolledStudentsList from '@/components/enrollment/EnrolledStudentsList.vue'

const route = useRoute()
const router = useRouter()
const enrollmentStore = useEnrollmentStore()
const courseStore = useCourseStore()
const toast = useToast()

const courses = ref([])
const selectedCourseId = ref(null)
const selectedStudentIds = ref([])
const enrollmentToDrop = ref(null)

const enrolledStudentIds = computed(() => {
  return enrollmentStore.currentEnrollments
    .filter(e => e.status === 'ACTIVE')
    .map(e => e.studentId)
})

onMounted(async () => {
  await loadCourses()
  
  // Check if courseId is provided in route params
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadEnrollments()
  }
})

const loadCourses = async () => {
  try {
    await courseStore.fetchCourses()
    courses.value = courseStore.courses
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadEnrollments()
    selectedStudentIds.value = []
  } else {
    enrollmentStore.currentEnrollments = []
  }
}

const loadEnrollments = async () => {
  if (!selectedCourseId.value) return
  
  try {
    await enrollmentStore.fetchEnrollmentsByCourse(selectedCourseId.value)
  } catch (err) {
    toast.error('Failed to load enrollments')
    console.error('Failed to load enrollments:', err)
  }
}

const handleBulkEnroll = async () => {
  if (!selectedCourseId.value || selectedStudentIds.value.length === 0) return
  
  enrollmentStore.clearError()
  
  try {
    await enrollmentStore.bulkEnrollStudents(selectedCourseId.value, selectedStudentIds.value)
    toast.success(`Successfully enrolled ${selectedStudentIds.value.length} student(s)!`)
    selectedStudentIds.value = []
    await loadEnrollments()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to enroll students'
    toast.error(errorMsg)
  }
}

const clearSelection = () => {
  selectedStudentIds.value = []
}

const handleDropEnrollment = (enrollment) => {
  enrollmentToDrop.value = enrollment
}

const cancelDrop = () => {
  enrollmentToDrop.value = null
}

const confirmDrop = async () => {
  if (!enrollmentToDrop.value) return
  
  try {
    await enrollmentStore.dropEnrollment(enrollmentToDrop.value.id)
    toast.success('Student dropped successfully!')
    enrollmentToDrop.value = null
    await loadEnrollments()
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to drop enrollment'
    toast.error(errorMsg)
  }
}
</script>

<style scoped>
.enrollment-management {
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
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.btn-back {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-block;
}

.btn-back:hover {
  background: #e0e0e0;
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
  margin: 0 0 20px 0;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-select:focus {
  outline: none;
  border-color: #4caf50;
}

.enrollment-form {
  margin-top: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-enroll,
.btn-clear {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-enroll {
  background: #4caf50;
  color: white;
}

.btn-enroll:hover:not(:disabled) {
  background: #45a049;
}

.btn-enroll:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-clear {
  background: #f5f5f5;
  color: #333;
}

.btn-clear:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
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
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-content p {
  margin: 10px 0;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-confirm,
.btn-cancel-modal {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-confirm {
  background: #f44336;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel-modal {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel-modal:hover {
  background: #e0e0e0;
}
</style>

