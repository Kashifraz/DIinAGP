<template>
  <div class="schema-display">
    <h3 class="schema-title">Data Schema</h3>
    <div v-if="schema && Object.keys(schema).length > 0" class="schema-list">
      <div
        v-for="(type, columnName) in schema"
        :key="columnName"
        class="schema-item"
      >
        <span class="column-name">{{ columnName }}</span>
        <span :class="['column-type', `type-${type}`]">{{ type }}</span>
      </div>
    </div>
    <div v-else class="no-schema">
      <p>No schema information available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnType } from "@/types/datatable";

interface Props {
  schema: Record<string, ColumnType> | null;
}

defineProps<Props>();
</script>

<style scoped>
.schema-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.schema-title {
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}

.schema-list {
  display: grid;
  gap: 12px;
}

.schema-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.schema-item:hover {
  border-color: #4a90e2;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.1);
}

.column-name {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.column-type {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-string {
  background: #e3f2fd;
  color: #1976d2;
}

.type-number {
  background: #f3e5f5;
  color: #7b1fa2;
}

.type-boolean {
  background: #fff3e0;
  color: #e65100;
}

.type-date {
  background: #e8f5e9;
  color: #2e7d32;
}

.no-schema {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>

