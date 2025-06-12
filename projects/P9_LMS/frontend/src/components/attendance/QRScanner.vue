<template>
  <div class="qr-scanner">
    <div v-if="!cameraActive" class="scanner-setup">
      <button @click="startScanner" class="btn-start">
        <i class="fas fa-camera"></i> Start Camera
      </button>
    </div>
    
    <div v-else class="scanner-active">
      <div class="camera-container">
        <QrcodeStream
          v-if="cameraActive"
          @detect="onDetect"
          @error="onError"
          :paused="paused"
          class="camera-view"
        />
        <div v-if="scanning" class="scanning-overlay">
          <div class="scanning-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Scanning...</p>
          </div>
        </div>
      </div>
      
      <div class="scanner-actions">
        <button @click="stopScanner" class="btn-stop">
          <i class="fas fa-stop"></i> Stop Camera
        </button>
        <button @click="togglePause" class="btn-pause">
          <i class="fas" :class="paused ? 'fa-play' : 'fa-pause'"></i>
          {{ paused ? 'Resume' : 'Pause' }}
        </button>
      </div>
      
      <div v-if="lastScannedCode" class="last-scanned">
        <p><strong>Last scanned:</strong> {{ lastScannedCode }}</p>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

const emit = defineEmits(['scan'])

const cameraActive = ref(false)
const paused = ref(false)
const scanning = ref(false)
const lastScannedCode = ref(null)
const error = ref(null)

const startScanner = async () => {
  try {
    cameraActive.value = true
    paused.value = false
    error.value = null
  } catch (err) {
    error.value = 'Failed to access camera. Please ensure camera permissions are granted.'
    console.error('Camera error:', err)
  }
}

const stopScanner = () => {
  cameraActive.value = false
  paused.value = false
  scanning.value = false
  lastScannedCode.value = null
}

const togglePause = () => {
  paused.value = !paused.value
}

const onDetect = async (detectedCodes) => {
  if (detectedCodes.length > 0 && !scanning.value) {
    const code = detectedCodes[0].rawValue
    scanning.value = true
    lastScannedCode.value = code
    
    // Emit the scanned code
    emit('scan', code)
    
    // Pause briefly to prevent multiple scans
    setTimeout(() => {
      scanning.value = false
    }, 2000)
  }
}

const onError = (err) => {
  console.error('QR Scanner error:', err)
  if (err.name === 'NotAllowedError') {
    error.value = 'Camera access denied. Please allow camera access and try again.'
  } else if (err.name === 'NotFoundError') {
    error.value = 'No camera found. Please connect a camera and try again.'
  } else {
    error.value = 'Camera error: ' + err.message
  }
}
</script>

<style scoped>
.qr-scanner {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.scanner-setup {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.btn-start {
  background: #2196f3;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.3s;
}

.btn-start:hover {
  background: #1976d2;
}

.scanner-active {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.camera-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.camera-view {
  width: 100%;
  height: 100%;
}

.scanning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.scanning-indicator {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  text-align: center;
}

.scanning-indicator i {
  font-size: 24px;
  color: #2196f3;
  margin-bottom: 10px;
  display: block;
}

.scanner-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-stop,
.btn-pause {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-stop:hover {
  background: #d32f2f;
}

.btn-pause {
  background: #ff9800;
  color: white;
}

.btn-pause:hover {
  background: #f57c00;
}

.last-scanned {
  padding: 10px;
  background: #e3f2fd;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
}

.error-message {
  padding: 15px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #c62828;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}

.error-message i {
  font-size: 20px;
}
</style>

