<template>
  <Transition name="slide-down">
    <div
      v-if="isOffline"
      class="offline-indicator"
      :class="{ 'is-offline': isOffline }"
    >
      <div class="offline-content">
        <svg
          class="offline-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span class="offline-text">You are offline. Changes will be synced when connection is restored.</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useOffline } from '@/utils/offlineDetector'

const { isOffline } = useOffline()
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f59e0b;
  color: white;
  padding: 0.75rem 1rem;
  z-index: 9999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 1200px;
  margin: 0 auto;
}

.offline-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.offline-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

