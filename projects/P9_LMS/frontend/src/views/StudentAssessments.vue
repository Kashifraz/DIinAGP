<template>
  <div class="student-assessments">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>My Assessments</h1>
      </div>

      <!-- Course Selection -->
      <div class="section">
        <h2>Select Course</h2>
        <div class="form-group">
          <label for="courseSelect">Course:</label>
          <select
            id="courseSelect"
            v-model="selectedCourseId"
            @change="handleCourseChange"
            class="form-select"
          >
            <option :value="null">Select a course</option>
            <option v-for="course in enrolledCourses" :key="course.id" :value="course.id">
              {{ course.code }} - {{ course.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Assessments List -->
      <div v-if="selectedCourseId" class="section">
        <h2>Published Assessments</h2>

        <div v-if="assessmentStore.loading" class="loading">
          Loading assessments...
        </div>

        <div v-else-if="publishedAssessments.length === 0" class="no-assessments">
          No published assessments found for this course.
        </div>

        <div v-else class="assessments-list">
          <div
            v-for="assessment in publishedAssessments"
            :key="assessment.id"
            class="assessment-card"
          >
            <div class="assessment-header">
              <div class="assessment-info">
                <h3>{{ assessment.title }}</h3>
                <div class="assessment-meta">
                  <span class="type-badge" :class="assessment.assessmentType?.toLowerCase()">
                    {{ assessment.assessmentType }}
                  </span>
                  <span class="marks-badge">
                    Max Marks: {{ assessment.maximumMarks }}
                  </span>
                  <span class="weight-badge">
                    Weight: {{ assessment.weightPercentage }}%
                  </span>
                </div>
              </div>
              <div class="assessment-actions">
                <router-link
                  :to="`/assessments/${assessment.id}/submit`"
                  class="btn-submit"
                >
                  <i class="fas fa-paper-plane"></i>
                  {{ getSubmissionStatus(assessment.id) === 'submitted' ? 'View Submission' : 'Submit' }}
                </router-link>
              </div>
            </div>
            <div v-if="assessment.description" class="assessment-description">
              {{ assessment.description }}
            </div>
            <div class="assessment-details">
              <div v-if="assessment.deadline" class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <strong>Deadline:</strong> {{ formatDateTime(assessment.deadline) }}
              </div>
              <div v-if="assessment.timeLimitMinutes" class="detail-item">
                <i class="fas fa-clock"></i>
                <strong>Time Limit:</strong> {{ assessment.timeLimitMinutes }} minutes
              </div>
              <div v-if="getSubmissionStatus(assessment.id) === 'submitted'" class="detail-item">
                <i class="fas fa-check-circle"></i>
                <strong>Status:</strong> Submitted
                <span v-if="getSubmissionGrade(assessment.id)" class="grade-display">
                  - Grade: {{ getSubmissionGrade(assessment.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAssessmentStore } from '@/stores/assessment'
import { useSubmissionStore } from '@/stores/submission'
import { useEnrollmentStore } from '@/stores/enrollment'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/layout/Header.vue'

const route = useRoute()
const assessmentStore = useAssessmentStore()
const submissionStore = useSubmissionStore()
const enrollmentStore = useEnrollmentStore()
const authStore = useAuthStore()

const selectedCourseId = ref(null)
const enrolledCourses = ref([])
const mySubmissions = ref([])

onMounted(async () => {
  await loadEnrolledCourses()
  await loadMySubmissions()
  
  if (route.params.courseId) {
    selectedCourseId.value = parseInt(route.params.courseId)
    await loadAssessments()
  }
})

const loadEnrolledCourses = async () => {
  try {
    const user = authStore.user
    if (user && user.role === 'STUDENT') {
      await enrollmentStore.fetchEnrollmentsByStudent(user.id)
      // Extract unique courses from enrollments
      const courseMap = new Map()
      enrollmentStore.enrollments.forEach(enrollment => {
        if (enrollment.courseId && !courseMap.has(enrollment.courseId)) {
          courseMap.set(enrollment.courseId, {
            id: enrollment.courseId,
            code: enrollment.courseCode,
            name: enrollment.courseName
          })
        }
      })
      enrolledCourses.value = Array.from(courseMap.values())
    }
  } catch (err) {
    console.error('Failed to load enrolled courses:', err)
  }
}

const loadMySubmissions = async () => {
  try {
    const user = authStore.user
    if (user && user.role === 'STUDENT') {
      const submissions = await submissionStore.fetchSubmissionsByStudent(user.id)
      mySubmissions.value = submissions
    }
  } catch (err) {
    console.error('Failed to load submissions:', err)
  }
}

const handleCourseChange = async () => {
  if (selectedCourseId.value) {
    await loadAssessments()
  }
}

const loadAssessments = async () => {
  if (!selectedCourseId.value) return
  
  try {
    await assessmentStore.fetchAssessmentsByCourse(selectedCourseId.value)
  } catch (err) {
    console.error('Failed to load assessments:', err)
  }
}

const publishedAssessments = computed(() => {
  return assessmentStore.assessments.filter(a => a.status === 'PUBLISHED')
})

const getSubmissionStatus = (assessmentId) => {
  const submission = mySubmissions.value.find(s => s.assessmentId === assessmentId)
  return submission ? 'submitted' : 'not-submitted'
}

const getSubmissionGrade = (assessmentId) => {
  const submission = mySubmissions.value.find(s => s.assessmentId === assessmentId)
  if (submission && submission.marksObtained !== null && submission.marksObtained !== undefined) {
    const assessment = publishedAssessments.value.find(a => a.id === assessmentId)
    return `${submission.marksObtained} / ${assessment?.maximumMarks || 100}`
  }
  return null
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}
</script>

<style scoped>
.student-assessments {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.section h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.loading,
.no-assessments {
  text-align: center;
  padding: 40px;
  color: #666;
}

.assessments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.assessment-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.assessment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.assessment-info {
  flex: 1;
  min-width: 0;
}

.assessment-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.assessment-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.type-badge,
.marks-badge,
.weight-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.assignment {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.quiz {
  background: #f3e5f5;
  color: #7b1fa2;
}

.marks-badge,
.weight-badge {
  background: #f5f5f5;
  color: #666;
}

.assessment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-submit {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover {
  background: #45a049;
}

.assessment-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

.assessment-details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item i {
  color: #999;
}

.grade-display {
  color: #4caf50;
  font-weight: 500;
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .section {
    padding: 20px 15px;
  }

  .assessment-header {
    flex-direction: column;
  }

  .assessment-actions {
    width: 100%;
  }

  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>

