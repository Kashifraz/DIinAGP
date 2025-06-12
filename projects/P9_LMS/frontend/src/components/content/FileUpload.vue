<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-file': selectedFile }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div v-if="!selectedFile" class="upload-placeholder">
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <p>Drag and drop a file here, or click to select</p>
        <p class="upload-hint">Accepted: PDF, PPT, DOC, MP4 (Max 100MB)</p>
      </div>
      
      <div v-else class="file-info">
        <div class="file-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="file-details">
          <p class="file-name">{{ selectedFile.name }}</p>
          <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
        <button @click.stop="removeFile" class="btn-remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: File,
    default: null
  },
  acceptedTypes: {
    type: String,
    default: '.pdf,.ppt,.pptx,.doc,.docx,.mp4'
  },
  maxSize: {
    type: Number,
    default: 100 * 1024 * 1024 // 100MB
  }
})

const emit = defineEmits(['update:modelValue', 'error'])

const fileInput = ref(null)
const selectedFile = ref(props.modelValue)
const isDragOver = ref(false)
const error = ref(null)
const uploadProgress = ref(0)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file) => {
  error.value = null
  
  // Validate file size
  if (file.size > props.maxSize) {
    error.value = `File size exceeds maximum allowed size of ${formatFileSize(props.maxSize)}`
    emit('error', error.value)
    return
  }
  
  // Validate file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  const acceptedExtensions = props.acceptedTypes.split(',').map(ext => ext.trim().toLowerCase())
  
  if (!acceptedExtensions.includes(fileExtension)) {
    error.value = `File type not allowed. Accepted types: ${props.acceptedTypes}`
    emit('error', error.value)
    return
  }
  
  selectedFile.value = file
  emit('update:modelValue', file)
}

const removeFile = () => {
  selectedFile.value = null
  error.value = null
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('update:modelValue', null)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 25px 15px;
  }
}

.upload-area:hover {
  border-color: #4caf50;
  background: #f5f5f5;
}

.upload-area.drag-over {
  border-color: #4caf50;
  background: #e8f5e9;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 10px;
  color: #4caf50;
}

.upload-icon i {
  font-size: 48px;
}

@media (max-width: 768px) {
  .upload-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }
  
  .upload-icon i {
    font-size: 36px;
  }
  
  .upload-placeholder p {
    font-size: 14px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
}

.upload-placeholder p {
  margin: 5px 0;
  color: #666;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .file-info {
    gap: 10px;
  }
  
  .file-icon {
    font-size: 24px;
  }
  
  .file-icon i {
    font-size: 24px;
  }
  
  .file-details {
    text-align: center;
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    word-break: break-word;
    font-size: 14px;
  }
}

.file-icon {
  font-size: 32px;
  color: #2196f3;
}

.file-icon i {
  font-size: 32px;
}

.file-details {
  text-align: left;
}

.file-name {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.file-size {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #666;
}

.btn-remove {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #d32f2f;
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
}

.upload-progress {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}
</style>

