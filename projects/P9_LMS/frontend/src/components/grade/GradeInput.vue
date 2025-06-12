<template>
  <div class="grade-input">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="marksObtained">Marks Obtained *</label>
        <div class="marks-info">
          <input
            id="marksObtained"
            v-model.number="form.marksObtained"
            type="number"
            step="0.01"
            min="0"
            :max="maximumMarks"
            required
            placeholder="0.00"
            class="form-input"
            :disabled="loading"
          />
          <span class="max-marks">/ {{ maximumMarks }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="feedback">Feedback</label>
        <textarea
          id="feedback"
          v-model="form.feedback"
          rows="4"
          placeholder="Enter feedback for the student"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
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
        <button type="submit" :disabled="loading || !isValid" class="btn-submit">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Grade' : 'Save Grade') }}
        </button>
        <button v-if="showCancel" type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  grade: {
    type: Object,
    default: null
  },
  maximumMarks: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, Object],
    default: ''
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

const isEditMode = computed(() => !!props.grade)

const form = ref({
  marksObtained: null,
  feedback: ''
})

const isValid = computed(() => {
  return form.value.marksObtained !== null && 
         form.value.marksObtained >= 0 && 
         form.value.marksObtained <= props.maximumMarks
})

watch(() => props.grade, (newGrade) => {
  if (newGrade) {
    form.value = {
      marksObtained: newGrade.marksObtained || null,
      feedback: newGrade.feedback || ''
    }
  } else {
    form.value = {
      marksObtained: null,
      feedback: ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.grade-input {
  background: white;
  padding: 20px;
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

.marks-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #4caf50;
}

.max-marks {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.form-input:disabled,
.form-textarea:disabled {
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
  margin-top: 20px;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
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

