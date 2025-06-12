<template>
  <div class="sales-report-view">
    <div class="page-header">
      <h1>Sales Report</h1>
      <button @click="exportReport" class="btn btn-secondary">Export CSV</button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.store_id" @change="loadReport" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <input
        v-model="filters.start_date"
        type="date"
        placeholder="Start Date"
        class="filter-input"
        @change="loadReport"
      />
      <input
        v-model="filters.end_date"
        type="date"
        placeholder="End Date"
        class="filter-input"
        @change="loadReport"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="report" class="report-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Total Transactions</h3>
          <p class="value">{{ report.summary.total_transactions }}</p>
        </div>
        <div class="summary-card revenue">
          <h3>Total Revenue</h3>
          <p class="value">${{ parseFloat(report.summary.total_revenue).toFixed(2) }}</p>
        </div>
        <div class="summary-card">
          <h3>Total Subtotal</h3>
          <p class="value">${{ parseFloat(report.summary.total_subtotal).toFixed(2) }}</p>
        </div>
        <div class="summary-card">
          <h3>Total Tax</h3>
          <p class="value">${{ parseFloat(report.summary.total_tax).toFixed(2) }}</p>
        </div>
        <div class="summary-card">
          <h3>Total Discount</h3>
          <p class="value">${{ parseFloat(report.summary.total_discount).toFixed(2) }}</p>
        </div>
      </div>

      <!-- By Date -->
      <div class="report-section">
        <h2>Sales by Date</h2>
        <div v-if="report.by_date.length === 0" class="empty-state">
          <p>No sales data for selected period</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transactions</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_date" :key="item.date">
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.transactions }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- By Store -->
      <div class="report-section">
        <h2>Sales by Store</h2>
        <div v-if="report.by_store.length === 0" class="empty-state">
          <p>No sales data by store</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Transactions</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_store" :key="item.store_id">
              <td>{{ item.store_name }}</td>
              <td>{{ item.transactions }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- By Product -->
      <div class="report-section">
        <h2>Sales by Product</h2>
        <div v-if="report.by_product.length === 0" class="empty-state">
          <p>No sales data by product</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_product" :key="item.product_id">
              <td>{{ item.product_name }}</td>
              <td>{{ item.quantity_sold }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- By Category -->
      <div class="report-section">
        <h2>Sales by Category</h2>
        <div v-if="report.by_category.length === 0" class="empty-state">
          <p>No sales data by category</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_category" :key="item.category_id">
              <td>{{ item.category_name }}</td>
              <td>{{ item.quantity_sold }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- By Cashier -->
      <div class="report-section">
        <h2>Sales by Cashier</h2>
        <div v-if="report.by_cashier.length === 0" class="empty-state">
          <p>No sales data by cashier</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Cashier</th>
              <th>Transactions</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_cashier" :key="item.cashier_id">
              <td>{{ item.cashier_name }}</td>
              <td>{{ item.transactions }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import reportService, { type SalesReport } from '@/services/reportService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const report = ref<SalesReport | null>(null)
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  store_id: '',
  start_date: '',
  end_date: ''
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
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date

    report.value = await reportService.getSalesReport(params)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load sales report'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    store_id: '',
    start_date: '',
    end_date: ''
  }
  loadReport()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

const exportReport = () => {
  if (!report.value) return

  // Simple CSV export
  let csv = 'Sales Report\n\n'
  csv += `Total Transactions,${report.value.summary.total_transactions}\n`
  csv += `Total Revenue,${report.value.summary.total_revenue}\n\n`
  csv += 'Sales by Date\nDate,Transactions,Revenue\n'
  report.value.by_date.forEach(item => {
    csv += `${item.date},${item.transactions},${item.revenue}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(async () => {
  await loadStores()
  await loadReport()
})
</script>

<style scoped>
.sales-report-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

