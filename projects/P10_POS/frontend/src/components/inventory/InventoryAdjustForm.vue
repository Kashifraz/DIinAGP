<template>
  <div class="inventory-adjust-form">
    <div class="current-quantity">
      <label>Current Quantity:</label>
      <span class="quantity-value">{{ currentQuantity }}</span>
    </div>

    <div class="form-group">
      <label for="quantity_change">Quantity Change *</label>
      <input
        id="quantity_change"
        v-model.number="form.quantity_change"
        type="number"
        required
        placeholder="Enter positive or negative value"
      />
      <small>
        Enter positive value to add stock (e.g., +10) or negative to remove (e.g., -5)
      </small>
      <div v-if="form.quantity_change" class="new-quantity">
        New Quantity: <strong>{{ currentQuantity + (form.quantity_change || 0) }}</strong>
      </div>
    </div>

    <div class="form-group">
      <label for="change_type">Change Type *</label>
      <select id="change_type" v-model="form.change_type" required>
        <option value="adjustment">Adjustment</option>
        <option value="purchase">Purchase</option>
        <option value="sale">Sale</option>
        <option value="return">Return</option>
        <option value="damage">Damage</option>
        <option value="expired">Expired</option>
        <option value="transfer_in">Transfer In</option>
        <option value="transfer_out">Transfer Out</option>
      </select>
    </div>

    <div class="form-group">
      <label for="reason">Reason</label>
      <textarea
        id="reason"
        v-model="form.reason"
        rows="3"
        placeholder="Enter reason for adjustment (optional)"
      ></textarea>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
        Cancel
      </button>
      <button
        type="submit"
        @click.prevent="handleSubmit"
        :disabled="loading || !form.quantity_change || form.quantity_change === 0"
        class="btn btn-primary"
      >
        {{ loading ? 'Adjusting...' : 'Adjust Inventory' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import inventoryService from '@/services/inventoryService'

const props = defineProps<{
  storeId: number
  inventoryId: number
  currentQuantity: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const form = ref({
  quantity_change: 0,
  change_type: 'adjustment' as 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return' | 'damage' | 'expired',
  reason: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (!form.value.quantity_change || form.value.quantity_change === 0) {
    error.value = 'Quantity change cannot be zero'
    return
  }

  loading.value = true
  error.value = null

  try {
    await inventoryService.adjustInventory(props.storeId, props.inventoryId, {
      quantity_change: form.value.quantity_change,
      change_type: form.value.change_type,
      reason: form.value.reason || undefined,
    })

    emit('success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to adjust inventory'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.inventory-adjust-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-quantity {
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-quantity label {
  font-weight: 500;
  color: var(--color-text);
}

.quantity-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group small {
  color: var(--color-text-soft);
  font-size: 0.875rem;
}

.new-quantity {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  color: var(--color-text);
}

.new-quantity strong {
  color: var(--color-primary);
  font-size: 1.125rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}
</style>

