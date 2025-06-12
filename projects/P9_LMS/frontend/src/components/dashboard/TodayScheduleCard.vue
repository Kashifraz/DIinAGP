<template>
  <div class="schedule-card">
    <div class="schedule-time">
      <span class="time-start">{{ formatTime(schedule.startTime) }}</span>
      <span class="time-separator">-</span>
      <span class="time-end">{{ formatTime(schedule.endTime) }}</span>
    </div>
    <div class="schedule-content">
      <h4 class="schedule-course">{{ schedule.courseName }}</h4>
      <p class="schedule-code">{{ schedule.courseCode }}</p>
      <div class="schedule-meta">
        <span class="schedule-location" v-if="schedule.location">
          <i class="fas fa-map-marker-alt"></i>
          {{ schedule.location }}
        </span>
        <span class="schedule-duration" v-if="schedule.durationMinutes">
          <i class="fas fa-clock"></i>
          {{ schedule.durationMinutes }} min
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  schedule: {
    type: Object,
    required: true
  }
})

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  // Assuming timeString is in HH:mm format
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
</script>

<style scoped>
.schedule-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  transition: all 0.3s;
  border-left: 4px solid #4facfe;
}

.schedule-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.schedule-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 12px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 10px;
  color: white;
}

.time-start {
  font-size: 18px;
  font-weight: 700;
}

.time-separator {
  font-size: 12px;
  margin: 4px 0;
  opacity: 0.8;
}

.time-end {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.9;
}

.schedule-content {
  flex: 1;
}

.schedule-course {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.schedule-code {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
}

.schedule-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.schedule-location,
.schedule-duration {
  display: flex;
  align-items: center;
  gap: 6px;
}

.schedule-location i,
.schedule-duration i {
  font-size: 11px;
}

@media (max-width: 768px) {
  .schedule-card {
    flex-direction: column;
    gap: 16px;
  }

  .schedule-time {
    flex-direction: row;
    min-width: auto;
    width: 100%;
    justify-content: center;
  }

  .time-separator {
    margin: 0 8px;
  }
}
</style>

