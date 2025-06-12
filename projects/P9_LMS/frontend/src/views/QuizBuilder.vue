<template>
  <div class="quiz-builder">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Quiz Builder</h1>
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
              <i class="fas fa-list-ol"></i>
              {{ questions.length }} Question(s)
            </span>
            <span class="stat-item">
              <i class="fas fa-percentage"></i>
              Weight: {{ assessment.weightPercentage }}%
            </span>
            <span class="stat-item">
              <i class="fas fa-star"></i>
              Max Marks: {{ assessment.maximumMarks }}
            </span>
            <span v-if="assessment.timeLimitMinutes" class="stat-item">
              <i class="fas fa-clock"></i>
              Time Limit: {{ assessment.timeLimitMinutes }} min
            </span>
            <span class="stat-item" :class="assessment.status?.toLowerCase()">
              <i class="fas fa-info-circle"></i>
              {{ assessment.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Question Form -->
      <div v-if="showQuestionForm" class="section">
        <h2>{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</h2>
        <QuestionForm
          :question="editingQuestion"
          :loading="assessmentStore.loading"
          :error="questionFormError || assessmentStore.error"
          @submit="handleQuestionSubmit"
          @cancel="cancelQuestionForm"
        />
      </div>

      <!-- Questions List -->
      <div v-if="!showQuestionForm" class="section">
        <div class="section-header">
          <h2>Questions</h2>
          <button
            v-if="assessment?.status === 'DRAFT'"
            @click="showCreateQuestionForm"
            class="btn-create"
          >
            <i class="fas fa-plus"></i> Add Question
          </button>
        </div>

        <div v-if="assessmentStore.loading" class="loading">
          Loading questions...
        </div>

        <div v-else-if="questions.length === 0" class="no-questions">
          No questions found. Add your first question!
        </div>

        <div v-else class="questions-list">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-card"
          >
            <div class="question-header">
              <div class="question-number">
                <span class="number-badge">{{ index + 1 }}</span>
              </div>
              <div class="question-content">
                <h4>{{ question.questionText }}</h4>
                <div class="question-meta">
                  <span class="type-badge" :class="question.questionType?.toLowerCase().replace('_', '-')">
                    {{ formatQuestionType(question.questionType) }}
                  </span>
                  <span class="points-badge">
                    {{ question.points }} point(s)
                  </span>
                </div>
                <div v-if="question.questionType === 'MULTIPLE_CHOICE' && question.options" class="question-options">
                  <strong>Options:</strong>
                  <ul>
                    <li v-for="(option, optIndex) in question.options" :key="optIndex">
                      {{ option }}
                      <span v-if="option === question.correctAnswer" class="correct-mark">
                        <i class="fas fa-check-circle"></i> Correct
                      </span>
                    </li>
                  </ul>
                </div>
                <div v-else class="question-answer">
                  <strong>Correct Answer:</strong> {{ question.correctAnswer }}
                </div>
              </div>
              <div v-if="assessment?.status === 'DRAFT'" class="question-actions">
                <button
                  @click="editQuestion(question)"
                  class="btn-icon"
                  title="Edit"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDeleteQuestion(question)"
                  class="btn-icon btn-delete"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="questionToDelete" class="modal-overlay" @click.self="cancelDeleteQuestion">
        <div class="modal-content">
          <h3>Delete Question</h3>
          <p>Are you sure you want to delete this question?</p>
          <p class="warning">This action cannot be undone.</p>
          <div class="modal-actions">
            <button
              @click="handleDeleteQuestion"
              :disabled="assessmentStore.loading"
              class="btn-confirm"
            >
              {{ assessmentStore.loading ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="cancelDeleteQuestion" class="btn-cancel-modal">Cancel</button>
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
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import QuestionForm from '@/components/assessment/QuestionForm.vue'

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()
const toast = useToast()

const assessmentId = ref(null)
const assessment = ref(null)
const questions = ref([])
const showQuestionForm = ref(false)
const editingQuestion = ref(null)
const questionToDelete = ref(null)
const questionFormError = ref(null)

onMounted(async () => {
  assessmentId.value = parseInt(route.params.assessmentId)
  await loadAssessment()
  await loadQuestions()
})

const loadAssessment = async () => {
  if (!assessmentId.value) return
  
  try {
    assessment.value = await assessmentStore.fetchAssessmentById(assessmentId.value)
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
    toast.error('Failed to load questions')
    console.error('Failed to load questions:', err)
  }
}

const showCreateQuestionForm = () => {
  editingQuestion.value = null
  showQuestionForm.value = true
  assessmentStore.clearError()
  questionFormError.value = null
}

const editQuestion = (question) => {
  editingQuestion.value = question
  showQuestionForm.value = true
  assessmentStore.clearError()
  questionFormError.value = null
}

const cancelQuestionForm = () => {
  showQuestionForm.value = false
  editingQuestion.value = null
  assessmentStore.clearError()
  questionFormError.value = null
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

const handleQuestionSubmit = async (formData) => {
  questionFormError.value = null
  assessmentStore.clearError()
  
  try {
    if (editingQuestion.value) {
      await assessmentStore.updateQuestion(editingQuestion.value.id, formData)
      toast.success('Question updated successfully!')
    } else {
      await assessmentStore.addQuestion(assessmentId.value, formData)
      toast.success('Question added successfully!')
    }
    showQuestionForm.value = false
    editingQuestion.value = null
    await loadQuestions()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    questionFormError.value = errorMsg
    
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save question. Please try again.')
    }
  }
}

const confirmDeleteQuestion = (question) => {
  questionToDelete.value = question
}

const cancelDeleteQuestion = () => {
  questionToDelete.value = null
}

const handleDeleteQuestion = async () => {
  if (!questionToDelete.value) return
  
  try {
    await assessmentStore.deleteQuestion(questionToDelete.value.id)
    toast.success('Question deleted successfully!')
    questionToDelete.value = null
    await loadQuestions()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to delete question')
  }
}

const formatQuestionType = (type) => {
  if (!type) return ''
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>

<style scoped>
.quiz-builder {
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

.stat-item i {
  color: #999;
}

.stat-item.draft {
  color: #e65100;
}

.stat-item.published {
  color: #2e7d32;
}

.stat-item.closed {
  color: #c2185b;
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

.loading,
.no-questions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.question-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.question-number {
  flex-shrink: 0;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 16px;
}

.question-content {
  flex: 1;
  min-width: 0;
}

.question-content h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
}

.question-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.type-badge,
.points-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.multiple-choice {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.true-false {
  background: #fff3e0;
  color: #e65100;
}

.type-badge.short-answer {
  background: #f3e5f5;
  color: #7b1fa2;
}

.points-badge {
  background: #f5f5f5;
  color: #666;
}

.question-options,
.question-answer {
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
}

.question-options ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.question-options li {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.correct-mark {
  color: #4caf50;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.question-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
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

  .question-header {
    flex-direction: column;
  }

  .question-actions {
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

