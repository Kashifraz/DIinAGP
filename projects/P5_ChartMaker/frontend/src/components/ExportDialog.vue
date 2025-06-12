<template>
  <div v-if="show" class="export-dialog-overlay" @click="handleOverlayClick">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h3>Export Chart to PDF</h3>
        <button @click="handleClose" class="close-button" title="Close">
          <XMarkIcon class="close-icon" />
        </button>
      </div>

      <div class="dialog-content">
        <div v-if="exportLoading" class="export-status">
          <ArrowPathIcon class="spinner" />
          <p>Generating PDF...</p>
        </div>

        <div v-else-if="exportError" class="export-error">
          <p class="error-message">{{ exportError }}</p>
          <button @click="handleRetry" class="btn btn-secondary">Retry</button>
        </div>

        <div v-else-if="exportJob && exportJob.status === 'done'" class="export-success">
          <CheckCircleIcon class="success-icon" />
          <p>PDF exported successfully!</p>
          <a
            :href="downloadUrl"
            :download="downloadFilename"
            class="btn btn-primary"
          >
            Download PDF
          </a>
        </div>

        <form v-else @submit.prevent="handleExport" class="export-form">
          <!-- Paper Size -->
          <div class="form-section">
            <label for="paper-size" class="form-label">Paper Size</label>
            <select
              id="paper-size"
              v-model="localOptions.paper_size"
              class="form-select"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="LETTER">Letter</option>
            </select>
          </div>

          <!-- Orientation -->
          <div class="form-section">
            <label for="orientation" class="form-label">Orientation</label>
            <select
              id="orientation"
              v-model="localOptions.orientation"
              class="form-select"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <!-- Title -->
          <div class="form-section">
            <label for="export-title" class="form-label">Title (Optional)</label>
            <input
              id="export-title"
              v-model="localOptions.title"
              type="text"
              class="form-input"
              placeholder="Enter title for PDF"
              maxlength="200"
            />
            <p class="form-hint">Leave empty to use chart title or project name</p>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button
              type="button"
              @click="handleClose"
              class="btn btn-secondary"
              :disabled="exportLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="exportLoading || !canExport"
            >
              {{ exportLoading ? "Exporting..." : "Export to PDF" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useProjectStore } from "@/stores/project";
import type { PaperSize, Orientation, ExportJob } from "@/types/chart";
import { XMarkIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

interface Props {
  show: boolean;
  projectId: number;
  chartImageDataUrl: string | null;
}

interface Emits {
  (e: "close"): void;
  (e: "exported", job: ExportJob): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const projectStore = useProjectStore();

// Local form options
const localOptions = ref<{
  paper_size: PaperSize;
  orientation: Orientation;
  title: string;
}>({
  paper_size: "A4",
  orientation: "portrait",
  title: "",
});

// Computed
const exportLoading = computed(() => projectStore.exportLoading);
const exportError = computed(() => projectStore.exportError);
const exportJob = computed(() => projectStore.currentExport);

const canExport = computed(() => {
  return !!props.chartImageDataUrl && !exportLoading.value;
});

const downloadUrl = computed(() => {
  if (exportJob.value?.download_url) {
    // Convert relative URL to absolute URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    return `${baseUrl}${exportJob.value.download_url}`;
  }
  return null;
});

const downloadFilename = computed(() => {
  if (exportJob.value) {
    const timestamp = new Date().toISOString().split("T")[0];
    return `chart-export-${timestamp}.pdf`;
  }
  return "chart-export.pdf";
});

// Watch for show changes to reset form
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Reset form when dialog opens
      localOptions.value = {
        paper_size: "A4",
        orientation: "portrait",
        title: "",
      };
      projectStore.clearExport();
    }
  }
);

// Handle export
async function handleExport() {
  if (!props.chartImageDataUrl) {
    return;
  }

  try {
    const exportData = {
      chart_image: props.chartImageDataUrl,
      paper_size: localOptions.value.paper_size,
      orientation: localOptions.value.orientation,
      title: localOptions.value.title || undefined,
    };

    const job = await projectStore.createExport(props.projectId, exportData);
    emit("exported", job);
  } catch (error) {
    console.error("Export failed:", error);
    // Error is handled by store
  }
}

// Handle retry
function handleRetry() {
  projectStore.clearExport();
  handleExport();
}

// Handle close
function handleClose() {
  emit("close");
}

// Handle overlay click
function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.export-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.close-button:hover {
  background: #f5f5f5;
}

.dialog-content {
  padding: 24px;
}

.export-status,
.export-error,
.export-success {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #5470c6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.export-success .success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: #2e7d32;
}

.export-error .error-message {
  color: #c62828;
  margin-bottom: 16px;
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-select,
.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #5470c6;
  box-shadow: 0 0 0 3px rgba(84, 112, 198, 0.1);
}

.form-hint {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #5470c6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4562a8;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .export-dialog {
    width: 95%;
    margin: 20px;
  }

  .dialog-content {
    padding: 20px;
  }
}
</style>

