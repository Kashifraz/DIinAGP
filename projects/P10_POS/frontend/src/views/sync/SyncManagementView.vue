<template>
  <div class="sync-management">
    <div class="page-header">
      <h1 class="page-title">Sync Management</h1>
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

    <SyncStatus />

    <div class="sync-sections">
      <div class="section">
        <h2 class="section-title">Pending Sync</h2>
        <div v-if="pendingItems.length === 0" class="empty-state">
          No pending items
        </div>
        <div v-else class="queue-list">
          <div
            v-for="item in pendingItems"
            :key="item.id"
            class="queue-item"
          >
            <div class="queue-item-info">
              <span class="queue-item-type">{{ item.entity_type }}</span>
              <span class="queue-item-time">{{ formatDate(item.created_at) }}</span>
            </div>
            <span class="queue-item-status pending">Pending</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Failed Sync</h2>
        <div v-if="failedItems.length === 0" class="empty-state">
          No failed items
        </div>
        <div v-else class="queue-list">
          <div
            v-for="item in failedItems"
            :key="item.id"
            class="queue-item failed"
          >
            <div class="queue-item-info">
              <span class="queue-item-type">{{ item.entity_type }}</span>
              <span class="queue-item-time">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="queue-item-actions">
              <button
                @click="retryItem(item.id)"
                class="retry-button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <button
          v-if="failedItems.length > 0"
          @click="retryAll"
          class="retry-all-button"
        >
          Retry All Failed
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import syncService, { type SyncQueueItem } from '@/services/syncService'
import { syncManager } from '@/utils/syncManager'
import { useStoreStore } from '@/stores/store'
import SyncStatus from '@/components/offline/SyncStatus.vue'

const storeStore = useStoreStore()
const pendingItems = ref<SyncQueueItem[]>([])
const failedItems = ref<SyncQueueItem[]>([])
const syncing = ref(false)

const loadQueue = async () => {
  try {
    const storeId = storeStore.currentStore?.id
    if (storeId) {
      const [pending, failed] = await Promise.all([
        syncService.getQueue({ store_id: storeId, status: 'pending', limit: 50 }),
        syncService.getQueue({ store_id: storeId, status: 'failed', limit: 50 })
      ])
      pendingItems.value = pending
      failedItems.value = failed
    }
  } catch (error) {
    console.error('Failed to load queue:', error)
  }
}

const handleManualSync = async () => {
  if (syncing.value) return

  syncing.value = true
  try {
    const storeId = storeStore.currentStore?.id
    if (storeId) {
      await syncManager.manualSync(storeId)
      await loadQueue()
    }
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    syncing.value = false
  }
}

const retryItem = async (syncId: number) => {
  try {
    await syncService.retry([syncId])
    await loadQueue()
    await handleManualSync()
  } catch (error) {
    console.error('Retry failed:', error)
  }
}

const retryAll = async () => {
  try {
    const failedIds = failedItems.value.map(item => item.id)
    await syncService.retry(failedIds)
    await loadQueue()
    await handleManualSync()
  } catch (error) {
    console.error('Retry all failed:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

let intervalId: number | null = null

onMounted(() => {
  loadQueue()
  // Refresh every 10 seconds
  intervalId = window.setInterval(loadQueue, 10000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.sync-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.sync-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
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
  width: 1.25rem;
  height: 1.25rem;
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

.sync-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 4px solid #f59e0b;
}

.queue-item.failed {
  border-left-color: #ef4444;
}

.queue-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.queue-item-type {
  font-weight: 500;
  color: #1f2937;
  text-transform: capitalize;
}

.queue-item-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.queue-item-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.queue-item-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.queue-item-actions {
  display: flex;
  gap: 0.5rem;
}

.retry-button {
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

.retry-button:hover {
  background: #2563eb;
}

.retry-all-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.retry-all-button:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .sync-sections {
    grid-template-columns: 1fr;
  }
}
</style>

