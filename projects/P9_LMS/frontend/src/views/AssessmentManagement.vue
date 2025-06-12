<template>
  <div class="assessment-management">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Assessment Management</h1>
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

      <!-- Assessment Management -->
      <div v-if="selectedCourseId" class="section">
        <div class="section-header">
          <h2>Assessments</h2>
          <button
            v-if="!showAssessmentForm"
            @click="showCreateAssessmentForm"
            class="btn-create"
          >
            <i class="fas fa-plus"></i> Create Assessment
          </button>
        </div>

        <!-- Assessment Form -->
        <div v-if="showAssessmentForm" class="assessment-form-section">
          <AssessmentForm
            :assessment="editingAssessment"
            :loading="assessmentStore.loading"
            :error="assessmentFormError || assessmentStore.error"
            @submit="handleAssessmentSubmit"
            @cancel="cancelAssessmentForm"
          />
        </div>

        <!-- Assessments List -->
        <div v-if="assessmentStore.loading && !showAssessmentForm" class="loading">
          Loading assessments...
        </div>

        <div v-else-if="assessmentStore.assessments.length === 0 && !showAssessmentForm" class="no-assessments">
          No assessments found. Create your first assessment!
        </div>

        <div v-else-if="!showAssessmentForm" class="assessments-list">
          <div
            v-for="assessment in assessmentStore.assessments"
            :key="assessment.id"
            class="assessment-card"
          >
            <div class="assessment-header">
              <div class="assessment-info">
                <h3>{{ assessment.title }}</h3>
                <div class="assessment-meta">
                  <span class="type-badge" :class="assessment.assessmentType?.toLowerCase()">
                    {{ assessment.assessmentType }}
                  </span>
                  <span class="status-badge" :class="assessment.status?.toLowerCase()">
                    {{ assessment.status }}
                  </span>
                  <span class="weight-badge">
                    Weight: {{ assessment.weightPercentage }}%
                  </span>
                  <span class="marks-badge">
                    Max Marks: {{ assessment.maximumMarks }}
                  </span>
                </div>
              </div>
              <div class="assessment-actions">
                <button
                  v-if="assessment.status === 'DRAFT'"
                  @click="editAssessment(assessment)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="assessment.status === 'DRAFT'"
                  @click="confirmDeleteAssessment(assessment)"
                  class="btn-icon btn-delete"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  v-if="assessment.status === 'DRAFT'"
                  @click="publishAssessment(assessment.id)"
                  class="btn-publish"
                  :disabled="assessmentStore.loading"
                >
                  <i class="fas fa-paper-plane"></i> Publish
                </button>
                <button
                  v-if="assessment.status === 'PUBLISHED'"
                  @click="closeAssessment(assessment.id)"
                  class="btn-close"
                  :disabled="assessmentStore.loading"
                >
                  <i class="fas fa-lock"></i> Close
                </button>
                <router-link
                  v-if="assessment.assessmentType === 'QUIZ'"
                  :to="`/assessments/${assessment.id}/quiz-builder`"
                  class="btn-quiz"
                >
                  <i class="fas fa-question-circle"></i> Manage Questions
                </router-link>
                <router-link
                  v-if="assessment.status === 'PUBLISHED'"
                  :to="`/assessments/${assessment.id}/grade`"
                  class="btn-submissions"
                >
                  <i class="fas fa-check-circle"></i> Submissions
                </router-link>
              </div>
            </div>
            <div v-if="assessment.description" class="assessment-description">
              {{ assessment.description }}
            </div>
            <div class="assessment-details">
              <div v-if="assessment.deadline" class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <strong>Deadline:</strong> {{ formatDateTime(assessment.deadline) }}
              </div>
              <div v-if="assessment.timeLimitMinutes" class="detail-item">
                <i class="fas fa-clock"></i>
                <strong>Time Limit:</strong> {{ assessment.timeLimitMinutes }} minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="assessmentToDelete" class="modal-overlay" @click.self="cancelDeleteAssessment">
        <div class="modal-content">
          <h3>Delete Assessment</h3>
          <p>Are you sure you want to delete <strong>{{ assessmentToDelete.title }}</strong>?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="modal-actions">
            <button
              @click="handleDeleteAssessment"
              :disabled="assessmentStore.loading"
              class="btn-confirm"
            >
              {{ assessmentStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="cancelDeleteAssessment" class="btn-cancel-modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import AssessmentForm from '@/components/assessment/AssessmentForm.vue'

const route = useRoute()
const assessmentStore = useAssessmentStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedCourseId = ref(null)
const myCourses = ref([])
const showAssessmentForm = ref(false)
const editingAssessment = ref(null)
const assessmentToDelete = ref(null)
const assessmentFormError = ref(null)

onMounted(async () => {
  await loadMyCourses()
  
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadAssessments()
  }
})

const loadMyCourses = async () => {
  try {
    const user = authStore.user
    if (user && user.role === 'PROFESSOR') {
      await courseStore.fetchCoursesByProfessor(user.id)
      myCourses.value = courseStore.courses
    } else {
      await courseStore.fetchCourses()
      myCourses.value = courseStore.courses
    }
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadAssessments()
  } else {
    assessmentStore.assessments = []
  }
}

const loadAssessments = async () => {
  if (!selectedCourseId.value) return
  
  try {
    await assessmentStore.fetchAssessmentsByCourse(selectedCourseId.value)
  } catch (err) {
    toast.error('Failed to load assessments')
    console.error('Failed to load assessments:', err)
  }
}

const showCreateAssessmentForm = () => {
  editingAssessment.value = null
  showAssessmentForm.value = true
  assessmentStore.clearError()
  assessmentFormError.value = null
}

const editAssessment = (assessment) => {
  editingAssessment.value = assessment
  showAssessmentForm.value = true
  assessmentStore.clearError()
  assessmentFormError.value = null
}

const cancelAssessmentForm = () => {
  showAssessmentForm.value = false
  editingAssessment.value = null
  assessmentStore.clearError()
  assessmentFormError.value = null
}

const extractErrorMessage = (error) => {
  if (!error) return null
  
  if (error.response?.data) {
    const errorData = error.response.data
    
    if (errorData.fieldErrors) {
      const fieldErrors = errorData.fieldErrors
      const errorMessages = Object.entries(fieldErrors).map(([field, msg]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()
        return `${fieldName}: ${msg}`
      })
      
      return {
        message: 'Please fix the following errors:',
        errors: errorMessages,
        fieldErrors: fieldErrors
      }
    }
    
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return {
        message: 'Please fix the following errors:',
        errors: errorData.errors
      }
    }
    
    return errorData.message || errorData.details || 'An error occurred'
  }
  
  return error.message || 'An error occurred'
}

