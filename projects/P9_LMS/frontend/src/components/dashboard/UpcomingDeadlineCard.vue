<template>
  <div class="deadline-card">
    <div class="deadline-header">
      <div class="deadline-info">
        <h4 class="deadline-title">{{ deadline.title }}</h4>
        <p class="deadline-course">{{ deadline.courseName }} ({{ deadline.courseCode }})</p>
      </div>
      <div class="deadline-badge" :class="urgencyClass">
        {{ urgencyText }}
      </div>
    </div>
    <div class="deadline-footer">
      <div class="deadline-meta">
        <span class="deadline-type">{{ deadline.assessmentType }}</span>
        <span class="deadline-date">
          <i class="fas fa-clock"></i>
          {{ formatDate(deadline.deadline) }}
        </span>
      </div>
      <div class="deadline-actions">
        <button @click="$emit('view', deadline)" class="btn-view">
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  deadline: {
    type: Object,
    required: true
  }
})

defineEmits(['view'])

const urgencyClass = computed(() => {
  if (!props.deadline.deadline) return 'neutral'
  const now = new Date()
  const deadline = new Date(props.deadline.deadline)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 1) return 'urgent'
  if (diffDays <= 3) return 'soon'
  return 'normal'
})

const urgencyText = computed(() => {
  if (!props.deadline.deadline) return 'No deadline'
  const now = new Date()
  const deadline = new Date(props.deadline.deadline)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days left`
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<style scoped>
.deadline-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
  transition: all 0.3s;
}

.deadline-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.deadline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.deadline-info {
  flex: 1;
}

.deadline-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.deadline-course {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.deadline-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.deadline-badge.urgent {
  background: #fee;
  color: #c33;
}

.deadline-badge.soon {
  background: #ffeaa7;
  color: #d63031;
}

.deadline-badge.normal {
  background: #e8f5e9;
  color: #2e7d32;
}

.deadline-badge.overdue {
  background: #ffebee;
  color: #c62828;
}

.deadline-badge.neutral {
  background: #f5f5f5;
  color: #666;
}

.deadline-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.deadline-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.deadline-type {
  text-transform: uppercase;
  font-weight: 600;
  color: #667eea;
}

.deadline-date i {
  margin-right: 4px;
}

.btn-view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .deadline-header {
    flex-direction: column;
  }

  .deadline-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .deadline-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>

