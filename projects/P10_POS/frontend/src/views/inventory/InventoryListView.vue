<template>
  <div class="inventory-list-view">
    <div class="page-header">
      <h1>Inventory</h1>
      <div class="header-actions">
        <select v-model="selectedStoreId" @change="loadInventory" class="store-select">
          <option value="">Select Store</option>
          <option
            v-for="store in accessibleStores"
            :key="store.id"
            :value="store.id"
          >
            {{ store.name }}
          </option>
        </select>
        <button
          v-if="inventoryStore.canManageInventory && selectedStoreId"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          Add Inventory
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div v-if="selectedStoreId" class="filters-section">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by product name, SKU, or barcode..."
          class="search-input"
          @input="applyFilters"
        />
      </div>
      <div class="filter-box">
        <label>
          <input
            type="checkbox"
            v-model="lowStockFilter"
            @change="applyFilters"
          />
          Low Stock Only
        </label>
      </div>
    </div>

    <AppLoading v-if="inventoryStore.loading && !inventoryStore.inventory.length" />
    <AppError v-else-if="inventoryStore.error" :message="inventoryStore.error" />

    <div v-else-if="!selectedStoreId" class="empty-state">
      <p>Please select a store to view inventory</p>
    </div>

    <div v-else class="inventory-container">
      <div v-if="filteredInventory.length === 0" class="empty-state">
        <p>No inventory items found</p>
      </div>

      <div v-else class="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Barcode</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredInventory"
              :key="item.id"
              :class="{ 'low-stock': isLowStock(item) }"
            >
              <td>{{ item.product_name || 'N/A' }}</td>
              <td>{{ item.sku || 'N/A' }}</td>
              <td>{{ item.barcode || 'N/A' }}</td>
              <td>{{ item.category_name || 'N/A' }}</td>
              <td>
                <span :class="getQuantityClass(item)">
                  {{ item.quantity }}
                </span>
              </td>
              <td>{{ item.reorder_level }}</td>
              <td>
                <span :class="['status-badge', isLowStock(item) ? 'low' : 'ok']">
                  {{ isLowStock(item) ? 'Low Stock' : 'OK' }}
                </span>
              </td>
              <td>
                <button
                  @click="viewInventory(item)"
                  class="btn btn-sm btn-secondary"
                >
                  View
                </button>
                <button
                  v-if="inventoryStore.canManageInventory"
                  @click="openAdjustModal(item)"
                  class="btn btn-sm btn-primary"
                >
                  Adjust
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="pagination">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="btn btn-sm"
        >
          Previous
        </button>
        <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="btn btn-sm"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Add Inventory Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add Inventory Item</h3>
        <InventoryForm
          :store-id="selectedStoreId"
          @success="handleAddSuccess"
          @cancel="showAddModal = false"
        />
      </div>
    </div>

    <!-- Adjust Inventory Modal -->
    <div v-if="showAdjustModal && selectedItem" class="modal-overlay" @click="showAdjustModal = false">
      <div class="modal-content" @click.stop>
        <h3>Adjust Inventory</h3>
        <InventoryAdjustForm
          :store-id="selectedStoreId"
          :inventory-id="selectedItem.id"
          :current-quantity="selectedItem.quantity"
          @success="handleAdjustSuccess"
          @cancel="showAdjustModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { useStoreStore } from '@/stores/store'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import InventoryForm from '@/components/inventory/InventoryForm.vue'
import InventoryAdjustForm from '@/components/inventory/InventoryAdjustForm.vue'
import type { Inventory } from '@/services/inventoryService'

const router = useRouter()
const inventoryStore = useInventoryStore()
const storeStore = useStoreStore()

const selectedStoreId = ref<number | ''>('')
const searchQuery = ref('')
const lowStockFilter = ref(false)
const currentPage = ref(1)
const pagination = ref<any>(null)
const showAddModal = ref(false)
const showAdjustModal = ref(false)
const selectedItem = ref<Inventory | null>(null)

const accessibleStores = computed(() => storeStore.accessibleStores)

const filteredInventory = computed(() => {
  return inventoryStore.inventory
})

const isLowStock = (item: Inventory) => {
  return item.quantity <= item.reorder_level
}

const getQuantityClass = (item: Inventory) => {
  if (item.quantity <= item.reorder_level) {
    return 'quantity-low'
  } else if (item.quantity <= item.reorder_level * 2) {
    return 'quantity-warning'
  }
  return 'quantity-ok'
}

const loadInventory = async () => {
  if (!selectedStoreId.value) return

  currentPage.value = 1
  await applyFilters()
}

const applyFilters = async () => {
  if (!selectedStoreId.value) return

  const params: any = {
    page: currentPage.value,
    per_page: 20,
  }

  if (lowStockFilter.value) {
    params.low_stock = true
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  try {
    const response = await inventoryStore.fetchInventory(selectedStoreId.value as number, params)
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load inventory:', error)
  }
}

const changePage = async (page: number) => {
  currentPage.value = page
  await applyFilters()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const viewInventory = (item: Inventory) => {
  if (!selectedStoreId.value) return
  router.push({ 
    name: 'inventory-detail', 
    params: { 
      storeId: selectedStoreId.value.toString(), 
      id: item.id.toString() 
    } 
  })
}

const openAdjustModal = (item: Inventory) => {
  selectedItem.value = item
  showAdjustModal.value = true
}

const handleAddSuccess = () => {
  showAddModal.value = false
  applyFilters()
}

const handleAdjustSuccess = () => {
  showAdjustModal.value = false
  selectedItem.value = null
  applyFilters()
}

onMounted(async () => {
  await storeStore.fetchStores()
  // Auto-select first store if only one accessible
  if (accessibleStores.value.length === 1) {
    selectedStoreId.value = accessibleStores.value[0].id
    await loadInventory()
  }
})
</script>

<style scoped>
.inventory-list-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.store-select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.filter-box label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.inventory-table {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--color-background-soft);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

tr.low-stock {
  background-color: #fef2f2;
}

tr:hover {
  background-color: var(--color-background-soft);
}

.quantity-low {
  color: #dc2626;
  font-weight: 600;
}

.quantity-warning {
  color: #f59e0b;
  font-weight: 500;
}

.quantity-ok {
  color: #10b981;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-soft);
}
</style>

