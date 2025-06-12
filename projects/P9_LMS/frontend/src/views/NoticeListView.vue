<template>
  <div class="notice-list">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Notices & Announcements</h1>
        <div v-if="unreadCount > 0" class="unread-indicator">
          <i class="fas fa-bell"></i>
          <span>{{ unreadCount }} unread</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label for="categoryFilter">Category:</label>
          <select id="categoryFilter" v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="EXAM">Exam</option>
            <option value="HOLIDAY">Holiday</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="sortBy">Sort By:</label>
          <select id="sortBy" v-model="sortBy" class="filter-select">
            <option value="priority">Priority</option>
            <option value="date">Date (Newest First)</option>
            <option value="date-oldest">Date (Oldest First)</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="noticeStore.loading && filteredNotices.length === 0" class="loading">
        Loading notices...
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotices.length === 0" class="empty-state">
        <i class="fas fa-bullhorn"></i>
        <p>No notices available.</p>
      </div>

      <!-- Notices List -->
      <div v-else class="notices-container">
        <NoticeCard
          v-for="notice in filteredNotices"
          :key="notice.id"
          :notice="notice"
          @click="handleNoticeClick(notice)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoticeStore } from '@/stores/notice'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import NoticeCard from '@/components/notice/NoticeCard.vue'

const router = useRouter()
const noticeStore = useNoticeStore()
const toast = useToast()

const selectedCategory = ref('')
const sortBy = ref('priority')

const unreadCount = computed(() => noticeStore.unreadCount)
const notices = computed(() => noticeStore.notices)

const filteredNotices = computed(() => {
  let filtered = [...notices.value]

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(n => n.category === selectedCategory.value)
  }

  // Sort
  if (sortBy.value === 'priority') {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  } else if (sortBy.value === 'date') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy.value === 'date-oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }

  return filtered
})

onMounted(async () => {
  try {
    await noticeStore.fetchAllNotices()
    await noticeStore.fetchUnreadCount()
  } catch (err) {
    toast.error('Failed to load notices')
  }
})

const handleNoticeClick = (notice) => {
  router.push(`/notices/${notice.id}`)
}
</script>

<style scoped>
.notice-list {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1000px;
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

.unread-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 20px;
  color: #856404;
  font-weight: 500;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #2196f3;
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
}

.notices-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
  }
}
</style>

