<template>
  <div class="logout-card" @click="handleLogout">
    <i class="fas fa-sign-out-alt"></i>
    <span>Logout</span>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.logout-card {
  background: white;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
  color: #f44336;
  font-size: 14px;
  font-weight: 500;
}

.logout-card:hover {
  background: #ffebee;
  border-color: #f44336;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.2);
}

.logout-card i {
  font-size: 14px;
}

@media (max-width: 768px) {
  .logout-card {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
