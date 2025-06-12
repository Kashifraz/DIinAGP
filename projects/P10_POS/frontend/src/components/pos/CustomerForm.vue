<template>
  <div class="customer-form">
    <h3>Customer</h3>
    
    <div v-if="transaction.customer" class="customer-info">
      <div class="customer-header">
        <div class="customer-details-display">
          <p class="customer-name"><strong>{{ transaction.customer.name }}</strong></p>
          <p v-if="transaction.customer.email" class="customer-email">{{ transaction.customer.email }}</p>
          <p v-if="transaction.customer.phone" class="customer-phone">{{ transaction.customer.phone }}</p>
        </div>
        <button @click="clearCustomer" class="btn btn-sm btn-secondary">
          Remove
        </button>
      </div>
    </div>

    <div v-else class="customer-search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search customer by name, email, or phone..."
        class="search-input"
        @input="handleSearch"
      />
      
      <div v-if="searchResults.length > 0" class="search-results">
        <div
          v-for="customer in searchResults"
          :key="customer.id"
          class="customer-item"
          @click="selectCustomer(customer)"
        >
          <div>
            <strong>{{ customer.name }}</strong>
            <p v-if="customer.email || customer.phone" class="customer-details">
              {{ customer.email }} {{ customer.phone }}
            </p>
          </div>
        </div>
      </div>

      <button @click="showCreateForm = true" class="btn btn-sm btn-primary">
        + New Customer
      </button>
    </div>

    <!-- Create Customer Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content" @click.stop>
        <h4>Create Customer</h4>
        <form @submit.prevent="createCustomer">
          <div class="form-group">
            <label>Name *</label>
            <input v-model="newCustomer.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="newCustomer.email" type="email" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="newCustomer.phone" type="tel" />
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateForm = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import customerService from '@/services/customerService'
import type { Transaction, Customer } from '@/services/transactionService'

const transactionStore = useTransactionStore()

const props = defineProps<{
  transaction: Transaction
}>()

// Watch for transaction changes to clear search when customer is added
watch(() => props.transaction.customer, (newCustomer) => {
  if (newCustomer) {
    searchQuery.value = ''
    searchResults.value = []
  }
})

const emit = defineEmits<{
  customerAdded: [customerId: number]
  customerRemoved: []
}>()

const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
const showCreateForm = ref(false)
const newCustomer = ref({
  name: '',
  email: '',
  phone: '',
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    const results = await customerService.searchCustomers(searchQuery.value)
    searchResults.value = results
  } catch (error) {
    console.error('Customer search error:', error)
    searchResults.value = []
  }
}

const selectCustomer = async (customer: Customer) => {
  emit('customerAdded', customer.id)
  searchQuery.value = ''
  searchResults.value = []
  // Wait a bit for the transaction to update
  await new Promise(resolve => setTimeout(resolve, 300))
}

const createCustomer = async () => {
  try {
    const customer = await customerService.createCustomer(newCustomer.value)
    emit('customerAdded', customer.id)
    showCreateForm.value = false
    newCustomer.value = { name: '', email: '', phone: '' }
  } catch (error) {
    console.error('Failed to create customer:', error)
    alert('Failed to create customer')
  }
}

const clearCustomer = async () => {
  try {
    await transactionStore.removeCustomer()
    emit('customerRemoved')
  } catch (error: any) {
    console.error('Failed to remove customer:', error)
    alert(error.response?.data?.message || 'Failed to remove customer')
  }
}
</script>

<style scoped>
.customer-form {
  margin-top: 1rem;
}

.customer-form h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.customer-info {
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.customer-details-display {
  flex: 1;
}

.customer-info .customer-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--color-text);
}

.customer-info .customer-email,
.customer-info .customer-phone {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--color-text-soft);
}

.customer-search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.875rem;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.customer-item {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}

.customer-item:hover {
  background: var(--color-background-soft);
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-details {
  font-size: 0.75rem;
  color: var(--color-text-soft);
  margin: 0.25rem 0 0 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
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
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
}

.modal-content h4 {
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>

