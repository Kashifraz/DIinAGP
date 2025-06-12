<template>
  <div class="test-view">
    <h1>API Test Page</h1>
    <div class="test-section">
      <button @click="testApi" :disabled="loading" class="test-btn">
        {{ loading ? 'Testing...' : 'Test API Connection' }}
      </button>
      
      <div v-if="result" class="result">
        <h3>Result:</h3>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="error">
        <h3>Error:</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import apiClient from '@/services/api'

const loading = ref(false)
const result = ref<any>(null)
const error = ref('')

const testApi = async () => {
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    const response = await apiClient.get('/test')
    result.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-top: 2rem;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result,
.error {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 4px;
}

.result {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.result pre,
.error pre {
  margin: 0.5rem 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

