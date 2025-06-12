<template>
  <Layout>
    <div class="projects-container">
      <div class="projects-header">
        <div class="header-left">
          <h1>My Projects</h1>
          <p class="header-subtitle">{{ projects.length }} {{ projects.length === 1 ? 'project' : 'projects' }}</p>
        </div>
        <button @click="showCreateModal = true" class="create-button">
          <PlusIcon class="button-icon" />
          <span class="button-text">Create New Project</span>
        </button>
      </div>

      <!-- Filters and Search -->
      <div v-if="projects.length > 0" class="filters-section">
        <div class="search-box">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="search-input"
          />
        </div>
        <div class="filter-buttons">
          <button
            @click="filterStatus = null"
            :class="['filter-btn', { active: filterStatus === null }]"
          >
            All
          </button>
          <button
            @click="filterStatus = 'active'"
            :class="['filter-btn', { active: filterStatus === 'active' }]"
          >
            Active
          </button>
          <button
            @click="filterStatus = 'archived'"
            :class="['filter-btn', { active: filterStatus === 'archived' }]"
          >
            Archived
          </button>
        </div>
      </div>

      <div v-if="projectStore.error" class="error-banner">
        <ExclamationTriangleIcon class="error-icon" />
        <span>{{ projectStore.error }}</span>
        <button @click="projectStore.clearError()" class="close-error">
          <XMarkIcon class="close-icon" />
        </button>
      </div>

      <div v-if="projectStore.loading && projects.length === 0" class="loading-state">
        <ArrowPathIcon class="spinner" />
        <p>Loading projects...</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <ChartBarIcon class="empty-icon" />
        <h3>{{ searchQuery || filterStatus ? 'No projects found' : 'No projects yet' }}</h3>
        <p>{{ searchQuery || filterStatus ? 'Try adjusting your search or filters' : 'Create your first project to get started!' }}</p>
        <button v-if="!searchQuery && !filterStatus" @click="showCreateModal = true" class="btn btn-primary">
          Create Your First Project
        </button>
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="navigateToProject(project.id)"
        >
          <div class="project-card-header">
            <div class="card-title-section">
              <h3>{{ project.name }}</h3>
              <span :class="['status-badge', project.status]">
                {{ project.status }}
              </span>
            </div>
            <button
              @click.stop="handleDelete(project.id)"
              class="delete-icon-btn"
              :disabled="projectStore.loading"
              title="Delete project"
            >
              <TrashIcon class="delete-icon" />
            </button>
          </div>
          <p class="project-description">
            {{ project.description || "No description provided" }}
          </p>
          <div class="project-card-footer">
            <div class="project-meta">
              <span class="meta-item">
                <CalendarIcon class="meta-icon" />
                Created {{ formatDate(project.created_at) }}
              </span>
              <span class="meta-item">
                <RefreshIcon class="meta-icon" />
                Updated {{ formatDate(project.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Project Modal -->
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Create New Project</h2>
            <button @click="showCreateModal = false" class="close-button">
              <XMarkIcon class="close-icon" />
            </button>
          </div>
          <form @submit.prevent="handleCreate">
            <div class="form-group">
              <label for="name">Project Name *</label>
              <input
                id="name"
                v-model="newProject.name"
                type="text"
                required
                placeholder="Enter project name"
                maxlength="255"
              />
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="newProject.description"
                placeholder="Enter project description"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" v-model="newProject.status">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div v-if="createError" class="error-message">{{ createError }}</div>
            <div class="modal-footer">
              <button type="button" @click="showCreateModal = false" class="cancel-button">
                Cancel
              </button>
              <button type="submit" :disabled="projectStore.loading" class="submit-button">
                {{ projectStore.loading ? "Creating..." : "Create Project" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project";
import type { CreateProjectData, Project } from "@/types/project";
import Layout from "@/components/Layout.vue";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TrashIcon,
  CalendarIcon,
  ArrowPathIcon as RefreshIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const projectStore = useProjectStore();

const projects = ref(projectStore.projects);
const showCreateModal = ref(false);
const createError = ref("");
const searchQuery = ref("");
const filterStatus = ref<"active" | "archived" | null>(null);

const newProject = ref<CreateProjectData>({
  name: "",
  description: "",
  status: "active",
});

// Filtered projects based on search and status
const filteredProjects = computed(() => {
  let filtered = [...projects.value];

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter((p) => p.status === filterStatus.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// Watch for project store changes
watch(
  () => projectStore.projects,
  (newProjects) => {
    projects.value = newProjects;
  },
  { deep: true }
);

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
    projects.value = projectStore.projects;
  } catch (error) {
    console.error("Failed to load projects:", error);
  }
});

function navigateToProject(id: number) {
  router.push(`/projects/${id}`);
}

async function handleCreate() {
  createError.value = "";
  try {
    await projectStore.createProject(newProject.value);
    projects.value = projectStore.projects;
    showCreateModal.value = false;
    newProject.value = { name: "", description: "", status: "active" };
  } catch (error: any) {
    createError.value = projectStore.error || "Failed to create project";
  }
}

async function handleDelete(id: number) {
  if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
    return;
  }

  try {
    await projectStore.deleteProject(id);
    projects.value = projectStore.projects;
  } catch (error) {
    console.error("Failed to delete project:", error);
  }
}

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
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<style scoped>
.projects-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-left h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.create-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.button-icon {
  width: 20px;
  height: 20px;
}

.button-text {
  font-weight: 600;
}

/* Filters Section */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #e0e0e0;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.error-banner {
  background: #fff5f5;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #fc8181;
}

.error-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.close-error {
  background: none;
  border: none;
  color: #c53030;
  cursor: pointer;
  padding: 4px;
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

.close-error:hover {
  background: rgba(197, 48, 48, 0.1);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state .spinner {
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

.loading-state p {
  color: #666;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #999;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.card-title-section {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.project-card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  flex: 1;
  line-height: 1.3;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
  white-space: nowrap;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.archived {
  background: #fff3e0;
  color: #e65100;
}

.delete-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0.6;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 18px;
  height: 18px;
  color: #e74c3c;
}

.delete-icon-btn:hover:not(:disabled) {
  opacity: 1;
  background: #ffebee;
  transform: scale(1.1);
}

.delete-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.project-description {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 20px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.project-card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  color: #999;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: #999;
  flex-shrink: 0;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
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
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button .close-icon {
  width: 20px;
  height: 20px;
}

.close-button:hover {
  background: #f5f5f5;
}

form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
}

.error-message {
  color: #e74c3c;
  background: #ffeaea;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.submit-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

