<template>
  <div class="user-list">
    <Header />
    <div class="content">
      <div class="page-header">
        <h1>User Management</h1>
        <p class="subtitle">Manage all system users</p>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            @input="handleSearch"
            class="search-input"
          />
        </div>
        <div class="role-filter">
          <label>Filter by Role:</label>
          <select v-model="selectedRole" @change="handleFilter">
            <option value="">All Roles</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="PROFESSOR">Professor</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>
      </div>

      <div v-if="userStore.error" class="error-message">
        {{ userStore.error }}
      </div>

      <div v-if="userStore.loading" class="loading">
        Loading users...
      </div>

      <div v-else-if="userStore.users.length === 0" class="no-users">
        No users found.
      </div>

      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userStore.users" :key="user.id">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="user.status.toLowerCase()">
                  {{ user.status }}
                </span>
              </td>
              <td>{{ formatDate(user.lastLoginAt) }}</td>
              <td>
                <button @click="viewUser(user)" class="btn-view">View</button>
                <button @click="editUser(user)" class="btn-edit">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="userStore.pagination.totalPages > 1" class="pagination">
        <button
          @click="goToPage(userStore.pagination.page - 1)"
          :disabled="userStore.pagination.page === 0"
          class="page-btn"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ userStore.pagination.page + 1 }} of {{ userStore.pagination.totalPages }}
          (Total: {{ userStore.pagination.totalElements }} users)
        </span>
        <button
          @click="goToPage(userStore.pagination.page + 1)"
          :disabled="userStore.pagination.page >= userStore.pagination.totalPages - 1"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Header from '@/components/layout/Header.vue'

const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const selectedRole = ref('')
let searchTimeout = null

onMounted(async () => {
  await userStore.fetchUsers()
})

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await userStore.searchUsers(searchQuery.value, {
        role: selectedRole.value || undefined
      })
    } else {
      await userStore.fetchUsers({
        role: selectedRole.value || undefined
      })
    }
  }, 500)
}

const handleFilter = async () => {
  if (searchQuery.value.trim()) {
    await userStore.searchUsers(searchQuery.value, {
      role: selectedRole.value || undefined
    })
  } else {
    await userStore.fetchUsers({
      role: selectedRole.value || undefined
    })
  }
}

const goToPage = async (page) => {
  userStore.setPage(page)
  if (searchQuery.value.trim()) {
    await userStore.searchUsers(searchQuery.value, {
      role: selectedRole.value || undefined
    })
  } else {
    await userStore.fetchUsers({
      role: selectedRole.value || undefined
    })
  }
}

const viewUser = (user) => {
  router.push(`/users/${user.id}`)
}

const editUser = (user) => {
  router.push(`/users/${user.id}/edit`)
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.user-list {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.role-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-filter label {
  font-weight: 500;
  color: #333;
}

.role-filter select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.loading,
.no-users {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
}

.users-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

tbody tr:hover {
  background: #f9f9f9;
}

.role-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
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

.btn-view,
.btn-edit {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: background 0.3s;
}

.btn-view {
  background: #2196f3;
  color: white;
}

.btn-view:hover {
  background: #1976d2;
}

.btn-edit {
  background: #4caf50;
  color: white;
}

.btn-edit:hover {
  background: #45a049;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}
</style>

