<template>
  <div class="coordinator-dashboard">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>Coordinator Dashboard</h1>
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
            :value="dashboard.totalUsers"
            label="Total Users"
            icon="fas fa-users"
            icon-class="primary"
          />
          <StatisticsCard
            :value="dashboard.totalStudents"
            label="Students"
            icon="fas fa-user-graduate"
            icon-class="info"
          />
          <StatisticsCard
            :value="dashboard.totalProfessors"
            label="Professors"
            icon="fas fa-chalkboard-teacher"
            icon-class="success"
          />
          <StatisticsCard
            :value="dashboard.totalCourses"
            label="Total Courses"
            icon="fas fa-book"
            icon-class="warning"
          />
          <StatisticsCard
            :value="dashboard.activeCourses"
            label="Active Courses"
            icon="fas fa-check-circle"
            icon-class="success"
          />
          <StatisticsCard
            :value="dashboard.totalMajors"
            label="Majors"
            icon="fas fa-graduation-cap"
            icon-class="primary"
          />
          <StatisticsCard
            :value="dashboard.activeEnrollments"
            label="Active Enrollments"
            icon="fas fa-user-check"
            icon-class="info"
          />
          <StatisticsCard
            :value="dashboard.unassignedCourses"
            label="Unassigned Courses"
            icon="fas fa-exclamation-triangle"
            icon-class="warning"
          />
        </div>

        <div class="dashboard-grid">
          <!-- Recent Notices -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Recent Notices</h2>
              <router-link to="/notices/management" class="view-all-link">
                Manage Notices <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            <div v-if="dashboard.recentNotices && dashboard.recentNotices.length > 0" class="notices-list">
              <div
                v-for="notice in dashboard.recentNotices"
                :key="notice.id"
                class="notice-item"
                @click="$router.push(`/notices/${notice.id}`)"
              >
                <div class="notice-item-content">
                  <h4>{{ notice.title }}</h4>
                  <p>{{ notice.content.substring(0, 100) }}...</p>
                  <div class="notice-meta">
                    <span class="badge" :class="notice.category.toLowerCase()">{{ notice.category }}</span>
                    <span class="date">{{ formatDate(notice.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No recent notices</p>
            </div>
          </div>

          <!-- Logout Card -->
          <div class="dashboard-section">
            <LogoutCard />
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-section">
            <div class="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div class="quick-actions-grid">
              <QuickActionCard
                title="Manage Users"
                description="Add, edit, or remove users"
                icon="fas fa-users"
                icon-class="primary"
                @click="() => $router.push('/users')"
              />
              <QuickActionCard
                title="Manage Majors"
                description="Create and manage course majors"
                icon="fas fa-graduation-cap"
                icon-class="success"
                @click="() => $router.push('/majors')"
              />
              <QuickActionCard
                title="Manage Courses"
                description="Create and assign courses"
                icon="fas fa-book"
                icon-class="info"
                @click="() => $router.push('/courses')"
              />
              <QuickActionCard
                title="Manage Enrollments"
                description="Enroll students in courses"
                icon="fas fa-user-check"
                icon-class="warning"
                @click="() => $router.push('/enrollments')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import Header from '@/components/layout/Header.vue'
import StatisticsCard from '@/components/dashboard/StatisticsCard.vue'
import QuickActionCard from '@/components/dashboard/QuickActionCard.vue'
import LogoutCard from '@/components/dashboard/LogoutCard.vue'

const dashboardStore = useDashboardStore()

const dashboard = computed(() => dashboardStore.coordinatorDashboard)

onMounted(async () => {
  await dashboardStore.fetchCoordinatorDashboard()
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<style scoped>
.coordinator-dashboard {
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
  grid-template-columns: 1fr 1fr;
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

.notices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.notice-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.notice-item-content h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}

.notice-item-content p {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.general {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.exam {
  background: #fff3e0;
  color: #e65100;
}

.badge.holiday {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge.urgent {
  background: #ffebee;
  color: #c62828;
}

.date {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>

