<template>
  <div class="sync-status">
    <div class="sync-status-header">
      <h3 class="sync-title">Sync Status</h3>
      <button
        @click="handleManualSync"
        :disabled="syncing"
        class="sync-button"
      >
        <svg
          v-if="!syncing"
          class="sync-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <svg
          v-else
          class="sync-icon spinning"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ syncing ? 'Syncing...' : 'Sync Now' }}
      </button>
    </div>

    <div class="sync-stats">
      <div class="stat-item">
        <span class="stat-label">Pending</span>
        <span class="stat-value pending">{{ status?.stats.pending || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Synced</span>
        <span class="stat-value synced">{{ status?.stats.synced || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Failed</span>
        <span class="stat-value failed">{{ status?.stats.failed || 0 }}</span>
      </div>
    </div>

    <div v-if="status?.last_sync" class="last-sync">
      Last sync: {{ formatDate(status.last_sync) }}
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import syncService, { type SyncStatus } from '@/services/syncService'
import { syncManager } from '@/utils/syncManager'
import { useStoreStore } from '@/stores/store'

const storeStore = useStoreStore()
const status = ref<SyncStatus | null>(null)
const syncing = ref(false)
const error = ref<string | null>(null)

const loadStatus = async () => {
  try {
    const storeId = storeStore.currentStore?.id
    if (storeId) {
      status.value = await syncService.getStatus(storeId)
      error.value = null
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load sync status'
  }
}

const handleManualSync = async () => {
  if (syncing.value) return

  syncing.value = true
  error.value = null

  try {
    const storeId = storeStore.currentStore?.id
    if (storeId) {
      await syncManager.manualSync(storeId)
      await loadStatus()
    }
  } catch (err: any) {
    error.value = err.message || 'Sync failed'
  } finally {
    syncing.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

let intervalId: number | null = null

onMounted(() => {
  loadStatus()
  // Refresh status every 10 seconds
  intervalId = window.setInterval(loadStatus, 10000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.sync-status {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sync-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sync-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.sync-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.sync-button:hover:not(:disabled) {
  background: #2563eb;
}

.sync-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sync-icon {
  width: 1rem;
  height: 1rem;
}

.sync-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sync-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-value.pending {
  color: #f59e0b;
}

.stat-value.synced {
  color: #10b981;
}

.stat-value.failed {
  color: #ef4444;
}

.last-sync {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>

