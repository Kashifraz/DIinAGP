<template>
  <div class="user-form-page">
    <div class="page-header">
      <h1>{{ isEdit ? 'Edit User' : 'Create User' }}</h1>
      <button @click="goBack" class="btn btn-secondary">Back to List</button>
    </div>

    <form @submit.prevent="handleSubmit" class="user-form">
      <div class="form-group">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          minlength="3"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="role">Role *</label>
        <select id="role" v-model="formData.role" required class="form-input">
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      <div class="form-group">
        <label for="status">Status *</label>
        <select id="status" v-model="formData.status" required class="form-input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="form-group" v-if="!isEdit">
        <label for="password">Password *</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          :required="!isEdit"
          minlength="8"
          class="form-input"
        />
        <small>Minimum 8 characters</small>
      </div>

      <div class="form-group" v-if="isEdit">
        <label for="password">New Password (leave blank to keep current)</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          minlength="8"
          class="form-input"
        />
        <small>Minimum 8 characters</small>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User') }}
        </button>
        <button type="button" @click="goBack" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userService, type CreateUserData, type UpdateUserData } from '@/services/userService'

const router = useRouter()
const route = useRoute()

const userId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)
const isEdit = computed(() => !!userId.value)

const formData = ref<CreateUserData & { password?: string }>({
  name: '',
  email: '',
  phone: '',
  role: 'cashier',
  status: 'active',
  password: ''
})

const loading = ref(false)
const error = ref('')

const loadUser = async () => {
  if (!userId.value) return
  
  try {
    const user = await userService.getUserById(userId.value)
    formData.value = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: ''
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load user'
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (isEdit.value) {
      const updateData: UpdateUserData = {
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
        role: formData.value.role,
        status: formData.value.status
      }
      
      if (formData.value.password) {
        updateData.password = formData.value.password
      }
      
      await userService.updateUser(userId.value!, updateData)
    } else {
      await userService.createUser(formData.value as CreateUserData)
    }
    
    router.push({ name: 'users-list' })
  } catch (err: any) {
    if (err.response?.data?.data?.errors) {
      error.value = Object.values(err.response.data.data.errors).flat().join(', ')
    } else {
      error.value = err.response?.data?.message || 'Failed to save user'
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'users-list' })
}

onMounted(() => {
  if (isEdit.value) {
    loadUser()
  }
})
</script>

<style scoped>
.user-form-page {
  padding: 2rem;
  max-width: 600px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.user-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background-soft);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

