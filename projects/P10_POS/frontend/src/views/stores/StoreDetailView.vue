<template>
  <div class="store-detail-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />
    <div v-else-if="!store && !loading" class="empty-state">
      <p>Store not found</p>
      <button @click="$router.push('/stores')" class="btn btn-secondary">
        Back to Stores
      </button>
    </div>

    <div v-else-if="store" class="store-detail">
      <div class="page-header">
        <button @click="$router.push('/stores')" class="btn btn-back">
          ← Back to Stores
        </button>
        <div class="header-actions">
          <button
            v-if="authStore.isAdmin"
            @click="$router.push(`/stores/${store.id}/edit`)"
            class="btn btn-primary"
          >
            Edit Store
          </button>
        </div>
      </div>

      <div class="store-info">
        <div class="info-section">
          <h1>{{ store.name }}</h1>
          <span
            :class="['status-badge', store.status === 'active' ? 'active' : 'inactive']"
          >
            {{ store.status }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item" v-if="store.address">
            <label>Address</label>
            <p>{{ store.address }}</p>
          </div>
          <div class="info-item" v-if="store.phone">
            <label>Phone</label>
            <p>{{ store.phone }}</p>
          </div>
          <div class="info-item" v-if="store.email">
            <label>Email</label>
            <p>{{ store.email }}</p>
          </div>
          <div class="info-item">
            <label>Created</label>
            <p>{{ formatDate(store.created_at) }}</p>
          </div>
        </div>
      </div>

      <div class="store-sections">
        <div class="section">
          <div class="section-header">
            <h2>Team Members</h2>
            <button
              v-if="authStore.isAdmin"
              @click="showAssignModal = true"
              class="btn btn-sm btn-primary"
            >
              Assign User
            </button>
          </div>
          <StoreTeamView :store-id="store.id" @refresh="loadStore" />
        </div>
      </div>
    </div>
  </div>

  <!-- Assign User Modal -->
  <div v-if="showAssignModal" class="modal-overlay" @click="showAssignModal = false">
    <div class="modal-content" @click.stop>
      <h3>Assign User to Store</h3>
      <StoreAssignmentForm
        :store-id="store?.id"
        @success="handleAssignmentSuccess"
        @cancel="showAssignModal = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import StoreTeamView from '@/components/stores/StoreTeamView.vue'
import StoreAssignmentForm from '@/components/stores/StoreAssignmentForm.vue'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)
const showAssignModal = ref(false)
const store = ref<import('@/services/storeService').Store | null>(null)

const loadStore = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    error.value = 'Invalid store ID'
    return
  }
  
  loading.value = true
  error.value = null
  try {
    const fetchedStore = await storeStore.fetchStore(id)
    store.value = fetchedStore
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load store'
    store.value = null
  } finally {
    loading.value = false
  }
}

const handleAssignmentSuccess = () => {
  showAssignModal.value = false
  loadStore()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Watch for route parameter changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadStore()
    }
  },
  { immediate: false }
)

onMounted(() => {
  loadStore()
})
</script>

<style scoped>
.store-detail-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.store-info {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.info-section h1 {
  margin: 0;
  font-size: 2rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-weight: 500;
  color: var(--color-text-soft);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-item p {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.store-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.125rem;
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

