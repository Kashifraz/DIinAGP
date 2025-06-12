<template>
  <div class="pos-view">
    <div class="pos-container">
      <!-- Left Panel: Product Search & Selection -->
      <div class="pos-left-panel">
        <div class="product-search-section">
          <h2>Products</h2>
          <ProductSearchPanel
            @product-selected="handleProductSelected"
            @barcode-scanned="handleBarcodeScanned"
          />
        </div>
      </div>

      <!-- Right Panel: Cart & Checkout -->
      <div class="pos-right-panel">
        <div class="cart-section">
          <div class="cart-header">
            <h2>Cart</h2>
            <span v-if="transactionStore.currentTransaction" class="transaction-number">
              {{ transactionStore.currentTransaction.transaction_number }}
            </span>
          </div>

          <ShoppingCart
            v-if="transactionStore.currentTransaction"
            :items="transactionStore.cartItems"
            :transaction="transactionStore.currentTransaction"
            @update-item="handleUpdateItem"
            @remove-item="handleRemoveItem"
            @price-overridden="handlePriceOverridden"
          />

          <div v-else class="empty-cart">
            <p>Start a new transaction to begin</p>
            <button @click="startNewTransaction" class="btn btn-primary">
              New Transaction
            </button>
          </div>
        </div>

        <div v-if="transactionStore.currentTransaction" class="checkout-section">
          <TransactionSummary
            :transaction="transactionStore.currentTransaction"
          />

          <DiscountPanel
            v-if="transactionStore.currentTransaction"
            :transaction="transactionStore.currentTransaction"
            @discount-applied="handleDiscountApplied"
            @discount-removed="handleDiscountRemoved"
          />

          <CustomerForm
            :transaction="transactionStore.currentTransaction"
            @customer-added="handleCustomerAdded"
            @customer-removed="handleCustomerRemoved"
          />

          <PaymentForm
            :transaction="transactionStore.currentTransaction"
            @payment-processed="handlePaymentProcessed"
            @transaction-completed="handleTransactionCompleted"
          />
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <ReceiptModal
      v-if="showReceipt && completedTransaction"
      :transaction="completedTransaction"
      @close="handleReceiptClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useStoreStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import ProductSearchPanel from '@/components/pos/ProductSearchPanel.vue'
import ShoppingCart from '@/components/pos/ShoppingCart.vue'
import TransactionSummary from '@/components/pos/TransactionSummary.vue'
import DiscountPanel from '@/components/pos/DiscountPanel.vue'
import CustomerForm from '@/components/pos/CustomerForm.vue'
import PaymentForm from '@/components/pos/PaymentForm.vue'
import ReceiptModal from '@/components/pos/ReceiptModal.vue'
import type { Transaction } from '@/services/transactionService'

const transactionStore = useTransactionStore()
const storeStore = useStoreStore()
const authStore = useAuthStore()

const showReceipt = ref(false)
const completedTransaction = ref<Transaction | null>(null)

const startNewTransaction = async () => {
  // Get the first accessible store (or let user select)
  const stores = storeStore.accessibleStores
  if (stores.length === 0) {
    alert('No stores available')
    return
  }

  const storeId = stores[0].id
  try {
    await transactionStore.startTransaction(storeId)
  } catch (error) {
    console.error('Failed to start transaction:', error)
  }
}

const handleProductSelected = async (product: any) => {
  try {
    await transactionStore.addItem({
      product_id: product.id,
      quantity: 1,
    })
    // Transaction is automatically refreshed in the store
  } catch (error: any) {
    console.error('Failed to add product:', error)
    alert(error.response?.data?.message || 'Failed to add product to cart')
  }
}

const handleBarcodeScanned = async (barcode: string) => {
  // Search for product by barcode
  // This would typically trigger a product search
  console.log('Barcode scanned:', barcode)
}

const handleUpdateItem = async (itemId: number, data: { quantity?: number }) => {
  try {
    await transactionStore.updateItem(itemId, data)
  } catch (error) {
    console.error('Failed to update item:', error)
  }
}

const handleRemoveItem = async (itemId: number) => {
  try {
    await transactionStore.removeItem(itemId)
  } catch (error) {
    console.error('Failed to remove item:', error)
  }
}

const handleCustomerAdded = async (customerId: number) => {
  try {
    await transactionStore.addCustomer(customerId)
    // Transaction is automatically refreshed in the store
  } catch (error: any) {
    console.error('Failed to add customer:', error)
    alert(error.response?.data?.message || 'Failed to add customer')
  }
}

const handleCustomerRemoved = () => {
  // Customer removal is handled in the store
  // Transaction is automatically refreshed
}

const handleDiscountApplied = async () => {
  // Refresh transaction to get updated discounts
  if (transactionStore.currentTransaction) {
    await transactionStore.fetchTransaction(transactionStore.currentTransaction.id)
  }
}

const handleDiscountRemoved = async () => {
  // Refresh transaction to get updated discounts
  if (transactionStore.currentTransaction) {
    await transactionStore.fetchTransaction(transactionStore.currentTransaction.id)
  }
}

const handlePriceOverridden = async () => {
  // Refresh transaction to get updated prices
  if (transactionStore.currentTransaction) {
    await transactionStore.fetchTransaction(transactionStore.currentTransaction.id)
  }
}

const handlePaymentProcessed = async (paymentData: any) => {
  try {
    await transactionStore.processPayment(paymentData)
    // Refresh transaction to get updated payment info
    if (transactionStore.currentTransaction) {
      await transactionStore.fetchTransaction(transactionStore.currentTransaction.id)
    }
  } catch (error: any) {
    console.error('Failed to process payment:', error)
    alert(error.response?.data?.message || 'Failed to process payment')
  }
}

const handleTransactionCompleted = async () => {
  try {
    const transaction = await transactionStore.completeTransaction()
    completedTransaction.value = transaction
    showReceipt.value = true
  } catch (error) {
    console.error('Failed to complete transaction:', error)
  }
}

const handleReceiptClose = () => {
  showReceipt.value = false
  completedTransaction.value = null
  transactionStore.clearTransaction()
  // Optionally start a new transaction
  setTimeout(() => {
    startNewTransaction()
  }, 500)
}

onMounted(async () => {
  await storeStore.fetchStores()
  // Auto-start transaction if cashier
  if (authStore.isCashier && storeStore.accessibleStores.length > 0) {
    await startNewTransaction()
  }
})
</script>

<style scoped>
.pos-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background-soft);
}

.pos-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1rem;
  padding: 1rem;
}

.pos-left-panel {
  flex: 1;
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-y: auto;
  border: 1px solid var(--color-border);
}

.pos-right-panel {
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.cart-section,
.checkout-section {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.transaction-number {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  font-weight: 500;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-soft);
}

.product-search-section h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>

