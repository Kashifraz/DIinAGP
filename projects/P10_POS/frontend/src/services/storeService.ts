import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Store {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface StoreTeamMember {
  assignment_id: number
  user_id: number
  name: string
  email: string
  phone?: string
  role: 'manager' | 'cashier'
  assigned_at: string
}

export interface CreateStoreData {
  name: string
  address?: string
  phone?: string
  email?: string
  status?: 'active' | 'inactive'
}

export interface UpdateStoreData {
  name?: string
  address?: string
  phone?: string
  email?: string
  status?: 'active' | 'inactive'
}

export interface AssignUserData {
  user_id: number
}

class StoreService {
  async getStores(): Promise<Store[]> {
    const response = await apiClient.get<ApiResponse<Store[]>>('/stores')
    return response.data.data
  }

  async getStore(id: number): Promise<Store> {
    const response = await apiClient.get<ApiResponse<Store>>(`/stores/${id}`)
    return response.data.data
  }

  async createStore(data: CreateStoreData): Promise<Store> {
    const response = await apiClient.post<ApiResponse<Store>>('/stores', data)
    return response.data.data
  }

  async updateStore(id: number, data: UpdateStoreData): Promise<Store> {
    const response = await apiClient.put<ApiResponse<Store>>(`/stores/${id}`, data)
    return response.data.data
  }

  async deleteStore(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/stores/${id}`)
  }

  async assignManager(storeId: number, userId: number): Promise<Store> {
    const response = await apiClient.post<ApiResponse<Store>>(
      `/stores/${storeId}/assign-manager`,
      { user_id: userId }
    )
    return response.data.data
  }

  async assignCashier(storeId: number, userId: number): Promise<Store> {
    const response = await apiClient.post<ApiResponse<Store>>(
      `/stores/${storeId}/assign-cashier`,
      { user_id: userId }
    )
    return response.data.data
  }

  async removeUserAssignment(storeId: number, userId: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/stores/${storeId}/users/${userId}`)
  }

  async getStoreTeam(storeId: number): Promise<StoreTeamMember[]> {
    const response = await apiClient.get<ApiResponse<StoreTeamMember[]>>(`/stores/${storeId}/team`)
    return response.data.data
  }
}

export default new StoreService()

