<template>
  <div class="notice-detail">
    <Header />
    <div class="content">
      <div v-if="noticeStore.loading && !notice" class="loading">
        Loading notice...
      </div>

      <div v-else-if="!notice" class="not-found">
        <i class="fas fa-exclamation-circle"></i>
        <p>Notice not found</p>
        <router-link to="/notices" class="btn btn-primary">
          Back to Notices
        </router-link>
      </div>

      <div v-else class="notice-detail-container">
        <div class="back-link">
          <router-link to="/notices" class="back-btn">
            <i class="fas fa-arrow-left"></i> Back to Notices
          </router-link>
        </div>

        <article class="notice-article" :class="{ 'unread': !notice.isRead }">
          <div class="notice-header">
            <div class="notice-title-section">
              <h1>{{ notice.title }}</h1>
              <div class="notice-badges">
                <span v-if="!notice.isRead" class="unread-badge">
                  <i class="fas fa-circle"></i> Unread
                </span>
                <span class="category-badge" :class="notice.category.toLowerCase()">
                  {{ notice.category }}
                </span>
                <span class="priority-badge" :class="notice.priority.toLowerCase()">
                  {{ notice.priority }}
                </span>
              </div>
            </div>
            <div class="notice-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>By {{ notice.coordinatorName }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>Published: {{ formatDate(notice.createdAt) }}</span>
              </div>
              <div v-if="notice.expirationDate" class="meta-item">
                <i class="fas fa-clock"></i>
                <span>Expires: {{ formatDate(notice.expirationDate) }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-eye"></i>
                <span>{{ notice.readCount }} read</span>
              </div>
            </div>
          </div>

          <div class="notice-content">
            <div class="content-text" v-html="formatContent(notice.content)"></div>
          </div>

          <div class="notice-footer">
            <button
              v-if="!notice.isRead"
              @click="handleMarkAsRead"
              class="btn btn-primary"
              :disabled="markingAsRead"
            >
              <i class="fas fa-check"></i> Mark as Read
            </button>
            <span v-else class="read-indicator">
              <i class="fas fa-check-circle"></i> Read
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNoticeStore } from '@/stores/notice'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const router = useRouter()
const noticeStore = useNoticeStore()
const toast = useToast()

const markingAsRead = computed(() => noticeStore.loading)
const notice = computed(() => noticeStore.currentNotice)

onMounted(async () => {
  const noticeId = parseInt(route.params.id)
  if (noticeId) {
    try {
      await noticeStore.fetchNoticeById(noticeId)
      // Auto-mark as read when viewing (silently, no toast)
      if (notice.value && !notice.value.isRead) {
        await noticeStore.markAsRead(notice.value.id)
        await noticeStore.fetchUnreadCount()
        // Refresh the notice to update the read status
        await noticeStore.fetchNoticeById(noticeId)
      }
    } catch (err) {
      toast.error('Failed to load notice')
    }
  }
})

const handleMarkAsRead = async () => {
  if (!notice.value || notice.value.isRead) return

  try {
    await noticeStore.markAsRead(notice.value.id)
    toast.success('Notice marked as read')
    await noticeStore.fetchUnreadCount()
    // Refresh the notice to update the read status
    const noticeId = parseInt(route.params.id)
    if (noticeId) {
      await noticeStore.fetchNoticeById(noticeId)
    }
  } catch (err) {
    toast.error('Failed to mark notice as read')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content) => {
  if (!content) return ''
  // Convert line breaks to <br> tags
  return content.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.notice-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading,
.not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.not-found i {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
}

.not-found p {
  color: #666;
  margin-bottom: 20px;
}

.back-link {
  margin-bottom: 20px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2196f3;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #1976d2;
}

.notice-detail-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notice-article {
  padding: 40px;
}

.notice-article.unread {
  border-left: 4px solid #2196f3;
}

.notice-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.notice-title-section {
  margin-bottom: 20px;
}

.notice-title-section h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
  color: #333;
  line-height: 1.3;
}

.notice-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.unread-badge i {
  font-size: 8px;
}

.category-badge,
.priority-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.category-badge.exam {
  background: #fff3e0;
  color: #e65100;
}

.category-badge.holiday {
  background: #e8f5e9;
  color: #2e7d32;
}

.category-badge.general {
  background: #e3f2fd;
  color: #1565c0;
}

.category-badge.urgent {
  background: #ffebee;
  color: #c62828;
}

.priority-badge.low {
  background: #f5f5f5;
  color: #616161;
}

.priority-badge.medium {
  background: #fff9c4;
  color: #f57f17;
}

.priority-badge.high {
  background: #ffcdd2;
  color: #c62828;
}

.notice-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.meta-item i {
  color: #999;
}

.notice-content {
  margin-bottom: 30px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.notice-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.read-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4caf50;
  font-weight: 500;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .notice-article {
    padding: 24px;
  }

  .notice-title-section h1 {
    font-size: 22px;
  }

  .notice-meta {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

