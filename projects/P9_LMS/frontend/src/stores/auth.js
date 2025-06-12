import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  function setAuth(authData) {
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    user.value = {
      id: authData.id,
      email: authData.email,
      firstName: authData.firstName,
      lastName: authData.lastName,
      role: authData.role
    }
    
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function clearAuth() {
    token.value = null
    refreshToken.value = null
    user.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  function logout() {
    clearAuth()
    router.push('/login')
  }

  function isTokenExpired() {
    if (!token.value) return true
    
    try {
      const decoded = jwtDecode(token.value)
      const currentTime = Date.now() / 1000
      return decoded.exp < currentTime
    } catch (error) {
      return true
    }
  }

  async function register(userData) {
    try {
      const response = await authService.register(userData)
      setAuth(response)
      return response
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)
      setAuth(response)
      return response
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authService.refreshToken(refreshToken.value)
      setAuth(response)
      return response
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    userRole,
    setAuth,
    clearAuth,
    logout,
    isTokenExpired,
    register,
    login,
    refreshAccessToken
  }
})

