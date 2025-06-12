<template>
  <div 
    class="notice-card" 
    :class="{ 'unread': !notice.isRead, 'urgent': notice.priority === 'HIGH' }"
    @click="handleClick"
  >
    <div class="notice-header">
      <div class="notice-title-row">
        <h3 class="notice-title">{{ notice.title }}</h3>
        <div class="notice-badges">
          <span v-if="!notice.isRead" class="unread-dot"></span>
          <span class="category-badge" :class="notice.category.toLowerCase()">
            {{ notice.category }}
          </span>
          <span class="priority-badge" :class="notice.priority.toLowerCase()">
            {{ notice.priority }}
          </span>
        </div>
      </div>
      <div class="notice-meta">
        <span class="coordinator">By {{ notice.coordinatorName }}</span>
        <span class="date">{{ formatDate(notice.createdAt) }}</span>
      </div>
    </div>
    <div class="notice-content">
      <p>{{ truncateContent(notice.content) }}</p>
    </div>
    <div v-if="notice.expirationDate" class="notice-footer">
      <i class="fas fa-clock"></i>
      <span>Expires: {{ formatDate(notice.expirationDate) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notice: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.notice)
}

const truncateContent = (content) => {
  if (!content) return ''
  if (content.length <= 150) return content
  return content.substring(0, 150) + '...'
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
.notice-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.notice-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notice-card.unread {
  border-left: 4px solid #2196f3;
  background: #f8f9ff;
}

.notice-card.urgent {
  border-left-color: #f44336;
}

.notice-header {
  margin-bottom: 12px;
}

.notice-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.notice-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.notice-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: #2196f3;
  border-radius: 50%;
  display: inline-block;
}

.category-badge,
.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
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
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.notice-content {
  margin-bottom: 12px;
}

.notice-content p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.notice-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.notice-footer i {
  font-size: 11px;
}

@media (max-width: 768px) {
  .notice-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .notice-badges {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>

