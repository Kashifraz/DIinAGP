<template>
  <div class="transfer-detail-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />
    <div v-else-if="!transfer && !loading" class="empty-state">
      <p>Transfer not found</p>
      <button @click="$router.push('/transfers')" class="btn btn-secondary">
        Back to Transfers
      </button>
    </div>

    <div v-else-if="transfer" class="transfer-detail">
      <div class="page-header">
        <button @click="$router.push('/transfers')" class="btn btn-back">
          ← Back to Transfers
        </button>
        <div class="header-actions">
          <button
            v-if="transfer.status === 'pending'"
            @click="approveTransfer"
            class="btn btn-success"
          >
            Approve Transfer
          </button>
          <button
            v-if="['approved', 'in_transit'].includes(transfer.status)"
            @click="completeTransfer"
            class="btn btn-primary"
          >
            Complete Transfer
          </button>
          <button
            v-if="['pending', 'approved', 'in_transit'].includes(transfer.status)"
            @click="cancelTransfer"
            class="btn btn-danger"
          >
            Cancel Transfer
          </button>
        </div>
      </div>

      <div class="transfer-info">
        <div class="info-section">
          <h1>Transfer #{{ transfer.id }}</h1>
          <span :class="['status-badge', `status-${transfer.status}`]">
            {{ formatStatus(transfer.status) }}
          </span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <label>From Store</label>
            <p>{{ transfer.from_store?.name || 'N/A' }}</p>
          </div>
          <div class="info-item">
            <label>To Store</label>
            <p>{{ transfer.to_store?.name || 'N/A' }}</p>
          </div>
          <div class="info-item">
            <label>Requested By</label>
            <p>{{ transfer.requested_by_user?.username || 'N/A' }}</p>
          </div>
          <div class="info-item" v-if="transfer.approved_by_user">
            <label>Approved By</label>
            <p>{{ transfer.approved_by_user.username }}</p>
          </div>
          <div class="info-item">
            <label>Requested At</label>
            <p>{{ formatDateTime(transfer.requested_at) }}</p>
          </div>
          <div class="info-item" v-if="transfer.completed_at">
            <label>Completed At</label>
            <p>{{ formatDateTime(transfer.completed_at) }}</p>
          </div>
          <div class="info-item" v-if="transfer.notes">
            <label>Notes</label>
            <p>{{ transfer.notes }}</p>
          </div>
        </div>
      </div>

      <div class="transfer-sections">
        <div class="section">
          <div class="section-header">
            <h2>Transfer Items</h2>
            <span class="item-count">{{ transfer.items?.length || 0 }} items</span>
          </div>
          <div v-if="transfer.items && transfer.items.length > 0" class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in transfer.items" :key="item.id">
                  <td>{{ item.product?.name || 'N/A' }}</td>
                  <td>
                    <span v-if="item.variant">
                      {{ item.variant.variant_name }}: {{ item.variant.variant_value }}
                    </span>
                    <span v-else class="text-muted">No Variant</span>
                  </td>
                  <td>{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            <p>No items in this transfer</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import transferService, { type StockTransfer } from '@/services/transferService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const route = useRoute()
const router = useRouter()

const transfer = ref<StockTransfer | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const loadTransfer = async () => {
  const id = route.params.id
  if (!id || typeof id !== 'string') {
    error.value = 'Invalid transfer ID'
    return
  }

  loading.value = true
  error.value = null
  try {
    transfer.value = await transferService.getTransfer(parseInt(id))
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load transfer'
  } finally {
    loading.value = false
  }
}

const approveTransfer = async () => {
  if (!transfer.value || !confirm('Are you sure you want to approve this transfer?')) return

  try {
    await transferService.approveTransfer(transfer.value.id)
    await loadTransfer()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to approve transfer')
  }
}

const completeTransfer = async () => {
  if (!transfer.value || !confirm('Are you sure you want to complete this transfer? This will update inventory at both stores.')) return

  try {
    await transferService.completeTransfer(transfer.value.id)
    await loadTransfer()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to complete transfer')
  }
}

const cancelTransfer = async () => {
  if (!transfer.value || !confirm('Are you sure you want to cancel this transfer?')) return

  try {
    await transferService.cancelTransfer(transfer.value.id)
    await loadTransfer()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Failed to cancel transfer')
  }
}

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

watch(() => route.params.id, () => {
  loadTransfer()
})

onMounted(() => {
  loadTransfer()
})
</script>

<style scoped>
.transfer-detail-view {
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

.transfer-info {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.info-section h1 {
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
}

.transfer-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
}

.item-count {
  color: #666;
  font-size: 0.875rem;
}

.items-table {
  overflow-x: auto;
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

.text-muted {
  color: #666;
  font-style: italic;
}

.status-badge {
  padding: 0.5rem 1rem;
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

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  display: inline-block;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #007bff;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>

