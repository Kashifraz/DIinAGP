<template>
  <div class="layout-default">
    <OfflineIndicator />
    <AppHeader />
    <div class="layout-content">
      <AppSidebar v-if="showSidebar" />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import OfflineIndicator from '@/components/offline/OfflineIndicator.vue'

const route = useRoute()

const showSidebar = computed(() => {
  return route.meta.showSidebar !== false
})
</script>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: var(--color-background-soft);
}
</style>

