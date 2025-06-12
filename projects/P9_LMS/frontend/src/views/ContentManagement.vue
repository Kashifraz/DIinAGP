<template>
  <div class="content-management">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Content Management</h1>
        <router-link to="/my-courses" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Courses
        </router-link>
      </div>

      <!-- Course Selection -->
      <div class="section">
        <h2>Select Course</h2>
        <div class="form-group">
          <label for="courseSelect">Course:</label>
          <select
            id="courseSelect"
            v-model="selectedCourseId"
            @change="handleCourseChange"
            class="form-select"
          >
            <option :value="null">Select a course</option>
            <option v-for="course in myCourses" :key="course.id" :value="course.id">
              {{ course.code }} - {{ course.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Module Management -->
      <div v-if="selectedCourseId" class="section">
        <div class="section-header">
          <h2>Modules</h2>
          <button
            v-if="!showModuleForm"
            @click="showCreateModuleForm"
            class="btn-create"
          >
            <i class="fas fa-plus"></i> Create Module
          </button>
        </div>

        <!-- Module Form -->
        <div v-if="showModuleForm" class="module-form-section">
          <ModuleForm
            :module="editingModule"
            :loading="contentStore.loading"
            :error="moduleFormError || contentStore.error"
            @submit="handleModuleSubmit"
            @cancel="cancelModuleForm"
          />
        </div>

        <!-- Modules List -->
        <div v-if="contentStore.loading && !showModuleForm" class="loading">
          Loading modules...
        </div>

        <div v-else-if="contentStore.modules.length === 0 && !showModuleForm" class="no-modules">
          No modules found. Create your first module!
        </div>

        <div v-else-if="!showModuleForm" class="modules-list">
          <ModuleCard
            v-for="module in contentStore.modules"
            :key="module.id"
            :module="module"
            :can-edit="true"
            @edit="editModule"
            @delete="confirmDeleteModule"
            @expand="handleModuleExpand"
          >
            <template #content>
              <!-- Content Management for this module -->
              <div class="module-content-section">
                <div class="content-header">
                  <h4>Content</h4>
                  <div class="content-actions">
                    <button
                      @click="showUploadForm(module.id)"
                      class="btn-add-content"
                    >
                      <i class="fas fa-upload"></i> Upload File
                    </button>
                    <button
                      @click="showLinkForm(module.id)"
                      class="btn-add-content"
                    >
                      <i class="fas fa-link"></i> Add Link
                    </button>
                  </div>
                </div>

                <!-- Upload Form -->
                <div v-if="showUpload && currentModuleId === module.id" class="upload-section">
                  <h5>Upload File</h5>
                  <FileUpload
                    v-model="selectedFile"
                    @error="handleUploadError"
                  />
                  <div class="upload-form-fields">
                    <input
                      v-model="uploadTitle"
                      type="text"
                      placeholder="Enter file title"
                      class="form-input"
                    />
                    <textarea
                      v-model="uploadDescription"
                      rows="2"
                      placeholder="Enter description (optional)"
                      class="form-textarea"
                    ></textarea>
                  </div>
                  <div class="upload-actions">
                    <button
                      @click="handleUpload"
                      :disabled="!selectedFile || !uploadTitle || contentStore.loading"
                      class="btn-submit"
                    >
                      {{ contentStore.loading ? 'Uploading...' : 'Upload' }}
                    </button>
                    <button
                      @click="cancelUpload"
                      class="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <!-- Link Form -->
                <div v-if="showLink && currentModuleId === module.id" class="link-section">
                  <LinkInput
                    :loading="contentStore.loading"
                    :error="linkFormError"
                    @submit="handleAddLink"
                    @cancel="cancelLink"
                  />
                </div>

                <!-- Content List -->
                <div class="content-list">
                  <div v-if="!moduleContents[module.id]" class="loading-content">
                    Loading content...
                  </div>
                  <template v-else>
                    <ContentItem
                      v-for="content in moduleContents[module.id]"
                      :key="content.id"
                      :content="content"
                      :can-edit="true"
                      @download="handleDownload"
                      @delete="confirmDeleteContent"
                    />
                    <div v-if="moduleContents[module.id].length === 0" class="no-content">
                      No content in this module yet.
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </ModuleCard>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="contentStore.error && !showModuleForm" class="error-message">
        {{ contentStore.error }}
      </div>
    </div>

    <!-- Delete Module Confirmation Modal -->
    <div v-if="moduleToDelete" class="modal-overlay" @click="cancelDeleteModule">
      <div class="modal-content" @click.stop>
        <h3>Confirm Delete Module</h3>
        <p>Are you sure you want to delete the module "{{ moduleToDelete.name }}"?</p>
        <p class="warning">This will delete all content in this module.</p>
        <div class="modal-actions">
          <button
            @click="handleDeleteModule"
            :disabled="contentStore.loading"
            class="btn-confirm"
          >
            {{ contentStore.loading ? 'Deleting...' : 'Delete' }}
          </button>
          <button @click="cancelDeleteModule" class="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Delete Content Confirmation Modal -->
    <div v-if="contentToDelete" class="modal-overlay" @click="cancelDeleteContent">
      <div class="modal-content" @click.stop>
        <h3>Confirm Delete Content</h3>
        <p>Are you sure you want to delete "{{ contentToDelete.title }}"?</p>
        <div class="modal-actions">
          <button
            @click="handleDeleteContent"
            :disabled="contentStore.loading"
            class="btn-confirm"
          >
            {{ contentStore.loading ? 'Deleting...' : 'Delete' }}
          </button>
          <button @click="cancelDeleteContent" class="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import ModuleCard from '@/components/content/ModuleCard.vue'
import ModuleForm from '@/components/content/ModuleForm.vue'
import ContentItem from '@/components/content/ContentItem.vue'
import FileUpload from '@/components/content/FileUpload.vue'
import LinkInput from '@/components/content/LinkInput.vue'

const route = useRoute()
const contentStore = useContentStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedCourseId = ref(null)
const myCourses = ref([])
const showModuleForm = ref(false)
const editingModule = ref(null)
const moduleToDelete = ref(null)
const contentToDelete = ref(null)
const moduleFormError = ref(null)
const linkFormError = ref(null)

// Upload state
const showUpload = ref(false)
const showLink = ref(false)
const currentModuleId = ref(null)
const selectedFile = ref(null)
const uploadTitle = ref('')
const uploadDescription = ref('')

// Module contents cache
const moduleContents = ref({})

onMounted(async () => {
  await loadMyCourses()
  
  // Check if courseId is provided in route params
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadModules()
  }
})

const loadMyCourses = async () => {
  try {
    // Get courses assigned to current professor
    const user = authStore.user
    if (user && user.role === 'PROFESSOR') {
      await courseStore.fetchCoursesByProfessor(user.id)
      myCourses.value = courseStore.courses
    } else {
      // If not professor, show all courses (for testing)
      await courseStore.fetchCourses()
      myCourses.value = courseStore.courses
    }
  } catch (err) {
    toast.error('Failed to load courses')
    console.error('Failed to load courses:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadModules()
  } else {
    contentStore.modules = []
    moduleContents.value = {}
  }
}

const loadModules = async () => {
  if (!selectedCourseId.value) return
  
  try {
    await contentStore.fetchModulesByCourse(selectedCourseId.value)
    // Don't load all content immediately - load on demand when module is expanded
  } catch (err) {
    toast.error('Failed to load modules')
    console.error('Failed to load modules:', err)
  }
}

const handleModuleExpand = async (moduleId) => {
  // Validate moduleId before loading content
  if (!moduleId || moduleId === null || moduleId === 'null') {
    console.warn('Invalid module ID provided:', moduleId)
    return
  }
  
  // Load content when module is expanded if not already loaded
  if (!moduleContents.value[moduleId]) {
    await loadModuleContent(moduleId)
  }
}

const loadModuleContent = async (moduleId) => {
  // Validate moduleId before making API call
  if (!moduleId || moduleId === null || moduleId === 'null') {
    console.warn('Cannot load content: invalid module ID:', moduleId)
    return
  }
  
  try {
    const contents = await contentStore.fetchContentByModule(moduleId)
    moduleContents.value[moduleId] = contents
  } catch (err) {
    console.error('Failed to load module content:', err)
    moduleContents.value[moduleId] = []
  }
}

const showCreateModuleForm = () => {
  editingModule.value = null
  showModuleForm.value = true
  contentStore.clearError()
  moduleFormError.value = null
}

const editModule = (module) => {
  editingModule.value = module
  showModuleForm.value = true
  contentStore.clearError()
  moduleFormError.value = null
}

const cancelModuleForm = () => {
  showModuleForm.value = false
  editingModule.value = null
  contentStore.clearError()
  moduleFormError.value = null
}

const extractErrorMessage = (error) => {
  if (!error) return null
  
  if (error.response?.data) {
    const errorData = error.response.data
    
    if (errorData.fieldErrors) {
      const fieldErrors = errorData.fieldErrors
      const errorMessages = Object.entries(fieldErrors).map(([field, msg]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()
        return `${fieldName}: ${msg}`
      })
      
      return {
        message: 'Please fix the following errors:',
        errors: errorMessages,
        fieldErrors: fieldErrors
      }
    }
    
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return {
        message: 'Please fix the following errors:',
        errors: errorData.errors
      }
    }
    
    return errorData.message || errorData.details || 'An error occurred'
  }
  
  return error.message || 'An error occurred'
}

const handleModuleSubmit = async (formData) => {
  moduleFormError.value = null
  contentStore.clearError()
  
  try {
    if (editingModule.value) {
      await contentStore.updateModule(editingModule.value.id, formData)
      toast.success('Module updated successfully!')
    } else {
      await contentStore.createModule(selectedCourseId.value, formData)
      toast.success('Module created successfully!')
    }
    showModuleForm.value = false
    editingModule.value = null
    await loadModules()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    moduleFormError.value = errorMsg
    
    if (typeof errorMsg === 'string') {
      toast.error(errorMsg)
    } else if (errorMsg?.message) {
      toast.error(errorMsg.message)
    } else {
      toast.error('Failed to save module. Please try again.')
    }
  }
}

const confirmDeleteModule = (module) => {
  moduleToDelete.value = module
}

const cancelDeleteModule = () => {
  moduleToDelete.value = null
}

const handleDeleteModule = async () => {
  if (!moduleToDelete.value || !moduleToDelete.value.id) return
  
  const moduleId = moduleToDelete.value.id
  try {
    await contentStore.deleteModule(moduleId)
    toast.success('Module deleted successfully!')
    delete moduleContents.value[moduleId]
    moduleToDelete.value = null
    await loadModules()
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to delete module')
  }
}

const showUploadForm = (moduleId) => {
  // Validate moduleId before showing upload form
  if (!moduleId || moduleId === null || moduleId === 'null') {
    console.warn('Invalid module ID provided for upload:', moduleId)
    toast.error('Invalid module ID. Please try again.')
    return
  }
  currentModuleId.value = moduleId
  showUpload.value = true
  showLink.value = false
  selectedFile.value = null
  uploadTitle.value = ''
  uploadDescription.value = ''
}

const showLinkForm = (moduleId) => {
  // Validate moduleId before showing link form
  if (!moduleId || moduleId === null || moduleId === 'null') {
    console.warn('Invalid module ID provided for link:', moduleId)
    toast.error('Invalid module ID. Please try again.')
    return
  }
  currentModuleId.value = moduleId
  showLink.value = true
  showUpload.value = false
  linkFormError.value = null
}

const cancelUpload = () => {
  showUpload.value = false
  currentModuleId.value = null
  selectedFile.value = null
  uploadTitle.value = ''
  uploadDescription.value = ''
}

const handleUploadError = (error) => {
  toast.error(error)
}

const handleUpload = async () => {
  if (!selectedFile.value || !uploadTitle.value || !currentModuleId.value) return
  
  try {
    await contentStore.uploadContent(
      currentModuleId.value,
      selectedFile.value,
      uploadTitle.value,
      uploadDescription.value
    )
    toast.success('File uploaded successfully!')
    cancelUpload()
    await loadModuleContent(currentModuleId.value)
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to upload file')
  }
}

const handleAddLink = async (linkData) => {
  if (!currentModuleId.value) return
  
  linkFormError.value = null
  
  try {
    await contentStore.addLink(currentModuleId.value, linkData)
    toast.success('Link added successfully!')
    cancelLink()
    await loadModuleContent(currentModuleId.value)
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    linkFormError.value = typeof errorMsg === 'string' ? errorMsg : 'Failed to add link'
    toast.error(linkFormError.value)
  }
}

const cancelLink = () => {
  showLink.value = false
  currentModuleId.value = null
  linkFormError.value = null
}

const handleDownload = async (content) => {
  try {
    await contentStore.downloadContent(content.id, content)
    toast.success('Download started!')
  } catch (err) {
    const errorMsg = err.formattedMessage || err.response?.data?.message || err.message || 'Failed to download file'
    toast.error(errorMsg)
  }
}

const confirmDeleteContent = (content) => {
  contentToDelete.value = content
}

const cancelDeleteContent = () => {
  contentToDelete.value = null
}

const handleDeleteContent = async () => {
  if (!contentToDelete.value) return
  
  try {
    await contentStore.deleteContent(contentToDelete.value.id)
    toast.success('Content deleted successfully!')
    const moduleId = contentToDelete.value.moduleId
    contentToDelete.value = null
    await loadModuleContent(moduleId)
  } catch (err) {
    const errorMsg = extractErrorMessage(err)
    toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to delete content')
  }
}
</script>

<style scoped>
.content-management {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.btn-back {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-back:hover {
  background: #e0e0e0;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .section {
    padding: 20px 15px;
    margin-bottom: 20px;
  }
}

.section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .btn-create {
    width: 100%;
    justify-content: center;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-create {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-create:hover {
  background: #45a049;
}

.module-form-section {
  margin-bottom: 30px;
}

.loading,
.no-modules {
  text-align: center;
  padding: 40px;
  color: #666;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.module-content-section {
  margin-top: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .content-header h4 {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .content-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .btn-add-content {
    flex: 1;
    justify-content: center;
  }
}

.content-header h4 {
  margin: 0;
  color: #333;
}

.content-actions {
  display: flex;
  gap: 10px;
}

.btn-add-content {
  padding: 8px 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-add-content:hover {
  background: #1976d2;
}

.upload-section,
.link-section {
  background: white;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.upload-section h5 {
  margin: 0 0 15px 0;
  color: #333;
}

.upload-form-fields {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
}

.upload-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .upload-actions {
    flex-direction: column;
  }
  
  .btn-submit,
  .btn-cancel {
    width: 100%;
  }
}

.btn-submit,
.btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
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

.content-list {
  margin-top: 15px;
}

.loading-content {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.no-content {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 20px 15px;
    width: 95%;
    max-width: none;
    margin: 10px;
  }
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
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .modal-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-confirm,
  .btn-cancel-modal {
    width: 100%;
    justify-content: center;
  }
}

.btn-confirm,
.btn-cancel-modal {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-confirm {
  background: #f44336;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-confirm:disabled {
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

