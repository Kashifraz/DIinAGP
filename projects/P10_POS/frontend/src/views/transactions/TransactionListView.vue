<template>
  <div class="transaction-list-view">
    <div class="page-header">
      <h1>Transactions</h1>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.store_id" @change="loadTransactions" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <select v-model="filters.status" @change="loadTransactions" class="filter-input">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="voided">Voided</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        v-model="filters.start_date"
        type="date"
        placeholder="Start Date"
        class="filter-input"
        @change="loadTransactions"
      />
      <input
        v-model="filters.end_date"
        type="date"
        placeholder="End Date"
        class="filter-input"
        @change="loadTransactions"
      />
      <input
        v-model="filters.search"
        type="text"
        placeholder="Search by transaction number..."
        class="filter-input"
        @input="loadTransactions"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else class="transaction-table">
      <div v-if="transactions.length === 0" class="empty-state">
        <p>No transactions found</p>
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Transaction #</th>
            <th>Store</th>
            <th>Cashier</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.transaction_number }}</td>
            <td>{{ transaction.store?.name || 'N/A' }}</td>
            <td>{{ transaction.cashier?.username || 'N/A' }}</td>
            <td>{{ transaction.customer?.name || '-' }}</td>
            <td>{{ formatDateTime(transaction.created_at) }}</td>
            <td>
              <span :class="['status-badge', `status-${transaction.status}`]">
                {{ formatStatus(transaction.status) }}
              </span>
            </td>
            <td class="amount">${{ parseFloat(transaction.total_amount).toFixed(2) }}</td>
            <td>
              <router-link :to="`/transactions/${transaction.id}`" class="btn btn-sm btn-secondary">
                View
              </router-link>
              <router-link
                v-if="transaction.status === 'completed'"
                :to="`/receipts/transactions/${transaction.id}`"
                class="btn btn-sm btn-primary"
              >
                Receipt
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination" class="pagination">
        <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1">
          Previous
        </button>
        <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import transactionService, { type Transaction } from '@/services/transactionService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const transactions = ref<Transaction[]>([])
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pagination = ref<any>(null)

const filters = ref({
  store_id: '',
  status: '',
  start_date: '',
  end_date: '',
  search: '',
  page: 1,
  per_page: 10
})

const loadStores = async () => {
  try {
    stores.value = await storeStore.fetchStores()
  } catch (err) {
    console.error('Failed to load stores:', err)
  }
}

const loadTransactions = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {
      page: filters.value.page,
      per_page: filters.value.per_page
    }
    if (filters.value.store_id) params.store_id = filters.value.store_id
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.search) params.search = filters.value.search

    const response = await transactionService.getTransactions(params)
    transactions.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load transactions'
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  filters.value.page = page
  loadTransactions()
}

const clearFilters = () => {
  filters.value = {
    store_id: '',
    status: '',
    start_date: '',
    end_date: '',
    search: '',
    page: 1,
    per_page: 10
  }
  loadTransactions()
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

onMounted(async () => {
  await loadStores()
  await loadTransactions()
})
</script>

<style scoped>
.transaction-list-view {
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

.transaction-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-voided {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background: #d1ecf1;
  color: #0c5460;
}

.amount {
  font-weight: 600;
  color: #28a745;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>

