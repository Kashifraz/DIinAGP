import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type,
      duration
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, duration = 3000) => {
    return showToast(message, 'success', duration)
  }

  const error = (message, duration = 4000) => {
    return showToast(message, 'error', duration)
  }

  const warning = (message, duration = 3000) => {
    return showToast(message, 'warning', duration)
  }

  const info = (message, duration = 3000) => {
    return showToast(message, 'info', duration)
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}

