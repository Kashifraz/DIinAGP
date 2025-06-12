import apiClient from './api'
import type { User } from '@/types/auth'
import type { PaginatedResponse } from '@/types/api'

export interface UserListParams {
  page?: number
  per_page?: number
  role?: string
  status?: string
  search?: string
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  phone?: string
  role: 'admin' | 'manager' | 'cashier'
  status?: 'active' | 'inactive'
}

export interface UpdateUserData {
  email?: string
  name?: string
  phone?: string
  role?: 'admin' | 'manager' | 'cashier'
  status?: 'active' | 'inactive'
  password?: string
}

export const userService = {
  async getUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/users', { params })
    return response.data.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`)
    return response.data.data
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', data)
    return response.data.data
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data.data
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  }
}

