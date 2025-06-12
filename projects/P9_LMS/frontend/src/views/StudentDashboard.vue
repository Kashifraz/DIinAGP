<template>
  <div class="student-dashboard">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Student Dashboard</h1>
      </div>

      <!-- Loading State -->
      <div v-if="dashboardStore.loading" class="loading">
        Loading dashboard...
      </div>

      <!-- Error State -->
      <div v-else-if="dashboardStore.error" class="error">
        {{ dashboardStore.error }}
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="dashboard" class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="statistics-grid">
          <StatisticsCard
            :value="dashboard.totalEnrolledCourses"
            label="Enrolled Courses"
            icon="fas fa-book"
            icon-class="primary"
          />
          <StatisticsCard
            :value="dashboard.totalAssignments"
            label="Total Assignments"
            icon="fas fa-clipboard-list"
            icon-class="info"
          />
          <StatisticsCard
            :value="dashboard.completedAssignments"
            label="Completed"
            icon="fas fa-check-circle"
            icon-class="success"
          />
          <StatisticsCard
            :value="dashboard.pendingAssignments"
            label="Pending"
            icon="fas fa-clock"
            icon-class="warning"
          />
          <StatisticsCard
            v-if="dashboard.averageGrade !== null && dashboard.averageGrade !== undefined"
            :value="dashboard.averageGrade.toFixed(1) + '%'"
            label="Average Grade"
            icon="fas fa-chart-line"
            icon-class="info"
          />
          <StatisticsCard
            v-if="dashboard.attendanceSummary"
            :value="dashboard.attendanceSummary.attendancePercentage.toFixed(1) + '%'"
            label="Attendance"
            icon="fas fa-user-check"
            icon-class="success"
          />
        </div>

        <div class="dashboard-grid">
          <!-- Enrolled Courses -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Enrolled Courses</h2>
              <router-link to="/student-courses" class="view-all-link">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.enrolledCourses && dashboard.enrolledCourses.length > 0" class="courses-list">
              <div
                v-for="enrollment in dashboard.enrolledCourses.slice(0, 5)"
                :key="enrollment.id"
                class="course-item"
                @click="$router.push(`/courses/${enrollment.courseId}/content`)"
              >
                <div class="course-info">
                  <h4>{{ enrollment.courseCode }} - {{ enrollment.courseName }}</h4>
                  <p>Enrolled: {{ formatDate(enrollment.enrollmentDate) }}</p>
                </div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No enrolled courses</p>
            </div>
          </div>

          <!-- Upcoming Assignments -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Upcoming Assignments</h2>
              <router-link to="/my-assessments" class="view-all-link">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.upcomingAssignments && dashboard.upcomingAssignments.length > 0" class="deadlines-list">
              <UpcomingDeadlineCard
                v-for="assignment in dashboard.upcomingAssignments"
                :key="assignment.id"
                :deadline="assignment"
                @view="handleViewAssignment"
              />
            </div>
            <div v-else class="empty-state">
              <p>No upcoming assignments</p>
            </div>
          </div>

          <!-- Today's Schedule -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Today's Schedule</h2>
              <router-link to="/my-timetable" class="view-all-link">
                View Timetable <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.todaysSchedule && dashboard.todaysSchedule.length > 0" class="schedule-list">
              <TodayScheduleCard
                v-for="schedule in dashboard.todaysSchedule"
                :key="schedule.id"
                :schedule="schedule"
              />
            </div>
            <div v-else class="empty-state">
              <p>No classes scheduled for today</p>
            </div>
          </div>

          <!-- Recent Grades -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Recent Grades</h2>
              <div class="header-links">
                <router-link to="/resultsheets" class="view-all-link resultsheet-link">
                  <i class="fas fa-file-alt"></i> Resultsheets
                </router-link>
                <router-link to="/my-assessments" class="view-all-link">
                  View All <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
            </div>
            <div v-if="dashboard.recentGrades && dashboard.recentGrades.length > 0" class="grades-list">
              <div
                v-for="grade in dashboard.recentGrades"
                :key="grade.id"
                class="grade-item"
              >
                <div class="grade-info">
                  <h4>{{ grade.assessmentTitle }}</h4>
                  <p>{{ grade.courseName }}</p>
                </div>
                <div class="grade-score">
                  <span class="score">{{ grade.marksObtained }}/{{ grade.maximumMarks }}</span>
                  <span class="percentage">{{ calculatePercentage(grade.marksObtained, grade.maximumMarks) }}%</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No grades yet</p>
            </div>
          </div>

          <!-- Attendance Summary -->
          <div v-if="dashboard.attendanceSummary" class="dashboard-section">
            <div class="section-header">
              <h2>Attendance Summary</h2>
            </div>
            <div class="attendance-summary">
              <div class="attendance-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ dashboard.attendanceSummary.presentCount }}</span>
                  <span class="stat-label">Present</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ dashboard.attendanceSummary.absentCount }}</span>
                  <span class="stat-label">Absent</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ dashboard.attendanceSummary.totalClasses }}</span>
                  <span class="stat-label">Total Classes</span>
                </div>
              </div>
              <div class="attendance-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: dashboard.attendanceSummary.attendancePercentage + '%' }"
                  ></div>
                </div>
                <p class="progress-text">
                  {{ dashboard.attendanceSummary.attendancePercentage.toFixed(1) }}% Attendance Rate
                </p>
              </div>
            </div>
          </div>

          <!-- Logout Card -->
          <div class="dashboard-section">
            <LogoutCard />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import Header from '@/components/layout/Header.vue'
import StatisticsCard from '@/components/dashboard/StatisticsCard.vue'
import UpcomingDeadlineCard from '@/components/dashboard/UpcomingDeadlineCard.vue'
import TodayScheduleCard from '@/components/dashboard/TodayScheduleCard.vue'
import LogoutCard from '@/components/dashboard/LogoutCard.vue'

const router = useRouter()
const dashboardStore = useDashboardStore()

const dashboard = computed(() => dashboardStore.studentDashboard)

onMounted(async () => {
  await dashboardStore.fetchStudentDashboard()
})

const handleViewAssignment = (assignment) => {
  router.push(`/assessments/${assignment.id}/submit`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const calculatePercentage = (obtained, maximum) => {
  if (!maximum || maximum === 0) return 0
  return ((obtained / maximum) * 100).toFixed(1)
}
</script>

<style scoped>
.student-dashboard {
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

.loading,
.error {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: #f44336;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: #764ba2;
}

.header-links {
  display: flex;
  gap: 15px;
  align-items: center;
}

.resultsheet-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
}

.resultsheet-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  color: white;
}

.courses-list,
.deadlines-list,
.schedule-list,
.grades-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-item,
.grade-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.course-item {
  cursor: pointer;
}

.course-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.course-info h4,
.grade-info h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 6px 0;
}

.course-info p,
.grade-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.grade-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.score {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.percentage {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.attendance-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.attendance-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attendance-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
  }

  .attendance-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>

