<template>
  <div class="course-card">
    <div class="card-header">
      <div class="course-info">
        <h3>{{ course.code }}</h3>
        <p class="course-name">{{ course.name }}</p>
        <div class="course-meta">
          <span v-if="course.creditHours" class="meta-item">
            <i class="fas fa-book"></i> {{ course.creditHours }} Credits
          </span>
          <span v-if="course.professorName" class="meta-item">
            <i class="fas fa-user-tie"></i> {{ course.professorName }}
          </span>
        </div>
      </div>
      <div class="status-badge" :class="course.status?.toLowerCase()">
        {{ course.status }}
      </div>
    </div>
    
    <div v-if="course.description" class="course-description">
      {{ truncateDescription(course.description) }}
    </div>

    <div class="card-actions">
      <!-- Professor Links -->
      <template v-if="userRole === 'PROFESSOR'">
        <router-link
          :to="`/content/course/${course.id}`"
          class="action-link"
        >
          <i class="fas fa-book-open"></i> Content
        </router-link>
        <router-link
          :to="`/assessments/course/${course.id}`"
          class="action-link"
        >
          <i class="fas fa-clipboard-list"></i> Assessments
        </router-link>
        <router-link
          :to="`/attendance/course/${course.id}`"
          class="action-link"
        >
          <i class="fas fa-check-circle"></i> Attendance
        </router-link>
        <router-link
          :to="`/timetable/course/${course.id}`"
          class="action-link"
        >
          <i class="fas fa-calendar-alt"></i> Timetable
        </router-link>
        <router-link
          :to="`/resultsheets/professor`"
          class="action-link"
        >
          <i class="fas fa-file-alt"></i> Resultsheets
        </router-link>
      </template>
      
      <!-- Student Links: Only Content, Assessments, and Timetable -->
      <template v-if="userRole === 'STUDENT'">
        <router-link
          :to="`/courses/${course.id}/content`"
          class="action-link"
        >
          <i class="fas fa-book-open"></i> Content
        </router-link>
        <router-link
          :to="`/my-assessments/course/${course.id}`"
          class="action-link"
        >
          <i class="fas fa-clipboard-list"></i> Assessments
        </router-link>
        <router-link
          :to="`/my-timetable?courseId=${course.id}`"
          class="action-link"
        >
          <i class="fas fa-calendar-alt"></i> Timetable
        </router-link>
        <router-link
          :to="`/resultsheets`"
          class="action-link"
        >
          <i class="fas fa-file-alt"></i> Resultsheets
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  userRole: {
    type: String,
    default: null
  }
})

const showContentLink = computed(() => {
  return props.userRole === 'PROFESSOR'
})

const showAssessmentsLink = computed(() => {
  return props.userRole === 'PROFESSOR' || props.userRole === 'STUDENT'
})

const showTimetableLink = computed(() => {
  return props.userRole === 'PROFESSOR' || props.userRole === 'STUDENT'
})

const showViewContentLink = computed(() => {
  return props.userRole === 'STUDENT'
})

const showMyAssessmentsLink = computed(() => {
  return props.userRole === 'STUDENT'
})

function truncateDescription(description) {
  if (!description) return ''
  if (description.length > 150) {
    return description.substring(0, 150) + '...'
  }
  return description
}
</script>

<style scoped>
.course-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.course-info h3 {
  margin: 0 0 8px 0;
  color: #2196f3;
  font-size: 20px;
  font-weight: 600;
}

.course-name {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item i {
  color: #999;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.archived {
  background: #f5f5f5;
  color: #757575;
}

.course-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.action-link {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  min-width: 120px;
}

.action-link:hover {
  background: #1976d2;
}

.action-link i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .card-actions {
    flex-direction: column;
  }

  .action-link {
    width: 100%;
  }
}
</style>

