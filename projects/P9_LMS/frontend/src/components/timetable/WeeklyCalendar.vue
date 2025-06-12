<template>
  <div class="weekly-calendar">
    <div class="calendar-header">
      <button 
        @click="previousWeek" 
        class="nav-btn" 
        :disabled="!canNavigatePrevious"
        :class="{ 'disabled': !canNavigatePrevious }"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <h3>{{ weekRangeText }}</h3>
      <button 
        @click="nextWeek" 
        class="nav-btn" 
        :disabled="!canNavigateNext"
        :class="{ 'disabled': !canNavigateNext }"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
      <button @click="goToToday" class="today-btn">Today</button>
    </div>

    <div class="calendar-grid">
      <div class="day-column" v-for="day in days" :key="day.key">
        <div class="day-header" :class="{ 'today': day.isToday }">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.date }}</div>
        </div>
        <div class="day-slots">
          <TimeSlot
            v-for="entry in getEntriesForDay(day.key)"
            :key="entry.id"
            :entry="entry"
            :color="getColorForCourse(entry.courseId)"
            :is-today="day.isToday"
            :is-past="day.isPast"
            @click="handleSlotClick"
          />
          <div v-if="getEntriesForDay(day.key).length === 0" class="no-classes">
            No classes
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TimeSlot from './TimeSlot.vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  attendanceRecords: {
    type: Array,
    default: () => []
  },
  userRole: {
    type: String,
    default: null
  },
  courseDateRange: {
    type: Object,
    default: null // { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
  }
})

const emit = defineEmits(['slot-click'])

// Initialize current week start within course date range if available
const initializeWeekStart = () => {
  const today = new Date()
  
  if (props.courseDateRange && props.courseDateRange.startDate) {
    const startDate = new Date(props.courseDateRange.startDate)
    const endDate = new Date(props.courseDateRange.endDate)
    
    // If today is before course start, use course start
    if (today < startDate) {
      return startDate
    }
    // If today is after course end, use course end
    if (today > endDate) {
      return endDate
    }
    // Otherwise use today
    return today
  }
  
  return today
}

const currentWeekStart = ref(initializeWeekStart())

const days = computed(() => {
  const weekStart = new Date(currentWeekStart.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekDays = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isToday = date.toDateString() === today.toDateString()
    const isPast = date < today
    
    weekDays.push({
      key: dayKeys[i],
      name: dayNames[i],
      date: dateStr,
      isToday,
      isPast
    })
  }
  
  return weekDays
})

