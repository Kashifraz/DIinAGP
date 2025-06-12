<template>
  <div class="quiz-taking-view">
    <div v-if="loading" class="loading">Loading quiz...</div>

    <div v-else-if="assessment" class="quiz-container">
      <div class="quiz-header">
        <h2>{{ assessment.title }}</h2>
        <div v-if="assessment.description" class="quiz-description">
          {{ assessment.description }}
        </div>
        <div class="quiz-info">
          <span class="info-item">
            <i class="fas fa-clock"></i>
            <span v-if="timeLimitMinutes">Time Limit: {{ timeLimitMinutes }} minutes</span>
            <span v-else>No time limit</span>
          </span>
          <span class="info-item">
            <i class="fas fa-star"></i>
            Maximum Marks: {{ assessment.maximumMarks }}
          </span>
        </div>
        <div v-if="timeLimitMinutes && !submitted" class="timer">
          <i class="fas fa-hourglass-half"></i>
          Time Remaining: {{ formatTime(timeRemaining) }}
        </div>
      </div>

      <form v-if="!submitted" @submit.prevent="handleSubmit" class="quiz-form">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-card"
        >
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}</span>
            <h4>{{ question.questionText }}</h4>
            <span class="question-points">{{ question.points }} point(s)</span>
          </div>

          <div class="question-answer">
            <div v-if="question.questionType === 'MULTIPLE_CHOICE'" class="multiple-choice">
              <label
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                class="option-label"
              >
                <input
                  v-model="answers[question.id]"
                  type="radio"
                  :name="`question-${question.id}`"
                  :value="option"
                  :disabled="submitted"
                />
                <span>{{ option }}</span>
              </label>
            </div>

            <div v-else-if="question.questionType === 'TRUE_FALSE'" class="true-false">
              <label class="option-label">
                <input
                  v-model="answers[question.id]"
                  type="radio"
                  :name="`question-${question.id}`"
                  value="true"
                  :disabled="submitted"
                />
                <span>True</span>
              </label>
              <label class="option-label">
                <input
                  v-model="answers[question.id]"
                  type="radio"
                  :name="`question-${question.id}`"
                  value="false"
                  :disabled="submitted"
                />
                <span>False</span>
              </label>
            </div>

            <div v-else class="short-answer">
              <input
                v-model="answers[question.id]"
                type="text"
                :placeholder="'Enter your answer'"
                class="answer-input"
                :disabled="submitted"
              />
            </div>
          </div>
        </div>

        <div class="quiz-actions">
          <button
            type="submit"
            :disabled="loading || submitted || !isFormValid"
            class="btn-submit"
          >
            {{ loading ? 'Submitting...' : 'Submit Quiz' }}
          </button>
        </div>
      </form>

      <div v-else class="submitted-message">
        <i class="fas fa-check-circle"></i>
        <p>Quiz submitted successfully!</p>
        <p class="submitted-date">Submitted on: {{ formatDateTime(submissionDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  assessment: {
    type: Object,
    required: true
  },
  questions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitted: {
    type: Boolean,
    default: false
  },
  submissionDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['submit'])

const toast = useToast()
const answers = ref({})
const timeRemaining = ref(0)
let timerInterval = null

const timeLimitMinutes = computed(() => props.assessment?.timeLimitMinutes)

const isFormValid = computed(() => {
  if (props.questions.length === 0) return false
  return props.questions.every(q => answers.value[q.id] !== undefined && answers.value[q.id] !== '')
})

onMounted(() => {
  if (timeLimitMinutes.value && !props.submitted) {
    timeRemaining.value = timeLimitMinutes.value * 60 // Convert to seconds
    startTimer()
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timerInterval)
      toast.warning('Time is up! Submitting quiz automatically...')
      handleSubmit()
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}

const handleSubmit = () => {
  if (!isFormValid.value) {
    toast.error('Please answer all questions before submitting')
    return
  }

  if (timerInterval) {
    clearInterval(timerInterval)
  }

  emit('submit', answers.value)
}
</script>

<style scoped>
.quiz-taking-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.quiz-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.quiz-header h2 {
  margin: 0 0 15px 0;
  color: #333;
}

.quiz-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.quiz-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.timer {
  padding: 10px;
  background: #fff3e0;
  border-radius: 4px;
  color: #e65100;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.quiz-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.question-header h4 {
  flex: 1;
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.question-points {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.question-answer {
  margin-top: 15px;
}

.multiple-choice,
.true-false {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.option-label:hover {
  background: #f5f5f5;
}

.option-label input[type="radio"] {
  cursor: pointer;
}

.option-label input[type="radio"]:checked + span {
  font-weight: 500;
  color: #2196f3;
}

.answer-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.answer-input:focus {
  outline: none;
  border-color: #4caf50;
}

.quiz-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.btn-submit {
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

.submitted-message {
  text-align: center;
  padding: 40px;
  color: #4caf50;
}

.submitted-message i {
  font-size: 48px;
  margin-bottom: 15px;
}

.submitted-message p {
  margin: 10px 0;
  font-size: 16px;
}

.submitted-date {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .quiz-taking-view {
    padding: 15px;
  }

  .quiz-container {
    padding: 20px;
  }

  .question-header {
    flex-direction: column;
  }
}
</style>

