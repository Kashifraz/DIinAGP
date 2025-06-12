<template>
  <div class="file-upload-container">
    <div
      class="drop-zone"
      :class="{ 'dragover': isDragging, 'has-file': selectedFile }"
      @drop="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.xlsx"
        @change="handleFileSelect"
        style="display: none"
      />
      <div v-if="!selectedFile && !uploading" class="drop-zone-content">
        <FolderIcon class="upload-icon" />
        <p class="drop-zone-text">Drag & drop your file here</p>
        <p class="drop-zone-subtext">or click to browse</p>
        <p class="file-requirements">Supports: CSV, XLSX (Max 50 MB)</p>
      </div>
      <div v-if="selectedFile && !uploading" class="file-preview">
        <div class="file-info">
          <DocumentIcon class="file-icon" />
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSizeWrapper(selectedFile.size) }}</p>
          </div>
          <button @click.stop="clearFile" class="remove-button">
            <XMarkIcon class="remove-icon" />
          </button>
        </div>
      </div>
      <div v-if="uploading" class="upload-progress">
        <div class="progress-info">
          <p>Uploading {{ selectedFile?.name }}...</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">{{ uploadProgress }}%</p>
        </div>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <button
      v-if="selectedFile && !uploading"
      @click="handleUpload"
      class="upload-button"
      :disabled="uploading"
    >
      Upload File
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { uploadFile, validateFile, formatFileSize, type UploadProgress } from "@/utils/fileUpload";
import type { FileUploadResponse } from "@/types/file";
import { FolderIcon, DocumentIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  projectId: number;
}>();

const emit = defineEmits<{
  (e: "uploaded", file: FileUploadResponse): void;
  (e: "error", error: string): void;
  (e: "ingest-requested", fileId: number): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const error = ref<string | null>(null);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFile(target.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0]);
  }
}

function processFile(file: File) {
  error.value = null;
  const validation = validateFile(file);

  if (!validation.valid) {
    error.value = validation.error || "Invalid file";
    return;
  }

  selectedFile.value = file;
}

function clearFile() {
  selectedFile.value = null;
  error.value = null;
  uploadProgress.value = 0;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function handleUpload() {
  if (!selectedFile.value) return;

  uploading.value = true;
  error.value = null;
  uploadProgress.value = 0;

  try {
    const response = await uploadFile(
      props.projectId,
      selectedFile.value,
      (progress) => {
        uploadProgress.value = progress.percentage;
      }
    );

    emit("uploaded", response);
    // Request ingestion after successful upload
    emit("ingest-requested", response.id);
    clearFile();
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.detail || err.message || "Failed to upload file";
    error.value = errorMessage;
    emit("error", errorMessage);
  } finally {
    uploading.value = false;
  }
}

// Expose formatFileSize for template
function formatFileSizeWrapper(bytes: number): string {
  return formatFileSize(bytes);
}
</script>

<style scoped>
.file-upload-container {
  margin-bottom: 24px;
}

.drop-zone {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.drop-zone:hover {
  border-color: #667eea;
  background: #f5f5ff;
}

.drop-zone.dragover {
  border-color: #667eea;
  background: #f0f0ff;
  border-style: solid;
}

.drop-zone.has-file {
  border-color: #667eea;
  background: white;
  padding: 20px;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #667eea;
  margin: 0 auto 16px;
}

.drop-zone-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.drop-zone-subtext {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.file-requirements {
  font-size: 0.85rem;
  color: #999;
  margin: 8px 0 0 0;
}

.file-preview {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.file-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  word-break: break-word;
}

.file-size {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.remove-button {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
  padding: 0;
}

.remove-icon {
  width: 18px;
  height: 18px;
}

.remove-button:hover {
  opacity: 0.9;
}

.upload-progress {
  width: 100%;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-info p {
  margin: 0;
  color: #333;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.error-message {
  color: #e74c3c;
  background: #ffeaea;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 12px;
  text-align: center;
}

.upload-button {
  margin-top: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
  width: 100%;
}

.upload-button:hover:not(:disabled) {
  opacity: 0.9;
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

