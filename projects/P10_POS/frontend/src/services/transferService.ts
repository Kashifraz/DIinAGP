import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled'

export interface StockTransferItem {
  id: number
  transfer_id: number
  product_id: number
  variant_id?: number | null
  quantity: number
  created_at: string
  product?: any
  variant?: any
}

export interface StockTransfer {
  id: number
  from_store_id: number
  to_store_id: number
  status: TransferStatus
  requested_by: number
  approved_by?: number | null
  requested_at: string
  completed_at?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  from_store?: any
  to_store?: any
  requested_by_user?: any
  approved_by_user?: any
  items?: StockTransferItem[]
}

export interface CreateTransferData {
  from_store_id: number
  to_store_id: number
  items: Array<{
    product_id: number
    variant_id?: number | null
    quantity: number
  }>
  notes?: string
}

export interface TransferListParams {
  page?: number
  per_page?: number
  store_id?: number
  status?: TransferStatus
  start_date?: string
  end_date?: string
}

class TransferService {
  async getTransfers(params: TransferListParams = {}): Promise<PaginatedResponse<StockTransfer>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<StockTransfer>>>('/transfers', { params })
    return response.data.data
  }

  async getTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.get<ApiResponse<StockTransfer>>(`/transfers/${id}`)
    return response.data.data
  }

  async createTransfer(data: CreateTransferData): Promise<StockTransfer> {
    const response = await apiClient.post<ApiResponse<StockTransfer>>('/transfers', data)
    return response.data.data
  }

  async approveTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.post<ApiResponse<StockTransfer>>(`/transfers/${id}/approve`)
    return response.data.data
  }

  async completeTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.post<ApiResponse<StockTransfer>>(`/transfers/${id}/complete`)
    return response.data.data
  }

  async cancelTransfer(id: number): Promise<StockTransfer> {
    const response = await apiClient.post<ApiResponse<StockTransfer>>(`/transfers/${id}/cancel`)
    return response.data.data
  }
}

export default new TransferService()

