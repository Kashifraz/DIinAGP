import apiClient from './api'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface ExpenseCategory {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: number
  store_id: number
  category_id: number
  amount: string
  description?: string
  expense_date: string
  receipt_url?: string
  created_by: number
  created_at: string
  updated_at: string
  store?: any
  category?: ExpenseCategory
  creator?: any
}

export interface CreateExpenseData {
  store_id: number
  category_id: number
  amount: number
  description?: string
  expense_date: string
  receipt_url?: string
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseListParams {
  page?: number
  per_page?: number
  store_id?: number
  category_id?: number
  start_date?: string
  end_date?: string
}

export interface ExpenseSummary {
  total_amount: string
  total_count: number
  by_category: Array<{
    category_id: number
    category_name: string
    total_amount: string
    count: number
  }>
  by_date: Array<{
    date: string
    total_amount: string
    count: number
  }>
}

class ExpenseService {
  async getExpenses(params: ExpenseListParams = {}): Promise<PaginatedResponse<Expense>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Expense>>>('/expenses', { params })
    return response.data.data
  }

  async getExpense(id: number): Promise<Expense> {
    const response = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`)
    return response.data.data
  }

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await apiClient.post<ApiResponse<Expense>>('/expenses', data)
    return response.data.data
  }

  async updateExpense(id: number, data: UpdateExpenseData): Promise<Expense> {
    const response = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data)
    return response.data.data
  }

  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  }

  async getExpenseSummary(storeId?: number, startDate?: string, endDate?: string): Promise<ExpenseSummary> {
    const params: any = {}
    if (storeId) params.store_id = storeId
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    const response = await apiClient.get<ApiResponse<ExpenseSummary>>('/expenses/summary', { params })
    return response.data.data
  }

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await apiClient.get<ApiResponse<ExpenseCategory[]>>('/expense-categories')
    return response.data.data
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory> {
    const response = await apiClient.get<ApiResponse<ExpenseCategory>>(`/expense-categories/${id}`)
    return response.data.data
  }

  async createExpenseCategory(data: { name: string; description?: string }): Promise<ExpenseCategory> {
    const response = await apiClient.post<ApiResponse<ExpenseCategory>>('/expense-categories', data)
    return response.data.data
  }

  async updateExpenseCategory(id: number, data: { name?: string; description?: string }): Promise<ExpenseCategory> {
    const response = await apiClient.put<ApiResponse<ExpenseCategory>>(`/expense-categories/${id}`, data)
    return response.data.data
  }

  async deleteExpenseCategory(id: number): Promise<void> {
    await apiClient.delete(`/expense-categories/${id}`)
  }
}

export default new ExpenseService()

