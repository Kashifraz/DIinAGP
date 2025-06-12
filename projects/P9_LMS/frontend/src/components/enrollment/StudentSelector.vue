<template>
  <div class="student-selector">
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search students by name or email..."
        class="search-input"
        :disabled="disabled"
        @input="handleSearch"
      />
      <div v-if="loading" class="loading-text">Loading students...</div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="filteredStudents.length === 0 && !loading && searchQuery" class="no-results">
      No students found matching "{{ searchQuery }}"
    </div>

    <div v-if="selectedStudents.length > 0" class="selected-students">
      <h4>Selected Students ({{ selectedStudents.length }})</h4>
      <div class="selected-list">
        <div
          v-for="student in selectedStudents"
          :key="student.id"
          class="selected-item"
        >
          <span>{{ student.firstName }} {{ student.lastName }} ({{ student.email }})</span>
          <button
            type="button"
            @click="removeStudent(student.id)"
            class="remove-btn"
            :disabled="disabled"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredStudents.length > 0" class="students-list">
      <h4>Available Students</h4>
      <div class="students-grid">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-item"
          :class="{ selected: isSelected(student.id) }"
          @click="toggleStudent(student)"
        >
          <div class="student-info">
            <strong>{{ student.firstName }} {{ student.lastName }}</strong>
            <span class="student-email">{{ student.email }}</span>
          </div>
          <div v-if="isSelected(student.id)" class="checkmark">✓</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { userService } from '@/services/userService'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  excludeIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const students = ref([])
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)

const selectedStudents = computed(() => {
  return students.value.filter(s => props.modelValue.includes(s.id))
})

const filteredStudents = computed(() => {
  let filtered = students.value.filter(s => !props.excludeIds.includes(s.id))
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s => 
      s.firstName.toLowerCase().includes(query) ||
      s.lastName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const loadStudents = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await userService.getUsersByRole('STUDENT', { page: 0, size: 1000 })
    students.value = Array.isArray(data) ? data : (data.content || data.data || [])
  } catch (err) {
    error.value = 'Failed to load students'
    console.error('Failed to load students:', err)
    students.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Debounce handled by computed property
}

const isSelected = (studentId) => {
  return props.modelValue.includes(studentId)
}

const toggleStudent = (student) => {
  if (props.disabled) return
  
  const currentValue = [...props.modelValue]
  const index = currentValue.indexOf(student.id)
  
  if (index > -1) {
    currentValue.splice(index, 1)
  } else {
    currentValue.push(student.id)
  }
  
  emit('update:modelValue', currentValue)
}

const removeStudent = (studentId) => {
  if (props.disabled) return
  
  const currentValue = [...props.modelValue]
  const index = currentValue.indexOf(studentId)
  if (index > -1) {
    currentValue.splice(index, 1)
    emit('update:modelValue', currentValue)
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.student-selector {
  width: 100%;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
}

.search-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading-text {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.selected-students {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.selected-students h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
}

.remove-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.remove-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.remove-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.students-list h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 14px;
}

.students-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.student-item:hover {
  border-color: #4caf50;
  background: #f9f9f9;
}

.student-item.selected {
  border-color: #4caf50;
  background: #e8f5e9;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-info strong {
  color: #333;
  font-size: 14px;
}

.student-email {
  color: #666;
  font-size: 12px;
}

.checkmark {
  color: #4caf50;
  font-size: 20px;
  font-weight: bold;
}

.student-item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>

