<template>
  <div class="course-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="code">Course Code *</label>
        <input
          id="code"
          v-model="form.code"
          type="text"
          required
          placeholder="e.g., CS101"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="name">Course Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Enter course name"
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
          placeholder="Enter course description"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="majorId">Major *</label>
        <select
          id="majorId"
          v-model="form.majorId"
          required
          class="form-select"
          :disabled="loading"
        >
          <option value="">Select a major</option>
          <option v-for="major in majors" :key="major.id" :value="major.id">
            {{ major.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="professorId">Professor (Optional)</label>
        <ProfessorSelector
          :model-value="form.professorId"
          @update:model-value="form.professorId = $event"
          :disabled="loading"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="startDate">Start Date</label>
          <input
            id="startDate"
            v-model="form.startDate"
            type="date"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="endDate">End Date</label>
          <input
            id="endDate"
            v-model="form.endDate"
            type="date"
            class="form-input"
            :disabled="loading"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="creditHours">Credit Hours</label>
        <input
          id="creditHours"
          v-model.number="form.creditHours"
          type="number"
          min="0"
          max="10"
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
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div v-if="error" class="error-message">
        <div v-if="typeof error === 'string'">{{ error }}</div>
        <div v-else>
          <div v-if="error.message">{{ error.message }}</div>
          <ul v-if="error.errors && error.errors.length > 0" class="error-list">
            <li v-for="(err, index) in error.errors" :key="index">{{ err }}</li>
          </ul>
          <div v-if="error.fieldErrors" class="field-errors">
            <div v-for="(fieldError, field) in error.fieldErrors" :key="field" class="field-error">
              <strong>{{ field }}:</strong> {{ fieldError }}
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course') }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useMajorStore } from '@/stores/major'
import ProfessorSelector from './ProfessorSelector.vue'

const props = defineProps({
  course: {
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

const majorStore = useMajorStore()
const majors = ref([])

const isEditMode = ref(!!props.course)

const form = ref({
  code: '',
  name: '',
  description: '',
  majorId: null,
  professorId: null,
  startDate: '',
  endDate: '',
  creditHours: 0,
  status: 'ACTIVE'
})

// Load majors on mount
onMounted(async () => {
  try {
    await majorStore.fetchMajors()
    majors.value = majorStore.majors
  } catch (err) {
    console.error('Failed to load majors:', err)
  }
})

watch(() => props.course, (newCourse) => {
  if (newCourse) {
    form.value = {
      code: newCourse.code || '',
      name: newCourse.name || '',
      description: newCourse.description || '',
      majorId: newCourse.majorId || null,
      professorId: newCourse.professorId || null,
      startDate: newCourse.startDate || '',
      endDate: newCourse.endDate || '',
      creditHours: newCourse.creditHours || 0,
      status: newCourse.status || 'ACTIVE'
    }
    isEditMode.value = true
  } else {
    form.value = {
      code: '',
      name: '',
      description: '',
      majorId: null,
      professorId: null,
      startDate: '',
      endDate: '',
      creditHours: 0,
      status: 'ACTIVE'
    }
    isEditMode.value = false
  }
}, { immediate: true })

const handleSubmit = () => {
  // Convert empty strings to null for optional fields
  const submitData = {
    ...form.value,
    professorId: form.value.professorId || null,
    description: form.value.description || null,
    startDate: form.value.startDate || null,
    endDate: form.value.endDate || null
  }
  emit('submit', submitData)
}
</script>

<style scoped>
.course-form {
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

.field-errors {
  margin-top: 8px;
}

.field-error {
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

