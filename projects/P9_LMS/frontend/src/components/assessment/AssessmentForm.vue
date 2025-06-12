<template>
  <div class="assessment-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter assessment title"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          placeholder="Enter assessment description"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
      </div>

      <div v-if="!isEditMode" class="form-group">
        <label for="assessmentType">Assessment Type *</label>
        <select
          id="assessmentType"
          v-model="form.assessmentType"
          required
          class="form-select"
          :disabled="loading"
        >
          <option value="">Select type</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="QUIZ">Quiz</option>
        </select>
      </div>

      <div v-else class="form-group">
        <label>Assessment Type</label>
        <div class="type-display">{{ assessment?.assessmentType || 'N/A' }}</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="weightPercentage">Weight Percentage *</label>
          <input
            id="weightPercentage"
            v-model.number="form.weightPercentage"
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            required
            placeholder="0.00"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="maximumMarks">Maximum Marks *</label>
          <input
            id="maximumMarks"
            v-model.number="form.maximumMarks"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            class="form-input"
            :disabled="loading"
          />
        </div>
      </div>

      <div v-if="form.assessmentType === 'ASSIGNMENT' || (isEditMode && assessment?.assessmentType === 'ASSIGNMENT')" class="form-group">
        <label for="deadline">Deadline *</label>
        <input
          id="deadline"
          v-model="form.deadline"
          type="datetime-local"
          required
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div v-if="form.assessmentType === 'QUIZ' || (isEditMode && assessment?.assessmentType === 'QUIZ')" class="form-group">
        <label for="timeLimitMinutes">Time Limit (minutes) *</label>
        <input
          id="timeLimitMinutes"
          v-model.number="form.timeLimitMinutes"
          type="number"
          min="1"
          required
          placeholder="30"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div v-if="isEditMode" class="form-group">
        <label for="status">Status</label>
        <select
          id="status"
          v-model="form.status"
          class="form-select"
          :disabled="loading"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
        </select>
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
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Assessment' : 'Create Assessment') }}
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
  assessment: {
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

const isEditMode = computed(() => !!props.assessment)

const form = ref({
  title: '',
  description: '',
  assessmentType: '',
  weightPercentage: null,
  maximumMarks: null,
  deadline: '',
  timeLimitMinutes: null,
  status: 'DRAFT'
})

watch(() => props.assessment, (newAssessment) => {
  if (newAssessment) {
    form.value = {
      title: newAssessment.title || '',
      description: newAssessment.description || '',
      assessmentType: newAssessment.assessmentType || '',
      weightPercentage: newAssessment.weightPercentage || null,
      maximumMarks: newAssessment.maximumMarks || null,
      deadline: newAssessment.deadline ? formatDateTimeLocal(newAssessment.deadline) : '',
      timeLimitMinutes: newAssessment.timeLimitMinutes || null,
      status: newAssessment.status || 'DRAFT'
    }
  } else {
    form.value = {
      title: '',
      description: '',
      assessmentType: '',
      weightPercentage: null,
      maximumMarks: null,
      deadline: '',
      timeLimitMinutes: null,
      status: 'DRAFT'
    }
  }
}, { immediate: true })

const formatDateTimeLocal = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const handleSubmit = () => {
  const submitData = { ...form.value }
  
  // Convert deadline to ISO string if it's an assignment
  if (submitData.deadline && (submitData.assessmentType === 'ASSIGNMENT' || (isEditMode.value && props.assessment?.assessmentType === 'ASSIGNMENT'))) {
    submitData.deadline = new Date(submitData.deadline).toISOString()
  } else if (submitData.assessmentType === 'QUIZ' || (isEditMode.value && props.assessment?.assessmentType === 'QUIZ')) {
    submitData.deadline = null
  }
  
  emit('submit', submitData)
}
</script>

<style scoped>
.assessment-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.type-display {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #666;
  font-weight: 500;
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
  min-height: 100px;
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

