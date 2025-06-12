import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import productService, { type Product, type ProductListParams } from '@/services/productService'
import categoryService, { type ProductCategory } from '@/services/categoryService'
import { useAuthStore } from './auth'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const categories = ref<ProductCategory[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Computed
  const activeProducts = computed(() => {
    return products.value.filter(product => product.status === 'active')
  })

  const canManageProducts = computed(() => {
    return authStore.isAdmin || authStore.isManager
  })

  // Actions
  const fetchProducts = async (params: ProductListParams = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await productService.getProducts(params)
      products.value = response.data
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const product = await productService.getProduct(id)
      // Update in products array if exists
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = product
      } else {
        products.value.push(product)
      }
      return product
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (data: any) => {
    loading.value = true
    error.value = null
    try {
      const product = await productService.createProduct(data)
      products.value.push(product)
      return product
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const product = await productService.updateProduct(id, data)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = product
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = product
      }
      return product
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await productService.deleteProduct(id)
      products.value = products.value.filter(p => p.id !== id)
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete product'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchProducts = async (query: string, limit: number = 20) => {
    loading.value = true
    error.value = null
    try {
      return await productService.searchProducts(query, limit)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search products'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Category actions
  const fetchCategories = async (hierarchy: boolean = false) => {
    loading.value = true
    error.value = null
    try {
      categories.value = await categoryService.getCategories(hierarchy)
      return categories.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data: any) => {
    loading.value = true
    error.value = null
    try {
      const category = await categoryService.createCategory(data)
      categories.value.push(category)
      return category
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: number, data: any) => {
    loading.value = true
    error.value = null
    try {
      const category = await categoryService.updateCategory(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = category
      }
      return category
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update category'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await categoryService.deleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete category'
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
    products,
    categories,
    currentProduct,
    loading,
    error,
    // Computed
    activeProducts,
    canManageProducts,
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  }
})

