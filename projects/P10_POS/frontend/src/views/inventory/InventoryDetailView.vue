<template>
  <div class="inventory-detail-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />
    <div v-else-if="!inventory && !loading" class="empty-state">
      <p>Inventory item not found</p>
      <button @click="goBack" class="btn btn-secondary">
        Back to Inventory
      </button>
    </div>

    <div v-else-if="inventory" class="inventory-detail">
      <div class="page-header">
        <button @click="goBack" class="btn btn-back">
          ← Back to Inventory
        </button>
        <div class="header-actions">
          <button
            v-if="inventoryStore.canManageInventory"
            @click="showAdjustModal = true"
            class="btn btn-primary"
          >
            Adjust Inventory
          </button>
        </div>
      </div>

      <div class="inventory-info">
        <div class="info-section">
          <h1>{{ inventory.product_name || 'N/A' }}</h1>
          <span
            :class="['status-badge', isLowStock ? 'low' : 'ok']"
          >
            {{ isLowStock ? 'Low Stock' : 'Stock OK' }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>Store</label>
            <p>{{ storeName }}</p>
          </div>
          <div class="info-item" v-if="inventory.sku">
            <label>SKU</label>
            <p>{{ inventory.sku }}</p>
          </div>
          <div class="info-item" v-if="inventory.barcode">
            <label>Barcode</label>
            <p>{{ inventory.barcode }}</p>
          </div>
          <div class="info-item" v-if="inventory.category_name">
            <label>Category</label>
            <p>{{ inventory.category_name }}</p>
          </div>
          <div class="info-item">
            <label>Current Quantity</label>
            <p :class="getQuantityClass">{{ inventory.quantity }}</p>
          </div>
          <div class="info-item">
            <label>Reorder Level</label>
            <p>{{ inventory.reorder_level }}</p>
          </div>
          <div class="info-item">
            <label>Last Updated</label>
            <p>{{ formatDate(inventory.last_updated) }}</p>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div class="inventory-sections">
        <div class="section">
          <div class="section-header">
            <h2>Inventory History</h2>
          </div>
          <InventoryHistoryView
            :store-id="storeId"
            :inventory-id="inventory.id"
          />
        </div>
      </div>
    </div>

    <!-- Adjust Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click="showAdjustModal = false">
      <div class="modal-content" @click.stop>
        <h3>Adjust Inventory</h3>
        <InventoryAdjustForm
          :store-id="storeId"
          :inventory-id="inventory?.id"
          :current-quantity="inventory?.quantity || 0"
          @success="handleAdjustSuccess"
          @cancel="showAdjustModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useStoreStore } from '@/stores/store'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import InventoryAdjustForm from '@/components/inventory/InventoryAdjustForm.vue'
import InventoryHistoryView from '@/components/inventory/InventoryHistoryView.vue'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()
const storeStore = useStoreStore()

const loading = ref(false)
const error = ref<string | null>(null)
const showAdjustModal = ref(false)

const storeId = computed(() => {
  const id = route.params.storeId as string
  return id ? parseInt(id) : 0
})
const inventoryId = computed(() => {
  const id = route.params.id as string
  return id ? parseInt(id) : 0
})

const inventory = ref<any>(null)

const storeName = computed(() => {
  const store = storeStore.stores.find(s => s.id === storeId.value)
  return store?.name || 'N/A'
})

const isLowStock = computed(() => {
  return inventory.value ? inventory.value.quantity <= inventory.value.reorder_level : false
})

const getQuantityClass = computed(() => {
  if (!inventory.value) return ''
  if (inventory.value.quantity <= inventory.value.reorder_level) {
    return 'quantity-low'
  } else if (inventory.value.quantity <= inventory.value.reorder_level * 2) {
    return 'quantity-warning'
  }
  return 'quantity-ok'
})

const loadInventory = async () => {
  loading.value = true
  error.value = null
  try {
    inventory.value = await inventoryStore.fetchInventoryItem(storeId.value, inventoryId.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load inventory item'
  } finally {
    loading.value = false
  }
}

const handleAdjustSuccess = () => {
  showAdjustModal.value = false
  loadInventory()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const goBack = () => {
  router.push({ name: 'inventory-list', query: { store: storeId.value.toString() } })
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadInventory()
    }
  },
  { immediate: false }
)

onMounted(async () => {
  await storeStore.fetchStores()
  await loadInventory()
})
</script>

<style scoped>
.inventory-detail-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.inventory-info {
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
}

.status-badge.low {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-badge.ok {
  background-color: #d1fae5;
  color: #065f46;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.quantity-low {
  color: #dc2626;
  font-weight: 600;
  font-size: 1.25rem;
}

.quantity-warning {
  color: #f59e0b;
  font-weight: 600;
  font-size: 1.25rem;
}

.quantity-ok {
  color: #10b981;
  font-weight: 600;
  font-size: 1.25rem;
}

.inventory-sections {
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
  max-width: 600px;
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

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
}
</style>

