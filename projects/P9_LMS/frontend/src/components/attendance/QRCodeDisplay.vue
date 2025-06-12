<template>
  <div class="qr-code-display">
    <div v-if="loading || imageLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading QR Code...
    </div>
    
    <div v-else-if="qrCodeImageUrl" class="qr-container">
      <div class="qr-image-wrapper">
        <img :src="qrCodeImageUrl" alt="QR Code" class="qr-image" />
      </div>
      
      <div class="qr-info">
        <div class="qr-code-text">
          <label>QR Code:</label>
          <code>{{ qrCode }}</code>
          <button @click="copyQRCode" class="btn-copy" title="Copy QR Code">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        
        <div v-if="expiresAt" class="expiration-info">
          <div class="countdown">
            <i class="fas fa-clock"></i>
            <span>Expires in: <strong>{{ timeRemaining }}</strong></span>
          </div>
          <div class="expires-at">
            Expires at: {{ formatDateTime(expiresAt) }}
          </div>
        </div>
      </div>
      
      <div class="qr-actions">
        <button @click="refreshQRCode" :disabled="loading" class="btn-refresh">
          <i class="fas fa-sync-alt"></i> Refresh QR Code
        </button>
      </div>
    </div>
    
    <div v-else class="no-qr">
      <i class="fas fa-qrcode"></i>
      <p>No QR code available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAttendanceStore } from '@/stores/attendance'

const props = defineProps({
  qrCode: {
    type: String,
    required: true
  },
  expiresAt: {
    type: String,
    default: null
  },
  sessionId: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const toast = useToast()
const attendanceStore = useAttendanceStore()
const qrCodeImageUrl = ref(null)
const timeRemaining = ref('')
const imageLoading = ref(false)
let countdownInterval = null

// Watch for QR code image URL from store
watch(() => attendanceStore.qrCodeImageUrl, (newUrl) => {
  if (newUrl) {
    qrCodeImageUrl.value = newUrl
  }
}, { immediate: true })

// Load QR code image when component mounts or sessionId changes
watch(() => props.sessionId, async (newSessionId) => {
  if (newSessionId) {
    await loadQRCodeImage()
  }
}, { immediate: true })

const loadQRCodeImage = async () => {
  if (!props.sessionId) return
  imageLoading.value = true
  try {
    await attendanceStore.fetchQRCodeImage(props.sessionId)
    qrCodeImageUrl.value = attendanceStore.qrCodeImageUrl
  } catch (err) {
    toast.error('Failed to load QR code image')
    console.error('Failed to load QR code:', err)
  } finally {
    imageLoading.value = false
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString()
}

const updateCountdown = () => {
  if (!props.expiresAt) {
    timeRemaining.value = ''
    return
  }
  
  const now = new Date()
  const expires = new Date(props.expiresAt)
  const diff = expires - now
  
  if (diff <= 0) {
    timeRemaining.value = 'Expired'
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    return
  }
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  timeRemaining.value = `${minutes}m ${seconds}s`
}

const refreshQRCode = async () => {
  await loadQRCodeImage()
  emit('refresh')
}

const copyQRCode = async () => {
  try {
    await navigator.clipboard.writeText(props.qrCode)
    toast.success('QR Code copied to clipboard!')
  } catch (err) {
    toast.error('Failed to copy QR code')
  }
}

onMounted(async () => {
  if (props.sessionId) {
    await loadQRCodeImage()
  }
  if (props.expiresAt) {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  if (qrCodeImageUrl.value) {
    URL.revokeObjectURL(qrCodeImageUrl.value)
  }
})
</script>

<style scoped>
.qr-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.loading {
  padding: 40px;
  text-align: center;
  color: #666;
}

.qr-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-image-wrapper {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  display: block;
}

.qr-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.qr-code-text {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  flex-wrap: wrap;
}

.qr-code-text label {
  font-weight: 600;
  color: #333;
}

.qr-code-text code {
  flex: 1;
  font-family: monospace;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.btn-copy {
  background: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-copy:hover {
  background: #1976d2;
}

.expiration-info {
  padding: 15px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin-bottom: 8px;
}

.countdown i {
  color: #ff9800;
}

.countdown strong {
  color: #f57c00;
  font-size: 18px;
}

.expires-at {
  font-size: 12px;
  color: #666;
}

.qr-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn-refresh {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-refresh:hover:not(:disabled) {
  background: #45a049;
}

.btn-refresh:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.no-qr {
  padding: 40px;
  text-align: center;
  color: #999;
}

.no-qr i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}
</style>

