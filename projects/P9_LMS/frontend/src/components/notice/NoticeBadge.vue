<template>
  <span v-if="count > 0" class="notice-badge">
    {{ count > 99 ? '99+' : count }}
  </span>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.notice-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #f44336;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}
</style>

