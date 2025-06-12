import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Inventory {
  id: number
  store_id: number
  product_id: number
  variant_id?: number
  quantity: number
  reorder_level: number
  last_updated: string
  created_at: string
  updated_at: string
  product_name?: string
  sku?: string
  barcode?: string
  base_price?: string
  category_name?: string
  product?: any
  history?: InventoryHistory[]
}

export interface InventoryHistory {
  id: number
  inventory_id: number
  change_type: 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return' | 'damage' | 'expired'
  quantity_change: number
  previous_quantity: number
  new_quantity: number
  reason?: string
  user_id?: number
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface CreateInventoryData {
  product_id: number
  variant_id?: number
  quantity: number
  reorder_level?: number
}

export interface UpdateInventoryData {
  quantity?: number
  reorder_level?: number
}

export interface AdjustInventoryData {
  quantity_change: number
  change_type?: 'sale' | 'purchase' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return' | 'damage' | 'expired'
  reason?: string
}

export interface InventoryListParams {
  page?: number
  per_page?: number
  product_id?: number
  low_stock?: boolean
  search?: string
}

class InventoryService {
  async getInventory(storeId: number, params: InventoryListParams = {}): Promise<PaginatedResponse<Inventory>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Inventory>>>(`/stores/${storeId}/inventory`, { params })
    return response.data.data
  }

  async getInventoryItem(storeId: number, id: number): Promise<Inventory> {
    const response = await apiClient.get<ApiResponse<Inventory>>(`/stores/${storeId}/inventory/${id}`)
    return response.data.data
  }

  async createInventory(storeId: number, data: CreateInventoryData): Promise<Inventory> {
    const response = await apiClient.post<ApiResponse<Inventory>>(`/stores/${storeId}/inventory`, data)
    return response.data.data
  }

  async updateInventory(storeId: number, id: number, data: UpdateInventoryData): Promise<Inventory> {
    const response = await apiClient.put<ApiResponse<Inventory>>(`/stores/${storeId}/inventory/${id}`, data)
    return response.data.data
  }

  async adjustInventory(storeId: number, id: number, data: AdjustInventoryData): Promise<Inventory> {
    const response = await apiClient.post<ApiResponse<Inventory>>(`/stores/${storeId}/inventory/${id}/adjust`, data)
    return response.data.data
  }

  async getLowStock(storeId: number): Promise<Inventory[]> {
    const response = await apiClient.get<ApiResponse<Inventory[]>>(`/stores/${storeId}/inventory/low-stock`)
    return response.data.data
  }

  async getInventoryHistory(storeId: number, id: number, limit: number = 50): Promise<InventoryHistory[]> {
    const response = await apiClient.get<ApiResponse<InventoryHistory[]>>(`/stores/${storeId}/inventory/${id}/history`, {
      params: { limit }
    })
    return response.data.data
  }
}

export default new InventoryService()

