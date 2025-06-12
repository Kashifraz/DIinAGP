<template>
  <div class="receipt-view">
    <AppLoading v-if="loading" />
    <AppError v-else-if="error" :message="error" />

    <div v-else-if="receiptData" class="receipt-container">
      <div class="receipt-actions-bar">
        <button @click="goBack" class="btn btn-back">← Back</button>
        <div class="action-buttons">
          <button @click="printReceipt" class="btn btn-primary">Print HTML</button>
          <button @click="printAsText" class="btn btn-secondary">Print Text</button>
          <button v-if="canRegenerate" @click="regenerateReceipt" class="btn btn-secondary">Regenerate</button>
        </div>
      </div>

      <div class="receipt-paper" id="receipt-content">
        <div class="receipt-store">
          <h1>{{ receiptData.store.name }}</h1>
          <p v-if="receiptData.store.address">{{ receiptData.store.address }}</p>
          <p v-if="receiptData.store.phone">Tel: {{ receiptData.store.phone }}</p>
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
          <p v-if="receiptData.customer.phone">Phone: {{ receiptData.customer.phone }}</p>
        </div>

        <div class="receipt-items">
          <table>
            <thead>
              <tr>
                <th class="item-name">Item</th>
                <th class="item-qty">Qty</th>
                <th class="item-price">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in receiptData.items" :key="index">
                <td class="item-name">
                  {{ item.product_name }}
                  <span v-if="item.variant" class="variant">
                    ({{ item.variant.name }}: {{ item.variant.value }})
                  </span>
                </td>
                <td class="item-qty">{{ item.quantity }}</td>
                <td class="item-price">${{ item.line_total }}</td>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import receiptService, { type ReceiptData } from '@/services/receiptService'
import AppLoading from '@/components/common/AppLoading.vue'
import AppError from '@/components/common/AppError.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const receiptData = ref<ReceiptData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const transactionId = computed(() => parseInt(route.params.id as string))
const canRegenerate = computed(() => authStore.isAdmin || authStore.isManager)

const loadReceipt = async () => {
  loading.value = true
  error.value = null
  try {
    receiptData.value = await receiptService.getReceipt(transactionId.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load receipt'
  } finally {
    loading.value = false
  }
}

const regenerateReceipt = async () => {
  loading.value = true
  error.value = null
  try {
    receiptData.value = await receiptService.regenerateReceipt(transactionId.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to regenerate receipt'
  } finally {
    loading.value = false
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
    const text = await receiptService.getReceiptText(transactionId.value)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${receiptData.value?.transaction_number}</title>
          <style>
            body {
              font-family: "Courier New", monospace;
              font-size: 12px;
              padding: 20px;
              white-space: pre-wrap;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <pre>${text}</pre>
        </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  } catch (error) {
    console.error('Failed to print receipt as text:', error)
    alert('Failed to generate text receipt')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadReceipt()
})
</script>

<style scoped>
.receipt-view {
  padding: 2rem;
  background: var(--color-background-soft);
  min-height: 100vh;
}

.receipt-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.receipt-container {
  display: flex;
  justify-content: center;
}

.receipt-paper {
  background: white;
  max-width: 300px;
  width: 100%;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.receipt-store {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px dashed #000;
}

.receipt-store h1 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.receipt-store p {
  margin: 5px 0;
  font-size: 11px;
}

.receipt-info,
.receipt-customer {
  margin-bottom: 15px;
  font-size: 11px;
}

.receipt-info p,
.receipt-customer p {
  margin: 3px 0;
}

.receipt-items {
  margin: 15px 0;
  border-top: 1px dashed #000;
  border-bottom: 1px dashed #000;
  padding: 10px 0;
}

.receipt-items table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-items th {
  text-align: left;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  font-size: 10px;
  font-weight: 600;
}

.receipt-items td {
  padding: 4px 0;
  font-size: 11px;
}

.receipt-items .item-name {
  width: 50%;
}

.receipt-items .item-qty {
  width: 15%;
  text-align: center;
}

.receipt-items .item-price {
  width: 35%;
  text-align: right;
}

.variant {
  font-size: 9px;
  color: #666;
  display: block;
  margin-top: 2px;
}

.receipt-totals {
  margin: 15px 0;
  font-size: 11px;
}

.receipt-totals .total-row {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
}

.receipt-totals .total-row.total {
  font-weight: bold;
  font-size: 13px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #000;
}

.receipt-payment {
  margin: 15px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 11px;
}

.receipt-payment p {
  margin: 3px 0;
}

.receipt-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px dashed #000;
  font-style: italic;
  font-size: 10px;
}

.receipt-footer p {
  margin: 5px 0;
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

.btn-back {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn:hover {
  opacity: 0.9;
}

@media print {
  .receipt-view {
    padding: 0;
    background: white;
  }

  .receipt-actions-bar {
    display: none;
  }

  .receipt-paper {
    max-width: 100%;
    box-shadow: none;
    border-radius: 0;
    padding: 10px;
  }

  @page {
    margin: 0.5cm;
    size: auto;
  }
}
</style>

