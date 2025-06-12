<template>
  <div class="shopping-cart">
    <div v-if="items.length === 0" class="empty-cart">
      <p>Cart is empty</p>
      <p class="hint">Add products to get started</p>
    </div>

    <div v-else class="cart-items">
      <div
        v-for="item in items"
        :key="`item-${item.id}`"
        class="cart-item"
      >
        <div class="item-info">
          <h4>{{ item.product_name || 'Product' }}</h4>
          <p v-if="item.variant_name" class="variant-info">
            {{ item.variant_name }}: {{ item.variant_value }}
          </p>
          <p class="item-price">${{ item.unit_price }} each</p>
        </div>

        <div class="item-controls">
          <div class="quantity-control">
            <button
              @click="decrementQuantity(item)"
              class="btn btn-quantity"
              :disabled="item.quantity <= 1"
            >
              -
            </button>
            <span class="quantity">{{ item.quantity }}</span>
            <button
              @click="incrementQuantity(item)"
              class="btn btn-quantity"
            >
              +
            </button>
          </div>

          <div class="item-total">
            <div v-if="parseFloat(item.discount_amount) > 0" class="item-discount">
              <span class="original-price">${{ (parseFloat(item.unit_price) * item.quantity).toFixed(2) }}</span>
              <span class="discount-badge">-${{ item.discount_amount }}</span>
            </div>
            ${{ item.line_total }}
          </div>

          <div class="item-actions">
            <button
              v-if="canOverridePrice"
              @click="showPriceOverride(item)"
              class="btn btn-price-override"
              title="Override price (Manager)"
            >
              $
            </button>
            <button
              @click="removeItem(item.id)"
              class="btn btn-remove"
              title="Remove item"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Override Modal -->
    <div v-if="showPriceOverrideModal && selectedItem" class="modal-overlay" @click="showPriceOverrideModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Override Price</h3>
          <button @click="showPriceOverrideModal = false" class="btn-close">×</button>
        </div>
        <form @submit.prevent="applyPriceOverride" class="price-override-form">
          <div class="form-group">
            <label>Product: {{ selectedItem.product_name }}</label>
            <label>Current Price: ${{ selectedItem.unit_price }}</label>
            <label>New Price ($) *</label>
            <input
              v-model.number="newPrice"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div class="form-actions">
            <button type="button" @click="showPriceOverrideModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Applying...' : 'Apply' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import transactionService from '@/services/transactionService'
import type { TransactionItem, Transaction } from '@/services/transactionService'

const props = defineProps<{
  items: TransactionItem[]
  transaction?: Transaction
}>()

const emit = defineEmits<{
  updateItem: [itemId: number, data: { quantity: number }]
  removeItem: [itemId: number]
  priceOverridden: []
}>()

const authStore = useAuthStore()
const showPriceOverrideModal = ref(false)
const selectedItem = ref<TransactionItem | null>(null)
const newPrice = ref<number>(0)
const loading = ref(false)

const canOverridePrice = computed(() => authStore.isAdmin || authStore.isManager)

const incrementQuantity = (item: TransactionItem) => {
  const currentQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity
  const newQuantity = currentQuantity + 1
  emit('updateItem', item.id, { quantity: newQuantity })
}

const decrementQuantity = (item: TransactionItem) => {
  const currentQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity
  const newQuantity = Math.max(1, currentQuantity - 1)
  emit('updateItem', item.id, { quantity: newQuantity })
}

const removeItem = (itemId: number) => {
  if (confirm('Remove this item from cart?')) {
    emit('removeItem', itemId)
  }
}

const showPriceOverride = (item: TransactionItem) => {
  selectedItem.value = item
  newPrice.value = parseFloat(item.unit_price)
  showPriceOverrideModal.value = true
}

const applyPriceOverride = async () => {
  if (!selectedItem.value || !props.transaction) return
  
  if (newPrice.value < 0) {
    alert('Price must be greater than or equal to 0')
    return
  }

  loading.value = true
  try {
    await transactionService.priceOverride(
      props.transaction.id,
      selectedItem.value.id,
      newPrice.value
    )
    showPriceOverrideModal.value = false
    selectedItem.value = null
    emit('priceOverridden')
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to override price')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.shopping-cart {
  min-height: 200px;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-soft);
}

.hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  gap: 1rem;
  transition: all 0.2s;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.variant-info {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.item-price {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.25rem;
}

.btn-quantity {
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
}

.btn-quantity:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-quantity:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-quantity:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-background);
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.item-total {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--color-primary);
  min-width: 80px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-discount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.875rem;
}

.original-price {
  text-decoration: line-through;
  color: var(--color-text-soft);
  font-size: 0.75rem;
}

.discount-badge {
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-price-override {
  width: 32px;
  height: 32px;
  padding: 0;
  background: #fbbf24;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-price-override:hover {
  background: #f59e0b;
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

.price-override-form {
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

.btn-remove {
  width: 32px;
  height: 32px;
  padding: 0;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #fecaca;
}
</style>

