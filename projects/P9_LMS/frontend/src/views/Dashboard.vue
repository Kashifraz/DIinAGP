<template>
  <CoordinatorDashboard v-if="userRole === 'COORDINATOR'" />
  <ProfessorDashboard v-else-if="userRole === 'PROFESSOR'" />
  <StudentDashboard v-else-if="userRole === 'STUDENT'" />
  <div v-else class="dashboard">
    <Header />
    <div class="dashboard-content">
      <div class="welcome-card">
        <h1>Welcome!</h1>
        <p>Please log in to view your dashboard.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/layout/Header.vue'
import CoordinatorDashboard from '@/views/CoordinatorDashboard.vue'
import ProfessorDashboard from '@/views/ProfessorDashboard.vue'
import StudentDashboard from '@/views/StudentDashboard.vue'

const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole)
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.user-info {
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
}

.btn-logout {
  padding: 12px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #d32f2f;
}

.dashboard-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn-action {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.3s;
  display: inline-block;
}

.btn-action:hover {
  background: #1976d2;
}
</style>

