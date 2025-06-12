<template>
  <div class="user-profile">
    <Header />
    <div class="content">
      <div class="profile-header">
        <h1>My Profile</h1>
        <button v-if="!isEditing" @click="isEditing = true" class="btn-edit">Edit Profile</button>
        <div v-else class="edit-actions">
          <button @click="saveProfile" :disabled="loading" class="btn-save">Save</button>
          <button @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div v-if="loading && !user" class="loading">Loading profile...</div>

      <div v-else-if="user" class="profile-card">
        <div class="profile-section">
          <div class="avatar-section">
            <div class="avatar">
              <img v-if="user.profilePictureUrl" :src="user.profilePictureUrl" :alt="user.firstName || 'User'" />
              <div v-else class="avatar-placeholder">
                {{ (user.firstName?.charAt(0) || '') }}{{ (user.lastName?.charAt(0) || '') }}
              </div>
            </div>
            <div v-if="isEditing" class="avatar-upload">
              <input
                type="text"
                v-model="form.profilePictureUrl"
                placeholder="Profile picture URL"
                class="url-input"
              />
            </div>
          </div>

          <div class="profile-details">
            <div class="form-group">
              <label>First Name</label>
              <input
                v-if="isEditing"
                v-model="form.firstName"
                type="text"
                required
                class="form-input"
              />
              <div v-else class="form-value">{{ user.firstName }}</div>
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <input
                v-if="isEditing"
                v-model="form.lastName"
                type="text"
                required
                class="form-input"
              />
              <div v-else class="form-value">{{ user.lastName }}</div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-if="isEditing"
                v-model="form.email"
                type="email"
                required
                class="form-input"
              />
              <div v-else class="form-value">{{ user.email }}</div>
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input
                v-if="isEditing"
                v-model="form.phoneNumber"
                type="tel"
                class="form-input"
              />
              <div v-else class="form-value">{{ user.phoneNumber || 'Not provided' }}</div>
            </div>

            <div class="form-group">
              <label>Role</label>
              <div class="form-value">
                <span v-if="user.role" class="role-badge" :class="user.role.toLowerCase()">{{ user.role }}</span>
                <span v-else>-</span>
              </div>
            </div>

            <div class="form-group">
              <label>Status</label>
              <div class="form-value">
                <span v-if="user.status" class="status-badge" :class="user.status.toLowerCase()">{{ user.status }}</span>
                <span v-else>-</span>
              </div>
            </div>

            <div class="form-group">
              <label>Last Login</label>
              <div class="form-value">{{ formatDate(user.lastLoginAt) }}</div>
            </div>

            <div class="form-group">
              <label>Member Since</label>
              <div class="form-value">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import Header from '@/components/layout/Header.vue'

const authStore = useAuthStore()
const userStore = useUserStore()

const isEditing = ref(false)
const loading = ref(false)
const error = ref('')

const user = computed(() => userStore.currentUser || authStore.user)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  profilePictureUrl: ''
})

onMounted(async () => {
  if (authStore.user?.id) {
    try {
      await userStore.fetchUserById(authStore.user.id)
    } catch (err) {
      error.value = 'Failed to load profile'
    }
  }
})

const saveProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    await userStore.updateUser(user.value.id, form.value)
    isEditing.value = false
    // Update auth store user as well
    if (authStore.user && authStore.user.id === user.value.id) {
      authStore.user = { ...authStore.user, ...userStore.currentUser }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  resetForm()
}

const resetForm = () => {
  if (user.value) {
    form.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      email: user.value.email || '',
      phoneNumber: user.value.phoneNumber || '',
      profilePictureUrl: user.value.profilePictureUrl || ''
    }
  }
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

// Watch for user changes and initialize form
watch(user, (newUser) => {
  if (newUser) {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-header h1 {
  color: #333;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-save,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-edit {
  background: #4caf50;
  color: white;
}

.btn-edit:hover {
  background: #45a049;
}

.btn-save {
  background: #4caf50;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #45a049;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f44336;
  color: white;
}

.btn-cancel:hover {
  background: #d32f2f;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 48px;
  font-weight: bold;
  color: #666;
}

.avatar-upload {
  width: 120px;
}

.url-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.profile-details {
  flex: 1;
  min-width: 300px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #4caf50;
}

.form-value {
  padding: 10px 0;
  color: #333;
  font-size: 14px;
}

.role-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.role-badge.coordinator {
  background: #ff9800;
  color: white;
}

.role-badge.professor {
  background: #2196f3;
  color: white;
}

.role-badge.student {
  background: #4caf50;
  color: white;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.inactive {
  background: #f44336;
  color: white;
}
</style>

