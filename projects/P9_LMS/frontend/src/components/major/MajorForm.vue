<template>
  <div class="major-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Major Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Enter major name"
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
          placeholder="Enter major description"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
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
          <option value="INACTIVE">Inactive</option>
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
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Major' : 'Create Major') }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  major: {
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

const isEditMode = ref(!!props.major)

const form = ref({
  name: '',
  description: '',
  status: 'ACTIVE'
})

watch(() => props.major, (newMajor) => {
  if (newMajor) {
    form.value = {
      name: newMajor.name || '',
      description: newMajor.description || '',
      status: newMajor.status || 'ACTIVE'
    }
    isEditMode.value = true
  } else {
    form.value = {
      name: '',
      description: '',
      status: 'ACTIVE'
    }
    isEditMode.value = false
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.major-form {
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
</style>

