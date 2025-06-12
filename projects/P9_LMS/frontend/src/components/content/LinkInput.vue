<template>
  <div class="link-input">
    <div class="form-group">
      <label for="linkTitle">Link Title *</label>
      <input
        id="linkTitle"
        v-model="form.title"
        type="text"
        placeholder="Enter link title"
        class="form-input"
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="linkUrl">URL *</label>
      <input
        id="linkUrl"
        v-model="form.url"
        type="url"
        placeholder="https://example.com"
        class="form-input"
        :disabled="loading"
      />
    </div>
    
    <div class="form-group">
      <label for="linkDescription">Description</label>
      <textarea
        id="linkDescription"
        v-model="form.description"
        rows="3"
        placeholder="Enter link description (optional)"
        class="form-textarea"
        :disabled="loading"
      ></textarea>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div class="form-actions">
      <button
        @click="handleSubmit"
        :disabled="loading || !isValid"
        class="btn-submit"
      >
        {{ loading ? 'Adding...' : 'Add Link' }}
      </button>
      <button
        @click="handleCancel"
        class="btn-cancel"
        :disabled="loading"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  title: '',
  url: '',
  description: ''
})

const isValid = computed(() => {
  return form.value.title.trim() !== '' && form.value.url.trim() !== ''
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', { ...form.value })
  }
}

const handleCancel = () => {
  form.value = {
    title: '',
    url: '',
    description: ''
  }
  emit('cancel')
}
</script>

<style scoped>
.link-input {
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
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
}

.form-input:disabled,
.form-textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
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

