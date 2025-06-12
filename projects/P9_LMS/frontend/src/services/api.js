import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      authStore.logout()
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // Format error message for better display
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.message) {
        error.formattedMessage = errorData.message
      } else if (errorData.details) {
        error.formattedMessage = errorData.details
      } else if (typeof errorData === 'string') {
        error.formattedMessage = errorData
      } else {
        error.formattedMessage = 'An error occurred'
      }
    } else {
      error.formattedMessage = error.message || 'An error occurred'
    }
    
    return Promise.reject(error)
  }
)

export default api

