<template>
  <div class="module-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="moduleName">Module Name *</label>
        <input
          id="moduleName"
          v-model="form.name"
          type="text"
          required
          placeholder="Enter module name"
          class="form-input"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="moduleDescription">Description</label>
        <textarea
          id="moduleDescription"
          v-model="form.description"
          rows="4"
          placeholder="Enter module description"
          class="form-textarea"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="displayOrder">Display Order</label>
        <input
          id="displayOrder"
          v-model.number="form.displayOrder"
          type="number"
          min="0"
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
          <div v-if="error.fieldErrors" class="field-errors">
            <div v-for="(fieldError, field) in error.fieldErrors" :key="field" class="field-error">
              <strong>{{ field }}:</strong> {{ fieldError }}
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Module' : 'Create Module') }}
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
  module: {
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

const isEditMode = ref(!!props.module)

const form = ref({
  name: '',
  description: '',
  displayOrder: 0
})

watch(() => props.module, (newModule) => {
  if (newModule) {
    form.value = {
      name: newModule.name || '',
      description: newModule.description || '',
      displayOrder: newModule.displayOrder || 0
    }
    isEditMode.value = true
  } else {
    form.value = {
      name: '',
      description: '',
      displayOrder: 0
    }
    isEditMode.value = false
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.module-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
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
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
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
</style>

