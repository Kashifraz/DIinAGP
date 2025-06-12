<template>
  <div class="receipt-modal-overlay" @click="$emit('close')">
    <div class="receipt-modal" @click.stop>
      <div class="receipt-header">
        <h2>Receipt</h2>
        <button @click="$emit('close')" class="btn-close">×</button>
      </div>

      <div v-if="loading" class="receipt-loading">
        <p>Loading receipt...</p>
      </div>

      <div v-else-if="receiptData" class="receipt-content">
        <div class="receipt-store">
          <h3>{{ receiptData.store.name }}</h3>
          <p v-if="receiptData.store.address">{{ receiptData.store.address }}</p>
          <p v-if="receiptData.store.phone">Phone: {{ receiptData.store.phone }}</p>
          <p v-if="receiptData.store.email">{{ receiptData.store.email }}</p>
        </div>

        <div class="receipt-info">
          <p v-if="receiptData.receipt_number"><strong>Receipt #:</strong> {{ receiptData.receipt_number }}</p>
          <p><strong>Transaction #:</strong> {{ receiptData.transaction_number }}</p>
          <p><strong>Date:</strong> {{ formatDate(receiptData.date) }}</p>
          <p><strong>Cashier:</strong> {{ receiptData.cashier.name }}</p>
        </div>

        <div v-if="receiptData.customer" class="receipt-customer">
          <p><strong>Customer:</strong> {{ receiptData.customer.name }}</p>
          <p v-if="receiptData.customer.email">{{ receiptData.customer.email }}</p>
          <p v-if="receiptData.customer.phone">{{ receiptData.customer.phone }}</p>
        </div>

        <div class="receipt-items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in receiptData.items" :key="index">
                <td>
                  {{ item.product_name }}
                  <span v-if="item.variant" class="variant">
                    ({{ item.variant.name }}: {{ item.variant.value }})
                  </span>
                </td>
                <td>{{ item.quantity }}</td>
                <td>${{ item.unit_price }}</td>
                <td>${{ item.line_total }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="receipt-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${{ receiptData.totals.subtotal }}</span>
          </div>
          <div v-if="parseFloat(receiptData.totals.discount_amount) > 0" class="total-row">
            <span>Discount:</span>
            <span>-${{ receiptData.totals.discount_amount }}</span>
          </div>
          <div v-if="parseFloat(receiptData.totals.tax_amount) > 0" class="total-row">
            <span>Tax:</span>
            <span>${{ receiptData.totals.tax_amount }}</span>
          </div>
          <div class="total-row total">
            <span>Total:</span>
            <span>${{ receiptData.totals.total_amount }}</span>
          </div>
        </div>

        <div v-if="receiptData.payment" class="receipt-payment">
          <p><strong>Payment Method:</strong> {{ formatPaymentMethod(receiptData.payment.method) }}</p>
          <p><strong>Amount Paid:</strong> ${{ receiptData.payment.amount }}</p>
          <p v-if="parseFloat(receiptData.payment.change_amount) > 0">
            <strong>Change:</strong> ${{ receiptData.payment.change_amount }}
          </p>
          <p v-if="receiptData.payment.reference_number">
            <strong>Ref #:</strong> {{ receiptData.payment.reference_number }}
          </p>
        </div>

        <div class="receipt-footer">
          <p>Thank you for your purchase!</p>
          <p>Please keep this receipt for your records</p>
        </div>
      </div>

      <div v-if="receiptData" class="receipt-actions">
        <button @click="printReceipt" class="btn btn-primary">Print HTML</button>
        <button @click="printAsText" class="btn btn-secondary">Print Text</button>
        <button @click="$emit('close')" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import receiptService, { type ReceiptData } from '@/services/receiptService'
import type { Transaction } from '@/services/transactionService'

const props = defineProps<{
  transaction: Transaction
}>()

defineEmits<{
  close: []
}>()

const receiptData = ref<ReceiptData | null>(null)
const loading = ref(false)

const loadReceipt = async () => {
  loading.value = true
  try {
    receiptData.value = await receiptService.getReceipt(props.transaction.id)
  } catch (error) {
    console.error('Failed to load receipt:', error)
    // Fallback to transaction data if receipt API fails
    receiptData.value = formatTransactionAsReceipt(props.transaction)
  } finally {
    loading.value = false
  }
}

const formatTransactionAsReceipt = (transaction: Transaction): ReceiptData => {
  return {
    transaction_number: transaction.transaction_number,
    date: transaction.created_at,
    store: transaction.store || { name: 'Store' },
    cashier: transaction.cashier || { name: 'Cashier', id: transaction.cashier_id },
    customer: transaction.customer,
    items: transaction.items?.map(item => ({
      product_name: item.product_name || 'Product',
      variant: item.variant_name && item.variant_value ? {
        name: item.variant_name,
        value: item.variant_value
      } : undefined,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    })) || [],
    totals: {
      subtotal: transaction.subtotal,
      tax_amount: transaction.tax_amount,
      discount_amount: transaction.discount_amount,
      total_amount: transaction.total_amount,
    },
    payment: transaction.payments && transaction.payments.length > 0 ? {
      method: transaction.payments[0].payment_method,
      amount: transaction.payments[0].amount,
      change_amount: transaction.payments[0].change_amount,
      reference_number: transaction.payments[0].reference_number,
    } : undefined,
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
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

const printReceipt = () => {
  window.print()
}

const printAsText = async () => {
  try {
    const text = await receiptService.getReceiptText(props.transaction.id)
    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write('<pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap;">' + text.replace(/\n/g, '<br>') + '</pre>')
      printWindow.document.close()
      printWindow.print()
    }
  } catch (error) {
    console.error('Failed to print receipt as text:', error)
    alert('Failed to generate text receipt')
  }
}

onMounted(() => {
  loadReceipt()
})
</script>

<style scoped>
.receipt-modal-overlay {
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
  padding: 2rem;
}

.receipt-modal {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--color-border);
}

.receipt-header h2 {
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

.receipt-content {
  padding: 1.5rem;
}

.receipt-store {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--color-border);
}

.receipt-store h3 {
  margin: 0 0 0.5rem 0;
}

.receipt-store p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.receipt-info,
.receipt-customer {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.receipt-info p,
.receipt-customer p {
  margin: 0.25rem 0;
}

.receipt-items {
  margin: 1.5rem 0;
}

.receipt-items table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-items th,
.receipt-items td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.receipt-items th {
  font-weight: 600;
  font-size: 0.875rem;
}

.receipt-items td {
  font-size: 0.875rem;
}

.variant {
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

.receipt-totals {
  margin: 1.5rem 0;
  padding-top: 1rem;
  border-top: 2px solid var(--color-border);
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.total-row.total {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.receipt-payment {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  font-size: 0.875rem;
}

.receipt-payment p {
  margin: 0.25rem 0;
}

.receipt-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
  font-style: italic;
  color: var(--color-text-soft);
}

.receipt-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  flex: 1;
  padding: 0.75rem;
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

.btn-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

@media print {
  .receipt-modal-overlay {
    background: white;
    padding: 0;
  }

  .receipt-header,
  .receipt-actions {
    display: none;
  }

  .receipt-modal {
    box-shadow: none;
    max-height: none;
  }
}
</style>

