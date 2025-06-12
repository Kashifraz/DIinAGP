<template>
  <div class="file-download">
    <button
      @click="handleDownload"
      :disabled="loading || !filePath"
      class="btn-download"
      :title="fileName || 'Download file'"
    >
      <i class="fas fa-download"></i>
      <span v-if="showLabel">{{ fileName || 'Download' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const props = defineProps({
  filePath: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['download'])

const loading = ref(false)
const toast = useToast()

const handleDownload = async () => {
  if (!props.filePath) {
    toast.error('No file available for download')
    return
  }

  loading.value = true
  try {
    // Extract submission ID from file path or use a different approach
    // For now, we'll need the submission ID to download
    // This component should receive submissionId as a prop
    emit('download', props.filePath)
  } catch (err) {
    toast.error('Failed to download file')
    console.error('Download error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.file-download {
  display: inline-block;
}

.btn-download {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-download:hover:not(:disabled) {
  background: #1976d2;
}

.btn-download:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

