import apiClient from './api'
import type { ApiResponse } from '@/types/api'
import type { ProductCategory } from './productService'

class CategoryService {
  async getCategories(hierarchy: boolean = false): Promise<ProductCategory[]> {
    const response = await apiClient.get<ApiResponse<ProductCategory[]>>('/categories', {
      params: { hierarchy }
    })
    return response.data.data
  }

  async getCategory(id: number): Promise<ProductCategory> {
    const response = await apiClient.get<ApiResponse<ProductCategory>>(`/categories/${id}`)
    return response.data.data
  }

  async createCategory(data: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ProductCategory> {
    const response = await apiClient.post<ApiResponse<ProductCategory>>('/categories', data)
    return response.data.data
  }

  async updateCategory(id: number, data: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await apiClient.put<ApiResponse<ProductCategory>>(`/categories/${id}`, data)
    return response.data.data
  }

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/categories/${id}`)
  }
}

export default new CategoryService()

