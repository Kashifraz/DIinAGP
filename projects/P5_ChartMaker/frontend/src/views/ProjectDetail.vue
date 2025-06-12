<template>
  <Layout>
    <div v-if="loading" class="loading-container">
      <ArrowPathIcon class="spinner" />
      <p>Loading project...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-secondary">Go Back</button>
    </div>
    <div v-else-if="project" class="project-detail-container">
      <!-- Project Header -->
      <div class="project-header">
        <button @click="goBack" class="back-button">← Back to Projects</button>
        <div class="header-content">
          <div class="project-info">
            <div class="project-title-row">
              <h1>{{ project.name }}</h1>
              <span :class="['status-badge', project.status]">
                {{ project.status }}
              </span>
              <button
                v-if="!isEditing"
                @click="startEdit"
                class="icon-button"
                :disabled="projectStore.loading"
                title="Edit project"
              >
                <PencilIcon class="edit-icon" />
              </button>
            </div>
            <p class="project-description">{{ project.description || "No description" }}</p>
            <div class="project-meta">
              <span>Created: {{ formatDate(project.created_at) }}</span>
              <span>Updated: {{ formatDate(project.updated_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Mode Modal -->
        <div v-if="isEditing" class="edit-modal-overlay" @click="cancelEdit">
          <div class="edit-modal-content" @click.stop>
            <div class="modal-header">
              <h2>Edit Project</h2>
              <button @click="cancelEdit" class="close-button">
                <XMarkIcon class="close-icon" />
              </button>
            </div>
            <form @submit.prevent="saveEdit" class="edit-form">
              <div v-if="editError" class="error-message">{{ editError }}</div>
              <div class="form-group">
                <label for="edit-name">Project Name *</label>
                <input
                  id="edit-name"
                  v-model="editData.name"
                  type="text"
                  required
                  placeholder="Enter project name"
                  maxlength="255"
                />
              </div>
              <div class="form-group">
                <label for="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  v-model="editData.description"
                  placeholder="Enter project description"
                  rows="4"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="edit-status">Status</label>
                <select id="edit-status" v-model="editData.status">
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" @click="cancelEdit" class="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="projectStore.loading">
                  {{ projectStore.loading ? "Saving..." : "Save Changes" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="main-content-wrapper">
        <!-- Tabs and Content Panel -->
        <div class="content-panel">
          <!-- Tabs Navigation -->
          <div class="tabs-container">
            <div class="tabs-header">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['tab-button', { active: activeTab === tab.id }]"
              >
                <component :is="tab.iconComponent" class="tab-icon" />
                <span class="tab-label">{{ tab.label }}</span>
                <component v-if="tab.badge" :is="tab.badge" class="tab-badge" />
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Tab 1: Data Upload -->
            <div v-if="activeTab === 'upload'" class="tab-panel">
              <div class="panel-section">
                <h2>Upload Data File</h2>
                <FileUpload
                  :project-id="project.id"
                  @uploaded="handleFileUploaded"
                  @error="handleFileError"
                  @ingest-requested="handleIngestRequested"
                />
              </div>

              <div class="panel-section">
                <h2>Uploaded Files</h2>
                <div v-if="projectStore.loading && uploadedFiles.length === 0" class="loading-state">
                  <ArrowPathIcon class="spinner" />
                  <p>Loading files...</p>
                </div>
                <div v-else-if="uploadedFiles.length === 0" class="empty-state">
                  <DocumentIcon class="empty-icon" />
                  <p>No files uploaded yet. Upload a CSV or XLSX file to get started.</p>
                </div>
                <div v-else class="files-list">
                  <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                    <div class="file-item-info">
                      <DocumentIcon class="file-icon" />
                      <div class="file-item-details">
                        <p class="file-item-name">{{ file.filename }}</p>
                        <div class="file-item-meta">
                          <span>{{ formatFileSize(file.size_bytes) }}</span>
                          <span>{{ formatDate(file.created_at) }}</span>
                          <span>{{ file.content_type }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="file-item-actions">
                      <button
                        @click="handleIngestRequest(file.id)"
                        class="btn btn-primary btn-sm"
                        :disabled="projectStore.ingestionLoading"
                      >
                        {{ projectStore.ingestionLoading ? "Parsing..." : "Parse Data" }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Parsing State -->
              <div v-if="projectStore.ingestionLoading" class="panel-section parsing-state">
                <ArrowPathIcon class="spinner" />
                <h3>Parsing File...</h3>
                <p>Please wait while we parse your file and infer the data schema.</p>
              </div>

              <!-- Parsing Error -->
              <div v-if="projectStore.ingestionError" class="panel-section error-state">
                <h3>Parsing Error</h3>
                <p class="error-message">{{ projectStore.ingestionError }}</p>
                <button @click="retryIngestion" class="btn btn-secondary">Retry</button>
              </div>

              <!-- Schema Display -->
              <div v-if="projectStore.dataTable && projectStore.dataTable.schema_json" class="panel-section">
                <h2>Data Schema</h2>
                <SchemaDisplay :schema="projectStore.dataTable.schema_json" />
              </div>
            </div>

            <!-- Tab 2: Data Grid -->
            <div v-if="activeTab === 'data'" class="tab-panel">
              <div v-if="!projectStore.dataTable" class="empty-state">
                <ChartBarIcon class="empty-icon" />
                <h3>No Data Available</h3>
                <p>Please upload and parse a data file first.</p>
                <button @click="activeTab = 'upload'" class="btn btn-primary">
                  Go to Upload Tab
                </button>
              </div>
              <div v-else class="data-grid-container">
                <DataGrid :project-id="project.id" />
              </div>
            </div>

            <!-- Tab 3: Chart Configuration -->
            <div v-if="activeTab === 'chart'" class="tab-panel">
              <div v-if="!projectStore.dataTable || !projectStore.dataTable.schema_json" class="empty-state">
                <ChartUpIcon class="empty-icon" />
                <h3>No Data Schema Available</h3>
                <p>Please upload and parse a data file first.</p>
                <button @click="activeTab = 'upload'" class="btn btn-primary">
                  Go to Upload Tab
                </button>
              </div>
              <div v-else class="chart-config-container">
                <ColumnSelection
                  :project-id="project.id"
                  :schema="projectStore.dataTable.schema_json"
                />
              </div>
            </div>

            <!-- Tab 4: Styling -->
            <div v-if="activeTab === 'styling'" class="tab-panel">
              <div v-if="!projectStore.chartConfig" class="empty-state">
                <PaintBrushIcon class="empty-icon" />
                <h3>No Chart Configuration</h3>
                <p>Please configure your chart columns first.</p>
                <button @click="activeTab = 'chart'" class="btn btn-primary">
                  Go to Chart Configuration
                </button>
              </div>
              <div v-else class="styling-container">
                <StylePanel :project-id="project.id" />
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Preview Section (Full Width Below Tabs) -->
        <div class="preview-panel">
          <div class="preview-header">
            <h3>Chart Preview</h3>
          </div>
          <div class="preview-content">
            <div v-if="!projectStore.dataTable" class="preview-empty">
              <ChartBarIcon class="empty-icon" />
              <p>Upload and parse data to see chart preview</p>
            </div>
            <div v-else-if="!projectStore.chartConfig" class="preview-empty">
              <Cog6ToothIcon class="empty-icon" />
              <p>Configure chart columns to see preview</p>
            </div>
            <div v-else>
              <ChartPreview :project-id="project.id" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import type { UpdateProjectData } from "@/types/project";
import type { FileUploadResponse } from "@/types/file";
import { formatFileSize } from "@/utils/fileUpload";
import Layout from "@/components/Layout.vue";
import FileUpload from "@/components/FileUpload.vue";
import SchemaDisplay from "@/components/SchemaDisplay.vue";
import DataGrid from "@/components/DataGrid.vue";
import ColumnSelection from "@/components/ColumnSelection.vue";
import ChartPreview from "@/components/ChartPreview.vue";
import StylePanel from "@/components/StylePanel.vue";
import {
  ArrowPathIcon,
  PencilIcon,
  XMarkIcon,
  DocumentIcon,
  ChartBarIcon,
  ChartBarIcon as ChartUpIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const project = ref(projectStore.currentProject);
const loading = ref(false);
const error = ref<string | null>(null);
const isEditing = ref(false);
const editError = ref<string | null>(null);
const activeTab = ref("upload");
const uploadedFiles = computed(() => projectStore.uploadedFiles);

const editData = ref<UpdateProjectData>({
  name: "",
  description: "",
  status: "active",
});

// Tabs configuration with icon components
const tabs = computed(() => {
  const baseTabs = [
    { id: "upload", label: "Upload", iconComponent: ArrowUpTrayIcon },
    { id: "data", label: "Data", iconComponent: ChartBarIcon, badge: projectStore.dataTable ? CheckCircleIcon : null },
    { id: "chart", label: "Chart Config", iconComponent: Cog6ToothIcon, badge: projectStore.chartConfig ? CheckCircleIcon : null },
    { id: "styling", label: "Styling", iconComponent: PaintBrushIcon, badge: projectStore.chartConfig ? CheckCircleIcon : null },
  ];
  return baseTabs;
});

onMounted(async () => {
  const projectId = Number.parseInt(route.params.id as string);
  if (Number.isNaN(projectId)) {
    error.value = "Invalid project ID";
    return;
  }

  loading.value = true;
  try {
    // Clear previous project data when loading a new project
    projectStore.clearCurrentProject();
    projectStore.clearDataTable();
    projectStore.clearGridData();
    projectStore.clearChartConfig();
    projectStore.clearPreviewData();

    await projectStore.fetchProject(projectId);
    project.value = projectStore.currentProject;

    // Fetch uploaded files for this project
    try {
      await projectStore.fetchUploadedFiles(projectId);
    } catch (err) {
      console.error("Failed to fetch uploaded files:", err);
    }

    // Try to fetch existing data table if available
    try {
      const dataTableResult = await projectStore.fetchDataTable(projectId);
      if (dataTableResult.success && dataTableResult.dataTable) {
        // Auto-switch to data tab if data exists
        activeTab.value = "data";
        // Fetch chart configuration if data table exists
        try {
          await projectStore.fetchChartConfig(projectId);
        } catch (err) {
          console.log("No chart config found:", err);
        }
      }
    } catch (err) {
      console.log("No data table found:", err);
    }
  } catch (err: any) {
    error.value = projectStore.error || "Failed to load project";
    console.error("Failed to load project:", err);
  } finally {
    loading.value = false;
  }
});

function startEdit() {
  if (!project.value) return;
  editData.value = {
    name: project.value.name,
    description: project.value.description || "",
    status: project.value.status,
  };
  isEditing.value = true;
  editError.value = null;
}

function cancelEdit() {
  isEditing.value = false;
  editError.value = null;
  editData.value = {
    name: "",
    description: "",
    status: "active",
  };
}

async function saveEdit() {
  if (!project.value) return;
  
  editError.value = null;
  try {
    await projectStore.updateProject(project.value.id, editData.value);
    project.value = projectStore.currentProject;
    isEditing.value = false;
  } catch (err: any) {
    editError.value = projectStore.error || "Failed to update project";
    console.error("Failed to update project:", err);
  }
}

function goBack() {
  router.push("/projects");
}

async function handleFileUploaded(file: FileUploadResponse) {
  projectStore.addUploadedFile(file);
  if (project.value) {
    try {
      await projectStore.fetchUploadedFiles(project.value.id);
    } catch (err) {
      console.error("Failed to refresh uploaded files:", err);
    }
  }
}

function handleFileError(errorMessage: string) {
  console.error("File upload error:", errorMessage);
}

async function handleIngestRequest(fileId?: number) {
  if (!project.value) return;

  const result = await projectStore.ingestFile(project.value.id, fileId ? { uploaded_file_id: fileId } : undefined);
  
  if (result.success) {
    // Switch to data tab after successful ingestion
    activeTab.value = "data";
  } else {
    console.error("Failed to ingest file:", result.error);
  }
}

async function handleIngestRequested(fileId: number) {
  await handleIngestRequest(fileId);
}

onBeforeUnmount(() => {
  projectStore.clearCurrentProject();
  projectStore.clearDataTable();
  projectStore.clearGridData();
  projectStore.clearChartConfig();
  projectStore.clearPreviewData();
});

async function retryIngestion() {
  if (!project.value) return;
  await handleIngestRequest();
}

// Watch for data table changes to update tabs
watch(
  () => projectStore.dataTable,
  (newDataTable) => {
    if (newDataTable && project.value) {
      console.log("Data table loaded:", newDataTable);
    }
  }
);

// Watch for chart config changes
watch(
  () => projectStore.chartConfig,
  (newConfig, oldConfig) => {
    // Only auto-switch if chart config was just created (didn't exist before)
    // and user is currently on the chart tab
    if (newConfig && !oldConfig && activeTab.value === "chart") {
      // Don't auto-switch - let user manually navigate
      // User can manually click styling tab when ready
    }
  }
);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
</script>

<style scoped>
.project-detail-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  text-align: center;
}

.loading-container .spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #667eea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-container {
  color: #e74c3c;
}

/* Project Header */
.project-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 16px;
}

.back-button:hover {
  background: #e0e0e0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.project-info {
  flex: 1;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.project-title-row h1 {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  min-width: 200px;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.archived {
  background: #e2e3e5;
  color: #383d41;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  width: 20px;
  height: 20px;
  color: #667eea;
}

.icon-button:hover:not(:disabled) {
  background: #f5f5f5;
  opacity: 1;
}

.icon-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.project-description {
  color: #666;
  font-size: 1rem;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.project-meta {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 0.85rem;
  flex-wrap: wrap;
}

/* Main Content Wrapper */
.main-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Content Panel (Left) */
.content-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Tabs */
.tabs-container {
  border-bottom: 2px solid #f0f0f0;
  background: #fafafa;
}

.tabs-header {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs-header::-webkit-scrollbar {
  display: none;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.tab-button:hover {
  background: #f5f5f5;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: white;
}

.tab-icon {
  width: 20px;
  height: 20px;
}

.tab-label {
  font-weight: 500;
}

.tab-badge {
  width: 16px;
  height: 16px;
  color: #667eea;
  flex-shrink: 0;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  padding: 24px;
}

.panel-section {
  margin-bottom: 32px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.panel-section h2 {
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 20px 0;
}

/* Preview Panel (Full Width Below Tabs) */
.preview-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.preview-header {
  padding: 20px;
  border-bottom: 2px solid #f0f0f0;
  background: #fafafa;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.preview-content {
  padding: 24px;
  min-height: 500px;
  width: 100%;
  box-sizing: border-box;
}

.preview-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.preview-empty .empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: #999;
}

.preview-empty p {
  margin: 0;
  font-size: 0.9rem;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #999;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 24px 0;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state .spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: #666;
  margin: 0;
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-item-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
  flex-shrink: 0;
}

.file-item-details {
  flex: 1;
  min-width: 0;
}

.file-item-name {
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.file-item-meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
  flex-wrap: wrap;
}

.file-item-actions {
  flex-shrink: 0;
}

/* Parsing State */
.parsing-state {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}

.parsing-state .spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #667eea;
  animation: spin 2s linear infinite;
}

.parsing-state h3 {
  margin: 16px 0 8px 0;
  color: #333;
}

.parsing-state p {
  color: #666;
  margin: 0;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 40px;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fc8181;
}

.error-state h3 {
  margin: 0 0 12px 0;
  color: #c53030;
}

.error-message {
  color: #c53030;
  margin-bottom: 20px;
}

/* Edit Modal */
.edit-modal-overlay {
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
  padding: 20px;
}

.edit-modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
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

.edit-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

/* Buttons */
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

/* Container Styles */
.data-grid-container,
.chart-config-container,
.styling-container {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-detail-container {
    padding: 12px;
  }

  .project-title-row h1 {
    font-size: 1.5rem;
  }

  .tabs-header {
    overflow-x: auto;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 0.85rem;
  }

  .tab-content {
    min-height: 300px;
  }

  .tab-panel {
    padding: 16px;
  }
}
</style>
