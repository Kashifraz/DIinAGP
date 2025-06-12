<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">My Profile</h1>
    </div>

    <div v-if="loading" class="loading">Loading profile...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="profile-content">
      <div class="profile-card">
        <h2 class="card-title">Profile Information</h2>
        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ user?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span>
            <span class="info-value">{{ user?.phone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Role:</span>
            <span class="badge badge-role">
              {{ capitalizeFirst(user?.role) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="badge badge-status" :class="user?.status === 'active' ? 'active' : 'inactive'">
              {{ capitalizeFirst(user?.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <h2>Change Password</h2>
        <form @submit.prevent="handlePasswordChange" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Current Password *</label>
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="newPassword">New Password *</label>
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              required
              minlength="8"
              class="form-input"
            />
            <small>Minimum 8 characters</small>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password *</label>
            <input
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              required
              minlength="8"
              class="form-input"
            />
          </div>
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
          <div v-if="passwordSuccess" class="success-message">
            {{ passwordSuccess }}
          </div>
          <button type="submit" :disabled="passwordLoading" class="btn btn-primary">
            {{ passwordLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const user = computed(() => authStore.user)

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const capitalizeFirst = (str?: string) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const loadProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.checkAuth()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const handlePasswordChange = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  
  if (passwordData.value.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
    return
  }
  
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  
  try {
    // Note: This assumes the backend has a password change endpoint
    // For now, we'll use the update user endpoint
    if (!user.value) {
      passwordError.value = 'User not found'
      return
    }
    
    await userService.updateUser(user.value.id, {
      password: passwordData.value.newPassword
    })
    
    passwordSuccess.value = 'Password changed successfully'
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err: any) {
    passwordError.value = err.response?.data?.message || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9375rem;
}

.info-value {
  color: #6b7280;
  font-size: 0.9375rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group small {
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.error-message {
  color: #dc3545;
  padding: 0.75rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.success-message {
  color: #155724;
  padding: 0.75rem;
  background-color: #d4edda;
  border-radius: 4px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
}

.badge-role {
  background-color: #fbbf24;
  color: #1f2937;
}

.badge-status {
  color: white;
}

.badge-status.active {
  background-color: #10b981;
}

.badge-status.inactive {
  background-color: #6b7280;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #dc3545;
}
</style>