const weekRangeText = computed(() => {
  const start = new Date(currentWeekStart.value)
  start.setDate(start.getDate() - start.getDay())
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr} - ${endStr}`
})

const courseColors = ref({})
const colorPalette = [
  '#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0', '#fce4ec',
  '#e0f2f1', '#f1f8e9', '#fff9c4', '#e1bee7', '#b2dfdb'
]

onMounted(() => {
  assignColorsToCourses()
  // Ensure we're within course date range
  if (props.courseDateRange && props.courseDateRange.startDate) {
    const weekStart = new Date(currentWeekStart.value)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const courseStart = new Date(props.courseDateRange.startDate)
    const courseEnd = new Date(props.courseDateRange.endDate)
    
    // If week is before course start, move to course start
    if (weekEnd < courseStart) {
      currentWeekStart.value = courseStart
    }
    // If week is after course end, move to course end
    else if (weekStart > courseEnd) {
      currentWeekStart.value = courseEnd
    }
  }
})

// Watch for course date range changes
watch(() => props.courseDateRange, () => {
  if (props.courseDateRange && props.courseDateRange.startDate) {
    const weekStart = new Date(currentWeekStart.value)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const courseStart = new Date(props.courseDateRange.startDate)
    const courseEnd = new Date(props.courseDateRange.endDate)
    
    // Adjust if current week is outside range
    if (weekEnd < courseStart) {
      currentWeekStart.value = courseStart
    } else if (weekStart > courseEnd) {
      currentWeekStart.value = courseEnd
    }
  }
}, { immediate: true })

function assignColorsToCourses() {
  const courseIds = [...new Set(props.entries.map(e => e.courseId))]
  courseIds.forEach((courseId, index) => {
    courseColors.value[courseId] = colorPalette[index % colorPalette.length]
  })
}

function getColorForCourse(courseId) {
  return courseColors.value[courseId] || '#e3f2fd'
}

function getEntriesForDay(dayKey) {
  const day = days.value.find(d => d.key === dayKey)
  if (!day) return []
  
  // Calculate the actual date for this day
  const weekStart = new Date(currentWeekStart.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
  const dayIndex = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(dayKey)
  const entryDate = new Date(weekStart)
  entryDate.setDate(weekStart.getDate() + dayIndex)
  const entryDateStr = entryDate.toISOString().split('T')[0]
  
  // Filter entries by day of week and check if date is within course range
  const dayEntries = props.entries
    .filter(entry => {
      // First check day of week
      if (entry.dayOfWeek !== dayKey) return false
      
      // Then check if the date is within course date range
      if (entry.courseStartDate && entry.courseEndDate) {
        const entryDateObj = new Date(entryDateStr)
        const startDate = new Date(entry.courseStartDate)
        const endDate = new Date(entry.courseEndDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        entryDateObj.setHours(0, 0, 0, 0)
        
        if (entryDateObj < startDate || entryDateObj > endDate) {
          return false
        }
      }
      
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  
  // Add the actual date and attendance status to each entry
  return dayEntries.map(entry => {
    // Calculate attendance status for students
    let attendanceStatus = null
    if (props.userRole === 'STUDENT') {
      attendanceStatus = getAttendanceStatusForEntry(entry, entryDateStr)
    }
    
    return {
      ...entry,
      actualDate: entryDateStr,
      attendanceStatus
    }
  })
}

function getAttendanceStatusForEntry(entry, entryDateStr) {
  // Check if class time has passed
  const now = new Date()
  const entryDate = new Date(entryDateStr)
  const [hours, minutes] = entry.endTime.split(':')
  const classDateTime = new Date(entryDate)
  classDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const hasPassed = classDateTime < now
  
  // Find attendance record for this course and matching date
  const record = props.attendanceRecords.find(r => {
    if (r.courseId !== entry.courseId) return false
    
    // Match by session date if available
    if (r.sessionDate) {
      const recordDateStr = new Date(r.sessionDate).toISOString().split('T')[0]
      return recordDateStr === entryDateStr
    }
    
    return false
  })
  
  // If record exists and status is PRESENT, show "P"
  if (record && record.status === 'PRESENT') {
    return 'P'
  }
  
  // If class time has passed and no record found, show "A"
  if (hasPassed && !record) {
    return 'A'
  }
  
  return null
}

function previousWeek() {
  if (!canNavigatePrevious.value) return
  
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  
  // Double-check that the new week is still within bounds
  if (props.courseDateRange && props.courseDateRange.startDate) {
    const newWeekStart = new Date(newDate)
    newWeekStart.setDate(newWeekStart.getDate() - newWeekStart.getDay())
    const courseStart = new Date(props.courseDateRange.startDate)
    courseStart.setHours(0, 0, 0, 0)
    newWeekStart.setHours(0, 0, 0, 0)
    
    if (newWeekStart < courseStart) {
      // Clamp to course start date
      currentWeekStart.value = courseStart
      return
    }
  }
  
  currentWeekStart.value = newDate
}

function nextWeek() {
  if (!canNavigateNext.value) return
  
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  
  // Double-check that the new week is still within bounds
  if (props.courseDateRange && props.courseDateRange.endDate) {
    const newWeekStart = new Date(newDate)
    newWeekStart.setDate(newWeekStart.getDate() - newWeekStart.getDay())
    const newWeekEnd = new Date(newWeekStart)
    newWeekEnd.setDate(newWeekStart.getDate() + 6)
    const courseEnd = new Date(props.courseDateRange.endDate)
    courseEnd.setHours(23, 59, 59, 999)
    newWeekEnd.setHours(23, 59, 59, 999)
    
    if (newWeekEnd > courseEnd) {
      // Clamp to course end date
      const courseEndWeekStart = new Date(courseEnd)
      courseEndWeekStart.setDate(courseEnd.getDate() - courseEnd.getDay())
      currentWeekStart.value = courseEndWeekStart
      return
    }
  }
  
  currentWeekStart.value = newDate
}

function goToToday() {
  const today = new Date()
  // Check if today is within course date range
  if (props.courseDateRange) {
    const startDate = new Date(props.courseDateRange.startDate)
    const endDate = new Date(props.courseDateRange.endDate)
    if (today < startDate) {
      currentWeekStart.value = startDate
    } else if (today > endDate) {
      currentWeekStart.value = endDate
    } else {
      currentWeekStart.value = today
    }
  } else {
    currentWeekStart.value = today
  }
}

// Check if we can navigate to previous week
const canNavigatePrevious = computed(() => {
  if (!props.courseDateRange || !props.courseDateRange.startDate) return true
  
  const weekStart = new Date(currentWeekStart.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
  weekStart.setHours(0, 0, 0, 0)
  
  const courseStart = new Date(props.courseDateRange.startDate)
  courseStart.setHours(0, 0, 0, 0)
  
  // Can navigate previous only if moving back 7 days would still be within or at the start
  const previousWeekStart = new Date(weekStart)
  previousWeekStart.setDate(weekStart.getDate() - 7)
  previousWeekStart.setHours(0, 0, 0, 0)
  
  // Allow navigation if the previous week start is still >= course start
  return previousWeekStart >= courseStart
})

// Check if we can navigate to next week
const canNavigateNext = computed(() => {
  if (!props.courseDateRange || !props.courseDateRange.endDate) return true
  
  const weekStart = new Date(currentWeekStart.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
  weekStart.setHours(0, 0, 0, 0)
  
  const courseEnd = new Date(props.courseDateRange.endDate)
  courseEnd.setHours(23, 59, 59, 999)
  
  // Can navigate next only if moving forward 7 days would still be within or at the end
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(weekStart.getDate() + 7)
  nextWeekStart.setHours(0, 0, 0, 0)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
  nextWeekEnd.setHours(23, 59, 59, 999)
  
  // Allow navigation if the next week end is still <= course end
  return nextWeekEnd <= courseEnd
})

function handleSlotClick(entry) {
  emit('slot-click', entry)
}
</script>

<style scoped>
.weekly-calendar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
}

.calendar-header h3 {
  margin: 0;
  flex: 1;
  text-align: center;
  color: #333;
}

.nav-btn,
.today-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.nav-btn:hover,
.today-btn:hover {
  background: #f5f5f5;
}

.today-btn {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.today-btn:hover {
  background: #1976d2;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  overflow-x: auto;
}

.day-column {
  min-width: 150px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fafafa;
}

.day-header {
  padding: 12px;
  text-align: center;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  border-radius: 6px 6px 0 0;
}

.day-header.today {
  background: #2196f3;
  color: white;
  border-bottom-color: #1976d2;
}

.day-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.day-date {
  font-size: 12px;
  opacity: 0.8;
}

.day-slots {
  padding: 10px;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.no-classes {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 1200px) {
  .calendar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .calendar-header {
    flex-wrap: wrap;
  }

  .calendar-header h3 {
    width: 100%;
    order: -1;
  }
}
</style>

