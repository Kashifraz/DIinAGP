import apiClient from './api'
import type { LoginResponse, User } from '@/types/auth'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me')
    return response.data.data
  },

  async refreshToken(): Promise<string> {
    const response = await apiClient.post('/auth/refresh')
    return response.data.data.token
  },

  async requestPasswordReset(email: string): Promise<{ reset_token?: string }> {
    const response = await apiClient.post('/auth/password/reset-request', { email })
    return response.data.data
  },

  async resetPassword(token: string, email: string, password: string): Promise<void> {
    await apiClient.post('/auth/password/reset', { token, email, password })
  }
}