const handleAssessmentSubmit = async (formData) => {
  assessmentFormError.value = null
  assessmentStore.clearError()
  
  try {
    if (editingAssessment.value) {
      await assessmentStore.updateAssessment(editingAssessment.value.id, formData)
      toast.success('Assessment updated successfully!')
    } else {
      await assessmentStore.createAssessment(selectedCourseId.value, formData)
      toast.success('Assessment created successfully!')
    }
    showAssessmentForm.value = false
    editingAssessment.value = null
    await loadAssessments()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    assessmentFormError.value = errorMsg
    
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save assessment. Please try again.')
    }
  }
}

const confirmDeleteAssessment = (assessment) => {
  assessmentToDelete.value = assessment
}

const cancelDeleteAssessment = () => {
  assessmentToDelete.value = null
}

const handleDeleteAssessment = async () => {
  if (!assessmentToDelete.value) return
  
  try {
    await assessmentStore.deleteAssessment(assessmentToDelete.value.id)
    toast.success('Assessment deleted successfully!')
    assessmentToDelete.value = null
    await loadAssessments()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to delete assessment')
  }
}

const publishAssessment = async (assessmentId) => {
  try {
    await assessmentStore.publishAssessment(assessmentId)
    toast.success('Assessment published successfully!')
    await loadAssessments()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to publish assessment')
  }
}

const closeAssessment = async (assessmentId) => {
  try {
    await assessmentStore.closeAssessment(assessmentId)
    toast.success('Assessment closed successfully!')
    await loadAssessments()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to close assessment')
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}
</script>

<style scoped>
.assessment-management {
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
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
}

.btn-create {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-create:hover {
  background: #45a049;
}

.assessment-form-section {
  margin-bottom: 30px;
}

.loading,
.no-assessments {
  text-align: center;
  padding: 40px;
  color: #666;
}

.assessments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assessment-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.assessment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.assessment-info {
  flex: 1;
  min-width: 0;
}

.assessment-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.assessment-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.type-badge,
.status-badge,
.weight-badge,
.marks-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.assignment {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.quiz {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge.draft {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.published {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.closed {
  background: #fce4ec;
  color: #c2185b;
}

.weight-badge,
.marks-badge {
  background: #f5f5f5;
  color: #666;
}

.assessment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
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

.btn-publish,
.btn-close,
.btn-quiz,
.btn-submissions {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn-publish {
  background: #4caf50;
  color: white;
}

.btn-publish:hover:not(:disabled) {
  background: #45a049;
}

.btn-close {
  background: #ff9800;
  color: white;
}

.btn-close:hover:not(:disabled) {
  background: #f57c00;
}

.btn-quiz {
  background: #2196f3;
  color: white;
}

.btn-quiz:hover {
  background: #1976d2;
}

.btn-submissions {
  background: #ff9800;
  color: white;
}

.btn-submissions:hover {
  background: #f57c00;
}

.assessment-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.assessment-details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item i {
  color: #999;
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-content p {
  margin: 10px 0;
  color: #666;
}

.warning {
  color: #f44336;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .section {
    padding: 20px 15px;
  }

  .assessment-header {
    flex-direction: column;
  }

  .assessment-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-confirm,
  .btn-cancel-modal {
    width: 100%;
  }
}
</style>

