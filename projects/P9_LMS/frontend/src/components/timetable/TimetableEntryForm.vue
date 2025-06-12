<template>
  <div class="timetable-entry-form">
    <h3>{{ editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="dayOfWeek">Day of Week <span class="required">*</span></label>
        <select
          id="dayOfWeek"
          v-model="formData.dayOfWeek"
          required
          class="form-select"
        >
          <option value="">Select day</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="startTime">Start Time <span class="required">*</span></label>
          <input
            id="startTime"
            v-model="formData.startTime"
            type="time"
            required
            class="form-input"
            @change="calculateDuration"
          />
        </div>

        <div class="form-group">
          <label for="endTime">End Time <span class="required">*</span></label>
          <input
            id="endTime"
            v-model="formData.endTime"
            type="time"
            required
            class="form-input"
            @change="calculateDuration"
          />
        </div>
      </div>

      <div v-if="durationMinutes > 0" class="duration-display">
        <strong>Duration:</strong> {{ formatDuration(durationMinutes) }}
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <input
          id="location"
          v-model="formData.location"
          type="text"
          class="form-input"
          placeholder="e.g., Room 101, Building A"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading || !isFormValid" class="btn-submit">
          {{ loading ? 'Saving...' : (editingEntry ? 'Update' : 'Create') }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel" :disabled="loading">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  dayOfWeek: '',
  startTime: '',
  endTime: '',
  location: ''
})

const durationMinutes = ref(0)

const isFormValid = computed(() => {
  if (!formData.value.dayOfWeek || !formData.value.startTime || !formData.value.endTime) {
    return false
  }
  
  // Compare times properly
  const start = parseTime(formData.value.startTime)
  const end = parseTime(formData.value.endTime)
  
  return start && end && end > start
})

watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    formData.value = {
      dayOfWeek: newEntry.dayOfWeek || '',
      startTime: newEntry.startTime ? formatTimeForInput(newEntry.startTime) : '',
      endTime: newEntry.endTime ? formatTimeForInput(newEntry.endTime) : '',
      location: newEntry.location || ''
    }
    calculateDuration()
  } else {
    resetForm()
  }
}, { immediate: true })

onMounted(() => {
  if (props.entry) {
    formData.value = {
      dayOfWeek: props.entry.dayOfWeek || '',
      startTime: props.entry.startTime ? formatTimeForInput(props.entry.startTime) : '',
      endTime: props.entry.endTime ? formatTimeForInput(props.entry.endTime) : '',
      location: props.entry.location || ''
    }
    calculateDuration()
  }
})

function formatTimeForInput(timeString) {
  // Convert "HH:mm:ss" or "HH:mm" to "HH:mm" format for input[type="time"]
  if (!timeString) return ''
  return timeString.substring(0, 5)
}

function calculateDuration() {
  if (formData.value.startTime && formData.value.endTime) {
    const start = parseTime(formData.value.startTime)
    const end = parseTime(formData.value.endTime)
    if (start && end && end > start) {
      const diff = (end - start) / (1000 * 60) // Convert to minutes
      durationMinutes.value = Math.round(diff)
    } else {
      durationMinutes.value = 0
    }
  } else {
    durationMinutes.value = 0
  }
}

function parseTime(timeString) {
  if (!timeString) return null
  const [hours, minutes] = timeString.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function resetForm() {
  formData.value = {
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: ''
  }
  durationMinutes.value = 0
}

function handleSubmit() {
  if (!isFormValid.value) return

  // Convert time format to "HH:mm:ss" for API
  const submitData = {
    dayOfWeek: formData.value.dayOfWeek,
    startTime: formData.value.startTime + ':00',
    endTime: formData.value.endTime + ':00',
    location: formData.value.location || null
  }

  emit('submit', submitData)
}
</script>

<style scoped>
.timetable-entry-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timetable-entry-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.required {
  color: #f44336;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #2196f3;
}

.duration-display {
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #666;
}

.error-message {
  margin-bottom: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit {
  background: #2196f3;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #1976d2;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover:not(:disabled) {
  background: #ccc;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

