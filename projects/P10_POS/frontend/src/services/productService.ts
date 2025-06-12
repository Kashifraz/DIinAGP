import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface Product {
  id: number
  name: string
  description?: string
  sku?: string
  barcode?: string
  base_price: string
  category_id?: number
  image_url?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  deleted_at?: string
  category?: ProductCategory
  variants?: ProductVariant[]
}

export interface ProductCategory {
  id: number
  name: string
  parent_id?: number
  description?: string
  created_at: string
  updated_at: string
  children?: ProductCategory[]
}

export interface ProductVariant {
  id: number
  product_id: number
  variant_name: string
  variant_value: string
  price_adjustment: string
  sku_suffix?: string
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  name: string
  description?: string
  sku?: string
  barcode?: string
  base_price: string
  category_id?: number
  image_url?: string
  status?: 'active' | 'inactive'
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]
}

export interface UpdateProductData {
  name?: string
  description?: string
  sku?: string
  barcode?: string
  base_price?: string
  category_id?: number
  image_url?: string
  status?: 'active' | 'inactive'
}

export interface ProductListParams {
  page?: number
  per_page?: number
  category_id?: number
  status?: string
  search?: string
}

class ProductService {
  async getProducts(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params })
    return response.data.data
  }

  async getProduct(id: number): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data)
    return response.data.data
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data.data
  }

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/products/${id}`)
  }

  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/search', {
      params: { q: query, limit }
    })
    return response.data.data
  }

  // Variant methods
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    const response = await apiClient.get<ApiResponse<ProductVariant[]>>(`/products/${productId}/variants`)
    return response.data.data
  }

  async createVariant(productId: number, data: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>): Promise<ProductVariant> {
    const response = await apiClient.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, data)
    return response.data.data
  }

  async updateVariant(productId: number, variantId: number, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await apiClient.put<ApiResponse<ProductVariant>>(`/products/${productId}/variants/${variantId}`, data)
    return response.data.data
  }

  async deleteVariant(productId: number, variantId: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/products/${productId}/variants/${variantId}`)
  }
}

export default new ProductService()

