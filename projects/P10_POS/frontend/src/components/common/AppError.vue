<template>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <h2 class="error-title">{{ title }}</h2>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">
      Try Again
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  message: string
  showRetry?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 400px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.error-message {
  color: var(--color-text-soft);
  margin: 0 0 1.5rem;
  max-width: 500px;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: var(--color-primary-dark);
}
</style>

