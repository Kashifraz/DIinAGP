<template>
  <div class="notice-management">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Notice Management</h1>
        <button @click="showCreateForm = true" class="btn btn-primary">
          <i class="fas fa-plus"></i> Create Notice
        </button>
      </div>

      <!-- Create/Edit Form Modal -->
      <div v-if="showCreateForm || editingNotice" class="modal-overlay" @click.self="closeForm">
        <div class="modal-content">
          <h2>{{ editingNotice ? 'Edit Notice' : 'Create Notice' }}</h2>
          <NoticeForm
            :notice="editingNotice"
            :loading="noticeStore.loading"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>

      <!-- Notices List -->
      <div v-if="noticeStore.loading && coordinatorNotices.length === 0" class="loading">
        Loading notices...
      </div>

      <div v-else-if="coordinatorNotices.length === 0" class="empty-state">
        <i class="fas fa-bullhorn"></i>
        <p>No notices created yet.</p>
        <button @click="showCreateForm = true" class="btn btn-primary">
          Create Your First Notice
        </button>
      </div>

      <div v-else class="notices-container">
        <div class="notices-list">
          <div
            v-for="notice in coordinatorNotices"
            :key="notice.id"
            class="notice-item"
            :class="{ 'published': notice.status === 'PUBLISHED', 'draft': notice.status === 'DRAFT', 'expired': notice.status === 'EXPIRED' }"
          >
            <div class="notice-item-header">
              <div class="notice-item-title-row">
                <h3>{{ notice.title }}</h3>
                <span class="status-badge" :class="notice.status.toLowerCase()">
                  {{ notice.status }}
                </span>
              </div>
              <div class="notice-item-meta">
                <span class="category">{{ notice.category }}</span>
                <span class="priority" :class="notice.priority.toLowerCase()">
                  {{ notice.priority }}
                </span>
                <span class="date">{{ formatDate(notice.createdAt) }}</span>
              </div>
            </div>
            <div class="notice-item-content">
              <p>{{ truncateContent(notice.content) }}</p>
            </div>
            <div class="notice-item-footer">
              <div class="notice-stats">
                <span v-if="notice.status === 'PUBLISHED'">
                  <i class="fas fa-eye"></i> {{ notice.readCount }} read
                </span>
                <span v-if="notice.expirationDate">
                  <i class="fas fa-clock"></i> Expires: {{ formatDate(notice.expirationDate) }}
                </span>
              </div>
              <div class="notice-actions">
                <button
                  v-if="notice.status === 'DRAFT'"
                  @click="handlePublish(notice.id)"
                  class="btn btn-success btn-sm"
                  :disabled="noticeStore.loading"
                >
                  <i class="fas fa-paper-plane"></i> Publish
                </button>
                <button
                  @click="handleEdit(notice)"
                  class="btn btn-secondary btn-sm"
                  :disabled="notice.status === 'PUBLISHED'"
                >
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button
                  @click="handleDelete(notice.id)"
                  class="btn btn-danger btn-sm"
                  :disabled="noticeStore.loading"
                >
                  <i class="fas fa-trash"></i> Delete
                </button>
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
import { useNoticeStore } from '@/stores/notice'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import NoticeForm from '@/components/notice/NoticeForm.vue'

const noticeStore = useNoticeStore()
const toast = useToast()

const showCreateForm = ref(false)
const editingNotice = ref(null)

const coordinatorNotices = computed(() => noticeStore.coordinatorNotices)

onMounted(async () => {
  try {
    await noticeStore.fetchCoordinatorNotices()
  } catch (err) {
    toast.error('Failed to load notices')
  }
})

const handleFormSubmit = async (formData) => {
  try {
    if (editingNotice.value) {
      await noticeStore.updateNotice(editingNotice.value.id, formData)
      toast.success('Notice updated successfully!')
    } else {
      await noticeStore.createNotice(formData)
      toast.success('Notice created successfully!')
    }
    closeForm()
    await noticeStore.fetchCoordinatorNotices()
  } catch (err) {
    toast.error(noticeStore.error || 'Failed to save notice')
  }
}

const handleEdit = (notice) => {
  if (notice.status === 'PUBLISHED') {
    toast.error('Cannot edit a published notice')
    return
  }
  editingNotice.value = notice
}

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this notice?')) {
    return
  }

  try {
    await noticeStore.deleteNotice(id)
    toast.success('Notice deleted successfully!')
  } catch (err) {
    toast.error(noticeStore.error || 'Failed to delete notice')
  }
}

const handlePublish = async (id) => {
  try {
    await noticeStore.publishNotice(id)
    toast.success('Notice published successfully!')
    await noticeStore.fetchCoordinatorNotices()
  } catch (err) {
    toast.error(noticeStore.error || 'Failed to publish notice')
  }
}

const closeForm = () => {
  showCreateForm.value = false
  editingNotice.value = null
}

const truncateContent = (content) => {
  if (!content) return ''
  if (content.length <= 100) return content
  return content.substring(0, 100) + '...'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.notice-management {
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

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.notices-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notices-list {
  padding: 20px;
}

.notice-item {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.notice-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notice-item.published {
  border-left: 4px solid #4caf50;
}

.notice-item.draft {
  border-left: 4px solid #ff9800;
}

.notice-item.expired {
  border-left: 4px solid #9e9e9e;
  opacity: 0.7;
}

.notice-item-header {
  margin-bottom: 12px;
}

.notice-item-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notice-item-title-row h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.published {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.draft {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.expired {
  background: #f5f5f5;
  color: #616161;
}

.notice-item-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.notice-item-content {
  margin-bottom: 12px;
}

.notice-item-content p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.notice-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 12px;
}

.notice-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.notice-stats i {
  margin-right: 4px;
}

.notice-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #bbb;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049 0%, #388e3c 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

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
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 30px;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .notice-item-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .notice-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>

