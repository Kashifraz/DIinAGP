<template>
  <div class="course-list">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Course Management</h1>
        <button v-if="!showForm" @click="showCreateForm" class="btn-create">
          + Create New Course
        </button>
      </div>

      <!-- Filters -->
      <div v-if="!showForm" class="filters">
        <div class="filter-group">
          <label for="majorFilter">Filter by Major:</label>
          <select
            id="majorFilter"
            v-model="selectedMajorId"
            @change="handleMajorFilter"
            class="filter-select"
          >
            <option :value="null">All Majors</option>
            <option v-for="major in majors" :key="major.id" :value="major.id">
              {{ major.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="showForm" class="form-section">
        <h2>{{ editingCourse ? 'Edit Course' : 'Create New Course' }}</h2>
        <CourseForm
          :course="editingCourse"
          :loading="courseStore.loading"
          :error="formError || courseStore.error"
          @submit="handleFormSubmit"
          @cancel="cancelForm"
        />
      </div>

      <div v-if="courseStore.error && !showForm" class="error-message">
        {{ courseStore.error }}
      </div>

      <div v-if="courseStore.loading && !showForm" class="loading">
        Loading courses...
      </div>

      <div v-else-if="courseStore.courses.length === 0 && !showForm" class="no-courses">
        No courses found. Create your first course!
      </div>

      <div v-else-if="!showForm" class="courses-table-container">
        <table class="courses-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Major</th>
              <th>Professor</th>
              <th>Credit Hours</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courseStore.courses" :key="course.id">
              <td><strong>{{ course.code }}</strong></td>
              <td>{{ course.name }}</td>
              <td>{{ course.majorName }}</td>
              <td>
                <span v-if="course.professorName">{{ course.professorName }}</span>
                <span v-else class="no-professor">No Professor</span>
              </td>
              <td>{{ course.creditHours }}</td>
              <td>{{ formatDate(course.startDate) }}</td>
              <td>{{ formatDate(course.endDate) }}</td>
              <td>
                <span class="status-badge" :class="course.status?.toLowerCase()">
                  {{ course.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editCourse(course)" class="btn-edit">Edit</button>
                  <button
                    v-if="!course.professorId"
                    @click="showAssignProfessor(course)"
                    class="btn-assign"
                  >
                    Assign Professor
                  </button>
                  <button
                    v-else
                    @click="showReassignProfessor(course)"
                    class="btn-reassign"
                  >
                    Reassign
                  </button>
                  <router-link
                    :to="`/enrollments/course/${course.id}`"
                    class="btn-enroll"
                  >
                    Manage Enrollment
                  </router-link>
                  <router-link
                    v-if="course.professorId"
                    :to="`/content/course/${course.id}`"
                    class="btn-content"
                  >
                    Manage Content
                  </router-link>
                  <router-link
                    v-if="course.professorId"
                    :to="`/assessments/course/${course.id}`"
                    class="btn-assessments"
                  >
                    Manage Assessments
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Assign Professor Modal -->
    <div v-if="courseToAssign" class="modal-overlay" @click="cancelAssignProfessor">
      <div class="modal-content" @click.stop>
        <h3>{{ courseToAssign.professorId ? 'Reassign Professor' : 'Assign Professor' }}</h3>
        <p>Course: <strong>{{ courseToAssign.name }}</strong> ({{ courseToAssign.code }})</p>
        <div class="form-group">
          <label for="professorSelect">Select Professor:</label>
          <ProfessorSelector
            id="professorSelect"
            v-model="selectedProfessorId"
            :current-professor-id="courseToAssign.professorId"
          />
        </div>
        <div class="modal-actions">
          <button
            @click="handleAssignProfessor"
            :disabled="courseStore.loading || !selectedProfessorId"
            class="btn-confirm"
          >
            {{ courseStore.loading ? 'Assigning...' : 'Assign' }}
          </button>
          <button @click="cancelAssignProfessor" class="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'
import { useMajorStore } from '@/stores/major'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import CourseForm from '@/components/course/CourseForm.vue'
import ProfessorSelector from '@/components/course/ProfessorSelector.vue'

const courseStore = useCourseStore()
const majorStore = useMajorStore()
const toast = useToast()

const showForm = ref(false)
const editingCourse = ref(null)
const courseToAssign = ref(null)
const selectedProfessorId = ref(null)
const formError = ref(null)
const selectedMajorId = ref(null)
const majors = ref([])

onMounted(async () => {
  await Promise.all([
    courseStore.fetchCourses(),
    majorStore.fetchMajors()
  ])
  majors.value = majorStore.majors
})

const showCreateForm = () => {
  editingCourse.value = null
  showForm.value = true
  courseStore.clearError()
  formError.value = null
}

const editCourse = (course) => {
  editingCourse.value = course
  showForm.value = true
  courseStore.clearError()
  formError.value = null
}

const cancelForm = () => {
  showForm.value = false
  editingCourse.value = null
  courseStore.clearError()
  formError.value = null
}

const handleMajorFilter = async () => {
  if (selectedMajorId.value) {
    await courseStore.fetchCourses({ majorId: selectedMajorId.value })
  } else {
    await courseStore.fetchCourses()
  }
}

const extractErrorMessage = (error) => {
  if (!error) return null
  
  if (error.response?.data) {
    const errorData = error.response.data
    
    // Handle validation errors with field errors
    if (errorData.fieldErrors) {
      const fieldErrors = errorData.fieldErrors
      const errorMessages = Object.entries(fieldErrors).map(([field, msg]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()
        return `${fieldName}: ${msg}`
      })
      
      return {
        message: 'Please fix the following errors:',
        errors: errorMessages
      }
    }
    
    // Handle validation errors with errors array
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return {
        message: 'Please fix the following errors:',
        errors: errorData.errors
      }
    }
    
    // Handle validation errors with details
    if (errorData.message && errorData.message.includes('Validation failed')) {
      if (errorData.details) {
        return {
          message: 'Please fix the following errors:',
          errors: Array.isArray(errorData.details) 
            ? errorData.details 
            : [errorData.details]
        }
      }
    }
    
    return errorData.message || errorData.details || 'An error occurred'
  }
  
  return error.message || 'An error occurred'
}

const handleFormSubmit = async (formData) => {
  formError.value = null
  courseStore.clearError()
  
  try {
    if (editingCourse.value) {
      await courseStore.updateCourse(editingCourse.value.id, formData)
      toast.success('Course updated successfully!')
    } else {
      await courseStore.createCourse(formData)
      toast.success('Course created successfully!')
    }
    showForm.value = false
    editingCourse.value = null
    await courseStore.fetchCourses(selectedMajorId.value ? { majorId: selectedMajorId.value } : {})
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    formError.value = errorMsg
    
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save course. Please try again.')
    }
  }
}

const showAssignProfessor = (course) => {
  courseToAssign.value = course
  selectedProfessorId.value = null
}

const showReassignProfessor = (course) => {
  courseToAssign.value = course
  selectedProfessorId.value = course.professorId
}

const cancelAssignProfessor = () => {
  courseToAssign.value = null
  selectedProfessorId.value = null
}

const handleAssignProfessor = async () => {
  if (!courseToAssign.value || !selectedProfessorId.value) return
  
  try {
    await courseStore.assignProfessor(courseToAssign.value.id, selectedProfessorId.value)
    toast.success('Professor assigned successfully!')
    cancelAssignProfessor()
    await courseStore.fetchCourses(selectedMajorId.value ? { majorId: selectedMajorId.value } : {})
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to assign professor')
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.course-list {
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

.btn-create {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-create:hover {
  background: #45a049;
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading,
.no-courses {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
}

.courses-table-container {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table thead {
  background: #f5f5f5;
}

.courses-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.courses-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #666;
}

.courses-table tbody tr:hover {
  background: #f9f9f9;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.archived {
  background: #9e9e9e;
  color: white;
}

.no-professor {
  color: #999;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-edit,
.btn-assign,
.btn-reassign {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-assign {
  background: #4caf50;
  color: white;
}

.btn-assign:hover {
  background: #45a049;
}

.btn-reassign {
  background: #ff9800;
  color: white;
}

.btn-reassign:hover {
  background: #f57c00;
}

.btn-enroll {
  padding: 6px 12px;
  background: #9c27b0;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-enroll:hover {
  background: #7b1fa2;
}

.btn-content {
  padding: 6px 12px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-content:hover {
  background: #f57c00;
}

.btn-assessments {
  padding: 6px 12px;
  background: #e91e63;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn-assessments:hover {
  background: #c2185b;
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

.modal-content .form-group {
  margin: 20px 0;
}

.modal-content .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
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
  background: #4caf50;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #45a049;
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

