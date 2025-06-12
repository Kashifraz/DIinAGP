<template>
  <form @submit.prevent="handleSubmit" class="notice-form">
    <div class="form-group">
      <label for="title">Title <span class="required">*</span></label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="form-control"
        placeholder="Enter notice title"
        required
      />
    </div>

    <div class="form-group">
      <label for="content">Content <span class="required">*</span></label>
      <textarea
        id="content"
        v-model="formData.content"
        class="form-control"
        rows="6"
        placeholder="Enter notice content"
        required
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="category">Category <span class="required">*</span></label>
        <select
          id="category"
          v-model="formData.category"
          class="form-control"
          required
        >
          <option value="GENERAL">General</option>
          <option value="EXAM">Exam</option>
          <option value="HOLIDAY">Holiday</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div class="form-group">
        <label for="priority">Priority <span class="required">*</span></label>
        <select
          id="priority"
          v-model="formData.priority"
          class="form-control"
          required
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label for="expirationDate">Expiration Date (Optional)</label>
      <input
        id="expirationDate"
        v-model="formData.expirationDate"
        type="datetime-local"
        class="form-control"
      />
    </div>

    <div class="form-actions">
      <button type="button" @click="handleCancel" class="btn btn-secondary">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Saving...</span>
        <span v-else>{{ isEdit ? 'Update' : 'Create' }} Notice</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  notice: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  title: '',
  content: '',
  category: 'GENERAL',
  priority: 'MEDIUM',
  expirationDate: ''
})

const isEdit = computed(() => !!props.notice)

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    expirationDate: ''
  }
}

watch(() => props.notice, (newNotice) => {
  if (newNotice) {
    formData.value = {
      title: newNotice.title || '',
      content: newNotice.content || '',
      category: newNotice.category || 'GENERAL',
      priority: newNotice.priority || 'MEDIUM',
      expirationDate: newNotice.expirationDate 
        ? new Date(newNotice.expirationDate).toISOString().slice(0, 16)
        : ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  const data = {
    ...formData.value,
    expirationDate: formData.value.expirationDate 
      ? new Date(formData.value.expirationDate).toISOString()
      : null
  }
  emit('submit', data)
}

const handleCancel = () => {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.notice-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #f44336;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #bbb;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

