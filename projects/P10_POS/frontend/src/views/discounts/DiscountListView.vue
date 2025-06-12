<template>
  <div class="discount-list-view">
    <div class="page-header">
      <h1>Discount Management</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Create Discount
      </button>
    </div>

    <div class="filters">
      <select v-model="filters.store_id" @change="loadDiscounts" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <select v-model="filters.status" @change="loadDiscounts" class="filter-input">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="expired">Expired</option>
      </select>
      <select v-model="filters.type" @change="loadDiscounts" class="filter-input">
        <option value="">All Types</option>
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed Amount</option>
      </select>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else class="discount-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Scope</th>
            <th>Store</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="discount in discounts" :key="discount.id">
            <td>{{ discount.name }}</td>
            <td>
              <span :class="['badge', discount.type === 'percentage' ? 'badge-primary' : 'badge-secondary']">
                {{ discount.type === 'percentage' ? '%' : '$' }}
              </span>
            </td>
            <td>{{ discount.value }}</td>
            <td>
              <span v-if="discount.product_id" class="badge badge-info">Product</span>
              <span v-else-if="discount.category_id" class="badge badge-info">Category</span>
              <span v-else class="badge badge-info">Store-wide</span>
            </td>
            <td>{{ getStoreName(discount.store_id) }}</td>
            <td>{{ formatDate(discount.valid_from) }}</td>
            <td>{{ formatDate(discount.valid_to) }}</td>
            <td>
              <span :class="['badge', getStatusBadgeClass(discount.status)]">
                {{ discount.status }}
              </span>
            </td>
            <td>
              <button @click="editDiscount(discount)" class="btn btn-sm btn-secondary">Edit</button>
              <button @click="deleteDiscount(discount.id)" class="btn btn-sm btn-danger">Delete</button>
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
    <DiscountFormModal
      v-if="showCreateModal || editingDiscount"
      :discount="editingDiscount"
      :stores="stores"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import discountService, { type Discount, type DiscountListParams } from '@/services/discountService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'
import DiscountFormModal from '@/components/discounts/DiscountFormModal.vue'

const storeStore = useStoreStore()

const discounts = ref<Discount[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pagination = ref<any>(null)
const showCreateModal = ref(false)
const editingDiscount = ref<Discount | null>(null)

const filters = ref<{
  page: number
  per_page: number
  store_id: string | number | undefined
  status: string | undefined
  type: string | undefined
}>({
  page: 1,
  per_page: 10,
  store_id: '',
  status: '',
  type: '',
})

const stores = ref<any[]>([])

const loadDiscounts = async () => {
  loading.value = true
  error.value = null
  try {
    // Convert empty strings to undefined for API
    const params: DiscountListParams = {
      page: filters.value.page,
      per_page: filters.value.per_page,
      store_id: !filters.value.store_id || filters.value.store_id === '' ? undefined : (typeof filters.value.store_id === 'string' ? parseInt(filters.value.store_id) : filters.value.store_id),
      status: !filters.value.status || filters.value.status === '' ? undefined : filters.value.status,
      type: !filters.value.type || filters.value.type === '' ? undefined : filters.value.type,
    }
    const response = await discountService.getDiscounts(params)
    discounts.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load discounts'
  } finally {
    loading.value = false
  }
}

const loadStores = async () => {
  try {
    await storeStore.fetchStores()
    stores.value = storeStore.accessibleStores
  } catch (err) {
    console.error('Failed to load stores:', err)
  }
}

const editDiscount = (discount: Discount) => {
  editingDiscount.value = discount
}

const deleteDiscount = async (id: number) => {
  if (!confirm('Are you sure you want to delete this discount?')) {
    return
  }

  try {
    await discountService.deleteDiscount(id)
    await loadDiscounts()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to delete discount')
  }
}

const changePage = (page: number) => {
  filters.value.page = page
  loadDiscounts()
}

const closeModal = () => {
  showCreateModal.value = false
  editingDiscount.value = null
}

const handleSaved = () => {
  closeModal()
  loadDiscounts()
}

const getStoreName = (storeId?: number) => {
  if (!storeId) return 'N/A'
  const store = stores.value.find(s => s.id === storeId)
  return store?.name || 'Unknown'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-warning',
    expired: 'badge-danger',
  }
  return classes[status] || 'badge-secondary'
}

onMounted(() => {
  loadStores()
  loadDiscounts()
})
</script>

<style scoped>
.discount-list-view {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
}

.discount-table {
  background: var(--color-background);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.discount-table table {
  width: 100%;
  border-collapse: collapse;
}

.discount-table th,
.discount-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.discount-table th {
  background: var(--color-background-soft);
  font-weight: 600;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary {
  background: var(--color-primary);
  color: white;
}

.badge-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.badge-info {
  background: #3b82f6;
  color: white;
}

.badge-success {
  background: #10b981;
  color: white;
}

.badge-warning {
  background: #f59e0b;
  color: white;
}

.badge-danger {
  background: #ef4444;
  color: white;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

