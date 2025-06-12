<template>
  <div class="store-assignment-form">
    <div class="form-group">
      <label for="role">Role *</label>
      <select id="role" v-model="form.role" required>
        <option value="manager">Manager</option>
        <option value="cashier">Cashier</option>
      </select>
    </div>

    <div class="form-group">
      <label for="user_id">User *</label>
      <select
        id="user_id"
        v-model="form.user_id"
        required
        :disabled="loadingUsers"
      >
        <option value="">Select a user</option>
        <option
          v-for="user in availableUsers"
          :key="user.id"
          :value="user.id"
        >
          {{ user.name }} ({{ user.email }}) - {{ user.role }}
        </option>
      </select>
      <small v-if="loadingUsers">Loading users...</small>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button
        type="submit"
        @click.prevent="handleSubmit"
        :disabled="loading || !form.user_id"
        class="btn btn-primary"
      >
        {{ loading ? 'Assigning...' : 'Assign User' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStoreStore } from '@/stores/store'
import storeService from '@/services/storeService'
import { userService } from '@/services/userService'
import type { User } from '@/types/auth'

const props = defineProps<{
  storeId: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const storeStore = useStoreStore()

const form = ref({
  role: 'cashier' as 'manager' | 'cashier',
  user_id: '',
})

const users = ref<User[]>([])
const loadingUsers = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const availableUsers = computed(() => {
  // Filter users based on role
  // Managers can only be assigned as managers
  // Cashiers can only be assigned as cashiers
  return users.value.filter(user => {
    if (form.value.role === 'manager') {
      return user.role === 'manager'
    } else {
      return user.role === 'cashier'
    }
  })
})

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const response = await userService.getUsers({ per_page: 100 })
    users.value = response.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  } finally {
    loadingUsers.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.user_id) {
    error.value = 'Please select a user'
    return
  }

  loading.value = true
  error.value = null

  try {
    const userId = parseInt(form.value.user_id)
    
    if (form.value.role === 'manager') {
      await storeService.assignManager(props.storeId, userId)
    } else {
      await storeService.assignCashier(props.storeId, userId)
    }

    emit('success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to assign user'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.store-assignment-form {
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

.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group small {
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}
</style>

