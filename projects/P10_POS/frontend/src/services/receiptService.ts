import apiClient from './api'
import type { ApiResponse } from '@/types/api'

export interface ReceiptData {
  receipt_number?: string
  transaction_number: string
  date: string
  store: {
    name: string
    address?: string
    phone?: string
    email?: string
  }
  cashier: {
    name: string
    id: number
  }
  customer?: {
    name: string
    email?: string
    phone?: string
  }
  items: Array<{
    product_name: string
    variant?: {
      name: string
      value: string
    }
    quantity: number
    unit_price: string
    line_total: string
  }>
  totals: {
    subtotal: string
    tax_amount: string
    discount_amount: string
    total_amount: string
  }
  payment?: {
    method: string
    amount: string
    change_amount: string
    reference_number?: string
  }
}

class ReceiptService {
  async getReceipt(transactionId: number): Promise<ReceiptData> {
    const response = await apiClient.get<ApiResponse<ReceiptData>>(`/transactions/${transactionId}/receipt`)
    return response.data.data
  }

  async getReceiptHtml(transactionId: number): Promise<string> {
    const response = await apiClient.get(`/transactions/${transactionId}/receipt/html`, {
      responseType: 'text'
    })
    return response.data
  }

  async getReceiptText(transactionId: number): Promise<string> {
    const response = await apiClient.get(`/transactions/${transactionId}/receipt/text`, {
      responseType: 'text'
    })
    return response.data
  }

  async regenerateReceipt(transactionId: number): Promise<ReceiptData> {
    const response = await apiClient.post<ApiResponse<ReceiptData>>(`/transactions/${transactionId}/receipt/regenerate`)
    return response.data.data
  }
}

export default new ReceiptService()

