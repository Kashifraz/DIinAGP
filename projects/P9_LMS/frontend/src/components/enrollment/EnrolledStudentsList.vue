<template>
  <div class="enrolled-students-list">
    <div v-if="loading" class="loading">Loading enrolled students...</div>
    
    <div v-else-if="enrollments.length === 0" class="no-enrollments">
      No students enrolled in this course yet.
    </div>

    <div v-else class="enrollments-table-container">
      <table class="enrollments-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Enrollment Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="enrollment in enrollments" :key="enrollment.id">
            <td>
              <strong>{{ enrollment.studentFirstName }} {{ enrollment.studentLastName }}</strong>
            </td>
            <td>{{ enrollment.studentEmail }}</td>
            <td>{{ formatDate(enrollment.enrollmentDate) }}</td>
            <td>
              <span class="status-badge" :class="enrollment.status?.toLowerCase()">
                {{ enrollment.status }}
              </span>
            </td>
            <td>
              <button
                v-if="enrollment.status === 'ACTIVE'"
                @click="$emit('drop', enrollment)"
                class="btn-drop"
                :disabled="loading"
              >
                Drop
              </button>
              <span v-else class="dropped-text">Dropped</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  enrollments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['drop'])

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.enrolled-students-list {
  width: 100%;
}

.loading,
.no-enrollments {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
}

.enrollments-table-container {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.enrollments-table {
  width: 100%;
  border-collapse: collapse;
}

.enrollments-table thead {
  background: #f5f5f5;
}

.enrollments-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.enrollments-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #666;
}

.enrollments-table tbody tr:hover {
  background: #f9f9f9;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.dropped {
  background: #f44336;
  color: white;
}

.status-badge.completed {
  background: #2196f3;
  color: white;
}

.btn-drop {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-drop:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-drop:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.dropped-text {
  color: #999;
  font-style: italic;
  font-size: 12px;
}
</style>

