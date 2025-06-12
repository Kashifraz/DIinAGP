<template>
  <div class="transaction-summary">
    <h3>Summary</h3>
    <div class="summary-items">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${{ transaction.subtotal }}</span>
      </div>
      <div v-if="transaction.transaction_discounts && transaction.transaction_discounts.length > 0" class="discounts-section">
        <div
          v-for="applied in transaction.transaction_discounts"
          :key="applied.id"
          class="summary-row discount-row"
        >
          <span>{{ getDiscountLabel(applied) }}:</span>
          <span class="discount">-${{ applied.applied_amount }}</span>
        </div>
      </div>
      <div class="summary-row" v-if="parseFloat(transaction.discount_amount) > 0">
        <span>Total Discount:</span>
        <span class="discount">-${{ transaction.discount_amount }}</span>
      </div>
      <div class="summary-row" v-if="parseFloat(transaction.tax_amount) > 0">
        <span>Tax:</span>
        <span>${{ transaction.tax_amount }}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span class="total-amount">${{ transaction.total_amount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionDiscount } from '@/services/transactionService'

defineProps<{
  transaction: Transaction
}>()

const getDiscountLabel = (applied: TransactionDiscount) => {
  if (applied.discount) {
    return applied.discount.name
  }
  return 'Manual Discount'
}
</script>

<style scoped>
.transaction-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
}

.transaction-summary h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
}

.summary-row.total {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 2px solid var(--color-border);
  font-size: 1.125rem;
  font-weight: 600;
}

.discounts-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.discount-row {
  font-size: 0.875rem;
  padding-left: 0.5rem;
}

.discount {
  color: #10b981;
}

.total-amount {
  color: var(--color-primary);
  font-size: 1.25rem;
}
</style>

