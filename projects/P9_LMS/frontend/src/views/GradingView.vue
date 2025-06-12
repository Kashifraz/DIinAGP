<template>
  <div class="grading-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Grade Submissions</h1>
        <router-link :to="`/assessments/course/${assessment?.courseId}`" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Assessments
        </router-link>
      </div>

      <!-- Assessment Info -->
      <div v-if="assessment" class="section">
        <div class="assessment-info-card">
          <h2>{{ assessment.title }}</h2>
          <p v-if="assessment.description">{{ assessment.description }}</p>
          <div class="assessment-stats">
            <span class="stat-item">
              <i class="fas fa-list-alt"></i>
              {{ assessment.assessmentType }}
            </span>
            <span class="stat-item">
              <i class="fas fa-star"></i>
              Max Marks: {{ assessment.maximumMarks }}
            </span>
            <span class="stat-item">
              <i class="fas fa-percentage"></i>
              Weight: {{ assessment.weightPercentage }}%
            </span>
            <span v-if="assessment.deadline" class="stat-item">
              <i class="fas fa-calendar-alt"></i>
              Deadline: {{ formatDateTime(assessment.deadline) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Submissions List -->
      <div class="section">
        <div class="section-header">
          <h2>Submissions</h2>
          <button
            @click="refreshSubmissions"
            :disabled="submissionStore.loading"
            class="btn-refresh"
          >
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <SubmissionList
          :submissions="submissionStore.submissions"
          :loading="submissionStore.loading"
          :can-grade="true"
          :maximum-marks="assessment?.maximumMarks || 100"
          @download="handleDownload"
          @grade="handleGrade"
          @edit-grade="handleEditGrade"
          @view="handleViewSubmission"
        />
      </div>

      <!-- Grade Modal -->
      <div v-if="showGradeModal" class="modal-overlay" @click.self="closeGradeModal">
        <div class="modal-content">
          <h3>{{ editingGrade ? 'Edit Grade' : 'Grade Submission' }}</h3>
          <div v-if="selectedSubmission" class="submission-info">
            <p><strong>Student:</strong> {{ selectedSubmission.studentName }}</p>
            <p><strong>Submitted:</strong> {{ formatDateTime(selectedSubmission.submissionDate) }}</p>
          </div>
          <GradeInput
            :grade="editingGrade"
            :maximum-marks="assessment?.maximumMarks || 100"
            :loading="gradeStore.loading"
            :error="gradeFormError || gradeStore.error"
            @submit="handleGradeSubmit"
            @cancel="closeGradeModal"
          />
        </div>
      </div>

      <!-- View Submission Modal -->
      <div v-if="showViewModal && viewingSubmission" class="modal-overlay" @click.self="closeViewModal">
        <div class="modal-content submission-modal">
          <h3>Submission Details</h3>
          <div class="submission-details">
            <div class="detail-section">
              <div class="detail-item">
                <strong>Student:</strong>
                <span>{{ viewingSubmission.studentName }} ({{ viewingSubmission.studentEmail }})</span>
              </div>
              <div class="detail-item">
                <strong>Submission Date:</strong>
                <span>{{ formatDateTime(viewingSubmission.submissionDate) }}</span>
              </div>
            </div>
            
            <div class="status-section">
              <strong>Status:</strong>
              <span class="status-badge-large" :class="viewingSubmission.status?.toLowerCase()">
                {{ viewingSubmission.status }}
              </span>
            </div>
            
            <div v-if="viewingSubmission.submittedFilePath" class="file-section">
              <strong>File:</strong>
              <button @click="handleDownload(viewingSubmission)" class="btn-download-file">
                <i class="fas fa-download"></i> Download File
              </button>
            </div>
            
            <div v-if="viewingSubmission.submittedAnswers" class="answers-section">
              <strong>Answers:</strong>
              <div class="answers-list">
                <div
                  v-for="(answer, questionId) in viewingSubmission.submittedAnswers"
                  :key="questionId"
                  class="answer-item"
                  :class="{ 'correct-answer': isAnswerCorrect(questionId, answer) }"
                >
                  <div class="answer-header">
                    <strong>Question {{ getQuestionNumber(questionId) }}:</strong>
                    <span v-if="isAnswerCorrect(questionId, answer)" class="correct-mark">
                      <i class="fas fa-check-circle"></i> Correct
                    </span>
                  </div>
                  <div class="answer-value">{{ answer }}</div>
                </div>
              </div>
            </div>
            
            <div v-if="viewingSubmission.marksObtained !== null && viewingSubmission.marksObtained !== undefined" class="grade-section">
              <strong>Grade:</strong>
              <span class="grade-display-large">
                {{ viewingSubmission.marksObtained }} / {{ assessment?.maximumMarks || 100 }}
              </span>
            </div>
            
            <div v-if="viewingSubmission.feedback" class="feedback-section">
              <strong>Feedback:</strong>
              <div class="feedback-box">
                {{ viewingSubmission.feedback }}
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="closeViewModal" class="btn-close-modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { useSubmissionStore } from '@/stores/submission'
import { useGradeStore } from '@/stores/grade'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import SubmissionList from '@/components/submission/SubmissionList.vue'
import GradeInput from '@/components/grade/GradeInput.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()
const submissionStore = useSubmissionStore()
const gradeStore = useGradeStore()
const toast = useToast()

const assessmentId = ref(null)
const assessment = ref(null)
const questions = ref([])
const showGradeModal = ref(false)
const showViewModal = ref(false)
const selectedSubmission = ref(null)
const editingGrade = ref(null)
const viewingSubmission = ref(null)
const gradeFormError = ref(null)

onMounted(async () => {
  assessmentId.value = parseInt(route.params.assessmentId)
  await loadAssessment()
  await loadSubmissions()
})

const loadAssessment = async () => {
  if (!assessmentId.value) return
  
  try {
    assessment.value = await assessmentStore.fetchAssessmentById(assessmentId.value)
    
    // Load questions if it's a quiz
    if (assessment.value.assessmentType === 'QUIZ') {
      await loadQuestions()
    }
  } catch (err) {
    toast.error('Failed to load assessment')
    console.error('Failed to load assessment:', err)
    router.push('/assessments')
  }
}

const loadQuestions = async () => {
  if (!assessmentId.value) return
  
  try {
    const data = await assessmentStore.fetchQuestionsByAssessment(assessmentId.value)
    questions.value = data
  } catch (err) {
    console.error('Failed to load questions:', err)
  }
}

const loadSubmissions = async () => {
  if (!assessmentId.value) return
  
  try {
    await submissionStore.fetchSubmissionsByAssessment(assessmentId.value)
  } catch (err) {
    toast.error('Failed to load submissions')
    console.error('Failed to load submissions:', err)
  }
}

const refreshSubmissions = async () => {
  await loadSubmissions()
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

const handleGrade = (submission) => {
  selectedSubmission.value = submission
  editingGrade.value = null
  showGradeModal.value = true
  gradeStore.clearError()
  gradeFormError.value = null
}

const handleEditGrade = (submission) => {
  selectedSubmission.value = submission
  editingGrade.value = {
    id: submission.gradeId,
    marksObtained: submission.marksObtained,
    feedback: submission.feedback
  }
  showGradeModal.value = true
  gradeStore.clearError()
  gradeFormError.value = null
}

const closeGradeModal = () => {
  showGradeModal.value = false
  selectedSubmission.value = null
  editingGrade.value = null
  gradeStore.clearError()
  gradeFormError.value = null
}

const handleGradeSubmit = async (gradeData) => {
  gradeFormError.value = null
  gradeStore.clearError()
  
  try {
    if (editingGrade.value) {
      await gradeStore.updateGrade(editingGrade.value.id, gradeData)
      toast.success('Grade updated successfully!')
    } else {
      await gradeStore.gradeSubmission(selectedSubmission.value.id, gradeData)
      toast.success('Submission graded successfully!')
    }
    closeGradeModal()
    await loadSubmissions()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    gradeFormError.value = errorMsg
    
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save grade. Please try again.')
    }
  }
}

const handleViewSubmission = (submission) => {
  viewingSubmission.value = submission
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = null
  viewingSubmission.value = null
}

const handleDownload = async (submission) => {
  if (!submission.submittedFilePath) {
    toast.error('No file available for download')
    return
  }

  try {
    const { submissionService } = await import('@/services/submissionService')
    const response = await submissionService.downloadSubmission(submission.id)
    
    // Extract filename from file path or use submission title
    const filePath = submission.submittedFilePath
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1) || `submission-${submission.id}`
    
    // Create blob and download
    const blob = new Blob([response.data], { type: response.type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('File downloaded successfully!')
  } catch (err) {
    toast.error('Failed to download file')
    console.error('Download error:', err)
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}

const getQuestionNumber = (questionId) => {
  if (!questions.value || questions.value.length === 0) return questionId
  
  // Find the index of the question to show its number
  const question = questions.value.find(q => q.id.toString() === questionId.toString())
  if (question) {
    const index = questions.value.findIndex(q => q.id === question.id)
    return index !== -1 ? index + 1 : questionId
  }
  return questionId
}

const isAnswerCorrect = (questionId, studentAnswer) => {
  if (!questions.value || questions.value.length === 0) return false
  
  // Find the question by ID (questionId might be a string, so we need to convert)
  const question = questions.value.find(q => q.id.toString() === questionId.toString())
  
  if (!question) return false
  
  // Compare student answer with correct answer
  // For TRUE_FALSE, normalize the answer
  if (question.questionType === 'TRUE_FALSE') {
    const normalizedStudentAnswer = String(studentAnswer).toLowerCase().trim()
    const normalizedCorrectAnswer = String(question.correctAnswer).toLowerCase().trim()
    return normalizedStudentAnswer === normalizedCorrectAnswer
  }
  
  // For MULTIPLE_CHOICE and SHORT_ANSWER, do direct comparison
  return String(studentAnswer).trim() === String(question.correctAnswer).trim()
}
</script>

<style scoped>
.grading-view {
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
  font-size: 20px;
}

.btn-refresh {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-refresh:hover:not(:disabled) {
  background: #1976d2;
}

.btn-refresh:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.assessment-info-card {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
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

.assessment-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
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
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.submission-modal {
  max-width: 600px;
}

.modal-content h3 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.submission-info {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.submission-info p {
  margin: 5px 0;
  color: #666;
}

.submission-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item strong {
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-item span {
  color: #666;
  font-size: 14px;
}

.status-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.status-section strong {
  color: #333;
  font-size: 14px;
}

.status-badge-large {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
  width: fit-content;
}

.status-badge-large.submitted {
  background: #fff3e0;
  color: #e65100;
}

.status-badge-large.graded {
  background: #e8f5e9;
  color: #2e7d32;
}

.file-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-section strong {
  color: #333;
  font-size: 14px;
}

.btn-download-file {
  padding: 10px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  transition: background 0.3s;
}

.btn-download-file:hover {
  background: #1976d2;
}

.answers-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answers-section strong {
  color: #333;
  font-size: 14px;
}

.answers-list {
  margin-top: 5px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.answer-item {
  margin: 8px 0;
  padding: 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
}

.answer-item.correct-answer {
  background: #e8f5e9;
  border-color: #4caf50;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.answer-header strong {
  color: #333;
}

.answer-value {
  color: #666;
  margin-top: 4px;
}

.correct-mark {
  color: #4caf50;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.correct-mark i {
  font-size: 16px;
}

.grade-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.grade-section strong {
  color: #333;
  font-size: 14px;
}

.grade-display-large {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
}

.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-section strong {
  color: #333;
  font-size: 14px;
}

.feedback-box {
  margin-top: 5px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-close-modal:hover {
  background: #e0e0e0;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.submitted {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.graded {
  background: #e8f5e9;
  color: #2e7d32;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .section {
    padding: 20px 15px;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>

