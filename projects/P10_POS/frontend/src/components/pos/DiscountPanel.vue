<template>
  <div class="discount-panel">
    <div class="discount-header">
      <h3>Discounts</h3>
      <button
        v-if="canApplyManual"
        @click="showManualDiscount = true"
        class="btn btn-sm btn-secondary"
      >
        + Manual
      </button>
    </div>

    <div v-if="applicableDiscounts.length > 0" class="applicable-discounts">
      <div
        v-for="discount in applicableDiscounts"
        :key="discount.id"
        class="discount-item"
        :class="{ 'applied': isApplied(discount.id) }"
        @click="applyDiscount(discount)"
      >
        <div class="discount-info">
          <strong>{{ discount.name }}</strong>
          <span class="discount-value">
            {{ discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}` }}
          </span>
        </div>
        <div class="discount-scope">
          <span v-if="discount.product_id" class="badge badge-info">Product</span>
          <span v-else-if="discount.category_id" class="badge badge-info">Category</span>
          <span v-else class="badge badge-info">Store-wide</span>
        </div>
        <button
          v-if="isApplied(discount.id)"
          @click.stop="removeDiscount(discount.id)"
          class="btn-remove-discount"
        >
          Remove
        </button>
      </div>
    </div>

    <div v-else class="no-discounts">
      <p>No applicable discounts</p>
    </div>

    <div v-if="appliedDiscounts.length > 0" class="applied-discounts">
      <h4>Applied Discounts</h4>
      <div
        v-for="applied in appliedDiscounts"
        :key="applied.id"
        class="applied-discount-item"
      >
        <div class="applied-info">
          <span>{{ getDiscountName(applied) }}</span>
          <span class="applied-amount">-${{ applied.applied_amount }}</span>
        </div>
        <button
          @click="removeAppliedDiscount(applied)"
          class="btn-remove"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Manual Discount Modal -->
    <div v-if="showManualDiscount" class="modal-overlay" @click="showManualDiscount = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Apply Manual Discount</h3>
          <button @click="showManualDiscount = false" class="btn-close">×</button>
        </div>
        <form @submit.prevent="applyManualDiscount" class="manual-discount-form">
          <div class="form-group">
            <label>Amount ($)</label>
            <input
              v-model.number="manualAmount"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="showManualDiscount = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import discountService, { type Discount } from '@/services/discountService'
import transactionService, { type Transaction, type TransactionDiscount } from '@/services/transactionService'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  discountApplied: []
  discountRemoved: []
}>()

const authStore = useAuthStore()
const applicableDiscounts = ref<Discount[]>([])
const showManualDiscount = ref(false)
const manualAmount = ref<number>(0)
const loading = ref(false)

const canApplyManual = computed(() => authStore.isAdmin || authStore.isManager)

const appliedDiscounts = computed(() => {
  return props.transaction.transaction_discounts || []
})

const isApplied = (discountId: number) => {
  return appliedDiscounts.value.some(td => td.discount_id === discountId)
}

const loadApplicableDiscounts = async () => {
  if (!props.transaction.store_id) return
  
  try {
    const subtotal = parseFloat(props.transaction.subtotal || '0')
    applicableDiscounts.value = await discountService.getApplicableDiscounts(
      props.transaction.store_id,
      subtotal,
      props.transaction.id
    )
  } catch (error) {
    console.error('Failed to load applicable discounts:', error)
  }
}

const applyDiscount = async (discount: Discount) => {
  if (isApplied(discount.id)) return

  loading.value = true
  try {
    await transactionService.applyDiscount(props.transaction.id, {
      discount_id: discount.id
    })
    emit('discountApplied')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to apply discount')
  } finally {
    loading.value = false
  }
}

const removeDiscount = async (discountId: number) => {
  loading.value = true
  try {
    await transactionService.removeDiscount(props.transaction.id, discountId)
    emit('discountRemoved')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to remove discount')
  } finally {
    loading.value = false
  }
}

const applyManualDiscount = async () => {
  if (manualAmount.value <= 0) {
    alert('Please enter a valid amount')
    return
  }

  loading.value = true
  try {
    await transactionService.applyDiscount(props.transaction.id, {
      manual_amount: manualAmount.value
    })
    showManualDiscount.value = false
    manualAmount.value = 0
    emit('discountApplied')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to apply manual discount')
  } finally {
    loading.value = false
  }
}

const removeAppliedDiscount = async (applied: TransactionDiscount) => {
  if (!applied.discount_id) {
    // Manual discount - need to find it differently
    alert('Cannot remove manual discount from here')
    return
  }

  await removeDiscount(applied.discount_id)
}

const getDiscountName = (applied: TransactionDiscount) => {
  if (applied.discount) {
    return applied.discount.name
  }
  return 'Manual Discount'
}

watch(() => [props.transaction.subtotal, props.transaction.items], () => {
  loadApplicableDiscounts()
}, { deep: true })

onMounted(() => {
  loadApplicableDiscounts()
})
</script>

<style scoped>
.discount-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.discount-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.discount-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.applicable-discounts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.discount-item {
  padding: 0.75rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.discount-item:hover {
  background: var(--color-background-soft);
  border-color: var(--color-primary);
}

.discount-item.applied {
  background: #d1fae5;
  border-color: #10b981;
}

.discount-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.discount-value {
  font-weight: 600;
  color: var(--color-primary);
}

.discount-scope {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-info {
  background: #3b82f6;
  color: white;
}

.btn-remove-discount {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
}

.no-discounts {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-soft);
}

.applied-discounts {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.applied-discounts h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.applied-discount-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.applied-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin-right: 0.5rem;
}

.applied-amount {
  font-weight: 600;
  color: #10b981;
}

.btn-remove {
  width: 24px;
  height: 24px;
  padding: 0;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
}

.manual-discount-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

