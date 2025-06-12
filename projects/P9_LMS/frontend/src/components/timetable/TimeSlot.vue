<template>
  <div
    class="time-slot"
    :class="{ 'today': isToday, 'past': isPast }"
    :style="{ backgroundColor: color }"
    @click="$emit('click', entry)"
  >
    <div class="slot-header">
      <strong class="course-code">{{ entry.courseCode }}</strong>
      <span v-if="entry.location" class="location">
        <i class="fas fa-map-marker-alt"></i> {{ entry.location }}
      </span>
    </div>
    <div class="slot-body">
      <div class="course-name">{{ entry.courseName }}</div>
      <div class="time-range">
        <i class="fas fa-clock"></i>
        {{ formatTime(entry.startTime) }} - {{ formatTime(entry.endTime) }}
      </div>
      <div class="duration">{{ formatDuration(entry.durationMinutes) }}</div>
      <div v-if="entry.attendanceStatus" class="attendance-badge" :class="entry.attendanceStatus.toLowerCase()">
        {{ entry.attendanceStatus }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: '#e3f2fd'
  },
  isToday: {
    type: Boolean,
    default: false
  },
  isPast: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const formatTime = (timeString) => {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}
</script>

<style scoped>
.time-slot {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 80px;
}

.time-slot:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.time-slot.today {
  border: 2px solid #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.time-slot.past {
  opacity: 0.6;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-code {
  font-size: 13px;
  color: #1976d2;
  font-weight: 600;
}

.location {
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.slot-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-range {
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.duration {
  font-size: 10px;
  color: #999;
}

.attendance-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 6px;
  text-align: center;
  width: fit-content;
}

.attendance-badge.p {
  background: #4caf50;
  color: white;
}

.attendance-badge.a {
  background: #f44336;
  color: white;
}
</style>

