<template>
  <div class="transfer-list-view">
    <div class="page-header">
      <h1>Stock Transfers</h1>
      <div class="header-actions">
        <button @click="showCreateModal = true" class="btn btn-primary">
          + Initiate Transfer
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.store_id" @change="loadTransfers" class="filter-input">
        <option value="">All Stores</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </option>
      </select>
      <select v-model="filters.status" @change="loadTransfers" class="filter-input">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="in_transit">In Transit</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        v-model="filters.start_date"
        type="date"
        placeholder="Start Date"
        class="filter-input"
        @change="loadTransfers"
      />
      <input
        v-model="filters.end_date"
        type="date"
        placeholder="End Date"
        class="filter-input"
        @change="loadTransfers"
      />
      <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
    </div>

    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else class="transfer-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>From Store</th>
            <th>To Store</th>
            <th>Status</th>
            <th>Items</th>
            <th>Requested At</th>
            <th>Requested By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transfer in transfers" :key="transfer.id">
            <td>#{{ transfer.id }}</td>
            <td>{{ transfer.from_store?.name || 'N/A' }}</td>
            <td>{{ transfer.to_store?.name || 'N/A' }}</td>
            <td>
              <span :class="['status-badge', `status-${transfer.status}`]">
                {{ formatStatus(transfer.status) }}
              </span>
            </td>
            <td>{{ transfer.items?.length || 0 }} items</td>
            <td>{{ formatDate(transfer.requested_at) }}</td>
            <td>{{ transfer.requested_by_user?.username || 'N/A' }}</td>
            <td>
              <router-link :to="`/transfers/${transfer.id}`" class="btn btn-sm btn-secondary">
                View
              </router-link>
              <button
                v-if="transfer.status === 'pending'"
                @click="approveTransfer(transfer.id)"
                class="btn btn-sm btn-success"
              >
                Approve
              </button>
              <button
                v-if="['approved', 'in_transit'].includes(transfer.status)"
                @click="completeTransfer(transfer.id)"
                class="btn btn-sm btn-primary"
              >
                Complete
              </button>
              <button
                v-if="['pending', 'approved', 'in_transit'].includes(transfer.status)"
                @click="cancelTransfer(transfer.id)"
                class="btn btn-sm btn-danger"
              >
                Cancel
              </button>
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

    <!-- Create Transfer Modal -->
    <CreateTransferModal
      v-if="showCreateModal"
      :stores="stores"
      @close="showCreateModal = false"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStoreStore } from '@/stores/store'
import transferService, { type StockTransfer, type TransferStatus } from '@/services/transferService'
import CreateTransferModal from '@/components/transfers/CreateTransferModal.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const storeStore = useStoreStore()

const transfers = ref<StockTransfer[]>([])
const stores = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pagination = ref<any>(null)
const showCreateModal = ref(false)

const filters = ref({
  store_id: '',
  status: '' as TransferStatus | '',
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

const loadTransfers = async () => {
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

    const response = await transferService.getTransfers(params)
    transfers.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load transfers'
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  filters.value.page = page
  loadTransfers()
}

const clearFilters = () => {
  filters.value = {
    store_id: '',
    status: '',
    start_date: '',
    end_date: '',
    page: 1,
    per_page: 10
  }
  loadTransfers()
}

const approveTransfer = async (id: number) => {
  if (!confirm('Are you sure you want to approve this transfer?')) return

  try {
    await transferService.approveTransfer(id)
    await loadTransfers()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to approve transfer')
  }
}

const completeTransfer = async (id: number) => {
  if (!confirm('Are you sure you want to complete this transfer? This will update inventory at both stores.')) return

  try {
    await transferService.completeTransfer(id)
    await loadTransfers()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to complete transfer')
  }
}

const cancelTransfer = async (id: number) => {
  if (!confirm('Are you sure you want to cancel this transfer?')) return

  try {
    await transferService.cancelTransfer(id)
    await loadTransfers()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to cancel transfer')
  }
}

const handleSaved = () => {
  showCreateModal.value = false
  loadTransfers()
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

onMounted(async () => {
  await loadStores()
  await loadTransfers()
})
</script>

<style scoped>
.transfer-list-view {
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

.transfer-table {
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

.status-approved {
  background: #d1ecf1;
  color: #0c5460;
}

.status-in_transit {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
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
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
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

