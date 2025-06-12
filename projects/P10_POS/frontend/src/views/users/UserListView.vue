<template>
  <div class="users-page">
    <div class="page-header">
      <h1>User Management</h1>
      <button @click="goToCreate" class="btn btn-primary" v-if="authStore.isAdmin">
        Create New User
      </button>
    </div>

    <div class="filters">
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search by name or email..."
        class="search-input"
        @input="debouncedSearch"
      />
      <select v-model="filters.role" @change="loadUsers" class="filter-select">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
        <option value="cashier">Cashier</option>
      </select>
      <select v-model="filters.status" @change="loadUsers" class="filter-select">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading users...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span class="badge" :class="`badge-${user.role}`">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="badge" :class="user.status === 'active' ? 'badge-success' : 'badge-inactive'">
                {{ user.status }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button @click="editUser(user.id)" class="btn btn-sm btn-secondary">Edit</button>
              <button
                @click="deleteUser(user.id)"
                class="btn btn-sm btn-danger"
                :disabled="user.id === authStore.user?.id"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="pagination.last_page > 1">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="btn btn-sm"
        >
          Previous
        </button>
        <span>
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>
        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="btn btn-sm"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService, type UserListParams } from '@/services/userService'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const filters = ref<UserListParams>({
  page: 1,
  per_page: 10,
  role: '',
  status: '',
  search: ''
})
const pagination = ref({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})

let searchTimeout: ReturnType<typeof setTimeout>

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await userService.getUsers(filters.value)
    users.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    loadUsers()
  }, 500)
}

const changePage = (page: number) => {
  filters.value.page = page
  loadUsers()
}

const goToCreate = () => {
  router.push({ name: 'users-create' })
}

const editUser = (id: number) => {
  router.push({ name: 'users-edit', params: { id } })
}

const deleteUser = async (id: number) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    await userService.deleteUser(id)
    loadUsers()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete user')
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.users-table th {
  background-color: var(--color-background-soft);
  font-weight: 600;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.badge-admin {
  background-color: #dc3545;
  color: white;
}

.badge-manager {
  background-color: #ffc107;
  color: #000;
}

.badge-cashier {
  background-color: #17a2b8;
  color: white;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-inactive {
  background-color: #6c757d;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
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

