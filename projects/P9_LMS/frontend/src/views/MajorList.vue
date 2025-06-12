<template>
  <div class="major-list">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Course Major Management</h1>
        <button v-if="!showForm" @click="showCreateForm" class="btn-create">
          + Create New Major
        </button>
      </div>

      <div v-if="showForm" class="form-section">
        <h2>{{ editingMajor ? 'Edit Major' : 'Create New Major' }}</h2>
        <MajorForm
          :major="editingMajor"
          :loading="majorStore.loading"
          :error="formError || majorStore.error"
          @submit="handleFormSubmit"
          @cancel="cancelForm"
        />
      </div>

      <div v-if="majorStore.error && !showForm" class="error-message">
        {{ majorStore.error }}
      </div>

      <div v-if="majorStore.loading && !showForm" class="loading">
        Loading majors...
      </div>

      <div v-else-if="majorStore.majors.length === 0 && !showForm" class="no-majors">
        No majors found. Create your first major!
      </div>

      <div v-else-if="!showForm" class="majors-grid">
        <div
          v-for="major in majorStore.majors"
          :key="major.id"
          class="major-card"
        >
          <div class="major-header">
            <h3>{{ major.name }}</h3>
            <span class="status-badge" :class="major.status.toLowerCase()">
              {{ major.status }}
            </span>
          </div>
          <p v-if="major.description" class="major-description">
            {{ major.description }}
          </p>
          <div class="major-info">
            <p><strong>Coordinator:</strong> {{ major.coordinatorName }}</p>
            <p><strong>Created:</strong> {{ formatDate(major.createdAt) }}</p>
          </div>
          <div class="major-actions">
            <button @click="editMajor(major)" class="btn-edit">Edit</button>
            <button @click="confirmDelete(major)" class="btn-delete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="majorToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete the major "{{ majorToDelete.name }}"?</p>
        <p class="warning">This will set the major status to INACTIVE.</p>
        <div class="modal-actions">
          <button @click="handleDelete" :disabled="majorStore.loading" class="btn-confirm-delete">
            {{ majorStore.loading ? 'Deleting...' : 'Delete' }}
          </button>
          <button @click="cancelDelete" class="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMajorStore } from '@/stores/major'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import MajorForm from '@/components/major/MajorForm.vue'

const majorStore = useMajorStore()
const authStore = useAuthStore()
const toast = useToast()

const showForm = ref(false)
const editingMajor = ref(null)
const majorToDelete = ref(null)
const formError = ref(null)

onMounted(async () => {
  await majorStore.fetchMajors()
})

const showCreateForm = () => {
  editingMajor.value = null
  showForm.value = true
  majorStore.clearError()
  formError.value = null
}

const editMajor = (major) => {
  editingMajor.value = major
  showForm.value = true
  majorStore.clearError()
  formError.value = null
}

const cancelForm = () => {
  showForm.value = false
  editingMajor.value = null
  majorStore.clearError()
  formError.value = null
}

const extractErrorMessage = (error) => {
  if (!error) return null
  
  if (error.response?.data) {
    const errorData = error.response.data
    
    // Handle validation errors with field errors
    if (errorData.fieldErrors) {
      const fieldErrors = errorData.fieldErrors
      const errorMessages = Object.entries(fieldErrors).map(([field, msg]) => {
        // Capitalize field name and format message
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()
        return `${fieldName}: ${msg}`
      })
      
      return {
        message: 'Please fix the following errors:',
        errors: errorMessages
      }
    }
    
    // Handle validation errors with errors array
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return {
        message: 'Please fix the following errors:',
        errors: errorData.errors
      }
    }
    
    // Handle validation errors with details
    if (errorData.message && errorData.message.includes('Validation failed')) {
      if (errorData.details) {
        return {
          message: 'Please fix the following errors:',
          errors: Array.isArray(errorData.details) 
            ? errorData.details 
            : [errorData.details]
        }
      }
    }
    
    // Return the main error message
    return errorData.message || errorData.details || 'An error occurred'
  }
  
  return error.message || 'An error occurred'
}

const handleFormSubmit = async (formData) => {
  formError.value = null
  majorStore.clearError()
  
  try {
    if (editingMajor.value) {
      await majorStore.updateMajor(editingMajor.value.id, formData)
      toast.success('Major updated successfully!')
    } else {
      await majorStore.createMajor(formData)
      toast.success('Major created successfully!')
    }
    showForm.value = false
    editingMajor.value = null
    await majorStore.fetchMajors() // Refresh list
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    formError.value = errorMsg
    
    // Show toast for error
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save major. Please try again.')
    }
  }
}

const confirmDelete = (major) => {
  majorToDelete.value = major
}

const cancelDelete = () => {
  majorToDelete.value = null
}

const handleDelete = async () => {
  if (majorToDelete.value) {
    try {
      await majorStore.deleteMajor(majorToDelete.value.id)
      toast.success('Major deleted successfully!')
      majorToDelete.value = null
      await majorStore.fetchMajors() // Refresh list
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to delete major')
    }
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.major-list {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.btn-create {
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

.btn-create:hover {
  background: #45a049;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading,
.no-majors {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
}

.majors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.major-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.major-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.major-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.major-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.inactive {
  background: #f44336;
  color: white;
}

.major-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.major-info {
  margin-bottom: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.major-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.major-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
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
  max-width: 400px;
  width: 90%;
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
}

.btn-confirm-delete,
.btn-cancel-modal {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-confirm-delete {
  background: #f44336;
  color: white;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-confirm-delete:disabled {
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
</style>

