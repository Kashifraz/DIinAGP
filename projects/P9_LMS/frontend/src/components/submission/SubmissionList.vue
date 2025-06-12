<template>
  <div class="submission-list">
    <div v-if="loading" class="loading">Loading submissions...</div>
    
    <div v-else-if="submissions.length === 0" class="no-submissions">
      No submissions found.
    </div>

    <div v-else class="submissions-table-container">
      <table class="submissions-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Submission Date</th>
            <th>Status</th>
            <th v-if="showGrade">Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="submission in submissions" :key="submission.id">
            <td>{{ submission.studentName }}</td>
            <td>{{ submission.studentEmail }}</td>
            <td>{{ formatDateTime(submission.submissionDate) }}</td>
            <td>
              <span class="status-badge" :class="submission.status?.toLowerCase()">
                {{ submission.status }}
              </span>
            </td>
            <td v-if="showGrade">
              <span v-if="submission.marksObtained !== null && submission.marksObtained !== undefined">
                {{ submission.marksObtained }} / {{ maximumMarks }}
              </span>
              <span v-else class="no-grade">Not graded</span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="submission.submittedFilePath"
                  @click="$emit('download', submission)"
                  class="btn-download"
                  title="Download file"
                >
                  <i class="fas fa-download"></i>
                </button>
                <button
                  v-if="canGrade && submission.status === 'SUBMITTED'"
                  @click="$emit('grade', submission)"
                  class="btn-grade"
                  title="Grade submission"
                >
                  <i class="fas fa-check-circle"></i> Grade
                </button>
                <button
                  v-if="canGrade && submission.status === 'GRADED'"
                  @click="$emit('edit-grade', submission)"
                  class="btn-edit"
                  title="Edit grade"
                >
                  <i class="fas fa-edit"></i> Edit Grade
                </button>
                <button
                  @click="$emit('view', submission)"
                  class="btn-view"
                  title="View details"
                >
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  submissions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  canGrade: {
    type: Boolean,
    default: false
  },
  showGrade: {
    type: Boolean,
    default: true
  },
  maximumMarks: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['download', 'grade', 'edit-grade', 'view'])

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}
</script>

<style scoped>
.submission-list {
  width: 100%;
}

.loading,
.no-submissions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.submissions-table-container {
  background: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submissions-table {
  width: 100%;
  border-collapse: collapse;
}

.submissions-table thead {
  background: #f5f5f5;
}

.submissions-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
  font-size: 14px;
}

.submissions-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 14px;
}

.submissions-table tbody tr:hover {
  background: #f9f9f9;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.submitted {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.graded {
  background: #e8f5e9;
  color: #2e7d32;
}

.no-grade {
  color: #999;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-download,
.btn-grade,
.btn-edit,
.btn-view {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-download {
  background: #2196f3;
  color: white;
}

.btn-download:hover {
  background: #1976d2;
}

.btn-grade {
  background: #4caf50;
  color: white;
}

.btn-grade:hover {
  background: #45a049;
}

.btn-edit {
  background: #ff9800;
  color: white;
}

.btn-edit:hover {
  background: #f57c00;
}

.btn-view {
  background: #9e9e9e;
  color: white;
}

.btn-view:hover {
  background: #757575;
}

@media (max-width: 768px) {
  .submissions-table-container {
    overflow-x: scroll;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-download,
  .btn-grade,
  .btn-edit,
  .btn-view {
    width: 100%;
    justify-content: center;
  }
}
</style>

