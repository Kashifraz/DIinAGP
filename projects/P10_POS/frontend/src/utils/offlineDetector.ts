/**
 * Offline detection and network status management
 */

import { ref, onMounted, onUnmounted } from 'vue'

export const isOnline = ref(navigator.onLine)
export const isOffline = ref(!navigator.onLine)

class OfflineDetector {
  private listeners: Array<() => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupListeners()
    }
  }

  private setupListeners() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  private handleOnline = () => {
    isOnline.value = true
    isOffline.value = false
    this.notifyListeners()
  }

  private handleOffline = () => {
    isOnline.value = false
    isOffline.value = true
    this.notifyListeners()
  }

  /**
   * Add listener for network status changes
   */
  onStatusChange(callback: () => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * Check if currently online
   */
  getOnlineStatus(): boolean {
    return navigator.onLine
  }

  /**
   * Cleanup listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.listeners = []
  }
}

export const offlineDetector = new OfflineDetector()

/**
 * Vue composable for offline detection
 */
export function useOffline() {
  onMounted(() => {
    isOnline.value = navigator.onLine
    isOffline.value = !navigator.onLine
  })

  return {
    isOnline,
    isOffline
  }
}

