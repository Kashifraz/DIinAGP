<template>
  <div class="store-form-view">
    <div class="page-header">
      <button @click="$router.push('/stores')" class="btn btn-back">
        ← Back to Stores
      </button>
      <h1>{{ isEdit ? 'Edit Store' : 'Create Store' }}</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Store Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            minlength="3"
            maxlength="255"
            placeholder="Enter store name"
          />
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="form.address"
            rows="3"
            placeholder="Enter store address"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              maxlength="20"
              placeholder="Enter phone number"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" v-model="form.status" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" @click="$router.push('/stores')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Saving...' : isEdit ? 'Update Store' : 'Create Store' }}
          </button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import type { Store } from '@/services/storeService'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()

const loading = ref(false)
const error = ref<string | null>(null)

const storeId = computed(() => {
  const id = route.params.id
  return id ? parseInt(id as string) : null
})

const isEdit = computed(() => !!storeId.value)

const form = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  status: 'active' as 'active' | 'inactive',
})

const loadStore = async () => {
  if (!storeId.value) return

  loading.value = true
  try {
    const store = await storeStore.fetchStore(storeId.value)
    form.value = {
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      status: store.status,
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load store'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null

  try {
    const data = {
      name: form.value.name,
      address: form.value.address || undefined,
      phone: form.value.phone || undefined,
      email: form.value.email || undefined,
      status: form.value.status,
    }

    if (isEdit.value) {
      await storeStore.updateStore(storeId.value!, data)
    } else {
      await storeStore.createStore(data)
    }

    router.push('/stores')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save store'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadStore()
  }
})
</script>

<style scoped>
.store-form-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.form-container {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
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

.btn-back {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-back:hover {
  background-color: var(--color-background-soft);
}
</style>

