<template>
  <div class="question-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="questionText">Question Text *</label>
        <textarea
          id="questionText"
          v-model="form.questionText"
          rows="3"
          required
          placeholder="Enter question text"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="questionType">Question Type *</label>
        <select
          id="questionType"
          v-model="form.questionType"
          required
          class="form-select"
          :disabled="loading"
          @change="handleTypeChange"
        >
          <option value="">Select type</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
        </select>
      </div>

      <div v-if="form.questionType === 'MULTIPLE_CHOICE'" class="form-group">
        <label>Options *</label>
        <div v-for="(option, index) in form.options" :key="index" class="option-row">
          <input
            v-model="form.options[index]"
            type="text"
            :placeholder="`Option ${index + 1}`"
            class="form-input option-input"
            :disabled="loading"
            required
          />
          <button
            v-if="form.options.length > 2"
            type="button"
            @click="removeOption(index)"
            class="btn-remove-option"
            :disabled="loading"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <button
          type="button"
          @click="addOption"
          class="btn-add-option"
          :disabled="loading || form.options.length >= 10"
        >
          <i class="fas fa-plus"></i> Add Option
        </button>
      </div>

      <div class="form-group">
        <label for="correctAnswer">Correct Answer *</label>
        <div v-if="form.questionType === 'TRUE_FALSE'" class="radio-group">
          <label class="radio-label">
            <input
              v-model="form.correctAnswer"
              type="radio"
              value="true"
              :disabled="loading"
              required
            />
            True
          </label>
          <label class="radio-label">
            <input
              v-model="form.correctAnswer"
              type="radio"
              value="false"
              :disabled="loading"
              required
            />
            False
          </label>
        </div>
        <div v-else-if="form.questionType === 'MULTIPLE_CHOICE'" class="select-group">
          <select
            v-model="form.correctAnswer"
            required
            class="form-select"
            :disabled="loading || form.options.length === 0"
          >
            <option value="">Select correct answer</option>
            <option v-for="(option, index) in form.options" :key="index" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        <input
          v-else
          id="correctAnswer"
          v-model="form.correctAnswer"
          type="text"
          required
          placeholder="Enter correct answer"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="points">Points *</label>
        <input
          id="points"
          v-model.number="form.points"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="1.00"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div v-if="error" class="error-message">
        <div v-if="typeof error === 'string'">{{ error }}</div>
        <div v-else>
          <div v-if="error.message">{{ error.message }}</div>
          <ul v-if="error.errors && error.errors.length > 0" class="error-list">
            <li v-for="(err, index) in error.errors" :key="index">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading || !isFormValid" class="btn-submit">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Question' : 'Add Question') }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, Object],
    default: ''
  }
})

const emit = defineEmits(['submit', 'cancel'])

const isEditMode = computed(() => !!props.question)

const form = ref({
  questionText: '',
  questionType: '',
  options: ['', ''],
  correctAnswer: '',
  points: 1.00
})

watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    form.value = {
      questionText: newQuestion.questionText || '',
      questionType: newQuestion.questionType || '',
      options: newQuestion.options && newQuestion.options.length > 0 ? [...newQuestion.options] : ['', ''],
      correctAnswer: newQuestion.correctAnswer || '',
      points: newQuestion.points || 1.00
    }
  } else {
    form.value = {
      questionText: '',
      questionType: '',
      options: ['', ''],
      correctAnswer: '',
      points: 1.00
    }
  }
}, { immediate: true })

const isFormValid = computed(() => {
  if (!form.value.questionText || !form.value.questionType || !form.value.correctAnswer) {
    return false
  }
  if (form.value.questionType === 'MULTIPLE_CHOICE') {
    return form.value.options.length >= 2 && form.value.options.every(opt => opt.trim() !== '')
  }
  return true
})

const handleTypeChange = () => {
  if (form.value.questionType === 'MULTIPLE_CHOICE') {
    if (form.value.options.length < 2) {
      form.value.options = ['', '']
    }
  } else {
    form.value.options = []
  }
  form.value.correctAnswer = ''
}

const addOption = () => {
  if (form.value.options.length < 10) {
    form.value.options.push('')
  }
}

const removeOption = (index) => {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1)
    if (form.value.correctAnswer === form.value.options[index]) {
      form.value.correctAnswer = ''
    }
  }
}

const handleSubmit = () => {
  const submitData = {
    questionText: form.value.questionText,
    questionType: form.value.questionType,
    correctAnswer: form.value.correctAnswer,
    points: form.value.points
  }
  
  if (form.value.questionType === 'MULTIPLE_CHOICE') {
    submitData.options = form.value.options.filter(opt => opt.trim() !== '')
  }
  
  emit('submit', submitData)
}
</script>

<style scoped>
.question-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4caf50;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.option-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.option-input {
  flex: 1;
}

.btn-remove-option {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove-option:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-remove-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add-option {
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.btn-add-option:hover:not(:disabled) {
  background: #1976d2;
}

.btn-add-option:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  width: auto;
  cursor: pointer;
}

.select-group {
  width: 100%;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.error-list {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.error-list li {
  margin: 4px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-submit,
.btn-cancel {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit {
  background: #4caf50;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #45a049;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

