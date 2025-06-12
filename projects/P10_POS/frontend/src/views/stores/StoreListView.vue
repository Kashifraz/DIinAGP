<template>
  <div class="store-list-view">
    <div class="page-header">
      <h1 class="page-title">Stores</h1>
      <button
        v-if="authStore.isAdmin"
        @click="$router.push('/stores/new')"
        class="add-store-btn"
      >
        Add Store
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="filters-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search stores by name, address, email, or phone..."
        class="search-input"
      />
      <div class="filter-box">
        <label for="status-filter">Status:</label>
        <select id="status-filter" v-model="statusFilter" class="filter-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <AppLoading v-if="storeStore.loading && !storeStore.stores.length" />
    <AppError v-else-if="storeStore.error" :message="storeStore.error" />

    <div v-else class="stores-container">
      <div v-if="filteredStores.length === 0" class="empty-state">
        <p>No stores found</p>
      </div>

      <div v-else class="stores-grid">
        <div
          v-for="store in filteredStores"
          :key="store.id"
          class="store-card"
        >
          <div class="store-header">
            <h3 class="store-name">{{ store.name }}</h3>
            <span
              :class="['status-badge', store.status === 'active' ? 'active' : 'inactive']"
            >
              {{ store.status === 'active' ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="store-details">
            <p v-if="store.address" class="detail-item">
              Address: {{ store.address }}
            </p>
            <p v-if="store.phone" class="detail-item">
              Phone: {{ store.phone }}
            </p>
            <p v-if="store.email" class="detail-item">
              Email: {{ store.email }}
            </p>
          </div>
          <div class="store-actions">
            <button
              @click="viewStore(store.id)"
              class="btn-view-details"
            >
              View Details
            </button>
            <button
              v-if="authStore.isAdmin"
              @click="handleDelete(store)"
              class="btn-delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import type { Store } from '@/services/storeService'

const router = useRouter()
const storeStore = useStoreStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const filteredStores = computed(() => {
  let stores = storeStore.accessibleStores

  // Apply status filter
  if (statusFilter.value !== 'all') {
    stores = stores.filter(store => store.status === statusFilter.value)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    stores = stores.filter(
      store =>
        store.name.toLowerCase().includes(query) ||
        store.address?.toLowerCase().includes(query) ||
        store.email?.toLowerCase().includes(query) ||
        store.phone?.includes(query)
    )
  }

  return stores
})

const viewStore = (storeId: number) => {
  router.push({ name: 'stores-detail', params: { id: storeId } })
}

const handleDelete = async (store: Store) => {
  if (!confirm(`Are you sure you want to delete "${store.name}"?`)) {
    return
  }

  try {
    await storeStore.deleteStore(store.id)
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete store')
  }
}

onMounted(async () => {
  try {
    await storeStore.fetchStores()
  } catch (error) {
    console.error('Failed to load stores:', error)
  }
})
</script>

<style scoped>
.store-list-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.add-store-btn {
  padding: 0.625rem 1.25rem;
  background-color: #9333ea;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-store-btn:hover {
  background-color: #7e22ce;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  color: #1f2937;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #9333ea;
}

.filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-box label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  color: #1f2937;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #9333ea;
}

.stores-container {
  margin-top: 1rem;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.store-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.store-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.store-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background-color: #10b981;
  color: white;
}

.status-badge.inactive {
  background-color: #ef4444;
  color: white;
}

.store-details {
  margin-bottom: 1rem;
}

.detail-item {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.store-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-view-details {
  flex: 1;
  padding: 0.625rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-details:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.btn-delete {
  flex: 1;
  padding: 0.625rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
</style>

