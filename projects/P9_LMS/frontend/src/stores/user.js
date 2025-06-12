import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })

  async function fetchUsers(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getAllUsers({
        page: pagination.value.page,
        size: pagination.value.size,
        ...params
      })
      users.value = response.content || []
      pagination.value = {
        page: response.number || 0,
        size: response.size || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id) {
    loading.value = true
    error.value = null
    try {
      const user = await userService.getUserById(id)
      currentUser.value = user
      return user
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, userData) {
    loading.value = true
    error.value = null
    try {
      const updatedUser = await userService.updateUser(id, userData)
      // Update in users list if exists
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      // Update current user if it's the same
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = updatedUser
      }
      return updatedUser
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchUsers(query, params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.searchUsers(query, {
        page: pagination.value.page,
        size: pagination.value.size,
        ...params
      })
      users.value = response.content || []
      pagination.value = {
        page: response.number || 0,
        size: response.size || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      }
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to search users'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setPage(page) {
    pagination.value.page = page
  }

  function setPageSize(size) {
    pagination.value.size = size
    pagination.value.page = 0 // Reset to first page
  }

  function clearError() {
    error.value = null
  }

  return {
    users,
    currentUser,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchUserById,
    updateUser,
    searchUsers,
    setPage,
    setPageSize,
    clearError
  }
})

