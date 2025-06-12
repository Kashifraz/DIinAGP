<template>
  <div class="submission-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Submit Assessment</h1>
        <router-link to="/dashboard" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </router-link>
      </div>

      <div v-if="loading && !assessment" class="loading">Loading assessment...</div>

      <div v-else-if="assessment" class="section">
        <!-- Assessment Info -->
        <div class="assessment-info-card">
          <h2>{{ assessment.title }}</h2>
          <p v-if="assessment.description">{{ assessment.description }}</p>
          <div class="assessment-details">
            <span class="detail-item">
              <i class="fas fa-list-alt"></i>
              Type: {{ assessment.assessmentType }}
            </span>
            <span class="detail-item">
              <i class="fas fa-star"></i>
              Max Marks: {{ assessment.maximumMarks }}
            </span>
            <span v-if="assessment.deadline" class="detail-item">
              <i class="fas fa-calendar-alt"></i>
              Deadline: {{ formatDateTime(assessment.deadline) }}
            </span>
            <span v-if="assessment.timeLimitMinutes" class="detail-item">
              <i class="fas fa-clock"></i>
              Time Limit: {{ assessment.timeLimitMinutes }} minutes
            </span>
          </div>
        </div>

        <!-- Submission Status -->
        <div v-if="existingSubmission" class="submission-status-card">
          <div class="status-header">
            <i class="fas fa-check-circle"></i>
            <h3>Already Submitted</h3>
          </div>
          <p>You submitted this assessment on {{ formatDateTime(existingSubmission.submissionDate) }}</p>
          <div v-if="existingSubmission.status === 'GRADED' && existingSubmission.marksObtained !== null" class="grade-info">
            <strong>Grade: {{ existingSubmission.marksObtained }} / {{ assessment.maximumMarks }}</strong>
            <p v-if="existingSubmission.feedback" class="feedback">{{ existingSubmission.feedback }}</p>
          </div>
        </div>

        <!-- Assignment Submission Form -->
        <div v-else-if="assessment.assessmentType === 'ASSIGNMENT'" class="submission-form-section">
          <h3>Upload Assignment</h3>
          <FileUpload
            v-model="selectedFile"
            @error="handleUploadError"
            :accepted-types="'.pdf,.doc,.docx,.ppt,.pptx'"
          />
          <button
            @click="handleSubmitAssignment"
            :disabled="!selectedFile || submissionStore.loading"
            class="btn-submit"
          >
            {{ submissionStore.loading ? 'Submitting...' : 'Submit Assignment' }}
          </button>
        </div>

        <!-- Quiz Taking View -->
        <div v-else-if="assessment.assessmentType === 'QUIZ'">
          <QuizTakingView
            :assessment="assessment"
            :questions="questions"
            :loading="questionsLoading"
            :submitted="!!existingSubmission"
            :submission-date="existingSubmission?.submissionDate"
            @submit="handleSubmitQuiz"
          />
        </div>
      </div>

      <div v-else class="error-message">
        Assessment not found or you don't have access to it.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { useSubmissionStore } from '@/stores/submission'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import FileUpload from '@/components/content/FileUpload.vue'
import QuizTakingView from '@/components/submission/QuizTakingView.vue'

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()
const submissionStore = useSubmissionStore()
const authStore = useAuthStore()
const toast = useToast()

const assessmentId = ref(null)
const assessment = ref(null)
const questions = ref([])
const questionsLoading = ref(false)
const selectedFile = ref(null)
const existingSubmission = ref(null)

onMounted(async () => {
  assessmentId.value = parseInt(route.params.assessmentId)
  await loadAssessment()
  await checkExistingSubmission()
})

const loadAssessment = async () => {
  if (!assessmentId.value) return
  
  try {
    assessment.value = await assessmentStore.fetchAssessmentById(assessmentId.value)
    
    if (assessment.value.assessmentType === 'QUIZ') {
      await loadQuestions()
    }
  } catch (err) {
    toast.error('Failed to load assessment')
    console.error('Failed to load assessment:', err)
    router.push('/dashboard')
  }
}

const loadQuestions = async () => {
  if (!assessmentId.value) return
  
  questionsLoading.value = true
  try {
    const data = await assessmentStore.fetchQuestionsByAssessment(assessmentId.value)
    questions.value = data
  } catch (err) {
    toast.error('Failed to load questions')
    console.error('Failed to load questions:', err)
  } finally {
    questionsLoading.value = false
  }
}

const checkExistingSubmission = async () => {
  if (!assessmentId.value || !authStore.user) return
  
  try {
    const submissions = await submissionStore.fetchSubmissionsByStudent(authStore.user.id)
    existingSubmission.value = submissions.find(s => s.assessmentId === assessmentId.value)
  } catch (err) {
    console.error('Failed to check existing submission:', err)
  }
}

const handleUploadError = (error) => {
  toast.error(error)
}

const handleSubmitAssignment = async () => {
  if (!selectedFile.value) {
    toast.error('Please select a file to upload')
    return
  }

  try {
    await submissionStore.submitAssignment(assessmentId.value, selectedFile.value)
    toast.success('Assignment submitted successfully!')
    selectedFile.value = null
    await checkExistingSubmission()
  } catch (err) {
    const errorMsg = err.formattedMessage || err.response?.data?.message || 'Failed to submit assignment'
    toast.error(errorMsg)
  }
}

const handleSubmitQuiz = async (answers) => {
  try {
    await submissionStore.submitQuiz(assessmentId.value, answers)
    toast.success('Quiz submitted successfully!')
    await checkExistingSubmission()
  } catch (err) {
    const errorMsg = err.formattedMessage || err.response?.data?.message || 'Failed to submit quiz'
    toast.error(errorMsg)
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}
</script>

<style scoped>
.submission-view {
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
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.assessment-info-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.assessment-info-card h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.assessment-info-card p {
  color: #666;
  margin: 0 0 15px 0;
  line-height: 1.6;
}

.assessment-details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.submission-status-card {
  padding: 20px;
  background: #e8f5e9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #2e7d32;
}

.status-header i {
  font-size: 24px;
}

.status-header h3 {
  margin: 0;
  color: #2e7d32;
}

.grade-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #c8e6c9;
}

.grade-info strong {
  color: #2e7d32;
  font-size: 18px;
}

.feedback {
  margin-top: 10px;
  color: #666;
  font-style: italic;
}

.submission-form-section {
  margin-top: 20px;
}

.submission-form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.btn-submit {
  margin-top: 20px;
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

.btn-submit:hover:not(:disabled) {
  background: #45a049;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .section {
    padding: 20px 15px;
  }

  .assessment-details {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

