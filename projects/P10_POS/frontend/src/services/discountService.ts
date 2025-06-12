import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Discount {
  id: number
  name: string
  type: 'percentage' | 'fixed'
  value: string
  product_id?: number
  category_id?: number
  store_id?: number
  min_purchase?: string
  valid_from?: string
  valid_to?: string
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at: string
}

export interface CreateDiscountData {
  name: string
  type: 'percentage' | 'fixed'
  value: number
  product_id?: number
  category_id?: number
  store_id?: number
  min_purchase?: number
  valid_from?: string
  valid_to?: string
  status?: 'active' | 'inactive' | 'expired'
}

export interface UpdateDiscountData extends Partial<CreateDiscountData> {}

export interface DiscountListParams {
  page?: number
  per_page?: number
  store_id?: number
  status?: string
  type?: string
}

class DiscountService {
  async getDiscounts(params: DiscountListParams = {}): Promise<PaginatedResponse<Discount>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Discount>>>('/discounts', { params })
    return response.data.data
  }

  async getDiscount(id: number): Promise<Discount> {
    const response = await apiClient.get<ApiResponse<Discount>>(`/discounts/${id}`)
    return response.data.data
  }

  async createDiscount(data: CreateDiscountData): Promise<Discount> {
    const response = await apiClient.post<ApiResponse<Discount>>('/discounts', data)
    return response.data.data
  }

  async updateDiscount(id: number, data: UpdateDiscountData): Promise<Discount> {
    const response = await apiClient.put<ApiResponse<Discount>>(`/discounts/${id}`, data)
    return response.data.data
  }

  async deleteDiscount(id: number): Promise<void> {
    await apiClient.delete(`/discounts/${id}`)
  }

  async getApplicableDiscounts(storeId: number, subtotal: number = 0, transactionId?: number): Promise<Discount[]> {
    const params: any = { store_id: storeId, subtotal }
    if (transactionId) {
      params.transaction_id = transactionId
    }
    const response = await apiClient.get<ApiResponse<Discount[]>>('/discounts/applicable', { params })
    return response.data.data
  }
}

export default new DiscountService()

