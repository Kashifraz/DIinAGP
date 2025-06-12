<template>
  <div class="inventory-report-view">
    <div class="page-header">
      <h1>Inventory Report</h1>
    </div>

    <div class="filters">
      <select v-model="filters.store_id" @change="loadReport" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <label class="checkbox-label">
        <input type="checkbox" v-model="filters.include_low_stock" @change="loadReport" />
        Show Low Stock Only
      </label>
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="report" class="report-content">
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Total Items</h3>
          <p class="value">{{ report.summary.total_items }}</p>
        </div>
        <div class="summary-card revenue">
          <h3>Total Valuation</h3>
          <p class="value">${{ parseFloat(report.summary.total_valuation).toFixed(2) }}</p>
        </div>
        <div class="summary-card warning">
          <h3>Low Stock Items</h3>
          <p class="value">{{ report.summary.low_stock_count }}</p>
        </div>
      </div>

      <div v-if="report.low_stock_items.length > 0" class="report-section alert">
        <h2>Low Stock Alerts</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Store</th>
              <th>Current Quantity</th>
              <th>Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.low_stock_items" :key="item.inventory_id">
              <td>{{ item.product_name }}</td>
              <td>{{ getStoreName(item.store_id) }}</td>
              <td class="low-stock">{{ item.quantity }}</td>
              <td>{{ item.reorder_level }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="report-section">
        <h2>Inventory by Store</h2>
        <table v-if="report.by_store.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Items Count</th>
              <th>Valuation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_store" :key="item.store_id">
              <td>{{ item.store_name }}</td>
              <td>{{ item.items_count }}</td>
              <td>${{ parseFloat(item.valuation).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No inventory data</div>
      </div>

      <div class="report-section">
        <h2>Inventory by Product</h2>
        <table v-if="report.by_product.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Quantity</th>
              <th>Valuation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_product" :key="item.product_id">
              <td>{{ item.product_name }}</td>
              <td>{{ item.total_quantity }}</td>
              <td>${{ parseFloat(item.valuation).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No inventory data</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import reportService, { type InventoryReport } from '@/services/reportService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const report = ref<InventoryReport | null>(null)
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  store_id: '',
  include_low_stock: false
})

const loadStores = async () => {
  try {
    stores.value = await storeStore.fetchStores()
  } catch (err) {
    console.error('Failed to load stores:', err)
  }
}

const loadReport = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {}
    if (filters.value.store_id) params.store_id = filters.value.store_id
    if (filters.value.include_low_stock) params.include_low_stock = 1

    report.value = await reportService.getInventoryReport(params)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load inventory report'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { store_id: '', include_low_stock: false }
  loadReport()
}

const getStoreName = (storeId: number) => {
  const store = stores.value.find(s => s.id === storeId)
  return store?.name || 'Unknown'
}

onMounted(async () => {
  await loadStores()
  await loadReport()
})
</script>

<style scoped>
.inventory-report-view {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-card.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.summary-card.warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.summary-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
}

.summary-card .value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.report-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-section.alert {
  border-left: 4px solid #f5576c;
}

.report-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f5f5f5;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.low-stock {
  color: #f5576c;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>

