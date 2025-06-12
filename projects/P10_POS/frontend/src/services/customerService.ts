import apiClient from './api'
import type { ApiResponse } from '@/types/api'
import type { Customer } from './transactionService'

class CustomerService {
  async searchCustomers(query: string, limit: number = 10): Promise<Customer[]> {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers/search', {
      params: { q: query, limit }
    })
    return response.data.data
  }

  async createCustomer(data: { name: string; email?: string; phone?: string }): Promise<Customer> {
    const response = await apiClient.post<ApiResponse<Customer>>('/customers', data)
    return response.data.data
  }
}

export default new CustomerService()

