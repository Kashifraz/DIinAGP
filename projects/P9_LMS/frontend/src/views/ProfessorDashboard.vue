<template>
  <div class="professor-dashboard">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Professor Dashboard</h1>
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
            :value="dashboard.totalAssignedCourses"
            label="Assigned Courses"
            icon="fas fa-book"
            icon-class="primary"
          />
          <StatisticsCard
            :value="dashboard.totalAssessments"
            label="Total Assessments"
            icon="fas fa-clipboard-list"
            icon-class="info"
          />
          <StatisticsCard
            :value="dashboard.pendingGradingCount"
            label="Pending Grading"
            icon="fas fa-tasks"
            icon-class="warning"
          />
          <StatisticsCard
            :value="dashboard.gradedSubmissions"
            label="Graded Submissions"
            icon="fas fa-check-circle"
            icon-class="success"
          />
        </div>

        <div class="dashboard-grid">
          <!-- Assigned Courses -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Assigned Courses</h2>
              <router-link to="/my-courses" class="view-all-link">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.assignedCourses && dashboard.assignedCourses.length > 0" class="courses-list">
              <div
                v-for="course in dashboard.assignedCourses.slice(0, 5)"
                :key="course.id"
                class="course-item"
                @click="$router.push(`/content/course/${course.id}`)"
              >
                <div class="course-info">
                  <h4>{{ course.code }} - {{ course.name }}</h4>
                  <p>{{ course.majorName }}</p>
                </div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No courses assigned</p>
            </div>
          </div>

          <!-- Upcoming Deadlines -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Upcoming Deadlines</h2>
              <router-link to="/assessments" class="view-all-link">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0" class="deadlines-list">
              <UpcomingDeadlineCard
                v-for="deadline in dashboard.upcomingDeadlines"
                :key="deadline.id"
                :deadline="deadline"
                @view="handleViewDeadline"
              />
            </div>
            <div v-else class="empty-state">
              <p>No upcoming deadlines</p>
            </div>
          </div>

          <!-- Today's Classes -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Today's Classes</h2>
              <router-link to="/timetable" class="view-all-link">
                View Timetable <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.todaysClasses && dashboard.todaysClasses.length > 0" class="schedule-list">
              <TodayScheduleCard
                v-for="schedule in dashboard.todaysClasses"
                :key="schedule.id"
                :schedule="schedule"
              />
            </div>
            <div v-else class="empty-state">
              <p>No classes scheduled for today</p>
            </div>
          </div>

          <!-- Pending Grading -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Pending Grading</h2>
              <router-link to="/assessments" class="view-all-link">
                View All <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.pendingGradings && dashboard.pendingGradings.length > 0" class="submissions-list">
              <div
                v-for="submission in dashboard.pendingGradings"
                :key="submission.id"
                class="submission-item"
                @click="handleViewSubmission(submission)"
              >
                <div class="submission-info">
                  <h4>{{ submission.assessmentTitle }}</h4>
                  <p>{{ submission.courseName }} - {{ submission.studentName }}</p>
                  <span class="submission-date">{{ formatDate(submission.submissionDate) }}</span>
                </div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No pending grading tasks</p>
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

const dashboard = computed(() => dashboardStore.professorDashboard)

onMounted(async () => {
  await dashboardStore.fetchProfessorDashboard()
})

const handleViewDeadline = (deadline) => {
  router.push(`/assessments/${deadline.id}`)
}

const handleViewSubmission = (submission) => {
  router.push(`/assessments/${submission.assessmentId}/grade`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<style scoped>
.professor-dashboard {
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

.courses-list,
.deadlines-list,
.schedule-list,
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-item,
.submission-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.course-item:hover,
.submission-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.course-info h4,
.submission-info h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 6px 0;
}

.course-info p,
.submission-info p {
  font-size: 14px;
  color: #666;
  margin: 0 0 6px 0;
}

.submission-date {
  font-size: 12px;
  color: #999;
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
}
</style>

