<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="logo">POS System</h1>
      </div>
      <div class="header-right">
        <div class="user-info" v-if="authStore.user">
          <span class="user-name">{{ authStore.user.name }}</span>
          <span class="user-role">{{ authStore.user.role }}</span>
        </div>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background-color: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
}

.user-role {
  font-size: 0.875rem;
  opacity: 0.9;
  text-transform: capitalize;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>

