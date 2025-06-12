<template>
  <div class="financial-report-view">
    <div class="page-header">
      <h1>Financial Summary</h1>
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
        <div class="summary-card revenue">
          <h3>Total Revenue</h3>
          <p class="value">${{ parseFloat(report.summary.total_revenue).toFixed(2) }}</p>
        </div>
        <div class="summary-card expense">
          <h3>Total Expenses</h3>
          <p class="value">${{ parseFloat(report.summary.total_expenses).toFixed(2) }}</p>
        </div>
        <div class="summary-card" :class="profitClass">
          <h3>Profit</h3>
          <p class="value">${{ parseFloat(report.summary.profit).toFixed(2) }}</p>
        </div>
        <div class="summary-card">
          <h3>Profit Margin</h3>
          <p class="value">{{ parseFloat(report.summary.profit_margin).toFixed(2) }}%</p>
        </div>
        <div class="summary-card">
          <h3>Transactions</h3>
          <p class="value">{{ report.summary.transaction_count }}</p>
        </div>
        <div class="summary-card">
          <h3>Expenses Count</h3>
          <p class="value">{{ report.summary.expense_count }}</p>
        </div>
      </div>

      <div class="report-section">
        <h2>Financial Summary by Store</h2>
        <table v-if="report.by_store.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in report.by_store" :key="item.store_id">
              <td>{{ item.store_name }}</td>
              <td>${{ parseFloat(item.revenue).toFixed(2) }}</td>
              <td>${{ parseFloat(item.expenses).toFixed(2) }}</td>
              <td :class="parseFloat(item.profit) >= 0 ? 'profit' : 'loss'">
                ${{ parseFloat(item.profit).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No financial data</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import reportService, { type FinancialReport } from '@/services/reportService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const report = ref<FinancialReport | null>(null)
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const filters = ref({
  store_id: '',
  start_date: '',
  end_date: ''
})

const profitClass = computed(() => {
  if (!report.value) return ''
  return parseFloat(report.value.summary.profit) >= 0 ? 'profit' : 'loss'
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

    report.value = await reportService.getFinancialReport(params)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load financial report'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { store_id: '', start_date: '', end_date: '' }
  loadReport()
}

onMounted(async () => {
  await loadStores()
  await loadReport()
})
</script>

<style scoped>
.financial-report-view {
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

.summary-card.expense {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.summary-card.profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.summary-card.loss {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
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

.profit {
  color: #28a745;
  font-weight: 600;
}

.loss {
  color: #dc3545;
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

