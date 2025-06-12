import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import transactionService, { type Transaction, type TransactionItem, type TransactionTotals, type AddItemData, type ProcessPaymentData } from '@/services/transactionService'
import customerService from '@/services/customerService'
import { useAuthStore } from './auth'
import { useStoreStore } from './store'

export const useTransactionStore = defineStore('transaction', () => {
  const currentTransaction = ref<Transaction | null>(null)
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()
  const storeStore = useStoreStore()

  // Computed
  const isCashier = computed(() => authStore.user?.role === 'cashier')
  const canVoidTransaction = computed(() => {
    return authStore.isAdmin || authStore.isManager
  })

  const cartItems = computed(() => {
    return currentTransaction.value?.items || []
  })

  const cartTotal = computed(() => {
    if (!currentTransaction.value) return 0
    return parseFloat(currentTransaction.value.total_amount || '0')
  })

  const cartSubtotal = computed(() => {
    if (!currentTransaction.value) return 0
    return parseFloat(currentTransaction.value.subtotal || '0')
  })

  // Actions
  const startTransaction = async (storeId: number) => {
    loading.value = true
    error.value = null
    try {
      const transaction = await transactionService.startTransaction({ store_id: storeId })
      currentTransaction.value = transaction
      return transaction
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTransaction = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const transaction = await transactionService.getTransaction(id)
      currentTransaction.value = transaction
      return transaction
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addItem = async (data: AddItemData) => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      const item = await transactionService.addItem(currentTransaction.value.id, data)
      
      // Refresh transaction to get updated totals
      await fetchTransaction(currentTransaction.value.id)
      
      return item
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (itemId: number, data: { quantity?: number; discount_amount?: number }) => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      await transactionService.updateItem(currentTransaction.value.id, itemId, data)
      
      // Refresh transaction to get updated totals
      await fetchTransaction(currentTransaction.value.id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeItem = async (itemId: number) => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      await transactionService.removeItem(currentTransaction.value.id, itemId)
      
      // Refresh transaction to get updated totals
      await fetchTransaction(currentTransaction.value.id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (customerId: number) => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      const transaction = await transactionService.addCustomer(currentTransaction.value.id, { customer_id: customerId })
      // Refresh the full transaction to get customer details
      await fetchTransaction(currentTransaction.value.id)
      return transaction
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeCustomer = async () => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      await transactionService.removeCustomer(currentTransaction.value.id)
      // Refresh the full transaction to get updated customer (null)
      await fetchTransaction(currentTransaction.value.id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove customer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const processPayment = async (data: ProcessPaymentData) => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      const payment = await transactionService.processPayment(currentTransaction.value.id, data)
      return payment
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to process payment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeTransaction = async () => {
    if (!currentTransaction.value) {
      throw new Error('No active transaction')
    }

    loading.value = true
    error.value = null
    try {
      const transaction = await transactionService.completeTransaction(currentTransaction.value.id)
      currentTransaction.value = transaction
      return transaction
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to complete transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const voidTransaction = async (transactionId: number) => {
    loading.value = true
    error.value = null
    try {
      const transaction = await transactionService.voidTransaction(transactionId)
      return transaction
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to void transaction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearTransaction = () => {
    currentTransaction.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentTransaction,
    transactions,
    loading,
    error,
    // Computed
    isCashier,
    canVoidTransaction,
    cartItems,
    cartTotal,
    cartSubtotal,
    // Actions
    startTransaction,
    fetchTransaction,
    addItem,
    updateItem,
    removeItem,
    addCustomer,
    removeCustomer,
    processPayment,
    completeTransaction,
    voidTransaction,
    clearTransaction,
    clearError,
  }
})

