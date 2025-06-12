<template>
  <div class="professor-resultsheet-view">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Course Resultsheets</h1>
      </div>

      <!-- Course Selection -->
      <div v-if="!selectedCourseId" class="section">
        <h2>Select Course</h2>
        <div v-if="courseStore.loading && myCourses.length === 0" class="loading">
          Loading courses...
        </div>
        <div v-else-if="myCourses.length === 0" class="empty-state">
          <p>No courses assigned to you yet.</p>
        </div>
        <div v-else class="courses-grid">
          <div
            v-for="course in myCourses"
            :key="course.id"
            class="course-card"
            @click="selectCourse(course.id)"
          >
            <div class="course-info">
              <h3>{{ course.code }} - {{ course.name }}</h3>
              <p>{{ course.majorName }}</p>
            </div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      <!-- Student Selection and Resultsheet Display -->
      <div v-else class="section">
        <div class="resultsheet-header-actions">
          <button @click="selectedCourseId = null; selectedStudentId = null" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to Courses
          </button>
          <button v-if="selectedStudentId" @click="refreshResultsheet" class="btn-refresh" :disabled="resultsheetStore.loading">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        <!-- Student Selection -->
        <div v-if="!selectedStudentId" class="student-selection">
          <h2>Select Student</h2>
          <div v-if="resultsheetStore.loading && resultsheetStore.courseResultsheets.length === 0" class="loading">
            Loading students...
          </div>
          <div v-else-if="resultsheetStore.courseResultsheets.length === 0" class="empty-state">
            <p>No students enrolled in this course or no resultsheets available.</p>
          </div>
          <div v-else class="students-grid">
            <div
              v-for="resultsheet in resultsheetStore.courseResultsheets"
              :key="resultsheet.studentId"
              class="student-card"
              @click="selectStudent(resultsheet.studentId)"
            >
              <div class="student-info">
                <h4>{{ resultsheet.studentName }}</h4>
                <p>{{ resultsheet.studentEmail }}</p>
              </div>
              <div class="student-grade">
                <span class="grade-letter" :class="`grade-${resultsheet.gradeLetter?.toLowerCase() || 'f'}`">
                  {{ resultsheet.gradeLetter || 'N/A' }}
                </span>
                <span class="grade-percentage">{{ resultsheet.overallGrade?.toFixed(1) || '0' }}%</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>

        <!-- Resultsheet Display -->
        <div v-else>
          <div v-if="resultsheetStore.loading" class="loading">
            Loading resultsheet...
          </div>

          <div v-else-if="resultsheetStore.error" class="error">
            {{ resultsheetStore.error }}
          </div>

          <div v-else-if="resultsheetStore.currentResultsheet" class="resultsheet-container">
            <!-- Student and Course Information -->
            <div class="info-section">
              <div class="info-card">
                <h3>Student Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name:</label>
                    <span>{{ resultsheetStore.currentResultsheet.studentName }}</span>
                  </div>
                  <div class="info-item">
                    <label>Email:</label>
                    <span>{{ resultsheetStore.currentResultsheet.studentEmail }}</span>
                  </div>
                </div>
              </div>
              <div class="info-card">
                <h3>Course Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Course:</label>
                    <span>{{ resultsheetStore.currentResultsheet.courseCode }} - {{ resultsheetStore.currentResultsheet.courseName }}</span>
                  </div>
                  <div class="info-item">
                    <label>Major:</label>
                    <span>{{ resultsheetStore.currentResultsheet.majorName }}</span>
                  </div>
                  <div class="info-item">
                    <label>Credit Hours:</label>
                    <span>{{ resultsheetStore.currentResultsheet.creditHours }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resultsheet Card -->
            <ResultsheetCard :resultsheet="resultsheetStore.currentResultsheet" />

            <!-- Last Calculated Info -->
            <div class="last-calculated">
              <i class="fas fa-info-circle"></i>
              <span>Last calculated: {{ formatDate(resultsheetStore.currentResultsheet.lastCalculatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResultsheetStore } from '@/stores/resultsheet'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Header from '@/components/layout/Header.vue'
import ResultsheetCard from '@/components/resultsheet/ResultsheetCard.vue'

const resultsheetStore = useResultsheetStore()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const toast = useToast()

const selectedCourseId = ref(null)
const selectedStudentId = ref(null)

const myCourses = computed(() => courseStore.courses)

onMounted(async () => {
  await loadCourses()
})

const loadCourses = async () => {
  try {
    const professorId = authStore.user?.id
    if (professorId) {
      await courseStore.fetchCoursesByProfessor(professorId)
    }
  } catch (err) {
    toast.error('Failed to load courses')
  }
}

const selectCourse = async (courseId) => {
  selectedCourseId.value = courseId
  selectedStudentId.value = null
  try {
    await resultsheetStore.fetchResultsheetsByCourse(courseId)
  } catch (err) {
    toast.error(resultsheetStore.error || 'Failed to load resultsheets')
  }
}

const selectStudent = async (studentId) => {
  selectedStudentId.value = studentId
  try {
    await resultsheetStore.fetchResultsheetByCourseAndStudent(selectedCourseId.value, studentId)
  } catch (err) {
    toast.error(resultsheetStore.error || 'Failed to load resultsheet')
  }
}

const refreshResultsheet = async () => {
  if (selectedCourseId.value && selectedStudentId.value) {
    await selectStudent(selectedStudentId.value)
    toast.success('Resultsheet refreshed')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<style scoped>
.professor-resultsheet-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
  font-size: 32px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section h2 {
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.error {
  color: #f44336;
}

.courses-grid,
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card,
.student-card {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.course-card:hover,
.student-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.course-info h3,
.student-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.course-info p,
.student-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-grade {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.grade-letter {
  font-size: 24px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
}

.grade-letter.grade-a {
  background: #4caf50;
}

.grade-letter.grade-b {
  background: #2196f3;
}

.grade-letter.grade-c {
  background: #ff9800;
}

.grade-letter.grade-d {
  background: #ff5722;
}

.grade-letter.grade-f {
  background: #f44336;
}

.grade-percentage {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.resultsheet-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-back,
.btn-refresh {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back {
  background: #f5f5f5;
  color: #333;
}

.btn-back:hover {
  background: #e0e0e0;
}

.btn-refresh {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.student-selection {
  margin-bottom: 24px;
}

.resultsheet-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.info-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 12px;
}

.info-item label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.info-item span {
  color: #333;
}

.last-calculated {
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  color: #666;
  font-size: 13px;
}

.last-calculated i {
  margin-right: 6px;
}

@media (max-width: 1024px) {
  .info-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .courses-grid,
  .students-grid {
    grid-template-columns: 1fr;
  }

  .resultsheet-header-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .student-card {
    flex-wrap: wrap;
  }
}
</style>

