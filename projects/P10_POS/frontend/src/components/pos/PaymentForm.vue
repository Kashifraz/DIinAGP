<template>
  <div class="payment-form">
    <h3>Payment</h3>

    <div class="payment-method">
      <label>Payment Method</label>
      <select v-model="paymentData.payment_method" class="select-input">
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="mobile_payment">Mobile Payment</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div class="amount-section">
      <label>Amount Received</label>
      <input
        v-model.number="paymentData.amount"
        type="number"
        step="0.01"
        :min="totalAmount"
        class="amount-input"
        placeholder="0.00"
      />
    </div>

    <div v-if="changeAmount > 0" class="change-display">
      <strong>Change: ${{ changeAmount.toFixed(2) }}</strong>
    </div>

    <div v-else-if="paymentData.amount && paymentData.amount < totalAmount" class="error-message">
      Amount is less than total
    </div>

    <div v-if="paymentData.payment_method !== 'cash'" class="reference-section">
      <label>Reference Number</label>
      <input
        v-model="paymentData.reference_number"
        type="text"
        class="reference-input"
        placeholder="Optional"
      />
    </div>

    <div v-if="hasPayment" class="payment-info">
      <div class="payment-details">
        <p><strong>Payment Processed</strong></p>
        <p>Method: {{ formatPaymentMethod(props.transaction.payments![0].payment_method) }}</p>
        <p>Amount: ${{ props.transaction.payments![0].amount }}</p>
        <p v-if="parseFloat(props.transaction.payments![0].change_amount) > 0">
          Change: ${{ props.transaction.payments![0].change_amount }}
        </p>
      </div>
    </div>

    <div v-else class="payment-actions">
      <button
        @click="processPayment"
        :disabled="!canProcessPayment || processing"
        class="btn btn-primary btn-large"
      >
        {{ processing ? 'Processing...' : `Process Payment ($${totalAmount.toFixed(2)})` }}
      </button>
    </div>

    <div v-if="paymentProcessed || hasPayment" class="complete-section">
      <button
        @click="completeTransaction"
        :disabled="completing"
        class="btn btn-success btn-large"
      >
        {{ completing ? 'Completing...' : 'Complete Transaction' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Transaction } from '@/services/transactionService'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  paymentProcessed: [data: any]
  transactionCompleted: []
}>()

const paymentData = ref({
  payment_method: 'cash' as 'cash' | 'card' | 'mobile_payment' | 'bank_transfer' | 'other',
  amount: 0,
  reference_number: '',
})

const processing = ref(false)
const paymentProcessed = ref(false)
const completing = ref(false)

const totalAmount = computed(() => {
  return parseFloat(props.transaction.total_amount || '0')
})

const changeAmount = computed(() => {
  if (!paymentData.value.amount || paymentData.value.amount < totalAmount.value) {
    return 0
  }
  return paymentData.value.amount - totalAmount.value
})

const hasPayment = computed(() => {
  return props.transaction.payments && props.transaction.payments.length > 0
})

const canProcessPayment = computed(() => {
  // Don't allow processing if payment already exists or if amount is insufficient
  if (hasPayment.value || paymentProcessed.value) {
    return false
  }
  return paymentData.value.amount >= totalAmount.value
})

const processPayment = async () => {
  if (!canProcessPayment.value || hasPayment.value || paymentProcessed.value) {
    return
  }

  processing.value = true
  try {
    const paymentDataToSend = {
      payment_method: paymentData.value.payment_method,
      amount: paymentData.value.amount, // Use the amount entered (includes change calculation)
      reference_number: paymentData.value.reference_number || undefined,
    }
    emit('paymentProcessed', paymentDataToSend)
    paymentProcessed.value = true
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('Failed to process payment')
    paymentProcessed.value = false
  } finally {
    processing.value = false
  }
}

const completeTransaction = async () => {
  completing.value = true
  try {
    emit('transactionCompleted')
  } catch (error) {
    console.error('Transaction completion error:', error)
  } finally {
    completing.value = false
  }
}

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    mobile_payment: 'Mobile Payment',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  }
  return methods[method] || method
}

// Watch for transaction updates to sync payment state
watch(() => props.transaction.payments, (payments) => {
  if (payments && payments.length > 0) {
    paymentProcessed.value = true
    // Update payment data from the transaction
    const payment = payments[0]
    paymentData.value.payment_method = payment.payment_method
    paymentData.value.amount = parseFloat(payment.amount)
    paymentData.value.reference_number = payment.reference_number || ''
  }
}, { immediate: true })
</script>

<style scoped>
.payment-form {
  margin-top: 1rem;
}

.payment-form h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.payment-method,
.amount-section,
.reference-section {
  margin-bottom: 1rem;
}

.payment-method label,
.amount-section label,
.reference-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.select-input,
.amount-input,
.reference-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.amount-input {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: right;
}

.change-display {
  padding: 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.payment-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #d1fae5;
  border-radius: 4px;
  border: 1px solid #10b981;
}

.payment-details p {
  margin: 0.5rem 0;
}

.payment-actions,
.complete-section {
  margin-top: 1rem;
}

.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-large {
  padding: 1.25rem;
  font-size: 1.125rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-success:hover:not(:disabled) {
  opacity: 0.9;
}
</style>

