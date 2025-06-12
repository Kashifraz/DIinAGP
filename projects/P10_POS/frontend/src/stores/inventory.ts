import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import inventoryService, { type Inventory, type InventoryListParams } from '@/services/inventoryService'
import { useAuthStore } from './auth'
import { useStoreStore } from './store'

export const useInventoryStore = defineStore('inventory', () => {
  const inventory = ref<Inventory[]>([])
  const currentInventory = ref<Inventory | null>(null)
  const lowStockItems = ref<Inventory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()
  const storeStore = useStoreStore()

  // Computed
  const canManageInventory = computed(() => {
    return authStore.isAdmin || authStore.isManager
  })

  // Actions
  const fetchInventory = async (storeId: number, params: InventoryListParams = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await inventoryService.getInventory(storeId, params)
      inventory.value = response.data
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchInventoryItem = async (storeId: number, id: number) => {
    loading.value = true
    error.value = null
    try {
      const item = await inventoryService.getInventoryItem(storeId, id)
      // Update in inventory array if exists
      const index = inventory.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inventory.value[index] = item
      } else {
        inventory.value.push(item)
      }
      return item
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch inventory item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInventory = async (storeId: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const item = await inventoryService.createInventory(storeId, data)
      inventory.value.push(item)
      return item
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create inventory item'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInventory = async (storeId: number, id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const item = await inventoryService.updateInventory(storeId, id, data)
      const index = inventory.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inventory.value[index] = item
      }
      if (currentInventory.value?.id === id) {
        currentInventory.value = item
      }
      return item
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  const adjustInventory = async (storeId: number, id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const item = await inventoryService.adjustInventory(storeId, id, data)
      const index = inventory.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inventory.value[index] = item
      }
      if (currentInventory.value?.id === id) {
        currentInventory.value = item
      }
      return item
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to adjust inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLowStock = async (storeId: number) => {
    loading.value = true
    error.value = null
    try {
      lowStockItems.value = await inventoryService.getLowStock(storeId)
      return lowStockItems.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch low stock items'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    inventory,
    currentInventory,
    lowStockItems,
    loading,
    error,
    // Computed
    canManageInventory,
    // Actions
    fetchInventory,
    fetchInventoryItem,
    createInventory,
    updateInventory,
    adjustInventory,
    fetchLowStock,
    clearError,
  }
})

