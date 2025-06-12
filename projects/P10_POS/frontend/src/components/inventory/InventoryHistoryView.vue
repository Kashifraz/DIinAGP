<template>
  <div class="inventory-history-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="history.length === 0" class="empty-state">
      <p>No history available</p>
    </div>

    <div v-else class="history-list">
      <div
        v-for="entry in history"
        :key="entry.id"
        class="history-item"
      >
        <div class="history-info">
          <div class="history-type">
            <span :class="['type-badge', getChangeTypeClass(entry.change_type)]">
              {{ formatChangeType(entry.change_type) }}
            </span>
            <span class="quantity-change" :class="getChangeClass(entry.quantity_change)">
              {{ entry.quantity_change > 0 ? '+' : '' }}{{ entry.quantity_change }}
            </span>
          </div>
          <div class="history-details">
            <span class="quantity-info">
              {{ entry.previous_quantity }} → {{ entry.new_quantity }}
            </span>
            <span v-if="entry.reason" class="reason">{{ entry.reason }}</span>
            <span v-if="entry.user" class="user">by {{ entry.user.name }}</span>
            <span class="date">{{ formatDate(entry.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import inventoryService, { type InventoryHistory } from '@/services/inventoryService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const props = defineProps<{
  storeId: number
  inventoryId: number
}>()

const history = ref<InventoryHistory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadHistory = async () => {
  loading.value = true
  error.value = null
  try {
    history.value = await inventoryService.getInventoryHistory(props.storeId, props.inventoryId, 50)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load history'
  } finally {
    loading.value = false
  }
}

const formatChangeType = (type: string) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getChangeTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    sale: 'sale',
    purchase: 'purchase',
    adjustment: 'adjustment',
    return: 'return',
    damage: 'damage',
    expired: 'expired',
    transfer_in: 'transfer',
    transfer_out: 'transfer',
  }
  return classes[type] || 'adjustment'
}

const getChangeClass = (change: number) => {
  return change > 0 ? 'positive' : 'negative'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.inventory-history-view {
  margin-top: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-type {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.type-badge.sale {
  background-color: #fee2e2;
  color: #dc2626;
}

.type-badge.purchase {
  background-color: #d1fae5;
  color: #065f46;
}

.type-badge.adjustment {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-badge.return {
  background-color: #fef3c7;
  color: #92400e;
}

.type-badge.damage,
.type-badge.expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.type-badge.transfer {
  background-color: #e0e7ff;
  color: #3730a3;
}

.quantity-change {
  font-weight: 600;
  font-size: 1rem;
}

.quantity-change.positive {
  color: #10b981;
}

.quantity-change.negative {
  color: #ef4444;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.quantity-info {
  font-weight: 500;
  color: var(--color-text);
}

.reason {
  font-style: italic;
}

.user {
  color: var(--color-primary);
}

.date {
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-soft);
}
</style>

