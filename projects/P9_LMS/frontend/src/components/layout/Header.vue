<template>
  <header class="header">
    <div class="header-content">
      <h1 class="logo">LMS</h1>
      <nav class="nav">
        <router-link to="/dashboard" class="nav-link">
          <i class="fas fa-home"></i> Dashboard
        </router-link>
        
        <!-- Coordinator Links -->
        <template v-if="userRole === 'COORDINATOR'">
          <router-link to="/users" class="nav-link">
            <i class="fas fa-users"></i> Users
          </router-link>
          <router-link to="/majors" class="nav-link">
            <i class="fas fa-graduation-cap"></i> Majors
          </router-link>
          <router-link to="/courses" class="nav-link">
            <i class="fas fa-book"></i> Courses
          </router-link>
          <router-link to="/enrollments" class="nav-link">
            <i class="fas fa-user-plus"></i> Enrollments
          </router-link>
        </template>
        
        <!-- Professor Links -->
        <template v-if="userRole === 'PROFESSOR'">
          <router-link to="/my-courses" class="nav-link">
            <i class="fas fa-book-open"></i> My Courses
          </router-link>
          <router-link to="/content" class="nav-link">
            <i class="fas fa-file-alt"></i> Content
          </router-link>
          <router-link to="/assessments" class="nav-link">
            <i class="fas fa-clipboard-list"></i> Assessments
          </router-link>
          <router-link to="/attendance" class="nav-link">
            <i class="fas fa-check-circle"></i> Attendance
          </router-link>
          <router-link to="/my-timetable" class="nav-link">
            <i class="fas fa-calendar-alt"></i> Timetable
          </router-link>
          <router-link to="/resultsheets/professor" class="nav-link">
            <i class="fas fa-file-alt"></i> Resultsheets
          </router-link>
        </template>
        
        <!-- Student Links -->
        <template v-if="userRole === 'STUDENT'">
          <router-link to="/student-courses" class="nav-link">
            <i class="fas fa-book-open"></i> My Courses
          </router-link>
          <router-link to="/my-assessments" class="nav-link">
            <i class="fas fa-clipboard-list"></i> My Assessments
          </router-link>
          <router-link to="/my-timetable" class="nav-link">
            <i class="fas fa-calendar-alt"></i> Timetable
          </router-link>
          <router-link to="/attendance/scan" class="nav-link">
            <i class="fas fa-qrcode"></i> Mark Attendance
          </router-link>
          <router-link to="/resultsheets" class="nav-link">
            <i class="fas fa-file-alt"></i> Resultsheets
          </router-link>
        </template>
        
        <!-- Common Links -->
        <router-link to="/notices" class="nav-link notice-link">
          <i class="fas fa-bullhorn"></i> Notices
          <NoticeBadge v-if="unreadCount > 0" :count="unreadCount" />
        </router-link>
        <router-link v-if="userRole === 'COORDINATOR'" to="/notices/management" class="nav-link">
          <i class="fas fa-cog"></i> Manage Notices
        </router-link>
        <router-link to="/profile" class="nav-link">
          <i class="fas fa-user"></i> Profile
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNoticeStore } from '@/stores/notice'
import NoticeBadge from '@/components/notice/NoticeBadge.vue'

const authStore = useAuthStore()
const noticeStore = useNoticeStore()

const userRole = computed(() => authStore.userRole)
const unreadCount = computed(() => noticeStore.unreadCount)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await noticeStore.fetchUnreadCount()
    // Refresh unread count every 30 seconds
    setInterval(async () => {
      await noticeStore.fetchUnreadCount()
    }, 30000)
  }
})
</script>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  font-size: 24px;
  color: #4CAF50;
  margin: 0;
}

.nav {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.nav-link i {
  font-size: 14px;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #4CAF50;
}

.nav-link.router-link-active {
  background: #e8f5e9;
  color: #4CAF50;
}

.notice-link {
  position: relative;
}

.notice-link i {
  font-size: 14px;
}

@media (max-width: 1024px) {
  .nav {
    gap: 8px;
  }
  
  .nav-link {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .nav-link span {
    display: none;
  }
  
  .nav-link i {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }
  
  .nav {
    margin-top: 15px;
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  
  .nav-link {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .nav-link span {
    display: none;
  }
}
</style>

