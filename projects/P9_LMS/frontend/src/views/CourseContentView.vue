<template>
  <div class="course-content-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>{{ course?.name || 'Course Content' }}</h1>
        <div class="header-actions">
          <span v-if="course" class="course-code">{{ course.code }}</span>
          <router-link to="/my-courses" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to Courses
          </router-link>
        </div>
      </div>

      <div v-if="contentStore.loading" class="loading">
        Loading course content...
      </div>

      <div v-else-if="contentStore.modules.length === 0" class="no-content">
        <p>No content modules available for this course.</p>
      </div>

      <div v-else class="modules-list">
        <div
          v-for="module in contentStore.modules"
          :key="module.id"
          class="module-card"
        >
          <div class="module-header" @click="toggleModule(module.id)">
            <div class="module-info">
              <h3>{{ module.name }}</h3>
              <p v-if="module.description" class="module-description">
                {{ module.description }}
              </p>
            </div>
            <div class="module-toggle">
              <i :class="expandedModules.has(module.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>
          </div>

          <div v-if="expandedModules.has(module.id)" class="module-content">
            <div v-if="module.contents && module.contents.length === 0" class="no-content-items">
              No content items in this module.
            </div>
            <div v-else class="content-items">
              <div
                v-for="contentItem in module.contents"
                :key="contentItem.id"
                class="content-item"
              >
                <div class="content-icon">
                  <i v-if="contentItem.contentType === 'FILE'" :class="getFileIcon(contentItem.fileType)"></i>
                  <i v-else class="fas fa-link"></i>
                </div>
                <div class="content-details">
                  <h4>{{ contentItem.title }}</h4>
                  <p v-if="contentItem.description">{{ contentItem.description }}</p>
                  <div class="content-meta">
                    <span v-if="contentItem.fileType" class="file-type">{{ contentItem.fileType }}</span>
                    <span v-if="contentItem.fileSize" class="file-size">{{ formatFileSize(contentItem.fileSize) }}</span>
                    <span v-if="contentItem.uploaderName" class="uploader">Uploaded by {{ contentItem.uploaderName }}</span>
                  </div>
                </div>
                <div class="content-actions">
                  <a
                    v-if="contentItem.contentType === 'FILE'"
                    @click.prevent="handleDownload(contentItem)"
                    href="#"
                    class="btn-download"
                  >
                    <i class="fas fa-download"></i> Download
                  </a>
                  <a
                    v-else
                    :href="contentItem.fileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-link"
                  >
                    <i class="fas fa-external-link-alt"></i> Open Link
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content'
import { useCourseStore } from '@/stores/course'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const contentStore = useContentStore()
const courseStore = useCourseStore()
const toast = useToast()

const courseId = computed(() => parseInt(route.params.courseId))
const course = computed(() => courseStore.currentCourse)
const expandedModules = ref(new Set())

onMounted(async () => {
  if (courseId.value) {
    await loadCourse()
    await loadContent()
    // Expand first module by default
    if (contentStore.modules.length > 0) {
      expandedModules.value.add(contentStore.modules[0].id)
    }
  }
})

const loadCourse = async () => {
  try {
    await courseStore.fetchCourseById(courseId.value)
  } catch (err) {
    console.error('Failed to load course:', err)
  }
}

const loadContent = async () => {
  try {
    await contentStore.fetchModulesByCourse(courseId.value)
  } catch (err) {
    toast.error('Failed to load course content')
    console.error('Failed to load content:', err)
  }
}

const toggleModule = (moduleId) => {
  if (expandedModules.value.has(moduleId)) {
    expandedModules.value.delete(moduleId)
  } else {
    expandedModules.value.add(moduleId)
  }
}

const getFileIcon = (fileType) => {
  const icons = {
    PDF: 'fas fa-file-pdf',
    DOC: 'fas fa-file-word',
    PPT: 'fas fa-file-powerpoint',
    VIDEO: 'fas fa-file-video'
  }
  return icons[fileType] || 'fas fa-file'
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const handleDownload = async (contentItem) => {
  try {
    await contentStore.downloadContent(contentItem.id)
    toast.success('File downloaded successfully!')
  } catch (err) {
    toast.error('Failed to download file')
    console.error('Download error:', err)
  }
}
</script>

<style scoped>
.course-content-view {
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
  flex-wrap: wrap;
  gap: 15px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.course-code {
  padding: 8px 16px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

.btn-back {
  background: #6c757d;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #5a6268;
}

.loading,
.no-content {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #666;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.module-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.module-header {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.module-header:hover {
  background: #f9f9f9;
}

.module-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.module-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.module-toggle {
  color: #999;
  font-size: 18px;
}

.module-content {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #eee;
}

.no-content-items {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.content-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.content-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
}

.content-icon {
  font-size: 24px;
  color: #2196f3;
  min-width: 30px;
}

.content-details {
  flex: 1;
}

.content-details h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.content-details p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.content-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.file-type,
.file-size,
.uploader {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.content-actions {
  display: flex;
  align-items: center;
}

.btn-download,
.btn-link {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-download:hover,
.btn-link:hover {
  background: #1976d2;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-item {
    flex-direction: column;
  }

  .content-actions {
    width: 100%;
  }

  .btn-download,
  .btn-link {
    width: 100%;
    justify-content: center;
  }
}
</style>

