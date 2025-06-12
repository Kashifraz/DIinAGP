<template>
  <div class="content-item">
    <div class="content-info">
      <div class="content-icon">
        <i v-if="content.contentType === 'FILE'" class="fas fa-file-alt"></i>
        <i v-else class="fas fa-link"></i>
      </div>
      <div class="content-details">
        <h4>{{ content.title }}</h4>
        <p v-if="content.description" class="content-description">
          {{ content.description }}
        </p>
        <div class="content-meta">
          <span v-if="content.contentType === 'FILE'" class="file-type">
            {{ content.fileType }}
          </span>
          <span v-if="content.fileSize" class="file-size">
            {{ formatFileSize(content.fileSize) }}
          </span>
          <span v-if="content.uploaderName" class="uploader">
            Uploaded by {{ content.uploaderName }}
          </span>
          <span class="upload-date">
            {{ formatDate(content.createdAt) }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="content-actions">
      <button
        v-if="content.contentType === 'FILE'"
        @click="handleDownload"
        class="btn-action"
        title="Download"
      >
        <i class="fas fa-download"></i> Download
      </button>
      <a
        v-else
        :href="content.fileUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-action"
      >
        <i class="fas fa-external-link-alt"></i> Open Link
      </a>
      <button
        v-if="canEdit"
        @click="handleDelete"
        class="btn-action btn-delete"
        title="Delete"
      >
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['download', 'delete'])

const handleDownload = () => {
  emit('download', props.content)
}

const handleDelete = () => {
  emit('delete', props.content)
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: box-shadow 0.2s;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 768px) {
  .content-item {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }
}

.content-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .content-info {
    width: 100%;
    gap: 12px;
  }
  
  .content-icon {
    width: 36px;
    height: 36px;
    font-size: 20px;
    flex-shrink: 0;
  }
}

.content-icon {
  font-size: 24px;
  color: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #e3f2fd;
  border-radius: 8px;
}

.content-details {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .content-details {
    flex: 1;
  }
  
  .content-details h4 {
    font-size: 15px;
    word-break: break-word;
  }
  
  .content-description {
    font-size: 13px;
  }
}

.content-details h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.content-description {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.content-meta {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .content-meta {
    gap: 10px;
    font-size: 11px;
    flex-direction: column;
    gap: 5px;
  }
  
  .content-meta span {
    display: inline-block;
  }
}

.file-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.content-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .content-actions {
    width: 100%;
    justify-content: stretch;
    gap: 8px;
  }
  
  .btn-action {
    flex: 1;
    justify-content: center;
    padding: 10px 12px;
    font-size: 13px;
  }
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-action:not(.btn-delete) {
  background: #2196f3;
  color: white;
}

.btn-action:not(.btn-delete):hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}
</style>

