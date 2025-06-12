<template>
  <div class="expense-report-view">
    <div class="page-header">
      <h1>Expense Report</h1>
    </div>

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
        class="filter-input"
        @change="loadReport"
      />
      <input
        v-model="filters.end_date"
        type="date"
        class="filter-input"
        @change="loadReport"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="report" class="report-content">
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Total Expenses</h3>
          <p class="value">{{ report.summary.total_expenses }}</p>
        </div>
        <div class="summary-card revenue">
          <h3>Total Amount</h3>
          <p class="value">${{ parseFloat(report.summary.total_amount).toFixed(2) }}</p>
        </div>
      </div>

      <div class="report-section">
        <h2>Expenses by Store</h2>
        <table v-if="report.by_store.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_store" :key="item.store_id">
              <td>{{ item.store_name }}</td>
              <td>{{ item.count }}</td>
              <td>${{ parseFloat(item.total_amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No expense data</div>
      </div>

      <div class="report-section">
        <h2>Expenses by Category</h2>
        <table v-if="report.by_category.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_category" :key="item.category_id">
              <td>{{ item.category_name }}</td>
              <td>{{ item.count }}</td>
              <td>${{ parseFloat(item.total_amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No expense data</div>
      </div>

      <div class="report-section">
        <h2>Expenses by Date</h2>
        <table v-if="report.by_date.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_date" :key="item.date">
              <td>{{ formatDate(item.date) }}</td>
              <td>{{ item.count }}</td>
              <td>${{ parseFloat(item.total_amount).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No expense data</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import reportService, { type ExpenseReport } from '@/services/reportService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const report = ref<ExpenseReport | null>(null)
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

    report.value = await reportService.getExpenseReport(params)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load expense report'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { store_id: '', start_date: '', end_date: '' }
  loadReport()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await loadStores()
  await loadReport()
})
</script>

<style scoped>
.expense-report-view {
  padding: 2rem;
}

.page-header {
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

