<template>
  <Layout>
    <div class="dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>Welcome back, {{ authStore.user?.username }}!</h1>
          <p class="subtitle">Here's an overview of your projects and activity</p>
        </div>
        <div class="header-actions">
          <RouterLink to="/projects" class="btn btn-secondary">
            View All Projects
          </RouterLink>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <ChartBarIcon class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ totalProjects }}</div>
            <div class="stat-label">Total Projects</div>
          </div>
        </div>
        <div class="stat-card">
          <CheckCircleIcon class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ activeProjects }}</div>
            <div class="stat-label">Active Projects</div>
          </div>
        </div>
        <div class="stat-card">
          <ChartUpIcon class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ projectsWithCharts }}</div>
            <div class="stat-label">Projects with Charts</div>
          </div>
        </div>
        <div class="stat-card">
          <DocumentIcon class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ totalExports }}</div>
            <div class="stat-label">PDF Exports</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="quick-actions">
          <button @click="handleCreateProject" class="action-card">
            <PlusIcon class="action-icon" />
            <div class="action-content">
              <h3>Create New Project</h3>
              <p>Start a new chart project</p>
            </div>
          </button>
          <RouterLink to="/projects" class="action-card">
            <FolderIcon class="action-icon" />
            <div class="action-content">
              <h3>Browse Projects</h3>
              <p>View and manage all projects</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="recent-projects-section">
        <div class="section-header">
          <h2 class="section-title">Recent Projects</h2>
          <RouterLink to="/projects" class="view-all-link">View All →</RouterLink>
        </div>

        <div v-if="loading && recentProjects.length === 0" class="loading-state">
          <ArrowPathIcon class="spinner" />
          <p>Loading projects...</p>
        </div>

        <div v-else-if="recentProjects.length === 0" class="empty-state">
          <ChartBarIcon class="empty-icon" />
          <h3>No projects yet</h3>
          <p>Create your first project to start building beautiful charts</p>
          <button @click="handleCreateProject" class="btn btn-primary">
            Create Your First Project
          </button>
        </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="project-card"
            @click="navigateToProject(project.id)"
          >
            <div class="project-card-header">
              <h3>{{ project.name }}</h3>
              <span :class="['status-badge', project.status]">
                {{ project.status }}
              </span>
            </div>
            <p class="project-description">
              {{ project.description || "No description" }}
            </p>
            <div class="project-card-footer">
              <span class="project-meta">
                Updated {{ formatDate(project.updated_at) }}
              </span>
              <button
                @click.stop="handleDelete(project.id)"
                class="delete-btn"
                :disabled="loading"
                title="Delete project"
              >
                <TrashIcon class="delete-icon" />
              </button>
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
          <form @submit.prevent="handleCreateProjectSubmit" class="modal-form">
            <div class="form-group">
              <label for="project-name">Project Name *</label>
              <input
                id="project-name"
                v-model="newProject.name"
                type="text"
                required
                placeholder="Enter project name"
                maxlength="255"
              />
            </div>
            <div class="form-group">
              <label for="project-description">Description</label>
              <textarea
                id="project-description"
                v-model="newProject.description"
                placeholder="Enter project description (optional)"
                rows="3"
              ></textarea>
            </div>
            <div v-if="createError" class="error-message">{{ createError }}</div>
            <div class="modal-actions">
              <button
                type="button"
                @click="showCreateModal = false"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="creating"
              >
                {{ creating ? "Creating..." : "Create Project" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useProjectStore } from "@/stores/project";
import Layout from "@/components/Layout.vue";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ChartBarIcon as ChartUpIcon,
  DocumentIcon,
  PlusIcon,
  FolderIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();
const projectStore = useProjectStore();

const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);
const createError = ref<string | null>(null);

const newProject = ref({
  name: "",
  description: "",
});

// Computed properties
const projects = computed(() => projectStore.projects);
const recentProjects = computed(() => {
  return [...projects.value]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6); // Show up to 6 recent projects
});

const totalProjects = computed(() => projects.value.length);
const activeProjects = computed(() => {
  return projects.value.filter((p) => p.status === "active").length;
});

const projectsWithCharts = computed(() => {
  // This would require checking chart configs, for now we'll estimate
  // based on projects that have been updated recently (likely have charts)
  return projects.value.filter((p) => {
    const updated = new Date(p.updated_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated > weekAgo;
  }).length;
});

const totalExports = computed(() => {
  // This would need to be fetched from backend, for now return 0
  // In a real implementation, you'd add an export count endpoint
  return 0;
});

// Functions
function formatDate(dateString: string) {
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

function navigateToProject(projectId: number) {
  router.push(`/projects/${projectId}`);
}

async function handleCreateProject() {
  showCreateModal.value = true;
  newProject.value = { name: "", description: "" };
  createError.value = null;
}

async function handleCreateProjectSubmit() {
  if (!newProject.value.name.trim()) {
    createError.value = "Project name is required";
    return;
  }

  creating.value = true;
  createError.value = null;

  try {
    const project = await projectStore.createProject({
      name: newProject.value.name.trim(),
      description: newProject.value.description.trim(),
      status: "active",
    });

    showCreateModal.value = false;
    // Navigate to the new project
    router.push(`/projects/${project.id}`);
  } catch (error: any) {
    createError.value = error.message || "Failed to create project";
  } finally {
    creating.value = false;
  }
}

async function handleDelete(projectId: number) {
  if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
    return;
  }

  try {
    await projectStore.deleteProject(projectId);
    // Projects list will update automatically
  } catch (error: any) {
    alert(error.message || "Failed to delete project");
  }
}

// Load projects on mount
onMounted(async () => {
  loading.value = true;
  try {
    await projectStore.fetchProjects();
  } catch (error) {
    console.error("Failed to load projects:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Header Section */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-section h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  flex-shrink: 0;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.action-icon {
  width: 60px;
  height: 60px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7ff;
  border-radius: 12px;
  flex-shrink: 0;
  color: #667eea;
}

.action-content h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.action-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

/* Recent Projects */
.recent-projects-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #764ba2;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #667eea;
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
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-card-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
  flex-shrink: 0;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.archived {
  background: #fff3e0;
  color: #e65100;
}

.project-description {
  color: #666;
  font-size: 0.95rem;
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.project-meta {
  font-size: 0.85rem;
  color: #999;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 18px;
  height: 18px;
  color: #e74c3c;
}

.delete-btn:hover:not(:disabled) {
  background: #ffebee;
  opacity: 1;
}

.delete-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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
  padding: 20px;
}

.modal-content {
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

.modal-form {
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
.form-group textarea {
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
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  color: #c62828;
  font-size: 0.9rem;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #ffebee;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

/* Button Styles */
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

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 20px 16px;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>

