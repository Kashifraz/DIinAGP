<template>
  <div class="expense-list-view">
    <div class="page-header">
      <h1>Expense Management</h1>
      <div class="header-actions">
        <router-link to="/expenses/summary" class="btn btn-secondary" style="text-decoration: none; color: white;">
          View Summary
        </router-link>
        <button @click="showCategoryModal = true" class="btn btn-secondary">
          Manage Categories
        </button>
        <button @click="showCreateModal = true" class="btn btn-primary">
          + Add Expense
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.store_id" @change="loadExpenses" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <select v-model="filters.category_id" @change="loadExpenses" class="filter-input">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <input
        v-model="filters.start_date"
        type="date"
        placeholder="Start Date"
        class="filter-input"
        @change="loadExpenses"
      />
      <input
        v-model="filters.end_date"
        type="date"
        placeholder="End Date"
        class="filter-input"
        @change="loadExpenses"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else class="expense-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Store</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td>{{ formatDate(expense.expense_date) }}</td>
            <td>{{ expense.store?.name || 'N/A' }}</td>
            <td>{{ expense.category?.name || 'N/A' }}</td>
            <td class="amount">${{ parseFloat(expense.amount).toFixed(2) }}</td>
            <td>{{ expense.description || '-' }}</td>
            <td>{{ expense.creator?.name || 'N/A' }}</td>
            <td>
              <button @click="editExpense(expense)" class="btn btn-sm btn-secondary">Edit</button>
              <button @click="deleteExpense(expense.id)" class="btn btn-sm btn-danger">Delete</button>
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

    <!-- Create/Edit Modal -->
    <ExpenseFormModal
      v-if="showCreateModal || editingExpense"
      :expense="editingExpense"
      :stores="stores"
      :categories="categories"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Category Management Modal -->
    <ExpenseCategoryManagement
      v-if="showCategoryModal"
      @close="showCategoryModal = false"
      @updated="loadCategories"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStoreStore } from '@/stores/store'
import expenseService, { type Expense, type ExpenseCategory } from '@/services/expenseService'
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal.vue'
import ExpenseCategoryManagement from '@/components/expenses/ExpenseCategoryManagement.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const expenses = ref<Expense[]>([])
const categories = ref<ExpenseCategory[]>([])
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pagination = ref<any>(null)
const showCreateModal = ref(false)
const showCategoryModal = ref(false)
const editingExpense = ref<Expense | null>(null)

const filters = ref({
  store_id: '',
  category_id: '',
  start_date: '',
  end_date: '',
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

const loadCategories = async () => {
  try {
    categories.value = await expenseService.getExpenseCategories()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const loadExpenses = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {
      page: filters.value.page,
      per_page: filters.value.per_page
    }
    if (filters.value.store_id) params.store_id = filters.value.store_id
    if (filters.value.category_id) params.category_id = filters.value.category_id
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date

    const response = await expenseService.getExpenses(params)
    expenses.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load expenses'
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  filters.value.page = page
  loadExpenses()
}

const clearFilters = () => {
  filters.value = {
    store_id: '',
    category_id: '',
    start_date: '',
    end_date: '',
    page: 1,
    per_page: 10
  }
  loadExpenses()
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  showCreateModal.value = true
}

const deleteExpense = async (id: number) => {
  if (!confirm('Are you sure you want to delete this expense?')) return

  try {
    await expenseService.deleteExpense(id)
    await loadExpenses()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete expense')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingExpense.value = null
}

const handleSaved = () => {
  closeModal()
  loadExpenses()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await loadStores()
  await loadCategories()
  await loadExpenses()
})
</script>

<style scoped>
.expense-list-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
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

.expense-table {
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

.amount {
  font-weight: 600;
  color: #e74c3c;
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
  font-size: 0.9rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  margin: 0 0.25rem;
}
</style>

