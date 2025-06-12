import apiClient from './api'
import type { ApiResponse } from '@/types/api'

export interface SalesReport {
  summary: {
    total_transactions: number
    total_revenue: string
    total_subtotal: string
    total_tax: string
    total_discount: string
  }
  by_date: Array<{
    date: string
    transactions: number
    revenue: string
  }>
  by_store: Array<{
    store_id: number
    store_name: string
    transactions: number
    revenue: string
  }>
  by_product: Array<{
    product_id: number
    product_name: string
    quantity_sold: number
    revenue: string
  }>
  by_category: Array<{
    category_id: number
    category_name: string
    quantity_sold: number
    revenue: string
  }>
  by_cashier: Array<{
    cashier_id: number
    cashier_name: string
    transactions: number
    revenue: string
  }>
}

export interface InventoryReport {
  summary: {
    total_items: number
    total_valuation: string
    low_stock_count: number
  }
  by_store: Array<{
    store_id: number
    store_name: string
    items_count: number
    valuation: string
  }>
  by_product: Array<{
    product_id: number
    product_name: string
    total_quantity: number
    valuation: string
  }>
  low_stock_items: Array<{
    inventory_id: number
    store_id: number
    product_id: number
    product_name: string
    quantity: number
    reorder_level: number
  }>
}

export interface ExpenseReport {
  summary: {
    total_expenses: number
    total_amount: string
  }
  by_store: Array<{
    store_id: number
    store_name: string
    count: number
    total_amount: string
  }>
  by_category: Array<{
    category_id: number
    category_name: string
    count: number
    total_amount: string
  }>
  by_date: Array<{
    date: string
    count: number
    total_amount: string
  }>
}

export interface FinancialReport {
  summary: {
    total_revenue: string
    total_expenses: string
    profit: string
    profit_margin: string
    transaction_count: number
    expense_count: number
  }
  by_store: Array<{
    store_id: number
    store_name: string
    revenue: string
    expenses: string
    profit: string
  }>
}

export interface ProductPerformanceReport {
  products: Array<{
    product_id: number
    product_name: string
    sku: string
    quantity_sold: number
    revenue: string
    transaction_count: number
  }>
  summary: {
    total_products: number
    total_quantity_sold: number
    total_revenue: string
  }
}

export interface CashierPerformanceReport {
  cashiers: Array<{
    cashier_id: number
    cashier_name: string
    transaction_count: number
    total_revenue: string
    average_transaction: string
  }>
  summary: {
    total_cashiers: number
    total_transactions: number
  }
}

export interface ReportParams {
  store_id?: number
  start_date?: string
  end_date?: string
  include_low_stock?: boolean
  limit?: number
}

class ReportService {
  async getSalesReport(params: ReportParams = {}): Promise<SalesReport> {
    const response = await apiClient.get<ApiResponse<SalesReport>>('/reports/sales', { params })
    return response.data.data
  }

  async getInventoryReport(params: ReportParams = {}): Promise<InventoryReport> {
    const response = await apiClient.get<ApiResponse<InventoryReport>>('/reports/inventory', { params })
    return response.data.data
  }

  async getExpenseReport(params: ReportParams = {}): Promise<ExpenseReport> {
    const response = await apiClient.get<ApiResponse<ExpenseReport>>('/reports/expenses', { params })
    return response.data.data
  }

  async getFinancialReport(params: ReportParams = {}): Promise<FinancialReport> {
    const response = await apiClient.get<ApiResponse<FinancialReport>>('/reports/financial', { params })
    return response.data.data
  }

  async getProductPerformanceReport(params: ReportParams = {}): Promise<ProductPerformanceReport> {
    const response = await apiClient.get<ApiResponse<ProductPerformanceReport>>('/reports/products', { params })
    return response.data.data
  }

  async getCashierPerformanceReport(params: ReportParams = {}): Promise<CashierPerformanceReport> {
    const response = await apiClient.get<ApiResponse<CashierPerformanceReport>>('/reports/cashiers', { params })
    return response.data.data
  }
}

export default new ReportService()

