<template>
  <div class="professor-selector">
    <select
      :value="modelValue"
      @change="handleChange"
      class="form-select"
      :disabled="disabled"
    >
      <option :value="null">No Professor Assigned</option>
      <option v-for="professor in professors" :key="professor.id" :value="professor.id">
        {{ professor.firstName }} {{ professor.lastName }} ({{ professor.email }})
      </option>
    </select>
    <div v-if="loading" class="loading-text">Loading professors...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '@/services/userService'

const props = defineProps({
  modelValue: {
    type: Number,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  currentProfessorId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const professors = ref([])
const loading = ref(false)

const loadProfessors = async () => {
  loading.value = true
  try {
    // Request a large page size to get all professors
    const data = await userService.getUsersByRole('PROFESSOR', { page: 0, size: 1000 })
    // Handle paginated response
    professors.value = Array.isArray(data) ? data : (data.content || data.data || [])
  } catch (err) {
    console.error('Failed to load professors:', err)
    professors.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfessors()
})

const handleChange = (event) => {
  const value = event.target.value === '' || event.target.value === 'null' 
    ? null 
    : parseInt(event.target.value)
  emit('update:modelValue', value)
}
</script>

<style scoped>
.professor-selector {
  width: 100%;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-select:focus {
  outline: none;
  border-color: #4caf50;
}

.form-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.loading-text {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  font-style: italic;
}
</style>

