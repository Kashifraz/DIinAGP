<template>
  <div class="expense-summary-view">
    <div class="page-header">
      <h1>Expense Summary</h1>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.store_id" @change="loadSummary" class="filter-input">
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
        @change="loadSummary"
      />
      <input
        v-model="filters.end_date"
        type="date"
        placeholder="End Date"
        class="filter-input"
        @change="loadSummary"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="summary" class="summary-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <h3>Total Expenses</h3>
          <p class="amount">${{ parseFloat(summary.total_amount).toFixed(2) }}</p>
        </div>
        <div class="summary-card">
          <h3>Total Count</h3>
          <p class="count">{{ summary.total_count }}</p>
        </div>
      </div>

      <!-- By Category -->
      <div class="summary-section">
        <h2>Expenses by Category</h2>
        <div v-if="summary.by_category.length === 0" class="empty-state">
          <p>No expenses by category</p>
        </div>
        <div v-else class="category-list">
          <div
            v-for="item in summary.by_category"
            :key="item.category_id"
            class="category-item"
          >
            <div class="category-info">
              <h4>{{ item.category_name }}</h4>
              <span class="count">{{ item.count }} expense(s)</span>
            </div>
            <div class="category-amount">${{ parseFloat(item.total_amount).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- By Date -->
      <div class="summary-section">
        <h2>Expenses by Date</h2>
        <div v-if="summary.by_date.length === 0" class="empty-state">
          <p>No expenses by date</p>
        </div>
        <div v-else class="date-list">
          <div
            v-for="item in summary.by_date"
            :key="item.date"
            class="date-item"
          >
            <div class="date-info">
              <h4>{{ formatDate(item.date) }}</h4>
              <span class="count">{{ item.count }} expense(s)</span>
            </div>
            <div class="date-amount">${{ parseFloat(item.total_amount).toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import expenseService, { type ExpenseSummary } from '@/services/expenseService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const summary = ref<ExpenseSummary | null>(null)
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

const loadSummary = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {}
    if (filters.value.store_id) params.store_id = parseInt(filters.value.store_id)
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date

    summary.value = await expenseService.getExpenseSummary(
      params.store_id,
      params.start_date,
      params.end_date
    )
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load expense summary'
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
  loadSummary()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await loadStores()
  await loadSummary()
})
</script>

<style scoped>
.expense-summary-view {
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

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.summary-card .amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #e74c3c;
  margin: 0;
}

.summary-card .count {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3498db;
  margin: 0;
}

.summary-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

.category-list,
.date-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item,
.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.category-info,
.date-info {
  flex: 1;
}

.category-info h4,
.date-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.category-info .count,
.date-info .count {
  color: #666;
  font-size: 0.9rem;
}

.category-amount,
.date-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e74c3c;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}
</style>

