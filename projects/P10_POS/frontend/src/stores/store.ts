import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storeService, { type Store } from '@/services/storeService'
import { useAuthStore } from './auth'

export const useStoreStore = defineStore('store', () => {
  const stores = ref<Store[]>([])
  const currentStore = ref<Store | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Computed
  const accessibleStores = computed(() => {
    if (authStore.user?.role === 'admin') {
      return stores.value
    }
    // For manager/cashier, they only see assigned stores (already filtered by backend)
    return stores.value
  })

  const activeStores = computed(() => {
    return stores.value.filter(store => store.status === 'active')
  })

  // Actions
  const fetchStores = async () => {
    loading.value = true
    error.value = null
    try {
      stores.value = await storeService.getStores()
      return stores.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch stores'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStore = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const store = await storeService.getStore(id)
      // Update in stores array if exists
      const index = stores.value.findIndex(s => s.id === id)
      if (index !== -1) {
        stores.value[index] = store
      } else {
        stores.value.push(store)
      }
      return store
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch store'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createStore = async (data: any) => {
    loading.value = true
    error.value = null
    try {
      const store = await storeService.createStore(data)
      stores.value.push(store)
      return store
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create store'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStore = async (id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const store = await storeService.updateStore(id, data)
      const index = stores.value.findIndex(s => s.id === id)
      if (index !== -1) {
        stores.value[index] = store
      }
      if (currentStore.value?.id === id) {
        currentStore.value = store
      }
      return store
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update store'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStore = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await storeService.deleteStore(id)
      stores.value = stores.value.filter(s => s.id !== id)
      if (currentStore.value?.id === id) {
        currentStore.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete store'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentStore = (store: Store | null) => {
    currentStore.value = store
    if (store) {
      localStorage.setItem('currentStoreId', store.id.toString())
    } else {
      localStorage.removeItem('currentStoreId')
    }
  }

  const loadCurrentStoreFromStorage = async () => {
    const storeId = localStorage.getItem('currentStoreId')
    if (storeId) {
      try {
        const store = await fetchStore(parseInt(storeId))
        setCurrentStore(store)
      } catch (err) {
        // Store might not exist or user lost access
        localStorage.removeItem('currentStoreId')
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    stores,
    currentStore,
    loading,
    error,
    // Computed
    accessibleStores,
    activeStores,
    // Actions
    fetchStores,
    fetchStore,
    createStore,
    updateStore,
    deleteStore,
    setCurrentStore,
    loadCurrentStoreFromStorage,
    clearError,
  }
})

