import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface TransactionDiscount {
  id: number
  transaction_id: number
  discount_id?: number
  applied_amount: string
  created_at: string
  discount?: any
}

export interface Transaction {
  id: number
  store_id: number
  cashier_id: number
  customer_id?: number
  transaction_number: string
  subtotal: string
  tax_amount: string
  discount_amount: string
  total_amount: string
  status: 'pending' | 'completed' | 'voided' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  items?: TransactionItem[]
  customer?: Customer
  cashier?: any
  store?: any
  payments?: Payment[]
  transaction_discounts?: TransactionDiscount[]
}

export interface TransactionItem {
  id: number
  transaction_id: number
  product_id: number
  variant_id?: number
  quantity: number
  unit_price: string
  discount_amount: string
  tax_amount: string
  line_total: string
  created_at: string
  product_name?: string
  sku?: string
  barcode?: string
  variant_name?: string
  variant_value?: string
}

export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  transaction_id: number
  payment_method: 'cash' | 'card' | 'mobile_payment' | 'bank_transfer' | 'other'
  amount: string
  change_amount: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference_number?: string
  created_at: string
}

export interface TransactionTotals {
  subtotal: string
  tax_amount: string
  discount_amount: string
  total_amount: string
}

export interface StartTransactionData {
  store_id: number
}

export interface AddItemData {
  product_id: number
  variant_id?: number
  quantity: number
}

export interface UpdateItemData {
  quantity?: number
  discount_amount?: number
}

export interface AddCustomerData {
  customer_id: number
}

export interface ProcessPaymentData {
  payment_method: 'cash' | 'card' | 'mobile_payment' | 'bank_transfer' | 'other'
  amount: number
  reference_number?: string
}

export interface TransactionListParams {
  page?: number
  per_page?: number
  store_id?: number
  cashier_id?: number
  customer_id?: number
  status?: string
  transaction_number?: string
  date_from?: string
  date_to?: string
}

class TransactionService {
  async startTransaction(data: StartTransactionData): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transactions/start', data)
    return response.data.data
  }

  async getTransactions(params: TransactionListParams = {}): Promise<PaginatedResponse<Transaction>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', { params })
    return response.data.data
  }

  async getTransaction(id: number): Promise<Transaction> {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return response.data.data
  }

  async getTotals(id: number): Promise<TransactionTotals> {
    const response = await apiClient.get<ApiResponse<TransactionTotals>>(`/transactions/${id}/totals`)
    return response.data.data
  }

  async addItem(transactionId: number, data: AddItemData): Promise<TransactionItem> {
    const response = await apiClient.post<ApiResponse<TransactionItem>>(`/transactions/${transactionId}/items`, data)
    return response.data.data
  }

  async updateItem(transactionId: number, itemId: number, data: UpdateItemData): Promise<TransactionItem> {
    const response = await apiClient.put<ApiResponse<TransactionItem>>(`/transactions/${transactionId}/items/${itemId}`, data)
    return response.data.data
  }

  async removeItem(transactionId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/transactions/${transactionId}/items/${itemId}`)
  }

  async addCustomer(transactionId: number, data: AddCustomerData): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${transactionId}/customer`, data)
    return response.data.data
  }

  async removeCustomer(transactionId: number): Promise<Transaction> {
    const response = await apiClient.delete<ApiResponse<Transaction>>(`/transactions/${transactionId}/customer`)
    return response.data.data
  }

  async processPayment(transactionId: number, data: ProcessPaymentData): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(`/transactions/${transactionId}/payment`, data)
    return response.data.data
  }

  async completeTransaction(transactionId: number): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${transactionId}/complete`)
    return response.data.data
  }

  async voidTransaction(transactionId: number): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${transactionId}/void`)
    return response.data.data
  }

  async applyDiscount(transactionId: number, data: { discount_id?: number; manual_amount?: number }): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${transactionId}/discounts`, data)
    return response.data.data
  }

  async removeDiscount(transactionId: number, discountId: number): Promise<Transaction> {
    const response = await apiClient.delete<ApiResponse<Transaction>>(`/transactions/${transactionId}/discounts/${discountId}`)
    return response.data.data
  }

  async priceOverride(transactionId: number, itemId: number, unitPrice: number): Promise<TransactionItem> {
    const response = await apiClient.put<ApiResponse<TransactionItem>>(`/transactions/${transactionId}/items/${itemId}/price-override`, {
      unit_price: unitPrice
    })
    return response.data.data
  }
}

export default new TransactionService()

