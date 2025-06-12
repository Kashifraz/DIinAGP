import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const response = await authService.login(email, password)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false
    
    try {
      const userData = await authService.getCurrentUser()
      user.value = userData
      return true
    } catch (error) {
      token.value = null
      localStorage.removeItem('token')
      return false
    }
  }

  const refreshToken = async () => {
    if (!token.value) return false
    
    try {
      const newToken = await authService.refreshToken()
      token.value = newToken
      localStorage.setItem('token', newToken)
      return true
    } catch (error) {
      // If refresh fails, logout user
      await logout()
      return false
    }
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isCashier = computed(() => user.value?.role === 'cashier')
  const hasRole = (roles: string[]) => computed(() => user.value ? roles.includes(user.value.role) : false)

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isManager,
    isCashier,
    hasRole,
    login,
    logout,
    checkAuth,
    refreshToken
  }
})

